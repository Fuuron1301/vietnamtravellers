import type { CmsItem, Locale } from './types';
import type { SiteContent } from './site-content-schema';
import { defaultLocale } from './i18n';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function stringRecordArray(value: unknown) {
  return Array.isArray(value)
    ? value
      .filter(isRecord)
      .map((item) =>
        Object.fromEntries(
          Object.entries(item)
            .filter(([, itemValue]) => typeof itemValue === 'string')
            .map(([key, itemValue]) => [key, itemValue as string])
        )
      )
    : [];
}

function faqArray(value: unknown) {
  return Array.isArray(value)
    ? value
      .filter(isRecord)
      .map((item) => ({
        question: stringValue(item.question),
        answer: stringValue(item.answer)
      }))
      .filter((item) => item.question || item.answer)
    : [];
}

function deepMerge<T>(base: T, patch: unknown): T {
  if (Array.isArray(base)) {
    return (Array.isArray(patch) ? patch : base) as T;
  }

  if (!isRecord(base) || !isRecord(patch)) return (patch === undefined ? base : patch) as T;

  const result: UnknownRecord = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    const current = result[key];
    result[key] = isRecord(current) && isRecord(value)
      ? deepMerge(current, value)
      : Array.isArray(current) && Array.isArray(value)
        ? value
        : value;
  }
  return result as T;
}

function localePatch(translations: unknown, locale: Locale) {
  if (!isRecord(translations)) return null;
  const direct = translations[locale];
  if (isRecord(direct)) return direct;
  const fallback = translations[defaultLocale];
  return isRecord(fallback) ? fallback : null;
}

export function localizeCmsItem(item: CmsItem, locale: Locale): CmsItem {
  const patch = localePatch(item.meta.translations, locale);
  if (!patch) return item;

  const metaPatch = isRecord(patch.meta) ? patch.meta : {};
  const seoPatch = isRecord(patch.seo) ? patch.seo : isRecord(metaPatch.seo) ? metaPatch.seo : {};
  const detailsPatch = isRecord(patch.details) ? patch.details : isRecord(metaPatch.details) ? metaPatch.details : {};

  return {
    ...item,
    title: stringValue(patch.title, item.title),
    excerpt: stringValue(patch.excerpt, item.excerpt),
    content: stringValue(patch.content, item.content),
    featuredImage: stringValue(patch.featuredImage, item.featuredImage),
    meta: {
      ...item.meta,
      seo: isRecord(item.meta.seo) || isRecord(seoPatch) ? deepMerge(item.meta.seo || {}, seoPatch) : item.meta.seo,
      translations: item.meta.translations,
      gallery: Array.isArray(patch.gallery) ? stringArray(patch.gallery) : Array.isArray(metaPatch.gallery) ? stringArray(metaPatch.gallery) : item.meta.gallery,
      cabins: Array.isArray(patch.cabins) ? stringRecordArray(patch.cabins) : Array.isArray(metaPatch.cabins) ? stringRecordArray(metaPatch.cabins) : item.meta.cabins,
      itinerary: Array.isArray(patch.itinerary) ? stringRecordArray(patch.itinerary) : Array.isArray(metaPatch.itinerary) ? stringRecordArray(metaPatch.itinerary) : item.meta.itinerary,
      faq: Array.isArray(patch.faq) ? faqArray(patch.faq) : Array.isArray(metaPatch.faq) ? faqArray(metaPatch.faq) : item.meta.faq,
      pricing: Array.isArray(patch.pricing) ? stringRecordArray(patch.pricing) : Array.isArray(metaPatch.pricing) ? stringRecordArray(metaPatch.pricing) : item.meta.pricing,
      details: isRecord(detailsPatch) ? deepMerge(item.meta.details || {}, detailsPatch) : item.meta.details,
      blocks: Array.isArray(patch.blocks) ? patch.blocks as Array<Record<string, unknown>> : Array.isArray(metaPatch.blocks) ? metaPatch.blocks as Array<Record<string, unknown>> : item.meta.blocks,
      reusableBlocks: isRecord(patch.reusableBlocks)
        ? patch.reusableBlocks as Record<string, Array<Record<string, unknown>>>
        : isRecord(metaPatch.reusableBlocks)
          ? metaPatch.reusableBlocks as Record<string, Array<Record<string, unknown>>>
          : item.meta.reusableBlocks,
      blockTemplate: stringValue(patch.blockTemplate, stringValue(metaPatch.blockTemplate, item.meta.blockTemplate || '')),
      validation: item.meta.validation
    }
  };
}

export function localizeCmsItems(items: CmsItem[], locale: Locale) {
  return items.map((item) => localizeCmsItem(item, locale));
}

export function localizeSiteContent(content: SiteContent, locale: Locale): SiteContent {
  const patch = localePatch(content.translations, locale);
  if (!patch) return content;

  return deepMerge(content, patch);
}
