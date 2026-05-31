'use client';

import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TourCard } from '@/components/tour-card';
import type { CmsItem } from '@/lib/types';

const toursPerPage = 6;

function chunkTours(tours: CmsItem[]) {
  const pages: CmsItem[][] = [];
  for (let index = 0; index < tours.length; index += toursPerPage) {
    pages.push(tours.slice(index, index + toursPerPage));
  }
  return pages;
}

export function StyleTourCarousel({ tours, styleTitle }: { tours: CmsItem[]; styleTitle: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pages = useMemo(() => chunkTours(tours), [tours]);
  const [activePage, setActivePage] = useState(0);
  const hasMultiplePages = pages.length > 1;

  const scrollToPage = (pageIndex: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const safeIndex = Math.max(0, Math.min(pageIndex, pages.length - 1));
    scroller.scrollTo({ left: safeIndex * scroller.clientWidth, behavior: 'smooth' });
    setActivePage(safeIndex);
  };

  const syncPageFromScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller || !scroller.clientWidth) return;
    setActivePage(Math.round(scroller.scrollLeft / scroller.clientWidth));
  };

  if (!hasMultiplePages) {
    return (
      <div className="mt-[38px] grid gap-[24px] md:grid-cols-2 xl:grid-cols-3">
        {tours.map((tour) => (
          <TourCard key={tour.slug} tour={tour} />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-[34px]">
      <div className="mb-[22px] flex flex-wrap items-center justify-between gap-[14px]">
        <p className="text-[13px] font-extrabold uppercase tracking-[0.18em] text-navy/48">
          {tours.length} matching {styleTitle.toLowerCase()} tours
        </p>
        <div className="flex items-center gap-[10px]">
          <button
            type="button"
            onClick={() => scrollToPage(activePage - 1)}
            disabled={activePage === 0}
            className="grid h-[46px] w-[46px] place-items-center rounded-full border border-gold/32 bg-[#fffdf7] text-navy shadow-[0_10px_26px_rgba(11,27,43,0.07)] transition hover:-translate-y-0.5 hover:bg-gold disabled:pointer-events-none disabled:opacity-35"
            aria-label="Previous tour group"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[52px] text-center text-[12px] font-black uppercase tracking-[0.16em] text-navy/45">
            {activePage + 1}/{pages.length}
          </span>
          <button
            type="button"
            onClick={() => scrollToPage(activePage + 1)}
            disabled={activePage >= pages.length - 1}
            className="grid h-[46px] w-[46px] place-items-center rounded-full border border-gold/32 bg-gold text-navy shadow-[0_12px_30px_rgba(200,169,106,0.20)] transition hover:-translate-y-0.5 hover:bg-navy hover:text-gold disabled:pointer-events-none disabled:opacity-35"
            aria-label="Next tour group"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        onScroll={syncPageFromScroll}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth pb-[6px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {pages.map((page, pageIndex) => (
          <div key={`style-tour-page-${pageIndex}`} className="grid w-full shrink-0 snap-start gap-[24px] pr-[1px] md:grid-cols-2 xl:grid-cols-3">
            {page.map((tour) => (
              <TourCard key={tour.slug} tour={tour} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
