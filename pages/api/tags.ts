import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import slugify from 'slugify';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const tags = await prisma.tag.findMany();
    return res.json(tags);
  }
  if (req.method === 'POST') {
    const { name } = req.body;
    const slug = slugify(name, { lower: true });
    const tag = await prisma.tag.create({ data: { name, slug } });
    return res.json(tag);
  }
  res.status(405).end();
}
