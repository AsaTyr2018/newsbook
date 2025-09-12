import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (req.method === 'GET') {
    const { postId } = req.query;
    const where: any = postId ? { postId: Number(postId) } : {};
    if (!session || !['MODERATOR', 'ADMIN'].includes((session.user as any).role)) {
      where.status = 'APPROVED';
    }
    const comments = await prisma.comment.findMany({
      where,
      include: { post: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(comments);
  }
  if (req.method === 'POST') {
    const { postId, name, message } = req.body;
    if (!postId || !message) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const approved = session && (session.user as any).role !== 'GUEST';
    if (!approved && !name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    const comment = await prisma.comment.create({
      data: {
        postId: Number(postId),
        name: session?.user?.name || name,
        message,
        status: approved ? 'APPROVED' : 'PENDING',
        userId: session ? Number((session.user as any).id) : undefined,
      },
    });
    return res.json(comment);
  }
  res.status(405).end();
}
