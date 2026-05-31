import { CmsItem } from './types';
import { tourHubKey } from './routing';
import { defaultSiteContent } from './site-content-schema';

function normalizeCountryKey(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const NAV_FALLBACK_BY_COUNTRY = Object.fromEntries(
  defaultSiteContent.navigation.tourChoices.map((item) => [normalizeCountryKey(item.label), item.image])
) as Record<string, string>;

const FALLBACK_BY_COUNTRY: Record<string, string> = {
  ...NAV_FALLBACK_BY_COUNTRY,
  vietnam: '/images/hubs/vietnam-hoi-an-ancient-town-4k-crisp.jpg',
  thailand: '/images/hubs/thailand-temple-4k-crisp.jpg',
  cambodia: '/images/hubs/cambodia-angkor-wat-4k-crisp.jpg',
  laos: '/images/hubs/laos-kuang-si-falls-4k-crisp.jpg',
  myanmar: '/images/hubs/myanmar-bagan-temples-4k.jpg',
  'multi-country': '/images/hubs/multi-country-mekong-4k.jpg'
};

const COUNTRY_FALLBACK_POOL: Record<string, string[]> = {
  vietnam: [
    '/images/hubs/vietnam-hoi-an-ancient-town-4k-crisp.jpg',
    '/images/hubs/vietnam-ha-long-bay-4k-crisp.jpg',
    '/images/hubs/vietnam-hue-imperial-city-4k-crisp.jpg',
    '/images/hubs/vietnam-sapa-rice-terraces-4k-crisp.jpg',
    '/images/hubs/vietnam-ninh-binh-karsts-4k-crisp.jpg',
    '/images/hubs/vietnam-mekong-delta-4k-crisp.jpg',
    '/images/collections/vietnam-ban-gioc-waterfalls-4k.jpg',
    '/images/hubs/vietnam-trang-an-river-4k-crisp.jpg'
  ],
  thailand: [
    '/images/hubs/thailand-temple-4k-crisp.jpg',
    '/images/collections/thailand-grand-palace-bangkok-4k.jpg',
    '/images/assurance/thailand-wat-arun-bangkok-4k.jpg',
    '/images/assurance-hd/thailand-ang-thong-bay-4k-hd.jpg'
  ],
  cambodia: [
    '/images/hubs/cambodia-angkor-wat-4k-crisp.jpg',
    '/images/collections/cambodia-banteay-srei-temple-4k.jpg',
    '/images/assurance/cambodia-bayon-temple-4k.jpg',
    '/images/assurance-hd/cambodia-ta-prohm-angkor-4k-hd.jpg'
  ],
  laos: [
    '/images/hubs/laos-kuang-si-falls-4k-crisp.jpg',
    '/images/collections/laos-haw-pha-bang-monks-4k.jpg',
    '/images/assurance/laos-wat-xieng-thong-4k.jpg',
    '/images/assurance-hd/laos-wat-phou-pillared-path-4k-hd.jpg'
  ],
  myanmar: [
    '/images/hubs/myanmar-bagan-temples-4k.jpg',
    '/images/trip-styles/culture-heritage-4k.jpg',
    '/images/trip-styles/luxury-stays-4k.jpg'
  ],
  indonesia: [
    NAV_FALLBACK_BY_COUNTRY.indonesia || '/images/trip-styles/beach-escapes-4k.jpg',
    '/images/trip-styles/adventure-vacations-4k.jpg',
    '/images/trip-styles/island-villas-4k.jpg',
    '/images/trip-styles/luxury-stays-4k.jpg'
  ],
  malaysia: [
    NAV_FALLBACK_BY_COUNTRY.malaysia || '/images/trip-styles/city-breaks-4k.jpg',
    '/images/trip-styles/city-breaks-4k.jpg',
    '/images/trip-styles/luxury-stays-4k.jpg'
  ],
  singapore: [
    NAV_FALLBACK_BY_COUNTRY.singapore || '/images/trip-styles/city-breaks-4k.jpg',
    '/images/trip-styles/city-breaks-4k.jpg',
    '/images/trip-styles/luxury-stays-4k.jpg'
  ],
  philippines: [
    NAV_FALLBACK_BY_COUNTRY.philippines || '/images/trip-styles/beach-escapes-4k.jpg',
    '/images/trip-styles/beach-escapes-4k.jpg',
    '/images/trip-styles/island-villas-4k.jpg',
    '/images/trip-styles/adventure-vacations-4k.jpg'
  ],
  china: [
    NAV_FALLBACK_BY_COUNTRY.china || '/images/trip-styles/culture-heritage-4k.jpg',
    '/images/trip-styles/culture-heritage-4k.jpg',
    '/images/trip-styles/city-breaks-4k.jpg'
  ],
  'hong-kong': [
    NAV_FALLBACK_BY_COUNTRY['hong-kong'] || '/images/trip-styles/city-breaks-4k.jpg',
    '/images/trip-styles/city-breaks-4k.jpg',
    '/images/trip-styles/luxury-stays-4k.jpg'
  ],
  japan: [
    NAV_FALLBACK_BY_COUNTRY.japan || '/images/trip-styles/culture-heritage-4k.jpg',
    '/images/trip-styles/culture-heritage-4k.jpg',
    '/images/trip-styles/photography-trips-4k.jpg',
    '/images/trip-styles/rail-journeys-4k.jpg'
  ],
  'south-korea': [
    NAV_FALLBACK_BY_COUNTRY['south-korea'] || '/images/trip-styles/city-breaks-4k.jpg',
    '/images/trip-styles/city-breaks-4k.jpg',
    '/images/trip-styles/luxury-stays-4k.jpg'
  ],
  bhutan: [
    NAV_FALLBACK_BY_COUNTRY.bhutan || '/images/trip-styles/mountain-retreats-4k.jpg',
    '/images/trip-styles/mountain-retreats-4k.jpg',
    '/images/trip-styles/wellness-spa-4k.jpg'
  ],
  nepal: [
    NAV_FALLBACK_BY_COUNTRY.nepal || '/images/trip-styles/mountain-retreats-4k.jpg',
    '/images/trip-styles/mountain-retreats-4k.jpg',
    '/images/trip-styles/adventure-vacations-4k.jpg'
  ],
  india: [
    NAV_FALLBACK_BY_COUNTRY.india || '/images/trip-styles/culture-heritage-4k.jpg',
    '/images/trip-styles/culture-heritage-4k.jpg',
    '/images/trip-styles/luxury-stays-4k.jpg'
  ],
  'sri-lanka': [
    NAV_FALLBACK_BY_COUNTRY['sri-lanka'] || '/images/trip-styles/beach-escapes-4k.jpg',
    '/images/trip-styles/beach-escapes-4k.jpg',
    '/images/trip-styles/wildlife-safari-4k.jpg'
  ],
  'multi-country': [
    '/images/collections/multi-country-mekong-sunset-4k.jpg',
    '/images/collections/tailor-made-private-pool-asia-4k.jpg',
    '/images/hubs/vietnam-hoi-an-ancient-town-4k-crisp.jpg',
    '/images/hubs/cambodia-angkor-wat-4k-crisp.jpg',
    '/images/hubs/thailand-temple-4k-crisp.jpg',
    '/images/hubs/laos-kuang-si-falls-4k-crisp.jpg'
  ],
  default: [
    '/images/hubs/vietnam-hoi-an-ancient-town-4k-crisp.jpg',
    '/images/collections/multi-country-mekong-sunset-4k.jpg',
    '/images/trip-styles/luxury-stays-4k.jpg'
  ]
};

const STYLE_FALLBACK_POOL: Record<string, string[]> = {
  adventure: [
    '/images/trip-styles/adventure-vacations-4k.jpg',
    '/images/trip-styles/mountain-retreats-4k.jpg',
    '/images/collections/vietnam-ban-gioc-waterfalls-4k.jpg'
  ],
  beach: [
    '/images/trip-styles/beach-escapes-4k.jpg',
    '/images/trip-styles/island-villas-4k.jpg',
    '/images/assurance-hd/thailand-ang-thong-bay-4k-hd.jpg'
  ],
  culture: [
    '/images/trip-styles/culture-heritage-4k.jpg',
    '/images/collections/cambodia-banteay-srei-temple-4k.jpg',
    '/images/assurance/cambodia-bayon-temple-4k.jpg'
  ],
  culinary: [
    '/images/trip-styles/culinary-journeys-4k.jpg',
    '/images/hubs/vietnam-hoi-an-ancient-town-4k-crisp.jpg',
    '/images/assurance/vietnam-golden-bridge-da-nang-4k.jpg'
  ],
  cruise: [
    '/images/trip-styles/cruise-voyages-4k.jpg',
    '/images/booking/vietnam-ha-long-kayaks-4k.jpg',
    '/images/hubs/vietnam-ha-long-bay-4k-crisp.jpg'
  ],
  family: [
    '/images/trip-styles/family-holidays-4k.jpg',
    '/images/collections/thailand-grand-palace-bangkok-4k.jpg',
    '/images/hubs/vietnam-ha-long-bay-4k-crisp.jpg'
  ],
  golf: [
    '/images/trip-styles/golf-holidays-4k.jpg',
    '/images/trip-styles/luxury-stays-4k.jpg',
    '/images/collections/tailor-made-private-pool-asia-4k.jpg'
  ],
  honeymoon: [
    '/images/trip-styles/honeymoon-4k.jpg',
    '/images/trip-styles/island-villas-4k.jpg',
    '/images/collections/tailor-made-private-pool-asia-4k.jpg'
  ],
  luxury: [
    '/images/trip-styles/luxury-stays-4k.jpg',
    '/images/trip-styles/celebration-trips-4k.jpg',
    '/images/collections/tailor-made-private-pool-asia-4k.jpg'
  ],
  wellness: [
    '/images/trip-styles/wellness-spa-4k.jpg',
    '/images/trip-styles/luxury-stays-4k.jpg',
    '/images/assurance-hd/vietnam-ha-giang-limestone-landscape-4k-hd.jpg'
  ],
  wildlife: [
    '/images/trip-styles/wildlife-safari-4k.jpg',
    '/images/hubs/vietnam-ninh-binh-karsts-4k-crisp.jpg',
    '/images/hubs/vietnam-trang-an-river-4k-crisp.jpg'
  ],
  photography: [
    '/images/trip-styles/photography-trips-4k.jpg',
    '/images/hubs/vietnam-sapa-rice-terraces-4k-crisp.jpg',
    '/images/assurance-ultra/vietnam-phong-nha-cave-4k-ultra.jpg'
  ],
  rail: [
    '/images/trip-styles/rail-journeys-4k.jpg',
    '/images/hubs/vietnam-trang-an-river-4k-crisp.jpg',
    '/images/hubs/vietnam-ninh-binh-karsts-4k-crisp.jpg'
  ],
  city: [
    '/images/trip-styles/city-breaks-4k.jpg',
    '/images/collections/thailand-grand-palace-bangkok-4k.jpg',
    '/images/hubs/vietnam-hue-imperial-city-4k-crisp.jpg'
  ],
  mountain: [
    '/images/trip-styles/mountain-retreats-4k.jpg',
    '/images/hubs/vietnam-sapa-rice-terraces-4k-crisp.jpg',
    '/images/hubs/laos-kuang-si-falls-4k-crisp.jpg'
  ],
  default: [
    '/images/trip-styles/luxury-stays-4k.jpg',
    '/images/collections/multi-country-mekong-sunset-4k.jpg',
    '/images/collections/tailor-made-private-pool-asia-4k.jpg'
  ]
};

function cleanImageSrc(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter((value) => value.trim().length > 0)));
}

function parseImageDimensions(src: string) {
  const decoded = decodeURIComponent(src);
  const widthQuery = decoded.match(/[?&](?:w|width)=([1-9]\d{2,4})\b/i);
  const sizeSuffix = decoded.match(/[-_/](\d{3,5})-(\d{3,5})(?:\.(?:avif|jpe?g|png|webp))?(?:[?#].*)?$/i);
  const wikimediaWidth = decoded.match(/\/([1-9]\d{2,4})px-/i);
  const width = Number(widthQuery?.[1] || sizeSuffix?.[1] || wikimediaWidth?.[1] || 0) || undefined;
  const height = Number(sizeSuffix?.[2] || 0) || undefined;

  return { width, height };
}

function styleImagePool(tour: CmsItem) {
  const details = tour.meta.details || {};
  const haystack = [
    tour.title,
    tour.slug,
    tour.excerpt,
    tour.content,
    String(details.style || ''),
    String(details.theme || '')
  ]
    .join(' ')
    .toLowerCase();

  const selected: string[] = [];
  const pushPool = (pattern: RegExp, images: string[]) => {
    if (pattern.test(haystack)) selected.push(...images);
  };

  pushPool(/\b(wellness|spa|herbal|healing)\b/, STYLE_FALLBACK_POOL.wellness);
  pushPool(/\b(culinary|food|cooking)\b/, STYLE_FALLBACK_POOL.culinary);
  pushPool(/\b(cruise|bay|river)\b/, STYLE_FALLBACK_POOL.cruise);
  pushPool(/\bfamily\b/, STYLE_FALLBACK_POOL.family);
  pushPool(/\bgolf\b/, STYLE_FALLBACK_POOL.golf);
  pushPool(/\b(honeymoon|romantic|couple)\b/, STYLE_FALLBACK_POOL.honeymoon);
  pushPool(/\b(adventure|trek|bike|motor)\b/, STYLE_FALLBACK_POOL.adventure);
  pushPool(/\b(beach|island|diving|marine)\b/, STYLE_FALLBACK_POOL.beach);
  pushPool(/\b(culture|heritage|temple|history)\b/, STYLE_FALLBACK_POOL.culture);
  pushPool(/\b(photo|photography)\b/, STYLE_FALLBACK_POOL.photography);
  pushPool(/\b(rail|train)\b/, STYLE_FALLBACK_POOL.rail);
  pushPool(/\b(city|urban)\b/, STYLE_FALLBACK_POOL.city);
  pushPool(/\bmountain\b/, STYLE_FALLBACK_POOL.mountain);
  pushPool(/\b(wildlife|safari)\b/, STYLE_FALLBACK_POOL.wildlife);
  pushPool(/\b(luxury|premium)\b/, STYLE_FALLBACK_POOL.luxury);

  return uniqueStrings(selected.length ? selected : STYLE_FALLBACK_POOL.default);
}

function countryImagePool(country: string) {
  return uniqueStrings(COUNTRY_FALLBACK_POOL[normalizeCountryKey(country)] || COUNTRY_FALLBACK_POOL.default);
}

function imagePoolForTour(tour: CmsItem) {
  const country = tourHubKey(tour);
  return uniqueStrings([...countryImagePool(country), ...styleImagePool(tour), countryTourImageFallback(country)]);
}

export function countryTourImageFallback(country: string) {
  const key = normalizeCountryKey(country);
  if (key.includes('indochina') || key.includes('multi-country')) return FALLBACK_BY_COUNTRY['multi-country'];
  return FALLBACK_BY_COUNTRY[key] || FALLBACK_BY_COUNTRY['multi-country'];
}

export function isLowResolutionTourImage(src: unknown) {
  const value = cleanImageSrc(src);
  if (!value) return true;
  if (value.startsWith('/')) return false;

  const lower = value.toLowerCase();
  const { width, height } = parseImageDimensions(value);

  if (width && width < 1600) return true;
  if (height && height < 900) return true;
  if (/d2lwt6tidfiof0\.cloudfront\.net|bestpricetravel|d122axpxm39woi/i.test(lower)) return true;
  if (/\/(?:820|1389|1500|1920)px-/i.test(lower)) return true;

  return false;
}

export function tourDisplayImage(tour: CmsItem, src?: string, index = 0) {
  const value = cleanImageSrc(src) || cleanImageSrc(tour.featuredImage);
  if (value && !isLowResolutionTourImage(value)) return value;

  const pool = imagePoolForTour(tour);
  return pool[index % pool.length] || value || countryTourImageFallback(tourHubKey(tour));
}

export function tourDisplayImages(tour: CmsItem, sources: unknown[] = []) {
  const rawSources = (sources.length ? sources : [tour.featuredImage, ...(Array.isArray(tour.meta.gallery) ? tour.meta.gallery : [])])
    .map((src) => cleanImageSrc(src))
    .filter(Boolean);
  const pool = imagePoolForTour(tour);
  const resolved = rawSources.map((src, index) => (src && !isLowResolutionTourImage(src) ? src : pool[index % pool.length] || src));

  return uniqueStrings([...resolved, ...pool]);
}

export function isRuntimeSafeTourImage(src: unknown) {
  return typeof src === 'string' && src.trim().length > 0 && !/upload\.wikimedia\.org/i.test(src);
}

export function tourImageFallbacks(tour: CmsItem, primary?: string) {
  return imagePoolForTour(tour).filter((src) => src !== primary && isRuntimeSafeTourImage(src));
}
