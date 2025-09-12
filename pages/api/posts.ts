import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import slugify from 'slugify';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const posts = await prisma.post.findMany({
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
