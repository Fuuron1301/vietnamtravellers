'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { defaultLocale, localizeHref, stripLocaleFromPathname } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/tracking';
import type { Locale } from '@/lib/types';

type Variant = 'primary' | 'secondary' | 'dark';

export function CTAButton({ href, children, variant = 'primary', className = '' }: { href: string; children: ReactNode; variant?: Variant; className?: string }) {
  const pathname = usePathname() || '/';
  const locale = stripLocaleFromPathname(pathname).locale || defaultLocale;
  const styles = {
    primary: 'bg-gold text-navy shadow-glow hover:bg-pearl',
    secondary: 'border border-current bg-transparent text-current hover:border-gold hover:text-gold',
    dark: 'bg-navy text-pearl hover:bg-gold hover:text-navy'
  }[variant];

  const localizedHref = localizeHref(href, locale as Locale);

  return <Link href={localizedHref} onClick={() => trackEvent('cta_click', { href: localizedHref, label: String(children) })} className={cn('inline-flex min-h-12 items-center justify-center rounded-button px-6 py-4 text-sm font-extrabold uppercase tracking-widest transition duration-200 ease-luxe hover:-translate-y-1', styles, className)}>{children}</Link>;
}

