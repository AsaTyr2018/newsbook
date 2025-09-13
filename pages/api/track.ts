import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const { path } = req.body || {};
  const ipHeader = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
  const ip = ipHeader.split(',')[0].trim();

  const consent = await prisma.trackingConsent.findUnique({ where: { ip } });
  if (!consent) {
    res.status(403).json({ ok: false });
    return;
  }

  let postId: number | undefined;
  const match = /^\/news\/([^/?#]+)/.exec(path);
  if (match) {
    const slug = match[1];
    const post = await prisma.post.findUnique({ where: { slug }, select: { id: true } });
    if (post) {
      postId = post.id;
    }
  }

  await prisma.pageView.create({ data: { path: path || '', ip, postId } });
  res.status(200).json({ ok: true });
}
