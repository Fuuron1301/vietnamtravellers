#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { Prisma, PrismaClient } from '@prisma/client';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

const routingSource = await fs.readFile(path.join(projectRoot, 'lib', 'routing.ts'), 'utf8');
const routingCode = ts.transpileModule(routingSource, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    esModuleInterop: true
  }
}).outputText;
const routingModule = { exports: {} };
new Function('exports', 'module', 'require', routingCode)(routingModule.exports, routingModule, require);
const { tourHubKey } = routingModule.exports;

const ROBOTS_URL = 'https://www.asiatours.com/robots.txt';
const SITEMAP_URL = 'https://www.asiatours.com/sitemap.xml';
const SOURCE_REFERENCE_URL = 'https://www.asiatours.com/blog/india/';
const OUTPUT_PATH = path.join(projectRoot, 'data', 'asiatours-public-tour-facts.json');
const META_OUTPUT_PATH = path.join(projectRoot, 'data', 'asiatours-public-tour-facts.meta.json');
const USER_AGENT = 'LuxuryTravelNextAsiaToursImporter/1.0 (local CMS mirror; public facts only)';
const REQUEST_DELAY_MS = Number.parseInt(process.env.ASIATOURS_IMPORT_DELAY_MS || '140', 10);
const MAX_RETRIES = Number.parseInt(process.env.ASIATOURS_IMPORT_RETRIES || '2', 10);
const CONCURRENCY = Math.max(1, Number.parseInt(process.env.ASIATOURS_IMPORT_CONCURRENCY || '4', 10));
const MAX_PER_DESTINATION = Math.max(0, Number.parseInt(process.env.ASIATOURS_MAX_PER_DESTINATION || '0', 10));
const MAX_PAGES_PER_DESTINATION = Math.max(1, Number.parseInt(process.env.ASIATOURS_MAX_PAGES_PER_DESTINATION || '16', 10));
const execute = process.argv.includes('--execute');
const skipDetails = process.argv.includes('--no-details');
const selectedDestinations = new Set(
  (process.env.ASIATOURS_DESTINATIONS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
);

const destinationSources = [
  { key: 'vietnam', label: 'Vietnam', url: 'https://www.asiatours.com/vietnam/tours/' },
  { key: 'cambodia', label: 'Cambodia', url: 'https://www.asiatours.com/cambodia/tours/' },
  { key: 'laos', label: 'Laos', url: 'https://www.asiatours.com/laos/tours/' },
  { key: 'myanmar', label: 'Myanmar', url: 'https://www.asiatours.com/myanmar/tours/' },
  { key: 'thailand', label: 'Thailand', url: 'https://www.asiatours.com/thailand/tours/' },
  { key: 'indonesia', label: 'Indonesia', url: 'https://www.asiatours.com/indonesia/tours/' },
  { key: 'malaysia', label: 'Malaysia', url: 'https://www.asiatours.com/malaysia/tours/' },
  { key: 'singapore', label: 'Singapore', url: 'https://www.asiatours.com/singapore/tours/' },
  { key: 'philippines', label: 'Philippines', url: 'https://www.asiatours.com/philippines/tours/' },
  { key: 'china', label: 'China', url: 'https://www.asiatours.com/china/tours/' },
  { key: 'hong-kong', label: 'Hong Kong', url: 'https://www.asiatours.com/hong-kong/tours/' },
  { key: 'japan', label: 'Japan', url: 'https://www.asiatours.com/japan/tours/' },
  { key: 'south-korea', label: 'South Korea', url: 'https://www.asiatours.com/south-korea/tours/' },
  { key: 'bhutan', label: 'Bhutan', url: 'https://www.asiatours.com/bhutan/tours/' },
  { key: 'nepal', label: 'Nepal', url: 'https://www.asiatours.com/nepal/tours/' },
  { key: 'india', label: 'India', url: 'https://www.asiatours.com/india/tours/' },
  { key: 'sri-lanka', label: 'Sri Lanka', url: 'https://www.asiatours.com/sri-lanka/tours/' }
].filter((item) => !selectedDestinations.size || selectedDestinations.has(item.key) || selectedDestinations.has(item.label.toLowerCase()));

let nextRequestAt = 0;

function log(message) {
  console.log(`[asiatours] ${message}`);
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&rsquo;|&lsquo;/gi, "'")
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&ndash;|&mdash;/gi, '-')
    .replace(/&rarr;|&#8594;/gi, ' -> ')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)));
}

function cleanText(value) {
  return decodeHtml(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 160) || `asiatours-${Date.now()}`;
}

function uniqueStrings(values) {
  const seen = new Set();
  return values
    .map((value) => cleanText(value))
    .filter((value) => value && !seen.has(value.toLowerCase()) && seen.add(value.toLowerCase()));
}

function numberFromText(value) {
  const match = cleanText(value).replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function splitRoute(value) {
  return uniqueStrings(cleanText(value).split(/\s*(?:->|\u2192|,|\/)\s*/g)).filter((item) => item.length > 1);
}

function normalizeUrl(value) {
  try {
    const url = new URL(value);
    url.hash = '';
    url.search = '';
    return url.toString();
  } catch {
    return cleanText(value);
  }
}

function sourceSlug(sourceUrl) {
  const last = new URL(sourceUrl).pathname.split('/').filter(Boolean).pop() || '';
  return slugify(last.replace(/\.html$/i, ''));
}

function routePreview(places) {
  if (!places.length) return 'signature Asia destinations';
  return places.slice(0, 5).join(', ') + (places.length > 5 ? ' and more' : '');
}

function countryLabelFromKey(value) {
  return cleanText(value)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function generatedExcerpt(fact) {
  const duration = fact.duration || `${fact.days || 'Flexible'} days`;
  const price = fact.priceUsd ? ` with source budget guidance from USD ${fact.priceUsd.toLocaleString('en-US')} per person` : '';
  return `${duration} private ${fact.countryLabel} itinerary through ${routePreview(fact.places)}${price}.`;
}

function generatedContent(fact) {
  const duration = fact.duration || `${fact.days || 'Flexible'} days`;
  const price = fact.priceUsd ? ` Source budget guidance starts from USD ${fact.priceUsd.toLocaleString('en-US')} per person.` : '';
  const handpicked = fact.handpicked?.length ? ` The source lists ${fact.handpicked.slice(0, 4).join(', ').toLowerCase()} as service cues.` : '';
  return `${fact.title} is a private tailor-made ${fact.countryLabel} journey shaped around ${duration} and the route ${routePreview(fact.places)}.${price}${handpicked} This CMS record keeps public factual fields from AsiaTours, while the visible copy is generated locally so admin can edit, localize and publish safely.`;
}

function generatedHighlights(fact) {
  const places = fact.places.length ? fact.places : [fact.countryLabel];
  return [
    `Private route through ${routePreview(places)}`,
    fact.duration || `${fact.days || 'Flexible'} day itinerary`,
    fact.priceUsd ? `Budget reference from USD ${fact.priceUsd.toLocaleString('en-US')} per person` : 'Tailor-made budget after enquiry'
  ];
}

function normalizeFact(card, detail = {}) {
  const places = uniqueStrings([...(detail.places || []), ...(card.places || [])]);
  const days = detail.days || card.days || 0;
  const duration = days ? `${days} days` : card.duration || '';
  const priceUsd = card.priceUsd || detail.priceUsd || 0;
  const title = detail.title || card.title;
  const slug = `asiatours-${sourceSlug(card.sourceUrl)}`;
  const route = places.join(' -> ');
  const handpicked = card.handpicked || [];
  const country = tourHubKey({
    id: slug,
    type: 'hlt_tour',
    title,
    slug,
    excerpt: card.excerpt || '',
    content: '',
    featuredImage: detail.featuredImage || card.featuredImage || '',
    meta: {
      details: {
        country: card.countryKey,
        sourceUrl: card.sourceUrl,
        route,
        places,
        highlights: []
      }
    }
  });
  const countryLabel = countryLabelFromKey(country);
  const fact = {
    id: slug,
    type: 'hlt_tour',
    title,
    slug,
    sourceName: 'AsiaTours public listing',
    sourceUrl: card.sourceUrl,
    sourceReferenceUrl: SOURCE_REFERENCE_URL,
    sourceCollectionUrl: card.sourceCollectionUrl,
    sourceDestinationKey: card.countryKey,
    country,
    countryLabel,
    days,
    duration,
    priceUsd,
    currency: 'USD',
    route,
    places,
    handpicked,
    destinationCount: detail.destinationCount || places.length,
    countryCount: country === 'multi-country' ? Math.max(2, detail.countryCount || 0) : 1,
    featuredImage: detail.featuredImage || card.featuredImage || '',
    gallery: uniqueStrings([detail.featuredImage || card.featuredImage || '', ...(detail.gallery || [])]).slice(0, 8),
    itinerary: detail.itinerary?.length
      ? detail.itinerary
      : places.slice(0, Math.min(days || places.length, places.length)).map((place, index) => ({
        day: `Day ${index + 1}`,
        title: place,
        body: `Route stop captured from AsiaTours public map facts.`
      })),
    sourceFacts: {
      title,
      duration,
      priceUsd,
      route,
      places,
      sourceUrl: card.sourceUrl
    }
  };
  fact.excerpt = generatedExcerpt(fact);
  fact.content = generatedContent(fact);
  fact.highlights = generatedHighlights(fact);
  return fact;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForFetchSlot() {
  if (!REQUEST_DELAY_MS) return;
  const slotAt = Math.max(Date.now(), nextRequestAt);
  nextRequestAt = slotAt + REQUEST_DELAY_MS;
  const waitMs = slotAt - Date.now();
  if (waitMs > 0) await sleep(waitMs);
}

async function fetchText(url) {
  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    await waitForFetchSlot();
    try {
      const response = await fetch(url, { headers: { 'user-agent': USER_AGENT } });
      if (response.ok) return response.text();
      lastError = new Error(`HTTP ${response.status}`);
      if (![408, 429, 500, 502, 503, 504].includes(response.status)) throw lastError;
    } catch (error) {
      lastError = error;
      if (attempt === MAX_RETRIES) break;
    }
    await sleep(400 * (attempt + 1));
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function robotsAllows(robotsText, targetUrl) {
  const targetPath = new URL(targetUrl).pathname || '/';
  const rules = [];
  let active = false;

  for (const rawLine of robotsText.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, '').trim();
    if (!line) continue;
    const [rawKey, ...rawValue] = line.split(':');
    const key = rawKey.trim().toLowerCase();
    const value = rawValue.join(':').trim();
    if (key === 'user-agent') {
      active = value === '*' || value.toLowerCase().includes('luxurytravelnextasiatoursimporter');
      continue;
    }
    if (!active || (key !== 'allow' && key !== 'disallow')) continue;
    if (key === 'disallow' && !value) continue;
    rules.push({ type: key, path: value || '/' });
  }

  const matching = rules
    .filter((rule) => targetPath.startsWith(rule.path))
    .sort((a, b) => b.path.length - a.path.length);
  if (!matching.length) return true;
  return matching[0].type === 'allow';
}

async function assertRobotsAllowsImport() {
  const robots = await fetchText(ROBOTS_URL);
  const targets = [SITEMAP_URL, SOURCE_REFERENCE_URL, ...destinationSources.map((item) => item.url)];
  for (const target of targets) {
    if (!robotsAllows(robots, target)) throw new Error(`robots.txt does not allow import target: ${target}`);
  }
}

function extractSharedCardData(block, destination, sourceCollectionUrl) {
  const sourceUrl = normalizeUrl(block.match(/href="(https:\/\/www\.asiatours\.com\/tours\/[^\"]+\.html)"/i)?.[1] || '');
  if (!sourceUrl) return null;

  const title = cleanText(
    block.match(/<h[12][^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>\s*<\/h[12]>/i)?.[1] ||
    block.match(/<a[^>]*title="([^"]+)"[^>]*>\s*<img/i)?.[1] ||
    block.match(/title="([^"]+)"/i)?.[1] ||
    ''
  );
  if (!title) return null;

  const imageMatch = block.match(/data-img="([^"]+)"/i) || block.match(/<img[^>]+src="([^"]+)"/i);
  const featuredImage = cleanText(imageMatch?.[1] || '').replace(/^#$/, '');
  const dayText = cleanText(
    block.match(/<div class="count-day">([\s\S]*?)<\/div>/i)?.[1] ||
    block.match(/<div class="day-trip">[\s\S]*?<span>\s*<b>\s*([^<]+?)\s*<\/b>\s*(?:Days?|Day)?\s*<\/span>/i)?.[1] ||
    block.match(/<div class="content-trip">[\s\S]*?<span>\s*([^<]+?)\s*<\/span>/i)?.[1] ||
    ''
  );
  const dayMatch = dayText.match(/(\d+)\s*days?/i) || dayText.match(/(\d+)/);
  const days = dayMatch ? Number.parseInt(dayMatch[1], 10) : 0;
  const addressHtml = block.match(/<address[^>]*class="address"[^>]*>([\s\S]*?)<\/address>/i)?.[1] || '';
  const routeHtml = block.match(/<div class="wrap-tooltip-itine">[\s\S]*?<span>([\s\S]*?)<\/span>/i)?.[1] || '';
  const route = cleanText(addressHtml || routeHtml);
  const places = splitRoute(route);
  const priceUsd = numberFromText(block.match(/Only\s+from[\s\S]*?<strong>\s*\$?([\d,.]+)/i)?.[1] || '');
  const handpicked = uniqueStrings([
    ...[...block.matchAll(/tooltip-handpick[\s\S]*?<span>\s*([^<]+?)\s*<\/span>/gi)].map((match) => match[1]),
    ...[...block.matchAll(/<div class="wrap-tooltip">[\s\S]*?<span>\s*([^<]+?)<i>/gi)].map((match) => match[1])
  ]);
  const excerpt =
    cleanText(block.match(/<div class="body-box">[\s\S]*?<p class="paragraph">([\s\S]*?)<\/p>/i)?.[1] || '') ||
    cleanText(block.match(/<div class="content-trip">[\s\S]*?<p class="paragraph">([\s\S]*?)<\/p>/i)?.[1] || '');

  return {
    title,
    sourceUrl,
    sourceCollectionUrl,
    countryKey: destination.key,
    countryLabel: destination.label,
    days,
    duration: days ? `${days} days` : '',
    places,
    route,
    priceUsd,
    featuredImage,
    handpicked,
    excerpt
  };
}

function extractFeaturedTourCards(html, destination, sourceCollectionUrl) {
  const blocks = html.split('<div class="big-first-tour-box">').slice(1).map((part) => `<div class="big-first-tour-box">${part}`);
  const cards = [];
  for (const block of blocks) {
    const card = extractSharedCardData(block, destination, sourceCollectionUrl);
    if (card) cards.push(card);
  }
  return MAX_PER_DESTINATION ? cards.slice(0, MAX_PER_DESTINATION) : cards;
}

function extractTourArticleCards(html, destination, sourceCollectionUrl) {
  const blocks = html.match(/<article[^>]*class="[^"]*trip-itine[^"]*"[\s\S]*?<\/article>/gi) || [];
  const cards = [];
  for (const block of blocks) {
    const card = extractSharedCardData(block, destination, sourceCollectionUrl);
    if (card) cards.push(card);
  }
  return MAX_PER_DESTINATION ? cards.slice(0, MAX_PER_DESTINATION) : cards;
}

function extractTourCards(html, destination, sourceCollectionUrl) {
  return [...extractFeaturedTourCards(html, destination, sourceCollectionUrl), ...extractTourArticleCards(html, destination, sourceCollectionUrl)];
}

function discoverDestinationPages(html, destination) {
  const prefix = destination.url.replace(/\/+$/, '/');
  const discovered = new Set();
  for (const match of html.matchAll(/href="(https:\/\/www\.asiatours\.com\/[^"]+)"/gi)) {
    const url = normalizeUrl(match[1]);
    if (!url.startsWith(prefix)) continue;
    if (url.endsWith('/search.html')) continue;
    if (/\.html$/i.test(url)) continue;
    discovered.add(url.endsWith('/') ? url : `${url}/`);
  }
  return Array.from(discovered);
}

function extractDetailFacts(html, sourceUrl) {
  const title = cleanText(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '');
  const featuredImage = cleanText(html.match(/<div class="bg-detail"[\s\S]*?<img[^>]+src="([^"]+)"/i)?.[1] || '');
  const summaryBlock = html.match(/<div class="summary-tour">([\s\S]*?)<\/div>\s*<div class="wrap-push-down">/i)?.[1] || '';
  const summaryPairs = {};
  for (const match of summaryBlock.matchAll(/<font>\s*([^<]+?)\s*<\/font>\s*<b>\s*([^<]+?)\s*<\/b>/gi)) {
    summaryPairs[cleanText(match[1]).toLowerCase()] = numberFromText(match[2]);
  }
  const locationStart = html.indexOf('<div class="location-list">');
  const locationEnd = locationStart >= 0 ? html.indexOf('<div class="wrap-slide-st4"', locationStart) : -1;
  const locationBlock = locationStart >= 0 && locationEnd > locationStart ? html.slice(locationStart, locationEnd) : '';
  const places = uniqueStrings([
    ...[...locationBlock.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)].map((match) => match[1]),
    ...[...locationBlock.matchAll(/<h3[^>]*class="line"[^>]*>([\s\S]*?)<\/h3>/gi)].map((match) => match[1])
  ]);
  const itineraryStart = html.indexOf('<div class="left-daybyday"');
  const itineraryEnd = itineraryStart >= 0 ? html.indexOf('</ul>', itineraryStart) : -1;
  const itineraryBlock = itineraryStart >= 0 && itineraryEnd > itineraryStart ? html.slice(itineraryStart, itineraryEnd) : '';
  const itinerary = [...itineraryBlock.matchAll(/<span>\s*<b>\s*(Day\s*\d+)\s*<\/b>\s*:?\s*([\s\S]*?)<\/span>/gi)]
    .map((match) => ({
      day: cleanText(match[1]).replace(/\s+/g, ' '),
      title: cleanText(match[2]).replace(/\s*,\s*/g, ' -> '),
      body: 'Route stop captured from AsiaTours public itinerary map facts.'
    }))
    .filter((item) => item.day && item.title);
  const gallery = uniqueStrings(
    [...html.matchAll(/(?:data-img|src)="(https:\/\/d2lwt6tidfiof0\.cloudfront\.net\/(?:uploads\/photo-tour|images\/destination)\/[^"]+)"/gi)]
      .map((match) => match[1])
      .filter((url) => !/logo|favicon|icon|wrap-img/i.test(url))
  );
  return {
    sourceUrl,
    title,
    featuredImage,
    days: summaryPairs.days || 0,
    countryCount: summaryPairs.country || 0,
    destinationCount: summaryPairs.destinations || 0,
    places,
    itinerary,
    gallery
  };
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function collectFacts() {
  await assertRobotsAllowsImport();
  const destinationResults = [];
  for (const destination of destinationSources) {
    const visitedPages = new Set();
    const pageQueue = [destination.url];
    let pageCount = 0;
    let cardCount = 0;

    while (pageQueue.length && pageCount < MAX_PAGES_PER_DESTINATION) {
      const pageUrl = pageQueue.shift();
      if (!pageUrl || visitedPages.has(pageUrl)) continue;
      visitedPages.add(pageUrl);
      pageCount += 1;
      log(`fetch ${destination.key} page ${pageCount}: ${pageUrl}`);

      const html = await fetchText(pageUrl);
      const cards = extractTourCards(html, destination, pageUrl);

      for (const card of cards) {
        const existing = cardMap.get(card.sourceUrl);
        if (existing) {
          existing.sourceDestinations.push({ key: destination.key, label: destination.label, url: pageUrl });
        } else {
          cardMap.set(card.sourceUrl, { ...card, sourceDestinations: [{ key: destination.key, label: destination.label, url: pageUrl }] });
          cardCount += 1;
        }
      }

      for (const discoveredPageUrl of discoverDestinationPages(html, destination)) {
        if (!visitedPages.has(discoveredPageUrl)) pageQueue.push(discoveredPageUrl);
      }
    }

    destinationResults.push({ ...destination, count: cardCount, pageCount });
    log(`${destination.key}: ${cardCount} tour cards across ${pageCount} pages`);
  }

  const cards = Array.from(cardMap.values());
  const detailsByUrl = new Map();
  if (!skipDetails) {
    await mapLimit(cards, CONCURRENCY, async (card, index) => {
      log(`fetch detail ${index + 1}/${cards.length}: ${card.sourceUrl}`);
      const html = await fetchText(card.sourceUrl);
      detailsByUrl.set(card.sourceUrl, extractDetailFacts(html, card.sourceUrl));
    });
  }
  const facts = cards.map((card) => normalizeFact(card, detailsByUrl.get(card.sourceUrl) || {}));
  return { facts, destinationResults };
}

const cardMap = new Map();

function toJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertLocalDatabase() {
  const databaseUrl = process.env.DATABASE_URL || '';
  if (!databaseUrl) throw new Error('DATABASE_URL is required for --execute.');
  const host = new URL(databaseUrl).hostname;
  if (!['localhost', '127.0.0.1'].includes(host) && process.env.ALLOW_REMOTE_DB_IMPORT !== 'true') {
    throw new Error(`Refusing to import into non-local database host "${host}". Set ALLOW_REMOTE_DB_IMPORT=true only when intentional.`);
  }
}

async function ensureAdmin(prisma) {
  const admin = await prisma.user.findFirst({
    where: { role: { key: 'ADMINISTRATOR' } },
    include: { role: true },
    orderBy: { createdAt: 'asc' }
  });
  if (!admin) throw new Error('No administrator user found. Run `npm run cms:seed` first.');
  return admin;
}

async function ensureMediaByUrl(prisma, url, adminId, cache, altText = '', caption = '', description = '') {
  if (!url) return null;
  if (cache.has(url)) return cache.get(url);
  const existing = await prisma.media.findUnique({ where: { url } });
  if (existing) {
    cache.set(url, existing.id);
    return existing.id;
  }
  const fileName = decodeURIComponent(url.split(/[?#]/)[0].split('/').filter(Boolean).pop() || `asiatours-media-${Date.now()}`);
  const mimeType = /\.(png)$/i.test(fileName)
    ? 'image/png'
    : /\.(webp)$/i.test(fileName)
      ? 'image/webp'
      : /\.(gif)$/i.test(fileName)
        ? 'image/gif'
        : 'image/jpeg';
  const media = await prisma.media.create({
    data: {
      fileName,
      originalName: fileName,
      mimeType,
      kind: mimeType.startsWith('image/') ? 'IMAGE' : 'OTHER',
      url,
      size: 0,
      altText,
      caption,
      description,
      authorId: adminId
    }
  });
  await prisma.mediaMeta.upsert({
    where: { mediaId_key: { mediaId: media.id, key: '_mirror_media_source' } },
    update: { value: toJson({ sourceName: 'AsiaTours public listing', sourceUrl: url }) },
    create: { mediaId: media.id, key: '_mirror_media_source', value: toJson({ sourceName: 'AsiaTours public listing', sourceUrl: url }) }
  });
  cache.set(url, media.id);
  return media.id;
}

async function ensureCategory(prisma, name, cache) {
  const slug = slugify(name);
  if (cache.has(slug)) return cache.get(slug);
  const item = await prisma.category.upsert({
    where: { slug },
    update: { name, description: `${name} source-backed tour category.` },
    create: { name, slug, description: `${name} source-backed tour category.` }
  });
  await prisma.categoryMeta.upsert({
    where: { categoryId_key: { categoryId: item.id, key: '_mirror_taxonomy_source' } },
    update: { value: toJson({ sourceName: 'AsiaTours public listing', sourceReferenceUrl: SOURCE_REFERENCE_URL }) },
    create: { categoryId: item.id, key: '_mirror_taxonomy_source', value: toJson({ sourceName: 'AsiaTours public listing', sourceReferenceUrl: SOURCE_REFERENCE_URL }) }
  });
  cache.set(slug, item.id);
  return item.id;
}

async function ensureTag(prisma, name, cache) {
  const slug = slugify(name);
  if (cache.has(slug)) return cache.get(slug);
  const item = await prisma.tag.upsert({
    where: { slug },
    update: { name, description: `${name} tour tag.` },
    create: { name, slug, description: `${name} tour tag.` }
  });
  await prisma.tagMeta.upsert({
    where: { tagId_key: { tagId: item.id, key: '_mirror_taxonomy_source' } },
    update: { value: toJson({ sourceName: 'AsiaTours public listing', sourceReferenceUrl: SOURCE_REFERENCE_URL }) },
    create: { tagId: item.id, key: '_mirror_taxonomy_source', value: toJson({ sourceName: 'AsiaTours public listing', sourceReferenceUrl: SOURCE_REFERENCE_URL }) }
  });
  cache.set(slug, item.id);
  return item.id;
}

async function upsertPostMeta(prisma, postId, key, value) {
  await prisma.postMeta.upsert({
    where: { postId_key: { postId, key } },
    update: { value: toJson(value) },
    create: { postId, key, value: toJson(value) }
  });
}

async function importFactsToDb(facts) {
  assertLocalDatabase();
  const prisma = new PrismaClient();
  const mediaCache = new Map();
  const categoryCache = new Map();
  const tagCache = new Map();
  const stats = { created: 0, updated: 0, media: 0, skipped: 0 };
  try {
    const admin = await ensureAdmin(prisma);
    for (const fact of facts) {
      const featuredImageId = await ensureMediaByUrl(prisma, fact.featuredImage, admin.id, mediaCache, fact.title, fact.countryLabel, fact.excerpt);
      if (featuredImageId) stats.media += 1;
      const categoryId = await ensureCategory(prisma, fact.countryLabel, categoryCache);
      const tagNames = uniqueStrings(['AsiaTours', 'Private Tour', 'Tailor-Made', fact.countryLabel, ...fact.highlights.slice(0, 2)]);
      const tagIds = [];
      for (const tagName of tagNames) tagIds.push(await ensureTag(prisma, tagName, tagCache));
      const existing = await prisma.post.findUnique({ where: { postType_slug: { postType: 'TOUR', slug: fact.slug } } });
      const post = await prisma.post.upsert({
        where: { postType_slug: { postType: 'TOUR', slug: fact.slug } },
        update: {
          status: 'PUBLISHED',
          title: fact.title,
          excerpt: fact.excerpt,
          content: fact.content,
          seoTitle: `${fact.title} | Private ${fact.countryLabel} Tour`,
          seoDescription: fact.excerpt,
          featuredImageId: featuredImageId || undefined,
          publishedAt: new Date(),
          trashedAt: null
        },
        create: {
          postType: 'TOUR',
          status: 'PUBLISHED',
          title: fact.title,
          slug: fact.slug,
          excerpt: fact.excerpt,
          content: fact.content,
          seoTitle: `${fact.title} | Private ${fact.countryLabel} Tour`,
          seoDescription: fact.excerpt,
          authorId: admin.id,
          featuredImageId: featuredImageId || undefined,
          publishedAt: new Date()
        }
      });
      await prisma.postCategory.deleteMany({ where: { postId: post.id } });
      await prisma.postCategory.create({ data: { postId: post.id, categoryId } });
      await prisma.postTag.deleteMany({ where: { postId: post.id } });
      if (tagIds.length) await prisma.postTag.createMany({ data: tagIds.map((tagId) => ({ postId: post.id, tagId })) });
      await prisma.postMedia.deleteMany({ where: { postId: post.id } });
      const galleryIds = [];
      for (const [index, imageUrl] of fact.gallery.entries()) {
        const mediaId = await ensureMediaByUrl(prisma, imageUrl, admin.id, mediaCache, `${fact.title} image ${index + 1}`, fact.title, fact.excerpt);
        if (mediaId) galleryIds.push(mediaId);
      }
      if (galleryIds.length) {
        await prisma.postMedia.createMany({
          data: galleryIds.map((mediaId, index) => ({ postId: post.id, mediaId, role: 'gallery', sortOrder: index })),
          skipDuplicates: true
        });
      }
      await prisma.tourMeta.upsert({
        where: { postId: post.id },
        update: {
          basePrice: fact.priceUsd ? new Prisma.Decimal(String(fact.priceUsd)) : null,
          currency: fact.currency,
          duration: fact.duration,
          availability: 'available',
          gallery: toJson(fact.gallery),
          itinerary: toJson(fact.itinerary)
        },
        create: {
          postId: post.id,
          basePrice: fact.priceUsd ? new Prisma.Decimal(String(fact.priceUsd)) : null,
          currency: fact.currency,
          duration: fact.duration,
          availability: 'available',
          gallery: toJson(fact.gallery),
          itinerary: toJson(fact.itinerary)
        }
      });
      await upsertPostMeta(prisma, post.id, '_mirror_source', fact.sourceUrl);
      await upsertPostMeta(prisma, post.id, '_mirror_source_type', 'asiatours_public_facts');
      await upsertPostMeta(prisma, post.id, '_mirror_source_collection', fact.sourceCollectionUrl);
      await upsertPostMeta(prisma, post.id, '_mirror_source_slug', sourceSlug(fact.sourceUrl));
      await upsertPostMeta(prisma, post.id, '_mirror_raw', {
        sourceName: fact.sourceName,
        sourceUrl: fact.sourceUrl,
        sourceReferenceUrl: fact.sourceReferenceUrl,
        sourceFacts: fact.sourceFacts,
        sourceCompliance: 'Public factual fields only. Visible copy generated locally; no long article or itinerary body copied.'
      });
      await upsertPostMeta(prisma, post.id, '_cms_blocks', [
        {
          id: `${fact.slug}-source-summary`,
          type: 'callout',
          props: {
            eyebrow: 'Source-backed tour facts',
            title: fact.title,
            body: fact.excerpt,
            ctaLabel: 'Customize this trip',
            ctaHref: '/customize-your-trip/'
          }
        }
      ]);
      await upsertPostMeta(prisma, post.id, '_google_maps_embed', '');
      await prisma.auditLog.create({
        data: {
          actorId: admin.id,
          action: existing ? 'asiatours.tour.update' : 'asiatours.tour.create',
          entityType: 'post',
          entityId: post.id,
          metadata: toJson({ sourceUrl: fact.sourceUrl, country: fact.country, priceUsd: fact.priceUsd })
        }
      });
      if (existing) stats.updated += 1;
      else stats.created += 1;
    }
  } finally {
    await prisma.$disconnect();
  }
  return stats;
}

async function main() {
  if (!destinationSources.length) throw new Error('No AsiaTours destinations selected.');
  const startedAt = new Date().toISOString();
  const { facts, destinationResults } = await collectFacts();
  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(facts, null, 2)}\n`);
  const countryCounts = facts.reduce((counts, fact) => {
    counts[fact.country] = (counts[fact.country] || 0) + 1;
    return counts;
  }, {});
  const meta = {
    sourceName: 'AsiaTours public listing',
    sourceReferenceUrl: SOURCE_REFERENCE_URL,
    importedAt: startedAt,
    execute,
    skipDetails,
    destinationCounts: Object.fromEntries(destinationResults.map((item) => [item.key, item.count])),
    countryCounts,
    totalFacts: facts.length,
    outputPath: OUTPUT_PATH
  };
  let dbStats = null;
  if (execute) {
    dbStats = await importFactsToDb(facts);
    meta.dbStats = dbStats;
  }
  await fs.writeFile(META_OUTPUT_PATH, `${JSON.stringify(meta, null, 2)}\n`);
  log(`wrote ${facts.length} facts -> ${path.relative(projectRoot, OUTPUT_PATH)}`);
  if (dbStats) log(`db created=${dbStats.created} updated=${dbStats.updated} media=${dbStats.media}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
