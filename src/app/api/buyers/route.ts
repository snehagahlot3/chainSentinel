import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId')
    
    const buyers = await prisma.buyer.findMany({
      where: { organizationId: organizationId || 'demo-org' },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(buyers)
  } catch (error) {
    console.error('Error fetching buyers:', error)
    return NextResponse.json({ error: 'Failed to fetch buyers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizationId, userId } = body

    if (!organizationId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const buyer = await prisma.buyer.create({
      data: {
        organizationId,
        userId
      }
    })

    await prisma.location.updateMany({
      where: { organizationId },
      data: { buyerId: userId }
    })

    return NextResponse.json(buyer, { status: 201 })
  } catch (error) {
    console.error('Error creating buyer:', error)
    return NextResponse.json({ error: 'Failed to create buyer' }, { status: 500 })
  }
}