import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, ProcessType } from '@prisma/client'

const prisma = new PrismaClient()
const VALID_STATUSES = ['NEW','DYEING','WASHING','CREATION','QC','READY','DELIVERED']

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (req.method !== 'PATCH') return res.status(405).end()

  const role = (req.headers['x-user-role'] as string) || 'viewer'
  if (role !== 'admin') return res.status(403).json({ error: 'Only admin can update status' })

  const { status, note, operatorId, processType, action } = req.body
  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid or missing status' })
  }

  try {
    // Update item currentStatus
    const updated = await prisma.item.update({
      where: { id: Number(id) },
      data: { currentStatus: status },
    })

    // Optionally record process start/complete based on action
    if (processType) {
      const pType = (processType as string).toUpperCase()
      if (!Object.keys(ProcessType).includes(pType)) {
        // ignore invalid processType silently or return error
      } else {
        if (action === 'start') {
          await prisma.itemProcess.create({
            data: {
              itemId: Number(id),
              processType: pType as ProcessType,
              operatorId: operatorId ? Number(operatorId) : undefined,
              startedAt: new Date(),
              notes: note,
            },
          })
        } else if (action === 'complete') {
          // find latest open process of same type and close it; else create with completedAt
          const open = await prisma.itemProcess.findFirst({
            where: { itemId: Number(id), processType: pType as ProcessType, completedAt: null },
            orderBy: { startedAt: 'desc' },
          })
          if (open) {
            await prisma.itemProcess.update({
              where: { id: open.id },
              data: { completedAt: new Date(), notes: note ?? open.notes, operatorId: operatorId ? Number(operatorId) : open.operatorId },
            })
          } else {
            await prisma.itemProcess.create({
              data: {
                itemId: Number(id),
                processType: pType as ProcessType,
                operatorId: operatorId ? Number(operatorId) : undefined,
                startedAt: new Date(),
                completedAt: new Date(),
                notes: note,
              },
            })
          }
        }
      }
    }

    return res.json({ item: updated })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Server error' })
  }
}
