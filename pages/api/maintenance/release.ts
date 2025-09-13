import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
  const secret = process.env.MAINTENANCE_RELEASE_SECRET;
  const provided = Array.isArray(req.query.secret) ? req.query.secret[0] : req.query.secret;
  if (!secret || provided !== secret) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  await prisma.setting.upsert({
    where: { key: 'maintenance' },
    update: { value: 'false' },
    create: { key: 'maintenance', value: 'false' },
  });

  return res.status(200).json({ released: true });
}
