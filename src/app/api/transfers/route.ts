import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId')
    const status = searchParams.get('status')
    
    const where: any = {}
    if (organizationId) where.organizationId = organizationId
    if (status) where.status = status

    const transfers = await prisma.locationTransfer.findMany({
      where,
      include: {
        fromLocation: true,
        toLocation: true,
        product: true
      },
      orderBy: { requestedAt: 'desc' }
    })

    return NextResponse.json(transfers)
  } catch (error) {
    console.error('Error fetching transfers:', error)
    return NextResponse.json({ error: 'Failed to fetch transfers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizationId, fromLocationId, toLocationId, productId, quantity, notes } = body

    if (!organizationId || !fromLocationId || !toLocationId || !productId || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const fromInventory = await prisma.inventory.findFirst({
      where: { locationId: fromLocationId, productId }
    })

    if (!fromInventory || fromInventory.quantity < quantity) {
      return NextResponse.json({ error: 'Insufficient stock at source location' }, { status: 400 })
    }

    const transfer = await prisma.locationTransfer.create({
      data: {
        organizationId,
        fromLocationId,
        toLocationId,
        productId,
        quantity,
        status: 'PENDING',
        notes
      }
    })

    await prisma.inventory.update({
      where: { id: fromInventory.id },
      data: { quantity: fromInventory.quantity - quantity }
    })

    await prisma.alert.create({
      data: {
        organizationId,
        type: 'TRANSFER_REQUESTED',
        message: `Stock transfer requested: ${quantity} units of ${product.name} from location ${fromLocationId} to ${toLocationId}`,
        productId,
        metadata: JSON.stringify({ transferId: transfer.id })
      }
    })

    return NextResponse.json(transfer, { status: 201 })
  } catch (error) {
    console.error('Error creating transfer:', error)
    return NextResponse.json({ error: 'Failed to create transfer' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    const transfer = await prisma.locationTransfer.findUnique({
      where: { id },
      include: { product: true }
    })

    if (!transfer) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 })
    }

    if (status === 'APPROVED') {
      await prisma.locationTransfer.update({
        where: { id },
        data: { status: 'APPROVED', approvedAt: new Date() }
      })
    } else if (status === 'SHIPPED') {
      await prisma.locationTransfer.update({
        where: { id },
        data: { status: 'SHIPPED', shippedAt: new Date() }
      })
    } else if (status === 'RECEIVED') {
      await prisma.locationTransfer.update({
        where: { id },
        data: { status: 'RECEIVED', receivedAt: new Date() }
      })

      const toInventory = await prisma.inventory.findFirst({
        where: { locationId: transfer.toLocationId, productId: transfer.productId }
      })

      if (toInventory) {
        await prisma.inventory.update({
          where: { id: toInventory.id },
          data: { quantity: toInventory.quantity + transfer.quantity }
        })
      } else {
        await prisma.inventory.create({
          data: {
            organizationId: transfer.organizationId,
            locationId: transfer.toLocationId,
            productId: transfer.productId,
            quantity: transfer.quantity
          }
        })
      }
    } else if (status === 'REJECTED') {
      await prisma.locationTransfer.update({
        where: { id },
        data: { status: 'REJECTED' }
      })

      const fromInventory = await prisma.inventory.findFirst({
        where: { locationId: transfer.fromLocationId, productId: transfer.productId }
      })
      if (fromInventory) {
        await prisma.inventory.update({
          where: { id: fromInventory.id },
          data: { quantity: fromInventory.quantity + transfer.quantity }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating transfer:', error)
    return NextResponse.json({ error: 'Failed to update transfer' }, { status: 500 })
  }
}