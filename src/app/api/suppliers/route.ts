import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId') || 'demo-org'
    
    const suppliers = await prisma.supplier.findMany({
      where: { organizationId },
      include: {
        assignments: { include: { location: true } },
        _count: { select: { orders: true } }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(suppliers)
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizationId, name, contactName, contactEmail, contactPhone, apiEndpoint, apiKey, leadTimeDays, minimumOrderValue, paymentTerms, notes, isActive } = body

    const supplier = await prisma.supplier.create({
      data: {
        organizationId,
        name,
        contactName,
        contactEmail,
        contactPhone,
        apiEndpoint,
        apiKey,
        leadTimeDays: leadTimeDays || 7,
        minimumOrderValue: minimumOrderValue || 0,
        paymentTerms,
        notes,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json(supplier, { status: 201 })
  } catch (error) {
    console.error('Error creating supplier:', error)
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 })
  }
}