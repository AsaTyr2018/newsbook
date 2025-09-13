import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { prisma } from '../lib/prisma';

const FLAG_FILE = path.join(process.cwd(), 'update.flag');
const execAsync = promisify(exec);
let updating = false;

async function run(cmd: string) {
  console.log(`[worker] ${cmd}`);
  await execAsync(cmd);
}

async function setMaintenance(value: boolean) {
  await prisma.setting.upsert({
    where: { key: 'maintenance' },
    update: { value: value ? 'true' : 'false' },
    create: { key: 'maintenance', value: value ? 'true' : 'false' },
  });
}

async function performUpdate() {
  try {
    await setMaintenance(true);
    try {
      await run('pm2 stop all');
    } catch (e) {
      console.error('[worker] pm2 stop failed', e);
    }
    await run('git fetch --all');
    await run('git reset --hard origin/main');
    await run('npm ci');
    await run('npx prisma migrate deploy');
    await run('npm run build');
  } catch (err) {
    console.error('[worker] update failed', err);
  } finally {
    try {
      await run('pm2 start all');
    } catch (e) {
      console.error('[worker] pm2 start failed', e);
    }
    await setMaintenance(false);
  }
}

setInterval(async () => {
  if (updating) return;
  if (fs.existsSync(FLAG_FILE)) {
    updating = true;
    fs.unlinkSync(FLAG_FILE);
    await performUpdate();
    updating = false;
  }
}, 3000);

console.log('[worker] listening for update flag', FLAG_FILE);
