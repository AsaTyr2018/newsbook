const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearMaintenance() {
  await prisma.setting.upsert({
    where: { key: 'maintenance' },
    update: { value: 'false' },
    create: { key: 'maintenance', value: 'false' },
  });
}

clearMaintenance()
  .catch((err) => {
    console.error('Failed to clear maintenance flag', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
