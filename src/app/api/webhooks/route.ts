import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyWebhookSignature } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-webhook-signature') || ''
    const body = await request.text()
    
    const { integrationId, eventType, payload } = JSON.parse(body)
    
    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
      include: { organization: true },
    })
    
    if (!integration || !integration.isActive) {
      return NextResponse.json({ error: 'Invalid integration' }, { status: 400 })
    }
    
    const isValid = verifyWebhookSignature(body, signature, integration.secretKey)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    
    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        integrationId,
        eventType,
        payload,
        status: 'DELIVERED',
        deliveredAt: new Date(),
      },
    })
    
    if (eventType === 'order.created') {
      await handleOrderCreated(integration.organizationId, payload)
    } else if (eventType === 'inventory.updated') {
      await handleInventoryUpdated(integration.organizationId, payload)
    }
    
    return NextResponse.json({ success: true, eventId: webhookEvent.id })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

async function handleOrderCreated(organizationId: string, payload: any) {
  const items = payload.items || []
  
  for (const item of items) {
    const inventory = await prisma.inventory.findFirst({
      where: {
        organizationId,
        product: { sku: item.sku },
      },
      include: { product: true },
    })
    
    if (inventory) {
      await prisma.inventory.update({
        where: { id: inventory.id },
        data: {
          quantity: Math.max(0, inventory.quantity - item.quantity),
          lastSyncedAt: new Date(),
        },
      })
      
      if (inventory.quantity - item.quantity <= inventory.minThreshold) {
        await prisma.alert.create({
          data: {
            organizationId,
            type: 'LOW_STOCK',
            message: `Low stock alert: ${inventory.product.name} has ${inventory.quantity - item.quantity} units left`,
            productId: inventory.productId,
          },
        })
      }
      
      await checkAutoOrderRules(organizationId, inventory.productId)
    }
  }
}

async function handleInventoryUpdated(organizationId: string, payload: any) {
  const { sku, quantity } = payload
  
  const inventory = await prisma.inventory.findFirst({
    where: {
      organizationId,
      product: { sku },
    },
  })
  
  if (inventory) {
    await prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity,
        lastSyncedAt: new Date(),
      },
    })
  }
}

async function checkAutoOrderRules(organizationId: string, productId: string) {
  const rules = await prisma.autoOrderRule.findMany({
    where: {
      organizationId,
      productId,
      isActive: true,
    },
    include: { product: true },
  })
  
  for (const rule of rules) {
    const inventory = await prisma.inventory.findFirst({
      where: {
        organizationId,
        productId,
      },
    })
    
    if (inventory && inventory.quantity <= rule.thresholdQuantity) {
      const supplierOrg = await prisma.organization.findFirst({
        where: { type: 'SUPPLIER', id: rule.supplierId },
      })
      
      if (supplierOrg) {
        const orderNumber = `AUTO-${Date.now()}`
        
        await prisma.order.create({
          data: {
            organizationId,
            orderNumber,
            status: 'PENDING',
            totalAmount: rule.quantityToOrder * rule.product.price,
            supplierId: rule.supplierId,
            items: {
              create: {
                productId: rule.productId,
                quantity: rule.quantityToOrder,
                price: rule.product.price,
              },
            },
          },
        })
        
        await prisma.alert.create({
          data: {
            organizationId,
            type: 'AUTO_ORDER_TRIGGERED',
            message: `Auto-order triggered: ${rule.quantityToOrder} units of ${rule.product.name}`,
            productId,
          },
        })
        
        await prisma.autoOrderRule.update({
          where: { id: rule.id },
          data: { lastTriggeredAt: new Date() },
        })
      }
    }
  }
}