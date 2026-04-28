import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId') || 'demo-org'
    
    const locations = await prisma.location.findMany({
      where: { organizationId },
      include: {
        inventories: { include: { product: true } },
        _count: { select: { supplierAssignments: true } }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(locations)
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizationId, name, type, address, city, state, zipCode, country, latitude, longitude, buyerId, isActive } = body

    const location = await prisma.location.create({
      data: {
        organizationId,
        name,
        type,
        address,
        city,
        state,
        zipCode,
        country: country || 'US',
        latitude,
        longitude,
        buyerId,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json(location, { status: 201 })
  } catch (error) {
    console.error('Error creating location:', error)
    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 })
  }
}