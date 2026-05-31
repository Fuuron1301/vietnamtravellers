import { CmsItem, HubKey } from './types';

export const hubOrder: Array<{ key: HubKey; label: string; path: string }> = [
  { key: 'vietnam', label: 'Vietnam Tours', path: '/vietnam-tours/' },
  { key: 'laos', label: 'Laos Tours', path: '/laos-tours/' },
  { key: 'cambodia', label: 'Cambodia Tours', path: '/cambodia-tours/' },
  { key: 'thailand', label: 'Thailand Tours', path: '/thailand-tours/' },
  { key: 'myanmar', label: 'Myanmar Tours', path: '/myanmar-tours/' },
  { key: 'indonesia', label: 'Indonesia Tours', path: '/indonesia-tours/' },
  { key: 'malaysia', label: 'Malaysia Tours', path: '/malaysia-tours/' },
  { key: 'singapore', label: 'Singapore Tours', path: '/singapore-tours/' },
  { key: 'philippines', label: 'Philippines Tours', path: '/philippines-tours/' },
  { key: 'china', label: 'China Tours', path: '/china-tours/' },
  { key: 'hong-kong', label: 'Hong Kong Tours', path: '/hong-kong-tours/' },
  { key: 'japan', label: 'Japan Tours', path: '/japan-tours/' },
  { key: 'south-korea', label: 'South Korea Tours', path: '/south-korea-tours/' },
  { key: 'bhutan', label: 'Bhutan Tours', path: '/bhutan-tours/' },
  { key: 'nepal', label: 'Nepal Tours', path: '/nepal-tours/' },
  { key: 'india', label: 'India Tours', path: '/india-tours/' },
  { key: 'sri-lanka', label: 'Sri Lanka Tours', path: '/sri-lanka-tours/' },
  { key: 'multi-country', label: 'Multi Country Tours', path: '/multi-country-tours/' }
];

export function hubPath(key: HubKey) {
  return hubOrder.find((hub) => hub.key === key)?.path || '/multi-country-tours/';
}

export function hubKeyFromPathSlug(slug: string): HubKey | null {
  const normalized = slug.trim().replace(/^\/+|\/+$/g, '');
  const match = hubOrder.find((hub) => hub.path.replace(/^\/+|\/+$/g, '') === normalized);
  return match?.key ?? null;
}

const countryHubKeys: Exclude<HubKey, 'multi-country'>[] = hubOrder.filter((hub): hub is typeof hub & { key: Exclude<HubKey, 'multi-country'> } => hub.key !== 'multi-country').map((hub) => hub.key);

const multiCountrySignals = ['multi-country', 'multi country', 'indochina', 'southeast asia'];
const sourcePathHubOverrides: Partial<Record<string, HubKey>> = {
  'cambodia-tours': 'cambodia',
  'phnom-penh-tours': 'cambodia',
  'battambang-tours': 'cambodia',
  'phuket-tours': 'thailand'
};

export const hubSearchTerms: Record<HubKey, string[]> = {
  vietnam: ['vietnam', 'viet nam', 'ha long', 'halong', 'hanoi', 'hoi an', 'hue', 'sapa', 'ninh binh', 'da nang', 'saigon', 'ho chi minh', 'mekong delta', 'can tho', 'cu chi', 'phu quoc', 'mui ne', 'nha trang', 'da lat', 'ha giang', 'cao bang', 'mai chau', 'pu luong'],
  thailand: ['thailand', 'bangkok', 'chiang mai', 'phuket', 'krabi', 'samui', 'ayutthaya', 'pattaya', 'phi phi', 'wat chalong'],
  cambodia: ['cambodia', 'angkor', 'siem reap', 'phnom penh', 'battambang', 'sihanoukville', 'sihanouk', 'tonle sap', 'phnom sampeau', 'wat banan', 'koh rong', 'koh ker', 'banteay srei', 'banteay samre'],
  laos: ['luang prabang', 'vang vieng', 'vientiane', 'kuang si', 'pak ou'],
  myanmar: ['myanmar', 'bagan', 'yangon', 'mandalay', 'inle lake'],
  indonesia: ['indonesia', 'bali', 'ubud', 'java', 'borobudur', 'yogyakarta', 'komodo', 'lombok'],
  malaysia: ['malaysia', 'kuala lumpur', 'penang', 'malacca', 'langkawi', 'kuching'],
  singapore: ['singapore', 'marina bay', 'gardens by the bay', 'sentosa'],
  philippines: ['philippines', 'palawan', 'el nido', 'coron', 'cebu', 'bohol', 'manila'],
  china: ['beijing', 'xian', 'xi an', 'shanghai', 'guilin', 'chengdu', 'zhangjiajie'],
  'hong-kong': ['hong kong', 'hong-kong', 'victoria harbour', 'the peak', 'mong kok', 'lantau'],
  japan: ['japan', 'tokyo', 'kyoto', 'osaka', 'hakone', 'hiroshima', 'nara'],
  'south-korea': ['south korea', 'south-korea', 'seoul', 'busan', 'gyeongju', 'jeju', 'korea'],
  bhutan: ['bhutan', 'paro', 'thimphu', 'punakha', 'tiger nest'],
  nepal: ['nepal', 'kathmandu', 'pokhara', 'chitwan', 'annapurna', 'sarangkot'],
  india: ['india', 'delhi', 'agra', 'jaipur', 'rajasthan', 'kerala', 'mumbai'],
  'sri-lanka': ['sri lanka', 'sri-lanka', 'sigiriya', 'kandy', 'ella', 'yala', 'galle'],
  'multi-country': multiCountrySignals
};

const titleCountrySignals: Record<Exclude<HubKey, 'multi-country'>, string[]> = {
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
};

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasSearchTerm(text: string, term: string) {
  const normalizedText = ` ${normalizeSearchText(text)} `;
  const normalizedTerm = normalizeSearchText(term);
  if (!normalizedTerm) return false;
  return normalizedText.includes(` ${normalizedTerm} `);
}

function hubKeyFromCountryValue(value: string): HubKey | null {
  const text = value.trim();
  if (!text) return null;
  if (multiCountrySignals.some((term) => hasSearchTerm(text, term))) return 'multi-country';
  const normalizedText = normalizeSearchText(text);
  for (const key of countryHubKeys) {
    const normalizedKey = normalizeSearchText(key.replace(/-/g, ' '));
    if (normalizedText === normalizedKey) return key;
  }
  for (const key of countryHubKeys) {
    if (hubSearchTerms[key].some((term) => hasSearchTerm(text, term))) return key;
  }
  return null;
}

function hubKeyFromSourceUrl(value: string): HubKey | null {
  if (!value.trim()) return null;
  try {
    const segment = new URL(value).pathname.split('/').filter(Boolean)[0] || '';
    return sourcePathHubOverrides[segment] || null;
  } catch {
    return null;
  }
}

function hubMatchesFromText(text: string, termsByKey: Partial<Record<Exclude<HubKey, 'multi-country'>, string[]>>) {
  return countryHubKeys.filter((key) => (termsByKey[key] || []).some((term) => hasSearchTerm(text, term)));
}

function hubKeyFromTourSignals(tour: CmsItem): HubKey | null {
  const details = tour.meta.details || {};
  const routeText = [
    String(details.route || ''),
    Array.isArray(details.places) ? details.places.join(' ') : ''
  ].join(' ');
  const titleText = [tour.slug, tour.title].join(' ');
  const routeMatches = hubMatchesFromText(routeText, hubSearchTerms);
  const titleMatches = hubMatchesFromText(titleText, titleCountrySignals);
  const combinedMatches = new Set([...routeMatches, ...titleMatches]);

  if (routeMatches.length > 1 || titleMatches.length > 1 || combinedMatches.size > 1) return 'multi-country';
  if (routeMatches.length === 1) return routeMatches[0];
  if (multiCountrySignals.some((term) => hasSearchTerm(`${routeText} ${titleText}`, term))) return 'multi-country';
  return null;
}

export function tourHubKey(tour: CmsItem): HubKey {
  const details = tour.meta.details || {};
  const signalCountry = hubKeyFromTourSignals(tour);
  if (signalCountry) return signalCountry;

  const rawCountry = hubKeyFromCountryValue(String(details.country || ''));
  if (rawCountry) return rawCountry;

  const sourceCountry = hubKeyFromSourceUrl(String(details.sourceUrl || ''));
  if (sourceCountry) return sourceCountry;

  return 'multi-country';
}

export function tourPath(tour: CmsItem) {
  return `${hubPath(tourHubKey(tour))}${tour.slug}/`;
}

export function flatTourPath(tour: CmsItem) {
  return `/${tour.slug}/`;
}
