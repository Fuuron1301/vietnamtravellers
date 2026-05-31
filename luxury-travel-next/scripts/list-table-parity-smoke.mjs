import { chromium } from 'playwright';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const adminLogin = process.env.ADMIN_SMOKE_LOGIN || 'admin@example.com';
const adminPassword = process.env.ADMIN_SMOKE_PASSWORD || 'change-me-before-production';
const headless = process.env.ADMIN_UI_HEADLESS !== 'false';

function log(message) {
  console.log(`[list-table] ${message}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
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

async function loginApi() {
  const result = await requestJson('/api/admin/auth/login', {
    method: 'POST',
    body: { login: adminLogin, password: adminPassword }
  });
  assert(result.response.status === 200, `API login expected 200, got ${result.response.status}`);
  return {
    cookieHeader: cookieHeaderFrom(result.response),
    csrfToken: result.payload?.data?.csrfToken
  };
}

async function createSmokePost(auth, title, status) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const result = await requestJson('/api/admin/posts', {
    method: 'POST',
    body: {
      title,
      slug,
      excerpt: `${title} excerpt`,
      content: `${title} content`,
      seoTitle: title,
      seoDescription: `${title} SEO`,
      status
    }
  }, auth);
  assert(result.response.status === 201, `Create smoke post expected 201, got ${result.response.status}: ${JSON.stringify(result.payload)}`);
  return result.payload.data.item;
}

async function trashPost(auth, id) {
  await requestJson('/api/admin/posts', { method: 'DELETE', body: { id } }, auth);
}

async function loginUi(page) {
  await page.goto(`${baseUrl}/admin/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => Boolean(document.querySelector('#admin-login')?._valueTracker), null, { timeout: 10000 });
  await page.locator('#admin-login').fill(adminLogin);
  await page.locator('#admin-password').fill(adminPassword);
  await Promise.all([
    page.waitForResponse((response) => response.url().includes('/api/admin/auth/login') && response.status() === 200, { timeout: 15000 }),
    page.waitForURL((url) => url.pathname.startsWith('/admin') && url.pathname !== '/admin/login', { timeout: 15000 }),
    page.getByRole('button', { name: 'Log In' }).click()
  ]);
}

async function main() {
  const auth = await loginApi();
  const stamp = `${Date.now()}`;
  const prefix = `List Table Smoke ${stamp}`;
  const alpha = await createSmokePost(auth, `${prefix} Alpha`, 'DRAFT');
  const beta = await createSmokePost(auth, `${prefix} Beta`, 'PUBLISHED');
  const gamma = await createSmokePost(auth, `${prefix} Gamma`, 'DRAFT');
  const createdIds = [alpha.id, beta.id, gamma.id];

  const browser = await chromium.launch({ headless });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  try {
    await loginUi(page);
    await page.goto(`${baseUrl}/admin/posts`, { waitUntil: 'domcontentloaded' });
    await page.locator('h1').first().waitFor({ state: 'visible', timeout: 10000 });

    await page.locator("[data-admin-qa=\"list-search-input\"]").fill(prefix);
    await Promise.all([
      page.waitForResponse((response) => {
        if (!response.url().includes('/api/admin/posts')) return false;
        const url = new URL(response.url());
        return url.searchParams.get('search') === prefix;
      }, { timeout: 10000 }),
      page.locator("[data-admin-qa=\"list-search-button\"]").click()
    ]);
    await page.getByRole('button', { name: `${prefix} Alpha`, exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    log('PASS search control calls API and renders filtered row');

    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/admin/posts') && new URL(response.url()).searchParams.get('perPage') === '2', { timeout: 10000 }),
      page.locator("[data-admin-qa=\"list-page-size\"]").selectOption('2')
    ]);
    await page.getByText(/1 trong 2/).first().waitFor({ state: 'visible', timeout: 10000 });
    log('PASS per-page control uses API pagination metadata');

    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/admin/posts') && new URL(response.url()).searchParams.get('orderBy') === 'title', { timeout: 10000 }),
      page.locator('table thead th button').first().click()
    ]);
    await page.getByRole('button', { name: `${prefix} Alpha`, exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    log('PASS sortable title header uses API orderBy');

    await page.getByLabel('Select all current page').first().check();
    await page.locator('[data-admin-qa="list-selected-count"]').waitFor({ state: 'visible', timeout: 10000 });
    log('PASS select-all current page marks visible rows');

    await page.locator('[data-admin-qa="list-bulk-action"]').selectOption('trash');
    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/admin/posts') && response.request().method() === 'DELETE', { timeout: 10000 }),
      page.locator('[data-admin-qa="list-apply-button"]').click()
    ]);
    const trashCheck = await requestJson(`/api/admin/posts?search=${encodeURIComponent(prefix)}&status=TRASH`, {}, auth);
    assert(trashCheck.response.status === 200, `Trash check expected 200, got ${trashCheck.response.status}`);
    assert((trashCheck.payload?.data?.items || []).filter((item) => [alpha.id, beta.id].includes(item.id)).length >= 2, 'Expected bulk action to move visible rows to TRASH.');
    log('PASS bulk trash updates sandbox DB');

    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/admin/posts') && new URL(response.url()).searchParams.get('status') === 'TRASH', { timeout: 10000 }),
      page.locator("[data-admin-qa=\"list-status-filter\"]").selectOption('TRASH')
    ]);
    await page.getByRole('button', { name: `${prefix} Alpha`, exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    await page.getByLabel('Select all current page').first().check();
    await page.locator('[data-admin-qa=\"list-bulk-action\"]').selectOption('restore');
    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/admin/posts') && response.request().method() === 'PATCH', { timeout: 10000 }),
      page.locator('[data-admin-qa=\"list-apply-button\"]').click()
    ]);
    const restoreCheck = await requestJson(`/api/admin/posts?search=${encodeURIComponent(prefix)}&status=DRAFT`, {}, auth);
    assert(restoreCheck.response.status === 200, `Restore check expected 200, got ${restoreCheck.response.status}`);
    assert((restoreCheck.payload?.data?.items || []).filter((item) => [alpha.id, beta.id].includes(item.id)).length >= 2, 'Expected bulk restore to return rows to DRAFT.');
    log('PASS bulk restore updates sandbox DB and clears trash state');

    assert(pageErrors.length === 0, `Browser page errors were raised: ${pageErrors.join('; ')}`);
  } finally {
    await browser.close();
    await Promise.all(createdIds.map((id) => trashPost(auth, id)));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
