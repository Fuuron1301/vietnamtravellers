import { CmsPostType } from '@prisma/client';
import { unstable_noStore as noStore } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { normalizeBlockTree } from '@/lib/blocks/cms-runtime';
import type { CmsItem } from '@/lib/types';

type PublicCollection = 'posts' | 'styles' | 'tours' | 'products' | 'cruises';

const collectionToPostType: Record<PublicCollection, CmsPostType> = {
  posts: 'POST',
  styles: 'PAGE',
  tours: 'TOUR',
  products: 'PRODUCT',
  cruises: 'CRUISE'
};

function canUseDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function mapStatus(status: string): CmsItem['meta']['validation'] {
  if (status === 'PUBLISHED') return { status: 'synced', completion: 100, seo_score: 90, content_score: 90 };
  if (status === 'SCHEDULED') return { status: 'partial', completion: 80, seo_score: 80, content_score: 80 };
  return { status: 'outdated', completion: 50, seo_score: 60, content_score: 60 };
}

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function readNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.]/g, ''));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function readArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function readRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function readMetaMap(meta: Array<{ key: string; value: unknown }>) {
  return meta.reduce<Record<string, unknown>>((acc, entry) => {
    acc[entry.key] = entry.value;
    return acc;
  }, {});
}

function readRecordStrings(value: unknown) {
  const source = readRecord(value);
  return Object.fromEntries(Object.entries(source).map(([key, entry]) => [key, readString(entry)]).filter(([, entry]) => entry));
}

function readMediaUrl(value: unknown) {
  if (typeof value === 'string') return value.trim();
  if (value && typeof value === 'object' && 'url' in value) return readString((value as { url?: unknown }).url);
  return '';
}

function formatTourPrice(basePrice: unknown, currency: unknown) {
  const price = readNumber(basePrice);
  if (!price) return '';
  const currencyCode = readString(currency, 'USD').toUpperCase();
  return `${currencyCode} ${Math.round(price).toLocaleString('en-US')}`;
}

function dbPostToCmsItem(post: Awaited<ReturnType<typeof getDbPostsRaw>>[number]): CmsItem {
  const categoryNames = post.categories.map((entry) => entry.category.name).filter(Boolean);
  const primaryCategory = categoryNames[0] || '';
  const metaMap = readMetaMap(post.meta || []);
  const mirrorRaw = readRecord(metaMap._mirror_raw);
  const mirrorMeta = readRecord(mirrorRaw.meta);
  const mirrorDetails = readRecord(mirrorMeta.details);
  const publicDetails = readRecord(metaMap._public_details);
  const mirrorGallery = readArray(mirrorMeta.gallery).map((entry) => readString(entry)).filter(Boolean);
  const mirrorItinerary = readArray(mirrorMeta.itinerary).map((entry, index) => {
    const item = readRecord(entry);
    const label = readString(item.day) || readString(item.time) || `Day ${index + 1}`;
    return {
      day: label,
      title: readString(item.title) || readString(item.heading) || label,
      body: readString(item.body) || readString(item.description) || readString(item.time)
    };
  });
  const mirrorPricing = readArray(mirrorMeta.pricing).map(readRecordStrings).filter((entry) => Object.keys(entry).length > 0);
  const mirrorFaq = readArray(mirrorMeta.faq).map((entry) => {
    const item = readRecord(entry);
    return {
      question: readString(item.question),
      answer: readString(item.answer)
    };
  }).filter((entry) => entry.question && entry.answer);
  const tourGallery = readArray(post.tourMeta?.gallery)
    .map((entry) => readMediaUrl(entry))
    .filter(Boolean);
  const tourItinerary = readArray(post.tourMeta?.itinerary).map((entry, index) => {
    const item = entry as Record<string, unknown>;
    const label = readString(item.day) || readString(item.time) || `Day ${index + 1}`;
    return {
      day: label,
      title: readString(item.title) || readString(item.heading) || label,
      body: readString(item.body) || readString(item.description) || readString(item.time)
    };
  });
  const gallery = post.media.map((entry) => entry.media.url).filter(Boolean);
  const price = formatTourPrice(post.tourMeta?.basePrice, post.tourMeta?.currency);
  const details: Record<string, unknown> = {
    ...mirrorDetails,
    publishedAt: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
    category: readString(mirrorDetails.category, primaryCategory),
    country: readString(mirrorDetails.country, primaryCategory),
    tags: post.tags.map((entry) => entry.tag.name)
  };
  const googleMapsEmbed = readString(metaMap._google_maps_embed) || readString(metaMap.googleMapsEmbed) || readString(mirrorDetails.googleMapsEmbed) || readString(mirrorDetails.googleMapsEmbedUrl);
  if (googleMapsEmbed) details.googleMapsEmbed = googleMapsEmbed;
  if (post.tourMeta) {
    details.price = price;
    details.priceFromUsd = readNumber(post.tourMeta.basePrice) || undefined;
    details.duration = readString(post.tourMeta.duration);
    details.availability = post.tourMeta.availability;
    details.itinerary = tourItinerary.length ? tourItinerary : mirrorItinerary;
  }
  const publicGallery = tourGallery.length ? tourGallery : mirrorGallery.length ? mirrorGallery : gallery;
  const publicItinerary = tourItinerary.length ? tourItinerary : mirrorItinerary;
  const publicPricing = price ? [{ tier: 'Reference starting price', price }] : mirrorPricing;
  return {
    id: post.id,
    type: post.postType === 'TOUR' ? 'hlt_tour' : post.postType.toLowerCase(),
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    featuredImage: post.featuredImage?.url || tourGallery[0] || gallery[0] || '',
    meta: {
      seo: {
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt,
        canonical: post.canonicalUrl || undefined,
        ogImage: post.featuredImage?.url || undefined
      },
      translations: readRecord(metaMap.translations),
      gallery: publicGallery,
      itinerary: publicItinerary,
      faq: readArray(metaMap._public_faq).length ? readArray(metaMap._public_faq).map((entry) => {
        const item = readRecord(entry);
        return {
          question: readString(item.question),
          answer: readString(item.answer)
        };
      }).filter((entry) => entry.question && entry.answer) : mirrorFaq,
      pricing: readArray(metaMap._public_pricing).length ? readArray(metaMap._public_pricing).map(readRecordStrings).filter((entry) => Object.keys(entry).length > 0) : publicPricing,
      details: {
        ...details,
        ...publicDetails
      },
      blocks: normalizeBlockTree(metaMap._cms_blocks),
      reusableBlocks: typeof metaMap._cms_reusable_blocks === 'object' && metaMap._cms_reusable_blocks ? metaMap._cms_reusable_blocks as Record<string, Array<Record<string, unknown>>> : undefined,
      blockTemplate: typeof metaMap._cms_block_template === 'string' ? metaMap._cms_block_template : undefined,
      validation: mapStatus(post.status)
    }
  };
}

async function getDbPostsRaw(postType: CmsPostType) {
  return prisma.post.findMany({
    where: {
      postType,
      status: 'PUBLISHED',
      OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }]
    },
    include: {
      featuredImage: true,
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      media: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
      tourMeta: true,
      meta: true
    },
    orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }]
  });
}

export async function getDatabaseContent(type: string): Promise<CmsItem[] | null> {
  if (!canUseDatabase() || !(type in collectionToPostType)) return null;
  try {
    noStore();
    const items = await getDbPostsRaw(collectionToPostType[type as PublicCollection]);
    return items.map(dbPostToCmsItem);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[cms-db] unable to read ${type}: ${error instanceof Error ? error.message : String(error)}`);
    }
    return null;
  }
}


