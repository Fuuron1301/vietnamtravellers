import { chromium } from 'playwright';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const adminLogin = process.env.ADMIN_SMOKE_LOGIN || 'admin@example.com';
const adminPassword = process.env.ADMIN_SMOKE_PASSWORD || 'change-me-before-production';
const headless = process.env.ADMIN_UI_HEADLESS !== 'false';

function log(message) {
  console.log(`[media-ui] ${message}`);
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

async function createMedia(auth, stamp, name) {
  const result = await requestJson('/api/admin/media', {
    method: 'POST',
    body: {
      url: `/uploads/admin/media-ui-${stamp}-${name}.jpg`,
      title: `Media UI ${stamp} ${name}`,
      mimeType: 'image/jpeg',
      altText: `Alt Media UI ${stamp} ${name}`,
      caption: `Caption Media UI ${stamp} ${name}`,
      description: `MediaUiDescriptionToken-${stamp}-${name}`
    }
  }, auth);
  assert(result.response.status === 201, `Create media expected 201, got ${result.response.status}: ${JSON.stringify(result.payload)}`);
  return result.payload.data.item;
}

async function createPost(auth, stamp, mediaId) {
  const result = await requestJson('/api/admin/posts', {
    method: 'POST',
    body: {
      title: `Media UI Attached Post ${stamp}`,
      slug: `media-ui-attached-post-${stamp}`,
      excerpt: 'Sandbox media UI attachment post',
      content: 'Sandbox media UI attachment post',
      seoTitle: `Media UI Attached Post ${stamp}`,
      seoDescription: 'Sandbox media UI attachment post',
      status: 'DRAFT',
      mediaIds: [mediaId]
    }
  }, auth);
  assert(result.response.status === 201, `Create attachment post expected 201, got ${result.response.status}: ${JSON.stringify(result.payload)}`);
  return result.payload.data.item;
}

async function deleteMediaIfPossible(auth, id) {
  await requestJson('/api/admin/media', { method: 'DELETE', body: { id } }, auth).catch(() => undefined);
}

async function trashPost(auth, id) {
  await requestJson('/api/admin/posts', { method: 'DELETE', body: { id } }, auth).catch(() => undefined);
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
  const stamp = Date.now();
  const auth = await loginApi();
  const unattached = await createMedia(auth, stamp, 'unattached');
  const attached = await createMedia(auth, stamp, 'attached');
  const post = await createPost(auth, stamp, attached.id);

  const browser = await chromium.launch({ headless });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  try {
    await loginUi(page);
    await page.goto(`${baseUrl}/admin/media`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'Thư viện Media' }).waitFor({ state: 'visible', timeout: 10000 });

    await page.getByLabel('Tìm media').fill(`MediaUiDescriptionToken-${stamp}`);
    await Promise.all([
      page.waitForResponse((response) => {
        if (!response.url().includes('/api/admin/media')) return false;
        const url = new URL(response.url());
        return url.searchParams.get('search') === `MediaUiDescriptionToken-${stamp}`;
      }, { timeout: 10000 }),
      page.getByRole('button', { name: 'Tìm media' }).click()
    ]);
    await page.getByText(`Alt Media UI ${stamp} unattached`).waitFor({ state: 'visible', timeout: 10000 });
    log('PASS media search is wired to API and displays alt metadata');

    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/admin/media') && new URL(response.url()).searchParams.get('kind') === 'IMAGE', { timeout: 10000 }),
      page.getByLabel('Lọc loại media').selectOption('IMAGE')
    ]);
    const monthValue = await page.getByLabel('Lọc tháng media').locator('option').nth(1).getAttribute('value');
    assert(monthValue && /^\d{4}-\d{2}$/.test(monthValue), `Expected a YYYY-MM media month option, got ${monthValue}`);
    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/admin/media') && new URL(response.url()).searchParams.get('month') === monthValue, { timeout: 10000 }),
      page.getByLabel('Lọc tháng media').selectOption(monthValue)
    ]);
    log('PASS media kind and month filters render and call API');

    await page.getByRole('button', { name: `Chỉnh metadata Media UI ${stamp} unattached` }).click();
    await page.getByLabel('Alt text media').fill(`Alt Media UI ${stamp} updated`);
    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/admin/media') && response.request().method() === 'PATCH', { timeout: 10000 }),
      page.getByRole('button', { name: 'Lưu metadata' }).click()
    ]);
    await page.getByText(`Alt Media UI ${stamp} updated`).waitFor({ state: 'visible', timeout: 10000 });
    log('PASS media metadata editor persists through API');

    await page.getByLabel(`Chọn media ${attached.id}`).check();
    await page.getByLabel('Hành động media hàng loạt').selectOption('delete');
    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/admin/media') && response.request().method() === 'DELETE' && response.status() === 409, { timeout: 10000 }),
      page.getByRole('button', { name: 'Áp dụng media' }).click()
    ]);
    await page.getByText(/attached to content|Detach it before deleting|đang được gắn/i).waitFor({ state: 'visible', timeout: 10000 });
    log('PASS attached media bulk delete is blocked with clear notice');

    await page.getByLabel(`Chọn media ${attached.id}`).uncheck();
    await page.getByLabel(`Chọn media ${unattached.id}`).check();
    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/admin/media') && response.request().method() === 'DELETE' && response.status() === 200, { timeout: 10000 }),
      page.getByRole('button', { name: 'Áp dụng media' }).click()
    ]);
    const deleted = await requestJson(`/api/admin/media?search=${encodeURIComponent(`MediaUiDescriptionToken-${stamp}-unattached`)}`, {}, auth);
    assert(deleted.response.status === 200, `Deleted media lookup expected 200, got ${deleted.response.status}`);
    assert((deleted.payload?.data?.items || []).every((item) => item.id !== unattached.id), 'Unattached media should be deleted by bulk action.');
    log('PASS unattached sandbox media can be bulk deleted');

    assert(pageErrors.length === 0, `Browser page errors were raised: ${pageErrors.join('; ')}`);
  } finally {
    await browser.close();
    await trashPost(auth, post.id);
    await deleteMediaIfPossible(auth, unattached.id);
    await requestJson('/api/admin/media', { method: 'PATCH', body: { id: attached.id, action: 'detach', postId: post.id } }, auth).catch(() => undefined);
    await deleteMediaIfPossible(auth, attached.id);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
