#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const adminLogin = process.env.ADMIN_SMOKE_LOGIN || 'admin@example.com';
const adminPassword = process.env.ADMIN_SMOKE_PASSWORD || 'change-me-before-production';
const prisma = new PrismaClient();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertSandboxDatabase() {
  const url = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null;
  assert(url, 'DATABASE_URL is required.');
  assert(['localhost', '127.0.0.1'].includes(url.hostname), `Refusing to mutate non-local DATABASE_URL host: ${url.hostname}`);
}

function cookieHeaderFrom(response) {
  const cookies = response.headers.getSetCookie?.() || [];
  return cookies.map((cookie) => cookie.split(';')[0]).filter(Boolean).join('; ');
}

async function requestJson(path, options = {}, auth) {
  const headers = new Headers(options.headers || {});
  const body = options.body === undefined ? undefined : JSON.stringify(options.body);
  if (body !== undefined) headers.set('content-type', 'application/json');
  if (auth?.cookieHeader) headers.set('cookie', auth.cookieHeader);
  if (auth?.csrfToken) headers.set('x-admin-csrf', auth.csrfToken);
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || 'GET',
    headers,
    body,
    redirect: 'manual'
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  return { response, payload };
}

function assertApi(result, expectedStatus, label) {
  if (result.response.status !== expectedStatus) {
    throw new Error(`${label} expected ${expectedStatus}, got ${result.response.status}: ${JSON.stringify(result.payload)}`);
  }
  console.log(`PASS ${label} -> ${result.response.status}`);
}

async function login() {
  const result = await requestJson('/api/admin/auth/login', {
    method: 'POST',
    body: { login: adminLogin, password: adminPassword }
  });
  assertApi(result, 200, 'admin login');
  const cookieHeader = cookieHeaderFrom(result.response);
  const csrfToken = result.payload?.data?.csrfToken;
  assert(cookieHeader && csrfToken, 'Admin login did not return cookie and CSRF token.');
  return { cookieHeader, csrfToken };
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function hasItem(result, id) {
  return result.payload?.data?.items?.some((item) => item.id === id);
}

async function main() {
  assertSandboxDatabase();
  const stamp = Date.now();
  const auth = await login();
  let mediaId = null;
  try {
    const created = await requestJson('/api/admin/media', {
      method: 'POST',
      body: {
        url: `/uploads/admin/parity/media-parity-${stamp}.jpg`,
        title: `Media parity ${stamp}`,
        mimeType: 'image/jpeg',
        altText: `Alt parity ${stamp}`,
        caption: `Caption parity ${stamp}`,
        description: `Description-only-search-token-${stamp}`
      }
    }, auth);
    assertApi(created, 201, 'create media by URL');
    mediaId = created.payload?.data?.item?.id;
    assert(mediaId, 'Created media id is missing.');

    const byDescription = await requestJson(`/api/admin/media?search=Description-only-search-token-${stamp}`, {}, auth);
    assertApi(byDescription, 200, 'search media by description');
    assert(hasItem(byDescription, mediaId), 'Media search should include description field.');

    const current = await requestJson(`/api/admin/media?kind=IMAGE&month=${currentMonth()}&search=media-parity-${stamp}`, {}, auth);
    assertApi(current, 200, 'filter media by kind and current month');
    assert(hasItem(current, mediaId), 'Current month media filter should include newly-created item.');
    assert(Array.isArray(current.payload?.data?.months), 'Media API should return available year/month folders.');
    assert(current.payload.data.months.some((entry) => entry.value === currentMonth()), 'Media months should include current upload month.');

    const oldMonth = await requestJson(`/api/admin/media?month=1900-01&search=media-parity-${stamp}`, {}, auth);
    assertApi(oldMonth, 200, 'filter media by old month');
    assert(!hasItem(oldMonth, mediaId), 'Old month media filter should exclude newly-created item.');

    const metadata = current.payload.data.items.find((item) => item.id === mediaId);
    assert(typeof metadata.attachedCount === 'number', 'Media item should expose attachedCount.');
    assert(Array.isArray(metadata.meta), 'Media item should include editable metadata array.');
    console.log('Media library parity smoke passed.');
  } finally {
    if (mediaId) {
      await requestJson('/api/admin/media', { method: 'DELETE', body: { id: mediaId } }, auth).catch(() => undefined);
    }
    await requestJson('/api/admin/auth/logout', { method: 'POST' }, auth).catch(() => undefined);
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
