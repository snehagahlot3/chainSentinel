import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
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
    { name: 'Widget A', sku: 'WGT-001', price: 19.99, description: 'Basic widget' },
    { name: 'Widget B', sku: 'WGT-002', price: 29.99, description: 'Premium widget' },
    { name: 'Gadget X', sku: 'GDG-001', price: 49.99, description: 'Electronic gadget' },
    { name: 'Gadget Y', sku: 'GDG-002', price: 79.99, description: 'Pro gadget' },
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
          quantity: 100,
          minThreshold: 20,
          autoOrderThreshold: 10
        }
      })
    } catch (e) {
      console.log('Product may already exist:', p.sku)
    }
  }

  console.log('Database seeded!')
  console.log('Demo login: demo@example.com / demo123')
  console.log('Supplier login: supplier@example.com / supplier123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())