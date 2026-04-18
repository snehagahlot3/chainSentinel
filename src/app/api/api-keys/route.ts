import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

function generateApiKey(): string {
  return 'cs_' + crypto.randomBytes(24).toString('hex')
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(apiKeys.map(key => ({
      ...key,
      permissions: JSON.parse(key.permissions || '[]'),
    })))
  } catch (error: any) {
    console.error('API keys GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, organizationId } = body

    if (!name || !organizationId) {
      return NextResponse.json(
        { error: 'name and organizationId are required' },
        { status: 400 }
      )
    }

    const key = generateApiKey()

    const apiKey = await prisma.apiKey.create({
      data: {
        organizationId,
        name,
        key,
        permissions: JSON.stringify(['sale', 'inventory', 'product']),
        isActive: true,
      },
    })

    return NextResponse.json({
      ...apiKey,
      permissions: JSON.parse(apiKey.permissions || '[]'),
      key: apiKey.key,
    })
  } catch (error: any) {
    console.error('API key CREATE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { apiKeyId, name, isActive } = body

    if (!apiKeyId) {
      return NextResponse.json({ error: 'apiKeyId is required' }, { status: 400 })
    }

    const apiKey = await prisma.apiKey.update({
      where: { id: apiKeyId },
      data: {
        ...(name && { name }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json({
      ...apiKey,
      permissions: JSON.parse(apiKey.permissions || '[]'),
    })
  } catch (error: any) {
    console.error('API key UPDATE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const apiKeyId = searchParams.get('apiKeyId')

    if (!apiKeyId) {
      return NextResponse.json({ error: 'apiKeyId is required' }, { status: 400 })
    }

    await prisma.apiKey.delete({
      where: { id: apiKeyId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API key DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}