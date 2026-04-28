import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const hashedPassword = 'demo123' 
  const supplierPassword = 'supplier123'

  await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      id: 'demo-user',
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo User',
      role: 'DISTRIBUTOR'
    }
  })

  await prisma.user.upsert({
    where: { email: 'supplier@example.com' },
    update: {},
    create: {
      id: 'supplier-user',
      email: 'supplier@example.com',
      password: supplierPassword,
      name: 'Supplier User',
      role: 'SUPPLIER'
    }
  })

  await prisma.organization.upsert({
    where: { id: 'demo-org' },
    update: {},
    create: {
      id: 'demo-org',
      name: 'Demo Distributor',
      type: 'DISTRIBUTOR',
      userId: 'demo-user'
    }
  })

  await prisma.organization.upsert({
    where: { id: 'demo-supplier' },
    update: {},
    create: {
      id: 'demo-supplier',
      name: 'Demo Supplier Co',
      type: 'SUPPLIER',
      userId: 'supplier-user'
    }
  })

  const productsData = [
    { name: 'Wireless Headphones', sku: 'PROD-001', price: 79.99, description: 'Premium wireless headphones', quantity: 50, minThreshold: 10, autoOrderThreshold: 5 },
    { name: 'Smart Watch', sku: 'PROD-002', price: 199.99, description: 'Fitness tracking smartwatch', quantity: 25, minThreshold: 5, autoOrderThreshold: 3 },
    { name: 'Bluetooth Speaker', sku: 'PROD-003', price: 49.99, description: 'Portable waterproof speaker', quantity: 100, minThreshold: 20, autoOrderThreshold: 10 },
    { name: 'USB-C Hub', sku: 'PROD-004', price: 39.99, description: '7-in-1 USB-C hub', quantity: 75, minThreshold: 15, autoOrderThreshold: 8 },
    { name: 'Laptop Stand', sku: 'PROD-005', price: 29.99, description: 'Ergonomic laptop stand', quantity: 40, minThreshold: 10, autoOrderThreshold: 5 },
    { name: 'Webcam HD', sku: 'PROD-006', price: 59.99, description: '1080p HD webcam', quantity: 30, minThreshold: 8, autoOrderThreshold: 4 },
  ]

  for (const p of productsData) {
    try {
      const product = await prisma.product.upsert({
        where: { id: p.sku },
        update: {},
        create: {
          id: p.sku,
          organizationId: 'demo-org',
          name: p.name,
          sku: p.sku,
          price: p.price,
          description: p.description
        }
      })

      await prisma.inventory.upsert({
        where: { 
          organizationId_productId: { organizationId: 'demo-org', productId: product.id }
        },
        update: {},
        create: {
          organizationId: 'demo-org',
          productId: product.id,
          quantity: p.quantity,
          minThreshold: p.minThreshold,
          autoOrderThreshold: p.autoOrderThreshold
        }
      })
    } catch (e) {
      console.log('Product exists:', p.sku)
    }
  }

  console.log('✅ Seeded!')
}

main().catch(console.error).finally(() => prisma.$disconnect())