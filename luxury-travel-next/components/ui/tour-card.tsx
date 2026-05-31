'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Heart, MapPin, Star } from 'lucide-react';
import { CmsItem } from '@/lib/types';
import { hoverLift, hoverTransition, imageZoom } from '@/lib/motion';
import { tourHubKey, tourPath } from '@/lib/routing';
import { tourDisplayImage, tourImageFallbacks } from '@/lib/tour-images';
import { cn } from '@/lib/utils';
import { SafeTourImage } from './safe-tour-image';

type TourReview = {
  rating: string;
  count: string;
  title: string;
  quote: string;
  author: string;
  date: string;
};

const fallbackReviews: Record<string, TourReview> = {
  vietnam: {
    rating: '4.98',
    count: '2,339 reviews',
    title: 'Delicious Hanoi street food tour!',
    quote: 'We were fortunate enough to experience an incredible food journey through Hanoi with a very special local guide. The day felt personal, generous and beautifully paced.',
    author: 'Michael J',
    date: 'Feb 26, 2024'
  },
  thailand: {
    rating: '4.97',
    count: '1,842 reviews',
    title: 'A flawless honeymoon from city to island.',
    quote: 'Every handoff was smooth, every hotel had the right atmosphere and the rhythm moved from Bangkok energy to island quiet without stress.',
    author: 'Marielavoyage',
    date: 'Dec 21, 2023'
  },
  cambodia: {
    rating: '4.96',
    count: '1,126 reviews',
    title: 'Chloe hits a home run for us!',
    quote: 'They took the ideas of four friends and created a memorable route. Logistics across temples, hotels and transfers were handled with calm confidence.',
    author: 'Seaside207741',
    date: 'Apr 6, 2024'
  },
  laos: {
    rating: '4.95',
    count: '904 reviews',
    title: 'Slow travel done right',
    quote: 'Luang Prabang, the Mekong and the lodges gave us the quiet reset we were hoping for.',
    author: 'Amelia R.',
    date: 'Oct 11, 2022'
  },
  myanmar: {
    rating: '4.95',
    count: '768 reviews',
    title: 'Bagan and Inle with the right rhythm',
    quote: 'Temple plains, lake villages and heritage cities were paced carefully, with private guiding that gave each stop real context.',
    author: 'Avery N.',
    date: 'Feb 8, 2024'
  },
  'multi-country': {
    rating: '4.99',
    count: '1,508 reviews',
    title: 'Seamless Indochina routing',
    quote: 'Vietnam, Cambodia and Laos connected naturally, with smart flights and generous rest days.',
    author: 'Marcus L.',
    date: 'Aug 27, 2023'
  },
  default: {
    rating: '4.98',
    count: '2,339 reviews',
    title: 'Excellent guest experience',
    quote: 'Every detail felt effortless, personal and beautifully paced from first plan to final transfer.',
    author: 'Private guest',
    date: 'Recent journey'
  }
};

function readText(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.]/g, ''));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function formatUsd(value: unknown) {
  const number = readNumber(value);
  return number ? `$${Math.round(number).toLocaleString('en-US')}` : undefined;
}

function compactPrice(value: string) {
  if (/price on request|private quote/i.test(value)) return value;
  return value.replace(/^(?:From\s+)?USD\s+/i, '$').replace(/\s+pp$/i, '');
}

function initials(name: string) {
  const letters = name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2);
  return letters || 'G';
}

function tourReview(tour: CmsItem): TourReview {
  const details = tour.meta.details || {};
  const country = tourHubKey(tour);
  const preset = fallbackReviews[country] || fallbackReviews.default;

  return {
    rating: readText(details.reviewRating) || readText(details.rating) || preset.rating,
    count: readText(details.reviewCount) || preset.count,
    title: readText(details.reviewTitle) || preset.title,
    quote: readText(details.reviewQuote) || preset.quote,
    author: readText(details.reviewAuthor) || preset.author,
    date: readText(details.reviewDate) || preset.date
  };
}

export function SystemTourCard({ tour, horizontal = false }: { tour: CmsItem; horizontal?: boolean }) {
  const duration = String(tour.meta.details?.duration || 'Tailor-made');
  const style = String(tour.meta.details?.style || 'Private');
  const price = tour.meta.pricing?.[0]?.price || 'Price on request';
  const oldPrice = formatUsd(tour.meta.details?.oldPriceUsd);
  const route = readText(tour.meta.details?.route);
  const review = tourReview(tour);
  const score = readNumber(review.rating) || 0;
  const tenPointScore = score > 5 ? score : score * 2;
  const displayPrice = compactPrice(price);
  const hasNumericPrice = displayPrice.startsWith('$');
  const imageSrc = tourDisplayImage(tour);

  if (horizontal) {
    return (
      <Link href={tourPath(tour)} className="block w-[82vw] max-w-[580px] shrink-0 snap-start sm:w-[520px] xl:w-[560px]">
        <motion.article
          whileHover={{ y: -4 }}
          transition={hoverTransition}
          className="group h-full rounded-[24px] p-1 transition duration-200 ease-luxe focus-within:outline-none sm:p-0"
        >
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#eadbc1,#c8a96a_48%,#be1e2d)] text-[14px] font-extrabold uppercase tracking-[0.04em] text-[#231f20] shadow-[0_8px_24px_rgba(35,31,32,0.12)] ring-1 ring-[#fffef8]/80" aria-hidden="true">
              {initials(review.author)}
            </span>
            <span>
              <span className="block text-[20px] font-extrabold leading-tight text-[#231f20]">{review.author}</span>
              <span className="mt-1 block text-[16px] font-medium text-[#5e5e5e]">{review.date}</span>
            </span>
          </div>

          <div className="mt-8 flex gap-[6px] text-[#be1e2d]" aria-label={`${review.rating} out of 5`}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="h-[20px] w-[20px] fill-[#be1e2d]" strokeWidth={1.45} />
            ))}
          </div>

          <h3 className="mt-6 text-[clamp(22px,2vw,27px)] font-extrabold leading-[1.25] tracking-[-0.025em] text-[#231f20] transition group-hover:text-[#be1e2d]">
            {review.title}
          </h3>
          <p className="mt-6 line-clamp-4 max-w-[58ch] text-[clamp(19px,1.35vw,24px)] font-medium leading-[1.55] tracking-[-0.015em] text-[#231f20]/82">
            {review.quote}
          </p>
        </motion.article>
      </Link>
    );
  }

  return (
    <Link href={tourPath(tour)} className="group block h-full min-w-0 rounded-[30px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/45">
      <motion.article
        initial="rest"
        whileHover="hover"
        variants={hoverLift}
        transition={hoverTransition}
        className="flex h-full min-h-[640px] flex-col overflow-hidden rounded-[30px] border border-gold/35 bg-[linear-gradient(180deg,#fffaf0_0%,#f6ead5_100%)] shadow-[0_22px_58px_rgba(0,0,0,0.22)] transition duration-200 ease-luxe hover:-translate-y-1 hover:border-gold/70 hover:shadow-[0_34px_84px_rgba(0,0,0,0.32)]"
      >
        <div className="relative h-[280px] overflow-hidden bg-navy/10 sm:h-[305px] lg:h-[320px]">
          <motion.div variants={imageZoom} transition={{ ...hoverTransition, duration: 1.1 }} className="absolute inset-0">
            <SafeTourImage
              src={imageSrc}
              fallbackSrcs={tourImageFallbacks(tour, imageSrc)}
              alt={tour.title}
              fill
              sizes="(min-width: 1440px) 31vw, (min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,27,43,0.10)_0%,rgba(11,27,43,0.08)_44%,rgba(11,27,43,0.72)_100%)] transition duration-500 group-hover:bg-[linear-gradient(180deg,rgba(11,27,43,0.02)_0%,rgba(11,27,43,0.04)_42%,rgba(11,27,43,0.56)_100%)]" />
          <span className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full border border-pearl/80 bg-pearl text-navy shadow-[0_10px_28px_rgba(0,0,0,0.24)] transition group-hover:bg-gold" aria-hidden="true">
            <Heart className="h-6 w-6 stroke-[2.2]" />
          </span>
          <div className="absolute left-4 right-20 top-4 flex flex-wrap gap-2">
            <span className="max-w-full rounded-full bg-pearl/95 px-[14px] py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-navy shadow-[0_8px_22px_rgba(0,0,0,0.16)]">{duration}</span>
            <span className="max-w-[172px] truncate rounded-full bg-gold px-[14px] py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-navy shadow-[0_8px_22px_rgba(0,0,0,0.16)]">{style}</span>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
            <span className="rounded-full border border-pearl/25 bg-navy/74 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-pearl shadow-[0_10px_28px_rgba(0,0,0,0.22)]">
              Private tour
            </span>
            <span className="hidden rounded-full bg-pearl/92 px-[12px] py-[6px] text-xs font-extrabold text-navy shadow-[0_10px_28px_rgba(0,0,0,0.18)] sm:inline-flex">
              {review.count}
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-6 md:p-8">
          <h3 className="line-clamp-2 min-h-[4.8rem] font-serif text-[clamp(1.75rem,2.15vw,2.15rem)] font-semibold leading-[1.1] tracking-[-0.035em] text-navy transition group-hover:text-[#9b2f25]">{tour.title}</h3>
          <div className="mt-6 flex gap-2 rounded-[22px] border border-gold/20 bg-[#efe5d1]/72 px-4 py-[12px] text-sm font-bold leading-6 text-navy/70">
            <MapPin className="mt-1 h-4 w-4 shrink-0 text-gold-dark" />
            <span className="line-clamp-2 min-w-0">{route || 'Route customized around your travel dates.'}</span>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-[10px] bg-[#176f4b] px-[12px] py-[6px] text-base font-extrabold leading-none text-pearl shadow-[0_10px_22px_rgba(23,111,75,0.18)]">{tenPointScore ? tenPointScore.toFixed(1) : review.rating}</span>
            <span className="font-extrabold text-[#176f4b]">Excellent</span>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-navy/24" />
            <span className="font-bold text-navy/52">{review.count}</span>
          </div>
          <div className="mt-auto pt-8">
            <div className="flex flex-col gap-6 rounded-[24px] border border-navy/10 bg-[#fffdf7] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
              <div className="min-w-0">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.20em] text-gold-dark">{hasNumericPrice ? 'From' : 'Quote'}</span>
                <div className="mt-1 flex flex-wrap items-end gap-x-2 gap-y-1">
                  {oldPrice && <span className="pb-1 text-base font-bold text-navy/42 line-through">US{oldPrice}</span>}
                  <span className={cn('whitespace-nowrap font-extrabold leading-none tracking-[-0.055em]', hasNumericPrice ? 'text-[2.15rem] text-[#a83224]' : 'text-lg text-navy')}>
                    {hasNumericPrice ? `US ${displayPrice}` : displayPrice}
                  </span>
                  {hasNumericPrice && <span className="pb-1 text-sm font-bold text-navy/55">/pax</span>}
                </div>
              </div>
              <span className="inline-flex min-h-[54px] w-full shrink-0 items-center justify-center gap-2 rounded-[18px] bg-[#c85f2f] px-6 text-sm font-extrabold uppercase tracking-[0.12em] text-pearl shadow-[0_14px_30px_rgba(200,95,47,0.26)] transition group-hover:bg-gold group-hover:text-navy">
                View tour <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-6 flex text-gold" aria-label={`${review.rating} guest score`}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="h-4 w-4 fill-gold" />
              ))}
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
