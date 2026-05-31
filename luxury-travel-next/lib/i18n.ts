import type { Locale } from './types';

export const supportedLocales = ['en', 'fr', 'vi', 'zh', 'ko', 'ja', 'de', 'es', 'th', 'nl', 'ar', 'it'] as const satisfies readonly Locale[];
export const defaultLocale: Locale = 'en';
export const localeCookieName = 'hlt_locale';
export const localeHeaderName = 'x-hlt-locale';

export type LocaleOption = {
  locale: Locale;
  code: string;
  label: string;
  region: string;
  note: string;
  htmlLang: string;
  dir: 'ltr' | 'rtl';
};

export const localeOptions: LocaleOption[] = [
  { locale: 'en', code: 'EN', label: 'English', region: 'Global', note: 'International support', htmlLang: 'en', dir: 'ltr' },
  { locale: 'fr', code: 'FR', label: 'Français', region: 'France', note: 'Assistance francophone', htmlLang: 'fr', dir: 'ltr' },
  { locale: 'vi', code: 'VI', label: 'Tiếng Việt', region: 'Vietnam', note: 'Đội ngũ địa phương', htmlLang: 'vi', dir: 'ltr' },
  { locale: 'zh', code: 'ZH', label: '中文', region: 'China', note: '普通话咨询', htmlLang: 'zh-Hans', dir: 'ltr' },
  { locale: 'ko', code: 'KO', label: '한국어', region: 'Korea', note: '한국어 상담', htmlLang: 'ko', dir: 'ltr' },
  { locale: 'ja', code: 'JA', label: '日本語', region: 'Japan', note: '日本語で案内', htmlLang: 'ja', dir: 'ltr' },
  { locale: 'de', code: 'DE', label: 'Deutsch', region: 'Germany', note: 'Deutschsprachige Beratung', htmlLang: 'de', dir: 'ltr' },
  { locale: 'es', code: 'ES', label: 'Español', region: 'Spain', note: 'Asistencia en español', htmlLang: 'es', dir: 'ltr' },
  { locale: 'th', code: 'TH', label: 'ไทย', region: 'Thailand', note: 'บริการภาษาไทย', htmlLang: 'th', dir: 'ltr' },
  { locale: 'nl', code: 'NL', label: 'Nederlands', region: 'Netherlands', note: 'Nederlandstalige hulp', htmlLang: 'nl', dir: 'ltr' },
  { locale: 'ar', code: 'AR', label: 'العربية', region: 'Middle East', note: 'دعم باللغة العربية', htmlLang: 'ar', dir: 'rtl' },
  { locale: 'it', code: 'IT', label: 'Italiano', region: 'Italy', note: 'Assistenza in italiano', htmlLang: 'it', dir: 'ltr' }
];

const localeSet = new Set<Locale>(supportedLocales);

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return typeof value === 'string' && localeSet.has(value.toLowerCase() as Locale);
}

export function normalizeLocale(value: string | null | undefined, fallback: Locale = defaultLocale): Locale {
  if (!value) return fallback;
  const candidate = value.trim().toLowerCase().replace(/_/g, '-').split('-')[0] || '';
  return isSupportedLocale(candidate) ? candidate : fallback;
}

export function localeOption(locale: Locale): LocaleOption {
  return localeOptions.find((option) => option.locale === locale) || localeOptions[0];
}

export function stripLocaleFromPathname(pathname: string) {
  const clean = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const segments = clean.split('/');
  const first = segments[1]?.toLowerCase() || '';
  if (!isSupportedLocale(first)) {
    return { locale: null as Locale | null, pathname: clean || '/' };
  }

  const remainder = `/${segments.slice(2).join('/')}`.replace(/\/+/g, '/');
  return {
    locale: first as Locale,
    pathname: remainder === '/' || remainder === '' ? '/' : remainder.endsWith('/') ? remainder : `${remainder}/`
  };
}

export function localizePathname(pathname: string, locale: Locale, search = '', hash = '') {
  const base = stripLocaleFromPathname(pathname).pathname || '/';
  const query = search ? (search.startsWith('?') ? search : `?${search}`) : '';
  const fragment = hash ? (hash.startsWith('#') ? hash : `#${hash}`) : '';
  if (locale === defaultLocale) return `${base}${query}${fragment}`;
  const prefixed = base === '/' ? `/${locale}/` : `/${locale}${base.startsWith('/') ? base : `/${base}`}`;
  return `${prefixed}${query}${fragment}`;
}

export function localizeHref(href: string, locale: Locale) {
  const trimmed = href.trim();
  if (!trimmed || /^(https?:|mailto:|tel:)/i.test(trimmed) || trimmed.startsWith('#')) return href;
  const hashIndex = trimmed.indexOf('#');
  const searchIndex = trimmed.indexOf('?');
  const pathEnd = [hashIndex, searchIndex].filter((index) => index >= 0).sort((a, b) => a - b)[0] ?? trimmed.length;
  const pathname = trimmed.slice(0, pathEnd) || '/';
  const search = searchIndex >= 0 ? trimmed.slice(searchIndex, hashIndex >= 0 && hashIndex > searchIndex ? hashIndex : undefined) : '';
  const hash = hashIndex >= 0 ? trimmed.slice(hashIndex) : '';
  return localizePathname(pathname, locale, search, hash);
}

export function pathIsLocalizable(pathname: string) {
  const clean = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (
    clean.startsWith('/api') ||
    clean.startsWith('/_next') ||
    clean.startsWith('/images') ||
    clean.startsWith('/uploads') ||
    clean.startsWith('/favicon.ico') ||
    clean.startsWith('/robots.txt') ||
    clean.startsWith('/sitemap.xml') ||
    clean.startsWith('/manifest')
  ) {
    return false;
  }

  return !/\.[a-z0-9]+$/i.test(clean.split('/').pop() || '');
}
