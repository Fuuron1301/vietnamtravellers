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
  assert(url, 'DATABASE_URL is required for menu frontend sync smoke.');
  assert(['localhost', '127.0.0.1'].includes(url.hostname), `Refusing to mutate non-local DATABASE_URL host: ${url.hostname}`);
  assert(process.env.CMS_MENU_RUNTIME === 'db', 'CMS_MENU_RUNTIME=db is required so public header/footer read normalized Menu/MenuItem.');
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

async function assertHomepageContains(label) {
  const response = await fetch(`${baseUrl}/?menu-sync=${Date.now()}`, {
    headers: { 'cache-control': 'no-cache' },
    redirect: 'manual'
  });
  const text = await response.text();
  assert(response.status === 200, `Homepage expected 200, got ${response.status}`);
  assert(text.includes(label), `Homepage header did not contain DB menu label "${label}".`);
  console.log(`PASS homepage header contains "${label}"`);
}

async function main() {
  assertSandboxDatabase();
  const stamp = Date.now();
  const parentLabel = `Menu Sync ${stamp}`;
  const childLabel = `Nested Sync ${stamp}`;
  const childLabelUpdated = `Nested Sync Updated ${stamp}`;
  const beforeCounts = {
    menus: await prisma.menu.count(),
    menuItems: await prisma.menuItem.count()
  };
  console.log(`Sandbox counts before: ${JSON.stringify(beforeCounts)}`);

  const auth = await login();
  let menuId = null;

  try {
    const created = await requestJson('/api/admin/menus', {
      method: 'POST',
      body: {
        name: `Frontend Sync Primary ${stamp}`,
        slug: `frontend-sync-primary-${stamp}`,
        location: 'primary',
        items: [
          {
            label: parentLabel,
            url: '/travel-journal/',
            children: [{ label: childLabel, url: '/contact/' }]
          }
        ]
      }
    }, auth);
    assertApi(created, 201, 'create primary menu through admin API');
    menuId = created.payload?.data?.item?.id;
    assert(menuId, 'Created menu id is missing.');

    await assertHomepageContains(parentLabel);

    const updated = await requestJson('/api/admin/menus', {
      method: 'PATCH',
      body: {
        id: menuId,
        name: `Frontend Sync Primary ${stamp}`,
        slug: `frontend-sync-primary-${stamp}`,
        location: 'primary',
        items: [
          {
            label: parentLabel,
            url: '/travel-journal/',
            children: [{ label: childLabelUpdated, url: '/contact/' }]
          }
        ]
      }
    }, auth);
    assertApi(updated, 200, 'update nested menu item through admin API');
    const nestedPersisted = updated.payload?.data?.item?.items?.some((item) => item.label === childLabelUpdated);
    assert(nestedPersisted, 'Updated nested child label was not persisted in MenuItem rows.');
    console.log(`PASS nested child persisted as "${childLabelUpdated}"`);

    await assertHomepageContains(parentLabel);
  } finally {
    if (menuId) {
      const deleted = await requestJson('/api/admin/menus', {
        method: 'DELETE',
        body: { id: menuId }
      }, auth);
      assertApi(deleted, 200, 'delete sandbox-only sync menu');
    }
    await requestJson('/api/admin/auth/logout', { method: 'POST' }, auth).catch(() => undefined);
  }

  const afterCounts = {
    menus: await prisma.menu.count(),
    menuItems: await prisma.menuItem.count()
  };
  console.log(`Sandbox counts after cleanup: ${JSON.stringify(afterCounts)}`);
  assert(afterCounts.menus === beforeCounts.menus, 'Menu count was not restored after sandbox cleanup.');
  assert(afterCounts.menuItems === beforeCounts.menuItems, 'MenuItem count was not restored after sandbox cleanup.');
  console.log('Menu frontend sync smoke passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
