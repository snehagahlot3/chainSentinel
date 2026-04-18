import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId') || 'demo-org'
    
    const rules = await prisma.autoOrderRule.findMany({
      where: { organizationId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json(rules)
  } catch (error) {
    console.error('Error fetching auto-orders:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizationId, productId, thresholdQuantity, quantityToOrder, supplierId, isActive } = body
    
    if (!organizationId || !productId || !thresholdQuantity || !quantityToOrder || !supplierId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const rule = await prisma.autoOrderRule.create({
      data: {
        organizationId,
        productId,
        thresholdQuantity: parseInt(thresholdQuantity),
        quantityToOrder: parseInt(quantityToOrder),
        supplierId,
        isActive: isActive !== false,
      },
      include: { product: true },
    })
    
    return NextResponse.json(rule)
  } catch (error) {
    console.error('Error creating auto-order rule:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { ruleId, thresholdQuantity, quantityToOrder, isActive } = body
    
    if (!ruleId) {
      return NextResponse.json({ error: 'Rule ID required' }, { status: 400 })
    }
    
    const rule = await prisma.autoOrderRule.update({
      where: { id: ruleId },
      data: {
        ...(thresholdQuantity !== undefined && { thresholdQuantity: parseInt(thresholdQuantity) }),
        ...(quantityToOrder !== undefined && { quantityToOrder: parseInt(quantityToOrder) }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { product: true },
    })
    
    return NextResponse.json(rule)
  } catch (error) {
    console.error('Error updating auto-order rule:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ruleId = searchParams.get('ruleId')
    
    if (!ruleId) {
      return NextResponse.json({ error: 'Rule ID required' }, { status: 400 })
    }
    
    await prisma.autoOrderRule.delete({
      where: { id: ruleId },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting auto-order rule:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}