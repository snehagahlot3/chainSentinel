import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSavedPredictions } from '@/lib/ml/service'

async function getInventoryContext(orgId: string) {
  try {
    const inventories = await prisma.inventory.findMany({
      where: { organizationId: orgId },
      include: { product: true }
    })

    const predictions = await getSavedPredictions(orgId)
    const alerts = await prisma.alert.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    return {
      totalProducts: inventories.length,
      totalUnits: inventories.reduce((sum, i) => sum + i.quantity, 0),
      lowStock: inventories.filter(i => i.quantity <= i.minThreshold).length,
      outOfStock: inventories.filter(i => i.quantity === 0).length,
      products: inventories.slice(0, 20).map(i => ({
        name: i.product?.name,
        sku: i.product?.sku,
        quantity: i.quantity,
        minThreshold: i.minThreshold,
        status: i.quantity === 0 ? 'OUT_OF_STOCK' : i.quantity <= i.minThreshold ? 'LOW_STOCK' : 'IN_STOCK'
      })),
      riskItems: predictions.filter(p => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH').map(p => ({
        name: p.productName,
        sku: p.sku,
        riskLevel: p.riskLevel,
        daysRemaining: p.daysRemaining,
        recommendedOrderQty: p.recommendedOrderQty
      })),
      recentAlerts: alerts.map(a => ({
        type: a.type,
        message: a.message,
        createdAt: a.createdAt
      }))
    }
  } catch {
    return null
  }
}

async function getSalesContext(orgId: string) {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const sales = await prisma.sale.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      where: { organizationId: orgId, createdAt: { gte: thirtyDaysAgo } },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10
    })

    const productIds = sales.map(s => s.productId).filter(Boolean)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds as string[] } }
    })
    const productMap = new Map(products.map(p => [p.id, p]))

    return {
      topProducts: sales.map(s => ({
        name: productMap.get(s.productId as string)?.name || 'Unknown',
        sku: productMap.get(s.productId as string)?.sku || 'N/A',
        unitsSold: s._sum.quantity || 0
      })),
      totalSales: sales.reduce((sum, s) => sum + (s._sum.quantity || 0), 0)
    }
  } catch {
    return null
  }
}

async function getOrdersContext(orgId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const autoOrders = await prisma.autoOrderRule.findMany({
      where: { organizationId: orgId, isActive: true },
      include: { product: true }
    })

    return {
      recentOrders: orders.map(o => ({
        orderNumber: o.orderNumber,
        status: o.status,
        totalAmount: o.totalAmount,
        createdAt: o.createdAt
      })),
      activeAutoOrders: autoOrders.map(a => ({
        product: a.product?.name,
        threshold: a.thresholdQuantity,
        orderQty: a.quantityToOrder
      }))
    }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query, orgId } = await request.json()

    if (!query) {
      return NextResponse.json({ response: 'Please provide a question.', type: 'text' })
    }

    const orgIdToUse = orgId || 'demo-org'

    const [inventory, sales, orders] = await Promise.all([
      getInventoryContext(orgIdToUse),
      getSalesContext(orgIdToUse),
      getOrdersContext(orgIdToUse)
    ])

    const systemPrompt = `You are SupplyChain Co-Pilot, an AI assistant for a supply chain management platform called ChainSentinel. You help distributors manage their inventory, orders, and suppliers.

You have access to the following real-time data from their account:
- INVENTORY: ${JSON.stringify(inventory)}
- SALES: ${JSON.stringify(sales)}
- ORDERS: ${JSON.stringify(orders)}

Important rules:
1. Always base your answers on the actual data provided above
2. Be specific - mention product names, SKUs, quantities, and dates when available
3. Provide actionable recommendations when appropriate
4. If data is unavailable or empty, say so clearly
5. Keep responses concise but informative
6. Use bullet points for lists
7. Highlight urgent issues (low stock, critical risks) prominently
8. Format currency as $X,XXX.XX
9. Format dates as human-readable (e.g., "2 days ago" or "March 15, 2024")

Respond naturally to the user's question.`

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
      return NextResponse.json({ 
        response: "AI is not configured yet. Please add your Gemini API key in the .env file:\n\nGEMINI_API_KEY=your_api_key_here",
        type: 'text'
      })
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: query }]
            }
          ],
          systemInstruction: {
            role: 'system',
            parts: [{ text: systemPrompt }]
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            topP: 0.95,
            topK: 40
          }
        })
      }
    )

    if (!geminiResponse.ok) {
      const error = await geminiResponse.text()
      console.error('Gemini API error:', error)
      return NextResponse.json({
        response: "I'm having trouble connecting to the AI service. Please check your API key.",
        type: 'text'
      })
    }

    const data = await geminiResponse.json()
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      "I couldn't process that request. Please try again."

    return NextResponse.json({
      response: aiResponse,
      type: 'text'
    })

  } catch (error) {
    console.error('Copilot error:', error)
    return NextResponse.json({
      response: "I'm having trouble connecting to the AI service. Please check your API key and try again.",
      type: 'text'
    })
  }
}