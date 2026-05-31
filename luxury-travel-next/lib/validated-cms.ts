import { CmsItem } from './types';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80';

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

export const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const asStringArray = (value: unknown): string[] =>
  asArray<unknown>(value).filter((item): item is string => typeof item === 'string');

const asStringRecordArray = (value: unknown): Array<Record<string, string>> =>
  asArray<unknown>(value)
    .filter(isRecord)
    .map((item) =>
      Object.fromEntries(
        Object.entries(item)
          .filter(([, itemValue]) => typeof itemValue === 'string')
          .map(([key, itemValue]) => [key, itemValue as string])
      )
    );

const asFaqArray = (value: unknown): Array<{ question: string; answer: string }> =>
  asArray<unknown>(value)
    .filter(isRecord)
    .map((item) => ({
      question: asString(item.question),
      answer: asString(item.answer)
    }));

const asBlockMap = (value: unknown): Record<string, Array<Record<string, unknown>>> => {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, blocks]) => Array.isArray(blocks))
      .map(([key, blocks]) => [
        key,
        asArray<unknown>(blocks)
          .filter(isRecord)
          .map((block) => ({ ...block }))
      ])
  );
};

const asCmsId = (value: unknown, fallback: string): CmsItem['id'] =>
  typeof value === 'string' || typeof value === 'number' ? value : fallback;

const normalizeValidation = (value: unknown): CmsItem['meta']['validation'] => {
  if (!isRecord(value)) return {};
  return {
    status:
      value.status === 'synced' ||
      value.status === 'partial' ||
      value.status === 'broken' ||
      value.status === 'outdated'
        ? value.status
        : undefined,
    completion: typeof value.completion === 'number' ? value.completion : undefined,
    seo_score: typeof value.seo_score === 'number' ? value.seo_score : undefined,
    content_score: typeof value.content_score === 'number' ? value.content_score : undefined,
    content_score_band:
      value.content_score_band === 'blocked' ||
      value.content_score_band === 'warning' ||
      value.content_score_band === 'publish_ready' ||
      value.content_score_band === 'featured_eligible'
        ? value.content_score_band
        : undefined,
    missing: asStringArray(value.missing),
    warnings: asStringArray(value.warnings)
  };
};

export const normalizeCmsItem = (input: unknown): CmsItem | null => {
  if (!isRecord(input)) return null;

  const title = asString(input.title);
  const slug = asString(input.slug);
  if (!title || !slug) return null;

  const meta = isRecord(input.meta) ? input.meta : {};

  return {
    id: asCmsId(input.id, slug),
    type: asString(input.type, 'unknown'),
    title,
    slug,
    excerpt: asString(input.excerpt),
    content: asString(input.content),
    featuredImage: asString(input.featuredImage, FALLBACK_IMAGE),
    meta: {
      seo: isRecord(meta.seo) ? meta.seo : {},
      translations: isRecord(meta.translations) ? meta.translations : {},
      gallery: asStringArray(meta.gallery),
      cabins: asStringRecordArray(meta.cabins),
      itinerary: asStringRecordArray(meta.itinerary),
      faq: asFaqArray(meta.faq),
      pricing: asStringRecordArray(meta.pricing),
      details: isRecord(meta.details) ? meta.details : {},
      blocks: Array.isArray(meta.blocks) ? (meta.blocks as Array<Record<string, unknown>>) : [],
      reusableBlocks: asBlockMap(meta.reusableBlocks),
      blockTemplate: asString(meta.blockTemplate),
      validation: normalizeValidation(meta.validation)
    }
  };
};

export const normalizeCmsItems = (input: unknown): CmsItem[] =>
  asArray<unknown>(input)
    .map(normalizeCmsItem)
    .filter((item): item is CmsItem => Boolean(item));
