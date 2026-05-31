'use client';

import { FormEvent, useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { bookingDestinations, bookingStyles } from '@/lib/booking-options';
import { hubOrder } from '@/lib/routing';

const durationOptions = [
  { value: 'all', label: 'Any duration' },
  { value: 'short', label: '1-6 days' },
  { value: 'classic', label: '7-10 days' },
  { value: 'deep', label: '11-15 days' },
  { value: 'epic', label: '16+ days' }
];

const budgetOptions = [
  { value: 'all', label: 'Any budget' },
  { value: 'under-1000', label: 'Under USD 1,000' },
  { value: '1000-2000', label: 'USD 1,000-2,000' },
  { value: '2000-3500', label: 'USD 2,000-3,500' },
  { value: '3500-plus', label: 'USD 3,500+' }
];

const destinationPathByValue = new Map(
  hubOrder.map((hub) => [hub.label.replace(/ Tours$/i, ''), hub.path])
);

function selectClassName() {
  return 'mt-4 h-[66px] w-full rounded-[24px] border border-navy/10 bg-[#fffdf7] px-6 text-sm font-extrabold text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_16px_38px_rgba(11,27,43,0.10)] outline-none transition focus:border-gold focus:shadow-[0_0_0_4px_rgba(200,169,106,0.18),0_16px_38px_rgba(11,27,43,0.10)]';
}

export function HeroTourSearch() {
  const router = useRouter();
  const [destination, setDestination] = useState('Vietnam');
  const [query, setQuery] = useState('');
  const [style, setStyle] = useState('all');
  const [duration, setDuration] = useState('all');
  const [budget, setBudget] = useState('all');

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const path = destinationPathByValue.get(destination) || '/vietnam-tours/';
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (style !== 'all') params.set('style', style);
    if (duration !== 'all') params.set('duration', duration);
    if (budget !== 'all') params.set('budget', budget);
    const queryString = params.toString();
    router.push(`${path}${queryString ? `?${queryString}` : ''}#tours`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto mt-8 w-full max-w-[1480px] overflow-hidden rounded-[34px] border border-pearl/45 bg-[radial-gradient(circle_at_10%_0%,rgba(200,169,106,0.30),transparent_30%),linear-gradient(135deg,#fffaf1_0%,#f1e3c7_52%,#fbf6eb_100%)] p-6 text-left text-navy shadow-[0_30px_90px_rgba(0,0,0,0.32)] md:p-8 lg:p-10"
      aria-label="Search tours"
    >
      <div className="relative grid gap-6 lg:grid-cols-[minmax(300px,1.35fr)_minmax(190px,0.75fr)_minmax(190px,0.75fr)_minmax(190px,0.75fr)_minmax(190px,0.75fr)] lg:gap-8">
        <div className="min-w-0">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-gold-dark">Search tours</span>
          <div className="mt-4 flex min-h-[66px] items-center gap-4 rounded-[24px] border border-navy/10 bg-[#fffdf7] px-6 text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_18px_44px_rgba(11,27,43,0.14)] transition focus-within:border-gold focus-within:shadow-[0_0_0_4px_rgba(200,169,106,0.18),0_18px_44px_rgba(11,27,43,0.14)]">
            <Search className="h-[20px] w-[20px] shrink-0 text-gold-dark" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Route, city, style..."
              className="h-full min-h-[60px] w-full min-w-0 bg-transparent text-base font-extrabold outline-none placeholder:text-navy/42"
            />
          </div>
        </div>
        <label className="block">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-gold-dark">Country</span>
          <select value={destination} onChange={(event) => setDestination(event.target.value)} className={selectClassName()}>
            {bookingDestinations.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-gold-dark">Style</span>
          <select value={style} onChange={(event) => setStyle(event.target.value)} className={selectClassName()}>
            <option value="all">Any style</option>
            {bookingStyles.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-gold-dark">Duration</span>
          <select value={duration} onChange={(event) => setDuration(event.target.value)} className={selectClassName()}>
            {durationOptions.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-gold-dark">Budget</span>
          <select value={budget} onChange={(event) => setBudget(event.target.value)} className={selectClassName()}>
            {budgetOptions.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="relative mt-10 flex items-center justify-end">
        <button
          type="submit"
          className="inline-flex min-h-[56px] items-center gap-2.5 rounded-full border border-[#f6dfa2]/70 bg-[linear-gradient(135deg,#f2cf7a_0%,#c99a3d_52%,#a97725_100%)] px-10 text-[13px] font-black uppercase tracking-[0.18em] text-[#071421] shadow-[0_14px_32px_rgba(136,92,28,0.30),inset_0_1px_0_rgba(255,255,255,0.50)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(136,92,28,0.38),inset_0_1px_0_rgba(255,255,255,0.60)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/45"
        >
          <Search className="h-[15px] w-[15px] shrink-0" strokeWidth={2.8} />
          <span>Search Now</span>
        </button>
      </div>
    </form>
  );
}
