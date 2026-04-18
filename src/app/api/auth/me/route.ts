import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { organization: true }
    })

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization ? {
          id: user.organization.id,
          name: user.organization.name,
          type: user.organization.type
        } : null
      }
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}