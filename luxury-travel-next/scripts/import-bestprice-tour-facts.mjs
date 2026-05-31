import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const SITEMAP_URL = 'https://www.bestpricetravel.com/sitemap.xml';
const ROBOTS_URL = 'https://www.bestpricetravel.com/robots.txt';
const OUTPUT_PATH = path.join(projectRoot, 'data', 'bestprice-public-tour-facts.json');
const META_OUTPUT_PATH = path.join(projectRoot, 'data', 'bestprice-public-tour-facts.meta.json');
const CONCURRENCY = Number.parseInt(process.env.BESTPRICE_IMPORT_CONCURRENCY || '3', 10);
const REQUEST_DELAY_MS = Number.parseInt(process.env.BESTPRICE_IMPORT_DELAY_MS || '125', 10);
const MAX_RETRIES = Number.parseInt(process.env.BESTPRICE_IMPORT_RETRIES || '2', 10);
const USER_AGENT = 'LuxuryTravelNextPublicTourImporter/1.0 (local catalog builder; public facts only)';

const EXCLUDED_PATH_PATTERNS = [
  /\/travel-guide\//i,
  /\/blog\//i,
  /\/news\//i,
  /cruises?/i
];

const PREFIX_COUNTRY = [
  ['vietnam', /^(vietnam|hanoi|halong-bay|halong-sapa|ha-giang|hoi-an|hue|da-nang|ho-chi-minh-city|mekong-delta|nha-trang|ninh-binh|phu-quoc|sapa)-tours$/i],
  ['thailand', /^(thailand|bangkok|chiang-mai|koh-samui|phuket)-tours$/i],
  ['cambodia', /^(cambodia|battambang|phnom-penh|siem-reap|sihanoukville)-tours$/i],
  ['laos', /^(laos|luang-prabang|vang-vieng|vientiane)-tours$/i],
  ['myanmar', /^(myanmar|bagan|inle-lake|mandalay|yangon)-tours$/i],
  ['multi-country', /^indochina-tours$/i]
];

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

function numberFromText(value) {
  const match = cleanText(value).replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function integerFromText(value) {
  const parsed = Number.parseInt(String(numberFromText(value) || 0), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function uniqueStrings(values) {
  const seen = new Set();
  return values.map(cleanText).filter((value) => value && !seen.has(value) && seen.add(value));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function splitRoute(value) {
  return uniqueStrings(cleanText(value).split(/\s+-\s+|,\s*|\s+\/\s+/g));
}

function durationDaysFrom(value, title = '') {
  const raw = `${value} ${title}`;
  const weekMatch = raw.match(/(\d+)\s*weeks?/i);
  if (weekMatch) return Number.parseInt(weekMatch[1], 10) * 7;
  const dayMatch = raw.match(/(\d+)\s*days?/i);
  if (dayMatch) return Number.parseInt(dayMatch[1], 10);
  if (/half\s*day/i.test(raw)) return 1;
  if (/full\s*day/i.test(raw)) return 1;
  return 0;
}

function inferCountryFromUrl(sourceUrl) {
  const parts = new URL(sourceUrl).pathname.split('/').filter(Boolean);
  const prefix = parts[0] || '';
  if (parts.some((part) => /vietnam-(cambodia|laos|thailand)|indochina|multi-country/i.test(part))) return 'multi-country';
  for (const [country, pattern] of PREFIX_COUNTRY) {
    if (pattern.test(prefix)) return country;
  }
  return 'multi-country';
}

function inferStyleFromUrlAndCategories(sourceUrl, categories, title) {
  const haystack = `${sourceUrl} ${categories.join(' ')} ${title}`.toLowerCase();
  if (/luxury|deluxe|premium/.test(haystack)) return 'Luxury';
  if (/beach|island|sihanoukville|phuket|koh samui|phu quoc|nha trang/.test(haystack)) return 'Beach Vacation';
  if (/family|kids/.test(haystack)) return 'Family';
  if (/honeymoon|romantic/.test(haystack)) return 'Honeymoon';
  if (/food|cooking|culinary|gourmet|taste/.test(haystack)) return 'Culinary';
  if (/cycling|biking|bike|trek|hiking|motorbike|adventure/.test(haystack)) return 'Adventure';
  if (/wellness|spa|health/.test(haystack)) return 'Wellness';
  if (/private/.test(haystack)) return 'Private';
  if (/classic|highlight|culture|temple|heritage/.test(haystack)) return 'Culture';
  return 'Private';
}

let nextRequestAt = 0;

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
    await sleep(350 * (attempt + 1));
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
      active = value === '*' || value.toLowerCase().includes('luxurytravelnextpublictourimporter');
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
  if (!robotsAllows(robots, SITEMAP_URL)) {
    throw new Error(`robots.txt does not allow sitemap import: ${SITEMAP_URL}`);
  }
  return robots;
}

function sitemapTourUrls(xml) {
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => cleanText(match[1]));
  return Array.from(
    new Set(
      locs.filter((url) => {
        if (!/\.html(?:$|\?)/i.test(url)) return false;
        if (!/\/[^/]*tours?\//i.test(url)) return false;
        if (EXCLUDED_PATH_PATTERNS.some((pattern) => pattern.test(new URL(url).pathname))) return false;
        return true;
      })
    )
  ).sort((a, b) => a.localeCompare(b));
}

function extractTitle(html) {
  return cleanText(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s*\|\s*BestPrice Travel.*/i, '') || '');
}

function extractProductBlock(html) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1])
    .find((block) => /"@type"\s*:\s*"Product"/i.test(block));
}

function extractProductPrice(html) {
  const block = extractProductBlock(html) || '';
  return numberFromText(block.match(/"priceCurrency"\s*:\s*"USD"[\s\S]*?"price"\s*:\s*"?([\d,.]+)/i)?.[1] || '');
}

function extractInfoItems(html) {
  const items = {};
  const infoStart = html.indexOf('<div class="info-tour">');
  const infoEnd = infoStart >= 0 ? html.indexOf('<div class="tour_detail__header__right__promotion"', infoStart) : -1;
  const block = infoStart >= 0 && infoEnd > infoStart ? html.slice(infoStart, infoEnd) : html;
  for (const match of block.matchAll(/<label[^>]*>\s*([^<:]+)\s*:?\s*<\/label>\s*<span[^>]*>([\s\S]*?)<\/span>/gi)) {
    items[cleanText(match[1]).toLowerCase()] = cleanText(match[2]);
  }
  return items;
}

function extractBreadcrumbCategories(html) {
  const crumbs = [];
  const breadcrumbBlock = html.match(/<ol class="breadcrumb">([\s\S]*?)<\/ol>/i)?.[1] || '';
  for (const match of breadcrumbBlock.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)) {
    const label = cleanText(match[1]);
    if (label && !/^home$/i.test(label)) crumbs.push(label);
  }
  return uniqueStrings(crumbs);
}

function extractReview(html) {
  const reviewBlock = html.match(/<div class="row-review">([\s\S]*?)<\/div>/i)?.[1] || '';
  return {
    rating: numberFromText(reviewBlock.match(/review-score[^>]*>([\s\S]*?)<\/span>/i)?.[1] || ''),
    reviewCount: integerFromText(reviewBlock.match(/review-number[^>]*>([\s\S]*?)<\/span>/i)?.[1] || '')
  };
}

function extractPriceTiers(html) {
  const block = html.match(/<div id="tour_rate">([\s\S]*?)(?:<div id="tab_reviews"|<h2 id="h_tab_reviews")/i)?.[1] || '';
  const season = cleanText(block.match(/<th class="header"[^>]*>([\s\S]*?)<\/th>/i)?.[1] || '');
  const tiers = [];
  for (const row of block.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)) {
    const rowHtml = row[1];
    const tier = cleanText(rowHtml.match(/<td class="name"[^>]*>([\s\S]*?)<\/td>/i)?.[1] || '');
    if (!tier) continue;
    const prices = [...rowHtml.matchAll(/<span class="text-price"[^>]*>\s*\$?([\d,.]+)\s*<\/span>/gi)].map((match) => numberFromText(match[1])).filter(Boolean);
    const oldPrices = [...rowHtml.matchAll(/<span class="price-origin"[^>]*>\s*\$?([\d,.]+)\s*<\/span>/gi)].map((match) => numberFromText(match[1])).filter(Boolean);
    if (!prices.length) continue;
    tiers.push({
      tier,
      priceUsd: Math.min(...prices),
      oldPriceUsd: oldPrices.length ? Math.min(...oldPrices) : 0,
      season
    });
  }
  return tiers;
}

function extractItineraryFacts(html) {
  const matches = [...html.matchAll(/<div id="itinerary_details_[^"]+" class="itinerary-box">[\s\S]*?<span class="iti-day-title">([\s\S]*?)<\/span>/gi)];
  return matches.map((match, index) => {
    const next = matches[index + 1]?.index ?? html.indexOf('<h2 id="h_tour_inclusion"', match.index);
    const start = html.indexOf('<div class="itinerary-content"', match.index);
    const contentStart = start >= 0 ? html.indexOf('>', start) + 1 : match.index;
    const content = html.slice(contentStart, next > contentStart ? next : contentStart + 2000);
    const rawTitle = cleanText(match[1]);
    const dayMatch = rawTitle.match(/^(Day\s*[\d,\s&+-]+|Half Day|Full Day)\s*:?\s*(.*)$/i);
    return {
      day: cleanText(dayMatch?.[1] || `Day ${index + 1}`),
      title: cleanText(dayMatch?.[2] || rawTitle),
      meals: cleanText(content.match(/<b>\s*Meals\s*:\s*<\/b>\s*([^<]+)/i)?.[1] || ''),
      accommodation: cleanText(content.match(/<b>\s*Accommodation\s*:\s*<\/b>\s*([^<]+)/i)?.[1] || ''),
      startPoint: cleanText(content.match(/class="start-point"[\s\S]*?<i[^>]*><\/i>\s*([^<]+)/i)?.[1] || ''),
      endPoint: cleanText(content.match(/class="end-point"[\s\S]*?<i[^>]*><\/i>\s*([^<]+)/i)?.[1] || '')
    };
  }).filter((item) => item.title);
}

function extractInclusionFacts(html) {
  const block = html.match(/<h2 id="h_tour_inclusion">[\s\S]*?(?=<h2 id="h_tour_rate"|<div id="tour_rate")/i)?.[0] || '';
  const details = {};
  for (const match of block.matchAll(/<label[^>]*class="label"[^>]*>\s*([^<]+)\s*<\/label>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/gi)) {
    const key = cleanText(match[1]).toLowerCase();
    const value = cleanText(match[2]);
    if (key && value && !details[key]) details[key] = value;
  }
  const includedActivitiesBlock = block.match(/Included activities[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i)?.[1] || '';
  const includedActivities = [...includedActivitiesBlock.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((match) => cleanText(match[1])).filter(Boolean);
  return {
    meals: details.meals || '',
    transport: details.transport || '',
    accommodation: details.accommodation || '',
    includedActivities: uniqueStrings(includedActivities).slice(0, 8)
  };
}

function shouldSkipDetail(html, sourceUrl) {
  if (/(cruise|cruises)/i.test(sourceUrl)) return true;
  const title = extractTitle(html);
  if (!title || /404|not found/i.test(title)) return true;
  if (/\bcruise\b|\bcruises\b/i.test(title)) return true;
  if (!/<h1[^>]*>/i.test(html)) return true;
  return false;
}

function parseFact(html, sourceUrl) {
  if (shouldSkipDetail(html, sourceUrl)) return null;
  const title = extractTitle(html);
  const info = extractInfoItems(html);
  const categories = extractBreadcrumbCategories(html);
  const priceTiers = extractPriceTiers(html);
  const productPrice = extractProductPrice(html);
  const priceFromUsd = priceTiers.length ? Math.min(...priceTiers.map((tier) => tier.priceUsd)) : productPrice;
  const oldPriceUsd = priceTiers.length ? Math.min(...priceTiers.map((tier) => tier.oldPriceUsd || Number.POSITIVE_INFINITY).filter(Number.isFinite)) || 0 : 0;
  const route = info.places || '';
  const itineraryFacts = extractItineraryFacts(html);
  const inclusionFacts = extractInclusionFacts(html);
  const review = extractReview(html);
  const durationLabel = info.duration || `${durationDaysFrom('', title) || itineraryFacts.length || 1} days`;
  const country = inferCountryFromUrl(sourceUrl);
  return {
    title,
    sourceUrl,
    country,
    route,
    places: splitRoute(route),
    durationDays: durationDaysFrom(durationLabel, title) || itineraryFacts.length || 1,
    durationLabel,
    style: inferStyleFromUrlAndCategories(sourceUrl, categories, title),
    priceFromUsd,
    oldPriceUsd,
    rating: review.rating,
    reviewCount: review.reviewCount,
    categories,
    meals: info.meals || inclusionFacts.meals || '',
    groupSize: info['group size'] || '',
    operatedBy: info['operated by'] || '',
    transport: inclusionFacts.transport,
    accommodation: inclusionFacts.accommodation,
    includedActivities: inclusionFacts.includedActivities,
    itineraryFacts,
    priceTiers
  };
}

async function mapConcurrent(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.max(1, limit) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function runCli() {
  console.log(`Checking robots policy: ${ROBOTS_URL}`);
  const robots = await assertRobotsAllowsImport();
  console.log(`Robots policy allows import (${cleanText(robots).slice(0, 80)})`);
  console.log(`Fetching sitemap: ${SITEMAP_URL}`);
  const sitemap = await fetchText(SITEMAP_URL);
  const urls = sitemapTourUrls(sitemap);
  console.log(`Found ${urls.length} non-cruise tour detail URLs in sitemap`);

  let fetched = 0;
  let skipped = 0;
  const facts = await mapConcurrent(urls, CONCURRENCY, async (url, index) => {
    try {
      const html = await fetchText(url);
      const fact = parseFact(html, url);
      fetched += 1;
      if (!fact) skipped += 1;
      if ((index + 1) % 50 === 0) console.log(`Processed ${index + 1}/${urls.length} detail pages`);
      return fact;
    } catch (error) {
      skipped += 1;
      console.warn(`[skip] ${url}: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  });

  const cleaned = facts.filter(Boolean).sort((a, b) => a.title.localeCompare(b.title));
  const seen = new Set();
  const unique = cleaned.filter((fact) => {
    const slug = new URL(fact.sourceUrl).pathname.split('/').pop()?.replace(/\.html$/i, '') || fact.title;
    if (seen.has(slug)) return false;
    seen.add(slug);
    return true;
  });

  writeJson(OUTPUT_PATH, unique);
  const countryCounts = unique.reduce((counts, fact) => {
    counts[fact.country] = (counts[fact.country] || 0) + 1;
    return counts;
  }, {});
  writeJson(META_OUTPUT_PATH, {
    source: 'BestPriceTravel public sitemap and tour detail pages',
    sourceUrl: SITEMAP_URL,
    robotsUrl: ROBOTS_URL,
    robotsAllowed: true,
    userAgent: USER_AGENT,
    scope: 'public factual tour fields only; no third-party images, no long copied descriptions, no branding assets',
    importedAt: new Date().toISOString(),
    requestDelayMs: REQUEST_DELAY_MS,
    concurrency: CONCURRENCY,
    total: unique.length,
    countryCounts
  });
  console.log(`Imported ${unique.length} public tour fact records (${fetched} fetched, ${skipped} skipped)`);
  console.log(countryCounts);
  console.log(`Wrote ${path.relative(projectRoot, OUTPUT_PATH)}`);
  console.log(`Wrote ${path.relative(projectRoot, META_OUTPUT_PATH)}`);
}

runCli().catch((error) => {
  console.error(error);
  process.exit(1);
});
