import type { CmsItem, LeadPayload } from './types';
import { hubOrder, tourHubKey } from './routing';

export type BookingTourCandidate = {
  slug: string;
  title: string;
  href: string;
  country: string;
  route: string;
  places: string[];
  durationLabel: string;
  durationDays: number;
  style: string;
  priceFromUsd: number;
  featuredImage: string;
  excerpt: string;
  highlights: string[];
};

export type BookingTourMatch = BookingTourCandidate & {
  score: number;
  reasons: string[];
  paymentAmountUsd: number;
};

export type BookingMatchProfile = Pick<
  LeadPayload,
  'destinations' | 'routeFocus' | 'duration' | 'style' | 'budget' | 'interests' | 'pace' | 'hotel'
>;

type Range = {
  min: number;
  max: number;
};

const styleAliases: Record<string, string[]> = {
  luxury: ['luxury', 'luxury stays', 'iconic luxury', '5-star boutique'],
  culture: ['culture', 'culture & heritage', 'heritage and temples', 'temples and heritage'],
  adventure: ['adventure', 'adventure vacations', 'active', 'wildlife and nature', 'northern mountains'],
  beach: ['beach vacation', 'beach escapes', 'beach and islands', 'beach and island recovery'],
  culinary: ['culinary', 'culinary journeys', 'food and markets'],
  family: ['family', 'family holidays'],
  private: ['private', 'private group', 'friends / private group', 'couple', 'solo traveler']
};

const routeKeywords: Record<string, string[]> = {
  'Classic highlights': ['hanoi', 'bangkok', 'siem reap', 'hoi an', 'hue', 'yangon', 'mandalay', 'classic', 'heritage'],
  'Northern mountains': ['sapa', 'ha giang', 'mai chau', 'mountain', 'northwest', 'northern', 'trek'],
  'Bay and river journeys': ['ha long', 'halong', 'lan ha', 'mekong', 'river', 'bay', 'cruise', 'water'],
  'Temples and heritage': ['angkor', 'temple', 'hue', 'bagan', 'luang prabang', 'heritage', 'pagoda'],
  'Beach and island recovery': ['beach', 'island', 'phuket', 'koh samui', 'phu quoc', 'krabi', 'coast'],
  'Cross-border Indochina': ['multi-country', 'indochina', 'border', 'vietnam', 'cambodia', 'laos', 'thailand']
};

const interestKeywords: Record<string, string[]> = {
  'Food and markets': ['food', 'market', 'cooking', 'culinary', 'coffee'],
  'Cruise and water': ['cruise', 'water', 'bay', 'river', 'mekong', 'halong', 'ha long'],
  'Wellness and spa': ['wellness', 'spa', 'retreat', 'healing'],
  'Heritage and temples': ['heritage', 'temple', 'angkor', 'hue', 'bagan', 'luang prabang'],
  'Beach and islands': ['beach', 'island', 'coast', 'phuket', 'samui', 'phu quoc'],
  'Wildlife and nature': ['nature', 'wildlife', 'cave', 'waterfall', 'park', 'forest'],
  Photography: ['photo', 'scenic', 'viewpoint', 'landscape'],
  'Local craft': ['craft', 'village', 'artisan', 'textile'],
  'Trains and scenic transfers': ['train', 'rail', 'transfer', 'scenic'],
  'Golf and special access': ['golf', 'special access', 'tee']
};

const countryPaths = Object.fromEntries(hubOrder.map((hub) => [hub.key, hub.path])) as Record<string, string>;

function normalize(value: unknown) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9+]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function readNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : [];
}

function containsAny(haystack: string, needles: string[]) {
  const normalizedHaystack = normalize(haystack);
  return needles.some((needle) => normalizedHaystack.includes(normalize(needle)));
}

function styleFamily(value: string) {
  const normalizedValue = normalize(value);
  for (const [family, aliases] of Object.entries(styleAliases)) {
    if (aliases.some((alias) => normalizedValue.includes(normalize(alias)))) return family;
  }
  return normalizedValue;
}

export function parseDurationRange(label: string): Range {
  const normalizedLabel = normalize(label);
  const numbers = normalizedLabel.match(/\d+/g)?.map(Number) || [];
  if (!numbers.length) return { min: 0, max: 60 };
  if (normalizedLabel.includes('+')) return { min: numbers[0], max: 60 };
  if (numbers.length >= 2) return { min: numbers[0], max: numbers[1] };
  return { min: numbers[0], max: numbers[0] };
}

export function parseBudgetRange(label: string): Range {
  if (normalize(label).includes('advise')) return { min: 0, max: 1000000 };
  const numbers = label.match(/\d[\d,]*/g)?.map((value) => Number(value.replace(/,/g, ''))) || [];
  if (!numbers.length) return { min: 0, max: 1000000 };
  if (label.includes('+')) return { min: numbers[0], max: 1000000 };
  if (numbers.length >= 2) return { min: numbers[0], max: numbers[1] };
  return { min: numbers[0], max: numbers[0] };
}

function rangeContains(range: Range, value: number) {
  if (!value) return false;
  return value >= range.min && value <= range.max;
}

function rangeDistance(range: Range, value: number) {
  if (!value || rangeContains(range, value)) return 0;
  return value < range.min ? range.min - value : value - range.max;
}

function candidateHref(hubKey: string, slug: string) {
  return `${countryPaths[hubKey] || '/multi-country-tours/'}${slug}/`;
}

export function createBookingTourCatalog(tours: CmsItem[]): BookingTourCandidate[] {
  return tours.map((tour) => {
    const details = tour.meta.details || {};
    const places = readStringArray(details.places);
    const durationLabel = String(details.duration || 'Tailor-made');
    const durationDays = parseDurationRange(durationLabel).min;
    const priceFromUsd = readNumber(details.priceFromUsd);
    const country = tourHubKey(tour);

    return {
      slug: tour.slug,
      title: tour.title,
      href: candidateHref(country, tour.slug),
      country,
      route: String(details.route || ''),
      places,
      durationLabel,
      durationDays,
      style: String(details.style || ''),
      priceFromUsd,
      featuredImage: tour.featuredImage,
      excerpt: tour.excerpt,
      highlights: readStringArray(details.highlights).slice(0, 3)
    };
  });
}

function destinationMatches(destination: string, country: string) {
  const normalizedDestination = normalize(destination);
  if (!normalizedDestination) return false;
  if (normalizedDestination === 'multi country') {
    return country.includes('multi') || country.includes('indochina');
  }
  return country.includes(normalizedDestination);
}

function scoreTour(profile: BookingMatchProfile, tour: BookingTourCandidate): BookingTourMatch {
  let score = 0;
  const reasons: string[] = [];
  const haystack = [
    tour.title,
    tour.excerpt,
    tour.country,
    tour.route,
    tour.style,
    tour.durationLabel,
    tour.places.join(' '),
    tour.highlights.join(' ')
  ].join(' ');

  if (profile.destinations.some((destination) => destinationMatches(destination, tour.country))) {
    score += 42;
    reasons.push(`Matches ${profile.destinations.join(', ')}`);
  }

  const requestedDuration = parseDurationRange(profile.duration);
  if (rangeContains(requestedDuration, tour.durationDays)) {
    score += 22;
    reasons.push(`Fits ${profile.duration} duration`);
  } else {
    const distance = rangeDistance(requestedDuration, tour.durationDays);
    if (distance <= 2) {
      score += 10;
      reasons.push('Close duration fit');
    }
  }

  if (styleFamily(profile.style) && styleFamily(profile.style) === styleFamily(tour.style)) {
    score += 18;
    reasons.push(`Aligned with ${profile.style}`);
  } else if (containsAny(haystack, styleAliases[styleFamily(profile.style)] || [profile.style])) {
    score += 10;
    reasons.push('Similar travel style');
  }

  const budget = parseBudgetRange(profile.budget);
  if (rangeContains(budget, tour.priceFromUsd)) {
    score += 14;
    reasons.push(`Within ${profile.budget}`);
  } else if (tour.priceFromUsd && rangeDistance(budget, tour.priceFromUsd) <= 800) {
    score += 6;
    reasons.push('Near preferred budget');
  }

  for (const focus of profile.routeFocus) {
    const keywords = routeKeywords[focus] || [focus];
    if (containsAny(haystack, keywords)) {
      score += 8;
      reasons.push(focus);
      break;
    }
  }

  for (const interest of profile.interests) {
    const keywords = interestKeywords[interest] || [interest];
    if (containsAny(haystack, keywords)) {
      score += 6;
      reasons.push(interest);
      break;
    }
  }

  if (normalize(profile.pace).includes('active') && containsAny(haystack, ['trek', 'bike', 'cycling', 'adventure'])) {
    score += 4;
  }
  if (normalize(profile.hotel).includes('luxury') && containsAny(haystack, ['luxury', 'premium', 'signature'])) {
    score += 4;
  }

  return {
    ...tour,
    score,
    reasons: reasons.slice(0, 4),
    paymentAmountUsd: tour.priceFromUsd || 300
  };
}

export function matchBookingTours(
  profile: BookingMatchProfile,
  catalog: BookingTourCandidate[],
  limit = 4
): BookingTourMatch[] {
  return catalog
    .map((tour) => scoreTour(profile, tour))
    .sort((a, b) => b.score - a.score || b.priceFromUsd - a.priceFromUsd || a.title.localeCompare(b.title))
    .slice(0, limit);
}
