import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import slugify from 'slugify';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const posts = await prisma.post.findMany({
      include: { category: true, tags: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(posts);
  }
  if (req.method === 'POST') {
    const { title, content, categoryId, tagIds } = req.body;
    const slug = slugify(title, { lower: true });
    const post = await prisma.post.create({
      data: {
        title,
        content,
        slug,
        categoryId: categoryId ? Number(categoryId) : undefined,
        tags: tagIds && tagIds.length ? { connect: tagIds.map((id: number) => ({ id })) } : undefined,
      },
    });
    return res.json(post);
  }
  res.status(405).end();
}
