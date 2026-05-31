import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, normalizeLocale } from '@/lib/i18n';
import {
  chunkTextsForTranslation,
  extractTranslationSegments,
  googleTranslateLanguageForLocale,
  wrapTranslationSegment
} from '@/lib/public-auto-translate';
import type { Locale } from '@/lib/types';

type TranslateRequestBody = {
  locale?: string;
  texts?: unknown;
};

const translationCache = new Map<string, string>();

const manualTranslations: Partial<Record<Locale, Record<string, string>>> = {
  vi: {
    'Ha Long Luxury Travel': 'Du l\u1ECBch sang tr\u1ECDng H\u1EA1 Long'
  }
};

function sanitizeTexts(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => (typeof item === 'string' ? item : ''))
    .map((item) => item.trim())
    .filter((item) => Boolean(item));
}

function cacheKey(locale: Locale, text: string) {
  return `${locale}\0${text}`;
}

function manualTranslation(locale: Locale, text: string) {
  return manualTranslations[locale]?.[text];
}

function translatedTextFromPayload(payload: unknown) {
  const sentenceParts = Array.isArray(payload) && Array.isArray(payload[0]) ? payload[0] : [];
  return sentenceParts
    .map((part) => (Array.isArray(part) && typeof part[0] === 'string' ? part[0] : ''))
    .join('');
}

async function translateChunk(locale: Locale, texts: string[]) {
  const target = googleTranslateLanguageForLocale(locale);
  const wrappedText = texts.map((text, index) => wrapTranslationSegment(index, text)).join(' ');
  const params = new URLSearchParams({
    client: 'gtx',
    sl: 'auto',
    tl: target,
    dt: 't',
    q: wrappedText
  });

  const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params.toString()}`, {
    cache: 'no-store',
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  });

  if (!response.ok) {
    throw new Error(`Translation request failed with ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  const translatedText = translatedTextFromPayload(payload);
  if (!translatedText) {
    throw new Error('Unexpected translation payload');
  }

  const translatedSegments = extractTranslationSegments(translatedText);
  return texts.map((_, index) => (translatedSegments.has(index) ? translatedSegments.get(index) || '' : null));
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as TranslateRequestBody;
  const locale = normalizeLocale(typeof body.locale === 'string' ? body.locale : null, defaultLocale);
  const texts = sanitizeTexts(body.texts);

  if (locale === defaultLocale || texts.length === 0) {
    return NextResponse.json({ locale, translations: texts });
  }

  const uniqueTexts = Array.from(new Set(texts));
  const cacheHits = new Map<string, string>();
  const missingTexts: string[] = [];

  uniqueTexts.forEach((text) => {
    const manual = manualTranslation(locale, text);
    if (manual !== undefined) {
      cacheHits.set(text, manual);
      translationCache.set(cacheKey(locale, text), manual);
      return;
    }

    const key = cacheKey(locale, text);
    const cached = translationCache.get(key);
    if (cached !== undefined) {
      cacheHits.set(text, cached);
      return;
    }

    missingTexts.push(text);
  });

  if (missingTexts.length > 0) {
    const chunks = chunkTextsForTranslation(missingTexts);

    for (const chunk of chunks) {
      const translatedChunk = await translateChunk(locale, chunk.texts).catch(() => chunk.texts.map(() => null));

      for (let index = 0; index < translatedChunk.length; index += 1) {
        const original = chunk.texts[index];
        const retry = translatedChunk[index] === null ? await translateChunk(locale, [original]).catch(() => [null]) : null;
        const value = translatedChunk[index] ?? retry?.[0] ?? original;
        translationCache.set(cacheKey(locale, original), value);
        cacheHits.set(original, value);
      }
    }
  }

  return NextResponse.json({
    locale,
    translations: texts.map((text) => cacheHits.get(text) || text)
  });
}
