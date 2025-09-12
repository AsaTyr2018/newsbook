import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { postId } = req.query;
    const where = postId ? { postId: Number(postId) } : {};
    const comments = await prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return res.json(comments);
  }
  if (req.method === 'POST') {
    const { postId, name, message } = req.body;
    if (!postId || !name || !message) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const comment = await prisma.comment.create({
      data: { postId: Number(postId), name, message },
    });
    return res.json(comment);
  }
  res.status(405).end();
}
