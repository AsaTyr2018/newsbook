import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import slugify from 'slugify';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });
    const role = (session.user as any).role;
    if (!['ADMIN', 'AUTHOR'].includes(role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const where =
      role === 'AUTHOR'
        ? { authorId: Number((session.user as any).id) }
        : undefined;
    const posts = await prisma.post.findMany({
      where,
      include: {
        category: true,
        tags: true,
        author: { select: { username: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(posts);
  }
  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });
    if (!['ADMIN', 'AUTHOR'].includes((session.user as any).role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { title, content, categoryId, tagIds } = req.body;
    const slug = slugify(title, { lower: true });
    const post = await prisma.post.create({
      data: {
        title,
        content,
        slug,
        categoryId: categoryId ? Number(categoryId) : undefined,
        authorId: Number((session.user as any).id),
        tags:
          tagIds && tagIds.length
            ? { connect: tagIds.map((id: number) => ({ id })) }
            : undefined,
      },
      include: {
        category: true,
        tags: true,
        author: { select: { username: true, name: true } },
      },
    });
    return res.json(post);
  }
  res.status(405).end();
}
