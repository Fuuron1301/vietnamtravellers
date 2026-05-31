#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const routingSource = readFileSync(path.join(root, 'lib/routing.ts'), 'utf8');
const routingCode = ts.transpileModule(routingSource, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    esModuleInterop: true
  }
}).outputText;
const routingModule = { exports: {} };
new Function('exports', 'module', 'require', routingCode)(routingModule.exports, routingModule, require);

const { hubSearchTerms, tourHubKey } = routingModule.exports;
const tours = JSON.parse(readFileSync(path.join(root, 'data/generated-legal-tours.json'), 'utf8'));
const asiaToursFacts = JSON.parse(readFileSync(path.join(root, 'data/asiatours-public-tour-facts.json'), 'utf8'));

const expectedCounts = {
  vietnam: 371,
  laos: 56,
  cambodia: 67,
  thailand: 86,
  myanmar: 57,
  'multi-country': 70
};

const expectedSlugs = {
  'vietnam-cambodia-laos-10-days': 'multi-country',
  'thailand-laos-cultural-odyssey-12-days': 'multi-country',
  'cambodia-laos-heritage-journey-12-days': 'multi-country',
  'cultural-beach-paradise-vietnam-cambodia-bali-16-days': 'multi-country',
  'phuket-island-half-day-tour': 'thailand',
  'south-battambang-tours-half-day': 'cambodia',
  'cambodia-essential-beach-relaxation-14-days': 'cambodia',
  'cambodia-family-with-beach-vacation-12-days': 'cambodia',
  'cambodia-beach-vacation-8-days': 'cambodia',
  'full-day-weaving-village-on-biking': 'cambodia',
  'phnom-penh-city-tour-half-day': 'cambodia',
  'mangrove-exploration-full-day': 'cambodia',
  'sihanouk-03-nearby-islands-excursion': 'cambodia'
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const bySlug = new Map(tours.map((tour) => [tour.slug, tour]));
const actualCounts = {};
for (const tour of tours) {
  const key = tourHubKey(tour);
  actualCounts[key] = (actualCounts[key] || 0) + 1;
}

for (const [slug, expected] of Object.entries(expectedSlugs)) {
  const tour = bySlug.get(slug);
  assert(tour, `Missing tour ${slug}.`);
  const actual = tourHubKey(tour);
  assert(actual === expected, `${slug} expected ${expected}, got ${actual}.`);
}

function asiaToursFactToCmsItem(fact) {
  return {
    id: fact.id || fact.slug,
    type: fact.type || 'hlt_tour',
    title: fact.title || '',
    slug: fact.slug || '',
    excerpt: fact.excerpt || '',
    content: fact.content || '',
    featuredImage: fact.featuredImage || '',
    meta: {
      gallery: fact.gallery || [],
      itinerary: fact.itinerary || [],
      details: {
        country: fact.country || '',
        sourceDestinationKey: fact.sourceDestinationKey || '',
        route: fact.route || '',
        places: fact.places || [],
        highlights: fact.highlights || [],
        handpicked: fact.handpicked || []
      }
    }
  };
}

function normalizeSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasSearchTerm(text, term) {
  const normalizedText = ` ${normalizeSearchText(text)} `;
  const normalizedTerm = normalizeSearchText(term);
  if (!normalizedTerm) return false;
  return normalizedText.includes(` ${normalizedTerm} `);
}

function expectedAsiaToursHub(fact) {
  const details = fact.meta?.details || {};
  const routeText = [
    String(details.route || ''),
    Array.isArray(details.places) ? details.places.join(' ') : ''
  ].join(' ');
  const titleText = [fact.slug, fact.title].join(' ');
  const routeMatches = Object.entries(hubSearchTerms)
    .filter(([key]) => key !== 'multi-country')
    .filter(([, terms]) => terms.some((term) => hasSearchTerm(routeText, term)))
    .map(([key]) => key);
  const titleMatches = Object.entries({
    vietnam: ['vietnam', 'viet nam'],
    thailand: ['thailand'],
    cambodia: ['cambodia'],
    laos: ['laos'],
    myanmar: ['myanmar', 'burma'],
    indonesia: ['indonesia', 'bali'],
    malaysia: ['malaysia'],
    singapore: ['singapore'],
    philippines: ['philippines'],
    china: [],
    'hong-kong': ['hong kong', 'hong-kong'],
    japan: ['japan'],
    'south-korea': ['south korea', 'south-korea', 'korea'],
    bhutan: ['bhutan'],
    nepal: ['nepal'],
    india: ['india'],
    'sri-lanka': ['sri lanka', 'sri-lanka']
  })
    .filter(([, terms]) => terms.some((term) => hasSearchTerm(titleText, term)))
    .map(([key]) => key);
  const combinedMatches = new Set([...routeMatches, ...titleMatches]);

  if (routeMatches.length > 1 || titleMatches.length > 1 || combinedMatches.size > 1) return 'multi-country';
  if (routeMatches.length === 1) return routeMatches[0];

  const rawCountry = String(details.country || details.sourceDestinationKey || '').toLowerCase();
  return rawCountry && rawCountry !== 'multi-country' ? rawCountry : 'multi-country';
}

for (const fact of asiaToursFacts) {
  const actual = tourHubKey(asiaToursFactToCmsItem(fact));
  const expected = expectedAsiaToursHub({ ...fact, meta: { details: { country: fact.country, sourceDestinationKey: fact.sourceDestinationKey, route: fact.route, places: fact.places, highlights: fact.highlights, handpicked: fact.handpicked } } });
  assert(actual === expected, `${fact.slug} expected ${expected}, got ${actual}.`);
}

for (const [key, expected] of Object.entries(expectedCounts)) {
  const actual = actualCounts[key] || 0;
  assert(actual === expected, `${key} expected ${expected} tours, got ${actual}.`);
}

for (const key of Object.keys(actualCounts)) {
  assert(key in expectedCounts, `Unexpected category ${key} has ${actualCounts[key]} tours.`);
}

console.log('PASS tour category routing audit.');
