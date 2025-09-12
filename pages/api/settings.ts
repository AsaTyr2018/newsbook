import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const settings = await prisma.setting.findMany();
    const data: Record<string, string> = {};
    settings.forEach((s) => {
      data[s.key] = s.value;
    });
    return res.json(data);
  }
  if (req.method === 'POST') {
    const entries = req.body as Record<string, string>;
    for (const [key, value] of Object.entries(entries)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }
    return res.json({ status: 'ok' });
  }
  res.status(405).end();
}
