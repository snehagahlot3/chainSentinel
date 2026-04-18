import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const supplierId = searchParams.get('supplierId') || 'demo-supplier'
    const status = searchParams.get('status')
    
    const orders = await prisma.order.findMany({
      where: { 
        supplierId,
        ...(status && { status: status as any })
      },
      include: { 
        items: {
          include: { product: true }
        },
        organization: true
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, status } = body
    
    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status required' }, { status: 400 })
    }
    
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
      include: { 
        items: { include: { product: true } },
        organization: true 
      },
    })
    
    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}