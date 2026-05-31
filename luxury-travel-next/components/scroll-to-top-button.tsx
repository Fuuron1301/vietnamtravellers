'use client';

import { ArrowUp } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/tracking';

export function ScrollToTopButton() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const isTourDetailPage = /\/[^/]+-tours\/[^/]+\/?$/.test(pathname);
  const isConversionFlow = pathname.startsWith('/customize-your-trip') || pathname.startsWith('/payment');

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 520);

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    trackEvent('back_to_top_click', { location: 'floating_button' });
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  };

  if (isTourDetailPage || isConversionFlow) return null;

  return (
    <button
      type="button"
      data-scroll-top-button
      onClick={scrollToTop}
      aria-label="Back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cn(
        'group fixed bottom-[116px] right-[18px] z-[74] hidden h-[58px] w-[58px] place-items-center rounded-full border border-gold/36 bg-[rgba(248,245,239,0.94)] text-navy shadow-[0_18px_42px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.78)] backdrop-blur transition duration-500 ease-luxe focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/60 md:grid md:bottom-[112px] md:right-[30px] md:h-[62px] md:w-[62px]',
        visible ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      )}
    >
      <span className="absolute inset-[5px] rounded-full border border-navy/8 bg-[radial-gradient(circle_at_50%_20%,rgba(200,169,106,0.22),transparent_58%)] transition duration-300 group-hover:inset-[3px] group-hover:border-gold/50 group-hover:bg-gold" />
      <ArrowUp className="relative h-6 w-6 stroke-[2.3] transition duration-300 ease-luxe group-hover:-translate-y-1 group-hover:text-navy md:h-7 md:w-7" />
      <span className="absolute -bottom-2 h-1.5 w-8 rounded-full bg-gold/45 blur-[3px] transition duration-300 group-hover:w-10 group-hover:bg-gold/70" />
    </button>
  );
}
