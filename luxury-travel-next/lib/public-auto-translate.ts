import { defaultLocale, stripLocaleFromPathname } from './i18n';
import type { Locale } from './types';

export const translationMarkerPrefix = '[[';
export const translationMarkerSuffix = ']]';

const googleTranslateLocaleMap: Record<Locale, string> = {
  en: 'en',
  fr: 'fr',
  vi: 'vi',
  zh: 'zh-CN',
  ko: 'ko',
  ja: 'ja',
  de: 'de',
  es: 'es',
  th: 'th',
  nl: 'nl',
  ar: 'ar',
  it: 'it'
};

export function googleTranslateLanguageForLocale(locale: Locale) {
  return googleTranslateLocaleMap[locale] || 'en';
}

export function googleTranslateCookieValue(locale: Locale) {
  if (locale === defaultLocale) return '';
  return `/en/${googleTranslateLanguageForLocale(locale)}`;
}

export function wrapTranslationSegment(index: number, text: string) {
  return `${translationMarkerPrefix}${index}${translationMarkerSuffix}${text}${translationMarkerPrefix}/${index}${translationMarkerSuffix}`;
}

export function extractTranslationSegments(translatedText: string) {
  const segments = new Map<number, string>();
  const pattern = /\[\[(\d+)\]\]([\s\S]*?)\[\[\/\1\]\]/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(translatedText))) {
    const index = Number(match[1]);
    if (Number.isNaN(index)) continue;
    segments.set(index, match[2] || '');
  }

  return segments;
}

export function chunkTextsForTranslation(texts: string[], maxEncodedLength = 3200) {
  const chunks: Array<{ texts: string[]; wrapped: string }> = [];
  let currentTexts: string[] = [];
  let currentWrapped = '';
  let currentEncodedLength = 0;

  const flush = () => {
    if (!currentTexts.length) return;
    chunks.push({ texts: currentTexts, wrapped: currentWrapped });
    currentTexts = [];
    currentWrapped = '';
    currentEncodedLength = 0;
  };

  texts.forEach((text, index) => {
    const wrappedSegment = wrapTranslationSegment(index, text);
    const segmentLength = encodeURIComponent(wrappedSegment).length;

    if (currentTexts.length && currentEncodedLength + segmentLength > maxEncodedLength) {
      flush();
    }

    currentTexts.push(text);
    currentWrapped += `${currentWrapped ? ' ' : ''}${wrappedSegment}`;
    currentEncodedLength += segmentLength;
  });

  flush();
  return chunks;
}

export function shouldAutoTranslatePath(pathname: string) {
  const internalPath = stripLocaleFromPathname(pathname).pathname;
  if (
    internalPath.startsWith('/admin') ||
    internalPath.startsWith('/api') ||
    internalPath.startsWith('/_next') ||
    internalPath.startsWith('/images') ||
    internalPath.startsWith('/uploads') ||
    internalPath.startsWith('/favicon.ico') ||
    internalPath.startsWith('/robots.txt') ||
    internalPath.startsWith('/sitemap.xml') ||
    internalPath.startsWith('/manifest')
  ) {
    return false;
  }

  return true;
}
