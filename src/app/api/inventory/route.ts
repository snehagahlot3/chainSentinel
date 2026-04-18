import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId') || 'demo-org'
    
    const inventories = await prisma.inventory.findMany({
      where: { organizationId },
      include: { product: true },
    })
    
    return NextResponse.json(inventories)
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { inventoryId, quantity, minThreshold, autoOrderThreshold } = body
    
    if (!inventoryId) {
      return NextResponse.json({ error: 'Inventory ID required' }, { status: 400 })
    }
    
    const inventory = await prisma.inventory.update({
      where: { id: inventoryId },
      data: {
        ...(quantity !== undefined && { quantity }),
        ...(minThreshold !== undefined && { minThreshold }),
        ...(autoOrderThreshold !== undefined && { autoOrderThreshold }),
      },
      include: { product: true },
    })
    
    return NextResponse.json(inventory)
  } catch (error) {
    console.error('Error updating inventory:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}