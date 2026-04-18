import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId') || 'demo-org'
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    
    const alerts = await prisma.alert.findMany({
      where: { 
        organizationId,
        ...(unreadOnly && { isRead: false })
      },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    
    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { alertId, isRead } = body
    
    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID required' }, { status: 400 })
    }
    
    const alert = await prisma.alert.update({
      where: { id: alertId },
      data: { isRead },
    })
    
    return NextResponse.json(alert)
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}