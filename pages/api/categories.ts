import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import slugify from 'slugify';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const categories = await prisma.category.findMany();
    return res.json(categories);
  }
  if (req.method === 'POST') {
    const { name } = req.body;
    const slug = slugify(name, { lower: true });
    const category = await prisma.category.create({ data: { name, slug } });
    return res.json(category);
  }
  res.status(405).end();
}
