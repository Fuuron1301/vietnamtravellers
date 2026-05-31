#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertSandboxDatabase() {
  const url = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null;
  assert(url, 'DATABASE_URL is required.');
  assert(['localhost', '127.0.0.1'].includes(url.hostname), `Refusing to inspect non-local DATABASE_URL host: ${url.hostname}`);
}

async function countWhere(model, where) {
  return prisma[model].count({ where });
}

async function main() {
  assertSandboxDatabase();
  const counts = {
    mediaMeta: await prisma.mediaMeta.count(),
    userMeta: await prisma.userMeta.count(),
    categoryMeta: await prisma.categoryMeta.count(),
    tagMeta: await prisma.tagMeta.count(),
    mirroredMediaSource: await countWhere('mediaMeta', { key: '_mirror_media_source' }),
    mirroredMediaUsage: await countWhere('mediaMeta', { key: '_mirror_media_usage' }),
    mirroredCategorySource: await countWhere('categoryMeta', { key: '_mirror_taxonomy_source' }),
    mirroredTagSource: await countWhere('tagMeta', { key: '_mirror_taxonomy_source' }),
    adminUserSource: await countWhere('userMeta', { key: '_admin_profile_source' })
  };

  console.log(JSON.stringify(counts, null, 2));
  assert(counts.mediaMeta > 0, 'MediaMeta should be populated by cms:mirror-current.');
  assert(counts.userMeta > 0, 'UserMeta should be populated by cms:mirror-current.');
  assert(counts.categoryMeta > 0, 'CategoryMeta should be populated by cms:mirror-current.');
  assert(counts.tagMeta > 0, 'TagMeta should be populated by cms:mirror-current.');
  assert(counts.mirroredMediaSource > 0, 'Expected mirrored media source metadata.');
  assert(counts.mirroredMediaUsage > 0, 'Expected mirrored media usage metadata.');
  assert(counts.mirroredCategorySource > 0, 'Expected category mirror source metadata.');
  assert(counts.mirroredTagSource > 0, 'Expected tag mirror source metadata.');
  assert(counts.adminUserSource > 0, 'Expected safe admin user profile metadata.');
  console.log('Meta population smoke passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
