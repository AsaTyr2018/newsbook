import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ipHeader = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
  const ip = ipHeader.split(',')[0].trim();

  if (req.method === 'GET') {
    const existing = await prisma.trackingConsent.findUnique({ where: { ip } });
    res.status(200).json({ consented: !!existing });
    return;
  }

  if (req.method === 'POST') {
    const { accept } = req.body || {};
    if (accept) {
      await prisma.trackingConsent.upsert({
        where: { ip },
        update: {},
        create: { ip },
      });
      res.status(200).json({ consented: true });
    } else {
      res.status(200).json({ consented: false });
    }
    return;
  }

  res.status(405).end();
}
