'use client';

import Link from 'next/link';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type DestinationCard3DProps = {
  href: string;
  title: string;
  kicker: string;
  image: string;
  imageAlt?: string;
  imagePosition?: string;
  className?: string;
  landmarks?: string[];
  imagePriority?: boolean;
  variant?: 'feature' | 'standard' | 'wide';
  children?: ReactNode;
};

export function DestinationCard3D({
  href,
  title,
  kicker,
  image,
  imageAlt,
  imagePosition = '50% 50%',
  className = '',
  landmarks = [],
  imagePriority = false,
  variant = 'standard',
  children
}: DestinationCard3DProps) {
  const shouldReduceMotion = useReducedMotion();
  const isFeature = variant === 'feature';
  const isWide = variant === 'wide';
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [3, -3]), { stiffness: 140, damping: 18 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-3, 3]), { stiffness: 140, damping: 18 });

  return (
    <Link
      href={href}
      aria-label={`Explore ${title}`}
      className={cn('group block h-full rounded-[28px] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-ivory', className)}
      suppressHydrationWarning
    >
      <motion.article
        style={shouldReduceMotion ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
        onMouseMove={(event) => {
          if (shouldReduceMotion) return;
          const rect = event.currentTarget.getBoundingClientRect();
          x.set((event.clientX - rect.left) / rect.width - 0.5);
          y.set((event.clientY - rect.top) / rect.height - 0.5);
        }}
        onMouseLeave={() => { x.set(0); y.set(0); }}
        whileHover={shouldReduceMotion ? undefined : { y: -6 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative isolate h-full overflow-hidden rounded-[30px] border border-pearl/20 bg-navy shadow-[0_24px_70px_rgba(11,27,43,0.18)]"
      >
        {/* Direct img keeps this remote visual atlas reliable when image optimization requests time out. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={imageAlt ?? title}
          loading="eager"
          fetchPriority="high"
          decoding={imagePriority ? 'sync' : 'async'}
          className="absolute inset-0 h-full w-full object-cover transition duration-1000 ease-luxe group-hover:scale-[1.045]"
          style={{ objectPosition: imagePosition }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,27,43,0.02)_0%,rgba(11,27,43,0.10)_34%,rgba(11,27,43,0.78)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(11,27,43,0.42),rgba(11,27,43,0))]" />
        <div className="absolute inset-0 opacity-0 shadow-glow transition duration-500 group-hover:opacity-100" />
        <div className="absolute left-4 top-4 z-10 rounded-full border border-pearl/20 bg-navy/62 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-pearl/90" suppressHydrationWarning>
          {kicker}
        </div>
        <div className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-gold/90 text-navy transition duration-500 group-hover:rotate-45">
          <ArrowUpRight className="h-4 w-4" />
        </div>
        <div
          className={cn('absolute inset-x-0 bottom-0 z-10 text-pearl', isFeature ? 'p-6 pb-8 sm:p-8 lg:p-10' : 'p-6 pb-8', isWide && 'lg:p-8')}
          style={shouldReduceMotion ? undefined : { transform: 'translateZ(42px)' }}
        >
          <h3 className={cn('font-serif leading-[1.04] tracking-[-0.035em] text-pearl', isFeature ? 'text-[clamp(2.5rem,5.2vw,4.8rem)]' : 'text-[clamp(1.75rem,2.7vw,2.65rem)]')} suppressHydrationWarning>
            {title}
          </h3>
          {landmarks.length > 0 && (
            <ul className={cn('mt-4 flex flex-wrap gap-2', !isFeature && 'hidden sm:flex')}>
              {landmarks.map((landmark) => (
                <li key={landmark} className="rounded-full border border-pearl/20 bg-pearl/10 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-pearl/80" suppressHydrationWarning>
                  {landmark}
                </li>
              ))}
            </ul>
          )}
          {children && (
            <div className={cn('mt-4 max-w-[38rem] text-sm leading-6 text-pearl/82 sm:text-[15px]', !isFeature && !isWide && 'hidden lg:block')}>
              {children}
            </div>
          )}
          {(isFeature || isWide) && (
            <span className="mt-6 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-gold transition duration-500 group-hover:translate-x-1" suppressHydrationWarning>
              Open country hub <ArrowUpRight className="h-4 w-4" />
            </span>
          )}
        </div>
      </motion.article>
    </Link>
  );
}
