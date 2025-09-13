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

const debug = (...args: any[]) => {
  if (process.env.DEBUG_AVATAR_UPLOAD) {
    console.log('[avatar-upload]', ...args);
  }
};

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
      const allowedFormats = (configMap.avatarAllowedFormats ||
        'image/png,image/jpeg,image/jpg,image/gif,image/webp')
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const normalizeMime = (type: string) => {
        if (type === 'image/jpg' || type === 'image/pjpeg') return 'image/jpeg';
        if (type === 'image/x-png') return 'image/png';
        return type;
      };

      const allowedMimes = allowedFormats
        .filter((f) => f.includes('/'))
        .map((f) => normalizeMime(f));
      const allowedExts = allowedFormats
        .filter((f) => !f.includes('/'))
        .map((f) => f.replace(/^\./, ''));
      const maxSize = parseInt(configMap.avatarMaxSize || '2', 10) * 1024 * 1024;
      const maxDim = parseInt(configMap.avatarMaxDimension || '1024', 10);
      const minDim = parseInt(configMap.avatarMinDimension || '64', 10);

      debug('config', { allowedFormats, allowedMimes, allowedExts, maxSize, maxDim, minDim });

      const form = formidable({ maxFileSize: maxSize, multiples: false });
      const { fields, files } = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
      });

        const name = (fields.name as string) || undefined;
        const bio = (fields.bio as string) || undefined;
        const fileData = files.image;
        const file = Array.isArray(fileData)
          ? (fileData[0] as formidable.File)
          : (fileData as formidable.File | undefined);

      debug('parsed form', {
        fields,
        file: file
          ? { originalFilename: file.originalFilename, mimetype: file.mimetype, size: file.size }
          : null,
      });

      let imagePath: string | undefined;
      if (file) {
        try {
          const fileType = normalizeMime((file.mimetype || '').split(';')[0].toLowerCase());
          const fileExt = path
            .extname(file.originalFilename || '')
            .replace('.', '')
            .toLowerCase();
          debug('processing file', { fileType, fileExt, size: file.size });
          if (!allowedMimes.includes(fileType) && !allowedExts.includes(fileExt)) {
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
            'image/pjpeg': 'jpg',
            'image/x-png': 'png',
          };
          const ext = mimeToExt[fileType] || mimeToExt[`image/${fileExt}`];
          if (!ext) {
            return res.status(400).json({ error: 'Unsupported format' });
          }

          const metadata = await sharp(file.filepath).metadata();
          debug('metadata', metadata);
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
          debug('stored avatar', imagePath);
        } catch (err) {
          debug('error processing avatar', err);
          return res.status(500).json({ error: 'Avatar processing failed' });
        }
      } else {
        debug('no file provided');
      }

      const data: any = { name, bio };
      if (imagePath) data.image = imagePath;
      await prisma.user.update({
        where: { id: userId },
        data,
      });
      debug('user updated', { userId, imagePath });
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
