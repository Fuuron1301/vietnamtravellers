'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { defaultLocale, localeOption, stripLocaleFromPathname } from '@/lib/i18n';

export function LocaleDocumentSync() {
  const pathname = usePathname() || '/';

  useEffect(() => {
    const locale = stripLocaleFromPathname(pathname).locale || defaultLocale;
    const option = localeOption(locale);
    document.documentElement.lang = option.htmlLang;
    document.documentElement.dir = option.dir;
    document.documentElement.dataset.locale = locale;
  }, [pathname]);

  return null;
}
