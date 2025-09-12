import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  if (req.method === 'DELETE') {
    await prisma.tag.delete({ where: { id: Number(id) } });
    return res.json({ status: 'ok' });
  }
  res.status(405).end();
}
