'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ReactNode } from 'react';
import { defaultLocale, localizeHref, stripLocaleFromPathname } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/tracking';
import type { Locale } from '@/lib/types';

export function MagneticButton({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  const pathname = usePathname() || '/';
  const locale = stripLocaleFromPathname(pathname).locale || defaultLocale;
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 160, damping: 18, mass: 0.4 });
  const y = useSpring(my, { stiffness: 160, damping: 18, mass: 0.4 });
  const localizedHref = localizeHref(href, locale as Locale);
  return (
    <motion.div style={{ x, y }} onMouseMove={(event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      mx.set((event.clientX - rect.left - rect.width / 2) * 0.16);
      my.set((event.clientY - rect.top - rect.height / 2) * 0.16);
    }} onMouseLeave={() => { mx.set(0); my.set(0); }}>
      <Link href={localizedHref} onClick={() => trackEvent('cta_click', { href: localizedHref, label: String(children) })} className={cn('inline-flex min-h-12 items-center justify-center rounded-button bg-gold px-6 py-4 text-sm font-extrabold uppercase tracking-widest text-navy shadow-glow transition duration-200 ease-luxe hover:-translate-y-1 hover:bg-pearl', className)}>{children}</Link>
    </motion.div>
  );
}
