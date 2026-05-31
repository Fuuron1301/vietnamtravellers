'use client';

import { motion } from 'framer-motion';
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import Link from 'next/link';
import { AlertCircle, ArrowUpRight, Check, ChevronLeft, ChevronRight, Clock3, CreditCard, Heart, Loader2, Mail, MapPin, MessageCircle, Minus, Plus, Send, Sparkles, Star } from 'lucide-react';
import Script from 'next/script';
import { SafeTourImage } from '@/components/ui/safe-tour-image';
import { LeadPayload } from '@/lib/types';
import { luxeTransition } from '@/lib/motion';
import { trackEvent } from '@/lib/tracking';
import { cn } from '@/lib/utils';
import { matchBookingTours, type BookingTourCandidate, type BookingTourMatch } from '@/lib/booking-tour-matcher';
import { countryTourImageFallback } from '@/lib/tour-images';
import {
  bookingBudgets,
  bookingCatalogStats,
  bookingDestinations,
  bookingDurations,
  bookingHotels,
  bookingInterests,
  bookingPaces,
  bookingRouteFocus,
  bookingStyles,
  bookingSupportOptions,
  bookingTravelerTypes,
  type BookingOption
} from '@/lib/booking-options';

// Module-level constants for NEXT_PUBLIC env vars so Turbopack can statically inline
// them once at module scope rather than creating a runtime process.js dependency.
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '';
const USD_TO_VND_RATE = Number(process.env.NEXT_PUBLIC_USD_TO_VND_RATE ?? 25000);
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '+84962819091';

const draftKey = 'hlt-tailor-made-draft';
const steps = ['Destination', 'Route', 'Dates', 'Duration', 'Travelers', 'Pace', 'Style', 'Budget', 'Hotel', 'Interests', 'Support', 'Notes', 'Summary', 'Recommended tours', 'Contact'];
const summaryStepIndex = steps.indexOf('Summary');
const recommendedStepIndex = steps.indexOf('Recommended tours');
const contactStepIndex = steps.indexOf('Contact');
const fallbackTourImage = '/images/booking/vietnam-ha-long-kayaks-4k.jpg';
const bookingPhases = [
  { title: 'Tour Details', subtitle: 'Shape the route brief' },
  { title: 'Recommended Tours', subtitle: 'Review the curated matches' },
  { title: 'Your Info', subtitle: 'Confirm and send' }
];
// ── Tier definitions (static — defined outside component to avoid recreation on every render) ──
const BOOKING_TIERS = [
  {
    id: 'boutique',
    label: 'Boutique Private',
    priceFrom: 'US $1,000',
    priceTo: '2,000 pp',
    priceMin: 1000,
    priceMax: 2000,
    description: '3–4★ handpicked hotels · Private guide · Air-conditioned transfers · Small-group availability',
    badge: '',
    mapStyle: 'Boutique' as const,
    mapBudget: 'USD 1,000 - 2,000 pp' as const,
    mapHotel: '4-star boutique' as const,
    mapPace: 'Balanced' as const,
    mapSupport: 'Hotels, guides and transfers' as const
  },
  {
    id: 'luxury',
    label: 'Luxury Private',
    priceFrom: 'US $2,000',
    priceTo: '4,000 pp',
    priceMin: 2000,
    priceMax: 4000,
    description: '4–5★ boutique hotels · Senior private guide · Dedicated private transfers throughout',
    badge: 'Concierge Pick',
    mapStyle: 'Luxury Stays' as const,
    mapBudget: 'USD 2,000 - 4,000 pp' as const,
    mapHotel: '5-star boutique' as const,
    mapPace: 'Balanced' as const,
    mapSupport: 'Full booking and on-trip support' as const
  },
  {
    id: 'ultra',
    label: 'Ultra-Private',
    priceFrom: 'US $4,000',
    priceTo: '+ per person',
    priceMin: 4000,
    priceMax: 7000,
    description: '5★ iconic resorts · Expert concierge guide · Luxury transfers · Full white-glove service',
    badge: '',
    mapStyle: 'Luxury Stays' as const,
    mapBudget: 'USD 4,000 - 7,000 pp' as const,
    mapHotel: 'Iconic luxury' as const,
    mapPace: 'Slow and deep' as const,
    mapSupport: 'Full booking and on-trip support' as const
  }
] as const;

const legacyStyleMap: Record<string, string> = {
  Luxury: 'Luxury Stays',
  Culture: 'Culture & Heritage',
  Adventure: 'Adventure Vacations',
  'Beach Vacation': 'Beach Escapes',
  Culinary: 'Culinary Journeys',
  Family: 'Family Holidays'
};

function bookingPhaseIndex(step: number) {
  if (step < summaryStepIndex) return 0;
  if (step < contactStepIndex) return 1;
  return 2;
}

const defaults: LeadPayload = {
  destinations: [],
  routeFocus: [],
  dates: '',
  startEnd: '',
  duration: '9-12 days',
  adults: 2,
  children: 0,
  travelerType: 'Couple',
  pace: 'Balanced',
  style: 'Luxury Stays',
  budget: 'USD 2,000 - 4,000 pp',
  hotel: '5-star boutique',
  interests: [],
  support: 'Full booking and on-trip support',
  notes: '',
  website: '',
  recaptchaToken: '',
  contact: { fullName: '', email: '', phone: '', country: '' }
};

type RecaptchaWindow = Window & { grecaptcha?: { ready: (cb: () => void) => void; execute: (key: string, options: { action: string }) => Promise<string> } };
type SubmittedLead = {
  id: string;
  matches: BookingTourMatch[];
  values: LeadPayload;
};

export function TailorMadeForm({ compact = false, tourCatalog = [] }: { compact?: boolean; tourCatalog?: BookingTourCandidate[] }) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState<SubmittedLead | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [lastNext, setLastNext] = useState(0);
  const [selectedTourSlug, setSelectedTourSlug] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>('luxury');
  const form = useForm<LeadPayload>({ defaultValues: defaults });
  // Full watch for compact wizard (all steps need reactive values)
  const values = form.watch();
  // Individual field watches used in non-compact JSX for direct rendering
  const destinations = values.destinations;
  const duration = values.duration;
  const adults = values.adults;
  const children = values.children;
  const travelerType = values.travelerType;
  const dates = values.dates;
  // Defer the expensive tour-matching computation so clicks never block rendering
  const deferredDestinations = useDeferredValue(destinations);
  const recommendedTours = useMemo(() => {
    if (!tourCatalog.length || !deferredDestinations.length) return [];
    return matchBookingTours(form.getValues(), tourCatalog, compact ? 3 : 4);
  }, [compact, tourCatalog, deferredDestinations, form]);
  const orderedRecommendedTours = useMemo(() => orderTourMatches(recommendedTours, selectedTourSlug), [recommendedTours, selectedTourSlug]);
  const selectedTour = orderedRecommendedTours[0];
  const visualPhase = bookingPhaseIndex(step);
  const visualProgress = ((visualPhase + 1) / bookingPhases.length) * 100;

  useEffect(() => {
    const raw = localStorage.getItem(draftKey);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LeadPayload>;
      form.reset({ ...defaults, ...parsed, style: legacyStyleMap[parsed.style || ''] || parsed.style || defaults.style });
    }
  }, [form]);

  // Debounce localStorage writes — avoids blocking the main thread on every click / keystroke
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const sub = form.watch((value) => {
      clearTimeout(timer);
      timer = setTimeout(() => localStorage.setItem(draftKey, JSON.stringify(value)), 400);
    });
    return () => {
      sub.unsubscribe();
      clearTimeout(timer);
    };
  }, [form]);

  useEffect(() => {
    if (!recommendedTours.length) {
      setSelectedTourSlug(null);
      return;
    }
    setSelectedTourSlug((current) => {
      if (current && recommendedTours.some((tour) => tour.slug === current)) return current;
      return recommendedTours[0].slug;
    });
  }, [recommendedTours]);

  async function onSubmit(data: LeadPayload) {
    setError(null);
    const valid = await form.trigger();
    if (!valid) return;
    const matchedTours = orderTourMatches(matchBookingTours(data, tourCatalog, 4), selectedTourSlug);
    const safeData = withLeadFallbacks(data, matchedTours[0]);
    const missingStep = firstMissingStep(safeData);
    if (missingStep) {
      setError(missingStep.message);
      setStep(missingStep.step);
      return;
    }
    try {
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      if (siteKey && typeof window !== 'undefined') {
        const grecaptcha = (window as RecaptchaWindow).grecaptcha;
        safeData.recaptchaToken = await new Promise<string>((resolve) => {
          if (!grecaptcha) return resolve('');
          grecaptcha.ready(() => grecaptcha.execute(siteKey, { action: 'lead_submit' }).then(resolve));
        });
      }
      const payload: LeadPayload = {
        ...safeData,
        matchedTours: matchedTours.map((tour) => ({
          title: tour.title,
          slug: tour.slug,
          href: tour.href,
          score: tour.score,
          amountUsd: tour.paymentAmountUsd,
          reasons: tour.reasons
        }))
      };
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(formatApiError(json));
      localStorage.removeItem(draftKey);
      trackEvent('form_submit', { form: 'tailor_made' });
      setSubmitted({ id: String(json.id || 'received'), matches: matchedTours, values: safeData });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit inquiry. Please check the highlighted information and try again.');
    }
  }

  if (submitted) {
    return <SubmittedHandoff compact={compact} submitted={submitted} />;
  }

  const activeTier = BOOKING_TIERS.find((t) => t.id === selectedTier) ?? BOOKING_TIERS[1];

  // useCallback so these handlers are stable references — no unnecessary re-renders of child buttons
  const handleTierSelect = useCallback((tier: typeof BOOKING_TIERS[number]) => {
    setSelectedTier(tier.id);
    // Batch all five field updates — React 18 auto-batches these into one re-render
    form.setValue('style', tier.mapStyle as LeadPayload['style'], { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    form.setValue('budget', tier.mapBudget as LeadPayload['budget'], { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    form.setValue('hotel', tier.mapHotel as LeadPayload['hotel'], { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    form.setValue('pace', tier.mapPace as LeadPayload['pace'], { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    form.setValue('support', tier.mapSupport as LeadPayload['support'], { shouldDirty: false, shouldTouch: false, shouldValidate: false });
  }, [form]);

  const toggleDestination = useCallback((val: string) => {
    const current = form.getValues('destinations');
    form.setValue('destinations', current.includes(val) ? current.filter((d) => d !== val) : [...current, val]);
  }, [form]);

  const destValues = destinations;

  // ── Non-compact: VietnamJourney-style full-page booking layout ──
  if (!compact) {
    const estMin = activeTier.priceMin * (adults || 2);
    const estMax = activeTier.priceMax * (adults || 2);
    return (
      <form
        ref={formRef}
        onFocus={() => { if (!started) { setStarted(true); trackEvent('form_start', { form: 'tailor_made' }); } }}
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full"
      >
        {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
          <Script src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`} strategy="afterInteractive" />
        )}
        <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" {...form.register('website')} />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_384px] xl:grid-cols-[minmax(0,1fr)_416px] lg:items-start">
          {/* ── Left Column: 4 numbered sections ── */}
          <div className="space-y-6">

            {/* Section 1: Choose Your Experience */}
            <BookingSection number={1} title="Choose Your Experience" subtitle="Select your preferred travel style and budget range">
              <div className="grid gap-4 sm:grid-cols-3">
                {BOOKING_TIERS.map((tier) => {
                  const active = selectedTier === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => handleTierSelect(tier)}
                      className={cn(
                        'relative flex flex-col gap-4 rounded-[22px] border p-5 text-left transition duration-300 ease-luxe focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 active:scale-[0.99]',
                        active
                          ? 'border-gold/60 bg-navy text-pearl shadow-[0_18px_48px_rgba(11,27,43,0.22)]'
                          : 'border-navy/12 bg-[#fffaf2] text-navy hover:-translate-y-0.5 hover:border-gold/35 hover:shadow-[0_12px_32px_rgba(11,27,43,0.07)]'
                      )}
                    >
                      {tier.badge ? (
                        <span className="absolute right-4 top-4 rounded-full bg-gold px-3 py-[5px] text-[10px] font-black uppercase tracking-[0.14em] text-navy shadow-[0_6px_16px_rgba(200,169,106,0.25)]">
                          {tier.badge}
                        </span>
                      ) : null}
                      <span className={cn('font-serif text-[21px] leading-tight tracking-[-0.03em]', active ? 'text-pearl' : 'text-navy')}>
                        {tier.label}
                      </span>
                      <div>
                        <span className={cn('text-[10px] font-black uppercase tracking-[0.18em]', active ? 'text-gold' : 'text-gold-dark')}>From</span>
                        <p className={cn('mt-1 font-black text-[26px] leading-none tracking-[-0.04em]', active ? 'text-pearl' : 'text-navy')}>
                          {tier.priceFrom}
                        </p>
                        <p className={cn('mt-1 text-[12px] font-semibold', active ? 'text-pearl/58' : 'text-navy/50')}>{tier.priceTo}</p>
                      </div>
                      <p className={cn('text-[12px] font-semibold leading-5', active ? 'text-pearl/68' : 'text-navy/58')}>
                        {tier.description}
                      </p>
                      <span className={cn('mt-auto flex h-7 w-7 items-center justify-center rounded-full border transition duration-300 ease-luxe', active ? 'border-gold bg-gold text-navy shadow-[0_6px_16px_rgba(200,169,106,0.24)]' : 'border-navy/20 text-transparent')}>
                        <Check className="h-4 w-4 stroke-[3]" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </BookingSection>

            {/* Section 2: Destinations & Travel Dates */}
            <BookingSection number={2} title="Destinations & Travel Dates" subtitle="Where do you want to go and when?">
              <div className="space-y-6">
                <div>
                  <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-gold-dark">Select destinations</p>
                  <div className="flex flex-wrap gap-2">
                    {bookingDestinations.map((dest) => {
                      const active = destValues.includes(dest.value);
                      return (
                        <button
                          key={dest.value}
                          type="button"
                          onClick={() => toggleDestination(dest.value)}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-semibold transition duration-200',
                            active
                              ? 'border-gold/70 bg-navy text-pearl shadow-[0_6px_16px_rgba(11,27,43,0.16)]'
                              : 'border-navy/14 bg-[#fffaf2] text-navy hover:border-gold/40 hover:bg-[#fffbf4]'
                          )}
                        >
                          {active && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          {dest.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[11px] font-black uppercase tracking-[0.18em] text-gold-dark">Preferred travel dates</span>
                    <input
                      type="text"
                      placeholder="e.g. March 2026 or flexible"
                      className="mt-3 w-full rounded-[18px] border border-[#d9ccb4] bg-[#fffefb] px-5 py-3.5 text-[15px] text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] placeholder:text-navy/34 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/12 transition duration-200"
                      {...form.register('dates')}
                    />
                  </label>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gold-dark">Trip duration</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {bookingDurations.map((dur) => {
                        const active = duration === dur.value;
                        return (
                          <button
                            key={dur.value}
                            type="button"
                            onClick={() => form.setValue('duration', dur.value)}
                            className={cn(
                              'rounded-[14px] border px-3 py-2.5 text-[12px] font-semibold text-left transition duration-200',
                              active
                                ? 'border-gold/70 bg-navy text-pearl'
                                : 'border-navy/12 bg-[#fffaf2] text-navy hover:border-gold/35'
                            )}
                          >
                            {dur.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <label className="block">
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-gold-dark">
                    Arrival &amp; departure cities{' '}
                    <span className="normal-case font-semibold tracking-normal text-navy/40">(optional)</span>
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Arrive Hanoi / Depart Ho Chi Minh City"
                    className="mt-3 w-full rounded-[18px] border border-[#d9ccb4] bg-[#fffefb] px-5 py-3.5 text-[15px] text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] placeholder:text-navy/34 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/12 transition duration-200"
                    {...form.register('startEnd')}
                  />
                </label>
              </div>
            </BookingSection>

            {/* Section 3: Number of Travellers */}
            <BookingSection number={3} title="Number of Travellers" subtitle="How many guests will be joining the private journey?">
              <div className="grid gap-6 sm:grid-cols-3">
                <GuestCounter
                  label="Adults"
                  subtitle="Age 12 and over"
                  value={adults || 2}
                  min={1}
                  max={20}
                  onDecrement={() => form.setValue('adults', Math.max(1, (adults || 2) - 1))}
                  onIncrement={() => form.setValue('adults', Math.min(20, (adults || 2) + 1))}
                />
                <GuestCounter
                  label="Children"
                  subtitle="Age 2 to 11"
                  value={children || 0}
                  min={0}
                  max={10}
                  onDecrement={() => form.setValue('children', Math.max(0, (children || 0) - 1))}
                  onIncrement={() => form.setValue('children', Math.min(10, (children || 0) + 1))}
                />
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gold-dark">Group type</p>
                  {bookingTravelerTypes.map((t) => {
                    const active = travelerType === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => form.setValue('travelerType', t.value)}
                        className={cn(
                          'rounded-[12px] border px-3 py-2 text-[12px] font-semibold text-left transition duration-200',
                          active
                            ? 'border-gold/70 bg-navy text-pearl'
                            : 'border-navy/12 bg-[#fffaf2] text-navy hover:border-gold/35'
                        )}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </BookingSection>

            {/* Section 4: Your Contact Details */}
            <BookingSection number={4} title="Your Contact Details" subtitle="We'll send your private proposal and itinerary draft here">
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[11px] font-black uppercase tracking-[0.18em] text-gold-dark">
                      Full name <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="text"
                      placeholder="Your full name"
                      className="mt-3 w-full rounded-[18px] border border-[#d9ccb4] bg-[#fffefb] px-5 py-3.5 text-[15px] text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] placeholder:text-navy/34 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/12 transition duration-200"
                      {...form.register('contact.fullName', { required: true })}
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-black uppercase tracking-[0.18em] text-gold-dark">
                      Email address <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="mt-3 w-full rounded-[18px] border border-[#d9ccb4] bg-[#fffefb] px-5 py-3.5 text-[15px] text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] placeholder:text-navy/34 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/12 transition duration-200"
                      {...form.register('contact.email', { required: true })}
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-black uppercase tracking-[0.18em] text-gold-dark">WhatsApp / Zalo</span>
                    <input
                      type="tel"
                      placeholder="+84 or international"
                      className="mt-3 w-full rounded-[18px] border border-[#d9ccb4] bg-[#fffefb] px-5 py-3.5 text-[15px] text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] placeholder:text-navy/34 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/12 transition duration-200"
                      {...form.register('contact.phone')}
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-black uppercase tracking-[0.18em] text-gold-dark">Country of residence</span>
                    <input
                      type="text"
                      placeholder="e.g. United States"
                      className="mt-3 w-full rounded-[18px] border border-[#d9ccb4] bg-[#fffefb] px-5 py-3.5 text-[15px] text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] placeholder:text-navy/34 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/12 transition duration-200"
                      {...form.register('contact.country')}
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-gold-dark">
                    Special requests or notes{' '}
                    <span className="normal-case font-semibold tracking-normal text-navy/40">(optional)</span>
                  </span>
                  <textarea
                    rows={4}
                    placeholder="Any special requirements, dietary needs, honeymoon, anniversary or specific interests…"
                    className="mt-3 w-full resize-none rounded-[18px] border border-[#d9ccb4] bg-[#fffefb] px-5 py-4 text-[15px] text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] placeholder:text-navy/34 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/12 transition duration-200"
                    {...form.register('notes')}
                  />
                </label>
              </div>
            </BookingSection>

            {error && <SubmitError message={error} />}

            {/* Submit CTA */}
            <div className="space-y-4">
              <button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="inline-flex min-h-[66px] w-full items-center justify-center gap-3 rounded-full bg-navy text-pearl text-[14px] font-black uppercase tracking-[0.18em] shadow-[0_16px_48px_rgba(11,27,43,0.18)] transition duration-300 ease-luxe hover:bg-gold hover:text-navy disabled:opacity-60"
              >
                {form.formState.isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                Request Private Consultation
              </button>
              <p className="text-center text-[12px] font-semibold text-navy/42">
                Free inquiry · No payment required · 100% private · We reply within 24 hours
              </p>
            </div>
          </div>

          {/* ── Right Column: Sticky Summary Panel ── */}
          <div className="hidden lg:block">
            <div className="sticky top-[108px] space-y-4">
              <div className="overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#07111f_0%,#122238_100%)] p-7 text-pearl shadow-[0_34px_94px_rgba(11,27,43,0.28)]">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-gold">Private Estimate</p>

                {/* Selected tier */}
                <div className="mt-5 rounded-[18px] border border-pearl/10 bg-pearl/[0.06] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gold/70">{activeTier.label}</p>
                  <p className="mt-2 font-black text-[32px] leading-none tracking-[-0.04em]">{activeTier.priceFrom}</p>
                  <p className="mt-1 text-[12px] font-semibold text-pearl/46">– {activeTier.priceTo}</p>
                </div>

                {/* Summary rows */}
                <div className="mt-5 space-y-3">
                  <EstimateRow
                    label="Destination"
                    value={destValues.length ? destValues.slice(0, 3).join(', ') + (destValues.length > 3 ? ` +${destValues.length - 3}` : '') : '—'}
                  />
                  <EstimateRow label="Travel dates" value={dates || '—'} />
                  <EstimateRow label="Duration" value={duration} />
                  <EstimateRow
                    label="Travellers"
                    value={`${adults || 2} adult${(adults || 2) !== 1 ? 's' : ''}${children ? ` · ${children} child${children !== 1 ? 'ren' : ''}` : ''}`}
                  />
                </div>

                {/* Estimated total */}
                <div className="mt-5 rounded-[18px] border border-gold/20 bg-gold/[0.08] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gold/80">Estimated Total</p>
                  <p className="mt-2 font-black text-[26px] leading-none tracking-[-0.03em]">
                    {destValues.length
                      ? `US $${new Intl.NumberFormat('en-US').format(estMin)} – ${new Intl.NumberFormat('en-US').format(estMax)}`
                      : '—'}
                  </p>
                  <p className="mt-1.5 text-[11px] font-semibold text-pearl/40">full party · reference estimate</p>
                </div>

                {/* Trust badges */}
                <div className="mt-6 space-y-2.5">
                  {['Free consultation, no obligation', 'Reply within 24 hours', 'No payment required to submit', '100% privacy guaranteed'].map((badge) => (
                    <div key={badge} className="flex items-center gap-3">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-gold/30 bg-gold/14 text-gold">
                        <Check className="h-3 w-3 stroke-[2.5]" />
                      </span>
                      <span className="text-[12px] font-semibold text-pearl/64">{badge}</span>
                    </div>
                  ))}
                </div>

                {/* Contact */}
                <div className="mt-6 border-t border-pearl/10 pt-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gold/70">Speak to a Specialist</p>
                  <div className="mt-3 space-y-1.5">
                    <a
                      href="https://wa.me/84912345678"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 text-[13px] font-semibold text-pearl/58 transition hover:text-gold"
                    >
                      <MessageCircle className="h-4 w-4 shrink-0" />
                      WhatsApp us
                    </a>
                    <a
                      href="mailto:hello@luxurytravels.com"
                      className="flex items-center gap-2.5 text-[13px] font-semibold text-pearl/58 transition hover:text-gold"
                    >
                      <Mail className="h-4 w-4 shrink-0" />
                      Send us an email
                    </a>
                  </div>
                </div>
              </div>

              {/* Tour match card */}
              {selectedTour ? (
                <div className="overflow-hidden rounded-[24px] border border-[#e2d5bf] bg-[#fffdf8] p-4 shadow-[0_12px_32px_rgba(11,27,43,0.08)]">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-dark">Tour match found</p>
                  <p className="mt-2 line-clamp-2 font-serif text-[18px] leading-tight tracking-[-0.03em] text-navy">{selectedTour.title}</p>
                  <p className="mt-1.5 text-[12px] font-semibold text-navy/54">
                    {selectedTour.durationLabel} · {matchPercent(selectedTour)}% match
                  </p>
                  <Link
                    href={tourDetailHref(selectedTour)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-black uppercase tracking-[0.14em] text-gold-dark transition hover:text-navy"
                  >
                    View tour <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </form>
    );
  }

  const backButtonClass = cn(
    'inline-flex items-center gap-2 rounded-full border border-[#d9ccb4] bg-[#fffefb] font-extrabold uppercase text-navy transition duration-300 ease-luxe hover:border-gold hover:text-gold-dark disabled:opacity-30',
    compact ? 'px-[18px] py-[12px] text-[12px] tracking-[0.16em]' : 'px-6 py-4 text-sm tracking-widest'
  );
  const nextButtonClass = cn(
    'inline-flex items-center gap-2 rounded-full bg-navy font-extrabold uppercase text-pearl shadow-lift transition duration-300 ease-luxe hover:bg-gold hover:text-navy',
    compact ? 'px-[20px] py-[13px] text-[12px] tracking-[0.16em]' : 'px-6 py-4 text-sm tracking-widest'
  );
  const submitButtonClass = cn(
    'inline-flex items-center gap-2 rounded-full bg-navy font-extrabold uppercase text-pearl shadow-lift transition duration-300 ease-luxe hover:bg-gold hover:text-navy disabled:opacity-60',
    compact ? 'px-[18px] py-[13px] text-[12px] tracking-[0.14em]' : 'px-6 py-4 text-sm tracking-widest'
  );
  const nextButtonLabel = step === summaryStepIndex ? 'View recommended tours' : step === recommendedStepIndex ? 'Continue with tour' : 'Next';
  const scrollToFormTop = () => {
    if (typeof window === 'undefined') return;
    window.requestAnimationFrame(() => {
      const top = formRef.current ? formRef.current.getBoundingClientRect().top + window.scrollY - 108 : 0;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  };

  return (
    <form ref={formRef} onFocus={() => {
      if (!started) {
        setStarted(true);
        trackEvent('form_start', { form: 'tailor_made' });
      }
    }} onSubmit={form.handleSubmit(onSubmit)} className={cn('relative overflow-hidden border border-[#e4d8c2] bg-[linear-gradient(180deg,#fffdf8_0%,#faf3e8_100%)] shadow-[0_30px_92px_rgba(11,27,43,0.13)] ring-1 ring-pearl/70', compact ? 'rounded-[34px]' : 'rounded-[40px]')}>
      {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && <Script src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`} strategy="afterInteractive" />}
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" {...form.register('website')} />
      <div className={cn('relative z-10 border-b border-[#eadcc8] bg-[linear-gradient(180deg,#fffdf8_0%,#faf5ec_100%)] text-navy', compact ? 'px-[18px] py-[18px]' : 'px-7 py-7 md:px-10 md:py-9 lg:px-12')}>
        <div className={cn(compact ? 'grid gap-4 min-[520px]:grid-cols-3 min-[520px]:gap-8' : 'grid gap-4 min-[520px]:grid-cols-3 min-[520px]:gap-8')}>
          {bookingPhases.map((phase, index) => {
            const active = visualPhase === index;
            const done = visualPhase > index;
            return (
              <div
                key={phase.title}
                className={cn(
                  'flex min-w-0 items-center rounded-2xl border-2 bg-[#fffefb] text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.76)] transition duration-300 ease-luxe',
                  compact ? 'gap-10 px-10 py-8' : 'gap-10 px-10 py-8',
                  done || active ? 'border-gold/35' : 'border-navy/8'
                )}
              >
                <span
                  className={cn(
                    'grid shrink-0 place-items-center rounded-full border-2 font-black transition duration-300 ease-luxe aspect-square',
                    compact ? 'h-12 w-12 text-[15px]' : 'h-12 w-12 text-[15px]',
                    done || active
                      ? 'border-gold bg-gold text-navy shadow-[0_12px_28px_rgba(200,169,106,0.24)]'
                      : 'border-[#dfd2bb] bg-pearl text-navy/36'
                  )}
                >
                  {done ? <Check className="h-4 w-4 stroke-[3]" /> : index + 1}
                </span>
                <div className="min-w-0">
                  <p className={cn('break-words font-black uppercase', compact ? 'text-[14px] tracking-[0.1em]' : 'text-[14px] tracking-[0.1em]', active || done ? 'text-navy' : 'text-navy/40')}>
                    {phase.title}
                  </p>
                  <p className={cn('break-words font-semibold', compact ? 'mt-1.5 text-[13px] text-navy/50' : 'mt-1.5 text-[13px] text-navy/50')}>
                    {phase.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-10 mb-4 h-[4px] rounded-full bg-[#eadfcf]">
          <div className="h-full rounded-full bg-gold transition-all duration-500 ease-luxe" style={{ width: `${visualProgress}%` }} />
        </div>
      </div>

      <div className={cn('relative z-10 min-w-0', compact ? 'p-[18px] md:p-[22px]' : 'p-7 md:p-10 lg:p-11')}>
        <div className={cn('grid', compact ? 'gap-[20px]' : 'gap-8')}>
          <SelectedTourBanner compact={compact} match={selectedTour} />
          <motion.div key={step} initial={{ opacity: 1, x: 0 }} animate={{ opacity: 1, x: 0 }} transition={luxeTransition}>
            {step === 0 && (
              <div>
                <p className={cn('max-w-5xl font-bold text-navy/60', compact ? 'mb-[14px] text-[12px] leading-6' : 'mb-7 text-[15px] leading-7')}>
                  {compact
                    ? `Start with one destination, or choose a multi-country route from ${bookingCatalogStats.totalTours} tour facts.`
                    : `Built from ${bookingCatalogStats.totalTours} updated tour facts across ${Object.keys(bookingCatalogStats.countryCounts).length} destination hubs.`}
                </p>
                <ChoiceGrid compact={compact} values={bookingDestinations} selected={values.destinations} toggle={(value) => {
                  const next = values.destinations.includes(value) ? values.destinations.filter((v) => v !== value) : [...values.destinations, value];
                  form.setValue('destinations', next, { shouldDirty: true });
                }} />
              </div>
            )}
            {step === 1 && <ChoiceGrid compact={compact} values={bookingRouteFocus} selected={values.routeFocus} toggle={(value) => {
              const next = values.routeFocus.includes(value) ? values.routeFocus.filter((v) => v !== value) : [...values.routeFocus, value];
              form.setValue('routeFocus', next, { shouldDirty: true });
            }} />}
            {step === 2 && <div className={cn('grid', compact ? 'gap-[18px]' : 'gap-6')}><Field compact={compact} label="Preferred travel dates" placeholder="Example: 12-22 Oct 2026 or flexible in March" {...form.register('dates', { required: true })} /><Field compact={compact} label="Arrival / departure cities" placeholder="Example: Arrive Hanoi, depart Siem Reap, or not sure yet" {...form.register('startEnd')} /></div>}
            {step === 3 && <RadioGrid compact={compact} values={bookingDurations} selected={values.duration} set={(v) => form.setValue('duration', v)} />}
            {step === 4 && <div className={cn('grid', compact ? 'gap-[18px]' : 'gap-8')}><div className={cn('grid', compact ? 'gap-[14px] sm:grid-cols-2' : 'gap-6 md:grid-cols-2')}><Field compact={compact} label="Adults" type="number" {...form.register('adults', { valueAsNumber: true, min: 1 })} /><Field compact={compact} label="Children" type="number" {...form.register('children', { valueAsNumber: true, min: 0 })} /></div><RadioGrid compact={compact} values={bookingTravelerTypes} selected={values.travelerType} set={(v) => form.setValue('travelerType', v)} /></div>}
            {step === 5 && <RadioGrid compact={compact} values={bookingPaces} selected={values.pace} set={(v) => form.setValue('pace', v)} />}
            {step === 6 && <StyleRadioGrid compact={compact} values={bookingStyles} selected={values.style} set={(v) => form.setValue('style', v)} />}
            {step === 7 && <RadioGrid compact={compact} values={bookingBudgets} selected={values.budget} set={(v) => form.setValue('budget', v)} />}
            {step === 8 && <RadioGrid compact={compact} values={bookingHotels} selected={values.hotel} set={(v) => form.setValue('hotel', v)} />}
            {step === 9 && <ChoiceGrid compact={compact} values={bookingInterests} selected={values.interests} toggle={(value) => {
              const next = values.interests.includes(value) ? values.interests.filter((v) => v !== value) : [...values.interests, value];
              form.setValue('interests', next, { shouldDirty: true });
            }} />}
            {step === 10 && <RadioGrid compact={compact} values={bookingSupportOptions} selected={values.support} set={(v) => form.setValue('support', v)} />}
            {step === 11 && <label className="block"><span className={cn('font-black uppercase tracking-[0.18em] text-gold-dark', compact ? 'text-[10px]' : 'text-[11px]')}>Additional notes</span><textarea rows={compact ? 5 : 7} className={cn('w-full border border-[#d9ccb4] bg-[#fffefb] text-navy outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] transition duration-300 ease-luxe placeholder:text-navy/34 focus:border-gold focus:ring-4 focus:ring-gold/12', compact ? 'mt-[10px] rounded-[18px] px-[16px] py-[13px] text-[14px] leading-6' : 'mt-4 rounded-[22px] px-5 py-4 text-[15px] leading-7')} placeholder="Pace, hotel taste, celebrations, must-sees, dietary needs, mobility needs or flights already booked." {...form.register('notes')} /></label>}
            {step === summaryStepIndex && <Summary compact={compact} values={values} />}
            {step === recommendedStepIndex && (
              <TourSelectionStep
                compact={compact}
                matches={orderedRecommendedTours}
                selectedSlug={selectedTourSlug}
                onSelect={setSelectedTourSlug}
              />
            )}
            {step === contactStepIndex && (
              <div className={cn('grid', compact ? 'gap-[14px]' : 'gap-6')}>
                <div className={cn('grid', compact ? 'gap-[14px] min-[680px]:grid-cols-2' : 'gap-[28px] min-[720px]:grid-cols-2')}>
                  <Field compact={compact} label="Full name" {...form.register('contact.fullName', { required: true })} />
                  <Field compact={compact} label="Email" type="email" {...form.register('contact.email', { required: true })} />
                  <Field compact={compact} label="WhatsApp / Zalo" {...form.register('contact.phone')} />
                  <Field compact={compact} label="Country" {...form.register('contact.country')} />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {error && <SubmitError message={error} compact={compact} />}

      {step === steps.length - 1 && (
        <div className="mx-8 grid gap-4 rounded-[24px] border border-[#eadcc8] bg-[#fffefb] p-[20px] text-sm font-bold text-navy/68 md:mx-12 md:grid-cols-3">
          <span>We reply within 24 hours</span>
          <span>100% privacy guaranteed</span>
          <span>No obligation quotation</span>
        </div>
      )}

      <div className={cn('z-[70] flex items-center justify-between gap-4 border-t border-[#eadcc8] bg-[#fffdf8]/95 backdrop-blur', compact ? 'sticky bottom-0 p-[18px] md:p-[22px]' : 'relative p-7 md:p-9')}>
        <button type="button" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className={backButtonClass}><ChevronLeft className="h-4 w-4" /> Back</button>
        {step < steps.length - 1 ? (
          <button type="button" onClick={() => {
            const now = Date.now();
            if (now - lastNext < 180) return;
            setLastNext(now);
            setStep(Math.min(steps.length - 1, step + 1));
            scrollToFormTop();
          }} className={nextButtonClass}>{nextButtonLabel} <ChevronRight className="h-4 w-4" /></button>
        ) : (
          <button type="submit" disabled={form.formState.isSubmitting} className={submitButtonClass}>{form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {compact ? 'Send enquiry' : 'Request Private Consultation'}</button>
        )}
      </div>
    </form>
  );
}

function formatUsdPlain(amount: number) {
  return `US $${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount || 300)}`;
}

function orderTourMatches(matches: BookingTourMatch[], selectedSlug: string | null) {
  if (!selectedSlug) return matches;
  const selected = matches.find((tour) => tour.slug === selectedSlug);
  if (!selected) return matches;
  return [selected, ...matches.filter((tour) => tour.slug !== selectedSlug)];
}

function titleCase(value: string) {
  return value
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function tourRouteLabel(match: BookingTourMatch) {
  return match.places.slice(0, 3).join(' - ') || match.route || titleCase(match.country) || 'Private route';
}

function tourCardImage(match: BookingTourMatch) {
  if (match.featuredImage?.startsWith('/')) return match.featuredImage;
  const country = match.country.toLowerCase();
  const haystack = `${match.title} ${match.route} ${match.places.join(' ')}`.toLowerCase();
  if (haystack.includes('ha long') || haystack.includes('halong') || haystack.includes('lan ha')) return '/images/booking/vietnam-ha-long-kayaks-4k.jpg';
  if (country.includes('laos')) return '/images/hubs/laos-kuang-si-falls-4k-crisp.jpg';
  if (country.includes('cambodia')) return '/images/hubs/cambodia-angkor-wat-4k-crisp.jpg';
  if (country.includes('thailand')) return '/images/hubs/thailand-temple-4k-crisp.jpg';
  if (country.includes('myanmar')) return '/images/hubs/myanmar-bagan-temples-4k.jpg';
  if (country.includes('multi') || country.includes('indochina')) return '/images/collections/multi-country-mekong-sunset-4k.jpg';
  return countryTourImageFallback(country) || fallbackTourImage;
}

function tourDetailHref(match: BookingTourMatch) {
  const params = new URLSearchParams({ returnTo: '/customize-your-trip/' });
  return `${match.href}${match.href.includes('?') ? '&' : '?'}${params.toString()}`;
}

function matchPercent(match: BookingTourMatch) {
  if (!Number.isFinite(match.score) || match.score <= 0) return 72;
  return Math.min(99, Math.max(72, Math.round(match.score)));
}

function countryLabel(country: string) {
  const normalized = country.toLowerCase();
  if (normalized.includes('multi') || normalized.includes('indochina')) return 'Multi Country';
  if (normalized.includes('vietnam')) return 'Vietnam';
  if (normalized.includes('thailand')) return 'Thailand';
  if (normalized.includes('cambodia')) return 'Cambodia';
  if (normalized.includes('laos')) return 'Laos';
  if (normalized.includes('myanmar')) return 'Myanmar';
  if (normalized.includes('indonesia')) return 'Indonesia';
  if (normalized.includes('malaysia')) return 'Malaysia';
  if (normalized.includes('singapore')) return 'Singapore';
  if (normalized.includes('philippines')) return 'Philippines';
  if (normalized.includes('hong kong')) return 'Hong Kong';
  if (normalized.includes('south korea')) return 'South Korea';
  if (normalized.includes('sri lanka')) return 'Sri Lanka';
  if (normalized.includes('japan')) return 'Japan';
  if (normalized.includes('china')) return 'China';
  if (normalized.includes('bhutan')) return 'Bhutan';
  if (normalized.includes('nepal')) return 'Nepal';
  if (normalized.includes('india')) return 'India';
  return titleCase(country) || 'Vietnam';
}

function withLeadFallbacks(data: LeadPayload, match?: BookingTourMatch): LeadPayload {
  return {
    ...data,
    destinations: data.destinations.length ? data.destinations : match ? [countryLabel(match.country)] : [],
    routeFocus: data.routeFocus || [],
    dates: data.dates.trim() || 'Flexible dates',
    startEnd: data.startEnd || '',
    interests: data.interests || [],
    notes: data.notes || '',
    contact: {
      fullName: data.contact.fullName.trim(),
      email: data.contact.email.trim(),
      phone: data.contact.phone || '',
      country: data.contact.country || ''
    }
  };
}

function firstMissingStep(data: LeadPayload): { step: number; message: string } | null {
  if (!data.destinations.length) return { step: 0, message: 'Please choose at least one destination before sending the enquiry.' };
  if (!data.dates.trim()) return { step: 2, message: 'Please add travel dates or type flexible dates.' };
  if (data.contact.fullName.trim().length < 2) return { step: contactStepIndex, message: 'Please enter the guest full name.' };
  if (!data.contact.email.trim()) return { step: contactStepIndex, message: 'Please enter an email address so we can reply.' };
  return null;
}

function formatApiError(json: unknown) {
  if (!json || typeof json !== 'object') {
    return 'Could not submit inquiry. Please check the required fields and try again.';
  }
  const payload = json as { message?: string; issues?: Array<{ path?: Array<string | number>; message?: string }> };
  if (payload.issues?.length) {
    const labels = payload.issues.map((issue) => fieldLabel(issue.path)).filter(Boolean);
    const uniqueLabels = Array.from(new Set(labels));
    if (uniqueLabels.length) return `Please check: ${uniqueLabels.join(', ')}.`;
  }
  if (payload.message && !payload.message.trim().startsWith('[')) return payload.message;
  return 'Could not submit inquiry. Please check the required fields and try again.';
}

function fieldLabel(path?: Array<string | number>) {
  const key = path?.join('.');
  const labels: Record<string, string> = {
    destinations: 'destination',
    dates: 'travel dates',
    'contact.fullName': 'full name',
    'contact.email': 'email',
    duration: 'duration',
    style: 'travel style',
    budget: 'budget',
    hotel: 'hotel'
  };
  return labels[key || ''] || key || '';
}

function paymentAmountVnd(match?: BookingTourMatch) {
  const usdToVnd = Number(process.env.NEXT_PUBLIC_USD_TO_VND_RATE || 25000);
  return Math.round((match?.paymentAmountUsd || 300) * usdToVnd);
}

function formatVnd(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
}

function paymentHref(leadId: string, match?: BookingTourMatch) {
  const params = new URLSearchParams({
    bookingId: leadId,
    amount: String(paymentAmountVnd(match)),
    currency: 'VND',
    method: 'vietqr'
  });
  return `/payment/?${params.toString()}`;
}

function consultationText(leadId: string, values: LeadPayload, match?: BookingTourMatch) {
  const destinations = values.destinations.join(', ') || 'Southeast Asia';
  return [
    `Hello Ha Long Luxury Travel, my inquiry ${leadId} has been sent.`,
    `Destinations: ${destinations}.`,
    `Duration: ${values.duration}. Budget: ${values.budget}.`,
    match ? `Recommended tour: ${match.title}.` : 'Please advise the best matching route.',
    'I would like to consult directly before payment.'
  ].join(' ');
}

function directEmailHref(leadId: string, values: LeadPayload, match?: BookingTourMatch) {
  return `mailto:info@halongluxury.com?subject=${encodeURIComponent(`Consultation for ${leadId}`)}&body=${encodeURIComponent(consultationText(leadId, values, match))}`;
}

function directWhatsappHref(leadId: string, values: LeadPayload, match?: BookingTourMatch) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+84962819091';
  return `https://wa.me/${phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(consultationText(leadId, values, match))}`;
}

function TourSelectionStep({
  matches,
  selectedSlug,
  onSelect,
  compact = false
}: {
  matches: BookingTourMatch[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  compact?: boolean;
}) {
  return (
    <div className={cn('grid', compact ? 'gap-[12px]' : 'gap-[28px]')}>
      <div className={cn('overflow-hidden rounded-[34px] border border-[#eadcc8] bg-[#fffefb] text-navy shadow-[0_16px_42px_rgba(11,27,43,0.07)]', compact ? 'p-[14px]' : 'p-6')}>
        <div className="flex items-start justify-between gap-[20px]">
          <div className="min-w-0">
            <p className={cn('flex items-center gap-2 font-black uppercase tracking-[0.18em] text-gold-dark', compact ? 'text-[9px]' : 'text-[11px]')}>
              <Sparkles className={cn(compact ? 'h-[14px] w-[14px]' : 'h-4 w-4')} />
              Curated tour matches
            </p>
            <h3 className={cn('mt-[12px] font-serif leading-none tracking-[-0.04em] text-navy', compact ? 'text-[24px]' : 'text-[38px]')}>Choose your route</h3>
            <p className={cn('mt-[12px] max-w-[72ch] font-semibold text-navy/60', compact ? 'text-[12px] leading-5' : 'text-[15px] leading-7')}>
              Compare the options, open details in a new tab, then return to select a route and continue.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-navy/10 bg-pearl px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-navy/56">
            {matches.length ? `${matches.length} options` : 'Matching'}
          </span>
        </div>
      </div>

      <TourMatchCards compact={compact} matches={matches} selectedSlug={selectedSlug} onSelect={onSelect} />
    </div>
  );
}

function TourMatchCards({
  matches,
  compact = false,
  selectedSlug,
  onSelect
}: {
  matches: BookingTourMatch[];
  compact?: boolean;
  selectedSlug?: string | null;
  onSelect?: (slug: string) => void;
}) {
  if (!matches.length) {
    return (
      <div className={cn('rounded-[28px] border border-gold/24 bg-gold/10 text-navy/70 shadow-[0_14px_34px_rgba(11,27,43,0.06)]', compact ? 'p-[16px] text-[12px] leading-5' : 'p-6 text-sm leading-7')}>
        No precise catalog match yet. Continue to contact details and a private designer will shape the closest route from your brief.
      </div>
    );
  }

  return (
    <div className={cn('overflow-hidden border border-[#eadcc8] bg-[#fffefb] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]', compact ? 'rounded-[26px] p-[10px]' : 'rounded-[38px] p-6')}>
      <div className={cn('flex items-center justify-between gap-4', compact ? 'px-[4px] pb-[10px]' : 'px-4 pb-6 pt-2')}>
        <div className="min-w-0">
          <p className={cn('font-black uppercase text-gold-dark', compact ? 'text-[10px] tracking-[0.16em]' : 'text-[11px] tracking-[0.18em]')}>Shortlist</p>
          <p className={cn('mt-[4px] truncate font-bold text-navy/54', compact ? 'text-[11px]' : 'text-[13px]')}>Two generous columns are visible first, scroll to view more.</p>
        </div>
        <span className="shrink-0 rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-gold-dark">Scroll</span>
      </div>
      <div className="relative">
        <div
          className={cn('grid min-w-0 overflow-y-auto overscroll-contain pr-[6px]', compact ? 'gap-[12px]' : 'gap-[36px] min-[860px]:grid-cols-2 min-[860px]:items-start')}
          style={{ maxHeight: compact ? 640 : 1180, scrollbarWidth: 'thin' }}
        >
          {matches.map((match, index) => (
            <TourMatchCard
              key={match.slug}
              compact={compact}
              index={index}
              match={match}
              selected={selectedSlug === match.slug}
              onSelect={onSelect}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[26px] bg-[linear-gradient(180deg,rgba(248,245,239,0)_0%,rgba(248,245,239,0.92)_100%)]" />
      </div>
    </div>
  );
}

function TourMatchCard({
  match,
  index,
  selected,
  onSelect,
  compact = false
}: {
  match: BookingTourMatch;
  index: number;
  selected: boolean;
  onSelect?: (slug: string) => void;
  compact?: boolean;
}) {
  const imageSrc = tourCardImage(match);
  const canSelect = Boolean(onSelect);
  const routeLabel = tourRouteLabel(match);

  return (
    <article
      className={cn(
        'group overflow-hidden rounded-[30px] border bg-[#fffaf1] text-navy shadow-[0_14px_34px_rgba(11,27,43,0.08)] ring-1 ring-pearl/80 transition duration-300 ease-luxe hover:-translate-y-0.5 hover:shadow-[0_22px_58px_rgba(11,27,43,0.13)]',
        selected ? 'border-gold/90 ring-2 ring-gold/28' : 'border-navy/10 hover:border-gold/45'
      )}
    >
      <div className={cn('relative overflow-hidden bg-navy/10', compact ? 'h-[184px]' : 'h-[260px] min-[760px]:h-[220px] xl:h-[250px]')}>
        <SafeTourImage
          src={imageSrc}
          fallbackSrcs={[fallbackTourImage]}
          alt={match.title}
          fill
          sizes={compact ? '430px' : '(min-width: 1280px) 640px, 90vw'}
          className="object-cover transition duration-500 ease-luxe group-hover:scale-[1.035]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,27,43,0.02)_0%,rgba(11,27,43,0.18)_42%,rgba(11,27,43,0.64)_100%)]" />

        <div className="absolute left-[12px] right-[64px] top-[12px] flex flex-wrap gap-[8px]">
            <span className="inline-flex items-center gap-[4px] rounded-full bg-pearl/94 px-[12px] py-[6px] text-[10px] font-black uppercase tracking-[0.11em] text-navy shadow-[0_8px_20px_rgba(11,27,43,0.14)]">
              <Star className="h-[12px] w-[12px] fill-gold text-gold" />
              {matchPercent(match)}% match
            </span>
            <span className="inline-flex items-center gap-[4px] rounded-full bg-pearl/94 px-[12px] py-[6px] text-[10px] font-black uppercase tracking-[0.11em] text-navy shadow-[0_8px_20px_rgba(11,27,43,0.14)]">
              <Clock3 className="h-[12px] w-[12px] text-gold-dark" />
              {match.durationLabel}
            </span>
        </div>
          {canSelect ? (
            <button
              type="button"
              aria-label={selected ? `Selected ${match.title}` : `Select ${match.title}`}
              onClick={() => onSelect?.(match.slug)}
              className={cn(
                'absolute right-[12px] top-[12px] grid h-10 w-10 shrink-0 place-items-center rounded-full border transition duration-300 ease-luxe',
                selected ? 'border-gold bg-gold text-navy shadow-[0_12px_26px_rgba(200,169,106,0.32)]' : 'border-pearl/70 bg-navy/48 text-pearl hover:bg-pearl hover:text-navy'
              )}
            >
              {selected ? <Check className="h-4 w-4 stroke-[3]" /> : <Heart className="h-4 w-4" />}
            </button>
          ) : null}

        <div className="absolute bottom-[12px] left-[12px] right-[12px] flex flex-wrap items-center gap-[8px]">
          <span className="rounded-full bg-pearl/94 px-[12px] py-[6px] text-[10px] font-black uppercase tracking-[0.13em] text-gold-dark">Option {index + 1}</span>
          <span className="rounded-full bg-navy/72 px-[12px] py-[6px] text-[10px] font-black uppercase tracking-[0.13em] text-pearl">{match.style || 'Private'}</span>
        </div>
      </div>

      <div className={cn('grid gap-4', compact ? 'p-[14px]' : 'p-6 min-[760px]:p-[20px] xl:p-6')}>
        <div>
          <p className="inline-flex max-w-full items-center gap-[8px] rounded-full bg-gold/[0.10] px-[12px] py-[6px] text-[10px] font-black uppercase tracking-[0.12em] text-gold-dark ring-1 ring-gold/18">
            <MapPin className="h-[14px] w-[14px] shrink-0" />
            <span className="truncate">{routeLabel}</span>
          </p>
          <h4 className={cn('mt-[12px] font-serif leading-[1.04] tracking-[-0.04em] text-navy', compact ? 'text-[25px]' : 'text-[31px]')}>
            {match.title}
          </h4>
          <p className={cn('mt-[8px] font-semibold text-navy/62', compact ? 'line-clamp-2 text-[12px] leading-5' : 'line-clamp-2 text-sm leading-6')}>
            {match.excerpt || match.highlights.slice(0, 2).join('. ') || 'A private designer can adjust pacing, hotels and route order before payment.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {match.reasons.slice(0, compact ? 2 : 3).map((reason) => (
            <span key={reason} className="rounded-full border border-gold/20 bg-pearl px-[12px] py-[4px] text-[10px] font-black uppercase tracking-[0.11em] text-gold-dark">
              {reason}
            </span>
          ))}
        </div>

        <div className={cn('grid gap-[12px] border-t border-navy/8 pt-4', compact ? '' : 'min-[980px]:grid-cols-[1fr_auto] min-[980px]:items-stretch')}>
          <div className="rounded-[22px] bg-[linear-gradient(180deg,#fff7e8_0%,#f0dfbd_100%)] px-4 py-[12px] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-navy/42">From</p>
            <p className="mt-1 text-[24px] font-black leading-none tracking-[-0.04em] text-navy">{formatUsdPlain(match.paymentAmountUsd)}</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-navy/46">estimated per guest</p>
          </div>

          <div className={cn('grid gap-2', compact ? 'grid-cols-2' : 'grid-cols-2 min-[980px]:min-w-[160px] min-[980px]:grid-cols-1')}>
            {canSelect ? (
              <button
                type="button"
                onClick={() => onSelect?.(match.slug)}
                className={cn(
                  'inline-flex min-h-[46px] items-center justify-center rounded-full px-4 text-[11px] font-black uppercase tracking-[0.14em] transition duration-300 ease-luxe',
                  selected ? 'bg-gold text-navy shadow-[0_12px_28px_rgba(200,169,106,0.26)]' : 'bg-navy text-pearl hover:bg-gold hover:text-navy'
                )}
              >
                {selected ? 'Selected' : 'Choose'}
              </button>
            ) : null}
            <Link
              href={tourDetailHref(match)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-navy/10 bg-pearl px-4 text-[11px] font-black uppercase tracking-[0.14em] text-navy transition duration-300 ease-luxe hover:border-gold hover:text-gold-dark"
            >
              View tour <ArrowUpRight className="h-[14px] w-[14px]" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function SelectedTourBanner({ match, compact = false }: { match?: BookingTourMatch; compact?: boolean }) {
  if (!match) {
    return (
      <div className={cn('rounded-[34px] border border-[#eadcc8] bg-[#fffefb] text-navy shadow-[0_18px_48px_rgba(11,27,43,0.07)]', compact ? 'p-[14px]' : 'p-[28px] md:p-[36px]')}>
        <div className={cn('grid gap-6', compact ? '' : 'sm:grid-cols-[136px_1fr] sm:items-center')}>
          <div className={cn('relative overflow-hidden rounded-[26px] bg-navy/10 ring-1 ring-gold/12', compact ? 'hidden' : 'h-[120px] w-[136px]')}>
            <SafeTourImage src={fallbackTourImage} fallbackSrcs={[fallbackTourImage]} alt="" fill sizes="144px" className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-gold-dark">Customising for you</p>
            <p className={cn('mt-[12px] font-serif leading-[1.05] tracking-[-0.035em] text-navy', compact ? 'text-[22px]' : 'text-[34px]')}>Private route request</p>
            <p className="mt-[12px] max-w-[76ch] text-[15px] font-semibold leading-7 text-navy/58">
              Your selected destinations will create recommended tour matches. The team can still advise the closest route if no catalog match appears.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-6 rounded-[34px] border border-[#eadcc8] bg-[#fffefb] text-navy shadow-[0_18px_48px_rgba(11,27,43,0.07)]', compact ? 'p-[14px]' : 'p-[28px] md:p-[36px] min-[760px]:grid-cols-[136px_1fr_auto] min-[760px]:items-center')}>
      <div className={cn('relative overflow-hidden rounded-[26px] bg-navy/10 ring-1 ring-gold/12', compact ? 'hidden' : 'h-[124px] w-[136px]')}>
        <SafeTourImage src={tourCardImage(match)} fallbackSrcs={[fallbackTourImage]} alt={match.title} fill sizes="144px" className="object-cover" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-gold-dark">Customising for you</p>
        <p className={cn('mt-[12px] line-clamp-2 font-serif leading-[1.05] tracking-[-0.035em] text-navy', compact ? 'text-[20px]' : 'text-[34px]')}>{match.title}</p>
        <p className="mt-[12px] line-clamp-2 text-[15px] font-bold leading-7 text-navy/58">{tourRouteLabel(match)} | {match.durationLabel}</p>
      </div>
      <Link href={tourDetailHref(match)} target="_blank" rel="noreferrer" className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-[#d9ccb4] bg-[#fffdf8] px-6 text-[11px] font-black uppercase tracking-[0.14em] text-navy transition hover:border-gold hover:text-gold-dark">
        Details <ArrowUpRight className="h-[14px] w-[14px]" />
      </Link>
    </div>
  );
}

function SubmittedHandoff({ submitted, compact = false }: { submitted: SubmittedLead; compact?: boolean }) {
  const primaryMatch = submitted.matches[0];
  const amountVnd = paymentAmountVnd(primaryMatch);
  const payHref = paymentHref(submitted.id, primaryMatch);
  const mailHref = directEmailHref(submitted.id, submitted.values, primaryMatch);
  const whatsappHref = directWhatsappHref(submitted.id, submitted.values, primaryMatch);
  const selectedTitle = primaryMatch?.title || 'Private route request';
  const selectedRoute = primaryMatch ? `${tourRouteLabel(primaryMatch)} | ${primaryMatch.durationLabel}` : 'Designer will recommend the closest private route.';
  const selectedImage = primaryMatch ? tourCardImage(primaryMatch) : fallbackTourImage;
  const selectedPrice = formatUsdPlain(primaryMatch?.paymentAmountUsd || 300);
  const handoffStatus = [
    { label: 'Lead ID', value: submitted.id },
    { label: 'Tour match', value: primaryMatch ? 'Selected route saved' : 'Designer matching' },
    { label: 'Next step', value: 'Payment or consultation' }
  ];

  return (
    <div className={cn('overflow-hidden border border-[#e4d8c2] bg-[linear-gradient(180deg,#fffaf1_0%,#f3e8d7_100%)] text-navy shadow-[0_34px_110px_rgba(11,27,43,0.15)] ring-1 ring-pearl/70', compact ? 'rounded-[34px]' : 'rounded-[48px]')}>
      <div className={cn('relative overflow-hidden bg-navy text-pearl', compact ? 'px-[20px] py-[28px]' : 'px-[36px] py-12 md:px-16 md:py-16 lg:px-20 lg:py-[72px]')}>
        <div className="absolute inset-0 opacity-22">
          <SafeTourImage src={selectedImage} fallbackSrcs={[fallbackTourImage]} alt="" fill sizes="900px" className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,27,43,0.98)_0%,rgba(11,27,43,0.94)_50%,rgba(11,27,43,0.74)_100%)]" />
        <div className={cn('absolute top-0 h-[8px] rounded-b-full bg-gold', compact ? 'left-6 right-6' : 'left-10 right-10 md:left-16 md:right-16')} />

        <div className={cn('relative', compact ? '' : 'max-w-[1040px]')}>
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-gold">
            <Check className="h-[14px] w-[14px] stroke-[3]" />
            Email sent successfully
          </div>
          <h3 className={cn('mt-[28px] font-serif leading-[0.98] tracking-[-0.045em] text-pearl', compact ? 'text-[36px]' : 'text-[clamp(44px,4.4vw,62px)]')}>
            Inquiry received
          </h3>
          <p className="mt-[24px] max-w-[72ch] text-[16px] font-semibold leading-8 text-pearl/78">
            We saved the selected tour and prepared the next step. Continue with secure payment, or ask our team to review the journey before payment.
          </p>
          <div className={cn('mt-[34px] grid gap-[12px]', compact ? '' : 'sm:grid-cols-3')}>
            {handoffStatus.map((item) => (
              <div key={item.label} className="rounded-[24px] border border-pearl/14 bg-pearl/[0.08] px-[18px] py-[16px] shadow-[inset_0_1px_0_rgba(248,245,239,0.10)]">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gold">{item.label}</p>
                <p className="mt-[8px] break-words text-[14px] font-black leading-6 text-pearl/92">{item.value}</p>
              </div>
              ))}
          </div>
        </div>
      </div>

      <div className={cn('grid', compact ? 'gap-6 p-[20px]' : 'gap-8 p-7 md:p-10 lg:p-11')}>
        <section className={cn('overflow-hidden rounded-[38px] border border-[#e1d3bc] bg-[#fffdf8] shadow-[0_20px_58px_rgba(11,27,43,0.08)]', compact ? '' : 'md:grid md:grid-cols-[360px_minmax(0,1fr)]')}>
          <div className={cn('relative bg-navy/10', compact ? 'h-[170px]' : 'h-[280px] md:h-auto md:min-h-[340px]')}>
            <SafeTourImage src={selectedImage} fallbackSrcs={[fallbackTourImage]} alt={selectedTitle} fill sizes="320px" className="object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,27,43,0)_30%,rgba(11,27,43,0.56)_100%)]" />
            <div className="absolute bottom-[20px] left-[20px] rounded-full bg-pearl/94 px-4 py-2 text-[10px] font-black uppercase tracking-[0.13em] text-gold-dark shadow-[0_10px_24px_rgba(11,27,43,0.12)]">
              Selected tour
            </div>
          </div>
          <div className={cn('grid', compact ? 'gap-[20px] p-[18px]' : 'gap-6 p-7 md:p-8')}>
            <div className="flex flex-col gap-6 min-[760px]:flex-row min-[760px]:items-start min-[760px]:justify-between">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-gold-dark">
                  <Sparkles className="h-4 w-4" />
                  Tour selected for payment
                </p>
                <h4 className={cn('mt-[20px] font-serif leading-[1.04] tracking-[-0.04em] text-navy', compact ? 'text-[28px]' : 'text-[clamp(32px,3vw,44px)]')}>
                  {selectedTitle}
                </h4>
                <p className="mt-4 line-clamp-2 text-[15px] font-bold leading-7 text-navy/58">{selectedRoute}</p>
              </div>
              <Link href={primaryMatch ? tourDetailHref(primaryMatch) : '/customize-your-trip/'} target={primaryMatch ? '_blank' : undefined} rel={primaryMatch ? 'noreferrer' : undefined} className="inline-flex min-h-[50px] shrink-0 items-center justify-center gap-2 rounded-full border border-[#d9ccb4] bg-[#fffaf1] px-6 text-[11px] font-black uppercase tracking-[0.14em] text-navy transition hover:border-gold hover:text-gold-dark">
                Details <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-6 rounded-[30px] bg-[linear-gradient(180deg,#fff7e8_0%,#f0dfbd_100%)] px-6 py-6 min-[760px]:grid-cols-[1fr_auto] min-[760px]:items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-navy/42">Provisional amount</p>
                <p className="mt-[12px] text-[34px] font-black leading-none tracking-[-0.04em] text-navy">{selectedPrice}</p>
              </div>
              <p className="max-w-[46ch] text-[14px] font-bold leading-7 text-navy/60">Final quote is checked against hotel, guide and availability before confirmation.</p>
            </div>
          </div>
        </section>

        <section className={cn('grid', compact ? 'gap-[20px]' : 'gap-6 min-[980px]:grid-cols-2')}>
          <Link
            href={payHref}
            className="group relative flex min-h-[340px] flex-col overflow-hidden rounded-[38px] bg-navy p-[36px] text-pearl shadow-[0_26px_74px_rgba(11,27,43,0.22)] transition duration-300 ease-luxe hover:-translate-y-0.5 hover:bg-[#10263a] md:p-10"
          >
            <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full border border-gold/20 bg-gold/[0.06]" />
            <div className="relative flex items-start justify-between gap-6">
              <span className="grid h-[56px] w-[56px] place-items-center rounded-[22px] bg-gold text-navy shadow-[0_14px_34px_rgba(200,169,106,0.24)]">
                <CreditCard className="h-6 w-6" />
              </span>
              <span className="rounded-full border border-gold/26 bg-gold/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-gold">Recommended</span>
            </div>
            <p className="relative mt-[36px] text-[36px] font-black leading-none tracking-[-0.05em]">Pay online</p>
            <p className="relative mt-[20px] max-w-[56ch] text-[16px] font-semibold leading-8 text-pearl/70">
              Open the secure payment page with Lead ID and VietQR amount {formatVnd(amountVnd)} already filled.
            </p>
            <span className="relative mt-auto inline-flex min-h-[56px] w-fit items-center justify-center gap-2 rounded-full bg-gold px-[28px] text-[11px] font-black uppercase tracking-[0.15em] text-navy transition group-hover:bg-pearl">
              Open payment <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>

          <div className="flex min-h-[340px] flex-col rounded-[38px] border border-[#e1d3bc] bg-[#fffdf8] p-[36px] shadow-[0_20px_58px_rgba(11,27,43,0.08)] md:p-10">
            <div className="flex items-start justify-between gap-6">
              <span className="grid h-[56px] w-[56px] shrink-0 place-items-center rounded-[22px] border border-gold/24 bg-gold/12 text-gold-dark">
                <MessageCircle className="h-6 w-6" />
              </span>
              <span className="rounded-full border border-gold/24 bg-pearl px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-gold-dark">
                Quick support
              </span>
            </div>
            <p className="mt-[36px] text-[36px] font-black leading-none tracking-[-0.05em] text-navy">Consult directly</p>
            <p className="mt-[20px] max-w-[56ch] text-[16px] font-semibold leading-8 text-navy/62">
              Use a pre-filled email or WhatsApp message if the guest wants a designer to review before payment.
            </p>
            <div className="mt-auto grid gap-4 sm:grid-cols-2">
              <a href={mailHref} className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full border border-[#d9ccb4] bg-[#fffaf1] px-4 text-[11px] font-black uppercase tracking-[0.14em] text-navy transition hover:border-gold hover:text-gold-dark">
                <Mail className="h-4 w-4" />
                Email
              </a>
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-[#34b442] px-4 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-[0_12px_28px_rgba(52,180,66,0.20)] transition hover:bg-[#42c750]">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SubmitError({ message, compact = false }: { message: string; compact?: boolean }) {
  return (
    <div className={cn('relative z-10 border-t border-red-200/70 bg-red-50/80', compact ? 'px-[18px] py-[14px]' : 'px-6 py-4 md:px-8')}>
      <div className="flex items-start gap-[12px] rounded-[20px] border border-red-200 bg-[#fff7f4] px-4 py-[12px] text-red-800 shadow-[0_12px_28px_rgba(127,29,29,0.08)]">
        <AlertCircle className="mt-[2px] h-[20px] w-[20px] shrink-0" />
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-red-700">Please check this step</p>
          <p className="mt-1 text-sm font-semibold leading-6">{message}</p>
        </div>
      </div>
    </div>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; compact?: boolean }) {
  const { label, compact = false, ...input } = props;
  return (
    <label className="block min-w-0">
      <span className={cn('font-black uppercase tracking-[0.18em] text-gold-dark', compact ? 'text-[10px]' : 'text-[11px]')}>
        {label}
      </span>
      <input
        className={cn(
          'w-full min-w-0 border border-[#d9ccb4] bg-[#fffefb] text-navy outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] transition duration-300 ease-luxe placeholder:text-navy/34 focus:border-gold focus:ring-4 focus:ring-gold/12',
          compact ? 'mt-[10px] min-h-[50px] rounded-[16px] px-[16px] text-[14px]' : 'mt-4 min-h-[64px] rounded-[22px] px-[24px] text-[16px]'
        )}
        {...input}
      />
    </label>
  );
}

function ChoiceGrid({ values, selected, toggle, compact = false }: { values: BookingOption[]; selected: string[]; toggle: (value: string) => void; compact?: boolean }) {
  return (
    <div className={cn('grid min-w-0', compact ? 'gap-[10px] sm:grid-cols-2' : 'gap-[28px] min-[820px]:grid-cols-2', compact && values.length > 6 ? 'max-h-[340px] overflow-y-auto pr-[2px] no-scrollbar' : '')}>
      {values.map((option, index) => {
        const active = selected.includes(option.value);
        return (
          <OptionTile
            key={option.value}
            option={option}
            index={index}
            active={active}
            compact={compact}
            onClick={() => toggle(option.value)}
          />
        );
      })}
    </div>
  );
}

function RadioGrid({ values, selected, set, compact = false }: { values: BookingOption[]; selected: string; set: (value: string) => void; compact?: boolean }) {
  return (
    <div className={cn('grid min-w-0', compact ? 'gap-[10px] sm:grid-cols-2' : 'gap-[28px] min-[820px]:grid-cols-2')}>
      {values.map((option, index) => {
        const active = selected === option.value;
        return (
          <OptionTile
            key={option.value}
            option={option}
            index={index}
            active={active}
            compact={compact}
            onClick={() => set(option.value)}
          />
        );
      })}
    </div>
  );
}

function StyleRadioGrid({ values, selected, set, compact = false }: { values: BookingOption[]; selected: string; set: (value: string) => void; compact?: boolean }) {
  const listMaxHeight = compact ? 478 : 680;

  return (
    <div className="grid min-w-0">
      <div className={cn('min-w-0 overflow-hidden border border-navy/8 bg-pearl/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]', compact ? 'rounded-[26px] p-[12px]' : 'rounded-[34px] p-6')}>
        <div className={cn('flex items-center justify-between gap-4 px-[2px]', compact ? 'pb-[14px]' : 'pb-6')}>
          <div className="min-w-0">
            <p className={cn('font-black uppercase text-gold-dark', compact ? 'text-[11px] tracking-[0.18em]' : 'text-[12px] tracking-[0.2em]')}>Choose a travel style</p>
            <p className={cn('mt-[5px] truncate font-bold text-navy/54', compact ? 'text-[12px]' : 'text-[14px]')}>Scroll down inside the box to view more.</p>
          </div>
          <span className="shrink-0 rounded-full border border-gold/25 bg-gold/10 px-[10px] py-[5px] text-[10px] font-black uppercase tracking-[0.12em] text-gold-dark">Scroll</span>
        </div>

        <div className="relative">
          <div
            className={cn('grid min-w-0 overflow-y-auto overscroll-contain pr-[6px] sm:grid-cols-2', compact ? 'gap-[14px]' : 'gap-6')}
            style={{ maxHeight: listMaxHeight, scrollbarWidth: 'thin' }}
          >
            {values.map((option, index) => {
              const active = selected === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => set(option.value)}
                  className={cn(
                    'group relative min-w-0 overflow-hidden border text-left transition duration-300 ease-luxe focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/65 active:scale-[0.992]',
                    compact ? 'h-[150px] rounded-[26px] px-[20px] py-[18px]' : 'h-[206px] rounded-[32px] px-[34px] py-[30px]',
                    active
                      ? 'border-gold/70 bg-navy text-pearl shadow-[0_16px_38px_rgba(11,27,43,0.16)]'
                      : 'border-navy/10 bg-[linear-gradient(180deg,#fffaf1_0%,#f4ead8_100%)] text-navy shadow-[0_10px_24px_rgba(11,27,43,0.055)] hover:-translate-y-0.5 hover:border-gold/55 hover:shadow-[0_16px_38px_rgba(11,27,43,0.10)]'
                  )}
                >
                  <span className={cn('pointer-events-none absolute rounded-full border transition duration-500 ease-luxe', compact ? '-right-8 -top-10 h-24 w-24' : '-right-12 -top-[56px] h-32 w-32', active ? 'border-gold/25 bg-gold/[0.08]' : 'border-gold/0 group-hover:border-gold/20')} />
                  <span className={cn('relative flex h-full min-w-0 flex-col justify-between', compact ? 'gap-[20px]' : 'gap-[26px]')}>
                    <span className={cn('grid items-start', compact ? 'grid-cols-[1fr_34px] gap-[14px]' : 'grid-cols-[1fr_40px] gap-[18px]')}>
                      <span className={cn('min-w-0 font-serif tracking-[-0.018em]', compact ? 'line-clamp-2 text-[25px] leading-[1.08]' : 'line-clamp-2 text-[34px] leading-[1.08]')}>{option.label}</span>
                      <span
                        className={cn(
                          'grid shrink-0 place-items-center rounded-full border font-black leading-none tracking-[0.08em] transition duration-300 ease-luxe',
                          compact ? 'h-[34px] w-[34px] text-[10px]' : 'h-[40px] w-[40px] text-[11px]',
                          active
                            ? 'border-gold/35 bg-gold text-navy shadow-[0_8px_20px_rgba(200,169,106,0.28)]'
                            : 'border-gold/28 bg-gold/[0.08] text-gold-dark group-hover:border-gold/55 group-hover:bg-gold/[0.15]'
                        )}
                      >
                        {active ? <Check className={cn('stroke-[3]', compact ? 'h-[15px] w-[15px]' : 'h-[18px] w-[18px]')} /> : String(index + 1).padStart(2, '0')}
                      </span>
                    </span>
                    {option.note ? (
                      <span className={cn('block font-bold tracking-[0.006em] transition duration-300 ease-luxe', compact ? 'line-clamp-2 text-[13px] leading-6' : 'line-clamp-3 text-[16px] leading-7', active ? 'text-pearl/72' : 'text-navy/64 group-hover:text-navy/76')}>
                        {option.note}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[10px] bg-[linear-gradient(180deg,rgba(248,245,239,0)_0%,rgba(248,245,239,0.42)_100%)]" />
        </div>
      </div>
    </div>
  );
}

function OptionTile({ option, active, index, onClick, compact = false }: { option: BookingOption; active: boolean; index: number; onClick: () => void; compact?: boolean }) {
  if (compact) {
    return (
      <button
        type="button"
        aria-pressed={active}
        onClick={onClick}
        className={cn(
          'group relative min-h-[76px] min-w-0 overflow-hidden rounded-[20px] border px-[14px] py-[12px] text-left transition duration-300 ease-luxe focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/65 active:scale-[0.992]',
          active
            ? 'border-gold/70 bg-[linear-gradient(135deg,#0b1b2b_0%,#132b40_100%)] text-pearl shadow-[0_16px_38px_rgba(11,27,43,0.16)]'
            : 'border-navy/10 bg-[linear-gradient(180deg,#fffaf1_0%,#f4ead8_100%)] text-navy shadow-[0_10px_24px_rgba(11,27,43,0.055)] hover:-translate-y-0.5 hover:border-gold/55 hover:shadow-[0_16px_38px_rgba(11,27,43,0.10)]'
        )}
      >
        <span className={cn('pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full border transition duration-500 ease-luxe', active ? 'border-gold/25 bg-gold/[0.08]' : 'border-gold/0 group-hover:border-gold/20')} />
        <span className="relative flex items-center gap-[12px]">
          <span
            className={cn(
              'grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full border text-[10px] font-black leading-none tracking-[0.08em] transition duration-300 ease-luxe',
              active
                ? 'border-gold/35 bg-gold text-navy shadow-[0_8px_20px_rgba(200,169,106,0.28)]'
                : 'border-gold/28 bg-gold/[0.08] text-gold-dark group-hover:border-gold/55 group-hover:bg-gold/[0.15]'
            )}
          >
            {active ? <Check className="h-[14px] w-[14px] stroke-[3]" /> : String(index + 1).padStart(2, '0')}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-serif text-[20px] leading-[1.05] tracking-[-0.035em]">
              {option.label}
            </span>
            {option.note && (
              <span className={cn('mt-[4px] block truncate text-[11px] font-semibold leading-4 tracking-[-0.01em] transition duration-300 ease-luxe', active ? 'text-pearl/66' : 'text-navy/56 group-hover:text-navy/70')}>
                {option.note}
              </span>
            )}
          </span>
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden border text-left transition duration-300 ease-luxe focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/65 active:scale-[0.992]',
          compact ? 'min-h-[108px] rounded-[22px] p-4' : 'min-h-[158px] rounded-[28px] p-6 sm:p-7',
        active
          ? 'border-gold/70 bg-[linear-gradient(135deg,#0b1b2b_0%,#132b40_100%)] text-pearl shadow-[0_22px_56px_rgba(11,27,43,0.18)]'
          : 'border-navy/10 bg-[linear-gradient(180deg,#fffaf1_0%,#f4ead8_100%)] text-navy shadow-[0_12px_34px_rgba(11,27,43,0.055)] hover:-translate-y-0.5 hover:border-gold/55 hover:shadow-[0_20px_52px_rgba(11,27,43,0.11)]'
      )}
    >
      <span
        className={cn(
          'pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full border transition duration-500 ease-luxe',
          active ? 'border-gold/30 bg-gold/[0.08]' : 'border-gold/0 group-hover:border-gold/20'
        )}
      />
      <span className="relative flex items-start justify-between gap-4">
        <span className="min-w-0">
          <span
            className={cn(
              'mb-[20px] inline-flex h-[36px] min-w-[36px] items-center justify-center rounded-full border px-2 text-[11px] font-black leading-none tracking-[0.12em] transition duration-300 ease-luxe',
              active
                ? 'border-gold/35 bg-gold text-navy shadow-[0_8px_20px_rgba(200,169,106,0.28)]'
                : 'border-gold/28 bg-gold/[0.08] text-gold-dark group-hover:border-gold/55 group-hover:bg-gold/[0.15]'
            )}
          >
            {active ? <Check className="h-[14px] w-[14px] stroke-[3]" /> : String(index + 1).padStart(2, '0')}
          </span>
          <span className={cn('block max-w-[28rem] font-serif leading-[1.08] tracking-[-0.035em]', compact ? 'text-[20px]' : 'text-[clamp(24px,1.6vw,30px)]')}>
            {option.label}
          </span>
          {option.note && (
            <span className={cn('block max-w-[34rem] font-semibold tracking-[-0.015em] transition duration-300 ease-luxe', compact ? 'mt-2 line-clamp-2 text-[12px] leading-5' : 'mt-4 text-[16px] leading-8', active ? 'text-pearl/72' : 'text-navy/58 group-hover:text-navy/70')}>
              {option.note}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}

type SummarySectionData = {
  eyebrow: string;
  title: string;
  items: Array<[string, string]>;
};

function Summary({ values, compact = false }: { values: LeadPayload; compact?: boolean }) {
  const notes = values.notes.trim();
  const sections: SummarySectionData[] = [
    {
      eyebrow: 'Where',
      title: 'Route brief',
      items: [
        ['Destinations', values.destinations.join(', ') || 'Not selected'],
        ['Route focus', values.routeFocus.join(', ') || 'Open to suggestions'],
        ['Arrival / departure', values.startEnd || 'Not sure yet']
      ]
    },
    {
      eyebrow: 'When',
      title: 'Timing and group',
      items: [
        ['Dates', values.dates || 'Flexible'],
        ['Duration', values.duration],
        ['Travelers', `${values.adults} adults, ${values.children} children (${values.travelerType})`]
      ]
    },
    {
      eyebrow: 'Taste',
      title: 'Travel style',
      items: [
        ['Pace', values.pace],
        ['Style', values.style],
        ['Hotel', values.hotel]
      ]
    },
    {
      eyebrow: 'Plan',
      title: 'Budget and support',
      items: [
        ['Budget', values.budget],
        ['Interests', values.interests.join(', ') || 'Open to suggestions'],
        ['Support', values.support]
      ]
    }
  ];

  if (compact) {
    return (
      <div className="overflow-hidden rounded-[28px] border border-[#eadcc8] bg-[#fffefb] shadow-[0_18px_48px_rgba(11,27,43,0.08)]">
        <div className="border-b border-[#eadcc8]/80 px-[18px] py-[16px]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-dark">Tour brief</p>
          <h3 className="mt-[8px] font-serif text-[25px] leading-none tracking-[-0.04em] text-navy">Review choices</h3>
          <p className="mt-[8px] text-[12px] font-semibold leading-5 text-navy/56">Next step shows matching tours to choose from.</p>
        </div>
        <div className="grid max-h-[360px] gap-[10px] overflow-y-auto p-[12px] no-scrollbar">
          {sections.map((section) => (
            <SummarySection key={section.title} section={section} compact />
          ))}
          {notes ? (
            <div className="rounded-[18px] border border-gold/18 bg-gold/[0.08] px-[13px] py-[11px]">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gold-dark">Notes</p>
              <p className="mt-2 line-clamp-3 text-[12px] font-semibold leading-5 text-navy/66">{notes}</p>
            </div>
          ) : null}
        </div>
        <div className="border-t border-navy/8 px-[16px] py-[12px]">
          <p className="text-[12px] font-semibold leading-5 text-navy/56">Press Next to see recommended tour cards, then select one before sending contact details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[38px] border border-[#eadcc8] bg-[#fffefb] shadow-[0_20px_58px_rgba(11,27,43,0.10)]">
      <div className="relative overflow-hidden border-b border-[#eadcc8]/80 px-6 py-6 sm:px-8 sm:py-[28px]">
        <div className="relative grid gap-[20px]">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.2em] text-gold-dark">Luxury trip summary</p>
            <h3 className="mt-[12px] font-serif text-[clamp(29px,3vw,38px)] leading-[0.98] tracking-[-0.04em] text-navy">Your journey outline</h3>
          </div>
          <div className="rounded-[24px] border border-[#eadcc8] bg-[linear-gradient(180deg,#fffaf1_0%,#f5ebdb_100%)] px-[20px] py-4 text-[14px] font-semibold leading-7 text-navy/62">
            Review the brief here. The matching tour recommendations appear on the next step.
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-[20px] sm:p-[28px] min-[980px]:grid-cols-2">
        {sections.map((section) => (
          <SummarySection key={section.title} section={section} />
        ))}
      </div>

      <div className="grid gap-[20px] border-t border-navy/8 p-[20px] sm:p-[28px] min-[760px]:grid-cols-[1fr_0.92fr]">
        <div className="rounded-[26px] border border-navy/8 bg-pearl/78 p-[20px] shadow-[inset_0_1px_0_rgba(255,255,255,0.66)]">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-navy/42">Guest notes</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-navy/66">
            {notes || 'No additional notes yet. The designer will use the route, style, budget and support preferences above.'}
          </p>
        </div>
        <div className="rounded-[26px] border border-gold/22 bg-gold/[0.10] p-[20px] text-navy">
          <p className="flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.18em] text-gold-dark">
            <Sparkles className="h-4 w-4" />
            Next step
          </p>
          <h4 className="mt-2 text-[22px] font-black leading-none tracking-[-0.035em]">Recommended tours</h4>
          <p className="mt-2 text-sm font-semibold leading-6 text-navy/62">Open a tour detail in a new tab, return here, select one and continue.</p>
        </div>
      </div>
    </div>
  );
}

function SummarySection({ section, compact = false }: { section: SummarySectionData; compact?: boolean }) {
  return (
    <section className={cn('rounded-[26px] border border-[#eadcc8] bg-[#fffefb] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]', compact ? 'p-[13px]' : 'p-[20px]')}>
      <div className="flex items-start justify-between gap-[12px]">
        <div className="min-w-0">
          <p className={cn('font-black uppercase tracking-[0.16em] text-gold-dark', compact ? 'text-[10px]' : 'text-[11px]')}>{section.eyebrow}</p>
          <h4 className={cn('mt-1 font-serif leading-[1.02] tracking-[-0.035em] text-navy', compact ? 'text-[21px]' : 'text-[24px]')}>{section.title}</h4>
        </div>
        <span className={cn('grid shrink-0 place-items-center rounded-full bg-gold/16 text-gold-dark', compact ? 'h-8 w-8' : 'h-10 w-10')}>
          <Check className={cn('stroke-[3]', compact ? 'h-[14px] w-[14px]' : 'h-4 w-4')} />
        </span>
      </div>
      <dl className={cn('grid', compact ? 'mt-[12px] gap-[8px]' : 'mt-[20px] gap-[12px]')}>
        {section.items.map(([label, value]) => (
          <div key={label} className={cn('rounded-[18px] bg-[#faf4e8]', compact ? 'px-[11px] py-[9px]' : 'px-4 py-[12px]')}>
            <dt className={cn('font-black uppercase tracking-[0.13em] text-navy/42', compact ? 'text-[10px]' : 'text-[10px]')}>{label}</dt>
            <dd className={cn('mt-1 break-words font-bold text-navy/72', compact ? 'line-clamp-2 text-[12px] leading-5' : 'text-[13px] leading-5')}>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

// ── New helper components for the VietnamJourney-style layout ──

function BookingSection({
  number,
  title,
  subtitle,
  children
}: {
  number: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-[#e4d8c2] bg-[linear-gradient(180deg,#fffdf8_0%,#faf5ec_100%)] shadow-[0_16px_48px_rgba(11,27,43,0.07)]">
      <div className="flex items-start gap-4 border-b border-[#eadcc8]/80 px-6 py-5 md:px-7">
        <span className="mt-[2px] grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold text-navy text-[13px] font-black leading-none shadow-[0_6px_16px_rgba(200,169,106,0.30)]">
          {number}
        </span>
        <div className="min-w-0">
          <h3 className="font-serif text-[22px] leading-tight tracking-[-0.03em] text-navy">{title}</h3>
          {subtitle && <p className="mt-1 text-[13px] font-semibold text-navy/52">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6 md:p-7">{children}</div>
    </section>
  );
}

function GuestCounter({
  label,
  subtitle,
  value,
  min,
  max,
  onDecrement,
  onIncrement
}: {
  label: string;
  subtitle: string;
  value: number;
  min: number;
  max: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gold-dark">{label}</p>
      <p className="text-[12px] font-semibold text-navy/50">{subtitle}</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDecrement}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className="grid h-11 w-11 place-items-center rounded-full border border-navy/14 bg-[#fffaf2] text-navy transition hover:border-gold/50 hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="min-w-[2ch] text-center text-[28px] font-black leading-none tracking-[-0.04em] text-navy">
          {value}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className="grid h-11 w-11 place-items-center rounded-full border border-navy/14 bg-[#fffaf2] text-navy transition hover:border-gold/50 hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function EstimateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-pearl/8 pb-3 last:border-0 last:pb-0">
      <span className="text-[11px] font-black uppercase tracking-[0.16em] text-pearl/42">{label}</span>
      <span className="min-w-0 truncate text-right text-[13px] font-semibold text-pearl/80">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NonCompactBookingForm — full-page booking layout (customize-your-trip page)
//
// Key perf fix: uses `useWatch` for only the 6 fields rendered reactively.
// Typing in text inputs (name, email, phone, notes, dates, startEnd) causes
// ZERO re-renders because those fields are not subscribed via useWatch.
// ─────────────────────────────────────────────────────────────────────────────
export function NonCompactBookingForm({ tourCatalog = [] }: { tourCatalog?: BookingTourCandidate[] }) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [submitted, setSubmitted] = useState<SubmittedLead | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('luxury');
  const [selectedTourSlug, setSelectedTourSlug] = useState<string | null>(null);
  const form = useForm<LeadPayload>({ defaultValues: defaults });

  // Only the 6 fields actually used in reactive JSX — text inputs never re-render the form
  const destinations = useWatch({ control: form.control, name: 'destinations' }) as string[];
  const duration     = useWatch({ control: form.control, name: 'duration' })      as string;
  const adults       = useWatch({ control: form.control, name: 'adults' })        as number;
  const children     = useWatch({ control: form.control, name: 'children' })      as number;
  const travelerType = useWatch({ control: form.control, name: 'travelerType' })  as string;
  const dates        = useWatch({ control: form.control, name: 'dates' })         as string;

  const deferredDestinations = useDeferredValue(destinations);
  const recommendedTours = useMemo(() => {
    if (!tourCatalog.length || !deferredDestinations.length) return [];
    return matchBookingTours(form.getValues(), tourCatalog, 4);
  }, [tourCatalog, deferredDestinations, form]);

  // Load saved draft
  useEffect(() => {
    const raw = localStorage.getItem(draftKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<LeadPayload>;
        form.reset({ ...defaults, ...parsed, style: legacyStyleMap[parsed.style || ''] || parsed.style || defaults.style });
      } catch { /* ignore corrupt draft */ }
    }
  }, [form]);

  // Debounced draft save — does not cause re-renders (uses callback form of watch)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const sub = form.watch((value) => {
      clearTimeout(timer);
      timer = setTimeout(() => localStorage.setItem(draftKey, JSON.stringify(value)), 400);
    });
    return () => { sub.unsubscribe(); clearTimeout(timer); };
  }, [form]);

  useEffect(() => {
    if (!recommendedTours.length) { setSelectedTourSlug(null); return; }
    setSelectedTourSlug((current) => {
      if (current && recommendedTours.some((t) => t.slug === current)) return current;
      return recommendedTours[0].slug;
    });
  }, [recommendedTours]);

  const activeTier = BOOKING_TIERS.find((t) => t.id === selectedTier) ?? BOOKING_TIERS[1];

  const handleTierSelect = useCallback((tier: typeof BOOKING_TIERS[number]) => {
    setSelectedTier(tier.id);
    form.setValue('style',   tier.mapStyle   as LeadPayload['style'],   { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    form.setValue('budget',  tier.mapBudget  as LeadPayload['budget'],  { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    form.setValue('hotel',   tier.mapHotel   as LeadPayload['hotel'],   { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    form.setValue('pace',    tier.mapPace    as LeadPayload['pace'],    { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    form.setValue('support', tier.mapSupport as LeadPayload['support'], { shouldDirty: false, shouldTouch: false, shouldValidate: false });
  }, [form]);

  const toggleDestination = useCallback((val: string) => {
    const current = form.getValues('destinations');
    form.setValue('destinations', current.includes(val) ? current.filter((d) => d !== val) : [...current, val]);
  }, [form]);

  async function onSubmit(data: LeadPayload) {
    setError(null);
    const valid = await form.trigger();
    if (!valid) return;
    const matchedTours = matchBookingTours(data, tourCatalog, 4);
    const orderedMatches = orderTourMatches(matchedTours, selectedTourSlug);
    const safeData = withLeadFallbacks(data, orderedMatches[0]);
    const missingStep = firstMissingStep(safeData);
    if (missingStep) { setError(missingStep.message); return; }
    try {
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      if (siteKey && typeof window !== 'undefined') {
        const grecaptcha = (window as RecaptchaWindow).grecaptcha;
        safeData.recaptchaToken = await new Promise<string>((resolve) => {
          if (!grecaptcha) return resolve('');
          grecaptcha.ready(() => grecaptcha.execute(siteKey, { action: 'lead_submit' }).then(resolve));
        });
      }
      const payload: LeadPayload = {
        ...safeData,
        matchedTours: orderedMatches.map((tour) => ({
          title: tour.title, slug: tour.slug, href: tour.href,
          score: tour.score, amountUsd: tour.paymentAmountUsd, reasons: tour.reasons,
        })),
      };
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(formatApiError(json));
      localStorage.removeItem(draftKey);
      trackEvent('form_submit', { form: 'tailor_made' });
      setSubmitted({ id: String(json.id || 'received'), matches: orderedMatches, values: safeData });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit inquiry. Please check the highlighted information and try again.');
    }
  }

  if (submitted) return <SubmittedHandoff compact={false} submitted={submitted} />;

  const estMin = activeTier.priceMin * (adults || 2);
  const estMax = activeTier.priceMax * (adults || 2);
  const selectedTour = recommendedTours[0];

  return (
    <form
      ref={formRef}
      onFocus={() => { if (!started) { setStarted(true); trackEvent('form_start', { form: 'tailor_made' }); } }}
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full"
    >
      {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
        <Script src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`} strategy="afterInteractive" />
      )}
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" {...form.register('website')} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_384px] xl:grid-cols-[minmax(0,1fr)_416px] lg:items-start">
        {/* ── Left Column: 4 numbered sections ── */}
        <div className="space-y-6">

          {/* Section 1: Choose Your Experience */}
          <BookingSection number={1} title="Choose Your Experience" subtitle="Select your preferred travel style and budget range">
            <div className="grid gap-4 sm:grid-cols-3">
              {BOOKING_TIERS.map((tier) => {
                const active = selectedTier === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => handleTierSelect(tier)}
                    className={cn(
                      'relative flex flex-col gap-4 rounded-[22px] border p-5 text-left transition duration-200 ease-luxe focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 active:scale-[0.99]',
                      active
                        ? 'border-gold/60 bg-navy text-pearl shadow-[0_18px_48px_rgba(11,27,43,0.22)]'
                        : 'border-navy/12 bg-[#fffaf2] text-navy hover:-translate-y-0.5 hover:border-gold/35 hover:shadow-[0_12px_32px_rgba(11,27,43,0.07)]'
                    )}
                  >
                    {tier.badge ? (
                      <span className="absolute right-4 top-4 rounded-full bg-gold px-3 py-[5px] text-[10px] font-black uppercase tracking-[0.14em] text-navy shadow-[0_6px_16px_rgba(200,169,106,0.25)]">
                        {tier.badge}
                      </span>
                    ) : null}
                    <span className={cn('font-serif text-[21px] leading-tight tracking-[-0.03em]', active ? 'text-pearl' : 'text-navy')}>
                      {tier.label}
                    </span>
                    <div>
                      <span className={cn('text-[10px] font-black uppercase tracking-[0.18em]', active ? 'text-gold' : 'text-gold-dark')}>From</span>
                      <p className={cn('mt-1 font-black text-[26px] leading-none tracking-[-0.04em]', active ? 'text-pearl' : 'text-navy')}>
                        {tier.priceFrom}
                      </p>
                      <p className={cn('mt-1 text-[12px] font-semibold', active ? 'text-pearl/58' : 'text-navy/50')}>{tier.priceTo}</p>
                    </div>
                    <p className={cn('text-[12px] font-semibold leading-5', active ? 'text-pearl/68' : 'text-navy/58')}>
                      {tier.description}
                    </p>
                    <span className={cn('mt-auto flex h-7 w-7 items-center justify-center rounded-full border transition duration-200 ease-luxe', active ? 'border-gold bg-gold text-navy shadow-[0_6px_16px_rgba(200,169,106,0.24)]' : 'border-navy/20 text-transparent')}>
                      <Check className="h-4 w-4 stroke-[3]" />
                    </span>
                  </button>
                );
              })}
            </div>
          </BookingSection>

          {/* Section 2: Destinations & Travel Dates */}
          <BookingSection number={2} title="Destinations & Travel Dates" subtitle="Where do you want to go and when?">
            <div className="space-y-6">
              <div>
                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-gold-dark">Select destinations</p>
                <div className="flex flex-wrap gap-2">
                  {bookingDestinations.map((dest) => {
                    const active = destinations.includes(dest.value);
                    return (
                      <button
                        key={dest.value}
                        type="button"
                        onClick={() => toggleDestination(dest.value)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-semibold transition duration-150',
                          active
                            ? 'border-gold/70 bg-navy text-pearl shadow-[0_6px_16px_rgba(11,27,43,0.16)]'
                            : 'border-navy/14 bg-[#fffaf2] text-navy hover:border-gold/40 hover:bg-[#fffbf4]'
                        )}
                      >
                        {active && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        {dest.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-gold-dark">Preferred travel dates</span>
                  <input
                    type="text"
                    placeholder="e.g. March 2026 or flexible"
                    className="mt-3 w-full rounded-[18px] border border-[#d9ccb4] bg-[#fffefb] px-5 py-3.5 text-[15px] text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] placeholder:text-navy/34 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/12 transition duration-150"
                    {...form.register('dates')}
                  />
                </label>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gold-dark">Trip duration</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {bookingDurations.map((dur) => {
                      const active = duration === dur.value;
                      return (
                        <button
                          key={dur.value}
                          type="button"
                          onClick={() => form.setValue('duration', dur.value)}
                          className={cn(
                            'rounded-[14px] border px-3 py-2.5 text-[12px] font-semibold text-left transition duration-150',
                            active
                              ? 'border-gold/70 bg-navy text-pearl'
                              : 'border-navy/12 bg-[#fffaf2] text-navy hover:border-gold/35'
                          )}
                        >
                          {dur.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <label className="block">
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-gold-dark">
                  Arrival &amp; departure cities{' '}
                  <span className="normal-case font-semibold tracking-normal text-navy/40">(optional)</span>
                </span>
                <input
                  type="text"
                  placeholder="e.g. Arrive Hanoi / Depart Ho Chi Minh City"
                  className="mt-3 w-full rounded-[18px] border border-[#d9ccb4] bg-[#fffefb] px-5 py-3.5 text-[15px] text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] placeholder:text-navy/34 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/12 transition duration-150"
                  {...form.register('startEnd')}
                />
              </label>
            </div>
          </BookingSection>

          {/* Section 3: Number of Travellers */}
          <BookingSection number={3} title="Number of Travellers" subtitle="How many guests will be joining the private journey?">
            <div className="grid gap-6 sm:grid-cols-3">
              <GuestCounter
                label="Adults"
                subtitle="Age 12 and over"
                value={adults || 2}
                min={1}
                max={20}
                onDecrement={() => form.setValue('adults', Math.max(1, (adults || 2) - 1))}
                onIncrement={() => form.setValue('adults', Math.min(20, (adults || 2) + 1))}
              />
              <GuestCounter
                label="Children"
                subtitle="Age 2 to 11"
                value={children || 0}
                min={0}
                max={10}
                onDecrement={() => form.setValue('children', Math.max(0, (children || 0) - 1))}
                onIncrement={() => form.setValue('children', Math.min(10, (children || 0) + 1))}
              />
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gold-dark">Group type</p>
                {bookingTravelerTypes.map((t) => {
                  const active = travelerType === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => form.setValue('travelerType', t.value)}
                      className={cn(
                        'rounded-[12px] border px-3 py-2 text-[12px] font-semibold text-left transition duration-150',
                        active
                          ? 'border-gold/70 bg-navy text-pearl'
                          : 'border-navy/12 bg-[#fffaf2] text-navy hover:border-gold/35'
                      )}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </BookingSection>

          {/* Section 4: Your Contact Details */}
          <BookingSection number={4} title="Your Contact Details" subtitle="We'll send your private proposal and itinerary draft here">
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-gold-dark">
                    Full name <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    placeholder="Your full name"
                    className="mt-3 w-full rounded-[18px] border border-[#d9ccb4] bg-[#fffefb] px-5 py-3.5 text-[15px] text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] placeholder:text-navy/34 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/12 transition duration-150"
                    {...form.register('contact.fullName', { required: true })}
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-gold-dark">
                    Email address <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="mt-3 w-full rounded-[18px] border border-[#d9ccb4] bg-[#fffefb] px-5 py-3.5 text-[15px] text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] placeholder:text-navy/34 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/12 transition duration-150"
                    {...form.register('contact.email', { required: true })}
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-gold-dark">WhatsApp / Zalo</span>
                  <input
                    type="tel"
                    placeholder="+84 or international"
                    className="mt-3 w-full rounded-[18px] border border-[#d9ccb4] bg-[#fffefb] px-5 py-3.5 text-[15px] text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] placeholder:text-navy/34 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/12 transition duration-150"
                    {...form.register('contact.phone')}
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-gold-dark">Country of residence</span>
                  <input
                    type="text"
                    placeholder="e.g. United States"
                    className="mt-3 w-full rounded-[18px] border border-[#d9ccb4] bg-[#fffefb] px-5 py-3.5 text-[15px] text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] placeholder:text-navy/34 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/12 transition duration-150"
                    {...form.register('contact.country')}
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-gold-dark">
                  Special requests or notes{' '}
                  <span className="normal-case font-semibold tracking-normal text-navy/40">(optional)</span>
                </span>
                <textarea
                  rows={4}
                  placeholder="Any special requirements, dietary needs, honeymoon, anniversary or specific interests…"
                  className="mt-3 w-full resize-none rounded-[18px] border border-[#d9ccb4] bg-[#fffefb] px-5 py-4 text-[15px] text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] placeholder:text-navy/34 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/12 transition duration-150"
                  {...form.register('notes')}
                />
              </label>
            </div>
          </BookingSection>

          {error && <SubmitError message={error} />}

          {/* Submit CTA */}
          <div className="space-y-4">
            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="inline-flex min-h-[66px] w-full items-center justify-center gap-3 rounded-full bg-navy text-pearl text-[14px] font-black uppercase tracking-[0.18em] shadow-[0_16px_48px_rgba(11,27,43,0.18)] transition duration-200 ease-luxe hover:bg-gold hover:text-navy disabled:opacity-60"
            >
              {form.formState.isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              Request Private Consultation
            </button>
            <p className="text-center text-[12px] font-semibold text-navy/42">
              Free inquiry · No payment required · 100% private · We reply within 24 hours
            </p>
          </div>
        </div>

        {/* ── Right Column: Sticky Summary Panel ── */}
        <div className="hidden lg:block">
          <div className="sticky top-[108px] space-y-4">
            <div className="overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#07111f_0%,#122238_100%)] p-7 text-pearl shadow-[0_34px_94px_rgba(11,27,43,0.28)]">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-gold">Private Estimate</p>

              {/* Selected tier */}
              <div className="mt-5 rounded-[18px] border border-pearl/10 bg-pearl/[0.06] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gold/70">{activeTier.label}</p>
                <p className="mt-2 font-black text-[32px] leading-none tracking-[-0.04em]">{activeTier.priceFrom}</p>
                <p className="mt-1 text-[12px] font-semibold text-pearl/46">– {activeTier.priceTo}</p>
              </div>

              {/* Summary rows */}
              <div className="mt-5 space-y-3">
                <EstimateRow
                  label="Destination"
                  value={destinations.length ? destinations.slice(0, 3).join(', ') + (destinations.length > 3 ? ` +${destinations.length - 3}` : '') : '—'}
                />
                <EstimateRow label="Travel dates" value={dates || '—'} />
                <EstimateRow label="Duration" value={duration} />
                <EstimateRow
                  label="Travellers"
                  value={`${adults || 2} adult${(adults || 2) !== 1 ? 's' : ''}${children ? ` · ${children} child${children !== 1 ? 'ren' : ''}` : ''}`}
                />
              </div>

              {/* Estimated total */}
              <div className="mt-5 rounded-[18px] border border-gold/20 bg-gold/[0.08] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gold/80">Estimated Total</p>
                <p className="mt-2 font-black text-[26px] leading-none tracking-[-0.03em]">
                  {destinations.length
                    ? `US $${new Intl.NumberFormat('en-US').format(estMin)} – ${new Intl.NumberFormat('en-US').format(estMax)}`
                    : '—'}
                </p>
                <p className="mt-1.5 text-[11px] font-semibold text-pearl/40">full party · reference estimate</p>
              </div>

              {/* Trust badges */}
              <div className="mt-6 space-y-2.5">
                {['Free consultation, no obligation', 'Reply within 24 hours', 'No payment required to submit', '100% privacy guaranteed'].map((badge) => (
                  <div key={badge} className="flex items-center gap-3">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-gold/30 bg-gold/14 text-gold">
                      <Check className="h-3 w-3 stroke-[2.5]" />
                    </span>
                    <span className="text-[12px] font-semibold text-pearl/64">{badge}</span>
                  </div>
                ))}
              </div>

              {/* Contact */}
              <div className="mt-6 border-t border-pearl/10 pt-5">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gold/70">Speak to a Specialist</p>
                <div className="mt-3 space-y-1.5">
                  <a
                    href="https://wa.me/84912345678"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 text-[13px] font-semibold text-pearl/58 transition hover:text-gold"
                  >
                    <MessageCircle className="h-4 w-4 shrink-0" />
                    WhatsApp us
                  </a>
                  <a
                    href="mailto:hello@luxurytravels.com"
                    className="flex items-center gap-2.5 text-[13px] font-semibold text-pearl/58 transition hover:text-gold"
                  >
                    <Mail className="h-4 w-4 shrink-0" />
                    Send us an email
                  </a>
                </div>
              </div>
            </div>

            {/* Tour match card */}
            {selectedTour ? (
              <div className="overflow-hidden rounded-[24px] border border-[#e2d5bf] bg-[#fffdf8] p-4 shadow-[0_12px_32px_rgba(11,27,43,0.08)]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-dark">Tour match found</p>
                <p className="mt-2 line-clamp-2 font-serif text-[18px] leading-tight tracking-[-0.03em] text-navy">{selectedTour.title}</p>
                <p className="mt-1.5 text-[12px] font-semibold text-navy/54">
                  {selectedTour.durationLabel} · {matchPercent(selectedTour)}% match
                </p>
                <Link
                  href={tourDetailHref(selectedTour)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-black uppercase tracking-[0.14em] text-gold-dark transition hover:text-navy"
                >
                  View tour <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </form>
  );
}
