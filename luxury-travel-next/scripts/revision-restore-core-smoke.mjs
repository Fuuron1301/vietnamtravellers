const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const adminLogin = process.env.ADMIN_SMOKE_LOGIN || 'admin@example.com';
const adminPassword = process.env.ADMIN_SMOKE_PASSWORD || 'change-me-before-production';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function log(message) {
  console.log(`[revision-core] ${message}`);
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

async function login() {
  const result = await requestJson('/api/admin/auth/login', {
    method: 'POST',
    body: { login: adminLogin, password: adminPassword }
  });
  assert(result.response.status === 200, `Admin login expected 200, got ${result.response.status}`);
  return { cookieHeader: cookieHeaderFrom(result.response), csrfToken: result.payload?.data?.csrfToken };
}

async function main() {
  const stamp = Date.now();
  const auth = await login();
  let postId = '';

  try {
    const created = await requestJson('/api/admin/posts', {
      method: 'POST',
      body: {
        title: `Revision Restore Original ${stamp}`,
        slug: `revision-restore-original-${stamp}`,
        excerpt: 'Original revision excerpt',
        content: 'Original revision content',
        seoTitle: `Revision Restore Original ${stamp}`,
        seoDescription: 'Original revision SEO',
        status: 'DRAFT'
      }
    }, auth);
    assert(created.response.status === 201, `Create post expected 201, got ${created.response.status}: ${JSON.stringify(created.payload)}`);
    postId = created.payload.data.item.id;

    const updated = await requestJson('/api/admin/posts', {
      method: 'PATCH',
      body: {
        id: postId,
        title: `Revision Restore Updated ${stamp}`,
        slug: `revision-restore-updated-${stamp}`,
        excerpt: 'Updated revision excerpt',
        content: 'Updated revision content',
        seoTitle: `Revision Restore Updated ${stamp}`,
        seoDescription: 'Updated revision SEO',
        status: 'DRAFT'
      }
    }, auth);
    assert(updated.response.status === 200, `Update post expected 200, got ${updated.response.status}: ${JSON.stringify(updated.payload)}`);

    const beforeRestore = await requestJson(`/api/admin/revisions?postId=${encodeURIComponent(postId)}`, {}, auth);
    assert(beforeRestore.response.status === 200, `List revisions expected 200, got ${beforeRestore.response.status}`);
    const revisions = beforeRestore.payload?.data?.items || [];
    assert(revisions.length >= 1, 'Expected at least one revision after updating a post.');
    const revisionId = revisions[0].id;

    const restored = await requestJson('/api/admin/revisions', {
      method: 'POST',
      body: { revisionId }
    }, auth);
    assert(restored.response.status === 200, `Restore revision expected 200, got ${restored.response.status}: ${JSON.stringify(restored.payload)}`);

    const afterRestore = await requestJson(`/api/admin/revisions?postId=${encodeURIComponent(postId)}`, {}, auth);
    assert(afterRestore.response.status === 200, `List revisions after restore expected 200, got ${afterRestore.response.status}`);
    const afterItems = afterRestore.payload?.data?.items || [];
    assert(afterItems.length === revisions.length + 1, `Restore should create a new revision snapshot; expected ${revisions.length + 1}, got ${afterItems.length}.`);

    const postLookup = await requestJson(`/api/admin/posts?search=${encodeURIComponent(`Revision Restore Original ${stamp}`)}`, {}, auth);
    assert(postLookup.response.status === 200, `Post lookup expected 200, got ${postLookup.response.status}`);
    assert((postLookup.payload?.data?.items || []).some((item) => item.id === postId && item.title === `Revision Restore Original ${stamp}`), 'Restored post should match the original revision title.');
    log('PASS restore creates a new revision and restores original snapshot');
  } finally {
    if (postId) await requestJson('/api/admin/posts', { method: 'DELETE', body: { id: postId } }, auth).catch(() => undefined);
    await requestJson('/api/admin/auth/logout', { method: 'POST' }, auth).catch(() => undefined);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
