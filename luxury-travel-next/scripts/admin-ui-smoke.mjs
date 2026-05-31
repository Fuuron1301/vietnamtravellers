import { chromium } from 'playwright';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const adminLogin = process.env.ADMIN_SMOKE_LOGIN || 'admin@example.com';
const adminPassword = process.env.ADMIN_SMOKE_PASSWORD || 'change-me-before-production';
const storageKey = 'hlt-local-wp-admin-clone-v3';
const headless = process.env.ADMIN_UI_HEADLESS !== 'false';

function log(message) {
  console.log(`[admin-ui] ${message}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function expectVisible(locator, label) {
  await locator.first().waitFor({ state: 'visible', timeout: 10000 });
  log(`PASS ${label}`);
}

async function expectHidden(locator, label) {
  await locator.first().waitFor({ state: 'hidden', timeout: 10000 });
  log(`PASS ${label}`);
}

async function firstAsideWidth(page) {
  return page.locator('aside').first().evaluate((node) => Number.parseFloat(window.getComputedStyle(node).width));
}

async function login(page) {
  await page.goto(`${baseUrl}/admin/login`, { waitUntil: 'domcontentloaded' });
  await expectVisible(page.locator('#admin-login'), 'login username field renders');
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => Boolean(document.querySelector('#admin-login')?._valueTracker), null, { timeout: 10000 });
  await page.locator('#admin-login').fill(adminLogin);
  await page.locator('#admin-password').fill(adminPassword);
  await Promise.all([
    page.waitForResponse((response) => response.url().includes('/api/admin/auth/login') && response.status() === 200, { timeout: 15000 }),
    page.waitForURL((url) => url.pathname.startsWith('/admin') && url.pathname !== '/admin/login', { timeout: 15000 }),
    page.getByRole('button', { name: 'Log In' }).click()
  ]);
  await expectVisible(page.locator('.hlt-wp-admin-clone'), 'admin shell renders after login');
}

async function resetAdminStorage(page) {
  await page.evaluate((key) => window.localStorage.removeItem(key), storageKey);
  await page.goto(`${baseUrl}/admin`, { waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByRole('heading', { name: 'Bảng tin' }), 'dashboard heading renders');
}

async function checkAdminBar(page) {
  const accountButton = page.getByRole('button', { name: /Chào,/ });
  await accountButton.click();
  await expectVisible(page.getByRole('button', { name: 'Đăng xuất' }), 'admin bar account dropdown opens');
  await page.keyboard.press('Escape');
  await expectHidden(page.getByRole('button', { name: 'Đăng xuất' }), 'admin bar account dropdown closes on Escape');
}

async function checkNoticesAndScreenOptions(page) {
  const welcomeClose = page.getByRole('button', { name: 'Đóng welcome panel' });
  if (await welcomeClose.count()) {
    await welcomeClose.click();
    await expectHidden(page.getByText('Welcome to Orchid Store'), 'welcome notice dismisses');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expectHidden(page.getByText('Welcome to Orchid Store'), 'welcome notice dismissal persists');
  }

  await page.getByRole('button', { name: /Tùy chọn hiển thị/ }).click();
  await expectVisible(page.getByText('Hộp trên màn hình'), 'screen options panel opens');
  await page.getByRole('button', { name: /Tùy chọn hiển thị/ }).click();
  await expectHidden(page.getByText('Hộp trên màn hình'), 'screen options panel closes');
}

async function checkSidebar(page) {
  await page.getByRole('button', { name: 'Blocks' }).click();
  await expectVisible(page.getByRole('heading', { name: 'Blocks & Templates' }), 'sidebar navigation activates Blocks screen');

  await page.getByRole('button', { name: 'Thu gọn menu' }).click();
  await page.waitForFunction(() => {
    const sidebar = document.querySelector('aside');
    return sidebar && Number.parseFloat(window.getComputedStyle(sidebar).width) <= 50;
  }, null, { timeout: 5000 });
  const collapsedWidth = await firstAsideWidth(page);
  assert(collapsedWidth <= 50, `Expected collapsed sidebar width <= 50px, got ${collapsedWidth}`);
  log('PASS sidebar collapses to wp-admin compact width');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => {
    const sidebar = document.querySelector('aside');
    return sidebar && Number.parseFloat(window.getComputedStyle(sidebar).width) <= 50;
  }, null, { timeout: 5000 });
  const persistedWidth = await firstAsideWidth(page);
  assert(persistedWidth <= 50, `Expected collapsed sidebar width to persist, got ${persistedWidth}`);
  log('PASS sidebar collapse persists after reload');
}

async function checkListTable(page) {
  await page.goto(`${baseUrl}/admin/posts`, { waitUntil: 'domcontentloaded' });
  await expectVisible(page.locator('h1').first(), 'posts list renders');
  await expectVisible(page.locator('[data-admin-qa="list-bulk-action"]'), 'bulk actions control renders');
  await expectVisible(page.locator('[data-admin-qa="list-status-filter"]'), 'status filter renders');
  await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForFunction(() => document.querySelectorAll('table tbody input[type="checkbox"]').length > 0, null, { timeout: 10000 });
  await expectVisible(page.locator('table thead input[aria-label="Select all current page"]').first(), 'select all checkbox renders');
  const firstRowCheckbox = page.locator('table tbody input[type="checkbox"]').first();
  await firstRowCheckbox.check({ force: true });
  await page.waitForFunction(() => document.querySelectorAll('table tbody input[type="checkbox"]:checked').length > 0, null, { timeout: 10000 });
  log('PASS list table row checkbox toggles selection state');
}

async function checkTourEditor(page) {
  await page.goto(`${baseUrl}/admin/tours`, { waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByRole('heading', { name: 'Tours' }), 'tour list renders');
  await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 10000 });
  await page.locator('table tbody tr').first().getByRole('button', { name: 'Chỉnh sửa' }).click();
  await expectVisible(page.getByText('DB-backed editor').first(), 'tour editor opens');
  await page.getByRole('button', { name: 'Public sections' }).click();
  await expectVisible(page.getByLabel('Overview copy'), 'tour overview field renders');
  await expectVisible(page.getByLabel('Google Maps embed URL / iframe'), 'tour maps field renders');
  await expectVisible(page.getByLabel('Pricing JSON'), 'tour pricing json field renders');
  await expectVisible(page.getByLabel('FAQ JSON'), 'tour faq json field renders');
  await expectVisible(page.getByLabel('Itinerary JSON'), 'tour itinerary json field renders');
  await expectVisible(page.getByRole('heading', { name: 'Tour facts' }), 'tour facts panel renders');
  await expectVisible(page.getByRole('heading', { name: 'Reviews and program data' }), 'tour reviews panel renders');
}

async function checkDesignPanel(page) {
  await page.goto(`${baseUrl}/admin/design`, { waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByRole('heading', { name: 'Design System' }), 'design panel renders');
  await page.waitForFunction(() => {
    const values = Array.from(document.querySelectorAll('input')).map((input) => input.value);
    return values.some((value) => value.includes('Playfair Display')) && values.some((value) => value.includes('Manrope'));
  }, null, { timeout: 10000 });
  log('PASS design panel preserves Playfair Display and Manrope token fields');
}

async function checkBlocksPreview(page) {
  await page.goto(`${baseUrl}/admin/blocks`, { waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByRole('heading', { name: 'Blocks & Templates' }), 'blocks manager renders');
  await expectVisible(page.getByText('Drag/drop block canvas'), 'block canvas renders');
  await expectVisible(page.getByText('Preview').first(), 'preview postbox renders');
  await page.locator('summary', { hasText: 'Advanced JSON editor' }).click();
  await page.locator('details textarea').fill(JSON.stringify([
    { id: 'ui-smoke-text', type: 'text', props: { content: 'UI smoke preview text' } }
  ], null, 2));
  await expectVisible(page.getByText('UI smoke preview text'), 'block preview renders JSON-edited block tree');
  const rowCountBefore = await page.locator('[draggable="true"]').count();
  await page.getByRole('button', { name: 'Add block' }).click();
  await page.waitForFunction((count) => document.querySelectorAll('[draggable="true"]').length > count, rowCountBefore, { timeout: 10000 });
  log('PASS block canvas add updates block tree');
  await page.getByRole('button', { name: 'Duplicate' }).click();
  await page.waitForFunction((count) => document.querySelectorAll('[draggable="true"]').length > count + 1, rowCountBefore, { timeout: 10000 });
  log('PASS block canvas duplicate updates block tree');
}

async function checkMediaAndMenus(page) {
  await page.goto(`${baseUrl}/admin/media`, { waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByRole('heading', { name: 'Thư viện Media' }), 'media library renders');
  await expectVisible(page.getByPlaceholder('https://... or /images/...'), 'media URL input renders');
  await expectVisible(page.getByRole('button', { name: 'Upload File' }), 'media upload control renders');

  await page.goto(`${baseUrl}/admin/navigation`, { waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByRole('heading', { name: 'Menu Builder' }), 'menu builder renders');
  await page.getByRole('button', { name: 'Thêm item' }).click();
  await expectVisible(page.getByText('Item 1'), 'menu item editor renders after adding item');
  await expectVisible(page.getByRole('button', { name: 'Indent' }).first(), 'menu nesting controls render');
}

async function checkResponsive(page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/admin`, { waitUntil: 'domcontentloaded' });
  await expectVisible(page.locator('.hlt-wp-admin-clone'), 'admin shell renders on mobile viewport');
  const topbarHeight = await page.locator('.hlt-wp-admin-clone > div').first().evaluate((node) => Number.parseFloat(window.getComputedStyle(node).height));
  assert(Number.isFinite(topbarHeight), 'Expected admin layout to be measurable on mobile viewport.');
  log('PASS admin shell remains measurable on mobile viewport');
}

async function main() {
  const browser = await chromium.launch({ headless });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  try {
    await login(page);
    await resetAdminStorage(page);
    await checkAdminBar(page);
    await checkNoticesAndScreenOptions(page);
    await checkSidebar(page);
    await checkListTable(page);
    await checkTourEditor(page);
    await checkDesignPanel(page);
    await checkBlocksPreview(page);
    await checkMediaAndMenus(page);
    await checkResponsive(page);
    assert(pageErrors.length === 0, `Browser page errors were raised: ${pageErrors.join('; ')}`);
    log('Admin UI smoke checks passed.');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
