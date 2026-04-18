import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSecretKey } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId')
    
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }
    
    const integrations = await prisma.integration.findMany({
      where: { organizationId },
      include: {
        webhookEvents: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    
    return NextResponse.json(integrations)
  } catch (error) {
    console.error('Error fetching integrations:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizationId, name, endpointUrl, eventTypes } = body
    
    if (!organizationId || !name || !endpointUrl || !eventTypes?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const secretKey = generateSecretKey()
    
    const integration = await prisma.integration.create({
      data: {
        organizationId,
        name,
        endpointUrl,
        eventTypes,
        secretKey,
      },
    })
    
    return NextResponse.json({
      ...integration,
      secretKey: integration.secretKey,
    })
  } catch (error) {
    console.error('Error creating integration:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}