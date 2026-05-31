const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const adminLogin = process.env.ADMIN_SMOKE_LOGIN || 'admin@example.com';
const adminPassword = process.env.ADMIN_SMOKE_PASSWORD || 'change-me-before-production';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function log(message) {
  console.log(`[design-sync] ${message}`);
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
  const before = await requestJson('/api/admin/design', {}, auth);
  assert(before.response.status === 200, `GET design expected 200, got ${before.response.status}`);
  const previousActive = before.payload?.data?.active;
  const baseTokens = previousActive?.tokens;
  assert(baseTokens, 'Active design preset tokens are required for this smoke.');

  const tokens = {
    ...baseTokens,
    typography: {
      ...baseTokens.typography,
      headingFont: '"Playfair Display", "Cormorant Garamond", Georgia, serif',
      bodyFont: 'Manrope, Inter, Aptos, sans-serif'
    },
    componentStyles: {
      ...(baseTokens.componentStyles || {}),
      buttons: { background: `#${String(stamp).slice(-6).padStart(6, '0')}`, color: '#fffaf0', radius: '777px', padding: '13px 21px', shadow: '0 9px 19px rgba(11,27,43,0.21)' },
      cards: { background: '#fffaf0', radius: '31px', padding: '29px', shadow: '0 18px 42px rgba(11,27,43,0.17)' },
      forms: { background: '#ffffff', radius: '18px', border: '1px solid #ded3bc' },
      tables: { headerBackground: '#f8f5ef', border: '1px solid #ded3bc' },
      navigation: { linkColor: '#0b1b2b', activeColor: '#c8a96a' },
      sections: { background: '#f8f5ef', paddingY: '101px' }
    },
    responsive: {
      desktop: { sectionY: '111px', container: '1180px' },
      tablet: { sectionY: '77px', container: '720px' },
      mobile: { sectionY: '49px', container: '360px' }
    }
  };

  let createdId = '';
  try {
    const created = await requestJson('/api/admin/design', {
      method: 'POST',
      body: {
        name: `Parity Design ${stamp}`,
        slug: `parity-design-${stamp}`,
        tokens,
        status: 'ACTIVE'
      }
    }, auth);
    assert(created.response.status === 201, `Create active design expected 201, got ${created.response.status}: ${JSON.stringify(created.payload)}`);
    createdId = created.payload?.data?.item?.id;
    assert(createdId, 'Created design preset id is missing.');

    const after = await requestJson('/api/admin/design', {}, auth);
    assert(after.response.status === 200, `GET updated design expected 200, got ${after.response.status}`);
    const activeTokens = after.payload?.data?.active?.tokens;
    assert(activeTokens?.componentStyles?.buttons?.radius === '777px', 'Component button radius was not preserved in DesignPreset tokens.');
    assert(activeTokens?.responsive?.mobile?.sectionY === '49px', 'Responsive mobile sectionY was not preserved in DesignPreset tokens.');
    assert(String(activeTokens?.typography?.headingFont || '').includes('Playfair Display'), 'Heading font token must preserve Playfair Display.');
    assert(String(activeTokens?.typography?.bodyFont || '').includes('Manrope'), 'Body font token must preserve Manrope.');
    log('PASS component and responsive tokens persist in DesignPreset API');

    const homepage = await fetch(`${baseUrl}/?design-sync=${stamp}`, { headers: { 'cache-control': 'no-cache' } });
    const html = await homepage.text();
    assert(homepage.status === 200, `Homepage expected 200, got ${homepage.status}`);
    assert(html.includes('--cms-button-radius:777px') || html.includes('--cms-button-radius:777px'), 'Frontend did not expose --cms-button-radius from active preset.');
    assert(html.includes('--cms-responsive-mobile-section-y:49px'), 'Frontend did not expose --cms-responsive-mobile-section-y from active preset.');
    log('PASS frontend runtime exposes component/responsive CSS variables');
  } finally {
    if (previousActive?.id) {
      await requestJson('/api/admin/design', {
        method: 'PATCH',
        body: { id: previousActive.id, action: 'activate' }
      }, auth).catch(() => undefined);
    }
    if (createdId) {
      await requestJson('/api/admin/design', {
        method: 'DELETE',
        body: { id: createdId }
      }, auth).catch(() => undefined);
    }
    await requestJson('/api/admin/auth/logout', { method: 'POST' }, auth).catch(() => undefined);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
