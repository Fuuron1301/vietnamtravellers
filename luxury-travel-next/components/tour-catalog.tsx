'use client';

import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TourCard } from '@/components/tour-card';
import { CmsItem } from '@/lib/types';
import { hubOrder, tourHubKey } from '@/lib/routing';
import { bookingDestinations } from '@/lib/booking-options';

const PAGE_SIZE = 12;

type DurationFilter = 'all' | 'short' | 'classic' | 'deep' | 'epic';
type BudgetFilter = 'all' | 'under-1000' | '1000-2000' | '2000-3500' | '3500-plus';

const durationOptions: Array<{ value: DurationFilter; label: string }> = [
  { value: 'all', label: 'Any duration' },
  { value: 'short', label: '1-6 days' },
  { value: 'classic', label: '7-10 days' },
  { value: 'deep', label: '11-15 days' },
  { value: 'epic', label: '16+ days' }
];

const budgetOptions: Array<{ value: BudgetFilter; label: string }> = [
  { value: 'all', label: 'Any budget' },
  { value: 'under-1000', label: 'Under USD 1,000' },
  { value: '1000-2000', label: 'USD 1,000-2,000' },
  { value: '2000-3500', label: 'USD 2,000-3,500' },
  { value: '3500-plus', label: 'USD 3,500+' }
];

const destinationPathByValue = new Map(
  hubOrder.map((hub) => [hub.label.replace(/ Tours$/i, ''), hub.path])
);

function readText(value: unknown, fallback = '') {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function durationDays(tour: CmsItem) {
  const raw = readText(tour.meta.details?.duration);
  const weekMatch = raw.match(/(\d+)\s*weeks?/i);
  if (weekMatch) return Number.parseInt(weekMatch[1], 10) * 7;
  const dayMatch = raw.match(/(\d+)\s*days?/i);
  if (dayMatch) return Number.parseInt(dayMatch[1], 10);
  return 0;
}

function priceUsd(tour: CmsItem) {
  const fromDetails = tour.meta.details?.priceFromUsd;
  if (typeof fromDetails === 'number' && Number.isFinite(fromDetails)) return fromDetails;
  const raw = readText(tour.meta.pricing?.[0]?.price);
  const match = raw.replace(/,/g, '').match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

function matchesDuration(tour: CmsItem, filter: DurationFilter) {
  const days = durationDays(tour);
  if (filter === 'all' || days === 0) return true;
  if (filter === 'short') return days <= 6;
  if (filter === 'classic') return days >= 7 && days <= 10;
  if (filter === 'deep') return days >= 11 && days <= 15;
  return days >= 16;
}

function matchesBudget(tour: CmsItem, filter: BudgetFilter) {
  const price = priceUsd(tour);
  if (filter === 'all' || price === 0) return true;
  if (filter === 'under-1000') return price < 1000;
  if (filter === '1000-2000') return price >= 1000 && price <= 2000;
  if (filter === '2000-3500') return price > 2000 && price <= 3500;
  return price > 3500;
}

export function TourCatalog({ tours, hubTitle }: { tours: CmsItem[]; hubTitle: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDuration = searchParams.get('duration');
  const initialBudget = searchParams.get('budget');
  const initialDestination = hubTitle.replace(/ Tours$/i, '');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [destination, setDestination] = useState(initialDestination);
  const [style, setStyle] = useState(searchParams.get('style') || 'all');
  const [duration, setDuration] = useState<DurationFilter>(durationOptions.some((option) => option.value === initialDuration) ? initialDuration as DurationFilter : 'all');
  const [budget, setBudget] = useState<BudgetFilter>(budgetOptions.some((option) => option.value === initialBudget) ? initialBudget as BudgetFilter : 'all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  function resetVisible() {
    setVisibleCount(PAGE_SIZE);
  }

  function navigateToDestination(value: string) {
    setDestination(value);
    const path = destinationPathByValue.get(value);
    if (!path) return;
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (style !== 'all') params.set('style', style);
    if (duration !== 'all') params.set('duration', duration);
    if (budget !== 'all') params.set('budget', budget);
    const queryString = params.toString();
    router.push(`${path}${queryString ? `?${queryString}` : ''}#tours`);
  }

  const tourOnly = useMemo(() => tours.filter((tour) => tour.type === 'hlt_tour'), [tours]);
  const styleOptions = useMemo(() => {
    const values = new Set<string>();
    tourOnly.forEach((tour) => {
      const value = readText(tour.meta.details?.style);
      if (value) values.add(value);
    });
    return ['all', ...Array.from(values).sort((a, b) => a.localeCompare(b))];
  }, [tourOnly]);

  const filteredTours = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return tourOnly.filter((tour) => {
      const details = tour.meta.details || {};
      const hubKey = tourHubKey(tour);
      const haystack = [
        tour.title,
        tour.excerpt,
        readText(details.route),
        readText(details.country),
        readText(hubKey),
        readText(details.style),
        Array.isArray(details.places) ? details.places.join(' ') : ''
      ]
        .join(' ')
        .toLowerCase();
      const styleValue = readText(details.style);
      return (!needle || haystack.includes(needle)) && (style === 'all' || styleValue === style) && matchesDuration(tour, duration) && matchesBudget(tour, budget);
    });
  }, [budget, duration, query, style, tourOnly]);

  const visibleTours = filteredTours.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTours.length;

  return (
    <div className="mt-16">
      <div className="relative overflow-hidden rounded-[34px] border border-gold/35 bg-[radial-gradient(circle_at_10%_0%,rgba(200,169,106,0.30),transparent_30%),linear-gradient(135deg,#fffaf1_0%,#f1e3c7_52%,#fbf6eb_100%)] p-4 text-navy shadow-[0_30px_90px_rgba(0,0,0,0.30)] md:p-6 lg:p-8">
        <div className="pointer-events-none absolute -right-24 -top-[112px] h-[256px] w-[256px] rounded-full border border-gold/25" />
        <div className="pointer-events-none absolute -bottom-[112px] left-10 h-[288px] w-[288px] rounded-full bg-gold/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor="tour-search" className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-gold-dark">
              Search {hubTitle}
            </label>
            <div className="mt-4 flex min-h-[66px] items-center gap-4 rounded-[24px] border border-navy/10 bg-[#fffdf7] px-6 text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_18px_44px_rgba(11,27,43,0.14)] transition focus-within:border-gold focus-within:shadow-[0_0_0_4px_rgba(200,169,106,0.18),0_18px_44px_rgba(11,27,43,0.14)]">
              <Search className="h-[20px] w-[20px] shrink-0 text-gold-dark" />
              <input
                id="tour-search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  resetVisible();
                }}
                placeholder="Route, city, style..."
                className="h-full min-h-[60px] w-full min-w-0 bg-transparent text-base font-extrabold outline-none placeholder:text-navy/42"
              />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:w-[68%] lg:grid-cols-4">
            <label className="block">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-gold-dark">Country</span>
              <select value={destination} onChange={(event) => navigateToDestination(event.target.value)} className="mt-2 h-[50px] w-full rounded-[18px] border border-navy/10 bg-[#fffdf7] px-3 text-[12px] font-extrabold text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_16px_38px_rgba(11,27,43,0.10)] outline-none transition focus:border-gold focus:shadow-[0_0_0_4px_rgba(200,169,106,0.18),0_16px_38px_rgba(11,27,43,0.10)] sm:mt-4 sm:h-[66px] sm:rounded-[24px] sm:px-6 sm:text-sm">
                {bookingDestinations.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-gold-dark">Style</span>
              <select value={style} onChange={(event) => {
                setStyle(event.target.value);
                resetVisible();
              }} className="mt-2 h-[50px] w-full rounded-[18px] border border-navy/10 bg-[#fffdf7] px-3 text-[12px] font-extrabold text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_16px_38px_rgba(11,27,43,0.10)] outline-none transition focus:border-gold focus:shadow-[0_0_0_4px_rgba(200,169,106,0.18),0_16px_38px_rgba(11,27,43,0.10)] sm:mt-4 sm:h-[66px] sm:rounded-[24px] sm:px-6 sm:text-sm">
                {styleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'all' ? 'Any style' : option}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-gold-dark">Duration</span>
              <select value={duration} onChange={(event) => {
                setDuration(event.target.value as DurationFilter);
                resetVisible();
              }} className="mt-2 h-[50px] w-full rounded-[18px] border border-navy/10 bg-[#fffdf7] px-3 text-[12px] font-extrabold text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_16px_38px_rgba(11,27,43,0.10)] outline-none transition focus:border-gold focus:shadow-[0_0_0_4px_rgba(200,169,106,0.18),0_16px_38px_rgba(11,27,43,0.10)] sm:mt-4 sm:h-[66px] sm:rounded-[24px] sm:px-6 sm:text-sm">
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-gold-dark">Budget</span>
              <select value={budget} onChange={(event) => {
                setBudget(event.target.value as BudgetFilter);
                resetVisible();
              }} className="mt-2 h-[50px] w-full rounded-[18px] border border-navy/10 bg-[#fffdf7] px-3 text-[12px] font-extrabold text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_16px_38px_rgba(11,27,43,0.10)] outline-none transition focus:border-gold focus:shadow-[0_0_0_4px_rgba(200,169,106,0.18),0_16px_38px_rgba(11,27,43,0.10)] sm:mt-4 sm:h-[66px] sm:rounded-[24px] sm:px-6 sm:text-sm">
                {budgetOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="relative mt-6 flex flex-wrap items-center justify-between gap-4 text-sm font-bold text-navy/72">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-navy px-4 py-2 text-pearl shadow-[0_12px_28px_rgba(11,27,43,0.18)]">
            <SlidersHorizontal className="h-4 w-4 text-gold" />
            Showing {visibleTours.length} of {filteredTours.length} tours
          </span>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setStyle('all');
              setDuration('all');
              setBudget('all');
              resetVisible();
            }}
            className="rounded-full border border-gold/55 bg-[#fffdf7]/70 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-gold-dark shadow-[0_10px_24px_rgba(11,27,43,0.10)] transition hover:border-navy hover:bg-navy hover:text-pearl"
          >
            Reset filters
          </button>
        </div>
      </div>

      {visibleTours.length > 0 ? (
        <>
          <div className="mt-16 grid items-stretch gap-x-10 gap-y-12 [grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr))]">
            {visibleTours.map((tour) => (
              <TourCard key={tour.slug} tour={tour} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-16 text-center">
              <button type="button" onClick={() => setVisibleCount((value) => value + PAGE_SIZE)} className="inline-flex min-h-[66px] items-center rounded-full border border-gold/55 bg-gold px-10 text-sm font-extrabold uppercase tracking-[0.16em] text-navy shadow-[0_18px_42px_rgba(200,169,106,0.22)] transition hover:-translate-y-0.5 hover:bg-pearl">
                View more tours
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-10 rounded-[30px] border border-gold/30 bg-pearl p-8 text-center text-navy shadow-[0_22px_60px_rgba(0,0,0,0.22)]">
          <p className="font-serif text-3xl tracking-widest">No matching journey yet.</p>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-7 text-navy/68">Clear the filters or send a tailor-made request and we will shape a route around your dates, budget and travel style.</p>
        </div>
      )}
    </div>
  );
}
