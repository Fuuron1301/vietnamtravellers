import { getRequestConfig } from 'next-intl/server';

import { defaultLocale, normalizeLocale } from '@/lib/i18n';
import { loadLocaleMessages } from '@/lib/i18n-messages';

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale = normalizeLocale(requestedLocale, defaultLocale);

  return {
    locale,
    messages: await loadLocaleMessages(locale)
  };
});
