import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (req.method === 'GET') {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, role: true, name: true },
    });
    return res.json(users);
  }
  if (req.method === 'POST') {
    const { userId, role } = req.body;
    await prisma.user.update({ where: { id: Number(userId) }, data: { role } });
    return res.json({ status: 'ok' });
  }
  if (req.method === 'DELETE') {
    const { userId } = req.body;
    await prisma.user.delete({ where: { id: Number(userId) } });
    return res.json({ status: 'deleted' });
  }
  res.status(405).end();
}
