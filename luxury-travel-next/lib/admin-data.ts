import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { AdminCaptureRow, AdminCloneData, AdminContentRow } from '@/components/admin/wordpress-admin-clone';
import { getContent } from '@/lib/cms';
import { getAdminSiteContentMirror } from '@/lib/admin/site-content-mirror';
import type { SiteContent } from '@/lib/site-content-schema';
import type { CmsItem } from '@/lib/types';

type LocalLeadRecord = { id?: string; status?: string; destination?: string; budget?: string; email?: string; createdAt?: string; updatedAt?: string };
type LocalBookingRecord = { id?: string; bookingId?: string; status?: string; method?: string; amount?: number; currency?: string; createdAt?: string; updatedAt?: string };

const localDataDir = process.env.LOCAL_CAPTURE_DIR || path.join(process.cwd(), '.local-data');

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function readLocalCollection<T>(fileName: string): Promise<T[]> {
  try {
    const raw = await readFile(path.join(localDataDir, fileName), 'utf8');
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed.filter(isRecord) as T[]) : [];
  } catch {
    return [];
  }
}

function formatDate(value?: string) {
  if (!value) return 'Local';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Local';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

function contentScore(item: CmsItem) {
  const validation = item.meta.validation;
  const scores = [validation?.seo_score, validation?.content_score].filter((score): score is number => typeof score === 'number');
  if (!scores.length) return null;
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

function averageScore(items: CmsItem[]) {
  const scores = items.map(contentScore).filter((score): score is number => typeof score === 'number');
  if (!scores.length) return 'N/A';
  return `${Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)}%`;
}

function truncate(value: string, max = 105) {
  return value.length > max ? `${value.slice(0, max - 3).trim()}...` : value;
}

function itemStatus(item: CmsItem) {
  return item.meta.validation?.status ? item.meta.validation.status.replace(/_/g, ' ') : 'Đã xuất bản';
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string' && entry.trim() !== '') : [];
}

function toContentRow(item: CmsItem, kind: string, href: string): AdminContentRow {
  const details = (item.meta.details || {}) as Record<string, unknown>;
  const inclusions = asStringArray(details.inclusions);
  const exclusions = asStringArray(details.exclusions);
  const googleMapsEmbed = typeof details.googleMapsEmbed === 'string' ? details.googleMapsEmbed : '';
  const tourMeta = {
    basePrice: typeof details.price === 'string' ? details.price : '',
    currency: typeof details.currency === 'string' ? details.currency : 'USD',
    duration: typeof details.duration === 'string' ? details.duration : '',
    availability: typeof details.availability === 'string' ? details.availability : 'available'
  };
  return {
    id: String(item.id),
    title: item.title,
    kind,
    status: itemStatus(item),
    author: 'admin',
    date: 'Đã xuất bản',
    href,
    slug: item.slug,
    excerpt: item.excerpt ? truncate(item.excerpt) : undefined,
    content: item.content || '',
    score: contentScore(item),
    comments: 0,
    seoTitle: item.meta.seo?.title || item.title,
    seoDescription: item.meta.seo?.description || item.excerpt || '',
    featuredImage: item.featuredImage,
    price: typeof item.meta.details?.price === 'string' ? item.meta.details.price : undefined,
    meta: {
      gallery: item.meta.gallery || [],
      itinerary: item.meta.itinerary || [],
      faq: item.meta.faq || [],
      pricing: item.meta.pricing || [],
      details,
      translations: item.meta.translations || {},
      tourMeta,
      googleMapsEmbed,
      inclusions,
      exclusions
    }
  };
}

function leadToRow(lead: LocalLeadRecord): AdminCaptureRow {
  return {
    id: lead.id || `lead-${lead.email || 'local'}`,
    title: lead.destination || 'Unspecified lead',
    kind: 'Lead',
    status: lead.status || 'WARM',
    contact: lead.email || 'unknown@example.local',
    date: formatDate(lead.createdAt || lead.updatedAt)
  };
}

function bookingToRow(booking: LocalBookingRecord): AdminCaptureRow {
  const amount = typeof booking.amount === 'number' ? booking.amount : 0;
  return {
    id: booking.id || booking.bookingId || 'booking-local',
    title: booking.bookingId || 'Pending booking',
    kind: 'Booking',
    status: booking.status || 'PENDING',
    contact: `${booking.currency || 'USD'} ${amount}`,
    date: formatDate(booking.createdAt || booking.updatedAt)
  };
}

export async function getAdminPageData(): Promise<{ data: AdminCloneData; siteContent: SiteContent }> {
  const [posts, tours, cruises, styles, leads, bookings, siteContent] = await Promise.all([
    getContent('posts'),
    getContent('tours'),
    getContent('cruises'),
    getContent('styles'),
    readLocalCollection<LocalLeadRecord>('leads.json'),
    readLocalCollection<LocalBookingRecord>('bookings.json'),
    getAdminSiteContentMirror()
  ]);

  const postRows = posts.slice(0, 40).map((post) => toContentRow(post, 'Post', `/blog/${post.slug}/`));
  const tourRows = tours.slice(0, 40).map((tour) => toContentRow(tour, 'Tour', `/${tour.slug}/`));
  const cruiseRows = cruises.slice(0, 30).map((cruise) => toContentRow(cruise, 'Cruise', `/cruise/${cruise.slug}/`));
  const styleRows = styles.slice(0, 20).map((style) => toContentRow(style, 'Page', `/${style.slug}/`));
  const allContent = [...posts, ...tours, ...cruises, ...styles];

  const data: AdminCloneData = {
    counts: { posts: posts.length, tours: tours.length, cruises: cruises.length, styles: styles.length, leads: leads.length, bookings: bookings.length },
    posts: postRows,
    pages: styleRows,
    products: [...tourRows, ...cruiseRows],
    tours: tourRows,
    cruises: cruiseRows,
    leads: leads.map(leadToRow),
    bookings: bookings.map(bookingToRow),
    recent: [...postRows.slice(0, 3), ...tourRows.slice(0, 3)].map((item) => ({ title: item.title, type: item.kind, href: item.href, date: item.date })),
    averageScore: averageScore(allContent)
  };

  return { data, siteContent };
}
