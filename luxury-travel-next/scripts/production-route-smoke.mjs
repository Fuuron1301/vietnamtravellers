#!/usr/bin/env node
const baseUrl = process.env.SMOKE_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const routes = [
  ['home', '/'],
  ['vietnam hub', '/vietnam-tours'],
  ['laos hub', '/laos-tours'],
  ['cambodia hub', '/cambodia-tours'],
  ['thailand hub', '/thailand-tours'],
  ['myanmar hub', '/myanmar-tours'],
  ['indonesia hub', '/indonesia-tours'],
  ['malaysia hub', '/malaysia-tours'],
  ['singapore hub', '/singapore-tours'],
  ['philippines hub', '/philippines-tours'],
  ['china hub', '/china-tours'],
  ['hong kong hub', '/hong-kong-tours'],
  ['japan hub', '/japan-tours'],
  ['south korea hub', '/south-korea-tours'],
  ['bhutan hub', '/bhutan-tours'],
  ['nepal hub', '/nepal-tours'],
  ['india hub', '/india-tours'],
  ['sri lanka hub', '/sri-lanka-tours'],
  ['multi-country hub', '/multi-country-tours'],
  ['why travel with us', '/why-travel-with-us'],
  ['planning flow', '/planning-flow'],
  ['travel journal', '/travel-journal'],
  ['guest memory', '/guest-memory'],
  ['tour detail', '/vietnam-tours/luxury-vietnam-tour-10-days'],
  ['blog detail', '/blog/best-time-to-visit-vietnam'],
  ['cruise detail', '/cruise/ha-long-bay-luxury-cruise'],
  ['travel style', '/travel-styles/luxury'],
  ['cruises', '/cruises'],
  ['contact', '/contact'],
  ['customize', '/customize-your-trip']
];

async function check(path) {
  const response = await fetch(new URL(path, baseUrl), { redirect: 'manual' });
  const text = await response.text();
  const hasFallback404 = text.includes('NEXT_HTTP_ERROR_FALLBACK;404');
  return { status: response.status, ok: response.status === 200 && !hasFallback404, hasFallback404 };
}

const results = [];
for (const [name, path] of routes) {
  try {
    const result = await check(path);
    results.push({ name, path, ...result });
  } catch (error) {
    results.push({ name, path, status: 'ERROR', ok: false, error: error instanceof Error ? error.message : String(error) });
  }
}

console.log('PRODUCTION ROUTE SMOKE TEST');
for (const row of results) {
  console.log(`${row.ok ? 'PASS' : 'FAIL'} ${row.name} ${row.path} -> ${row.status}${row.hasFallback404 ? ' (fallback 404 marker)' : ''}${row.error ? ` (${row.error})` : ''}`);
}

const failed = results.filter((row) => !row.ok);
if (failed.length) {
  console.error(`Route smoke failed: ${failed.length}/${results.length}`);
  process.exit(1);
}

console.log(`Route smoke passed: ${results.length}/${results.length}`);
