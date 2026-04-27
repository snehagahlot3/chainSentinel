import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const orgId = request.nextUrl.searchParams.get('orgId') || 'demo-org'

    const products = await prisma.product.findMany({
      where: { organizationId: orgId, supplierId: { not: null } },
      include: { inventories: true, autoOrderRules: true }
    })

    const supplierMap = new Map<string, any>()

    products.forEach(product => {
      const supplierId = product.supplierId!
      if (!supplierMap.has(supplierId)) {
        supplierMap.set(supplierId, {
          productIds: [],
          products: [],
          orders: [],
          totalStock: 0,
          lowStockProducts: 0
        })
      }
      const supplier = supplierMap.get(supplierId)
      supplier.productIds.push(product.id)
      supplier.products.push(product)
      const inv = product.inventories[0]
      supplier.totalStock += inv?.quantity || 0
      if (inv && inv.quantity <= inv.minThreshold) {
        supplier.lowStockProducts++
      }
    })

    const supplierData = await Promise.all(
      Array.from(supplierMap.entries()).map(async ([supplierId, data]) => {
        const user = await prisma.user.findUnique({ where: { id: supplierId } })

        const orders = await prisma.order.findMany({
          where: { supplierId, organizationId: orgId },
          orderBy: { createdAt: 'desc' }
        })

        const deliveredOrders = orders.filter(o => o.status === 'DELIVERED')
        const avgDeliveryDays = deliveredOrders.length > 0 
          ? deliveredOrders.reduce((sum, o) => {
              const days = Math.floor((new Date(o.updatedAt).getTime() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24))
              return sum + days
            }, 0) / deliveredOrders.length
          : null

        const onTimeRate = orders.length > 0 
          ? (deliveredOrders.length / orders.length) * 100 
          : 100

        const priceRange = data.products.map((p: any) => p.price)
        const avgPrice = priceRange.length > 0 
          ? priceRange.reduce((a: number, b: number) => a + b, 0) / priceRange.length 
          : 0

        return {
          id: supplierId,
          name: user?.name || 'Unknown Supplier',
          email: user?.email || 'N/A',
          productCount: data.products.length,
          totalStock: data.totalStock,
          lowStockProducts: data.lowStockProducts,
          avgDeliveryDays: avgDeliveryDays ? Math.round(avgDeliveryDays) : null,
          onTimeRate: Math.round(onTimeRate),
          avgPrice: Math.round(avgPrice * 100) / 100,
          totalOrders: orders.length,
          deliveredOrders: deliveredOrders.length
        }
      })
    )

    const scoredSuppliers = supplierData.map(s => {
      let score = 100

      if (s.avgDeliveryDays !== null) {
        if (s.avgDeliveryDays > 21) score -= 30
        else if (s.avgDeliveryDays > 14) score -= 15
        else if (s.avgDeliveryDays > 7) score -= 5
      }

      if (s.onTimeRate < 70) score -= 25
      else if (s.onTimeRate < 85) score -= 10
      else if (s.onTimeRate < 95) score -= 5

      if (s.lowStockProducts > s.productCount * 0.3) score -= 20
      else if (s.lowStockProducts > s.productCount * 0.1) score -= 10

      if (s.productCount < 3) score -= 10

      return {
        ...s,
        score: Math.max(0, Math.min(100, score)),
        grade: score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D'
      }
    }).sort((a, b) => b.score - a.score)

    return NextResponse.json({
      suppliers: scoredSuppliers,
      summary: {
        total: scoredSuppliers.length,
        averageScore: scoredSuppliers.length > 0 
          ? Math.round(scoredSuppliers.reduce((sum, s) => sum + s.score, 0) / scoredSuppliers.length) 
          : 0,
        topPerformer: scoredSuppliers[0]?.name || null,
        atRisk: scoredSuppliers.filter(s => s.score < 60).length
      }
    })

  } catch (error) {
    console.error('Supplier API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch supplier data' },
      { status: 500 }
    )
  }
}