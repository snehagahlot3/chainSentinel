import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        assignments: { include: { location: true } },
        orders: { orderBy: { createdAt: 'desc' }, take: 10 },
        performance: { orderBy: { periodEnd: 'desc' }, take: 12 }
      }
    })

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    return NextResponse.json(supplier)
  } catch (error) {
    console.error('Error fetching supplier:', error)
    return NextResponse.json({ error: 'Failed to fetch supplier' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, contactName, contactEmail, contactPhone, apiEndpoint, apiKey, leadTimeDays, minimumOrderValue, paymentTerms, notes, isActive } = body

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name,
        contactName,
        contactEmail,
        contactPhone,
        apiEndpoint,
        apiKey,
        leadTimeDays,
        minimumOrderValue,
        paymentTerms,
        notes,
        isActive
      }
    })

    return NextResponse.json(supplier)
  } catch (error) {
    console.error('Error updating supplier:', error)
    return NextResponse.json({ error: 'Failed to update supplier' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.supplier.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting supplier:', error)
    return NextResponse.json({ error: 'Failed to delete supplier' }, { status: 500 })
  }
}