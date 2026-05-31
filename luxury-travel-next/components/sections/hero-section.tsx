import { ReactNode } from 'react';
import { Container } from '@/components/layout/container';
import { MagneticButton } from '@/components/interactions/magnetic-button';
import { Eyebrow, Heading, Lead } from '@/components/ui/typography';
import { CinematicHeroLayer, type HeroLayerImage } from '@/components/3d/cinematic-hero-layer';
import { HeroTourSearch } from '@/components/sections/hero-tour-search';

export function HeroSection({
  eyebrow,
  title,
  subtitle,
  image,
  images,
  imagePosition,
  primaryCta,
  secondaryCta,
  children,
  cinematic = true,
  showPlanningFilter = false
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  images?: readonly HeroLayerImage[];
  imagePosition?: string;
  primaryCta?: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
  children?: ReactNode;
  cinematic?: boolean;
  showPlanningFilter?: boolean;
}) {
  return (
    <section className="relative min-h-[clamp(620px,86svh,800px)] overflow-hidden bg-navy text-pearl">
      <div className="absolute inset-0">
        {cinematic ? <CinematicHeroLayer image={image} images={images} imagePosition={imagePosition} title={title} /> : null}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-navy/42 via-navy/50 to-navy/94" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(11,27,43,0.16),rgba(11,27,43,0.48)_58%,rgba(11,27,43,0.74)_100%)]" />
      <Container width={showPlanningFilter ? 'page' : 'content'} className="relative flex min-h-[clamp(620px,86svh,800px)] items-center justify-center pt-[var(--site-header-height)] text-center">
        <div className={showPlanningFilter ? 'w-full max-w-[1480px]' : 'max-w-[960px]'}>
          <Eyebrow className="!text-[clamp(12px,0.82vw,15px)] !font-black !tracking-[0.32em] [text-shadow:0_2px_14px_rgba(0,0,0,0.55)]">{eyebrow}</Eyebrow>
          <Heading level={1} className="mt-6 !text-[clamp(40px,5vw,68px)] text-pearl [text-shadow:0_4px_30px_rgba(0,0,0,0.62)]">{title}</Heading>
          <Lead className="mx-auto mt-5 max-w-[42rem] font-semibold !text-[clamp(15px,1.08vw,18px)] !leading-[1.72] !text-pearl/95 [text-shadow:0_2px_22px_rgba(0,0,0,0.72)]">{subtitle}</Lead>
          {(primaryCta || secondaryCta) && (
            <div className="mt-6 flex flex-col items-stretch justify-center gap-3 px-2 sm:flex-row sm:items-center sm:px-0">
              {primaryCta && <MagneticButton href={primaryCta.href} className="w-full justify-center sm:w-auto">{primaryCta.label}</MagneticButton>}
              {secondaryCta && <MagneticButton href={secondaryCta.href} className="w-full justify-center border border-pearl/30 bg-transparent text-pearl shadow-soft hover:border-gold hover:bg-transparent hover:text-gold sm:w-auto">{secondaryCta.label}</MagneticButton>}
            </div>
          )}
          {showPlanningFilter && <HeroTourSearch />}
          {children}
        </div>
      </Container>
    </section>
  );
}
