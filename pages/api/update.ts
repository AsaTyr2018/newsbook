import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { writeFile } from 'fs/promises';
import path from 'path';

const FLAG_FILE = path.join(process.cwd(), 'update.flag');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  await prisma.setting.upsert({
    where: { key: 'maintenance' },
    update: { value: 'true' },
    create: { key: 'maintenance', value: 'true' },
  });

  await writeFile(FLAG_FILE, Date.now().toString());

  res.json({ status: 'update_started' });
}
