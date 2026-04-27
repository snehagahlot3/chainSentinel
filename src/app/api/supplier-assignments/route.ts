import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const supplierId = searchParams.get('supplierId')
    const locationId = searchParams.get('locationId')
    
    const where: any = {}
    if (supplierId) where.supplierId = supplierId
    if (locationId) where.locationId = locationId

    const assignments = await prisma.supplierLocationAssignment.findMany({
      where,
      include: {
        supplier: true,
        location: true
      }
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { supplierId, locationId, productSkuMapping, priority, isActive } = body

    const assignment = await prisma.supplierLocationAssignment.create({
      data: {
        supplierId,
        locationId,
        productSkuMapping: JSON.stringify(productSkuMapping || {}),
        priority: priority || 0,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing assignment ID' }, { status: 400 })
    }

    await prisma.supplierLocationAssignment.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting assignment:', error)
    return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 })
  }
}