import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import sharp from 'sharp';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const userId = Number((session.user as any).id);

  if (req.method === 'GET') {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, bio: true, image: true, locale: true },
    });
    return res.json(user);
  }
  if (req.method === 'POST') {
    const contentType = req.headers['content-type'] || '';

    if (contentType.includes('multipart/form-data')) {
      const settings = await prisma.setting.findMany({
        where: {
          key: {
            in: ['avatarAllowedFormats', 'avatarMaxSize', 'avatarMaxDimension', 'avatarMinDimension'],
          },
        },
      });
      const configMap: Record<string, string> = {};
      settings.forEach((s) => {
        configMap[s.key] = s.value;
      });
      const allowedTypes = (configMap.avatarAllowedFormats ||
        'image/png,image/jpeg,image/jpg,image/gif,image/webp')
        .split(',')
        .map((t) => t.trim());
      const maxSize = parseInt(configMap.avatarMaxSize || '2', 10) * 1024 * 1024;
      const maxDim = parseInt(configMap.avatarMaxDimension || '1024', 10);
      const minDim = parseInt(configMap.avatarMinDimension || '64', 10);

      const form = formidable({ maxFileSize: maxSize, multiples: false });
      const { fields, files } = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
      });

      const name = (fields.name as string) || undefined;
      const bio = (fields.bio as string) || undefined;
      const file = files.image as formidable.File | undefined;

      let imagePath: string | undefined;
      if (file) {
        if (!allowedTypes.includes(file.mimetype || '')) {
          return res.status(400).json({ error: 'Invalid file type' });
        }
        if (file.size > maxSize) {
          return res.status(400).json({ error: 'File too large' });
        }

        const mimeToExt: Record<string, string> = {
          'image/png': 'png',
          'image/jpeg': 'jpg',
          'image/jpg': 'jpg',
          'image/gif': 'gif',
          'image/webp': 'webp',
        };
        const ext = mimeToExt[file.mimetype || ''];
        if (!ext) {
          return res.status(400).json({ error: 'Unsupported format' });
        }

        const metadata = await sharp(file.filepath).metadata();
        if (!metadata.width || metadata.width !== metadata.height || metadata.width < minDim || metadata.width > maxDim) {
          return res.status(400).json({ error: 'Invalid image dimensions' });
        }

        const uploadDir = path.join(process.cwd(), 'public', 'avatars');
        fs.mkdirSync(uploadDir, { recursive: true });
        const baseName = crypto.randomUUID();

        const sizes = [64, 128, 256];
        for (const size of sizes) {
          await sharp(file.filepath)
            .resize(size, size)
            .toFile(path.join(uploadDir, `${baseName}_${size}.${ext}`));
        }
        fs.unlink(file.filepath, () => {});

        imagePath = `/avatars/${baseName}_256.${ext}`;
      }

      const data: any = { name, bio };
      if (imagePath) data.image = imagePath;
      await prisma.user.update({
        where: { id: userId },
        data,
      });
      return res.json({ status: 'ok', image: imagePath });
    } else {
      const buffers: Uint8Array[] = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      const body = JSON.parse(Buffer.concat(buffers).toString() || '{}');
      const { name, bio, image, locale, challengePhrase, oldPassword, newPassword, confirmPassword } = body;
      const data: any = { name, bio, image, locale };
      if (challengePhrase) {
        data.challengePhrase = await bcrypt.hash(challengePhrase, 10);
      }
      if (oldPassword || newPassword || confirmPassword) {
        if (!oldPassword || !newPassword || newPassword !== confirmPassword) {
          return res.status(400).json({ error: 'Passwort ungültig' });
        }
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const valid = await bcrypt.compare(oldPassword, user.password);
        if (!valid) return res.status(400).json({ error: 'Falsches Passwort' });
        data.password = await bcrypt.hash(newPassword, 10);
      }
      await prisma.user.update({
        where: { id: userId },
        data,
      });
      return res.json({ status: 'ok' });
    }
  }
  res.status(405).end();
}
