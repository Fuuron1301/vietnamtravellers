#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const prisma = new PrismaClient();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertSandboxDatabase() {
  const url = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null;
  assert(url, 'DATABASE_URL is required for theme builder smoke.');
  assert(['localhost', '127.0.0.1'].includes(url.hostname), `Refusing to mutate non-local DATABASE_URL host: ${url.hostname}`);
  assert(process.env.CMS_THEME_RUNTIME === 'db', 'CMS_THEME_RUNTIME=db is required so public layout reads DB header/footer templates.');
}

async function fetchHomepage(stamp) {
  const response = await fetch(`${baseUrl}/?theme-builder-smoke=${stamp}`, {
    headers: { 'cache-control': 'no-cache' },
    redirect: 'manual'
  });
  const text = await response.text();
  assert(response.status === 200, `Homepage expected 200, got ${response.status}`);
  return text;
}

async function main() {
  assertSandboxDatabase();
  const stamp = Date.now();
  const headerLabel = `Theme Header ${stamp}`;
  const footerLabel = `Theme Footer ${stamp}`;
  const createdIds = [];
  const beforeCounts = {
    blockTemplates: await prisma.blockTemplate.count()
  };
  console.log(`Sandbox counts before: ${JSON.stringify(beforeCounts)}`);

  const admin = await prisma.user.findFirst({
    where: { status: 'ACTIVE', role: { key: 'ADMINISTRATOR' } },
    select: { id: true }
  });
  assert(admin?.id, 'No active administrator user found for sandbox BlockTemplate creation.');

  try {
    const header = await prisma.blockTemplate.create({
      data: {
        name: `Sandbox Theme Header ${stamp}`,
        slug: `sandbox-theme-header-${stamp}`,
        type: 'HEADER',
        status: 'ACTIVE',
        blocks: [
          {
            id: `theme-header-${stamp}`,
            type: 'text',
            props: { content: headerLabel }
          }
        ],
        createdById: admin.id,
        updatedById: admin.id
      },
      select: { id: true }
    });
    createdIds.push(header.id);

    const footer = await prisma.blockTemplate.create({
      data: {
        name: `Sandbox Theme Footer ${stamp}`,
        slug: `sandbox-theme-footer-${stamp}`,
        type: 'FOOTER',
        status: 'ACTIVE',
        blocks: [
          {
            id: `theme-footer-${stamp}`,
            type: 'text',
            props: { content: footerLabel }
          }
        ],
        createdById: admin.id,
        updatedById: admin.id
      },
      select: { id: true }
    });
    createdIds.push(footer.id);

    const homepage = await fetchHomepage(stamp);
    assert(homepage.includes(headerLabel), `Homepage did not render active HEADER BlockTemplate label "${headerLabel}".`);
    console.log(`PASS homepage renders active HEADER template "${headerLabel}"`);
    assert(homepage.includes(footerLabel), `Homepage did not render active FOOTER BlockTemplate label "${footerLabel}".`);
    console.log(`PASS homepage renders active FOOTER template "${footerLabel}"`);
  } finally {
    if (createdIds.length) {
      await prisma.blockTemplate.deleteMany({ where: { id: { in: createdIds } } });
      console.log(`Cleaned up sandbox theme templates: ${createdIds.length}`);
    }
  }

  const afterCounts = {
    blockTemplates: await prisma.blockTemplate.count()
  };
  console.log(`Sandbox counts after cleanup: ${JSON.stringify(afterCounts)}`);
  assert(afterCounts.blockTemplates === beforeCounts.blockTemplates, 'BlockTemplate count was not restored after sandbox cleanup.');
  console.log('Theme builder runtime smoke passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
