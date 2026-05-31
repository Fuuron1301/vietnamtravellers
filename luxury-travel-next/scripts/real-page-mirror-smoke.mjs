#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const realPageCollections = new Set(['static-pages', 'trip-styles', 'hubs']);

const expectedStaticPages = [
  'home',
  'blog',
  'blog-team',
  'contact',
  'cruises',
  'customize-your-trip',
  'faqs',
  'guest-memory',
  'payment',
  'planning-flow',
  'privacy-security',
  'terms-and-conditions',
  'travel-journal',
  'travel-styles',
  'why-travel-with-us'
];

const expectedTripStyles = [
  'beach-escapes',
  'island-villas',
  'honeymoon',
  'luxury-stays',
  'culture-and-heritage',
  'adventure-vacations',
  'waterfall-retreats',
  'culinary-journeys',
  'family-holidays',
  'wellness-and-spa',
  'wildlife-and-safari',
  'cruise-voyages',
  'photography-trips',
  'celebration-trips',
  'mountain-retreats',
  'city-breaks',
  'rail-journeys',
  'diving-and-marine',
  'golf-holidays',
  'multi-country'
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertSandboxDatabase() {
  const url = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null;
  assert(url, 'DATABASE_URL is required.');
  assert(['localhost', '127.0.0.1'].includes(url.hostname), `Refusing to inspect non-local DATABASE_URL host: ${url.hostname}`);
}

function metaMap(page) {
  return new Map(page.meta.map((entry) => [entry.key, entry.value]));
}

async function assertRealMirrorPage(slug, expectedCollection) {
  const page = await prisma.post.findUnique({
    where: { postType_slug: { postType: 'PAGE', slug } },
    include: { meta: true, featuredImage: true }
  });
  assert(page, `Missing real mirrored PAGE: ${slug}`);
  const meta = metaMap(page);
  assert(meta.get('_mirror_source') === 'current-public-output', `${slug} is not marked as current-public-output.`);
  assert(meta.get('_mirror_source_collection') === expectedCollection, `${slug} expected collection ${expectedCollection}, got ${meta.get('_mirror_source_collection')}`);
  assert(page.title && !/^Smoke Page /.test(page.title), `${slug} has smoke/fake title.`);
  assert(page.content.length > 40, `${slug} content is too thin to be real mirrored website data.`);
  assert(page.seoTitle.length > 0, `${slug} is missing seoTitle.`);
  assert(page.seoDescription.length > 0, `${slug} is missing seoDescription.`);
  console.log(`PASS real mirrored PAGE ${slug} (${expectedCollection})`);
}

async function main() {
  assertSandboxDatabase();
  for (const slug of expectedStaticPages) {
    await assertRealMirrorPage(slug, 'static-pages');
  }
  for (const slug of expectedTripStyles) {
    await assertRealMirrorPage(slug, 'trip-styles');
  }

  const smokeInRealCollections = await prisma.post.findMany({
    where: {
      postType: 'PAGE',
      title: { startsWith: 'Smoke Page' },
      meta: { some: { key: '_mirror_source_collection' } }
    },
    include: { meta: { where: { key: '_mirror_source_collection' }, select: { value: true } } }
  });
  const incorrectlyMarkedSmoke = smokeInRealCollections.filter((page) => realPageCollections.has(String(page.meta[0]?.value || '')));
  assert(incorrectlyMarkedSmoke.length === 0, `Smoke pages were incorrectly marked as real mirror pages: ${JSON.stringify(incorrectlyMarkedSmoke)}`);
  console.log('Real page mirror smoke passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
