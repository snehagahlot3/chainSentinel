import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId') || 'demo-org'
    
    const products = await prisma.product.findMany({
      where: { organizationId },
      include: {
        inventories: {
          include: { organization: true },
        },
      },
    })
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizationId, name, sku, description, price } = body
    
    if (!organizationId || !name || !sku || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const product = await prisma.product.create({
      data: {
        organizationId,
        name,
        sku,
        description,
        price: parseFloat(price),
      },
    })
    
    await prisma.inventory.create({
      data: {
        organizationId,
        productId: product.id,
        quantity: 0,
        minThreshold: 10,
        autoOrderThreshold: 5,
      },
    })
    
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}