'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type MouseEvent, useRef } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { teamProfilePath, travelersTeam } from '@/lib/travelers-team';
import type { DesignersContent } from '@/lib/site-content-schema';
import { defaultHomeSectionContent } from '@/lib/site-content-schema';

const sliderNavLinkClass =
  'group inline-flex h-[56px] items-center justify-center gap-3 rounded-[18px] border border-gold/35 bg-champagne/80 px-5 text-[11px] font-black uppercase tracking-[0.16em] text-navy shadow-[0_12px_28px_rgba(11,27,43,0.08)] transition duration-300 ease-luxe hover:-translate-y-0.5 hover:border-navy hover:bg-navy hover:text-ivory hover:shadow-[0_18px_38px_rgba(11,27,43,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold';

const sliderNavIconClass =
  'grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy/8 text-navy transition duration-300 ease-luxe group-hover:bg-gold group-hover:text-navy';

export function TravelDesignersStrip({ content = defaultHomeSectionContent.designers }: { content?: DesignersContent } = {}) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const slideTeam = (direction: 'previous' | 'next') => {
    const slider = sliderRef.current;
    if (!slider) return;

    slider.scrollBy({
      left: direction === 'next' ? slider.clientWidth * 0.86 : -slider.clientWidth * 0.86,
      behavior: 'smooth'
    });
  };

  const handleSlideClick = (event: MouseEvent<HTMLAnchorElement>, direction: 'previous' | 'next') => {
    event.preventDefault();
    slideTeam(direction);
  };

  return (
    <section className="relative overflow-hidden bg-ivory py-20 text-navy md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_4%,rgba(200,169,106,0.16),transparent_26%),radial-gradient(circle_at_92%_0%,rgba(11,27,43,0.06),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-navy/8" />

      <Container width="page" className="relative">
        <div className="grid gap-12 lg:grid-cols-[minmax(220px,255px)_minmax(0,1fr)] lg:items-end xl:grid-cols-[265px_minmax(0,1fr)]">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.24em] text-gold-dark">{content.eyebrow}</p>
            <h2 className="mt-4 max-w-[10ch] font-serif text-[clamp(46px,4.3vw,68px)] font-semibold leading-[0.96] tracking-[-0.06em] text-navy">
              {content.heading}
            </h2>
            <p className="mt-5 max-w-[25rem] text-[18px] font-bold leading-8 tracking-[-0.025em] text-navy/76">
              {content.lead}
            </p>
            <Link
              href={content.ctaHref}
              className="mt-7 inline-flex min-h-[52px] items-center gap-3 rounded-full bg-navy px-6 text-[12px] font-extrabold uppercase tracking-[0.16em] text-ivory shadow-[0_16px_34px_rgba(11,27,43,0.16)] transition duration-300 ease-luxe hover:-translate-y-0.5 hover:bg-gold hover:text-navy"
            >
              {content.ctaLabel}
              <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>

          <div className="relative min-w-0">
            <div className="mb-8 flex items-center justify-between gap-5 border-b border-navy/10 pb-5">
              <p className="text-[13px] font-extrabold uppercase tracking-[0.18em] text-navy/54">{content.sliderHelper}</p>
              <div className="grid w-full max-w-[520px] shrink grid-cols-2 items-center gap-3 rounded-[24px] border border-gold/30 bg-ivory/95 p-2 shadow-[0_18px_42px_rgba(11,27,43,0.12)] md:w-[520px]">
                <a
                  href="#travel-designer-1"
                  onClick={(event) => handleSlideClick(event, 'previous')}
                  className={sliderNavLinkClass}
                  aria-label="Previous team profiles"
                >
                  <span className={sliderNavIconClass}>
                    <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
                  </span>
                  <span>Previous</span>
                </a>
                <a
                  href="#travel-designer-6"
                  onClick={(event) => handleSlideClick(event, 'next')}
                  className={sliderNavLinkClass}
                  aria-label="Next team profiles"
                >
                  <span>Next</span>
                  <span className={sliderNavIconClass}>
                    <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
                  </span>
                </a>
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-0 left-0 top-[86px] z-10 w-10 bg-gradient-to-r from-ivory to-transparent" />
            <div className="pointer-events-none absolute bottom-0 right-0 top-[86px] z-10 w-16 bg-gradient-to-l from-ivory to-transparent" />
            <div
              ref={sliderRef}
              id="travelers-team-slider"
              className="no-scrollbar flex w-full snap-x snap-mandatory gap-9 overflow-x-auto scroll-smooth pb-5 pt-1 md:gap-11 xl:gap-12"
              aria-label="Vietnam Travelers team profiles"
            >
              {travelersTeam.map((member, index) => (
                <Link
                  key={member.slug}
                  id={`travel-designer-${index + 1}`}
                  href={teamProfilePath(member)}
                  aria-label={`Read ${member.name} team profile`}
                  className="group flex min-w-[205px] snap-start flex-col items-center text-center md:min-w-[226px] xl:min-w-[244px]"
                >
                  <span className="relative block h-[158px] w-[158px] overflow-hidden rounded-full bg-champagne p-[6px] shadow-[0_22px_48px_rgba(11,27,43,0.14)] ring-1 ring-navy/8 transition duration-300 ease-luxe group-hover:-translate-y-1.5 group-hover:shadow-[0_30px_64px_rgba(11,27,43,0.2)] group-hover:ring-gold/80 md:h-[176px] md:w-[176px]">
                    <span className="relative block h-full w-full overflow-hidden rounded-full">
                      <Image
                        src={member.image}
                        alt={member.imageAlt}
                        fill
                        sizes="176px"
                        quality={90}
                        priority={index < 3}
                        className="object-cover transition duration-500 ease-luxe group-hover:scale-105"
                      />
                    </span>
                  </span>
                  <span className="mt-7 block text-[25px] font-extrabold leading-[1.02] tracking-[-0.05em] text-navy md:text-[28px]">
                    {member.name}
                  </span>
                  <span className="mt-3 block max-w-[14rem] text-[13px] font-black uppercase leading-[1.28] tracking-[0.14em] text-gold-dark md:text-[14px]">
                    {member.role}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
