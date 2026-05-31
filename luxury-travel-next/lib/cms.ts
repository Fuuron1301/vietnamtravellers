import { fallbackCruises, fallbackPosts, fallbackStyles, fallbackTestimonials, fallbackTours } from './fallback-data';
import { unstable_noStore as noStore } from 'next/cache';
import { readAdminContentStore, type AdminContentStore } from './admin-content-store';
import { getDatabaseContent } from './cms-db';
import { defaultLocale, normalizeLocale } from './i18n';
import { localizeCmsItems } from './locale-content';
import { storeLocalBooking, storeLocalLead } from './local-capture';
import { getRequestLocale } from './request-locale';
import { CmsItem } from './types';
import { normalizeCmsItems } from './validated-cms';

const API_BASE = process.env.WORDPRESS_API_URL;
const allowDemoFallback = process.env.ALLOW_DEMO_FALLBACK === 'true';
const allowStaticTourCatalog = process.env.ALLOW_STATIC_TOUR_CATALOG === 'true';

const fallback: Record<string, CmsItem[]> = {
  tours: fallbackTours,
  styles: fallbackStyles,
  testimonials: fallbackTestimonials,
  posts: fallbackPosts,
  cruises: fallbackCruises,
  countries: []
};

type CmsCollectionType = keyof typeof fallback;

export function normalizeSlug(value: string): string {
  return value.trim().replace(/^\/+|\/+$/g, '').split('/').pop() || '';
}

function canUseFallback(type: CmsCollectionType): boolean {
  if (allowDemoFallback) return true;
  if (process.env.NODE_ENV !== 'production') return true;
  return type === 'tours' && allowStaticTourCatalog;
}

async function fetchJson<T>(path: string, fallbackAllowed = false): Promise<T | null> {
  if (!API_BASE) {
    if (process.env.NODE_ENV === 'production' && !fallbackAllowed) {
      console.warn(`[cms] WORDPRESS_API_URL missing for ${path}; production fallback is disabled.`);
    }
    return null;
  }
  try {
    const response = await fetch(`${API_BASE}${path}`, { next: { revalidate: 300 } });
    if (!response.ok) {
      console.warn(`[cms] ${path} returned HTTP ${response.status}`);
      return null;
    }
    return (await response.json()) as T;
  } catch (error) {
    console.warn(`[cms] ${path} fetch failed: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

function mergeLocalContent(localItems: CmsItem[], sourceItems: CmsItem[], deletedSlugs: Set<string>) {
  const localSlugs = new Set(localItems.map((item) => item.slug).filter(Boolean));
  return [
    ...localItems.filter((item) => !deletedSlugs.has(item.slug)),
    ...sourceItems.filter((item) => !localSlugs.has(item.slug) && !deletedSlugs.has(item.slug))
  ];
}

function isSeededPublicRecord(item: CmsItem) {
  const haystack = `${item.id} ${item.slug} ${item.title} ${item.excerpt} ${item.content}`.toLowerCase();
  return (
    item.slug.startsWith('smoke-') ||
    haystack.includes('a seeded blog post used to verify') ||
    haystack.includes('a cms-seeded page for testing') ||
    haystack.includes('a seeded tour used to verify') ||
    haystack.includes('seeded by the local cms setup')
  );
}

async function getSourceItems(type: CmsCollectionType, fallbackAllowed: boolean) {
  if (!fallbackAllowed) return [];
  const remote = await fetchJson<unknown>(`/content/${type}`, fallbackAllowed);
  const normalized = normalizeCmsItems(remote);
  return normalized.length ? normalized : fallback[type] ?? [];
}

export async function getContent(type: CmsCollectionType, locale?: string | null): Promise<CmsItem[]> {
  noStore();
  const requestLocale = locale ? normalizeLocale(locale, defaultLocale) : await getRequestLocale(defaultLocale);
  const databaseItems = await getDatabaseContent(type);
  const fallbackAllowed = canUseFallback(type);
  if (!fallbackAllowed) return localizeCmsItems(databaseItems ?? [], requestLocale);

  const sourceItems = await getSourceItems(type, fallbackAllowed);
  const localStore = await readAdminContentStore() as AdminContentStore & Partial<Record<CmsCollectionType, unknown>>;
  const localItems = normalizeCmsItems(localStore[type]);
  const deleted = localStore.deleted as Partial<Record<string, string[]>> | undefined;
  const deletedSlugs = new Set(Array.isArray(deleted?.[type]) ? deleted[type] : []);
  const authoredItems = mergeLocalContent((databaseItems ?? []).filter((item) => !isSeededPublicRecord(item)), localItems, deletedSlugs);
  return localizeCmsItems(mergeLocalContent(authoredItems, sourceItems, deletedSlugs), requestLocale);
}

export async function getSingle(type: CmsCollectionType, slug: string, locale?: string | null): Promise<CmsItem | null> {
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) return null;
  const items = await getContent(type, locale);
  return items.find((item) => item.slug === normalizedSlug) ?? null;
}

export async function submitLead(payload: unknown) {
  if (!API_BASE) {
    return storeLocalLead(payload);
  }
  const response = await fetch(`${API_BASE}/lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error('Lead submission failed');
  return response.json();
}

export async function submitBooking(payload: unknown) {
  if (!API_BASE) {
    return storeLocalBooking(payload);
  }
  const response = await fetch(`${API_BASE}/booking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error('Booking creation failed');
  return response.json();
}
