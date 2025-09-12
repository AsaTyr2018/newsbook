import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const userId = Number((session.user as any).id);

  if (req.method === 'GET') {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, bio: true, image: true },
    });
    return res.json(user);
  }
  if (req.method === 'POST') {
    const { name, bio, image } = req.body;
    await prisma.user.update({
      where: { id: userId },
      data: { name, bio, image },
    });
    return res.json({ status: 'ok' });
  }
  res.status(405).end();
}
