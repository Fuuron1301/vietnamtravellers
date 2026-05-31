import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const SOURCE_FACTS_PATH = path.join(projectRoot, 'data', 'bestprice-public-tour-facts.json');
const IMAGE_POOLS_PATH = path.join(projectRoot, 'data', 'legal-tour-images.json');
const LANDMARK_IMAGE_POOLS_PATH = path.join(projectRoot, 'data', 'legal-tour-landmark-images.json');
const OUTPUT_PATH = path.join(projectRoot, 'data', 'generated-legal-tours.json');

const FORBIDDEN_IMAGE_HOSTS = /bestpricetravel|cloudfront|d122axpxm39woi/i;
const MIN_HD_IMAGE_LONG_EDGE = 3840;
const MIN_HD_IMAGE_SHORT_EDGE = 2160;
const WIKIMEDIA_THUMB_WIDTH = 3840;

const COUNTRY_LABELS = {
  vietnam: 'Vietnam',
  thailand: 'Thailand',
  cambodia: 'Cambodia',
  laos: 'Laos',
  myanmar: 'Myanmar',
  'multi-country': 'Multi Country'
};

const STYLE_COPY = {
  luxury: 'refined stays, private transfers and flexible pacing',
  beach: 'coastal pauses, resort time and easy-going days between cultural stops',
  adventure: 'light adventure, scenic movement and generous recovery time',
  food: 'market tastings, regional kitchens and local host conversations',
  family: 'family-safe routing, shorter transfer days and flexible starts',
  honeymoon: 'romantic pacing, private moments and comfortable boutique stays',
  wellness: 'restorative hotels, spa time and soft cultural immersion',
  culture: 'heritage walks, local context and guided landmark days',
  classic: 'signature highlights, efficient routing and balanced free time',
  default: 'private guiding, comfortable routing and locally grounded experiences'
};

const DEFAULT_INCLUDES = [
  'Private travel designer consultation',
  'Selected accommodation planning',
  'Private airport transfers on arrival and departure',
  'Local English-speaking guides for included touring',
  'Route planning, booking support and on-trip assistance'
];

const DEFAULT_EXCLUDES = [
  'International flights',
  'Visa fees and travel insurance',
  'Personal expenses and optional activities',
  'Drinks, spa treatments and meals not listed',
  'Peak-season surcharges when hotels require them'
];

const SOURCE_COMPLIANCE_NOTE =
  'BestPriceTravel is used as a public factual reference for title, route, duration, price, review count and short itinerary facts only; long copy, branded media and proprietary layout are not copied.';

const LANDMARK_RULES = [
  ['ba-na-hills', /\bba\s*na|golden bridge/i],
  ['my-son-sanctuary', /\bmy\s*son/i],
  ['hoi-an', /\bhoi\s*an|cua dai|cam thanh|tra que|japanese covered bridge/i],
  ['hue', /\bhue\b|thuy bieu|lang co|imperial/i],
  ['da-nang', /\bda\s*nang|danang/i],
  ['phong-nha', /\bphong\s*nha|ke bang|son doong/i],
  ['quang-binh', /\bquang\s*binh|dong hoi/i],
  ['lan-ha-bay', /\blan\s*ha/i],
  ['cat-ba', /\bcat\s*ba|viet hai|ba trai dao/i],
  ['ha-long-bay', /\bha\s*long|halong|bai tu long/i],
  ['sapa', /\bsa\s*pa|sapa|ta phin|muong hoa/i],
  ['mu-cang-chai', /\bmu\s*cang\s*chai/i],
  ['ha-giang', /\bha\s*giang|meo vac|hoang su phi|pan hou|du gia/i],
  ['dong-van', /\bdong\s*van|nho que|tu san/i],
  ['mai-chau', /\bmai\s*chau/i],
  ['pu-luong', /\bpu\s*luong|puluong/i],
  ['mua-cave', /\bmua\s*cave/i],
  ['tam-coc', /\btam\s*coc|bich dong/i],
  ['ninh-binh', /\bninh\s*binh|trang an|hoa lu/i],
  ['cuc-phuong', /\bcuc\s*phuong|wildlife/i],
  ['ban-gioc', /\bban\s*gioc|cao bang/i],
  ['ba-be', /\bba\s*be/i],
  ['yen-tu', /\byen\s*tu/i],
  ['dien-bien-phu', /\bdien\s*bien/i],
  ['duong-lam', /\bduong\s*lam|ky son/i],
  ['bat-trang', /\bbat\s*trang|ceramic/i],
  ['tra-su', /\btra\s*su/i],
  ['phu-quoc', /\bphu\s*quoc/i],
  ['nha-trang', /\bnha\s*trang/i],
  ['mui-ne', /\bmui\s*ne|phan thiet/i],
  ['da-lat', /\bda\s*lat|dalat/i],
  ['central-highlands', /\bcentral highlands|kon tum|buon ma thuot|dak lak|pleiku|lak lake|yok don/i],
  ['can-tho', /\bcan\s*tho|cai rang/i],
  ['cai-be', /\bcai\s*be/i],
  ['ben-tre', /\bben\s*tre/i],
  ['mekong-delta', /\bmekong|my tho|vinh long|chau doc|tan chau|cao lanh|sa dec|tan phong/i],
  ['cu-chi-tunnels', /\bcu\s*chi/i],
  ['ho-chi-minh-city', /\bho\s*chi\s*minh|saigon|sai gon|notre dame|war remnants|china town/i],
  ['cham-island', /\bcham island|cu lao cham/i],
  ['hanoi', /\bhanoi|ha noi|hoan kiem|bat trang/i],
  ['angkor', /\bangkor|siem reap/i],
  ['phnom-penh', /\bphnom\s*penh/i],
  ['luang-prabang', /\bluang\s*prabang/i],
  ['kuang-si', /\bkuang\s*si/i],
  ['vientiane', /\bvientiane|pha that luang/i],
  ['bangkok', /\bbangkok/i],
  ['phuket', /\bphuket|phi phi/i],
  ['chiang-mai', /\bchiang\s*mai/i],
  ['ayutthaya', /\bayutthaya/i],
  ['krabi', /\bkrabi/i],
  ['koh-samui', /\bkoh\s*samui/i],
  ['pattaya', /\bpattaya/i],
  ['bagan', /\bbagan|mount\s*popa|popa/i],
  ['yangon', /\byangon/i],
  ['mandalay', /\bmandalay|amarapura|mingun|sagaing/i],
  ['inle-lake', /\binle/i]
];

const COUNTRY_RULES = {
  vietnam:
    /\bvietnam|ha\s*noi|hanoi|ha\s*long|halong|lan\s*ha|cat\s*ba|sapa|sa\s*pa|ninh\s*binh|tam\s*coc|hoi\s*an|hue\b|da\s*nang|mekong|can\s*tho|cai\s*be|ben\s*tre|ho\s*chi\s*minh|saigon|sai\s*gon|cu\s*chi|phu\s*quoc|nha\s*trang|mui\s*ne|phong\s*nha|quang\s*binh|ha\s*giang|dong\s*van|mai\s*chau|pu\s*luong|ba\s*na|kon\s*tum|buon\s*ma\s*thuot|pleiku|dak\s*lak|dien\s*bien|cuc\s*phuong|cham island/i,
  thailand: /\bthailand|bangkok|phuket|chiang\s*mai|ayutthaya|krabi|pattaya|phi\s*phi|koh\s+\w+/i,
  cambodia: /\bcambodia|siem\s*reap|angkor|phnom\s*penh/i,
  laos: /\blaos|luang\s*prabang|kuang\s*si|vientiane|vang\s*vieng/i,
  myanmar: /\bmyanmar|burma|bagan|yangon|mandalay|inle|popa|amarapura|mingun|sagaing/i
};

const BROAD_IMAGE_KEYS_BY_COUNTRY = {
  vietnam: [
    'ha-long-bay',
    'hanoi',
    'hoi-an',
    'hue',
    'da-nang',
    'ba-na-hills',
    'my-son-sanctuary',
    'sapa',
    'mu-cang-chai',
    'ha-giang',
    'dong-van',
    'mai-chau',
    'pu-luong',
    'ninh-binh',
    'tam-coc',
    'mua-cave',
    'mekong-delta',
    'can-tho',
    'cai-be',
    'ben-tre',
    'cu-chi-tunnels',
    'ho-chi-minh-city',
    'phu-quoc',
    'nha-trang',
    'mui-ne',
    'da-lat',
    'phong-nha',
    'quang-binh',
    'ban-gioc',
    'ba-be',
    'yen-tu',
    'dien-bien-phu',
    'duong-lam',
    'bat-trang',
    'tra-su',
    'cat-ba',
    'con-dao',
    'lan-ha-bay',
    'central-highlands',
    'cuc-phuong',
    'cham-island',
    'food'
  ],
  thailand: ['bangkok', 'phuket', 'chiang-mai', 'ayutthaya', 'krabi', 'thailand'],
  cambodia: ['angkor', 'siem-reap', 'phnom-penh', 'cambodia'],
  laos: ['luang-prabang', 'kuang-si', 'vientiane', 'vang-vieng', 'laos'],
  myanmar: ['bagan', 'yangon', 'mandalay', 'inle-lake', 'myanmar']
};

const GLOBAL_STYLE_IMAGE_KEYS = ['beach', 'mountain', 'heritage', 'city', 'mekong', 'food', 'train', 'golf', 'luxury', 'family', 'honeymoon', 'wellness', 'adventure', 'culture'];
const GLOBAL_BROAD_IMAGE_KEYS = Array.from(new Set([...Object.values(BROAD_IMAGE_KEYS_BY_COUNTRY).flat(), ...GLOBAL_STYLE_IMAGE_KEYS, 'vietnam', 'thailand', 'cambodia', 'laos', 'myanmar', 'multi-country', 'fallback']));

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function cleanText(value) {
  return String(value ?? '')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanAltText(value) {
  const decoded = cleanText(value)
    .replace(/&lt;[^&]*?&gt;/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');
  if (decoded.length <= 140) return decoded;
  return `${decoded.slice(0, 137).replace(/\s+\S*$/, '')}...`;
}

function encodeWikimediaPathSegment(value) {
  return encodeURIComponent(value).replace(/%2C/g, ',').replace(/%28/g, '(').replace(/%29/g, ')');
}

function wikimediaThumbUrl(value, thumbWidth = WIKIMEDIA_THUMB_WIDTH) {
  try {
    const parsed = new URL(value);
    if (parsed.hostname !== 'upload.wikimedia.org') return value;
    if (parsed.pathname.includes('/thumb/')) return value;

    const parts = parsed.pathname.split('/').filter(Boolean);
    const commonsIndex = parts.findIndex((part, index) => part === 'commons' && parts[index - 1] === 'wikipedia');
    if (commonsIndex === -1 || parts.length < commonsIndex + 4) return value;

    const hashParts = parts.slice(commonsIndex + 1, -1);
    const filename = decodeURIComponent(parts[parts.length - 1]);
    const encodedFilename = encodeWikimediaPathSegment(filename);
    return `${parsed.origin}/wikipedia/commons/thumb/${hashParts.join('/')}/${encodedFilename}/${thumbWidth}px-${encodedFilename}`;
  } catch {
    return value;
  }
}

function renderedImage(originalUrl, originalWidth, originalHeight) {
  if (!/upload\.wikimedia\.org/i.test(originalUrl) || originalUrl.includes('/thumb/') || Number(originalWidth) < WIKIMEDIA_THUMB_WIDTH) {
    return { url: originalUrl, width: originalWidth, height: originalHeight };
  }
  const widthForShortEdge = originalHeight ? Math.ceil((originalWidth / originalHeight) * MIN_HD_IMAGE_SHORT_EDGE) : WIKIMEDIA_THUMB_WIDTH;
  const targetWidth = Math.min(originalWidth, Math.max(WIKIMEDIA_THUMB_WIDTH, widthForShortEdge));
  return {
    url: wikimediaThumbUrl(originalUrl, targetWidth),
    width: targetWidth,
    height: originalHeight ? Math.round((originalHeight * targetWidth) / originalWidth) : originalHeight
  };
}

function slugify(value) {
  return cleanText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function slugFromFact(fact) {
  try {
    const last = new URL(fact.sourceUrl).pathname.split('/').filter(Boolean).pop() || '';
    return slugify(last.replace(/\.html$/i, '')) || slugify(fact.title);
  } catch {
    return slugify(fact.title);
  }
}

function asArray(value) {
  return Array.isArray(value) ? value.map(cleanText).filter(Boolean) : [];
}

function itineraryFactsArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      day: cleanText(item?.day),
      title: cleanText(item?.title),
      meals: cleanText(item?.meals),
      accommodation: cleanText(item?.accommodation),
      startPoint: cleanText(item?.startPoint),
      endPoint: cleanText(item?.endPoint)
    }))
    .filter((item) => item.title);
}

function detectedCountries(value) {
  const raw = cleanText(value);
  return Object.entries(COUNTRY_RULES)
    .filter(([, pattern]) => pattern.test(raw))
    .map(([country]) => country);
}

function normalizeCountry(value, context = '') {
  const raw = cleanText(value).toLowerCase();
  const detected = Array.from(new Set([...detectedCountries(value), ...detectedCountries(context)]));
  if (detected.length === 1) return detected[0];
  if (detected.length > 1) return 'multi-country';
  if (raw.includes('vietnam')) return 'vietnam';
  if (raw.includes('thailand')) return 'thailand';
  if (raw.includes('cambodia')) return 'cambodia';
  if (raw.includes('laos')) return 'laos';
  if (raw.includes('myanmar') || raw.includes('burma')) return 'myanmar';
  return 'multi-country';
}

function isCruiseFact(fact) {
  return /\bcruise\b|\/[^/]*cruises\//i.test(`${fact.title} ${fact.sourceUrl}`);
}

function inferStyle(fact) {
  const haystack = `${fact.style || ''} ${asArray(fact.categories).join(' ')} ${fact.title}`.toLowerCase();
  if (/luxury|deluxe|premium|indulgent|ultimate/.test(haystack)) return 'Luxury';
  if (/beach|island|phu quoc|nha trang|wellness|spa/.test(haystack)) return 'Beach Vacation';
  if (/food|taste|culinary|cuisine/.test(haystack)) return 'Culinary';
  if (/family|kid/.test(haystack)) return 'Family';
  if (/honeymoon|romantic/.test(haystack)) return 'Honeymoon';
  if (/adventure|trek|cycling|mountain|nature/.test(haystack)) return 'Adventure';
  if (/group|classic|highlight|heritage|culture|local/.test(haystack)) return 'Culture';
  return cleanText(fact.style) || 'Private';
}

function styleKey(style) {
  const raw = cleanText(style).toLowerCase();
  if (/luxury|deluxe|premium|ultimate|indulgent/.test(raw)) return 'luxury';
  if (/beach|island|wellness|spa/.test(raw)) return 'beach';
  if (/adventure|nature|trek|cycling|mountain/.test(raw)) return 'adventure';
  if (/food|culinary|taste/.test(raw)) return 'food';
  if (/family/.test(raw)) return 'family';
  if (/honeymoon|romantic/.test(raw)) return 'honeymoon';
  if (/wellness|spa/.test(raw)) return 'wellness';
  if (/culture|heritage|local|classic/.test(raw)) return 'culture';
  return 'default';
}

function formatUsd(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return '';
  return `USD ${Math.round(number).toLocaleString('en-US')}`;
}

function routePlaces(fact) {
  const places = asArray(fact.places);
  if (places.length) return places;
  return cleanText(fact.route)
    .split(/\s+-\s+|,\s*/)
    .map(cleanText)
    .filter(Boolean);
}

function validateImage(image, groupName) {
  const originalUrl = cleanText(image.url);
  const alt = cleanAltText(image.alt);
  if (!originalUrl.startsWith('https://')) throw new Error(`Image in ${groupName} must use https: ${originalUrl}`);
  if (FORBIDDEN_IMAGE_HOSTS.test(originalUrl)) throw new Error(`Rejected non-legal image URL in ${groupName}: ${originalUrl}`);
  const originalWidth = Number(image.width);
  const originalHeight = Number(image.height || 0);
  const longEdge = Math.max(originalWidth, originalHeight || 0);
  const shortEdge = Math.min(originalWidth, originalHeight || originalWidth);
  if (longEdge < MIN_HD_IMAGE_LONG_EDGE || shortEdge < MIN_HD_IMAGE_SHORT_EDGE) return null;
  const rendered = renderedImage(originalUrl, originalWidth, originalHeight);
  const url = rendered.url;
  if (!alt) throw new Error(`Image in ${groupName} needs alt text: ${url}`);
  if (!cleanText(image.provider)) throw new Error(`Image in ${groupName} needs provider: ${url}`);
  return {
    url,
    alt,
    provider: cleanText(image.provider),
    sourceUrl: cleanText(image.sourceUrl),
    license: cleanText(image.license || 'Licensed image'),
    width: rendered.width,
    height: rendered.height
  };
}

function validateImagePools(imagePools) {
  if (!imagePools || typeof imagePools !== 'object' || Array.isArray(imagePools)) {
    throw new Error('Image pools must be an object keyed by destination or style.');
  }
  const normalized = {};
  for (const [groupName, images] of Object.entries(imagePools)) {
    if (!Array.isArray(images) || images.length === 0) {
      throw new Error(`Image pool ${groupName} must contain at least one image.`);
    }
    const fullResolutionImages = images.map((image) => validateImage(image, groupName)).filter(Boolean);
    if (fullResolutionImages.length) normalized[groupName] = fullResolutionImages;
  }
  if (!normalized.fallback || normalized.fallback.length < 3) {
    const fallbackByUrl = new Map();
    for (const image of Object.values(normalized).flat()) {
      if (!fallbackByUrl.has(image.url)) fallbackByUrl.set(image.url, image);
      if (fallbackByUrl.size >= 3) break;
    }
    normalized.fallback = Array.from(fallbackByUrl.values());
  }
  if (normalized.fallback.length < 3) {
    throw new Error('Image pools need at least three legal 4K fallback images.');
  }
  return normalized;
}

export function validateFacts(facts) {
  if (!Array.isArray(facts)) throw new Error('Tour facts must be an array.');
  const seen = new Set();
  return facts.map((fact, index) => {
    const title = cleanText(fact.title);
    const sourceUrl = cleanText(fact.sourceUrl);
    if (!title) throw new Error(`Fact ${index + 1} is missing title.`);
    if (!sourceUrl.startsWith('https://')) throw new Error(`Fact ${index + 1} needs an https sourceUrl.`);
    if (FORBIDDEN_IMAGE_HOSTS.test(cleanText(fact.imageUrl || fact.thumbnail || fact.featuredImage))) {
      throw new Error(`Fact ${index + 1} contains a forbidden third-party image URL.`);
    }
    const slug = slugFromFact({ ...fact, title, sourceUrl });
    if (seen.has(slug)) throw new Error(`Duplicate generated slug: ${slug}`);
    seen.add(slug);
    const places = routePlaces(fact);
    return {
      ...fact,
      title,
      sourceUrl,
      slug,
      country: normalizeCountry(fact.country || sourceUrl, `${sourceUrl} ${fact.route} ${places.join(' ')}`),
      route: cleanText(fact.route || places.join(' - ')),
      places,
      durationDays: Math.max(1, Number.parseInt(String(fact.durationDays || 0), 10) || durationFromTitle(title)),
      durationLabel: cleanText(fact.durationLabel) || `${Math.max(1, durationFromTitle(title))} days`,
      style: inferStyle(fact),
      priceFromUsd: Number(fact.priceFromUsd) || 0,
      oldPriceUsd: Number(fact.oldPriceUsd) || 0,
      rating: Number(fact.rating) || 0,
      reviewCount: Number.parseInt(String(fact.reviewCount || 0), 10) || 0,
      categories: asArray(fact.categories),
      meals: cleanText(fact.meals),
      groupSize: cleanText(fact.groupSize),
      operatedBy: cleanText(fact.operatedBy),
      departure: cleanText(fact.departure),
      transport: cleanText(fact.transport),
      accommodation: cleanText(fact.accommodation),
      includedActivities: asArray(fact.includedActivities),
      itineraryFacts: itineraryFactsArray(fact.itineraryFacts),
      theme: cleanText(fact.theme),
      suitable: cleanText(fact.suitable),
      tourType: cleanText(fact.tourType),
      priceTiers: Array.isArray(fact.priceTiers)
        ? fact.priceTiers
            .map((tier) => ({
              tier: cleanText(tier.tier),
              oldPriceUsd: Number(tier.oldPriceUsd) || 0,
              priceUsd: Number(tier.priceUsd) || 0,
              season: cleanText(tier.season)
            }))
            .filter((tier) => tier.tier && tier.priceUsd > 0)
        : []
    };
  });
}

function durationFromTitle(title) {
  const weeks = cleanText(title).match(/(\d+)\s*weeks?/i);
  if (weeks) return Number.parseInt(weeks[1], 10) * 7;
  const days = cleanText(title).match(/(\d+)\s*days?/i);
  return days ? Number.parseInt(days[1], 10) : 10;
}

function pushUnique(target, images) {
  for (const image of images || []) {
    if (!target.some((item) => item.url === image.url)) target.push(image);
  }
}

function hashText(value) {
  let hash = 0;
  for (const character of cleanText(value)) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function rotateImages(images, seed) {
  if (!images.length) return images;
  const offset = seed % images.length;
  return [...images.slice(offset), ...images.slice(0, offset)];
}

function rotateKeys(keys, seed) {
  if (!keys.length) return keys;
  const offset = seed % keys.length;
  return [...keys.slice(offset), ...keys.slice(0, offset)];
}

function matchingLandmarkKeys(value) {
  const keys = [];
  for (const [key, pattern] of LANDMARK_RULES) {
    if (pattern.test(value) && !keys.includes(key)) keys.push(key);
  }
  return keys;
}

function pushMissingKeys(target, keys) {
  for (const key of keys) {
    if (!target.includes(key)) target.push(key);
  }
}

export function titleLandmarkKeysForFact(fact) {
  return matchingLandmarkKeys(fact.title);
}

function landmarkKeysForFact(fact) {
  const keys = [];
  // Title-specific landmarks should win over broad route starts like Hanoi or Da Nang.
  pushMissingKeys(keys, titleLandmarkKeysForFact(fact));
  for (const place of routePlaces(fact)) {
    pushMissingKeys(keys, matchingLandmarkKeys(place));
  }
  pushMissingKeys(keys, matchingLandmarkKeys(`${fact.route} ${asArray(fact.categories).join(' ')}`));
  return keys;
}

export function priorityThemeKeysForFact(fact) {
  const haystack = `${fact.title} ${fact.style} ${asArray(fact.categories).join(' ')}`.toLowerCase();
  const keys = [];
  if (/golf/.test(haystack)) keys.push('golf');
  if (/train|rail/.test(haystack)) keys.push('train');
  if (/food|culinary|cuisine|flavo[u]?rs?|gourmet|cooking|taste/.test(haystack)) keys.push('food');
  return keys;
}

function softThemeKeysForFact(fact) {
  const haystack = `${fact.title} ${fact.style} ${asArray(fact.categories).join(' ')}`.toLowerCase();
  const keys = [];
  if (/wellness|spa|therapeutic|meditation|dental/.test(haystack)) keys.push('wellness');
  if (/beach|island|escape|relaxation/.test(haystack)) keys.push('beach');
  return keys;
}

export function destinationThemePriorityKeysForFact(fact) {
  const haystack = `${fact.title} ${fact.style} ${asArray(fact.categories).join(' ')}`.toLowerCase();
  if (!/wellness|spa|beach|island|honeymoon|romantic|relaxation|escape/.test(haystack)) return [];
  const destinationKeys = new Set(['phu-quoc', 'nha-trang', 'mui-ne', 'con-dao', 'cham-island']);
  return landmarkKeysForFact(fact).filter((key) => destinationKeys.has(key));
}

export function conceptPriorityKeysForFact(fact) {
  const haystack = `${fact.title} ${fact.style} ${asArray(fact.categories).join(' ')}`.toLowerCase();
  const keys = landmarkKeysForFact(fact);
  if (/unesco|world heritage|heritage sites/.test(haystack)) {
    const heritageKeys = new Set(['ha-long-bay', 'ninh-binh', 'tam-coc', 'hue', 'hoi-an', 'my-son-sanctuary']);
    return keys.filter((key) => heritageKeys.has(key));
  }
  if (/war|wartime|memorial|historic treasures|history/.test(haystack)) {
    const historyKeys = new Set(['cu-chi-tunnels', 'dien-bien-phu', 'hue', 'ho-chi-minh-city']);
    return keys.filter((key) => historyKeys.has(key));
  }
  return [];
}

function countryKeysForFact(fact) {
  const detected = detectedCountries(`${fact.sourceUrl} ${fact.title} ${fact.route} ${routePlaces(fact).join(' ')}`);
  return Array.from(new Set([fact.country, ...detected].filter((country) => country && country !== 'multi-country')));
}

function broadImageKeysForFact(fact, seed) {
  const keys = [];
  pushMissingKeys(keys, landmarkKeysForFact(fact));
  for (const country of countryKeysForFact(fact)) {
    pushMissingKeys(keys, rotateKeys(BROAD_IMAGE_KEYS_BY_COUNTRY[country] || [], seed + hashText(country)));
  }
  pushMissingKeys(keys, rotateKeys(GLOBAL_BROAD_IMAGE_KEYS, seed));
  return keys;
}

function pushRotatedPool(target, pools, key, seed) {
  pushUnique(target, rotateImages(pools[key] || [], seed + hashText(key)));
}

function allImageCandidates(pools, seed) {
  const selected = [];
  for (const key of rotateKeys(Object.keys(pools).sort(), seed)) {
    pushRotatedPool(selected, pools, key, seed);
  }
  return selected;
}

export function selectImageCandidates(fact, imagePools) {
  const pools = validateImagePools(imagePools);
  const selected = [];
  const landmarkSelected = [];
  const places = routePlaces(fact).join(' ').toLowerCase();
  const style = styleKey(fact.style);
  const seed = hashText(`${fact.slug || fact.title}-${places}`);

  for (const key of priorityThemeKeysForFact(fact)) pushUnique(selected, rotateImages(pools[key] || [], seed));

  for (const key of landmarkKeysForFact(fact)) pushUnique(landmarkSelected, pools[key]);
  pushUnique(selected, rotateImages(landmarkSelected, seed));
  for (const key of softThemeKeysForFact(fact)) pushUnique(selected, rotateImages(pools[key] || [], seed));

  if (/phu quoc|nha trang|beach|island|coast/.test(places) || style === 'beach') pushUnique(selected, pools.beach);
  if (/sapa|mai chau|ha giang|mountain|pu luong|ninh binh/.test(places) || style === 'adventure') pushUnique(selected, pools.mountain);
  if (/hoi an|hue|angkor|siem reap|luang prabang|ayutthaya/.test(places) || style === 'culture') pushUnique(selected, pools.heritage);
  if (/mekong|delta|can tho|cai be/.test(places)) pushUnique(selected, pools.mekong);
  if (/hanoi|ho chi minh|bangkok|phnom penh|vientiane/.test(places)) pushUnique(selected, pools.city);
  for (const key of broadImageKeysForFact(fact, seed)) pushRotatedPool(selected, pools, key, seed);
  pushUnique(selected, pools[normalizeCountry(fact.country)] || pools['multi-country']);
  pushUnique(selected, pools[style]);
  pushUnique(selected, pools.fallback);
  pushUnique(selected, allImageCandidates(pools, seed));

  if (selected.length < 3) throw new Error(`Not enough legal images for ${fact.title}`);
  return selected;
}

function orderedGalleryImages(candidates, featuredUrl) {
  const ordered = [];
  const featured = candidates.find((image) => image.url === featuredUrl);
  if (featured) pushUnique(ordered, [featured]);
  pushUnique(ordered, candidates);
  const gallery = ordered.slice(0, 5);
  const safeFallback = ordered.find((image) => isRuntimeSafeImage(image.url));
  if (safeFallback && !gallery.some((image) => image.url === safeFallback.url)) {
    gallery[gallery.length - 1] = safeFallback;
  }
  return gallery;
}

export function selectImages(fact, imagePools, featuredUrl) {
  return orderedGalleryImages(selectImageCandidates(fact, imagePools), featuredUrl);
}

function isRuntimeSafeImage(url) {
  return !/upload\.wikimedia\.org/i.test(cleanText(url));
}

function isSharpFeaturedImage(image) {
  const width = Number(image.width);
  const height = Number(image.height || 0);
  return Math.max(width, height) >= MIN_HD_IMAGE_LONG_EDGE && Math.min(width, height || width) >= MIN_HD_IMAGE_SHORT_EDGE;
}

export function imagePriorityForKeys(imagePools, keys) {
  const pools = validateImagePools(imagePools);
  const priorityByUrl = new Map();
  keys.forEach((key, keyIndex) => {
    for (const image of pools[key] || []) {
      if (!priorityByUrl.has(image.url)) priorityByUrl.set(image.url, keyIndex);
    }
  });
  return priorityByUrl;
}

export function pickBalancedFeaturedImage(candidates, usageByUrl, priorityByUrl = new Map()) {
  const priorityCandidates = candidates.filter((image) => priorityByUrl.has(image.url));
  const preferred = priorityCandidates.length ? priorityCandidates : candidates;
  const unusedPreferred = preferred.filter((image) => !(usageByUrl.get(image.url) || 0));
  const unusedCandidates = candidates.filter((image) => !(usageByUrl.get(image.url) || 0));
  const sharpUnusedPreferred = unusedPreferred.filter(isSharpFeaturedImage);
  const sharpUnusedCandidates = unusedCandidates.filter(isSharpFeaturedImage);
  const shortlist = sharpUnusedPreferred.length ? sharpUnusedPreferred : sharpUnusedCandidates.length ? sharpUnusedCandidates : unusedPreferred.length ? unusedPreferred : unusedCandidates.length ? unusedCandidates : preferred;
  let best = shortlist[0];
  let bestScore = Number.POSITIVE_INFINITY;

  shortlist.forEach((image, index) => {
    const usage = usageByUrl.get(image.url) || 0;
    const priorityPenalty = (priorityByUrl.get(image.url) || 0) * 1000;
    const runtimePenalty = isRuntimeSafeImage(image.url) ? 0 : 260;
    const score = priorityPenalty + runtimePenalty + usage * 100 + index * 12;
    if (score < bestScore) {
      best = image;
      bestScore = score;
    }
  });

  usageByUrl.set(best.url, (usageByUrl.get(best.url) || 0) + 1);
  return best.url;
}

function featuredAssignmentScore(fact, index) {
  const titleKeyCount = titleLandmarkKeysForFact(fact).length;
  const routeKeyCount = landmarkKeysForFact(fact).length;
  const placeCount = routePlaces(fact).length || 99;
  const duration = fact.durationDays || 99;
  const multiCountryPenalty = fact.country === 'multi-country' ? 1 : 0;
  return [titleKeyCount ? 0 : 1, Math.min(placeCount, 12), Math.min(routeKeyCount, 12), Math.min(duration, 60), multiCountryPenalty, index];
}

function compareFeaturedAssignment(a, b) {
  for (let index = 0; index < a.score.length; index += 1) {
    if (a.score[index] !== b.score[index]) return a.score[index] - b.score[index];
  }
  return 0;
}

function dayRange(index, total, durationDays) {
  const start = Math.floor((index * durationDays) / total) + 1;
  const end = Math.max(start, Math.floor(((index + 1) * durationDays) / total));
  return start === end ? `Day ${start}` : `Days ${start}-${end}`;
}

function makeItinerary(fact) {
  if (fact.itineraryFacts?.length) {
    return fact.itineraryFacts.map((item, index) => {
      const title = item.title || `${routePlaces(fact)[index % Math.max(routePlaces(fact).length, 1)] || COUNTRY_LABELS[fact.country] || 'Journey'} in depth`;
      const logistics = [
        item.startPoint ? `starts in ${item.startPoint}` : '',
        item.endPoint ? `ends in ${item.endPoint}` : '',
        item.meals && !/^n\/?a$/i.test(item.meals) ? `meals noted: ${item.meals}` : '',
        item.accommodation ? `overnight: ${item.accommodation}` : ''
      ].filter(Boolean);
      return {
        day: item.day || dayRange(index, fact.itineraryFacts.length, fact.durationDays || fact.itineraryFacts.length),
        title,
        body: `Original planning note based on the public day title: enjoy ${title.toLowerCase()} with private timing, local context and smooth transfers${logistics.length ? `. Key facts: ${logistics.join('; ')}.` : '.'}`
      };
    });
  }
  const places = routePlaces(fact);
  const duration = fact.durationDays || durationFromTitle(fact.title);
  const count = Math.min(Math.max(places.length, 4), 7);
  const chosen = Array.from({ length: count }, (_, index) => places[index % Math.max(places.length, 1)] || COUNTRY_LABELS[fact.country] || 'Southeast Asia');
  return chosen.map((place, index) => ({
    day: dayRange(index, chosen.length, duration),
    title: index === 0 ? `Arrive in ${place}` : `${place} in depth`,
    body:
      index === 0
        ? `Begin with a smooth private arrival, time to settle in and a gentle first look at ${place}.`
        : `Explore ${place} with private guiding, flexible timing and pauses for local food, photography and rest.`
  }));
}

function makeHighlights(fact) {
  const places = routePlaces(fact);
  const style = inferStyle(fact);
  const first = places[0] || COUNTRY_LABELS[fact.country] || 'Southeast Asia';
  const last = places[places.length - 1] || first;
  return [
    `${style} pacing from ${first} to ${last}`,
    `Private route design across ${Math.min(places.length || 1, 8)} signature stops`,
    'Legal 4K travel imagery selected for clean thumbnails and gallery storytelling',
    'Original itinerary notes written for planning clarity, not copied source content',
    'Flexible quote flow for hotels, dates, guides and travel style'
  ];
}

function makeTravelNotes(fact) {
  const places = routePlaces(fact);
  return [
    `Best for travelers who want ${STYLE_COPY[styleKey(fact.style)] || STYLE_COPY.default}.`,
    `The route can be slowed down with extra nights in ${places[0] || COUNTRY_LABELS[fact.country] || 'the first destination'}.`,
    'Prices are planning references and should be confirmed against season, hotels and room category.',
    'Images are licensed illustrative assets and may not show the exact hotel, guide or activity.'
  ];
}

function makeImportantNotes(fact) {
  const places = routePlaces(fact);
  const first = places[0] || COUNTRY_LABELS[fact.country] || 'the first destination';
  return [
    `Public price is a reference from the source listing and must be reconfirmed by date, hotel class and availability.`,
    `Route facts are captured from ${places.length ? `${places.length} public destination stops` : 'the public listing'}; the final private route can add or remove nights.`,
    fact.meals ? `Meal plan reference: ${fact.meals}.` : 'Meal plan is finalized after hotel and activity selection.',
    fact.transport ? `Transport reference: ${fact.transport}.` : 'Transport mode is selected by comfort, timing and season.',
    `Good customization point: add one slower night in ${first} if the trip feels too compact.`
  ];
}

function makeBlogSections(fact) {
  const places = routePlaces(fact);
  const country = COUNTRY_LABELS[fact.country] || 'Southeast Asia';
  const route = cleanText(fact.route || places.join(' - '));
  const style = inferStyle(fact);
  return [
    {
      heading: 'Why this journey works',
      body: `${fact.title} is shaped around a practical ${fact.durationLabel} rhythm through ${route || country}. The route gives first-time travelers a clear arc while leaving room for private adjustments, better hotels and slower days where the experience deserves more time.`
    },
    {
      heading: 'Route character',
      body: `Expect a mix of guided landmarks, local neighborhoods and comfortable transfers. ${places.slice(0, 3).join(', ') || country} sets the opening tone, then the journey builds toward ${places.slice(-2).join(' and ') || 'a relaxed finale'} with enough structure for confidence and enough flexibility for a tailor-made quote.`
    },
    {
      heading: 'Comfort and price logic',
      body: `The public price reference is treated as a starting point, not a fixed promise. Your final quote can move lower or higher depending on hotel class, private guide level, internal flights, peak dates and whether you prefer ${style.toLowerCase()} pacing or a more compact schedule.`
    },
    {
      heading: 'How we personalize it',
      body: 'Before confirmation, a travel designer can swap hotels, add food walks, adjust beach nights, include family-friendly timing or upgrade transfers. The goal is to keep the value of a published itinerary while making the final version feel built around your trip.'
    }
  ];
}

function escapeHtml(value) {
  return cleanText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function contentHtml(fact, overview, blogSections) {
  const sections = [
    `<p>${escapeHtml(overview)}</p>`,
    ...blogSections.map((section) => `<section><h2>${escapeHtml(section.heading)}</h2><p>${escapeHtml(section.body)}</p></section>`)
  ];
  return sections.join('\n');
}

export function tourFactToCmsItem(fact, imagePools, preselectedImages) {
  const images = preselectedImages || selectImages(fact, imagePools);
  const places = routePlaces(fact);
  const highlights = makeHighlights(fact);
  const itinerary = makeItinerary(fact);
  const includes = Array.from(new Set([...asArray(fact.includedActivities), ...DEFAULT_INCLUDES])).slice(0, 10);
  const excludes = [...DEFAULT_EXCLUDES];
  const travelNotes = makeTravelNotes(fact);
  const importantNotes = makeImportantNotes(fact);
  const blogSections = makeBlogSections(fact);
  const countryLabel = COUNTRY_LABELS[fact.country] || 'Southeast Asia';
  const price = formatUsd(fact.priceFromUsd);
  const overview = `${fact.title} is an original planning profile based on public route facts for ${countryLabel}. It keeps the useful reference points, duration, route and price signal, then rebuilds the story with legal imagery and tailor-made travel advice.`;
  const pricing = fact.priceTiers?.length
    ? fact.priceTiers.map((tier) => ({
        tier: tier.tier,
        price: `From ${formatUsd(tier.priceUsd)} pp`,
        oldPrice: tier.oldPriceUsd > tier.priceUsd ? `${formatUsd(tier.oldPriceUsd)} pp` : '',
        season: cleanText(tier.season)
      }))
    : price
    ? [
        { tier: 'Reference starting price', price: `From ${price} pp` },
        ...(fact.oldPriceUsd > fact.priceFromUsd ? [{ tier: 'Previous public reference', price: `Usually ${formatUsd(fact.oldPriceUsd)} pp` }] : [])
      ]
    : [{ tier: 'Tailor-made quote', price: 'Price on request' }];

  return {
    id: `legal-${fact.slug}`,
    type: 'hlt_tour',
    title: fact.title,
    slug: fact.slug,
    excerpt: `${fact.durationLabel} private ${countryLabel} tour through ${places.slice(0, 4).join(', ') || 'signature destinations'} with price guidance and legal 4K imagery.`,
    content: contentHtml(fact, overview, blogSections),
    featuredImage: images[0].url,
    meta: {
      seo: {
        title: `${fact.title} | Private Tour Price Guide`,
        description: `Original ${countryLabel} tour profile for ${fact.title}, with route, duration, price guidance, itinerary, inclusions and legal 4K images.`,
        h1: fact.title,
        ogImage: images[0].url
      },
      gallery: images.slice(1).map((image) => image.url),
      itinerary,
      faq: [
        {
          question: `Can ${fact.title} be customized?`,
          answer: 'Yes. Hotels, room class, pace, guides, transfers and extra nights can be adjusted before quotation.'
        },
        {
          question: 'Is the displayed price final?',
          answer: 'No. It is a public planning reference. The final quote depends on season, hotels, availability and private service level.'
        },
        {
          question: 'Are the photos from the source website?',
          answer: 'No. The photos are legal illustrative assets selected to match the route atmosphere without using third-party branded media.'
        }
      ],
      pricing,
      details: {
        country: fact.country,
        route: fact.route || places.join(' - '),
        places,
        duration: fact.durationLabel,
        style: inferStyle(fact),
        highlights,
        includes,
        excludes,
        travelNotes,
        importantNotes,
        sourceUrl: fact.sourceUrl,
        sourceName: 'BestPriceTravel public listing',
        sourceCompliance: SOURCE_COMPLIANCE_NOTE,
        sourceFacts: [
          'title',
          'duration',
          'route',
          'public price',
          'rating',
          'review count',
          'source URL',
          ...(fact.itineraryFacts?.length ? ['public itinerary day titles'] : []),
          ...(fact.priceTiers?.length ? ['hotel-class price tiers'] : []),
          ...(fact.meals ? ['meals'] : []),
          ...(fact.groupSize ? ['group size'] : []),
          ...(fact.transport ? ['transport'] : []),
          ...(fact.accommodation ? ['accommodation'] : []),
          ...(fact.theme ? ['theme'] : [])
        ],
        priceFromUsd: fact.priceFromUsd || undefined,
        oldPriceUsd: fact.oldPriceUsd || undefined,
        meals: fact.meals || undefined,
        transport: fact.transport || undefined,
        accommodation: fact.accommodation || undefined,
        sourceItineraryFacts: fact.itineraryFacts?.length ? fact.itineraryFacts : undefined,
        groupSize: fact.groupSize || undefined,
        operatedBy: fact.operatedBy || 'Local travel operator',
        departure: fact.departure || "Upon customer's request",
        theme: fact.theme || undefined,
        suitable: fact.suitable || undefined,
        tourType: fact.tourType || 'Private tour, Flexible group tour',
        reviewRating: fact.rating ? fact.rating.toFixed(1) : undefined,
        reviewCount: fact.reviewCount ? `${fact.reviewCount} reviews` : undefined,
        reviewTitle: `${inferStyle(fact)} route with clear value`,
        reviewQuote: `A practical ${fact.durationLabel} plan with enough structure for comparison and enough flexibility for a private quote.`,
        reviewAuthor: 'Travel design note',
        reviewDate: 'Updated 2026',
        imageAttributions: images.map(({ url, provider, sourceUrl, license, alt, width, height }) => ({ url, provider, sourceUrl, license, alt, width: String(width), height: String(height) })),
        blogSections
      }
    }
  };
}

export function generateToursFromFacts(facts, imagePools) {
  const normalizedFacts = validateFacts(facts).filter((fact) => !isCruiseFact(fact));
  const usageByUrl = new Map();
  const tours = new Array(normalizedFacts.length);
  const assignmentOrder = normalizedFacts
    .map((fact, index) => ({ fact, index, score: featuredAssignmentScore(fact, index) }))
    .sort(compareFeaturedAssignment);

  for (const { fact, index } of assignmentOrder) {
    const candidates = selectImageCandidates(fact, imagePools);
    const priorityKeys = [...priorityThemeKeysForFact(fact), ...titleLandmarkKeysForFact(fact), ...conceptPriorityKeysForFact(fact), ...destinationThemePriorityKeysForFact(fact)];
    const featuredUrl = pickBalancedFeaturedImage(candidates, usageByUrl, imagePriorityForKeys(imagePools, priorityKeys));
    tours[index] = tourFactToCmsItem(fact, imagePools, orderedGalleryImages(candidates, featuredUrl));
  }
  const ownersByFeaturedImage = new Map();
  for (const tour of tours) {
    const owner = ownersByFeaturedImage.get(tour.featuredImage);
    if (owner) throw new Error(`Duplicate featured image generated for ${owner} and ${tour.slug}: ${tour.featuredImage}`);
    ownersByFeaturedImage.set(tour.featuredImage, tour.slug);
  }
  return tours;
}

function runCli() {
  const facts = readJson(SOURCE_FACTS_PATH);
  const imagePools = {
    ...readJson(IMAGE_POOLS_PATH),
    ...(fs.existsSync(LANDMARK_IMAGE_POOLS_PATH) ? readJson(LANDMARK_IMAGE_POOLS_PATH) : {})
  };
  const tours = generateToursFromFacts(facts, imagePools);
  writeJson(OUTPUT_PATH, tours);
  console.log(`Generated ${tours.length} legal tour records at ${path.relative(projectRoot, OUTPUT_PATH)}`);
}

if (process.argv[1] === __filename) {
  runCli();
}
