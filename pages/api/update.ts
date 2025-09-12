import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { prisma } from '../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

function run(cmd: string) {
  return new Promise<void>((resolve, reject) => {
    const child = exec(cmd, (error) => {
      if (error) reject(error);
      else resolve();
    });
    if (child.stdout) child.stdout.pipe(process.stdout);
    if (child.stderr) child.stderr.pipe(process.stderr);
  });
}

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

  try {
    await run('git fetch --all');
    await run('git reset --hard origin/main');
    await run('npm cache clean --force');
    await run('npm ci');
    await run('rm -rf .next');
    await run('npx prisma migrate deploy');
    await run('npm run build');
    await prisma.setting.upsert({
      where: { key: 'maintenance' },
      update: { value: 'false' },
      create: { key: 'maintenance', value: 'false' },
    });
    res.json({ status: 'updated' });
  } catch (e) {
    await prisma.setting.upsert({
      where: { key: 'maintenance' },
      update: { value: 'false' },
      create: { key: 'maintenance', value: 'false' },
    });
    res.status(500).json({ error: 'Update failed' });
  }
}
