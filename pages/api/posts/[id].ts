import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import slugify from 'slugify';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const existing = await prisma.post.findUnique({ where: { id: Number(id) } });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const isOwner = existing.authorId === Number((session.user as any).id);
  const isAdmin = (session.user as any).role === 'ADMIN';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method === 'PUT') {
    const { title, content, categoryId, tagIds } = req.body;
    const slug = slugify(title, { lower: true });
    const post = await prisma.post.update({
      where: { id: Number(id) },
      data: {
        title,
        content,
        slug,
        categoryId: categoryId ? Number(categoryId) : null,
        tags: {
          set: tagIds && tagIds.length ? tagIds.map((tid: number) => ({ id: tid })) : [],
        },
      },
      include: {
        category: true,
        tags: true,
        author: { select: { username: true, name: true } },
      },
    });
    return res.json(post);
  }
  if (req.method === 'DELETE') {
    await prisma.post.delete({ where: { id: Number(id) } });
    return res.json({ status: 'ok' });
  }
  res.status(405).end();
}
