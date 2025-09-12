import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const session = await getServerSession(req, res, authOptions);
  if (!session || !['MODERATOR', 'ADMIN'].includes((session.user as any).role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (req.method === 'DELETE') {
    await prisma.comment.delete({ where: { id: Number(id) } });
    return res.json({ status: 'ok' });
  }
  if (req.method === 'PATCH') {
    const { status } = req.body;
    await prisma.comment.update({ where: { id: Number(id) }, data: { status } });
    return res.json({ status: 'ok' });
  }
  res.status(405).end();
}
