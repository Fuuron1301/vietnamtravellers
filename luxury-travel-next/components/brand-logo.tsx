/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { defaultSiteContent, type SiteIdentity } from '@/lib/site-content-schema';

type BrandLogoProps = {
  variant?: 'header' | 'footer';
  className?: string;
  identity?: SiteIdentity;
};

const logoStyles = {
  header: {
    link: 'group/brand flex min-w-0 shrink-0 items-center gap-4',
    icon: 'h-[44px] w-[44px] border-pearl/24 bg-pearl/8',
    glyph: 'h-[21px] w-[21px]',
    title: 'text-[24px] leading-[0.86] tracking-[0.055em]',
    tagline: 'mt-1.5 text-[10px] tracking-[0.26em]'
  },
  footer: {
    link: 'group/brand inline-flex max-w-full items-center gap-[clamp(18px,2.5vw,30px)]',
    icon: 'h-[clamp(58px,5vw,76px)] w-[clamp(58px,5vw,76px)] border-pearl/24 bg-pearl/8',
    glyph: 'h-[clamp(28px,2.1vw,36px)] w-[clamp(28px,2.1vw,36px)]',
    title: 'text-[clamp(38px,3.4vw,58px)] leading-[0.86] tracking-[0.055em]',
    tagline: 'mt-[clamp(10px,1vw,14px)] text-[clamp(10px,0.75vw,12px)] tracking-[0.34em]'
  }
} as const;

export function BrandLogo({ variant = 'header', className, identity = defaultSiteContent.identity }: BrandLogoProps) {
  const styles = logoStyles[variant];

  return (
    <Link href="/" className={cn(styles.link, className)} aria-label={identity.ariaLabel} translate="no" data-translate-no>
      <span
        className={cn(
          'grid shrink-0 place-items-center overflow-hidden rounded-full border text-gold transition duration-300 ease-luxe group-hover/brand:border-gold group-hover/brand:bg-gold group-hover/brand:text-navy',
          styles.icon
        )}
      >
        {identity.markImage ? (
          // A plain img supports admin-provided local or remote logo URLs without Next image config changes.
          <img src={identity.markImage} alt="" className="h-full w-full object-cover" />
        ) : (
          <Sparkles className={styles.glyph} />
        )}
      </span>
      <span className="min-w-0 leading-none">
        <span className={cn('block whitespace-nowrap font-serif font-semibold text-pearl', styles.title)}>
          {identity.titleLine1}
        </span>
        <span className={cn('block whitespace-nowrap font-serif font-semibold text-pearl', styles.title)}>
          {identity.titleLine2}
        </span>
        <span className={cn('block whitespace-nowrap font-extrabold uppercase text-pearl/78', styles.tagline)}>
          {identity.tagline}
        </span>
      </span>
    </Link>
  );
}
