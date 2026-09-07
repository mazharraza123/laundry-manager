import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@example.com', role: 'admin' },
  })

  const customer = await prisma.customer.create({
    data: { name: 'Rahul', phone: '1234567890', address: 'Somewhere' },
  })

  const order = await prisma.order.create({
    data: {
      customerId: customer.id,
      dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000),
      items: {
        create: [
          { sku: 'J001', description: 'Blue jeans', colorRequested: 'Indigo', price: 500 },
          { sku: 'J002', description: 'Ripped jeans', colorRequested: 'Black', price: 600 },
        ],
      },
    },
    include: { items: true },
  })

  console.log({ user, customer, order })
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
