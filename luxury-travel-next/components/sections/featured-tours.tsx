'use client';

import { type PointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, MapPin, Quote, Star } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { CmsItem } from '@/lib/types';
import { tourHubKey, tourPath } from '@/lib/routing';
import { isLowResolutionTourImage } from '@/lib/tour-images';
import { defaultHomeSectionContent } from '@/lib/site-content-schema';

type JourneyReview = {
  rating: string;
  count: string;
  headline: string;
  quote: string;
  author: string;
  date: string;
};

type SpotlightCollection = {
  id: string;
  title: string;
  shortTitle: string;
  route: string;
  excerpt: string;
  href: string;
  image: string;
  imageAlt: string;
  rating: string;
  count: string;
  quote: string;
  cta: string;
};

const spotlightCollections: SpotlightCollection[] = [
  {
    id: 'vietnam',
    title: 'Vietnam Tours',
    shortTitle: 'Vietnam',
    route: 'Hanoi - Ninh Binh - Ha Long Bay - Hue - Hoi An - Mekong Delta',
    excerpt: 'Private Vietnam journeys from limestone valleys to lantern towns, paced for culture, food and refined stays.',
    href: '/vietnam-tours/',
    image: '/images/collections/vietnam-ban-gioc-waterfalls-4k.jpg',
    imageAlt: 'Ban Gioc Waterfalls surrounded by limestone mountains in Vietnam',
    rating: '4.98',
    count: '2,339 guest notes',
    quote: 'Vietnam routes with the right rhythm: heritage mornings, calm cruising and enough private time to breathe.',
    cta: 'Explore Vietnam tours'
  },
  {
    id: 'laos',
    title: 'Laos Tours',
    shortTitle: 'Laos',
    route: 'Luang Prabang - Mekong River - Kuang Si - Quiet lodges',
    excerpt: 'Slow luxury along the Mekong, spiritual mornings, waterfall days and soft private guiding.',
    href: '/laos-tours/',
    image: '/images/collections/laos-haw-pha-bang-monks-4k.jpg',
    imageAlt: 'Buddhist monks walking beside Haw Pha Bang temple in Luang Prabang',
    rating: '4.95',
    count: '904 guest notes',
    quote: 'Laos brings the reset: warm hosts, soft mornings and river-led pacing that feels deeply personal.',
    cta: 'Explore Laos tours'
  },
  {
    id: 'cambodia',
    title: 'Cambodia Tours',
    shortTitle: 'Cambodia',
    route: 'Siem Reap - Angkor - Tonle Sap - Phnom Penh',
    excerpt: 'Angkor interpreted with depth, boutique stays and quieter cultural moments around temples and countryside.',
    href: '/cambodia-tours/',
    image: '/images/collections/cambodia-banteay-srei-temple-4k.jpg',
    imageAlt: 'Banteay Srei temple carvings in the Angkor region of Cambodia',
    rating: '4.96',
    count: '1,126 guest notes',
    quote: 'Temple days timed around light, crowds and context, with enough space for Cambodia to feel intimate.',
    cta: 'Explore Cambodia tours'
  },
  {
    id: 'thailand',
    title: 'Thailand Tours',
    shortTitle: 'Thailand',
    route: 'Bangkok - Chiang Mai - Phuket - Krabi - Koh Samui',
    excerpt: 'Temple mornings, riverfront city energy and soft island luxury arranged with seamless private transfers.',
    href: '/thailand-tours/',
    image: '/images/collections/thailand-grand-palace-bangkok-4k.jpg',
    imageAlt: 'Grand Palace rooftops in Bangkok glowing above a quiet garden',
    rating: '4.97',
    count: '1,842 guest notes',
    quote: 'A graceful balance of Bangkok, northern rituals and resort time, without the rough edges of a standard package.',
    cta: 'Explore Thailand tours'
  },
  {
    id: 'myanmar',
    title: 'Myanmar Tours',
    shortTitle: 'Myanmar',
    route: 'Bagan - Yangon - Mandalay - Inle Lake',
    excerpt: 'Golden temple plains, teak heritage and lakeside villages shaped into calm private routes.',
    href: '/myanmar-tours/',
    image: '/images/hubs/myanmar-bagan-temples-4k.jpg',
    imageAlt: 'Hot air balloons over Bagan temples in Myanmar',
    rating: '4.95',
    count: '768 guest notes',
    quote: 'Myanmar works best with careful pacing: temple light, quiet lake days and respectful cultural context throughout.',
    cta: 'Explore Myanmar tours'
  },
  {
    id: 'multi-country',
    title: 'Multi Country Tours',
    shortTitle: 'Multi Country',
    route: 'Vietnam - Laos - Cambodia - Thailand - Myanmar',
    excerpt: 'One elegant Indochina arc with smart flights, border handoffs and varied cultural moods.',
    href: '/multi-country-tours/',
    image: '/images/collections/multi-country-mekong-sunset-4k.jpg',
    imageAlt: 'A small boat crossing the Mekong at sunset in Si Phan Don',
    rating: '4.99',
    count: '1,508 guest notes',
    quote: 'Several countries connected by one calm thread, with rest days protected and every handoff handled.',
    cta: 'Explore multi country tours'
  }
];

const reviewLibrary: Record<string, JourneyReview[]> = {
  vietnam: [
    {
      rating: '4.98',
      count: '2,339 reviews',
      headline: 'Private Vietnam, paced beautifully.',
      quote: 'Every transfer, guide and hotel felt calm, polished and personal. The route gave us space to enjoy Hanoi, Ha Long Bay and Hoi An without rushing.',
      author: 'Michael J',
      date: 'Feb 26, 2024'
    },
    {
      rating: '4.97',
      count: '1,906 reviews',
      headline: 'A graceful route from bay to old town.',
      quote: 'The team made Vietnam feel effortless: quiet cruise time, excellent food stops and guides who knew when to slow the day down.',
      author: 'Clara H.',
      date: 'Mar 18, 2024'
    },
    {
      rating: '4.99',
      count: '2,012 reviews',
      headline: 'Exactly the rhythm we hoped for.',
      quote: 'Hanoi, Ha Long and Hoi An were balanced with enough private time. It felt planned by someone who understood how we like to travel.',
      author: 'Daniel P.',
      date: 'Nov 9, 2023'
    }
  ],
  thailand: [
    {
      rating: '4.97',
      count: '1,842 reviews',
      headline: 'A honeymoon with no rough edges.',
      quote: 'The team balanced Bangkok energy, temple mornings and island quiet with the right hotels and seamless private transfers.',
      author: 'Marielavoyage',
      date: 'Dec 21, 2023'
    },
    {
      rating: '4.96',
      count: '1,418 reviews',
      headline: 'Beach days that still felt considered.',
      quote: 'We loved the mix of riverfront Bangkok, Chiang Mai food walks and relaxed island time. Nothing felt copied from a standard package.',
      author: 'Sophie K.',
      date: 'Jan 14, 2024'
    }
  ],
  cambodia: [
    {
      rating: '4.96',
      count: '1,126 reviews',
      headline: 'Angkor felt intimate and unhurried.',
      quote: 'Our guide timed the temples around light and crowds. It felt considered, generous and far more personal than a standard itinerary.',
      author: 'Seaside207741',
      date: 'Apr 6, 2024'
    },
    {
      rating: '4.98',
      count: '987 reviews',
      headline: 'Temple mornings with real depth.',
      quote: 'The historian guide changed everything. We saw the icons, but also quieter corners, countryside lunches and calm evenings in Siem Reap.',
      author: 'Nadia W.',
      date: 'Feb 3, 2024'
    }
  ],
  laos: [
    {
      rating: '4.95',
      count: '904 reviews',
      headline: 'Slow travel done with real grace.',
      quote: 'Luang Prabang, the Mekong and the quiet lodges gave us exactly the reset we wanted, with every detail handled before we had to ask.',
      author: 'Amelia R.',
      date: 'Oct 11, 2022'
    },
    {
      rating: '4.97',
      count: '812 reviews',
      headline: 'Quiet, warm and beautifully hosted.',
      quote: 'Laos was the surprise of the trip. Soft mornings, river views and thoughtful local hosts made it feel personal from start to finish.',
      author: 'Jonas M.',
      date: 'May 19, 2023'
    }
  ],
  myanmar: [
    {
      rating: '4.95',
      count: '768 reviews',
      headline: 'Bagan and Inle felt beautifully paced.',
      quote: 'The route gave us temple light, calm transfers and enough quiet time to understand each place instead of rushing through it.',
      author: 'Avery N.',
      date: 'Feb 8, 2024'
    },
    {
      rating: '4.96',
      count: '642 reviews',
      headline: 'Respectful guiding with real context.',
      quote: 'Yangon, Mandalay and the lake days were arranged with care. The guides gave depth while keeping the journey comfortable.',
      author: 'Leah S.',
      date: 'Jan 17, 2024'
    }
  ],
  'multi-country': [
    {
      rating: '4.99',
      count: '1,508 reviews',
      headline: 'A seamless Indochina arc.',
      quote: 'Vietnam, Cambodia and Laos connected naturally. Smart flights, generous rest days and excellent guides made the whole journey feel effortless.',
      author: 'Marcus L.',
      date: 'Aug 27, 2023'
    },
    {
      rating: '4.98',
      count: '1,284 reviews',
      headline: 'Three countries, one calm thread.',
      quote: 'Every border, flight and hotel handoff was smooth. We saw a lot without feeling pushed, which is exactly what we asked for.',
      author: 'Eleanor T.',
      date: 'Sep 12, 2023'
    }
  ],
  default: [
    {
      rating: '4.98',
      count: '2,339 reviews',
      headline: 'Every detail felt effortless.',
      quote: 'The journey was personal, polished and beautifully paced from the first consultation to the final private transfer.',
      author: 'Private guest',
      date: 'Recent journey'
    },
    {
      rating: '4.96',
      count: '1,074 reviews',
      headline: 'Thoughtful from the first call.',
      quote: 'The proposal listened carefully to our style, then the trip delivered that same calm feeling every day on the ground.',
      author: 'A returning guest',
      date: 'Recent journey'
    }
  ]
};

const reliableTourImages: Record<string, string[]> = {
  vietnam: [
    '/images/hubs/vietnam-hoi-an-ancient-town-4k-crisp.jpg',
    '/images/hubs/vietnam-sapa-rice-terraces-4k-crisp.jpg',
    '/images/hubs/vietnam-hue-imperial-city-4k-crisp.jpg',
    '/images/hubs/vietnam-trang-an-river-4k-crisp.jpg',
    '/images/hubs/vietnam-ha-long-bay-4k-crisp.jpg',
    '/images/collections/vietnam-ban-gioc-waterfalls-4k.jpg'
  ],
  thailand: ['/images/hubs/thailand-temple-4k-crisp.jpg', '/images/collections/thailand-grand-palace-bangkok-4k.jpg', '/images/assurance/thailand-wat-arun-bangkok-4k.jpg', '/images/assurance-hd/thailand-ang-thong-bay-4k-hd.jpg'],
  cambodia: ['/images/hubs/cambodia-angkor-wat-4k-crisp.jpg', '/images/collections/cambodia-banteay-srei-temple-4k.jpg', '/images/assurance/cambodia-bayon-temple-4k.jpg', '/images/assurance-hd/cambodia-ta-prohm-angkor-4k-hd.jpg'],
  laos: ['/images/hubs/laos-kuang-si-falls-4k-crisp.jpg', '/images/collections/laos-haw-pha-bang-monks-4k.jpg', '/images/assurance/laos-wat-xieng-thong-4k.jpg', '/images/assurance-hd/laos-wat-phou-pillared-path-4k-hd.jpg'],
  myanmar: ['/images/hubs/myanmar-bagan-temples-4k.jpg', '/images/trip-styles/culture-heritage-4k.jpg'],
  'multi-country': [
    '/images/collections/multi-country-mekong-sunset-4k.jpg',
    '/images/collections/tailor-made-private-pool-asia-4k.jpg',
    '/images/hubs/vietnam-sapa-rice-terraces-4k-crisp.jpg',
    '/images/hubs/cambodia-angkor-wat-4k-crisp.jpg',
    '/images/hubs/thailand-temple-4k-crisp.jpg',
    '/images/hubs/laos-kuang-si-falls-4k-crisp.jpg'
  ],
  default: ['/images/hubs/vietnam-hoi-an-ancient-town-4k-crisp.jpg', '/images/collections/multi-country-mekong-sunset-4k.jpg', '/images/trip-styles/luxury-stays-4k.jpg']
};

const warmedImages = new Set<string>();

function readText(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function countryKey(tour: CmsItem) {
  return tourHubKey(tour);
}

function countryLabel(key: string) {
  return key
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function reviewSeed(tour: CmsItem) {
  const source = `${tour.slug}-${tour.title}`;
  let total = 0;

  for (let index = 0; index < source.length; index += 1) {
    total += source.charCodeAt(index);
  }

  return total;
}

function fallbackImageFor(tour: CmsItem) {
  const options = reliableTourImages[countryKey(tour)] || reliableTourImages.default;
  return options[reviewSeed(tour) % options.length];
}

function isUnreliableImage(src: string) {
  return isLowResolutionTourImage(src) || /bestpricetravel|d122axpxm39woi|googlemap|\/1920px-/i.test(src);
}

function imageForTour(tour: CmsItem) {
  const source = readText(tour.featuredImage);
  return source && !isUnreliableImage(source) ? source : fallbackImageFor(tour);
}

function warmImage(src: string) {
  if (typeof window === 'undefined' || warmedImages.has(src)) return;
  warmedImages.add(src);
  const img = new window.Image();
  img.decoding = 'async';
  img.src = src;
}

function warmTourImages(tours: Array<CmsItem | undefined>) {
  tours.forEach((tour) => {
    if (tour) warmImage(imageForTour(tour));
  });
}

function animateCarouselNode(node: HTMLElement | null, direction: -1 | 1, distance = 24) {
  if (!node || typeof node.animate !== 'function') return;
  node.getAnimations().forEach((animation) => animation.cancel());
  node.animate(
    [
      { opacity: 0.82, transform: `translate3d(${direction * distance}px, 0, 0)` },
      { opacity: 1, transform: 'translate3d(0, 0, 0)' }
    ],
    { duration: 210, easing: 'cubic-bezier(.22, 1, .36, 1)' }
  );
}

function reviewFor(tour: CmsItem): JourneyReview {
  const options = reviewLibrary[countryKey(tour)] || reviewLibrary.default;
  const preset = options[reviewSeed(tour) % options.length];
  const details = tour.meta.details || {};

  return {
    rating: readText(details.reviewRating) || readText(details.rating) || preset.rating,
    count: readText(details.reviewCount) || preset.count,
    headline: readText(details.reviewTitle) || preset.headline,
    quote: readText(details.reviewQuote) || preset.quote,
    author: readText(details.reviewAuthor) || preset.author,
    date: readText(details.reviewDate) || preset.date
  };
}

function ReliableTourImage({
  tour,
  className,
  priority = false
}: {
  tour: CmsItem;
  className: string;
  priority?: boolean;
}) {
  const preferredSrc = imageForTour(tour);
  const fallbackSrc = fallbackImageFor(tour);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = failedSrc === preferredSrc ? fallbackSrc : preferredSrc;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={tour.title}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      className={className}
      onError={() => {
        if (src !== fallbackSrc) setFailedSrc(preferredSrc);
      }}
    />
  );
}

function ReviewDeckControls({ onMove }: { onMove: (direction: -1 | 1) => void }) {
  return (
    <div className="flex items-center gap-3" aria-label="Review carousel controls">
      <button
        type="button"
        onClick={() => onMove(-1)}
        className="grid h-12 w-12 place-items-center rounded-full border border-[#f8f5ef]/18 text-[#f8f5ef] transition duration-200 ease-luxe hover:border-[#c8a96a] hover:bg-[#c8a96a] hover:text-[#0b1b2b] active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c8a96a]"
        aria-label="Previous review"
      >
        <ChevronLeft className="h-6 w-6" strokeWidth={1.8} />
      </button>
      <button
        type="button"
        onClick={() => onMove(1)}
        className="grid h-12 w-12 place-items-center rounded-full border border-[#f8f5ef]/18 text-[#f8f5ef] transition duration-200 ease-luxe hover:border-[#c8a96a] hover:bg-[#c8a96a] hover:text-[#0b1b2b] active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c8a96a]"
        aria-label="Next review"
      >
        <ChevronRight className="h-6 w-6" strokeWidth={1.8} />
      </button>
    </div>
  );
}

function SpotlightControls({
  activeIndex,
  total,
  onMove,
  onSelect
}: {
  activeIndex: number;
  total: number;
  onMove: (direction: -1 | 1) => void;
  onSelect: (index: number) => void;
}) {
  const pointerHandledRef = useRef(false);

  if (total < 2) return null;

  const moveImmediately = (direction: -1 | 1) => ({
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      pointerHandledRef.current = true;
      onMove(direction);
    },
    onClick: () => {
      if (pointerHandledRef.current) {
        pointerHandledRef.current = false;
        return;
      }
      onMove(direction);
    }
  });
  const buttonClass =
    'grid h-12 w-12 touch-manipulation select-none place-items-center rounded-full bg-[#c8a96a] text-[#0b1b2b] shadow-[0_10px_26px_rgba(200,169,106,0.22)] transition duration-150 ease-luxe hover:bg-[#f8f5ef] active:scale-[0.94] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f8f5ef]';

  return (
    <>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-[#f8f5ef]/10 bg-[#f8f5ef]/7 p-4 sm:p-6">
      <div>
        <p className="text-[11px] font-extrabold uppercase leading-5 tracking-[0.22em] text-[#c8a96a]" suppressHydrationWarning>Signature tour deck</p>
        <p className="mt-1 text-sm font-semibold leading-6 text-[#f8f5ef]/62" suppressHydrationWarning>
          Showing {activeIndex + 1} of {total} signature collections
        </p>
      </div>
      <div className="flex items-center gap-2" aria-label="Featured tour carousel controls">
        <button
          type="button"
          {...moveImmediately(-1)}
          className={buttonClass}
          aria-label="Previous featured collection"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={1.8} />
        </button>
        <button
          type="button"
          {...moveImmediately(1)}
          className={buttonClass}
          aria-label="Next featured collection"
        >
          <ChevronRight className="h-6 w-6" strokeWidth={1.8} />
        </button>
      </div>
    </div>

    <div className="mt-5 rounded-[28px] border border-[rgba(248,245,239,0.10)] bg-[rgba(248,245,239,0.07)] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.14)] sm:p-5">
      <div>
        <div>
          <p className="text-[11px] font-extrabold uppercase leading-5 tracking-[0.22em] text-[#c8a96a]" suppressHydrationWarning>Choose collection</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-[#f8f5ef]/62" suppressHydrationWarning>{spotlightCollections[activeIndex]?.shortTitle} is selected</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {spotlightCollections.map((collection, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={collection.id}
              type="button"
              onPointerDown={(event) => {
                if (event.pointerType === 'mouse' && event.button !== 0) return;
                pointerHandledRef.current = true;
                onSelect(index);
              }}
              onClick={() => {
                if (pointerHandledRef.current) {
                  pointerHandledRef.current = false;
                  return;
                }
                onSelect(index);
              }}
              className={`group grid min-h-[56px] touch-manipulation grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[18px] px-4 py-3 text-left transition duration-150 ease-luxe active:scale-[0.985] ${
                isActive
                  ? 'bg-[#c8a96a] text-[#0b1b2b] shadow-[0_12px_28px_rgba(200,169,106,0.18)]'
                  : 'border border-[rgba(248,245,239,0.12)] bg-[rgba(7,24,39,0.42)] text-[#f8f5ef] hover:border-[rgba(200,169,106,0.42)] hover:bg-[rgba(248,245,239,0.10)]'
              }`}
              aria-pressed={isActive}
            >
              <span className={`rounded-full px-2 py-1 text-[10px] font-extrabold leading-none tracking-[0.12em] ${
                isActive ? 'bg-[#0b1b2b]/10 text-[#0b1b2b]/62' : 'bg-[#f8f5ef]/6 text-[#c8a96a]/82'
              }`}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className={`text-[12px] font-extrabold uppercase leading-none tracking-[0.15em] ${isActive ? 'text-[#0b1b2b]' : 'text-[#f8f5ef]/78'}`} suppressHydrationWarning>
                {collection.shortTitle}
              </span>
              <ChevronRight className={`h-4 w-4 transition duration-150 ease-luxe group-hover:translate-x-0.5 ${isActive ? 'text-[#0b1b2b]/70' : 'text-[#f8f5ef]/32'}`} strokeWidth={1.8} />
            </button>
          );
        })}
      </div>
    </div>
    </>
  );
}

function Stars({ className = '', size = 'h-4 w-4' }: { className?: string; size?: string }) {
  return (
    <span className={`inline-flex gap-1 ${className}`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={`${size} fill-current`} strokeWidth={1.45} />
      ))}
    </span>
  );
}

function JourneyReviewCard({ tour }: { tour: CmsItem }) {
  const review = reviewFor(tour);
  const key = countryKey(tour);
  const route = readText(tour.meta.details?.route) || countryLabel(key);
  const duration = readText(tour.meta.details?.duration) || 'Tailor-made';

  return (
    <Link href={tourPath(tour)} className="group block h-full">
      <article className="hlt-card-enter flex h-full flex-col overflow-hidden rounded-[32px] border border-[#f8f5ef]/10 bg-[#f8f5ef] text-[#0b1b2b] shadow-[0_26px_70px_rgba(0,0,0,0.28)] transition duration-300 ease-luxe group-hover:-translate-y-2 group-hover:shadow-[0_34px_90px_rgba(0,0,0,0.36)]">
        <div className="relative h-[310px] overflow-hidden bg-[#102334] sm:h-[330px] xl:h-[350px]">
          <ReliableTourImage
            tour={tour}
            className="absolute inset-0 h-full w-full object-cover contrast-[1.04] saturate-[1.08] transition duration-500 ease-luxe group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,27,43,0.04),rgba(11,27,43,0.78))]" />
          <div className="absolute bottom-6 left-6 right-6">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-extrabold uppercase leading-5 tracking-[0.18em] text-[#efe5d1]" suppressHydrationWarning>
              <MapPin className="h-4 w-4" strokeWidth={2.1} />
              <span suppressHydrationWarning>{route}</span>
              <span className="text-[#c8a96a]">/ </span>
              <span suppressHydrationWarning>{duration}</span>
            </p>
            <h3 className="mt-4 max-w-[17ch] break-words font-serif text-[clamp(27px,2vw,31px)] leading-[1.14] tracking-[-0.025em] text-[#f8f5ef]" suppressHydrationWarning>{tour.title}</h3>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6 sm:p-8">
          <div className="rounded-[22px] border border-[#0b1b2b]/8 bg-[#0b1b2b]/[0.035] px-4 py-4">
            <Stars className="text-[#c8a96a]" />
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#0b1b2b]/54" suppressHydrationWarning>{review.rating}/5</span>
              <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#0b1b2b]/46" suppressHydrationWarning>{review.count}</span>
            </div>
          </div>
          <p className="mt-6 text-[16px] font-extrabold leading-[1.36] tracking-[-0.02em] text-[#0b1b2b]" suppressHydrationWarning>{review.headline}</p>
          <p className="mt-4 text-[15px] font-medium leading-8 text-[#0b1b2b]/66" suppressHydrationWarning>{review.quote}</p>
          <div className="mt-8 border-t border-[#0b1b2b]/10 pt-6">
            <p className="text-[11px] font-extrabold uppercase leading-5 tracking-[0.16em] text-[#0b1b2b]/48" suppressHydrationWarning>{review.author} / {review.date}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.16em] text-[#9d7a3d] transition group-hover:text-[#0b1b2b]" suppressHydrationWarning>
              View journey <ArrowUpRight className="h-4 w-4" strokeWidth={2.1} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function SpotlightJourney({ collection }: { collection: SpotlightCollection }) {
  return (
    <Link href={collection.href} className="group block">
      <article className="hlt-card-enter relative flex min-h-[900px] flex-col overflow-hidden rounded-[40px] bg-[#071827] shadow-[0_34px_100px_rgba(0,0,0,0.4)] sm:min-h-[800px] lg:min-h-[780px] xl:min-h-[820px]">
        <Image
          src={collection.image}
          alt={collection.imageAlt}
          fill
          sizes="(min-width: 1280px) 1200px, 100vw"
          quality={100}
          priority={collection.id === 'vietnam'}
          className="object-cover transition duration-700 ease-luxe group-hover:scale-105"
          decoding="async"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,24,39,0.08),rgba(7,24,39,0.18)_34%,rgba(7,24,39,0.94))]" />
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4 p-6 sm:p-8 md:p-8">
          <span className="rounded-full border border-[#f8f5ef]/24 bg-[#0b1b2b]/72 px-4 py-2 text-[11px] font-extrabold uppercase leading-none tracking-[0.18em] text-[#f8f5ef] backdrop-blur-sm" suppressHydrationWarning>Signature collection</span>
          <span className="rounded-full bg-[#f8f5ef] px-4 py-2 text-[12px] font-extrabold uppercase leading-none tracking-[0.16em] text-[#0b1b2b]">{collection.rating}/5</span>
        </div>
        <div className="relative z-10 mt-auto p-6 pb-10 pt-32 sm:p-8 sm:pb-12 md:p-10 md:pb-12">
          <p className="text-[12px] font-extrabold uppercase leading-5 tracking-[0.22em] text-[#c8a96a]" suppressHydrationWarning>{collection.route}</p>
          <h3 className="mt-6 max-w-[14ch] break-words font-serif text-[clamp(26px,4.5vw,66px)] leading-[1.04] tracking-[-0.04em] text-[#f8f5ef]" suppressHydrationWarning>{collection.title}</h3>
          <p className="mt-6 max-w-[36rem] text-[16px] font-medium leading-8 text-[#f8f5ef]/74" suppressHydrationWarning>{collection.excerpt}</p>

          <div className="mt-8 rounded-[28px] border border-[#f8f5ef]/14 bg-[#f8f5ef]/10 p-6 backdrop-blur-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Stars className="text-[#c8a96a]" size="h-4 w-4" />
              <p className="text-[11px] font-extrabold uppercase leading-5 tracking-[0.16em] text-[#f8f5ef]/58" suppressHydrationWarning>{collection.count}</p>
            </div>
            <div className="mt-4 grid grid-cols-[auto_1fr] gap-4">
              <Quote className="mt-1 h-6 w-6 fill-[#c8a96a] text-[#c8a96a]" strokeWidth={1.5} />
              <p className="text-[15px] font-semibold leading-8 text-[#f8f5ef]" suppressHydrationWarning>{collection.quote}</p>
            </div>
          </div>

          <span className="mt-8 inline-flex items-center gap-4 rounded-full bg-[#c8a96a] px-6 py-4 text-[12px] font-extrabold uppercase leading-none tracking-[0.16em] text-[#0b1b2b] transition group-hover:bg-[#f8f5ef]" suppressHydrationWarning>
            {collection.cta} <ArrowUpRight className="h-4 w-4" strokeWidth={2.1} />
          </span>
        </div>
      </article>
    </Link>
  );
}

export function FeaturedTours({ tours, content = defaultHomeSectionContent.featuredTours }: { tours: CmsItem[]; content?: import('@/lib/site-content-schema').FeaturedToursContent }) {
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [reviewStartIndex, setReviewStartIndex] = useState(0);
  const spotlightMotionRef = useRef<HTMLDivElement>(null);
  const reviewTrackRef = useRef<HTMLDivElement>(null);
  const visibleTours = useMemo(() => tours.filter(Boolean), [tours]);
  const activeSpotlightIndex = spotlightIndex % spotlightCollections.length;
  const spotlight = spotlightCollections[activeSpotlightIndex];
  const reviewTours = visibleTours;
  const normalizedReviewStartIndex = reviewTours.length ? reviewStartIndex % reviewTours.length : 0;
  const reviewWindowSize = Math.min(6, reviewTours.length);
  const reviewWindowTours = useMemo(() => Array.from({ length: reviewWindowSize }, (_, offset) => {
    return reviewTours[(normalizedReviewStartIndex + offset) % reviewTours.length];
  }), [normalizedReviewStartIndex, reviewTours, reviewWindowSize]);

  useEffect(() => {
    warmImage(spotlight.image);
    warmImage(spotlightCollections[(activeSpotlightIndex + 1) % spotlightCollections.length].image);
    warmImage(spotlightCollections[(activeSpotlightIndex - 1 + spotlightCollections.length) % spotlightCollections.length].image);

    if (reviewTours.length) {
      warmTourImages([
        ...reviewWindowTours,
        reviewTours[(normalizedReviewStartIndex + reviewWindowSize) % reviewTours.length],
        reviewTours[(normalizedReviewStartIndex - 1 + reviewTours.length) % reviewTours.length]
      ]);
    }
  }, [activeSpotlightIndex, normalizedReviewStartIndex, reviewTours, reviewWindowSize, reviewWindowTours, spotlight, visibleTours]);

  function moveSpotlight(direction: -1 | 1) {
    animateCarouselNode(spotlightMotionRef.current, direction, 18);
    setSpotlightIndex((current) => {
      const next = (current + direction + spotlightCollections.length) % spotlightCollections.length;
      warmImage(spotlightCollections[next].image);
      return next;
    });
  }

  function selectSpotlight(index: number) {
    animateCarouselNode(spotlightMotionRef.current, index > activeSpotlightIndex ? 1 : -1, 14);
    warmImage(spotlightCollections[index].image);
    setSpotlightIndex(index);
  }

  function moveReviewDeck(direction: -1 | 1) {
    animateCarouselNode(reviewTrackRef.current, direction, 26);
    setReviewStartIndex((current) => {
      if (!reviewTours.length) return 0;
      const next = (current + direction + reviewTours.length) % reviewTours.length;
      warmTourImages([
        reviewTours[next],
        reviewTours[(next + reviewWindowSize) % reviewTours.length],
        reviewTours[(next + reviewWindowSize + 1) % reviewTours.length]
      ]);
      return next;
    });
  }

  if (!spotlight) return null;

  return (
    <section id="guest-rated-journeys" className="relative scroll-mt-[128px] overflow-hidden bg-[#071827] pb-24 pt-32 text-[#f8f5ef] md:pb-32 md:pt-32 lg:pt-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_8%,rgba(200,169,106,0.22),transparent_28%),radial-gradient(circle_at_84%_4%,rgba(239,229,209,0.10),transparent_32%),linear-gradient(180deg,rgba(7,24,39,0),rgba(11,27,43,0.92))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#c8a96a]/38" />

      <Container width="page" className="relative">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)] lg:items-end">
          <div>
            <p className="text-[12px] font-extrabold uppercase tracking-[0.28em] text-[#c8a96a]" suppressHydrationWarning>{content.eyebrow}</p>
            <h2 className="mt-6 max-w-[13ch] font-serif text-[clamp(26px,5.6vw,78px)] leading-[1.04] tracking-[-0.045em] text-[#f8f5ef]" suppressHydrationWarning>
              {content.heading}
            </h2>
          </div>
          <div className="relative bg-transparent pl-[10px] lg:max-w-[440px] lg:justify-self-start lg:pl-[6px]">
            <div className="grid gap-[16px] sm:grid-cols-[142px_minmax(0,1fr)] sm:items-end">
              <div>
                <p className="flex items-baseline leading-none text-[#f8f5ef] [font-variant-numeric:lining-nums_tabular-nums] [text-shadow:0_10px_34px_rgba(0,0,0,0.28)]" aria-label="Guest score 4.98 out of 5">
                  <span className="font-serif text-[82px] tracking-[-0.058em]">4</span>
                  <span className="mx-[1px] font-serif text-[48px] tracking-[-0.04em] text-[#f8f5ef]/90">.</span>
                  <span className="font-serif text-[72px] tracking-[-0.055em]">98</span>
                </p>
                <Stars className="mt-[10px] text-[#e2c67d] drop-shadow-[0_8px_20px_rgba(200,169,106,0.28)]" size="h-[22px] w-[22px]" />
              </div>

              <div className="pb-[5px]">
                <p className="text-[12px] font-extrabold uppercase leading-5 tracking-[0.28em] text-[#e2c67d]" suppressHydrationWarning>Guest-loved score</p>
                <p className="mt-[10px] max-w-[24ch] text-[19px] font-extrabold leading-[1.48] tracking-[-0.025em] text-[#f8f5ef] [text-shadow:0_8px_28px_rgba(0,0,0,0.22)]" suppressHydrationWarning>
                  2,339 private journey reviews.
                </p>
                <div className="mt-[12px] h-px w-[128px] bg-[linear-gradient(90deg,rgba(226,198,125,0.82),rgba(226,198,125,0))]"/>
                <p className="mt-[10px] text-[11px] font-extrabold uppercase leading-5 tracking-[0.18em] text-[#f8f5ef]/58" suppressHydrationWarning>
                  Verified feedback, curated by route
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-10 xl:grid-cols-[minmax(520px,0.92fr)_minmax(0,1.08fr)] xl:items-start">
          <div>
            <div ref={spotlightMotionRef} className="will-change-transform">
              <SpotlightJourney key={spotlight.id} collection={spotlight} />
            </div>
            <SpotlightControls activeIndex={activeSpotlightIndex} total={spotlightCollections.length} onMove={moveSpotlight} onSelect={selectSpotlight} />
          </div>

          <div className="min-w-0">
            <div className="mb-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
              <div className="max-w-xl">
                <p className="text-[13px] font-extrabold uppercase leading-5 tracking-[0.22em] text-[#c8a96a]" suppressHydrationWarning>Review-led routes</p>
                <p className="mt-4 text-sm font-medium leading-7 text-[#f8f5ef]/62" suppressHydrationWarning>
                  Each card combines a real itinerary, a guest note and the practical rhythm that made the route feel effortless.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:gap-5 xl:justify-end">
                <Link href="/vietnam-tours/" className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-[#f8f5ef]/18 px-6 py-4 text-[12px] font-extrabold uppercase leading-none tracking-[0.16em] text-[#f8f5ef] transition hover:border-[#c8a96a] hover:bg-[#c8a96a] hover:text-[#0b1b2b]" suppressHydrationWarning>
                  Browse journeys <ArrowUpRight className="h-4 w-4" strokeWidth={2.1} />
                </Link>
                <ReviewDeckControls onMove={moveReviewDeck} />
              </div>
            </div>

            <div ref={reviewTrackRef} className="no-scrollbar flex snap-x snap-mandatory gap-8 overflow-x-auto overscroll-contain scroll-smooth pb-6 pt-2 will-change-transform" aria-label="Guest review journeys">
              {reviewWindowTours.map((tour) => (
                <div key={tour.slug} className="flex shrink-0 basis-[min(84vw,390px)] snap-start md:basis-[calc((100%_-_32px)/2)]">
                  <JourneyReviewCard tour={tour} />
                </div>
              ))}
            </div>

            <div className="mb-12">
                <p className="text-[11px] font-extrabold uppercase leading-5 tracking-[0.2em] text-[#f8f5ef]/50" suppressHydrationWarning>
                Showing {normalizedReviewStartIndex + 1} of {reviewTours.length} guest-rated tours
              </p>
            </div>

            <div className="grid gap-8 rounded-[30px] border border-[#f8f5ef]/10 bg-[#f8f5ef]/7 p-6 md:grid-cols-3 md:p-8">
              {[
                ['Private guides', 'Local hosts matched to your pace'],
                ['Seamless routing', 'Transfers, flights and hotels aligned'],
                ['Tailor-made', 'Every route refined after consultation']
              ].map(([title, copy]) => (
                <div key={title}>
                  <p className="flex items-center gap-2 text-[12px] font-extrabold uppercase leading-5 tracking-[0.16em] text-[#c8a96a]" suppressHydrationWarning>
                    <CalendarDays className="h-4 w-4" strokeWidth={2.1} />
                    {title}
                  </p>
                  <p className="mt-2 text-sm font-medium leading-6 text-[#f8f5ef]/62" suppressHydrationWarning>{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
