import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PUBLIC_TRANSLATION_SMOKE_URL || 'http://localhost:3000';
const targetUrl = `${baseUrl.replace(/\/$/, '')}/vi/`;
const waitMs = Number(process.env.PUBLIC_TRANSLATION_WAIT_MS || 25000);

const forbiddenVisibleTexts = [
  'Private journeys, designed with quiet precision.',
  'Explore destinations',
  'Search Now',
  'Journey flow',
  'Private planning, made beautifully clear.',
  'Travel Journal',
  'FAQs'
];

const forbiddenAttributeFragments = [
  'Start planning your private trip',
  'Private journeys, designed with quiet precision.',
  'Explore Vietnam Tours',
  'Ha Long Bay limestone karsts and luxury cruise routes in northern Vietnam'
];

function collectVisibleEnglish(pageText) {
  const found = forbiddenVisibleTexts.filter((value) => pageText.includes(value));
  return found;
}

function collectForbiddenAttributes(values) {
  return values.filter((value) => forbiddenAttributeFragments.some((fragment) => value.includes(fragment)));
}

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage();
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(waitMs);

  const snapshot = await page.evaluate(() => {
    const texts = document.body.innerText;
    const attributes = [];
    const selector = [
      '[title]',
      '[aria-label]',
      '[placeholder]',
      'img[alt]',
      'meta[name="description"]',
      'meta[property="og:title"]',
      'meta[property="og:description"]',
      'meta[name="twitter:title"]',
      'meta[name="twitter:description"]'
    ].join(',');

    document.querySelectorAll(selector).forEach((element) => {
      ['title', 'aria-label', 'placeholder', 'alt', 'content'].forEach((attribute) => {
        const value = element.getAttribute(attribute);
        if (value) attributes.push(`${element.tagName.toLowerCase()}:${attribute}:${value}`);
      });
    });

    return {
      title: document.title,
      text: texts,
      attributes
    };
  });

  const visibleEnglish = collectVisibleEnglish(snapshot.text);
  const forbiddenAttributes = collectForbiddenAttributes(snapshot.attributes);

  assert.equal(visibleEnglish.length, 0, `Visible English still present on ${targetUrl}: ${visibleEnglish.join(' | ')}`);
  assert.equal(forbiddenAttributes.length, 0, `Untranslated attributes still present on ${targetUrl}: ${forbiddenAttributes.join(' | ')}`);
  assert.ok(!snapshot.title.includes('Ha Long Luxury Travel'), `Browser title still English: ${snapshot.title}`);

  console.log(`public auto translation smoke passed for ${targetUrl}`);
} finally {
  await browser.close();
}
