import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (req.method !== 'GET') return res.status(405).end()

  const item = await prisma.item.findUnique({
    where: { id: Number(id) },
    include: { processes: { orderBy: { startedAt: 'asc' } } },
  })

  if (!item) return res.status(404).json({ error: 'Item not found' })
  return res.json(item)
}
