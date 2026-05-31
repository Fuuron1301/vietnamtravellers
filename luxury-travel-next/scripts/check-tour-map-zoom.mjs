#!/usr/bin/env node

const baseUrl = process.env.SMOKE_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const cases = [
  {
    path: '/vietnam-tours/a-glimpse-of-sapa-2-days',
    label: 'Sapa tour',
    expected: '22.3364,103.8431'
  },
  {
    path: '/vietnam-tours/luxury-vietnam-tour-10-days',
    label: 'Luxury Vietnam tour',
    expected: '21.027764,105.83416'
  }
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function decodeHtmlAttribute(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function extractIframeSrc(html) {
  const match = html.match(/<iframe[^>]+src="([^"]+)"/i);
  return match ? decodeHtmlAttribute(match[1]) : '';
}

async function checkRoute(route) {
  const response = await fetch(new URL(route.path, baseUrl));
  const html = await response.text();
  const iframeSrc = extractIframeSrc(html);
  const url = iframeSrc ? new URL(iframeSrc) : null;

  assert(response.status === 200, `${route.path} returned ${response.status}.`);
  assert(iframeSrc, `${route.path} does not render an iframe.`);
  assert(url?.searchParams.get('ll') === route.expected, `${route.path} missing zoomed map center ${route.expected}.`);
  assert(url?.searchParams.get('z') === '12', `${route.path} missing zoom level 12.`);
  assert(!iframeSrc.includes('Southeast Asia'), `${route.path} still uses broad SEA map.`);
  console.log(`PASS ${route.label}: zoomed map center found.`);
}

for (const route of cases) {
  await checkRoute(route);
}

console.log('PASS tour map zoom smoke.');
