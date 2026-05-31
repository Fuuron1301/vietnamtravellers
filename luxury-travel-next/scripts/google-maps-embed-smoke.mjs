#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const slug = 'ky-son-biking-cooking-herbal-healing';
const routePath = `/vietnam-tours/${slug}`;
const metaKey = '_google_maps_embed';
const expectedSrcPrefix = 'https://www.google.com/maps/embed?pb=';
const httpRoutes = [
  { path: routePath, label: 'Ky Son explicit admin embed', expected: expectedSrcPrefix, cropped: true },
  { path: '/vietnam-tours/a-glimpse-of-sapa-2-days', label: 'Sapa tour zoomed map', expected: '22.3364,103.8431', cropped: true }
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertSandboxDatabase() {
  const url = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null;
  assert(url, 'DATABASE_URL is required.');
  assert(['localhost', '127.0.0.1'].includes(url.hostname), `Refusing non-local DATABASE_URL host: ${url.hostname}`);
}

function decodeHtmlAttribute(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function extractIframeSrc(input) {
  if (typeof input !== 'string') return '';
  const trimmed = input.trim();
  const match = trimmed.match(/\bsrc\s*=\s*(["'])(.*?)\1/i) || trimmed.match(/\bsrc\s*=\s*([^>\s]+)/i);
  return decodeHtmlAttribute((match?.[2] || match?.[1] || trimmed).trim());
}

async function assertDbMeta() {
  const post = await prisma.post.findUnique({
    where: { postType_slug: { postType: 'TOUR', slug } },
    include: { meta: true }
  });
  assert(post, `Missing mirrored tour ${slug}.`);
  const mapMeta = post.meta.find((entry) => entry.key === metaKey);
  assert(mapMeta, `Missing ${metaKey} PostMeta for ${slug}.`);

  const src = extractIframeSrc(mapMeta.value);
  assert(src.startsWith(expectedSrcPrefix), `${metaKey} must contain a Google Maps embed URL, got: ${src}`);
  assert(!String(mapMeta.value).includes('<script'), `${metaKey} must not contain script markup.`);
  console.log(`PASS DB ${slug} ${metaKey} -> ${src.slice(0, 82)}...`);
}

async function assertHttpRuntime() {
  const baseUrl = process.env.SMOKE_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  for (const route of httpRoutes) {
    const response = await fetch(new URL(route.path, baseUrl));
    const html = await response.text();
    const iframeSrc = extractIframeSrc(html);
    const iframeUrl = iframeSrc ? new URL(iframeSrc) : null;
    assert(response.status === 200 && !html.includes('NEXT_HTTP_ERROR_FALLBACK;404'), `${route.path} returned ${response.status}.`);
    assert(iframeSrc, `${route.path} does not render an iframe.`);
    assert(
      iframeSrc.startsWith(route.expected) || iframeUrl?.searchParams.get('ll') === route.expected,
      `${route.path} does not render the expected Google Maps URL.`
    );
    if (route.cropped) {
      assert(html.includes('data-map-crop="true"'), `${route.path} missing cropped Google Maps frame.`);
      assert(!html.includes('>Google Maps route</p>') && !html.includes('>Precise Google route</p>'), `${route.path} still renders text overlay on top of Google iframe.`);
    }
    if (route.forbidden) assert(!html.includes(route.forbidden), `${route.path} still uses cluttered Google Maps directions UI.`);
    assert(html.includes('title="Google Maps route for '), `${route.path} missing accessible Google Maps iframe title.`);
    console.log(`PASS HTTP ${route.label}: ${route.path} renders Google Maps iframe.`);
  }
}

async function main() {
  assertSandboxDatabase();
  await assertDbMeta();
  if (process.argv.includes('--http')) await assertHttpRuntime();
  console.log('Google Maps embed smoke passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
