import { cookies, headers } from 'next/headers';
import { defaultLocale, localeCookieName, localeHeaderName, normalizeLocale } from './i18n';
import type { Locale } from './types';

export async function getRequestLocale(fallback: Locale = defaultLocale): Promise<Locale> {
  try {
    const headerStore = await headers();
    const fromHeader = headerStore.get(localeHeaderName) || headerStore.get('x-next-intl-locale');
    if (fromHeader) return normalizeLocale(fromHeader, fallback);
  } catch {
    // No request context in scripts or static utilities.
  }

  try {
    const cookieStore = await cookies();
    const fromCookie = cookieStore.get(localeCookieName)?.value;
    if (fromCookie) return normalizeLocale(fromCookie, fallback);
  } catch {
    // No request context in scripts or static utilities.
  }

  return fallback;
}
