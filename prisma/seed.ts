import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const hashedPassword = await bcrypt.hash('demo123', 10)
  const supplierPassword = await bcrypt.hash('supplier123', 10)

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
    { name: 'Wireless Headphones', sku: 'PROD-001', price: 79.99, description: 'Premium wireless headphones with noise cancellation', quantity: 50, minThreshold: 10, autoOrderThreshold: 5 },
    { name: 'Smart Watch', sku: 'PROD-002', price: 199.99, description: 'Fitness tracking smartwatch with heart rate monitor', quantity: 25, minThreshold: 5, autoOrderThreshold: 3 },
    { name: 'Bluetooth Speaker', sku: 'PROD-003', price: 49.99, description: 'Portable waterproof Bluetooth speaker', quantity: 100, minThreshold: 20, autoOrderThreshold: 10 },
    { name: 'USB-C Hub', sku: 'PROD-004', price: 39.99, description: '7-in-1 USB-C hub with HDMI and card reader', quantity: 75, minThreshold: 15, autoOrderThreshold: 8 },
    { name: 'Laptop Stand', sku: 'PROD-005', price: 29.99, description: 'Ergonomic aluminum laptop stand', quantity: 40, minThreshold: 10, autoOrderThreshold: 5 },
    { name: 'Webcam HD', sku: 'PROD-006', price: 59.99, description: '1080p HD webcam with built-in microphone', quantity: 30, minThreshold: 8, autoOrderThreshold: 4 },
    { name: 'Widget A', sku: 'WGT-001', price: 19.99, description: 'Basic widget', quantity: 100, minThreshold: 20, autoOrderThreshold: 10 },
    { name: 'Widget B', sku: 'WGT-002', price: 29.99, description: 'Premium widget', quantity: 80, minThreshold: 15, autoOrderThreshold: 8 },
    { name: 'Gadget X', sku: 'GDG-001', price: 49.99, description: 'Electronic gadget', quantity: 60, minThreshold: 12, autoOrderThreshold: 6 },
    { name: 'Gadget Y', sku: 'GDG-002', price: 79.99, description: 'Pro gadget', quantity: 40, minThreshold: 8, autoOrderThreshold: 4 },
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
          organizationId_productId: {
            organizationId: 'demo-org', 
            productId: product.id 
          }
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
      console.log('Product may already exist:', p.sku)
    }
  }

  console.log('✅ Database seeded successfully!')
  console.log('')
  console.log('Login credentials:')
  console.log('  Distributor: demo@example.com / demo123')
  console.log('  Supplier: supplier@example.com / supplier123')
  console.log('')
  console.log('Demo sites:')
  console.log('  Retailer Demo: /retailer-demo')
  console.log('  Supplier Demo: /supplier-demo')
  console.log('  Documentation: /docs')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())