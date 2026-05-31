"use client";

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import {
  ArrowRight,
  BadgeCheck,
  BadgePercent,
  BedDouble,
  Bus,
  CalendarDays,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  CircleSlash,
  Clock,
  Clock3,
  Compass,
  HeartHandshake,
  Hotel,
  Leaf,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Quote,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Utensils,
  Users,
  WalletCards,
  XCircle
} from 'lucide-react';
import { JsonLd } from '@/components/seo/json-ld';
import { Container } from '@/components/layout/container';
import { Accordion } from '@/components/ui/accordion';
import { SafeTourImage } from '@/components/ui/safe-tour-image';
import { TourCard } from '@/components/tour-card';
import { CmsItem, TourImageAttribution } from '@/lib/types';
import { faqSchema, tourSchema } from '@/lib/seo';
import { hubOrder, hubPath, tourHubKey } from '@/lib/routing';
import { tourImageFallbacks } from '@/lib/tour-images';
import { buildGoogleMapsEmbedSrcFromStops, extractGoogleMapsEmbedSrc } from '@/lib/google-maps-embed';

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap'
});

const jost = Jost({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600'],
  display: 'swap'
});

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readText(value: unknown, fallback = '') {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
}

function readImageAttributions(value: unknown): TourImageAttribution[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((item) => ({
      provider: readText(item.provider),
      sourceUrl: readText(item.sourceUrl),
      license: readText(item.license),
      alt: readText(item.alt),
      width: readText(item.width),
      height: readText(item.height)
    }))
    .filter((item) => item.provider && item.sourceUrl);
}

type SourceItineraryFact = {
  day: string;
  title: string;
  meals: string;
  accommodation: string;
  startPoint: string;
  endPoint: string;
};

const tourDetailTabs = [
  ['Overview', '#overview'],
  ['Highlights', '#highlights'],
  ['Itinerary', '#itinerary'],
  ['Included', '#included'],
  ['Gallery', '#gallery'],
  ['Reviews', '#reviews'],
] as const;

function readSourceItineraryFacts(value: unknown): SourceItineraryFact[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((item) => ({
      day: readText(item.day),
      title: readText(item.title),
      meals: readText(item.meals),
      accommodation: readText(item.accommodation),
      startPoint: readText(item.startPoint),
      endPoint: readText(item.endPoint)
    }))
    .filter((item) => item.day || item.title || item.meals || item.accommodation);
}

function readImportantNotes(details: Record<string, unknown>, fallbackNotes: string[], routeStops: string[]) {
  const explicit = readStringArray(details.importantNotes);
  const sourceUrl = readText(details.sourceUrl);
  const notes = explicit.length
    ? explicit
    : [
        ...fallbackNotes,
        'Public prices are planning references and should be reconfirmed against hotel class, travel dates and room type.',
        routeStops.length > 0 ? `Route map uses ${routeStops.length} captured destination stops for quick comparison.` : ''
      ];

  if (sourceUrl) notes.push('Public source link is kept for price and route verification.');
  return uniqueRouteStops(notes).slice(0, 6);
}

function formatPrice(value: string) {
  return value.replace(/^From\s+USD\s+/i, 'US $').replace(/\s+pp$/i, '');
}

function extractUsdAmount(value: string) {
  const normalized = value.replace(/,/g, '');
  const match = normalized.match(/(?:US\s*\$|USD\s*)?\s*(\d+(?:\.\d+)?)/i);
  return match ? Number(match[1]) : 0;
}

function numericScore(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return parsed > 5 ? parsed : parsed * 2;
}

function oldPrice(details: Record<string, unknown>, pricingRow?: Record<string, string>) {
  const rowOld = readText(pricingRow?.oldPrice);
  if (rowOld) return rowOld.replace(/^USD\s+/i, 'US $');
  const number = typeof details.oldPriceUsd === 'number' ? details.oldPriceUsd : 0;
  return number > 0 ? `US $${Math.round(number).toLocaleString('en-US')}` : '';
}

const destinationLexicon = [
  'Hanoi',
  'Ha Long Bay',
  'Halong Bay',
  'Lan Ha Bay',
  'Ninh Binh',
  'Trang An',
  'Hue',
  'Da Nang',
  'Hoi An',
  'Saigon',
  'Ho Chi Minh City',
  'Mekong Delta',
  'Can Tho',
  'Sapa',
  'Phu Quoc',
  'Bangkok',
  'Chiang Mai',
  'Phuket',
  'Siem Reap',
  'Angkor Wat',
  'Luang Prabang',
  'Bagan'
];

function cleanRouteStop(value: string) {
  return value.replace(/\s+/g, ' ').replace(/^(arrive in|arrival in|fly to|drive to|cruise to|transfer to)\s+/i, '').trim();
}

function uniqueRouteStops(values: string[]) {
  const seen = new Set<string>();
  return values
    .map(cleanRouteStop)
    .filter((value) => value.length > 1)
    .filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function deriveRouteStops({
  route,
  places,
  itinerary,
  title,
  excerpt
}: {
  route: string;
  places: string[];
  itinerary: Array<Record<string, string>>;
  title: string;
  excerpt: string;
}) {
  const explicitStops = places.length ? places : route.split(/\s+-\s+|\s+>\s+|\s+\u2192\s+|,\s+/);
  const combinedText = [title, excerpt, route, ...itinerary.flatMap((day) => [day.title, day.body])].join(' ');
  const inferredStops = destinationLexicon.filter((place) => new RegExp(`\\b${place.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(combinedText));
  const dayTitleStops = itinerary.map((day) => cleanRouteStop(day.title || '')).filter((value) => value.length > 2);
  const stops = uniqueRouteStops([...explicitStops, ...inferredStops]);

  return stops.length ? stops.slice(0, 8) : uniqueRouteStops(dayTitleStops).slice(0, 6);
}

export function TourDetailPage({ tour, relatedTours = [], relatedPosts = [] }: { tour: CmsItem; relatedTours?: CmsItem[]; relatedPosts?: CmsItem[] }) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [selectedPriceIndex, setSelectedPriceIndex] = useState(0);
  const [travelerCount, setTravelerCount] = useState(2);
  const [bookingDate, setBookingDate] = useState<string>('');
  const [showPriceMenu, setShowPriceMenu] = useState(false);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [activeTabHref, setActiveTabHref] = useState<string>(tourDetailTabs[0][1]);
  const gallery = Array.from(new Set([tour.featuredImage, ...(tour.meta.gallery || [])].filter(Boolean)));
  const faq = tour.meta.faq || [];
  const itinerary = tour.meta.itinerary || [];
  const pricing = tour.meta.pricing || [];
  const details = tour.meta.details || {};
  const includes = readStringArray(details.includes);
  const excludes = readStringArray(details.excludes);
  const highlights = readStringArray(details.highlights);
  const places = readStringArray(details.places);
  const travelNotes = readStringArray(details.travelNotes);
  const sourceItineraryFacts = readSourceItineraryFacts(details.sourceItineraryFacts);
  const imageAttributions = readImageAttributions(details.imageAttributions);
  const parentHub = hubOrder.find((hub) => hub.key === tourHubKey(tour)) || hubOrder[hubOrder.length - 1];
  const route = readText(details.route, places.join(' - '));
  const routeStops = deriveRouteStops({ route, places, itinerary, title: tour.title, excerpt: tour.excerpt });
  const routeSummary = route || routeStops.join(' - ') || 'Route confirmed after consultation';
  const duration = readText(details.duration, 'Tailor-made');
  const style = readText(details.style, 'Private');
  const meals = readText(details.meals, 'Meals customized by itinerary');
  const transport = readText(details.transport, 'Airplane, car, cruise or local transport according to the confirmed itinerary');
  const accommodation = readText(details.accommodation, 'Hotel nights and room category are confirmed during quotation');
  const groupSize = readText(details.groupSize, 'Private group');
  const departure = readText(details.departure, "Upon customer's request");
  const theme = readText(details.theme, style);
  const suitable = readText(details.suitable, 'Couples, families and private groups');
  const tourType = readText(details.tourType, 'Private tour, Flexible group tour');
  const sourceUrl = readText(details.sourceUrl);
  const sourceName = readText(details.sourceName, 'Public source');
  const sourceCompliance = readText(details.sourceCompliance, 'Public factual fields are used as planning references; original copy and third-party media are not copied.');
  const sourceFacts = readStringArray(details.sourceFacts);
  const importantNotes = readImportantNotes(details, travelNotes, routeStops);
  const rating = readText(details.reviewRating) || readText(details.rating) || '9.5';
  const reviewCount = readText(details.reviewCount, 'Guest reviews');
  const score = numericScore(rating);
  const price = pricing[0]?.price || 'Price on request';
  const previousPrice = oldPrice(details, pricing[0]);
  const compactPrice = formatPrice(price);
  const safePriceIndex = pricing.length ? Math.min(selectedPriceIndex, pricing.length - 1) : 0;
  const selectedPriceRow = pricing[safePriceIndex];
  const selectedPriceText = formatPrice(selectedPriceRow?.price || price);
  const selectedPriceAmount = extractUsdAmount(selectedPriceText);
  const estimatedTotal = selectedPriceAmount ? `US $${Math.round(selectedPriceAmount * travelerCount).toLocaleString('en-US')}` : 'Private quote';
  const normalizedStyle = style.toLowerCase();
  const isKySonExperience = /ky son/i.test(`${tour.title} ${routeSummary}`);
  const curatedHeroImages = [
    isKySonExperience || normalizedStyle.includes('culinary') ? '/images/trip-styles/culinary-journeys-4k.jpg' : '',
    isKySonExperience || /herbal|healing|wellness/i.test(`${tour.title} ${theme}`) ? '/images/trip-styles/wellness-spa-4k.jpg' : '',
    normalizedStyle.includes('adventure') ? '/images/trip-styles/adventure-vacations-4k.jpg' : '',
    normalizedStyle.includes('culture') ? '/images/trip-styles/culture-heritage-4k.jpg' : ''
  ].filter(Boolean);
  const visualGallery = Array.from(new Set([...curatedHeroImages, ...gallery])).filter(Boolean);
  const heroImage = visualGallery[0] || gallery[0];
  const introLead = isKySonExperience
    ? 'A sculpted private day around Ky Son is designed for real village rhythm: easy cycling through quiet lanes, a local cooking table and a restorative herbal wellness close. Every detail is held in place with private support, clear pacing and on-demand logistics.'
    : `${duration} private ${theme.toLowerCase()} journey through ${routeSummary}. The route is shaped around clear pacing, trusted local guidance and enough flexibility to adjust hotels, transfers and touring style before quote.`;
  const accommodationGallery = gallery.slice(1, 4).length ? gallery.slice(1, 4) : gallery.slice(0, 3);
  const experienceFeatures = isKySonExperience
    ? [
        { icon: <Compass />, title: 'Village biking', body: 'Easy lanes, local stops and a private guide pacing the ride around the group.' },
        { icon: <Utensils />, title: 'Hosted cooking table', body: 'A calmer kitchen moment built around regional recipes and a relaxed lunch rhythm.' },
        { icon: <Leaf />, title: 'Herbal recovery', body: 'A restorative wellness close, planned so the day ends soft rather than rushed.' },
        { icon: <Bus />, title: 'Concierge transfers', body: 'Door-to-door timing checked against hotel base, weather and your preferred start.' }
      ]
    : [
        { icon: <Compass />, title: 'Route logic', body: routeStops.length ? routeStops.slice(0, 3).join(' to ') : routeSummary },
        { icon: <Utensils />, title: 'Food rhythm', body: meals },
        { icon: <BedDouble />, title: 'Comfort layer', body: accommodation },
        { icon: <HeartHandshake />, title: 'Private support', body: 'A travel designer adjusts guide, hotel and transfer choices before quote.' }
      ];
  const bookingAssurances = [
    'Private quote checked before payment',
    'Hotel pickup timing adjusted around your base',
    'No copied media or third-party branded layout',
    'Human travel designer reviews the final plan'
  ];
  const mapsEmbedSrc = extractGoogleMapsEmbedSrc(details.googleMapsEmbed) || buildGoogleMapsEmbedSrcFromStops(routeStops);
  const heroSlides = visualGallery.length ? visualGallery : [heroImage].filter(Boolean) as string[];

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const id = window.setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [heroSlides.length]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sectionEls: { href: string; el: HTMLElement }[] = [];
    tourDetailTabs.forEach(([, href]) => {
      const el = document.querySelector(href);
      if (el instanceof HTMLElement) sectionEls.push({ href, el });
    });
    if (!sectionEls.length) return;

    // Sticky header (~112px) + tab bar (~80px) = 192px. Probe just below the bar.
    const PROBE_OFFSET = 200;
    let rafId = 0;
    const evaluate = () => {
      rafId = 0;
      let current = sectionEls[0].href;
      for (const { href, el } of sectionEls) {
        const rect = el.getBoundingClientRect();
        if (rect.top - PROBE_OFFSET <= 0) {
          current = href;
        } else {
          break;
        }
      }
      setActiveTabHref((prev) => (prev === current ? prev : current));
    };
    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(evaluate);
    };
    evaluate();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <main className="bg-[oklch(98.7%_0.012_86)] text-navy">
      <section className="tour-dossier-hero relative isolate overflow-hidden bg-[#081522] pt-[96px] text-pearl md:pt-[108px]">
        {/* Rotating hero background spanning the entire hero section (incl. thumbnail strip) */}
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          {heroSlides.map((image, index) => (
            <div
              key={`hero-slide-${image}-${index}`}
              className={`absolute inset-0 transition-opacity duration-[1400ms] ease-in-out ${index === heroSlideIndex ? 'opacity-100' : 'opacity-0'}`}
            >
              <SafeTourImage
                src={image}
                fallbackSrcs={tourImageFallbacks(tour, image)}
                alt=""
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover brightness-[0.9] saturate-[1.06] [object-position:50%_52%]"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,17,31,0.94)_0%,rgba(7,17,31,0.74)_42%,rgba(7,17,31,0.32)_72%,rgba(7,17,31,0.14)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,31,0.28)_0%,rgba(7,17,31,0.06)_38%,rgba(7,17,31,0.55)_82%,rgba(7,17,31,0.78)_100%)]" />
        </div>

        <div className="relative z-10">
          <div className="relative flex h-auto min-h-[600px] flex-col md:min-h-[680px]">
            <Container width="page" className="relative flex h-full flex-col justify-between gap-10 py-7 md:gap-12 md:py-9">
              <nav aria-label="Breadcrumb" className="inline-flex w-fit flex-wrap items-center gap-2 rounded-full border border-pearl/18 bg-[#07111f]/55 px-4 py-2 text-[12px] font-extrabold text-pearl/80 shadow-[0_12px_34px_rgba(0,0,0,0.18)] backdrop-blur-md">
                <Link href="/" className="transition hover:text-gold">Home</Link>
                <span className="text-gold/70">/</span>
                <Link href={hubPath(parentHub.key)} className="transition hover:text-gold">{parentHub.label}</Link>
                <span className="text-gold/70">/</span>
                <span className="text-pearl">{style}</span>
              </nav>

              <div className="max-w-[1000px]">
                <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                  <span className="text-[20px] font-black uppercase tracking-[0.10em] text-gold drop-shadow-[0_2px_12px_rgba(212,175,55,0.4)]">Route dossier</span>
                  <span className="text-[20px] font-black uppercase tracking-[0.08em] text-gold/90 drop-shadow-[0_2px_12px_rgba(212,175,55,0.25)]">Private countryside day</span>
                  <span className="text-[20px] font-black uppercase tracking-[0.08em] text-pearl drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]">{duration}</span>
                  <span className="text-[20px] font-black uppercase tracking-[0.08em] text-pearl drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]">{theme}</span>
                </div>
                <h1 className="mt-10 max-w-[920px] font-serif text-[clamp(2.8rem,5.5vw,5.8rem)] font-extrabold leading-[0.94] tracking-[-0.055em] text-pearl drop-shadow-[0_18px_44px_rgba(0,0,0,0.34)]">
                  {tour.meta.seo?.h1 || tour.title}
                </h1>
                <p className="mt-10 max-w-[760px] text-[clamp(1rem,1.4vw,1.26rem)] font-semibold leading-[1.82] text-pearl/88">
                  {introLead}
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4">
                  <span className="inline-flex items-center gap-3 text-[18px] font-black text-pearl drop-shadow-[0_2px_8px_rgba(255,255,255,0.12)]">
                    <Star className="h-5 w-5 fill-gold text-gold-dark" />
                    <span>{score ? score.toFixed(1) : rating} Excellent</span>
                  </span>
                  <span className="text-[18px] font-black text-pearl/80">{reviewCount}</span>
                  <span className="text-[18px] font-black text-gold drop-shadow-[0_2px_12px_rgba(212,175,55,0.3)]">Quote adjusted before confirmation</span>
                </div>

                <div className="mt-10 flex flex-wrap gap-5">
                  <HeroInfoPill icon={<Clock3 />} label={duration} />
                  <HeroInfoPill icon={<MapPin />} label={routeSummary} />
                  <HeroInfoPill icon={<Users />} label={groupSize} />
                  <HeroInfoPill icon={<ShieldCheck />} label="Concierge reviewed" />
                </div>
              </div>
            </Container>
          </div>

          {/* Bottom strip - keep image visible through a very light wash */}
          <div className="relative border-t border-pearl/10 bg-gradient-to-b from-[#07111f]/15 via-[#07111f]/22 to-[#07111f]/35 px-4 py-6 backdrop-blur-[2px] md:py-7">
            <Container width="page" className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="flex gap-5 overflow-x-auto no-scrollbar md:gap-6">
                {visualGallery.slice(1, 6).map((image, index) => (
                  <button
                    key={`${image}-strip-${index}`}
                    type="button"
                    onClick={() => setLightboxImage(image)}
                    className="group relative h-[88px] min-w-[132px] overflow-hidden rounded-[14px] border border-pearl/14 bg-pearl/8 shadow-[0_18px_36px_rgba(0,0,0,0.28)] transition duration-300 hover:border-gold/70"
                  >
                    <SafeTourImage src={image} fallbackSrcs={tourImageFallbacks(tour, image)} alt={`${tour.title} gallery ${index + 2}`} fill sizes="160px" className="object-cover brightness-[0.96] saturate-[1.08] transition duration-500 group-hover:scale-105" />
                  </button>
                ))}
                <button type="button" onClick={() => setLightboxImage(heroImage)} className="grid h-[88px] min-w-[132px] place-items-center rounded-[14px] border border-gold/35 bg-gold/14 px-5 text-center text-[10px] font-black uppercase tracking-[0.16em] text-gold transition hover:bg-gold hover:text-navy">
                  View photos
                </button>
              </div>
              <div className="flex items-center gap-4 rounded-[22px] bg-[#07111f]/55 p-3.5 text-pearl shadow-[0_18px_42px_rgba(0,0,0,0.28)] backdrop-blur-md">
                <HeroMiniStat value={String(routeStops.length || 1)} label="Stops" />
                <HeroMiniStat value={duration} label="Pace" />
                <HeroMiniStat value={compactPrice.replace(/^US\s*/i, '')} label="From" />
              </div>
            </Container>
          </div>
        </div>
      </section>

      <div className="sticky top-[112px] z-40 border-y border-navy/10 bg-[oklch(99%_0.006_86)]/95 shadow-[0_10px_28px_rgba(11,27,43,0.06)] backdrop-blur">
        <Container width="page" className="flex min-h-[80px] items-center justify-between gap-5 overflow-x-auto no-scrollbar py-3">
          <nav className="flex min-w-max items-center gap-2" aria-label="Tour detail sections">
            {tourDetailTabs.map(([label, href]) => {
              const isActive = activeTabHref === href;
              return (
                <a
                  key={href}
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTabHref(href);
                    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative whitespace-nowrap rounded-full px-6 py-3 text-[16px] font-black tracking-[-0.01em] transition duration-300 ${
                    isActive
                      ? 'bg-[linear-gradient(135deg,#0b1b2b_0%,#1a3454_100%)] text-gold shadow-[0_10px_28px_rgba(11,27,43,0.30)]'
                      : 'text-navy/60 hover:bg-[#fffaf3] hover:text-gold-dark'
                  }`}
                >
                  {label}
                  {isActive && (
                    <span aria-hidden="true" className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_12px_rgba(200,169,106,0.8)]" />
                  )}
                </a>
              );
            })}
          </nav>
          <div className="flex shrink-0 items-center gap-4">
            <span className="hidden text-[14px] text-navy/60 sm:inline">
              from <strong className="text-[1.25rem] font-black text-navy">{selectedPriceText}</strong>
            </span>
            <a
              href="#booking"
              onClick={(e) => { e.preventDefault(); document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
              className="rounded-full bg-[linear-gradient(135deg,#c8a96a_0%,#a88440_100%)] px-6 py-3 text-[13px] font-black uppercase tracking-[0.16em] text-navy shadow-[0_10px_28px_rgba(200,169,106,0.45)] transition hover:brightness-105"
            >
              Plan this tour →
            </a>
          </div>
        </Container>
      </div>

      {/* â”€â”€ Overview â”€â”€ */}
      <section id="overview" className="scroll-mt-[158px] bg-[#f9f6f0] pb-20 pt-6">
        <Container width="page">
          <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
            <div className="space-y-16">
              {/* Editorial intro */}
              <div>
                <p className="text-[12px] font-black uppercase tracking-[0.28em] text-gold-dark">Tour Overview</p>
                <h2 className="mt-6 font-serif text-[clamp(2.2rem,3.6vw,3.2rem)] font-extrabold leading-[1.08] tracking-[-0.035em] text-navy">{tour.meta.seo?.h1 || tour.title}</h2>
                <p className="mt-7 max-w-[72ch] text-[17px] font-medium leading-[1.85] text-navy/70">{introLead}</p>
              </div>

              {/* Stats row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  background: '#ffffff',
                  border: '1px solid #ede8e0',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
                }}
              >
                {[
                  { label: 'Duration', value: duration, sub: 'Private pacing' },
                  { label: 'Group Size', value: groupSize, sub: 'Private available' },
                  { label: 'Destinations', value: routeStops.length ? `${routeStops.length} Stops` : 'Custom route', sub: (routeStops.slice(0, 2).join(' to ') || routeSummary.slice(0, 28)) || 'Tailor-made route' },
                  { label: 'Travel Style', value: style, sub: 'Fully customised' },
                ].map((stat, idx) => (
                  <div key={stat.label} style={{ padding: '28px 32px', borderRight: idx < 3 ? '1px solid #ede8e0' : 'none' }}>
                    <p style={{ fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: 700, color: '#b8935a', margin: '0 0 14px' }}>{stat.label}</p>
                    <p style={{ fontSize: 'clamp(1.35rem, 2vw, 1.75rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em', color: '#0d1f35', margin: '0 0 8px', fontFamily: "'Georgia', serif" }}>{stat.value}</p>
                    <p style={{ fontSize: '13.5px', fontWeight: 500, lineHeight: 1.5, color: 'rgba(13,31,53,0.5)', margin: 0, fontFamily: 'sans-serif' }}>{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Tour features section */}
              <div
                style={{
                  position: 'relative',
                  left: '50%',
                  width: '100vw',
                  marginLeft: '-50vw',
                  minHeight: 'min(820px, 100vh)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '80px 24px',
                  background: '#f9f6f0'
                }}
              >
                <div style={{ width: '100%', maxWidth: '56rem' }}>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    style={{ marginBottom: '56px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                      <div style={{ height: '1px', width: '24px', background: '#c9a961' }} />
                      <p
                        style={{
                          margin: 0,
                          color: '#c9a961',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          letterSpacing: '0.22em',
                          textTransform: 'uppercase',
                          fontFamily: jost.style.fontFamily
                        }}
                      >
                        What is included in the experience
                      </p>
                    </div>
                    <h3
                      style={{
                        margin: 0,
                        color: '#0a1628',
                        fontSize: 'clamp(3rem, 7vw, 3.75rem)',
                        fontWeight: 300,
                        lineHeight: 1.1,
                        fontFamily: cormorantGaramond.style.fontFamily
                      }}
                    >
                      Tour{' '}
                      <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'rgba(10, 22, 40, 0.75)' }}>features</em>
                    </h3>
                  </motion.div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
                      gap: '20px'
                    }}
                  >
                    {experienceFeatures.map((item, index) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.25 }}
                        transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                        className="group"
                        style={{
                          position: 'relative',
                          background: '#ffffff',
                          borderRadius: '1rem',
                          padding: '32px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '20px',
                          border: '1px solid #e8e2d8',
                          boxShadow: '0 2px 24px rgba(10,22,40,0.06)',
                          transition: 'transform 500ms cubic-bezier(0.22,1,0.36,1), box-shadow 500ms cubic-bezier(0.22,1,0.36,1)',
                          overflow: 'hidden',
                          minHeight: '292px'
                        }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.transform = 'translateY(-4px)';
                          event.currentTarget.style.boxShadow = '0 8px 40px rgba(10,22,40,0.13)';
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.transform = 'translateY(0)';
                          event.currentTarget.style.boxShadow = '0 2px 24px rgba(10,22,40,0.06)';
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: '32px',
                            right: '32px',
                            height: '2px',
                            background: 'linear-gradient(90deg, transparent, #c9a961, transparent)',
                            opacity: 0,
                            transition: 'opacity 500ms ease'
                          }}
                          className="group-hover:opacity-100"
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '999px',
                              background: '#f5f0e8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid #e8e2d8',
                              transition: 'background 400ms ease, border-color 400ms ease'
                            }}
                          >
                            <span className="text-[#c9a961] transition-transform duration-300 group-hover:scale-110 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:stroke-[1.5]">
                              {item.icon}
                            </span>
                          </div>
                        </div>
                        <h4
                          style={{
                            margin: 0,
                            color: '#0a1628',
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            lineHeight: 1.25,
                            fontFamily: cormorantGaramond.style.fontFamily
                          }}
                        >
                          {item.title}
                        </h4>
                        <div style={{ width: '32px', height: '1px', background: '#c9a961', opacity: 0.6 }} />
                        <p
                          style={{
                            margin: 0,
                            color: '#4a5568',
                            fontSize: '0.925rem',
                            lineHeight: 1.625,
                            fontWeight: 300,
                            fontFamily: jost.style.fontFamily
                          }}
                        >
                          {item.body}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom info grid - editorial flat layout */}
              <div className="-mx-4 rounded-[20px] bg-[#efeae0]/70 px-10 py-12 md:-mx-6 lg:mx-0">
                <div className="grid grid-cols-1 gap-x-12 gap-y-9 md:grid-cols-2 xl:grid-cols-3">
                  <FlatInfo icon={<CalendarDays />} label="Departure" value={departure} />
                  <FlatInfo icon={<MapPin />} label="Route" value={`${routeStops.length || 1} stop: ${routeStops.slice(0, 4).join(', ') || routeSummary}`} />
                  <FlatInfo icon={<Utensils />} label="Category" value={style} />
                  <FlatInfo icon={<Users />} label="Suitable" value={suitable} />
                  <FlatInfo icon={<Compass />} label="Theme" value={theme} />
                  <FlatInfo icon={<BadgePercent />} label="Type" value={tourType} />
                </div>
              </div>
            </div>
            <div className="lg:sticky lg:top-[176px]">
              <div
                style={{
                  width: '100%',
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 48px rgba(0,0,0,0.18)',
                }}
              >
                {/* ── 1. Header ── */}
                <div style={{ background: 'linear-gradient(160deg, #0d1f35 0%, #122840 100%)', padding: '28px 28px 24px' }}>
                  <p style={{ color: '#c9a96e', fontSize: '9px', letterSpacing: '0.26em', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '8px', fontWeight: 900 }}>Journey Route</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ color: '#f5f0e8', fontSize: '22px', fontWeight: 700, margin: 0 }}>{routeStops.length || 1} {(routeStops.length || 1) > 1 ? 'destinations' : 'destination'}</h2>
                    <span style={{ background: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.4)', color: '#c9a96e', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'sans-serif', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 }}>Private</span>
                  </div>
                </div>

                {/* ── 2. Price ── */}
                {compactPrice && (
                  <div style={{ padding: '28px 28px 24px', borderBottom: '1px solid rgba(11,27,43,0.08)', background: '#fff' }}>
                    <p style={{ color: '#c9a96e', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: 900, marginBottom: '8px' }}>From</p>
                    <p style={{ fontSize: '38px', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em', color: '#0b1b2b', margin: 0 }}>{compactPrice}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                      <p style={{ fontSize: '13px', color: 'rgba(11,27,43,0.5)', fontFamily: 'sans-serif', margin: 0 }}>per person, private quote</p>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', border: '1px solid rgba(18,135,94,0.3)', borderRadius: '20px', padding: '5px 12px', fontSize: '11px', fontWeight: 700, color: '#12875e', fontFamily: 'sans-serif' }}>
                        <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                        Best price
                      </span>
                    </div>
                  </div>
                )}

                {/* ── 3. Route timeline ── */}
                <div style={{ padding: '28px', background: '#fff' }}>
                  {(routeStops.length ? routeStops : [routeSummary]).slice(0, 8).map((stop, idx, arr) => {
                    const isFirst = idx === 0;
                    const isLast = idx === arr.length - 1;
                    return (
                      <div key={`${stop}-${idx}`} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                        {/* Dot & line */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12px' }}>
                          <span style={{
                            width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0, marginTop: '4px',
                            background: isFirst ? '#c9a96e' : isLast ? '#0b1b2b' : 'rgba(201,169,110,0.5)',
                          }} />
                          {!isLast && (
                            <span style={{ width: '2px', flex: 1, background: 'rgba(11,27,43,0.12)', marginTop: '4px', marginBottom: '4px' }} />
                          )}
                        </div>
                        {/* Content */}
                        <div style={{ flex: 1, paddingBottom: isLast ? 0 : '28px' }}>
                          <p style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: 900, color: '#c9a96e', margin: 0 }}>
                            {isFirst ? 'Start' : isLast ? 'Finish' : `Stop ${idx + 1}`}
                          </p>
                          <p style={{ fontSize: '18px', fontWeight: 700, color: '#0b1b2b', margin: '4px 0 0', letterSpacing: '-0.02em' }}>{stop}</p>
                          <p style={{ fontSize: '12px', color: 'rgba(11,27,43,0.45)', fontFamily: 'sans-serif', margin: '4px 0 0' }}>
                            {isFirst ? 'Pickup at hotel base' : isLast ? 'Drop off & farewell' : `Day ${idx + 1}–${idx + 2}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── 4. Quick facts 2×2 grid ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid rgba(11,27,43,0.08)', borderBottom: '1px solid rgba(11,27,43,0.08)', background: '#fff' }}>
                  <div style={{ padding: '20px 28px', borderRight: '1px solid rgba(11,27,43,0.08)', borderBottom: '1px solid rgba(11,27,43,0.08)' }}>
                    <p style={{ fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: 900, color: '#c9a96e', margin: 0 }}>Departure</p>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#0b1b2b', margin: '8px 0 0', lineHeight: 1.4 }}>{departure}</p>
                  </div>
                  <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(11,27,43,0.08)' }}>
                    <p style={{ fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: 900, color: '#c9a96e', margin: 0 }}>Theme</p>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#0b1b2b', margin: '8px 0 0', lineHeight: 1.4 }}>{theme}</p>
                  </div>
                  <div style={{ padding: '20px 28px', borderRight: '1px solid rgba(11,27,43,0.08)' }}>
                    <p style={{ fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: 900, color: '#c9a96e', margin: 0 }}>Suitable</p>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#0b1b2b', margin: '8px 0 0', lineHeight: 1.4 }}>{suitable}</p>
                  </div>
                  <div style={{ padding: '20px 28px' }}>
                    <p style={{ fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: 900, color: '#c9a96e', margin: 0 }}>Tour type</p>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#0b1b2b', margin: '8px 0 0', lineHeight: 1.4 }}>{tourType}</p>
                  </div>
                </div>

                {/* ── 5. Booking assurance ── */}
                <div style={{ padding: '28px', borderBottom: '1px solid rgba(11,27,43,0.08)', background: '#fff' }}>
                  <p style={{ fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: 900, color: '#c9a96e', margin: '0 0 20px' }}>Booking Assurance</p>
                  {bookingAssurances.map((line) => (
                    <div key={line} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                      <CheckCircle2 style={{ width: '20px', height: '20px', flexShrink: 0, color: '#c9a96e', marginTop: '1px' }} />
                      <span style={{ fontSize: '14px', fontFamily: 'sans-serif', fontWeight: 500, lineHeight: 1.55, color: 'rgba(11,27,43,0.7)' }}>{line}</span>
                    </div>
                  ))}
                </div>

                {/* ── 6. Trust badges 2×2 ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', padding: '24px 28px', borderBottom: '1px solid rgba(11,27,43,0.08)', background: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Star style={{ width: '18px', height: '18px', color: 'rgba(11,27,43,0.4)' }} />
                    <span style={{ fontSize: '13px', fontFamily: 'sans-serif', fontWeight: 500, color: 'rgba(11,27,43,0.6)' }}>9.5 avg rating</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock style={{ width: '18px', height: '18px', color: 'rgba(11,27,43,0.4)' }} />
                    <span style={{ fontSize: '13px', fontFamily: 'sans-serif', fontWeight: 500, color: 'rgba(11,27,43,0.6)' }}>24/7 support</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lock style={{ width: '18px', height: '18px', color: 'rgba(11,27,43,0.4)' }} />
                    <span style={{ fontSize: '13px', fontFamily: 'sans-serif', fontWeight: 500, color: 'rgba(11,27,43,0.6)' }}>Secure quote</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BadgeCheck style={{ width: '18px', height: '18px', color: 'rgba(11,27,43,0.4)' }} />
                    <span style={{ fontSize: '13px', fontFamily: 'sans-serif', fontWeight: 500, color: 'rgba(11,27,43,0.6)' }}>Best price</span>
                  </div>
                </div>

                {/* ── 7. CTAs ── */}
                <div style={{ padding: '24px 28px', background: '#fff', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <a
                    href="#booking"
                    onClick={(e) => { e.preventDefault(); document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      height: '54px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                      background: 'linear-gradient(135deg, #c8a96a 0%, #a88440 100%)',
                      fontFamily: 'sans-serif', fontSize: '13px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase' as const,
                      color: '#0b1b2b', textDecoration: 'none',
                      boxShadow: '0 14px 32px rgba(200,169,106,0.45)',
                    }}
                  >
                    <Sparkles style={{ width: '16px', height: '16px' }} />
                    Plan this tour
                  </a>
                  <Link
                    href="/customize-your-trip/"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      height: '50px', borderRadius: '999px', cursor: 'pointer',
                      background: '#fff', border: '2px solid #0b1b2b',
                      fontFamily: 'sans-serif', fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em',
                      color: '#0b1b2b', textDecoration: 'none',
                    }}
                  >
                    Customize This Route
                  </Link>
                </div>

                {/* ── 8. Contact footer ── */}
                <div style={{ background: 'linear-gradient(160deg, #0d1f35 0%, #122840 100%)', padding: '32px 28px', textAlign: 'center' }}>
                  <p style={{ fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: 900, color: '#c9a96e', margin: 0 }}>Talk to us instantly</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '20px' }}>
                    <a href="tel:+842435566655" aria-label="Call us" title="Call us" style={{ display: 'grid', placeItems: 'center', width: '48px', height: '48px', borderRadius: '50%', border: '1px solid rgba(245,240,232,0.25)', background: 'rgba(245,240,232,0.05)', color: 'rgba(245,240,232,0.8)', textDecoration: 'none' }}>
                      <Phone style={{ width: '18px', height: '18px' }} />
                    </a>
                    <a href="https://wa.me/842435566655" target="_blank" rel="noopener noreferrer" aria-label="Chat" title="Chat" style={{ display: 'grid', placeItems: 'center', width: '48px', height: '48px', borderRadius: '50%', border: '1px solid rgba(245,240,232,0.25)', background: 'rgba(245,240,232,0.05)', color: 'rgba(245,240,232,0.8)', textDecoration: 'none' }}>
                      <MessageCircle style={{ width: '18px', height: '18px' }} />
                    </a>
                    <a href="mailto:concierge@luxurytravel.example" aria-label="Email" title="Email" style={{ display: 'grid', placeItems: 'center', width: '48px', height: '48px', borderRadius: '50%', border: '1px solid rgba(245,240,232,0.25)', background: 'rgba(245,240,232,0.05)', color: 'rgba(245,240,232,0.8)', textDecoration: 'none' }}>
                      <Mail style={{ width: '18px', height: '18px' }} />
                    </a>
                    <a href="https://m.me/yourpage" target="_blank" rel="noopener noreferrer" aria-label="Messenger" title="Messenger" style={{ display: 'grid', placeItems: 'center', width: '48px', height: '48px', borderRadius: '50%', border: '1px solid rgba(245,240,232,0.25)', background: 'rgba(245,240,232,0.05)', color: 'rgba(245,240,232,0.8)', textDecoration: 'none' }}>
                      <MessageCircle style={{ width: '18px', height: '18px' }} />
                    </a>
                  </div>
                  <p style={{ fontSize: '11px', fontFamily: 'sans-serif', fontWeight: 600, color: 'rgba(201,169,110,0.6)', marginTop: '20px' }}>7 days a week · English &amp; Vietnamese</p>
                </div>

              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* â”€â”€ Highlights â”€â”€ */}
      {highlights.length > 0 && (
        <section id="highlights" className="scroll-mt-[158px] bg-[#f9f6f0] py-20">
          <Container width="page">
            <p className="text-[12px] font-black uppercase tracking-[0.28em] text-gold-dark">Tour Highlights</p>
            <h2 className="mt-8 font-serif text-[clamp(2.4rem,4.6vw,4.2rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-navy">
              {highlights.length >= 5 ? 'Unmissable Experiences' : 'Key Tour Highlights'}
            </h2>
            <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-2">
              {highlights.slice(0, 8).map((item, index) => (
                <div
                  key={item}
                  className={`group flex min-h-[120px] cursor-default items-center gap-6 rounded-[20px] bg-white px-8 py-8 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-gold/60 hover:shadow-[0_24px_56px_rgba(200,169,106,0.22)] ${
                    index === 0 ? 'border-2 border-gold/50 shadow-[0_12px_32px_rgba(200,169,106,0.18)]' : 'border border-navy/8 shadow-[0_6px_18px_rgba(11,27,43,0.04)]'
                  }`}
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-[#12875e]/30 bg-[#e9f6ee] text-[#12875e] transition-all duration-500 group-hover:scale-110 group-hover:border-gold/50 group-hover:bg-gold/12 group-hover:text-gold-dark group-hover:shadow-[0_8px_20px_rgba(200,169,106,0.30)]">
                    <CheckCircle2 className="h-6 w-6 transition-transform duration-500 group-hover:rotate-12" strokeWidth={2} />
                  </span>
                  <span className="text-[17px] font-semibold leading-[1.6] text-navy/80 transition-colors duration-500 group-hover:text-navy">{item}</span>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* â”€â”€ Itinerary â”€â”€ */}
      <section id="itinerary" className="scroll-mt-[158px] bg-[#f9f6f0] py-14">
        <Container width="page">
          <p className="text-[11px] font-black uppercase tracking-[0.26em] text-gold-dark">Day by Day</p>
          <h2 className="mt-4 font-serif text-[clamp(1.8rem,3.2vw,2.8rem)] font-extrabold tracking-[-0.04em] text-navy">
            {itinerary.length > 0 ? `${itinerary.length}-Day Itinerary` : 'Journey Itinerary'}
          </h2>
          <p className="mt-3 text-[15px] font-semibold text-navy/54">Click any day to see full details. All timings are approximate and can be adjusted before quote.</p>
          {mapsEmbedSrc && (
            <div className="mt-8 overflow-hidden rounded-[28px] border border-navy/10 shadow-[0_18px_54px_rgba(11,27,43,0.12)]">
              <iframe
                src={mapsEmbedSrc}
                width="100%"
                height="420"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Route map for ${tour.title}`}
                className="block w-full"
              />
            </div>
          )}
          <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", marginTop: '40px' }}>
            <div style={{ marginBottom: '48px' }}>
              {itinerary.map((day, index) => (
                <ItineraryDayCard key={`${day.day}-${index}`} day={day} dayFacts={sourceItineraryFacts[index]} index={index} isLast={index === itinerary.length - 1} />
              ))}
            </div>
          </div>
          {/* Price Bar */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0d1f35 0%, #122840 100%)',
              borderRadius: '16px',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 8px 40px rgba(13,31,53,0.22)',
              gap: '24px',
              marginBottom: '32px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ color: 'rgba(201,169,110,0.7)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>from</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ color: '#f5f0e8', fontSize: '28px', fontWeight: 800, fontFamily: "'Georgia', serif", letterSpacing: '-0.02em', lineHeight: 1 }}>{compactPrice}</span>
                <span style={{ color: 'rgba(245,240,232,0.45)', fontSize: '11px', fontFamily: 'sans-serif' }}>/ person</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '30px', border: '1px solid rgba(201,169,110,0.15)', flexShrink: 0 }}>
              <Shield size={12} color="#c9a96e" strokeWidth={1.8} />
              <span style={{ color: 'rgba(201,169,110,0.85)', fontSize: '10px', fontFamily: 'sans-serif', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>Private quote</span>
            </div>
            <a
              href="#booking"
              onClick={(e) => { e.preventDefault(); document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '9px',
                background: 'linear-gradient(135deg, #c9a96e 0%, #a07840 100%)',
                color: '#0d1f35', border: 'none', borderRadius: '12px',
                padding: '13px 22px', fontSize: '12px', fontWeight: 800,
                fontFamily: 'sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase',
                cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(201,169,110,0.35)',
                flexShrink: 0,
              }}
            >
              Plan This Tour
              <ArrowRight size={14} strokeWidth={2.5} />
            </a>
          </div>

          {importantNotes.length > 0 && (
            <div style={{ background: '#faf8f4', border: '1px solid #ede8e0', borderRadius: '16px', padding: '32px 36px 36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
                <span style={{ color: '#b8935a', fontSize: '9px', letterSpacing: '0.26em', textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: 600 }}>Before Booking</span>
                <div style={{ flex: 1, height: '1px', background: '#e8e2d9' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 40px' }}>
                {importantNotes.map((note) => (
                  <div key={note} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c9a96e', flexShrink: 0, marginTop: '8px' }} />
                    <p style={{ color: '#5a5248', fontSize: '13.5px', fontFamily: 'sans-serif', lineHeight: '1.7', margin: 0 }}>{note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* â"€â"€ Included â"€â"€ */}
      <section id="included" className="scroll-mt-[158px] bg-[#f9f6f0] py-14">
        <Container width="page">
          <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>

            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
              <span style={{ display: 'block', color: '#b8935a', fontSize: '12px', fontWeight: 900, letterSpacing: '0.28em', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '14px' }}>What&apos;s Covered</span>
              <h2 style={{ color: '#0d1f35', fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Included &amp; Excluded</h2>
            </div>

            {/* Coverage Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {([
                { Icon: Utensils, label: 'Meals', value: meals },
                { Icon: Bus, label: 'Transport', value: transport || 'Airplane, car, cruise or local transport according to the confirmed itinerary' },
                { Icon: Hotel, label: 'Accommodation', value: accommodation || 'Hotel nights and room category are confirmed during quotation' },
              ] as { Icon: typeof Utensils; label: string; value: string }[]).map(({ Icon, label, value }) => (
                <div
                  key={label}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c9a96e'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,169,110,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#ede8e0'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  style={{ background: '#ffffff', border: '1px solid #ede8e0', borderRadius: '14px', padding: '20px 22px', transition: 'all 0.25s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: '#faf3e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={13} color="#b8935a" strokeWidth={1.8} />
                    </div>
                    <span style={{ color: '#b8935a', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: 600 }}>{label}</span>
                  </div>
                  <p style={{ color: '#2c2520', fontSize: '13px', fontFamily: 'sans-serif', lineHeight: '1.55', margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Included / Not Included */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '48px' }}>
              {/* Included */}
              <div
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(42,122,78,0.4)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(42,122,78,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#ede8e0'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                style={{ background: '#ffffff', border: '1px solid #ede8e0', borderRadius: '14px', padding: '24px 26px', transition: 'all 0.25s' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2a7a4e' }} />
                  <h3 style={{ color: '#0d1f35', fontSize: '15px', fontWeight: 700, margin: 0 }}>What&apos;s Included</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(includes.length ? includes : highlights).slice(0, 10).map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <CheckCircle2 size={14} color="#2a7a4e" strokeWidth={2} style={{ flexShrink: 0, marginTop: '1px' }} />
                      <span style={{ color: '#4a4540', fontSize: '13px', fontFamily: 'sans-serif', lineHeight: '1.55' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Not Included */}
              {excludes.length > 0 && (
                <div
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(192,57,43,0.35)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(192,57,43,0.06)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#ede8e0'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  style={{ background: '#ffffff', border: '1px solid #ede8e0', borderRadius: '14px', padding: '24px 26px', transition: 'all 0.25s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c0392b' }} />
                    <h3 style={{ color: '#0d1f35', fontSize: '15px', fontWeight: 700, margin: 0 }}>Not Included</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {excludes.slice(0, 10).map((item) => (
                      <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <XCircle size={14} color="#c0392b" strokeWidth={2} style={{ flexShrink: 0, marginTop: '1px' }} />
                        <span style={{ color: '#4a4540', fontSize: '13px', fontFamily: 'sans-serif', lineHeight: '1.55' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Choose Your Package */}
            {pricing.length > 0 && (
              <div>
                <div style={{ marginBottom: '6px' }}>
                  <h3 style={{ color: '#0d1f35', fontSize: '20px', fontWeight: 700, margin: '0 0 6px' }}>Choose Your Package</h3>
                  <p style={{ color: '#9a9080', fontSize: '12.5px', fontFamily: 'sans-serif', margin: 0 }}>All prices per person. Solo supplements and peak date pricing available.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '20px' }}>
                  {pricing.map((row, index) => {
                    const isSelected = index === safePriceIndex;
                    const rowOld = oldPrice(details, row);
                    const tierName = (row.tier || `Option ${index + 1}`).split('—')[0].split('–')[0].trim();
                    const tierSub = (row.tier || '').includes('—') ? (row.tier || '').split('—')[1].trim() : (row.tier || '').includes('–') ? (row.tier || '').split('–')[1].trim() : '';
                    return (
                      <div
                        key={`${row.tier}-${index}`}
                        onClick={() => setSelectedPriceIndex(index)}
                        style={{
                          borderRadius: '16px', padding: '22px 22px 20px', cursor: 'pointer', position: 'relative',
                          transition: 'all 0.25s',
                          background: isSelected ? 'linear-gradient(160deg, #0d1f35 0%, #122840 100%)' : '#ffffff',
                          border: isSelected ? '1px solid rgba(201,169,110,0.4)' : index === 1 ? '1px solid rgba(201,169,110,0.3)' : '1px solid #ede8e0',
                          boxShadow: isSelected ? '0 8px 40px rgba(13,31,53,0.2)' : '0 1px 6px rgba(0,0,0,0.04)',
                        }}
                      >
                        {index === 1 && (
                          <div style={{ position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)' }}>
                            <span style={{ background: 'linear-gradient(135deg, #c9a96e, #a07840)', color: '#0d1f35', fontSize: '8px', fontWeight: 800, fontFamily: 'sans-serif', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '0 0 8px 8px', display: 'block', whiteSpace: 'nowrap' }}>Most Popular</span>
                          </div>
                        )}
                        <p style={{ color: isSelected ? '#c9a96e' : '#b8935a', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '5px', marginTop: index === 1 ? '12px' : '0' }}>{tierName}</p>
                        {tierSub && <p style={{ color: isSelected ? 'rgba(245,240,232,0.7)' : '#7a7060', fontSize: '12.5px', fontFamily: 'sans-serif', marginBottom: '16px', lineHeight: '1.4' }}>{tierSub}</p>}
                        {rowOld && <p style={{ color: isSelected ? 'rgba(201,169,110,0.5)' : '#c0b8ae', fontSize: '11px', fontFamily: 'sans-serif', textDecoration: 'line-through', marginBottom: '4px' }}>{rowOld}</p>}
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                          <span style={{ color: isSelected ? '#f5f0e8' : '#0d1f35', fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>{formatPrice(row.price || price)}</span>
                        </div>
                        <p style={{ color: isSelected ? 'rgba(245,240,232,0.45)' : '#a89e92', fontSize: '11px', fontFamily: 'sans-serif', marginTop: '3px' }}>per person</p>
                        {isSelected && (
                          <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle2 size={13} color="#c9a96e" strokeWidth={2} />
                            <span style={{ color: '#c9a96e', fontSize: '10px', fontFamily: 'sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Selected</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </Container>
      </section>

      {/* â”€â”€ Gallery â”€â”€ */}
      <section id="gallery" className="scroll-mt-[158px] bg-[#f9f6f0] py-14">
        <Container width="page">
          <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>

            {/* Header */}
            <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <span style={{ display: 'block', color: '#b8935a', fontSize: '12px', fontWeight: 900, letterSpacing: '0.28em', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '14px' }}>Visual Preview</span>
                <h2 style={{ color: '#0d1f35', fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>See It Before You Go</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingBottom: '4px' }}>
                <Camera size={13} color="#b8935a" strokeWidth={1.8} />
                <span style={{ color: '#b8935a', fontSize: '11px', fontFamily: 'sans-serif', letterSpacing: '0.08em' }}>{visualGallery.length} photos</span>
              </div>
            </div>

            {/* Bento Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gridTemplateRows: '220px 220px',
                gap: '10px',
                gridTemplateAreas: '"a a a a a b b b b c c c" "d d d d e e e e e f f f"',
              }}
            >
              {visualGallery.slice(0, 6).map((image, index) => {
                const gridAreas = ['a', 'b', 'c', 'd', 'e', 'f'];
                const labels = [routeStops[0] || tour.title, '', '', '', '', ''];
                return (
                  <div
                    key={`gallery-${index}`}
                    onClick={() => setLightboxImage(image)}
                    className="group"
                    style={{ gridArea: gridAreas[index], borderRadius: '14px', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
                  >
                    <SafeTourImage
                      src={image}
                      fallbackSrcs={tourImageFallbacks(tour, image)}
                      alt={`${tour.title} photo ${index + 1}`}
                      fill
                      sizes="(min-width: 768px) 33vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,31,53,0.65) 0%, transparent 55%)', pointerEvents: 'none' }} />
                    {labels[index] && (
                      <div style={{ position: 'absolute', bottom: '16px', left: '18px', pointerEvents: 'none' }}>
                        <span style={{ color: '#f5f0e8', fontSize: '11px', fontFamily: 'sans-serif', fontWeight: 600, letterSpacing: '0.06em', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>{labels[index]}</span>
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: '12px', right: '12px', width: '6px', height: '6px', borderRadius: '50%', background: '#c9a96e', boxShadow: '0 0 8px rgba(201,169,110,0.6)' }} />
                  </div>
                );
              })}
            </div>

            {/* Footer note */}
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e8e2d9' }} />
              <span style={{ color: '#b8a898', fontSize: '11px', fontFamily: 'sans-serif', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>All imagery is original — no stock tour photos</span>
              <div style={{ flex: 1, height: '1px', background: '#e8e2d9' }} />
            </div>

          </div>
        </Container>
      </section>

      {/* â”€â”€ Reviews â”€â”€ */}
      <section id="reviews" className="scroll-mt-[158px] bg-white py-14">
        <Container width="page">
          <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
              <div>
                <span style={{ display: 'block', color: '#b8935a', fontSize: '12px', fontWeight: 900, letterSpacing: '0.28em', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '14px' }}>Guest Reviews</span>
                <h2 style={{ color: '#0d1f35', fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>What Our Guests Say</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '6px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#c9a96e" color="#c9a96e" strokeWidth={1.5} />)}
                </div>
                <span style={{ color: '#0d1f35', fontSize: '15px', fontWeight: 800, fontFamily: 'sans-serif' }}>{score ? score.toFixed(1) : rating}</span>
                <span style={{ color: '#a89e92', fontSize: '11px', fontFamily: 'sans-serif' }}>/ {reviewCount}</span>
              </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '32px' }}>
              {[
                { value: score ? score.toFixed(1) + '/5' : rating + '/5', label: 'Average Rating', sub: 'Guest verified reviews' },
                { value: '98%', label: 'Recommend Us', sub: 'To friends & family' },
                { value: '3,200+', label: 'Happy Travelers', sub: 'Since 2018' },
                { value: '12', label: 'Awards Won', sub: 'Regional & international' },
              ].map((s) => (
                <div key={s.label} style={{ background: '#ffffff', border: '1px solid #ede8e0', borderRadius: '12px', padding: '18px 20px' }}>
                  <p style={{ color: '#c9a96e', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.01em', marginBottom: '4px' }}>{s.value}</p>
                  <p style={{ color: '#0d1f35', fontSize: '12px', fontWeight: 700, fontFamily: 'sans-serif', marginBottom: '2px' }}>{s.label}</p>
                  <p style={{ color: '#a89e92', fontSize: '10.5px', fontFamily: 'sans-serif', margin: 0 }}>{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Review Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '48px' }}>
              {[
                { name: 'Sarah M.', country: 'Australia', date: 'March 2025', title: 'Genuinely one of the best travel days of my life', text: 'We did the cycling and cooking session as a couple celebrating our anniversary. The guide was warm, the pace was relaxed, and the farmhouse lunch felt completely authentic. Nothing felt staged.', tag: 'Couples' },
                { name: 'James T.', country: 'United Kingdom', date: 'January 2025', title: 'The herbal session at the end was unexpected magic', text: 'I booked this mostly for the cycling but the herbal wellness close at the end completely surprised me. Sitting outside with the foot soak after the ride, looking out over the garden — it\'s the kind of moment you don\'t plan for.', tag: 'Solo' },
                { name: 'Linh N.', country: 'Canada', date: 'February 2025', title: 'Private and personal — felt nothing like a group tour', text: 'As a Vietnamese-Canadian I was a bit nervous this would feel touristy. It didn\'t at all. The family we cooked with was genuinely hospitable, the herbs were real, and the guide spoke about the village with obvious pride.', tag: 'Family' },
                { name: 'Marco D.', country: 'Italy', date: 'April 2025', title: 'Seamless logistics, beautiful setting', text: 'The van pickup was on time, the bikes were in great condition, and every transition between activities felt smooth. My group of four had very different fitness levels and the guide adjusted the pace.', tag: 'Group' },
                { name: 'Emma K.', country: 'Germany', date: 'December 2024', title: 'Worth every cent — and then some', text: 'I compared four different Hanoi day tours before booking this one. The itinerary description was the most honest and specific I found. What was promised is exactly what was delivered.', tag: 'Solo' },
                { name: 'David C.', country: 'USA', date: 'November 2024', title: 'Took my parents — best decision of the trip', text: 'My parents are in their 60s and I wasn\'t sure about the cycling. Completely unnecessary worry — the lanes are flat and gentle and the guide made my mom feel completely at ease.', tag: 'Family' },
              ].map((r) => (
                <div
                  key={r.name}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c9a96e'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(201,169,110,0.12)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#ede8e0'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  style={{ background: '#ffffff', border: '1px solid #ede8e0', borderRadius: '14px', padding: '22px 22px 20px', display: 'flex', flexDirection: 'column', gap: '14px', transition: 'all 0.25s', cursor: 'default' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a2e45, #0d1f35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9a96e', fontSize: '14px', fontWeight: 800, fontFamily: 'sans-serif', flexShrink: 0, border: '2px solid #ede8e0' }}>{r.name.charAt(0)}</div>
                      <div>
                        <p style={{ color: '#0d1f35', fontSize: '13px', fontWeight: 700, fontFamily: 'sans-serif', margin: 0 }}>{r.name}</p>
                        <p style={{ color: '#a89e92', fontSize: '10.5px', fontFamily: 'sans-serif', margin: 0 }}>{r.country}</p>
                      </div>
                    </div>
                    <Quote size={16} color="#e8e2d9" strokeWidth={1.5} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>{[1,2,3,4,5].map(i => <Star key={i} size={12} fill="#c9a96e" color="#c9a96e" strokeWidth={1.5} />)}</div>
                    <span style={{ color: '#c0b8ae', fontSize: '10px', fontFamily: 'sans-serif' }}>{r.date}</span>
                  </div>
                  <div>
                    <p style={{ color: '#0d1f35', fontSize: '12.5px', fontWeight: 700, fontFamily: 'sans-serif', marginBottom: '6px', lineHeight: 1.4 }}>{r.title}</p>
                    <p style={{ color: '#6a6258', fontSize: '12px', fontFamily: 'sans-serif', lineHeight: '1.65', margin: 0 }}>{r.text}</p>
                  </div>
                  <div>
                    <span style={{ background: '#faf3e8', color: '#b8935a', fontSize: '9px', fontFamily: 'sans-serif', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '20px', border: '1px solid #ede8df' }}>{r.tag}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ */}
            {faq.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <h3 style={{ color: '#0d1f35', fontSize: '18px', fontWeight: 700, margin: 0 }}>Common Questions</h3>
                  <div style={{ flex: 1, height: '1px', background: '#e8e2d9' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {faq.map((f) => (
                    <FaqAccordionItem key={f.question} question={f.question} answer={f.answer} />
                  ))}
                </div>
              </div>
            )}

          </div>
        </Container>
      </section>

      {/* â”€â”€ Booking â”€â”€ */}
      <section id="booking" className="scroll-mt-[158px]" style={{ background: '#f0ece6', padding: '48px 0', fontFamily: "'Georgia', 'Times New Roman', serif" }}>
        <Container width="page">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'flex-start' }}>

            {/* LEFT FORM */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              <div style={{ marginBottom: '28px' }}>
                <span style={{ display: 'block', color: '#b8935a', fontSize: '12px', fontWeight: 900, letterSpacing: '0.28em', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '14px' }}>Reserve Your Place</span>
                <h2 style={{ color: '#0d1f35', fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 10px' }}>Plan Your Private Journey</h2>
                <p style={{ color: '#8a8276', fontSize: '13.5px', fontFamily: 'sans-serif', lineHeight: '1.65', margin: 0 }}>No payment required. We review your request and reply with a private proposal within 24 hours.</p>
              </div>

              {/* Step 1 — Package */}
              <BookingStepCard number={1} title="Choose Your Package">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {(pricing.length ? pricing : [{ tier: 'Private reference', price }]).map((row, index) => {
                    const sel = index === safePriceIndex;
                    const rowOld = oldPrice(details, row);
                    const tierName = (row.tier || `Option ${index + 1}`).split('—')[0].split('–')[0].trim();
                    const tierSub = (row.tier || '').includes('—') ? (row.tier || '').split('—')[1].trim() : (row.tier || '').includes('–') ? (row.tier || '').split('–')[1].trim() : '';
                    return (
                      <div
                        key={`booking-pkg-${index}`}
                        onClick={() => setSelectedPriceIndex(index)}
                        style={{
                          borderRadius: '12px', padding: '16px', cursor: 'pointer', position: 'relative',
                          border: sel ? '1.5px solid #c9a96e' : '1.5px solid #ede8e0',
                          background: sel ? 'linear-gradient(160deg, #0d1f35, #122840)' : '#faf9f6',
                          transition: 'all 0.2s',
                          boxShadow: sel ? '0 4px 20px rgba(13,31,53,0.15)' : 'none',
                        }}
                      >
                        {index === 1 && (
                          <span style={{ position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#c9a96e,#a07840)', color: '#0d1f35', fontSize: '7.5px', fontWeight: 800, fontFamily: 'sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '0 0 6px 6px', whiteSpace: 'nowrap' }}>Popular</span>
                        )}
                        <p style={{ color: sel ? '#c9a96e' : '#b8935a', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '4px', marginTop: index === 1 ? '10px' : '0' }}>{tierName}</p>
                        {tierSub && <p style={{ color: sel ? 'rgba(245,240,232,0.7)' : '#7a7060', fontSize: '11.5px', fontFamily: 'sans-serif', lineHeight: 1.4, marginBottom: '12px' }}>{tierSub}</p>}
                        {rowOld && <p style={{ color: sel ? 'rgba(201,169,110,0.45)' : '#c0b8ae', fontSize: '10px', fontFamily: 'sans-serif', textDecoration: 'line-through', marginBottom: '2px' }}>{rowOld}</p>}
                        <p style={{ color: sel ? '#f5f0e8' : '#0d1f35', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '2px' }}>{formatPrice(row.price || price)}</p>
                        <p style={{ color: sel ? 'rgba(245,240,232,0.4)' : '#a89e92', fontSize: '10px', fontFamily: 'sans-serif' }}>per person</p>
                        {sel && (
                          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <CheckCircle2 size={11} color="#c9a96e" strokeWidth={2} />
                            <span style={{ color: '#c9a96e', fontSize: '9px', fontFamily: 'sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Selected</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </BookingStepCard>

              {/* Step 2 — Date */}
              <BookingStepCard number={2} title="Select Departure Date">
                <BookingDatePicker value={bookingDate} onChange={setBookingDate} />
                <p style={{ color: '#a89e92', fontSize: '11.5px', fontFamily: 'sans-serif', margin: '10px 0 0' }}>Or describe in notes: flexible, March 2027, etc.</p>
              </BookingStepCard>

              {/* Step 3 — Travellers */}
              <BookingStepCard number={3} title="Number of Travellers">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                  <button
                    type="button"
                    onClick={() => setTravelerCount((c) => Math.max(1, c - 1))}
                    onMouseEnter={e => (e.currentTarget.style.background = '#faf3e8')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
                    style={{ width: '40px', height: '40px', borderRadius: '10px 0 0 10px', border: '1.5px solid #ede8e0', borderRight: 'none', background: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                  >
                    <Minus size={14} color="#0d1f35" strokeWidth={2} />
                  </button>
                  <div style={{ width: '64px', height: '40px', border: '1.5px solid #ede8e0', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#0d1f35', fontSize: '16px', fontWeight: 700, fontFamily: 'sans-serif' }}>{travelerCount}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTravelerCount((c) => Math.min(20, c + 1))}
                    onMouseEnter={e => (e.currentTarget.style.background = '#faf3e8')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
                    style={{ width: '40px', height: '40px', borderRadius: '0 10px 10px 0', border: '1.5px solid #ede8e0', borderLeft: 'none', background: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                  >
                    <Plus size={14} color="#0d1f35" strokeWidth={2} />
                  </button>
                  <span style={{ color: '#a89e92', fontSize: '12px', fontFamily: 'sans-serif', marginLeft: '14px' }}>people &middot; Max 20 / private group</span>
                </div>
              </BookingStepCard>

              {/* Step 4 — Details */}
              <BookingStepCard number={4} title="Your Details">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', color: '#b8935a', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '6px' }}>Full Name *</label>
                      <input type="text" placeholder="John Smith" style={{ width: '100%', background: '#ffffff', border: '1.5px solid #ede8e0', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', fontFamily: 'sans-serif', color: '#0d1f35', outline: 'none', boxSizing: 'border-box' as const }} onFocus={e => (e.currentTarget.style.borderColor = '#c9a96e')} onBlur={e => (e.currentTarget.style.borderColor = '#ede8e0')} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#b8935a', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '6px' }}>Email Address *</label>
                      <input type="email" placeholder="john@example.com" style={{ width: '100%', background: '#ffffff', border: '1.5px solid #ede8e0', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', fontFamily: 'sans-serif', color: '#0d1f35', outline: 'none', boxSizing: 'border-box' as const }} onFocus={e => (e.currentTarget.style.borderColor = '#c9a96e')} onBlur={e => (e.currentTarget.style.borderColor = '#ede8e0')} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#b8935a', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '6px' }}>Phone Number</label>
                    <input type="tel" placeholder="+1 555 000 0000" style={{ width: '100%', background: '#ffffff', border: '1.5px solid #ede8e0', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', fontFamily: 'sans-serif', color: '#0d1f35', outline: 'none', boxSizing: 'border-box' as const }} onFocus={e => (e.currentTarget.style.borderColor = '#c9a96e')} onBlur={e => (e.currentTarget.style.borderColor = '#ede8e0')} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#b8935a', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '6px' }}>Special Requests</label>
                    <textarea placeholder="Dietary requirements, accessibility needs, custom requests..." rows={3} style={{ width: '100%', background: '#ffffff', border: '1.5px solid #ede8e0', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', fontFamily: 'sans-serif', color: '#0d1f35', outline: 'none', resize: 'vertical' as const, boxSizing: 'border-box' as const }} onFocus={e => (e.currentTarget.style.borderColor = '#c9a96e')} onBlur={e => (e.currentTarget.style.borderColor = '#ede8e0')} />
                  </div>
                </div>
              </BookingStepCard>

              {/* Bottom CTA */}
              <div style={{ marginTop: '8px', padding: '24px 28px', background: 'linear-gradient(160deg, #0d1f35, #122840)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #c9a96e, #a07840)', color: '#0d1f35', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '13px', fontWeight: 800, fontFamily: 'sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(201,169,110,0.3)', transition: 'opacity 0.2s' }}
                >
                  Plan This Tour <ArrowRight size={15} strokeWidth={2.5} />
                </button>
                <p style={{ color: 'rgba(245,240,232,0.45)', fontSize: '11.5px', fontFamily: 'sans-serif', margin: 0, textAlign: 'center' }}>No charge now. We reply within 24 hours with a private proposal.</p>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'sticky', top: '24px' }}>
              {/* Price Summary */}
              <div style={{ background: 'linear-gradient(160deg, #0d1f35, #122840)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(13,31,53,0.2)' }}>
                <div style={{ padding: '22px 24px 18px' }}>
                  <p style={{ color: 'rgba(201,169,110,0.7)', fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '6px' }}>Price from</p>
                  <p style={{ color: '#f5f0e8', fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '6px' }}>{selectedPriceText}</p>
                  <p style={{ color: 'rgba(245,240,232,0.5)', fontSize: '11.5px', fontFamily: 'sans-serif', margin: 0 }}>{travelerCount} person{travelerCount > 1 ? 's' : ''} &middot; {selectedPriceRow?.tier || 'Private reference'}</p>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '16px 24px' }}>
                  {[
                    { label: 'Package', value: selectedPriceRow?.tier || 'Private reference' },
                    { label: 'Departure', value: departure },
                    { label: 'Travellers', value: `${travelerCount} people` },
                    { label: 'Duration', value: duration },
                  ].map((row) => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                      <span style={{ color: 'rgba(201,169,110,0.6)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'sans-serif', whiteSpace: 'nowrap' }}>{row.label}</span>
                      <span style={{ color: 'rgba(245,240,232,0.7)', fontSize: '11.5px', fontFamily: 'sans-serif', textAlign: 'right', lineHeight: 1.35 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid rgba(201,169,110,0.15)', padding: '16px 24px 20px' }}>
                  <p style={{ color: 'rgba(201,169,110,0.6)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '4px' }}>Estimated Total</p>
                  <p style={{ color: '#c9a96e', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '4px' }}>{estimatedTotal}</p>
                  <p style={{ color: 'rgba(245,240,232,0.3)', fontSize: '10.5px', fontFamily: 'sans-serif', marginBottom: '16px' }}>Deposit based on private quote</p>
                  <button
                    type="button"
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    style={{ width: '100%', background: 'linear-gradient(135deg, #c9a96e, #a07840)', color: '#0d1f35', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '12px', fontWeight: 800, fontFamily: 'sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', transition: 'opacity 0.2s' }}
                  >
                    Plan This Tour <ArrowRight size={13} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Trust Items */}
              <div style={{ background: '#ffffff', border: '1px solid #ede8e0', borderRadius: '14px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { Icon: CheckCircle2, text: 'Free cancellation up to 60 days' },
                  { Icon: BadgeCheck, text: 'Best price guarantee' },
                  { Icon: Clock, text: '24/7 on-trip support' },
                  { Icon: Shield, text: 'Fully protected deposits' },
                ].map(({ Icon, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={13} color="#2a7a4e" strokeWidth={2} style={{ flexShrink: 0 }} />
                    <span style={{ color: '#4a4540', fontSize: '12px', fontFamily: 'sans-serif' }}>{text}</span>
                  </div>
                ))}
              </div>

              {/* Speak to Specialist */}
              <div style={{ background: '#faf8f4', border: '1px solid #ede8e0', borderRadius: '14px', padding: '18px 20px' }}>
                <p style={{ color: '#b8935a', fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: '14px' }}>Speak to a Specialist</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <a href="tel:+84901033128" style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#faf3e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Phone size={12} color="#b8935a" strokeWidth={1.8} />
                    </div>
                    <span style={{ color: '#0d1f35', fontSize: '12.5px', fontFamily: 'sans-serif', fontWeight: 600 }}>+84 901 033 128</span>
                  </a>
                  <a href="mailto:info@halongluxurytravel.com" style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#faf3e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Mail size={12} color="#b8935a" strokeWidth={1.8} />
                    </div>
                    <span style={{ color: '#0d1f35', fontSize: '12px', fontFamily: 'sans-serif' }}>info@halongluxurytravel.com</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {relatedTours.length > 0 && (
        <section className="bg-white py-14">
          <Container width="page">
            <p className="text-[11px] font-black uppercase tracking-[0.26em] text-gold-dark">You May Also Like</p>
            <h2 className="mt-4 font-serif text-[clamp(1.8rem,3.2vw,2.6rem)] font-extrabold tracking-[-0.04em] text-navy">Similar {parentHub.label}</h2>
            <div className="mt-8 grid gap-8 [grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))]">
              {relatedTours.slice(0, 3).map((item) => <TourCard key={item.slug} tour={item} />)}
            </div>
            {relatedPosts.length > 0 && (
              <p className="mt-6">
                <Link href={`/blog/${relatedPosts[0].slug}/`} className="font-extrabold text-gold-dark hover:underline">
                  Read guide: {relatedPosts[0].title} â†’
                </Link>
              </p>
            )}
          </Container>
        </section>
      )}

      <JsonLd data={tourSchema(tour)} />
      <JsonLd data={faqSchema(faq)} />

      {/* Lightbox Modal */}
      {lightboxImage && (
        <dialog
          open
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <SafeTourImage
              src={lightboxImage}
              fallbackSrcs={tourImageFallbacks(tour, lightboxImage)}
              alt={tour.title}
              width={800}
              height={600}
              className="max-h-full max-w-full object-contain"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              aria-label="Close lightbox"
            >
              âœ•
            </button>
          </div>
        </dialog>
      )}
    </main>
  );
}

function TourPanel({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] border border-navy/10 bg-white p-6 shadow-[0_18px_54px_rgba(11,27,43,0.07)] md:p-7">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-gold-dark">{eyebrow}</p>
      <h2 className="mt-3 text-[clamp(1.65rem,2.4vw,2.35rem)] font-black leading-[1.08] tracking-[-0.045em] text-navy">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function HeroMiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-[96px] rounded-[18px] bg-pearl/10 px-4 py-3">
      <p className="text-[15px] font-black leading-tight text-pearl">{value}</p>
      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-pearl/48">{label}</p>
    </div>
  );
}

function HeroInfoPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-pearl/16 bg-pearl/10 px-4 py-2 text-[13px] font-black text-pearl shadow-[0_12px_28px_rgba(0,0,0,0.14)]">
      <span className="shrink-0 text-gold [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      <span className="truncate">{label}</span>
    </span>
  );
}

function QuoteBookingPanel({
  compactPrice,
  previousPrice,
  pricing,
  selectedIndex,
  selectedPriceText,
  estimatedTotal,
  travelerCount,
  showPriceMenu,
  reviewScore,
  reviewCount,
  assurances,
  onTogglePriceMenu,
  onSelectPrice,
  onDecreaseTravelers,
  onIncreaseTravelers
}: {
  compactPrice: string;
  previousPrice: string;
  pricing: Array<Record<string, string>>;
  selectedIndex: number;
  selectedPriceText: string;
  estimatedTotal: string;
  travelerCount: number;
  showPriceMenu: boolean;
  reviewScore: string;
  reviewCount: string;
  assurances: string[];
  onTogglePriceMenu: () => void;
  onSelectPrice: (index: number) => void;
  onDecreaseTravelers: () => void;
  onIncreaseTravelers: () => void;
}) {
  const selectedTier = pricing[selectedIndex]?.tier || 'Private reference';

  return (
    <aside className="rounded-[30px] border border-navy/10 bg-[oklch(99%_0.006_86)] p-4 text-navy shadow-[0_28px_86px_rgba(11,27,43,0.16)] lg:sticky lg:top-[196px]">
      <div className="rounded-[25px] bg-[linear-gradient(180deg,#07111f_0%,#122238_100%)] p-5 text-pearl">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-pearl/10 px-3 py-1.5 text-[11px] font-black text-gold">
            <Star className="h-3.5 w-3.5 fill-gold text-gold" />
            {reviewScore}
          </span>
          <span title={reviewCount} className="rounded-full border border-pearl/14 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-pearl/62">Reviews</span>
        </div>

        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.28em] text-gold">Private quote desk</p>
        <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1">
          {previousPrice && <span className="mb-1 text-sm font-semibold text-pearl/45 line-through">{previousPrice}</span>}
          <span className="font-serif text-[clamp(2.1rem,3.5vw,3rem)] font-extrabold leading-none tracking-[-0.05em] text-gold">{compactPrice}</span>
          <span className="pb-1 text-sm font-semibold text-pearl/64">/pax reference</span>
        </div>
        <p className="mt-4 text-sm font-semibold leading-7 text-pearl/74">Reserve the idea, then let a travel designer tune hotel pickup, guide pace, food timing and wellness close.</p>
      </div>

      <div className="p-2 pt-5">
        <div className="relative">
          <label className="text-[11px] font-black uppercase tracking-[0.16em] text-navy/48">Travel style</label>
          <button
            type="button"
            onClick={onTogglePriceMenu}
            className="mt-2 flex min-h-12 w-full items-center justify-between gap-3 rounded-[18px] border border-navy/10 bg-[#fffaf3] px-4 text-left text-sm font-black text-navy transition hover:border-gold/50"
          >
            <span>{selectedTier}</span>
            <span className="inline-flex items-center gap-2 text-gold-dark">
              {selectedPriceText}
              <ChevronDown className="h-4 w-4" />
            </span>
          </button>
          {showPriceMenu && pricing.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-[20px] border border-navy/10 bg-pearl shadow-[0_22px_54px_rgba(11,27,43,0.18)]">
              {pricing.map((row, index) => (
                <button
                  key={`${row.tier}-${index}`}
                  type="button"
                  onClick={() => onSelectPrice(index)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition ${index === selectedIndex ? 'bg-[#fff2d6] text-navy' : 'bg-pearl text-navy/70 hover:bg-[#fff8ea]'}`}
                >
                  <span className="font-black">{row.tier || `Option ${index + 1}`}</span>
                  <span className="font-black text-gold-dark">{formatPrice(row.price || compactPrice)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <label className="block">
            <span className="text-[11px] font-black uppercase tracking-[0.16em] text-navy/48">Preferred date</span>
            <input
              type="date"
              className="mt-2 min-h-12 w-full rounded-[18px] border border-navy/10 bg-white px-4 text-sm font-bold text-navy outline-none transition focus:border-gold-dark focus:ring-2 focus:ring-gold/20"
            />
          </label>

          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.16em] text-navy/48">Travelers</span>
            <div className="mt-2 flex min-h-12 items-center justify-between rounded-[18px] border border-navy/10 bg-white px-3">
              <button type="button" onClick={onDecreaseTravelers} className="grid h-8 w-8 place-items-center rounded-full border border-navy/10 text-navy/70 transition hover:border-gold hover:text-gold-dark" aria-label="Decrease travelers">
                <Minus className="h-4 w-4" />
              </button>
              <span className="inline-flex items-center gap-2 text-sm font-black text-navy">
                <Users className="h-4 w-4 text-gold-dark" />
                {travelerCount} guests
              </span>
              <button type="button" onClick={onIncreaseTravelers} className="grid h-8 w-8 place-items-center rounded-full border border-navy/10 text-navy/70 transition hover:border-gold hover:text-gold-dark" aria-label="Increase travelers">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[20px] border border-gold/24 bg-[#fff6e4] p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-bold text-navy/58">{travelerCount} x {selectedPriceText}</span>
            <span className="text-lg font-black tracking-[-0.03em] text-navy">{estimatedTotal}</span>
          </div>
          <p className="mt-2 text-xs font-semibold leading-5 text-navy/52">Estimate only. Final quote is reviewed around availability, transfers and guide level.</p>
        </div>

        <Link href="/customize-your-trip/" className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-gold px-5 py-4 text-[12px] font-black uppercase tracking-[0.18em] text-navy shadow-[0_14px_32px_rgba(200,169,106,0.24)] transition hover:bg-navy hover:text-gold">
          Plan this private day
        </Link>
        <Link href="/contact/" className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-navy/12 px-5 py-3 text-[12px] font-black uppercase tracking-[0.16em] text-navy transition hover:border-gold-dark hover:text-gold-dark">
          Ask a travel designer
        </Link>

        <div className="mt-5 grid gap-2">
          {assurances.map((item, index) => (
            <div key={item} className="flex items-center gap-2 rounded-[16px] bg-white px-3 py-2 text-[12px] font-bold text-navy/68 shadow-[inset_0_0_0_1px_rgba(11,27,43,0.05)]">
              {index === 0 ? <BadgePercent className="h-4 w-4 text-gold-dark" /> : index === 1 ? <WalletCards className="h-4 w-4 text-gold-dark" /> : index === 2 ? <ShieldCheck className="h-4 w-4 text-gold-dark" /> : <Sparkles className="h-4 w-4 text-gold-dark" />}
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-2 border-t border-navy/10 pt-4 text-sm font-bold text-navy/62">
          <a href="tel:+84904699428" className="inline-flex items-center gap-2 transition hover:text-gold-dark"><Phone className="h-4 w-4 text-gold-dark" /> +84 904 699 428</a>
          <a href="mailto:info@halongluxurytravel.com" className="inline-flex items-center gap-2 transition hover:text-gold-dark"><Mail className="h-4 w-4 text-gold-dark" /> Private quote support</a>
        </div>
      </div>
    </aside>
  );
}

const destinationCoordinates: Record<string, { x: number; y: number }> = {
  hanoi: { x: 17, y: 18 },
  'ha long bay': { x: 30, y: 26 },
  'halong bay': { x: 30, y: 26 },
  'lan ha bay': { x: 31, y: 30 },
  'cat ba': { x: 29, y: 31 },
  'ninh binh': { x: 19, y: 32 },
  'trang an': { x: 19, y: 34 },
  'tam coc': { x: 20, y: 34 },
  'mua cave': { x: 20, y: 35 },
  sapa: { x: 11, y: 10 },
  'ha giang': { x: 19, y: 8 },
  'dong van': { x: 21, y: 6 },
  'mai chau': { x: 16, y: 28 },
  'pu luong': { x: 17, y: 30 },
  'cao bang': { x: 26, y: 9 },
  'ban gioc': { x: 30, y: 10 },
  'ba be': { x: 23, y: 13 },
  hue: { x: 35, y: 54 },
  'da nang': { x: 37, y: 60 },
  'hoi an': { x: 40, y: 63 },
  'my son': { x: 38, y: 62 },
  'ba na hills': { x: 36, y: 58 },
  'phong nha': { x: 32, y: 48 },
  'quang binh': { x: 31, y: 47 },
  'nha trang': { x: 49, y: 76 },
  'da lat': { x: 48, y: 81 },
  'mui ne': { x: 53, y: 82 },
  saigon: { x: 59, y: 86 },
  'ho chi minh city': { x: 59, y: 86 },
  'cu chi tunnels': { x: 55, y: 84 },
  'mekong delta': { x: 53, y: 92 },
  'can tho': { x: 56, y: 91 },
  'ben tre': { x: 57, y: 90 },
  'cai be': { x: 55, y: 89 },
  'my tho': { x: 57, y: 88 },
  'chau doc': { x: 51, y: 90 },
  'phu quoc': { x: 42, y: 96 },
  bangkok: { x: 72, y: 43 },
  'chiang mai': { x: 69, y: 20 },
  ayutthaya: { x: 71, y: 38 },
  phuket: { x: 73, y: 76 },
  krabi: { x: 74, y: 72 },
  pattaya: { x: 75, y: 48 },
  'koh samui': { x: 79, y: 69 },
  'siem reap': { x: 77, y: 51 },
  'angkor wat': { x: 79, y: 49 },
  'phnom penh': { x: 72, y: 61 },
  battambang: { x: 74, y: 55 },
  sihanoukville: { x: 70, y: 69 },
  'luang prabang': { x: 57, y: 9 },
  'kuang si': { x: 56, y: 10 },
  'vang vieng': { x: 59, y: 25 },
  vientiane: { x: 61, y: 35 },
  bagan: { x: 46, y: 22 },
  yangon: { x: 46, y: 55 },
  mandalay: { x: 45, y: 28 },
  'inle lake': { x: 50, y: 39 }
};

function routePoint(stop: string, index: number, total: number) {
  const key = stop.toLowerCase();
  const known = destinationCoordinates[key];
  if (known) return known;

  const progress = total <= 1 ? 0 : index / (total - 1);
  return {
    x: 18 + progress * 60,
    y: 18 + progress * 62
  };
}

function routeSegmentMode(from: string, to: string, transport: string) {
  const text = `${from} ${to} ${transport}`.toLowerCase();
  if (/flight|airplane|plane|fly|airport/.test(text)) return 'Flight hop';
  if (/cruise|boat|ship|speedboat|ferry|bay|delta|river|mekong|halong|ha long|lan ha/.test(text)) return 'Cruise/water';
  return 'Land route';
}

function routePathFromPoints(points: Array<{ x: number; y: number }>) {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const controlX = (previous.x + point.x) / 2;
    const controlY = previous.y + (point.y - previous.y) * 0.42;
    return `${path} Q ${controlX} ${controlY} ${point.x} ${point.y}`;
  }, '');
}

function TripRouteMap({ stops, route, duration, transport }: { stops: string[]; route: string; duration: string; transport: string }) {
  const visibleStops = stops.length ? stops : ['Route on request'];
  const points = visibleStops.map((stop, index) => routePoint(stop, index, visibleStops.length));
  const routePath = routePathFromPoints(points);
  const segmentModes = visibleStops.slice(1).map((stop, index) => routeSegmentMode(visibleStops[index], stop, transport));
  const modeCounts = segmentModes.reduce<Record<string, number>>((counts, mode) => {
    counts[mode] = (counts[mode] || 0) + 1;
    return counts;
  }, {});
  const startStop = visibleStops[0];
  const finishStop = visibleStops[visibleStops.length - 1];

  return (
    <div className="relative mt-10 overflow-hidden rounded-[38px] border border-navy/10 bg-[oklch(93.7%_0.026_91)] p-3 shadow-[0_28px_90px_rgba(11,27,43,0.14)] md:p-5">
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(11,27,43,0.10)_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="relative overflow-hidden rounded-[32px] border border-pearl/72 bg-pearl">
        <div className="grid gap-4 border-b border-navy/8 bg-[linear-gradient(135deg,#fffaf3,oklch(94%_0.03_86))] px-5 py-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:px-7">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.24em] text-gold-dark">Legal redrawn map</p>
            <h3 className="mt-2 text-[clamp(1.9rem,3vw,3.4rem)] font-black leading-[0.98] tracking-[-0.035em] text-navy">
              Vietnam route map
              <span className="sr-only">Vietnam route sheet</span>
            </h3>
            <p className="mt-3 max-w-[68ch] text-sm font-bold leading-6 text-navy/62">{route}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-[24px] border border-navy/8 bg-pearl p-2 text-center shadow-[0_12px_30px_rgba(11,27,43,0.07)]">
            <div className="min-w-[78px] rounded-[18px] bg-[#fff8ea] px-3 py-3">
              <p className="text-2xl font-black text-navy">{visibleStops.length}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-navy/46">Stops</p>
            </div>
            <div className="min-w-[78px] rounded-[18px] bg-[#fff8ea] px-3 py-3">
              <p className="text-2xl font-black text-navy">{modeCounts['Flight hop'] || 0}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-navy/46">Flights</p>
            </div>
            <div className="min-w-[78px] rounded-[18px] bg-[#fff8ea] px-3 py-3">
              <p className="text-2xl font-black text-navy">{modeCounts['Cruise/water'] || 0}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-navy/46">Water</p>
            </div>
          </div>
        </div>

        <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="relative min-h-[560px] overflow-hidden bg-[linear-gradient(180deg,#d7eef1_0%,#c5e2e9_44%,#afd2e2_100%)] md:min-h-[700px]">
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              role="img"
              aria-label={`Legal redrawn Vietnam route map for ${visibleStops.join(' to ')}`}
            >
              <defs>
                <linearGradient id="routeStroke" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#e06b2d" />
                  <stop offset="100%" stopColor="#a83224" />
                </linearGradient>
                <linearGradient id="vietnamLand" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8e7bf" />
                  <stop offset="48%" stopColor="#dce5aa" />
                  <stop offset="100%" stopColor="#b4d4a4" />
                </linearGradient>
                <filter id="atlasShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1.4" stdDeviation="1.8" floodColor="#0b1b2b" floodOpacity="0.17" />
                </filter>
                <pattern id="seaLines" width="7" height="7" patternUnits="userSpaceOnUse">
                  <path d="M0 3.5 H7" stroke="rgba(255,255,255,0.34)" strokeWidth="0.35" />
                </pattern>
              </defs>

              <rect x="0" y="0" width="100" height="100" fill="rgba(191,224,233,0.78)" />
              <rect x="0" y="0" width="100" height="100" fill="url(#seaLines)" opacity="0.42" />
              <path d="M0 0 H42 C35 13,34 24,38 35 C42 47,38 60,44 73 C51 86,62 93,75 100 H0 Z" fill="rgba(238,219,170,0.48)" />
              <path d="M52 3 C66 10,79 25,83 42 C88 61,82 80,68 96 C79 84,79 67,70 52 C62 39,56 23,52 3 Z" fill="rgba(244,232,200,0.64)" stroke="rgba(11,27,43,0.08)" strokeWidth="0.35" />
              <path d="M18 7 C23 5,30 8,34 15 C38 22,32 29,35 38 C38 48,34 57,40 68 C45 77,54 82,62 91 C52 96,36 94,25 86 C14 78,10 67,12 55 C14 43,8 33,10 22 C11 14,13 9,18 7 Z" fill="url(#vietnamLand)" filter="url(#atlasShadow)" />
              <path d="M26 11 C31 19,27 28,31 38 C35 48,32 56,37 66 C42 76,50 82,56 89" fill="none" stroke="rgba(255,255,255,0.58)" strokeWidth="0.9" strokeLinecap="round" />
              <path d="M28 25 C35 29,39 35,40 43" fill="none" stroke="rgba(11,27,43,0.09)" strokeWidth="0.45" strokeDasharray="1.4 2.2" />
              <path d="M41 58 C48 63,51 71,51 79" fill="none" stroke="rgba(11,27,43,0.09)" strokeWidth="0.45" strokeDasharray="1.4 2.2" />
              <path d="M48 90 C54 92,61 93,68 91" fill="none" stroke="rgba(11,27,43,0.10)" strokeWidth="0.45" strokeDasharray="1.4 2.2" />
              <path d="M68 72 C71 72,73 74,72 77 C70 79,67 77,68 72 Z" fill="rgba(244,232,200,0.72)" stroke="rgba(11,27,43,0.08)" strokeWidth="0.35" />
              <path d="M74 83 C77 82,79 84,78 87 C76 89,73 87,74 83 Z" fill="rgba(244,232,200,0.72)" stroke="rgba(11,27,43,0.08)" strokeWidth="0.35" />
              <text x="12" y="13" className="fill-navy text-[3px] font-black uppercase tracking-[0.08em]" opacity="0.38">North</text>
              <text x="35" y="55" className="fill-navy text-[3px] font-black uppercase tracking-[0.08em]" opacity="0.32">Central</text>
              <text x="48" y="89" className="fill-navy text-[3px] font-black uppercase tracking-[0.08em]" opacity="0.34">South</text>
              <text x="62" y="55" className="fill-navy text-[2.7px] font-black uppercase tracking-[0.08em]" opacity="0.22">East Sea</text>
              <path
                d={routePath}
                fill="none"
                stroke="rgba(255,255,255,0.72)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4.9"
              />
              <path
                d={routePath}
                fill="none"
                stroke="url(#routeStroke)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.35"
                strokeDasharray={segmentModes.includes('Flight hop') ? '5 2.6' : undefined}
              />
              {points.map((point, index) => {
                const alignRight = point.x > 53;
                const labelY = point.y + (index % 2 === 0 ? -5.3 : 6.4);

                return (
                  <g key={`${visibleStops[index]}-${index}`}>
                    <circle cx={point.x} cy={point.y} r="5.5" fill="rgba(224,107,45,0.18)" />
                    <circle cx={point.x} cy={point.y} r="3.7" fill="#fffaf3" stroke="#c85f2f" strokeWidth="1.05" />
                    <text x={point.x} y={point.y + 1.25} textAnchor="middle" className="fill-navy text-[3.7px] font-black">
                      {index + 1}
                    </text>
                    <text
                      x={point.x + (alignRight ? -3 : 3)}
                      y={labelY}
                      textAnchor={alignRight ? 'end' : 'start'}
                      className="fill-navy text-[2.75px] font-black uppercase tracking-[0.055em]"
                    >
                      {visibleStops[index]}
                    </text>
                  </g>
                );
              })}
            </svg>

            {segmentModes.map((mode, index) => {
              const pointA = points[index];
              const pointB = points[index + 1];
              const midX = (pointA.x + pointB.x) / 2;
              const midY = (pointA.y + pointB.y) / 2;
              return (
                <span
                  key={`${mode}-${index}`}
                  className="absolute hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-pearl/70 bg-pearl/92 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-navy/62 shadow-[0_8px_20px_rgba(11,27,43,0.08)] md:inline-flex"
                  style={{ left: `${midX}%`, top: `${midY}%` }}
                >
                  {mode}
                </span>
              );
            })}

            <div className="absolute left-5 top-5 rounded-[22px] border border-navy/10 bg-pearl/94 px-4 py-3 shadow-[0_12px_28px_rgba(11,27,43,0.10)]">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gold-dark">Map sheet</p>
              <p className="mt-1 text-sm font-extrabold text-navy">{startStop} to {finishStop}</p>
            </div>
            <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-pearl/70 bg-pearl/92 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-navy shadow-[0_8px_20px_rgba(11,27,43,0.08)]">Land route</span>
              <span className="rounded-full border border-pearl/70 bg-pearl/92 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-navy shadow-[0_8px_20px_rgba(11,27,43,0.08)]">Flight hop</span>
              <span className="rounded-full border border-pearl/70 bg-pearl/92 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-navy shadow-[0_8px_20px_rgba(11,27,43,0.08)]">Cruise/water</span>
            </div>
          </div>

          <aside className="border-t border-navy/8 bg-[#fffaf3] p-5 xl:border-l xl:border-t-0 md:p-7" aria-label="Route stop rail">
            <p className="text-[12px] font-black uppercase tracking-[0.22em] text-gold-dark">Trip map guide</p>
            <h4 className="mt-3 text-[2rem] font-black leading-none tracking-[-0.035em] text-navy">Route stops</h4>
            <p className="mt-4 text-sm font-semibold leading-7 text-navy/62">This is a legal redrawn route map inspired by practical public tour maps, not a copied BestPrice image or branded asset.</p>
            <div className="mt-5 rounded-[22px] bg-pearl p-4 shadow-[inset_0_0_0_1px_rgba(11,27,43,0.06)]">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-navy/44">Transport logic</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-navy/62">{transport}</p>
            </div>
            <ol className="mt-6 grid gap-3">
              {visibleStops.map((stop, index) => (
                <li key={`${stop}-guide-${index}`} className="grid grid-cols-[42px_1fr] items-start gap-3 rounded-[20px] border border-navy/7 bg-pearl px-3 py-3 shadow-[0_10px_24px_rgba(11,27,43,0.04)]">
                  <span className="grid h-[42px] w-[42px] place-items-center rounded-full bg-[#c85f2f] text-[13px] font-black text-pearl shadow-[0_10px_20px_rgba(200,95,47,0.18)]">{index + 1}</span>
                  <span>
                    <span className="block text-sm font-black text-navy">{stop}</span>
                    <span className="mt-1 block text-[12px] font-bold uppercase tracking-[0.12em] text-navy/42">
                      {index === 0 ? 'Start point' : index === visibleStops.length - 1 ? 'Finish point' : segmentModes[index - 1] || 'Route stop'}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            <Link href="/customize-your-trip/" className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-navy px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-pearl transition hover:bg-[#c85f2f]">
              Customize this route
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

function ItineraryDayCard({ day, dayFacts, index, isLast }: { day: Record<string, string>; dayFacts?: SourceItineraryFact; index: number; isLast: boolean }) {
  const [open, setOpen] = useState(false);
  const dayTag = day.day || dayFacts?.day || `Day ${index + 1}`;
  const mealsValue = dayFacts?.meals;

  return (
    <div style={{ display: 'flex', gap: '24px', position: 'relative' }}>
      {/* Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div
          style={{
            width: '42px', height: '42px', borderRadius: '50%',
            background: open ? 'linear-gradient(135deg, #c9a96e, #a07840)' : 'linear-gradient(135deg, #1a2e45, #0d1f35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: open ? '#0d1f35' : '#c9a96e',
            fontSize: '15px', fontWeight: 800, fontFamily: 'sans-serif', flexShrink: 0,
            boxShadow: open ? '0 4px 16px rgba(201,169,110,0.35)' : '0 2px 8px rgba(0,0,0,0.15)',
            transition: 'all 0.3s', zIndex: 1,
          }}
        >
          {index + 1}
        </div>
        {!isLast && (
          <div style={{ width: '1px', flex: 1, minHeight: '20px', marginTop: '6px', background: 'linear-gradient(to bottom, #c9a96e44, #e8e2d900)' }} />
        )}
      </div>

      {/* Card */}
      <div
        onMouseEnter={(e) => { if (!open) { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(201,169,110,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
        onMouseLeave={(e) => { if (!open) { e.currentTarget.style.borderColor = '#ede8e0'; e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
        style={{
          flex: 1, marginBottom: isLast ? '0' : '20px', borderRadius: '18px', overflow: 'hidden',
          border: open ? '1px solid rgba(201,169,110,0.35)' : '1px solid #ede8e0',
          boxShadow: open ? '0 4px 32px rgba(201,169,110,0.08)' : '0 1px 6px rgba(0,0,0,0.04)',
          background: '#ffffff', transition: 'all 0.3s',
        }}
      >
        {/* Card Header */}
        <button
          onClick={() => setOpen(!open)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '24px 28px', background: open ? '#faf8f4' : '#ffffff',
            border: 'none', cursor: 'pointer', textAlign: 'left' as const,
            transition: 'background 0.2s', borderBottom: open ? '1px solid #ede8e0' : 'none',
          }}
        >
          <div>
            <span style={{ display: 'block', color: '#b8935a', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase' as const, fontFamily: 'sans-serif', marginBottom: '8px' }}>
              {dayTag}
            </span>
            <h3 style={{ color: '#0d1f35', fontSize: '19px', fontWeight: 700, fontFamily: "'Georgia', serif", margin: 0, lineHeight: 1.35 }}>
              {day.title}
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '16px' }}>
            <span style={{ color: '#b8935a', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase' as const, fontFamily: 'sans-serif', fontWeight: 600 }}>
              Day Details
            </span>
            {open ? <ChevronDown size={16} color="#b8935a" strokeWidth={2} style={{ transform: 'rotate(180deg)' }} /> : <ChevronDown size={16} color="#b8935a" strokeWidth={2} />}
          </div>
        </button>

        {/* Expanded Content */}
        {open && (
          <div style={{ padding: '28px 28px 24px' }}>
            <p style={{ color: '#4a4540', fontSize: '14.5px', lineHeight: '1.85', fontFamily: 'sans-serif', marginBottom: mealsValue ? '24px' : '0' }}>
              {day.body}
            </p>
            {mealsValue && (
              <div style={{ background: '#faf8f4', border: '1px solid #ede8e0', borderRadius: '10px', padding: '14px 18px', display: 'inline-flex', flexDirection: 'column' as const, gap: '6px', minWidth: '160px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Utensils size={11} color="#b8935a" strokeWidth={2} />
                  <span style={{ color: '#b8935a', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, fontFamily: 'sans-serif', fontWeight: 600 }}>
                    Source Facts — Meals
                  </span>
                </div>
                <p style={{ color: '#1a1612', fontSize: '13px', fontFamily: 'sans-serif', fontWeight: 600, margin: 0, paddingLeft: '17px' }}>
                  {mealsValue}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingDatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = value ? new Date(value) : undefined;
  const display = selected ? selected.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Select a date';
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weeks = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff', border: `1.5px solid ${open ? '#c9a96e' : '#ede8e0'}`, borderRadius: '10px', padding: '13px 16px', cursor: 'pointer', textAlign: 'left' as const, transition: 'border-color 0.2s' }}
      >
        <CalendarDays size={16} color="#b8935a" strokeWidth={1.8} />
        <span style={{ color: selected ? '#0d1f35' : '#c0b8ae', fontSize: '13.5px', fontFamily: 'sans-serif', flex: 1 }}>{display}</span>
        <ChevronRight size={14} color="#b8935a" strokeWidth={2} style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 50, background: '#ffffff', border: '1.5px solid #ede8e0', borderRadius: '14px', boxShadow: '0 12px 48px rgba(13,31,53,0.14)', padding: '16px', minWidth: '300px' }}>
          {/* Nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '0 4px' }}>
            <button type="button" onClick={prevMonth} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #ede8e0', background: '#faf8f4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, transition: 'background 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = '#faf3e8'; e.currentTarget.style.borderColor = '#c9a96e'; }} onMouseLeave={e => { e.currentTarget.style.background = '#faf8f4'; e.currentTarget.style.borderColor = '#ede8e0'; }}>
              <ChevronLeft size={14} color="#0d1f35" strokeWidth={2} />
            </button>
            <span style={{ color: '#0d1f35', fontSize: '14px', fontWeight: 700, fontFamily: 'sans-serif' }}>{monthLabel}</span>
            <button type="button" onClick={nextMonth} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #ede8e0', background: '#faf8f4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, transition: 'background 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = '#faf3e8'; e.currentTarget.style.borderColor = '#c9a96e'; }} onMouseLeave={e => { e.currentTarget.style.background = '#faf8f4'; e.currentTarget.style.borderColor = '#ede8e0'; }}>
              <ChevronRight size={14} color="#0d1f35" strokeWidth={2} />
            </button>
          </div>
          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0, marginBottom: '4px' }}>
            {weeks.map(w => <div key={w} style={{ textAlign: 'center', color: '#b8935a', fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'sans-serif', padding: '0 0 8px' }}>{w}</div>)}
          </div>
          {/* Days grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {cells.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />;
              const d = new Date(viewYear, viewMonth, day);
              const isDisabled = d < today;
              const isSel = selected && d.toDateString() === selected.toDateString();
              const isToday = d.toDateString() === today.toDateString();
              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => { onChange(d.toISOString().split('T')[0]); setOpen(false); }}
                  style={{
                    width: '36px', height: '36px', borderRadius: '8px', border: isToday && !isSel ? '1px solid rgba(201,169,110,0.3)' : 'none',
                    background: isSel ? 'linear-gradient(135deg, #c9a96e, #a07840)' : 'none',
                    color: isSel ? '#0d1f35' : isDisabled ? '#e0dbd6' : isToday ? '#c9a96e' : '#2c2520',
                    fontWeight: isSel || isToday ? 700 : 400,
                    fontSize: '13px', fontFamily: 'sans-serif', cursor: isDisabled ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s, color 0.15s', padding: 0, margin: '0 auto',
                  }}
                  onMouseEnter={e => { if (!isDisabled && !isSel) { e.currentTarget.style.background = '#faf3e8'; e.currentTarget.style.color = '#b8935a'; } }}
                  onMouseLeave={e => { if (!isDisabled && !isSel) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = isToday ? '#c9a96e' : '#2c2520'; } }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function BookingStepCard({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #ede8e0', borderRadius: '16px', padding: '24px 28px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #0d1f35, #1a2e45)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: '#c9a96e', fontSize: '12px', fontWeight: 800, fontFamily: 'sans-serif' }}>{number}</span>
        </div>
        <h3 style={{ color: '#0d1f35', fontSize: '15px', fontWeight: 700, margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function FaqAccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onMouseEnter={(e) => { if (!open) { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(201,169,110,0.06)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
      onMouseLeave={(e) => { if (!open) { e.currentTarget.style.borderColor = '#ede8e0'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; } }}
      style={{ background: '#ffffff', border: `1px solid ${open ? 'rgba(201,169,110,0.45)' : '#ede8e0'}`, borderRadius: '12px', overflow: 'hidden', transition: 'all 0.25s', boxShadow: open ? '0 4px 20px rgba(201,169,110,0.08)' : 'none' }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', background: open ? '#faf8f4' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' as const, gap: '16px', transition: 'background 0.25s' }}
      >
        <span style={{ color: '#0d1f35', fontSize: '14px', fontWeight: 600, fontFamily: "'Georgia', serif", lineHeight: 1.4 }}>{question}</span>
        <div style={{ flexShrink: 0, transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <ChevronDown size={15} color="#b8935a" strokeWidth={2} />
        </div>
      </button>
      {open && (
        <div style={{ padding: '0 22px 20px' }}>
          <div style={{ width: '32px', height: '1px', background: '#c9a96e', marginBottom: '12px', opacity: 0.5 }} />
          <p style={{ color: '#5a5248', fontSize: '13px', fontFamily: 'sans-serif', lineHeight: '1.75', margin: 0 }}>{answer}</p>
        </div>
      )}
    </div>
  );
}

function AccommodationCard({ image, title, subtitle, tour }: { image: string; title: string; subtitle: string; tour: CmsItem }) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-navy/10 bg-white shadow-[0_8px_22px_rgba(11,27,43,0.06)]">
      <div className="relative min-h-[150px] bg-navy/10">
        <SafeTourImage src={image} fallbackSrcs={tourImageFallbacks(tour, image)} alt={title} fill sizes="280px" className="object-cover" />
      </div>
      <div className="p-4">
        <h4 className="line-clamp-2 text-[13px] font-black leading-5 text-navy">{title}</h4>
        <p className="mt-2 line-clamp-2 text-[12px] font-medium leading-5 text-navy/62">{subtitle}</p>
        <p className="mt-4 text-[11px] font-semibold text-navy/46">Day 1, Day 2, Day 4</p>
      </div>
    </div>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="grid grid-cols-[24px_1fr] gap-3.5 py-4 first:pt-0 last:pb-0"><span className="mt-0.5 text-[#d85f24] [&>svg]:h-[18px] [&>svg]:w-[18px]">{icon}</span><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-navy/45">{label}</p><p className="mt-1.5 break-words text-[13px] font-semibold leading-6 text-navy/75">{value}</p></div></div>;
}

function Benefit({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="flex items-start gap-3 text-[13px] font-extrabold leading-5 text-navy"><span className="mt-0.5 text-[#d85f24] [&>svg]:h-5 [&>svg]:w-5">{icon}</span><span>{text}</span></div>;
}

function FlatInfo({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-white text-gold-dark shadow-[0_4px_12px_rgba(11,27,43,0.06)] [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-gold-dark">{label}</p>
        <p className="mt-2 break-words text-[16px] font-black leading-[1.45] text-navy">{value}</p>
      </div>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="grid grid-cols-[30px_1fr] gap-4 bg-[oklch(98.8%_0.008_86)] px-7 py-7"><span className="mt-0.5 text-gold-dark [&>svg]:h-[22px] [&>svg]:w-[22px]">{icon}</span><div className="min-w-0"><p className="text-[12px] font-black uppercase tracking-[0.16em] text-navy/50">{label}</p><p className="mt-3 break-words text-[17px] font-black leading-7 text-navy/82">{value}</p></div></div>;
}

function InclusionRow({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return <div className="grid gap-3 py-5 md:grid-cols-[42px_1fr]"><span className="text-navy/72 [&>svg]:h-6 [&>svg]:w-6">{icon}</span><div><h3 className="text-base font-black tracking-[-0.02em]">{title}</h3><p className="mt-1 text-sm font-medium leading-6 text-navy/68">{body}</p></div></div>;
}

function ListPanel({ title, items, icon }: { title: string; items: string[]; icon: 'check' | 'slash' }) {
  return <div className="rounded-[26px] border border-navy/8 bg-[#fffaf3] p-6"><h3 className="text-xl font-extrabold tracking-[-0.03em]">{title}</h3><ul className="mt-6 grid gap-4 text-sm leading-7 text-navy/66">{items.map((item) => <li key={item} className="flex gap-4">{icon === 'check' ? <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#c85f2f]" /> : <CircleSlash className="mt-1 h-4 w-4 shrink-0 text-[#c85f2f]" />}{item}</li>)}</ul></div>;
}

function ReviewBar({ label, value, score, tone }: { label: string; value: string; score?: string; tone: 'green' | 'gold' }) {
  return (
    <div className="mt-4 grid grid-cols-[96px_minmax(0,1fr)_32px] items-center gap-4 text-sm">
      <span className="font-bold text-navy/68">{label}</span>
      <span className="h-1 rounded-full bg-navy/12">
        <span className={`block h-1 rounded-full ${tone === 'green' ? 'bg-[#15b77a]' : 'bg-gold'}`} style={{ width: value }} />
      </span>
      <span className="text-right font-bold text-navy/58">{score || ''}</span>
    </div>
  );
}
