'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Grid3X3 } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { tripKinds } from '@/lib/trip-styles';
import { cn } from '@/lib/utils';
import type { TripStyleDeckContent } from '@/lib/site-content-schema';
import { defaultHomeSectionContent } from '@/lib/site-content-schema';


function wrapIndex(index: number) {
  return (index + tripKinds.length) % tripKinds.length;
}

export function TripStyleDeck({ content = defaultHomeSectionContent.styles }: { content?: TripStyleDeckContent } = {}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [thumbnailPageSize, setThumbnailPageSize] = useState(4);
  const thumbnailScrollerRef = useRef<HTMLDivElement>(null);
  const activeKind = tripKinds[activeIndex];
  const previousIndex = wrapIndex(activeIndex - 1);
  const nextIndex = wrapIndex(activeIndex + 1);
  const thumbnailPageCount = Math.max(1, Math.ceil(tripKinds.length / thumbnailPageSize));
  const activeThumbnailPage = Math.min(thumbnailPageCount - 1, Math.floor(activeIndex / thumbnailPageSize));

  const keepViewportStill = (action: () => void) => {
    if (typeof window === 'undefined') {
      action();
      return;
    }

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    action();

    requestAnimationFrame(() => {
      window.scrollTo(scrollX, scrollY);
      requestAnimationFrame(() => window.scrollTo(scrollX, scrollY));
    });
  };

  useEffect(() => {
    const updateThumbnailPageSize = () => {
      if (window.innerWidth >= 1280) {
        setThumbnailPageSize(4);
        return;
      }

      if (window.innerWidth >= 768) {
        setThumbnailPageSize(3);
        return;
      }

      setThumbnailPageSize(2);
    };

    updateThumbnailPageSize();
    window.addEventListener('resize', updateThumbnailPageSize);
    return () => window.removeEventListener('resize', updateThumbnailPageSize);
  }, []);

  const scrollThumbnailIntoView = (index: number) => {
    const target = thumbnailScrollerRef.current?.querySelectorAll<HTMLElement>('[data-trip-style-thumb]')[index];
    target?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  };

  const selectKind = (index: number) => {
    keepViewportStill(() => setActiveIndex(wrapIndex(index)));
    scrollThumbnailIntoView(wrapIndex(index));
  };

  const jumpToThumbnailPage = (direction: -1 | 1) => {
    const nextPage = Math.min(Math.max(activeThumbnailPage + direction, 0), thumbnailPageCount - 1);
    const nextIndex = nextPage * thumbnailPageSize;

    keepViewportStill(() => {
      setActiveIndex(wrapIndex(nextIndex));
    });

    scrollThumbnailIntoView(nextIndex);
  };

  return (
    <section
      id="trip-style-deck"
      className="relative scroll-mt-32 overflow-hidden bg-ivory py-[112px] text-navy md:py-[144px]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_18%,rgba(200,169,106,0.18),transparent_28%),radial-gradient(circle_at_86%_10%,rgba(11,27,43,0.06),transparent_26%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-navy/10" />

      <Container width="page" className="relative">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="text-[14px] font-extrabold uppercase tracking-[0.34em] text-gold-dark" suppressHydrationWarning>{content.eyebrow}</p>
            <h2 className="mt-[20px] max-w-[13ch] font-serif text-[clamp(28px,5.1vw,76px)] font-semibold leading-[0.98] tracking-[-0.055em] text-navy" suppressHydrationWarning>
              {content.heading}
            </h2>
            <p className="mt-8 max-w-[64rem] text-[15px] font-extrabold leading-[1.6] tracking-[-0.015em] text-navy/76 sm:text-[18px] md:text-[21px] md:leading-[1.65] md:tracking-[-0.025em] lg:text-[24px]" suppressHydrationWarning>
              {content.lead}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 lg:justify-end">
            <Link
              href={content.ctaHref}
              className="inline-flex min-h-[60px] shrink-0 cursor-pointer items-center justify-center gap-[12px] rounded-full bg-navy px-8 text-[13px] font-extrabold uppercase tracking-[0.16em] text-ivory shadow-[0_16px_38px_rgba(11,27,43,0.16)] transition duration-300 ease-luxe hover:bg-gold hover:text-navy"
              suppressHydrationWarning
            >
              <Grid3X3 className="h-5 w-5" strokeWidth={2} />
              {content.ctaLabel}
            </Link>
            <p className="inline-flex min-h-[56px] shrink-0 items-center rounded-full border border-navy/10 bg-ivory px-6 text-[13px] font-extrabold uppercase tracking-[0.16em] text-navy/66" suppressHydrationWarning>
              {content.countLabel}
            </p>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-[1320px] overflow-hidden rounded-[48px] bg-navy shadow-[0_34px_92px_rgba(11,27,43,0.24)] ring-1 ring-navy/10 md:mt-[56px]">
          <article data-trip-style-hero className="relative grid min-h-[680px] overflow-hidden lg:h-[680px] lg:min-h-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative z-10 flex min-h-0 flex-col justify-between bg-[linear-gradient(145deg,rgba(11,27,43,0.98),rgba(19,42,61,0.96))] p-8 text-ivory md:p-[44px] xl:p-12">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-[12px]">
                    <span className="grid h-[70px] w-[70px] place-items-center rounded-full bg-gold text-[24px] font-black tracking-[-0.04em] text-navy shadow-[0_16px_38px_rgba(0,0,0,0.18)]" suppressHydrationWarning>
                      {activeKind.num}
                    </span>
                    <span className="inline-flex min-h-[48px] min-w-[166px] items-center justify-center rounded-full border border-ivory/14 bg-ivory/8 px-6 py-[14px] text-center text-[12px] font-extrabold uppercase tracking-[0.18em] text-ivory/78" suppressHydrationWarning>
                      {activeKind.eyebrow}
                    </span>
                  </div>

                  <div className="flex items-center gap-[12px]">
                    <button
                      type="button"
                      onClick={() => selectKind(previousIndex)}
                      className="grid h-[52px] w-[52px] place-items-center rounded-full border border-ivory/20 bg-ivory/8 text-ivory transition duration-300 ease-luxe hover:border-gold hover:bg-gold hover:text-navy"
                      aria-label={`Previous kind: ${tripKinds[previousIndex].title}`}
                      suppressHydrationWarning
                    >
                      <ChevronLeft className="h-6 w-6" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => selectKind(nextIndex)}
                      className="grid h-[52px] w-[52px] place-items-center rounded-full border border-ivory/20 bg-ivory/8 text-ivory transition duration-300 ease-luxe hover:border-gold hover:bg-gold hover:text-navy"
                      aria-label={`Next kind: ${tripKinds[nextIndex].title}`}
                      suppressHydrationWarning
                    >
                      <ChevronRight className="h-6 w-6" strokeWidth={2} />
                    </button>
                  </div>
                </div>

                <p className="mt-[30px] min-h-[22px] text-[13px] font-extrabold uppercase tracking-[0.26em] text-gold md:mt-[34px] md:text-[14px]" suppressHydrationWarning>
                  {activeKind.mood} / {activeKind.duration}
                </p>
              </div>

              <div className="flex min-h-0 flex-1 flex-col justify-end pt-[44px] lg:pt-[56px]">
                <h3 className="flex min-h-[clamp(118px,9.5vw,168px)] max-w-[12ch] items-end font-serif text-[clamp(44px,5vw,78px)] font-semibold leading-[0.96] tracking-[-0.055em] text-ivory" suppressHydrationWarning>
                  {activeKind.title}
                </h3>
                <p className="mt-6 min-h-[82px] max-w-[40rem] text-[16px] font-extrabold leading-[1.62] tracking-[-0.025em] text-ivory/86 md:text-[18px]" suppressHydrationWarning>
                  {activeKind.text}
                </p>
                <Link
                  href={activeKind.href}
                  className="mt-8 inline-flex min-h-[58px] items-center gap-4 rounded-full bg-gold px-[34px] text-[13px] font-extrabold uppercase tracking-[0.18em] text-navy shadow-[0_18px_44px_rgba(0,0,0,0.22)] transition duration-300 ease-luxe hover:bg-ivory"
                  suppressHydrationWarning
                >
                  Plan this kind
                  <ArrowUpRight className="h-6 w-6" strokeWidth={2} />
                </Link>
              </div>
            </div>

            <div className="relative min-h-[360px] lg:h-full">
              <Image
                src={activeKind.image}
                alt={activeKind.alt}
                fill
                sizes="(min-width: 1280px) 720px, (min-width: 1024px) 52vw, 100vw"
                quality={100}
                unoptimized
                priority={activeIndex === 0}
                suppressHydrationWarning
                className="object-cover object-center brightness-[1.05] contrast-[1.08] saturate-[1.08] transition duration-700 ease-luxe"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,27,43,0.24),rgba(11,27,43,0.03)_42%,rgba(11,27,43,0.12))]" />
              <div className="absolute bottom-8 left-8 right-8 min-h-[142px] rounded-[32px] border border-ivory/24 bg-navy/88 p-6 text-ivory shadow-[0_22px_60px_rgba(0,0,0,0.34)] ring-1 ring-navy/20 backdrop-blur-md md:bottom-[36px] md:left-[36px] md:right-auto md:w-[520px] md:p-8">
                <p className="text-[12px] font-extrabold uppercase tracking-[0.26em] text-gold" suppressHydrationWarning>Selected style</p>
                <p className="mt-[12px] text-[24px] font-extrabold leading-[1.18] tracking-[-0.025em] text-ivory [text-shadow:0_3px_16px_rgba(0,0,0,0.36)] md:text-[30px]" suppressHydrationWarning>
                  {activeKind.eyebrow} crafted as a private, unhurried journey.
                </p>
              </div>
            </div>
          </article>
        </div>

        <div className="mx-auto mt-8 max-w-[1320px] rounded-[40px] border border-navy/10 bg-ivory/92 p-[20px] shadow-[0_18px_54px_rgba(11,27,43,0.07)] md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 px-1">
            <div>
              <p className="text-[13px] font-extrabold uppercase tracking-[0.24em] text-gold-dark" suppressHydrationWarning>{content.galleryEyebrow}</p>
              <h4 className="mt-1 font-serif text-[26px] font-semibold leading-none tracking-[-0.055em] text-navy md:text-[38px] lg:text-[42px] xl:text-[56px]" suppressHydrationWarning>
                {content.galleryTitle}
              </h4>
            </div>
            <div data-trip-style-pager className="inline-flex min-h-[56px] items-center overflow-hidden rounded-full border border-navy/10 bg-champagne shadow-[0_12px_28px_rgba(11,27,43,0.08)]">
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => jumpToThumbnailPage(-1)}
                disabled={activeThumbnailPage === 0}
                aria-label="Previous thumbnail page"
                className="grid h-[56px] w-[56px] place-items-center text-navy transition duration-300 ease-luxe hover:bg-gold hover:text-navy disabled:pointer-events-none disabled:opacity-35"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
              </button>
              <span className="min-w-[112px] px-5 text-center text-[13px] font-extrabold uppercase tracking-[0.2em] text-navy/74" suppressHydrationWarning>
                {String(activeThumbnailPage + 1).padStart(2, '0')} / {String(thumbnailPageCount).padStart(2, '0')}
              </span>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => jumpToThumbnailPage(1)}
                disabled={activeThumbnailPage >= thumbnailPageCount - 1}
                aria-label="Next thumbnail page"
                className="grid h-[56px] w-[56px] place-items-center text-navy transition duration-300 ease-luxe hover:bg-gold hover:text-navy disabled:pointer-events-none disabled:opacity-35"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2.2} />
              </button>
            </div>
          </div>

          <div ref={thumbnailScrollerRef} className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-[20px] overflow-x-auto scroll-smooth pb-1 md:gap-6">
            {tripKinds.map((kind, index) => (
              <button
                key={kind.title}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectKind(index)}
                data-trip-style-thumb
                className={cn(
                  'group relative h-[168px] min-w-0 basis-[calc((100%-20px)/2)] shrink-0 snap-start scroll-ms-5 overflow-hidden rounded-[28px] border text-left transition duration-300 ease-luxe hover:-translate-y-1 md:h-[198px] md:basis-[calc((100%-48px)/3)] lg:basis-[calc((100%-72px)/4)]',
                  activeIndex === index ? 'border-gold shadow-[0_18px_42px_rgba(200,169,106,0.18)]' : 'border-navy/10 hover:border-gold/70'
                )}
                aria-pressed={activeIndex === index}
              >
                <Image
                  src={kind.image}
                  alt={kind.alt}
                  fill
                  sizes="(min-width: 1280px) 300px, (min-width: 768px) 260px, 45vw"
                  quality={100}
                  suppressHydrationWarning
                  className="object-cover transition duration-500 ease-luxe group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,21,34,0.02),rgba(7,21,34,0.76))]" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-[13px] font-extrabold uppercase tracking-[0.2em] text-gold" suppressHydrationWarning>{kind.num}</p>
                  <p className="mt-[6px] text-[clamp(20px,2.25vw,30px)] font-black leading-[0.96] tracking-[-0.05em] text-ivory [text-shadow:0_4px_18px_rgba(0,0,0,0.5)]" suppressHydrationWarning>
                    {kind.title}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
