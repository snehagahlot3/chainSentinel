import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { executeAutomationEngine } from '@/lib/automation'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productSku, quantity, customerEmail, orderId, amount, metadata, storeId, secretKey } = body

    if (!productSku || !quantity) {
      return NextResponse.json(
        { error: 'productSku and quantity are required', code: 'MISSING_FIELDS' },
        { status: 400 }
      )
    }

    let organizationId: string

    if (storeId && secretKey) {
      const apiKey = await prisma.apiKey.findUnique({
        where: { key: secretKey },
        include: { organization: true },
      })

      if (!apiKey || !apiKey.isActive || apiKey.organizationId !== storeId) {
        return NextResponse.json(
          { error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
          { status: 401 }
        )
      }

      await prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
      })

      organizationId = storeId
    } else {
      const token = request.cookies.get('auth-token')?.value
      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required', code: 'UNAUTHORIZED' },
          { status: 401 }
        )
      }

      const decoded = verifyToken(token)
      if (!decoded) {
        return NextResponse.json(
          { error: 'Invalid token', code: 'INVALID_TOKEN' },
          { status: 401 }
        )
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { organization: true },
      })

      if (!user?.organization) {
        return NextResponse.json(
          { error: 'Organization not found', code: 'NO_ORGANIZATION' },
          { status: 400 }
        )
      }

      organizationId = user.organization.id
    }

    const product = await prisma.product.findFirst({
      where: {
        organizationId,
        sku: productSku,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product SKU not found', code: 'INVALID_SKU' },
        { status: 400 }
      )
    }

    const sale = await prisma.sale.create({
      data: {
        organizationId,
        productSku,
        productId: product.id,
        quantity,
        customerEmail,
        orderId,
        amount,
        metadata: metadata ? JSON.stringify(metadata) : null,
        source: 'api',
      },
    })

    const inventory = await prisma.inventory.findFirst({
      where: {
        organizationId,
        productId: product.id,
      },
    })

    if (inventory) {
      const newQuantity = Math.max(0, inventory.quantity - quantity)
      
      await prisma.inventory.update({
        where: { id: inventory.id },
        data: {
          quantity: newQuantity,
          lastSyncedAt: new Date(),
        },
      })

      if (newQuantity <= inventory.minThreshold) {
        await prisma.alert.create({
          data: {
            organizationId,
            type: 'LOW_STOCK',
            message: `Low stock alert: ${product.name} has ${newQuantity} units left`,
            productId: product.id,
          },
        })

        await executeAutomationEngine({
          type: 'INVENTORY_BELOW_THRESHOLD',
          organizationId,
          productSku,
          quantity: newQuantity,
        })
      }

      if (newQuantity <= inventory.autoOrderThreshold) {
        await executeAutomationEngine({
          type: 'INVENTORY_BELOW_THRESHOLD',
          organizationId,
          productSku,
          quantity: newQuantity,
        })
      }
    }

    await executeAutomationEngine({
      type: 'SALE_COMPLETED',
      organizationId,
      productSku,
      quantity,
      saleId: sale.id,
      metadata: { customerEmail, orderId, amount },
    })

    return NextResponse.json({
      success: true,
      saleId: sale.id,
      productSku,
      quantity,
      remainingStock: inventory?.quantity || 0,
    })
  } catch (error: any) {
    console.error('Sale API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      )
    }

    const sales = await prisma.sale.findMany({
      where: { organizationId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(sales)
  } catch (error: any) {
    console.error('Sales GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}