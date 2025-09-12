import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
  const { username, challengePhrase, newPassword, confirmPassword } = req.body;
  if (!username || !challengePhrase || !newPassword || newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Ungültige Angaben' });
  }
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.challengePhrase) {
    return res.status(400).json({ error: 'Reset nicht möglich' });
  }
  const valid = await bcrypt.compare(challengePhrase, user.challengePhrase);
  if (!valid) {
    return res.status(400).json({ error: 'Challenge falsch' });
  }
  const password = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password } });
  return res.json({ status: 'ok' });
}
