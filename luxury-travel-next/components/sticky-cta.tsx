'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PenLine } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/tracking';

export function StickyCta() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const isTourDetail = /^\/[a-z-]+-tours\/[^/]+\/?$/.test(pathname);
  const isConversionFlow = pathname.startsWith('/customize-your-trip') || pathname.startsWith('/payment');
  const isSimCardPage = pathname.startsWith('/sim-card');

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  if (isTourDetail || isConversionFlow || isSimCardPage) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-4 left-4 z-50 md:bottom-8 md:left-auto md:right-8"
    >
      <Link
        href="/customize-your-trip/"
        onClick={() => trackEvent('cta_click', { location: 'sticky_cta', href: '/customize-your-trip/' })}
        className="relative inline-flex items-center gap-2 rounded-button bg-gold px-4 py-3 text-sm font-extrabold uppercase tracking-widest text-navy shadow-glow transition duration-200 ease-luxe hover:-translate-y-1 hover:bg-pearl md:px-6 md:py-4"
        translate="no"
      >
        <motion.span className="absolute inset-0 rounded-button border border-gold" animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
        <PenLine className="relative h-4 w-4" />
        <span className="relative hidden md:inline" translate="no">Tailor-made / Customize Your Trip</span>
        <span className="relative md:hidden" translate="no">Plan Your Trip</span>
      </Link>
    </motion.div>
  );
}
