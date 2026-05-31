import { chromium } from 'playwright';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const adminLogin = process.env.ADMIN_SMOKE_LOGIN || 'admin@example.com';
const adminPassword = process.env.ADMIN_SMOKE_PASSWORD || 'change-me-before-production';
const headless = process.env.ADMIN_UI_HEADLESS !== 'false';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function log(message) {
  console.log(`[autosave-ui] ${message}`);
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
  return { cookieHeader: cookieHeaderFrom(result.response), csrfToken: result.payload?.data?.csrfToken };
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

async function createPost(auth, stamp) {
  const result = await requestJson('/api/admin/posts', {
    method: 'POST',
    body: {
      title: `Autosave Recovery Original ${stamp}`,
      slug: `autosave-recovery-original-${stamp}`,
      excerpt: 'Original excerpt',
      content: 'Original editor content',
      seoTitle: `Autosave Recovery Original ${stamp}`,
      seoDescription: 'Original SEO',
      status: 'DRAFT'
    }
  }, auth);
  assert(result.response.status === 201, `Create post expected 201, got ${result.response.status}: ${JSON.stringify(result.payload)}`);
  return result.payload.data.item;
}

async function saveAutosave(auth, post, title) {
  const result = await requestJson('/api/admin/autosaves', {
    method: 'POST',
    body: {
      postId: post.id,
      id: post.id,
      resource: 'posts',
      title,
      slug: post.slug,
      excerpt: 'Autosaved excerpt',
      content: `Autosaved editor content for ${title}`,
      seoTitle: title,
      seoDescription: 'Autosaved SEO',
      status: 'DRAFT'
    }
  }, auth);
  assert(result.response.status === 200, `Save autosave expected 200, got ${result.response.status}: ${JSON.stringify(result.payload)}`);
}

async function openPostEditor(page, title) {
  await page.goto(`${baseUrl}/admin/posts`, { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Tìm trong danh sách').fill(title);
  await page.getByRole('button', { name: 'Tìm danh sách' }).click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: title, exact: true }).click();
  await page.getByRole('heading', { name: 'Edit Post' }).waitFor({ state: 'visible', timeout: 10000 });
}

async function main() {
  const stamp = Date.now();
  const auth = await loginApi();
  const post = await createPost(auth, stamp);
  const originalTitle = post.title;
  const restoredTitle = `Autosave Recovery Restored ${stamp}`;
  const dismissedTitle = `Autosave Recovery Dismissed ${stamp}`;

  const browser = await chromium.launch({ headless });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  try {
    await saveAutosave(auth, post, restoredTitle);
    await loginUi(page);
    await openPostEditor(page, originalTitle);
    await page.getByText('Autosave recovery available').waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('input[placeholder="Add title"]').waitFor({ state: 'visible', timeout: 10000 });
    assert(await page.locator('input[placeholder="Add title"]').inputValue() === originalTitle, 'Editor should not auto-apply autosave before the user restores it.');
    log('PASS autosave recovery banner appears without auto-applying snapshot');

    await page.getByRole('button', { name: 'Restore autosave' }).click();
    await page.waitForFunction((expected) => document.querySelector('input[placeholder="Add title"]')?.value === expected, restoredTitle, { timeout: 10000 });
    log('PASS restore autosave applies snapshot to editor draft');

    await page.getByRole('button', { name: '← Back to Posts' }).click();
    await saveAutosave(auth, post, dismissedTitle);
    await openPostEditor(page, originalTitle);
    await page.getByText('Autosave recovery available').waitFor({ state: 'visible', timeout: 10000 });
    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/admin/autosaves') && response.request().method() === 'DELETE' && response.status() === 200, { timeout: 10000 }),
      page.getByRole('button', { name: 'Dismiss autosave' }).click()
    ]);
    await page.getByText('Autosave recovery available').waitFor({ state: 'hidden', timeout: 10000 });
    const dismissed = await requestJson(`/api/admin/autosaves?postId=${encodeURIComponent(post.id)}`, {}, auth);
    assert(dismissed.response.status === 200, `GET autosave after dismiss expected 200, got ${dismissed.response.status}`);
    assert(!dismissed.payload?.data?.item, 'Dismiss autosave should delete the autosave record.');
    log('PASS dismiss autosave deletes recovery record');

    const relevantPageErrors = pageErrors.filter((message) => !message.includes('module factory is not available') && !message.includes('Switched to client rendering because the server rendering errored'));
    assert(relevantPageErrors.length === 0, `Browser page errors were raised: ${relevantPageErrors.join('; ')}`);
  } finally {
    await browser.close();
    await requestJson('/api/admin/autosaves', { method: 'DELETE', body: { postId: post.id } }, auth).catch(() => undefined);
    await requestJson('/api/admin/posts', { method: 'DELETE', body: { id: post.id } }, auth).catch(() => undefined);
    await requestJson('/api/admin/auth/logout', { method: 'POST' }, auth).catch(() => undefined);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
