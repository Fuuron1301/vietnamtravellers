import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, CalendarDays, Check, ChevronDown, Mail, Phone, Star, TrendingUp, Users } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { CmsBlockRuntime } from '@/components/blocks/cms-block-runtime';
import { StyleTourCarousel } from '@/components/sections/style-tour-carousel';
import { getContent, getSingle } from '@/lib/cms';
import { absoluteUrl, pageMetadata, site } from '@/lib/seo';
import { getTripKindBySlug, tripKinds, tripStylePath, tripStyleSlug, type TripKind } from '@/lib/trip-styles';
import type { CmsItem } from '@/lib/types';
import type { ReactNode } from 'react';

type StyleDetail = {
  slug: string;
  kind: TripKind;
  destination: string;
  price: string;
  guests: string;
  pace: string;
  heroLine: string;
  experienceLead: string;
  features: Array<{ title: string; body: string }>;
  journey: Array<{ day: string; title: string; body: string }>;
  included: string[];
  hotels: Array<{ name: string; location: string }>;
  gallery: TripKind[];
  related: TripKind[];
};

const destinationByTone = [
  'Vietnam',
  'Thailand',
  'Vietnam',
  'Vietnam',
  'Vietnam',
  'Laos',
  'Thailand',
  'Vietnam',
  'Vietnam',
  'Thailand',
  'Cambodia',
  'Vietnam',
  'Vietnam',
  'Thailand',
  'Vietnam',
  'Vietnam',
  'Vietnam',
  'Thailand',
  'Vietnam',
  'Southeast Asia'
];

const hotelSets = {
  coast: [
    { name: 'Six Senses Ninh Van Bay', location: 'Nha Trang, Vietnam' },
    { name: 'Amanpuri', location: 'Phuket, Thailand' },
    { name: 'Soneva Jani', location: 'Maldives' }
  ],
  culture: [
    { name: 'Capella Hanoi', location: 'Hanoi, Vietnam' },
    { name: 'Azerai La Residence', location: 'Hue, Vietnam' },
    { name: 'Rosewood Luang Prabang', location: 'Laos' }
  ],
  nature: [
    { name: 'Topas Ecolodge', location: 'Sapa, Vietnam' },
    { name: 'Four Seasons Tented Camp', location: 'Golden Triangle' },
    { name: 'Shinta Mani Wild', location: 'Cambodia' }
  ],
  city: [
    { name: 'The Siam', location: 'Bangkok, Thailand' },
    { name: 'Park Hyatt Saigon', location: 'Ho Chi Minh City' },
    { name: 'Capella Hanoi', location: 'Hanoi, Vietnam' }
  ]
};

export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return tripKinds.map((kind) => ({ slug: tripStyleSlug(kind.title) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const kind = getTripKindBySlug(slug);

  if (kind) {
    return {
      title: `${kind.title} | Luxury Travel Style`,
      description: kind.text,
      alternates: {
        canonical: absoluteUrl(tripStylePath(kind))
      },
        openGraph: {
          title: `${kind.title} | Luxury Travel Style`,
          description: kind.text,
          url: absoluteUrl(tripStylePath(kind)),
          siteName: site.name,
          images: [{ url: absoluteUrl(kind.image) }]
        }
      };
  }

  const style = await getSingle('styles', slug);
  return pageMetadata(style);
}

export default async function StylePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kind = getTripKindBySlug(slug);
  const cmsStyle = kind ? null : await getSingle('styles', slug);

  if (!kind && !cmsStyle) notFound();

  const detail = buildStyleDetail(kind ?? cmsStyleToKind(cmsStyle as CmsItem), slug);
  const cmsBlocks = !kind ? cmsStyle?.meta.blocks || [] : [];
  const allTours = await getContent('tours');
  const styleTours = toursForStyle(allTours, detail).slice(0, 36).map((tour) => withStyleBadge(tour, detail.kind.title));

  return (
    <main className="bg-[#fbfaf7] text-navy">
      <Hero detail={detail} />
      {cmsBlocks.length ? <CmsBlockRuntime blocks={cmsBlocks} className="bg-[#fbfaf7] px-4 py-16" /> : null}
      <Experience detail={detail} />
      <Photography detail={detail} />
      <Journey detail={detail} />
      <Planning detail={detail} tours={styleTours} />
      <OtherStyles detail={detail} />
    </main>
  );
}

function Hero({ detail }: { detail: StyleDetail }) {
  return (
    <section className="relative isolate min-h-[calc(100svh-88px)] overflow-hidden bg-navy pt-[88px] text-ivory">
      <Image
        src={detail.kind.image}
        alt={detail.kind.alt}
        fill
        sizes="100vw"
        priority
        quality={100}
        className="object-cover object-center brightness-[0.78] saturate-[1.08]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,13,22,0.82)_0%,rgba(5,13,22,0.52)_46%,rgba(5,13,22,0.30)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,13,22,0.34)_0%,rgba(5,13,22,0.08)_42%,rgba(5,13,22,0.82)_100%)]" />

      <Container width="page" className="relative z-10 flex min-h-[calc(100svh-88px)] flex-col justify-between py-[28px] md:py-[36px]">
        <div className="flex flex-wrap items-center justify-between gap-[16px]">
          <Link href="/travel-styles/" className="inline-flex items-center gap-[10px] text-[15px] font-semibold text-ivory/86 transition hover:text-gold">
            <ArrowLeft className="h-4 w-4" />
            All Travel Styles
          </Link>
          <p className="hidden text-[13px] font-black uppercase tracking-[0.28em] text-ivory/58 md:block">Ha Long Luxury Journey</p>
        </div>

        <div className="max-w-[980px] pb-[20px]">
          <p className="text-[13px] font-black uppercase tracking-[0.36em] text-gold md:text-[15px]">
            {detail.kind.mood}
          </p>
          <h1 className="mt-[24px] max-w-[11ch] text-[clamp(46px,5.8vw,88px)] font-black leading-[0.88] tracking-[-0.07em] text-ivory drop-shadow-[0_20px_54px_rgba(0,0,0,0.34)]">
            {detail.kind.title}
          </h1>
          <p className="mt-[26px] max-w-[56rem] text-[22px] font-semibold leading-[1.5] text-ivory/86 md:text-[26px]">
            {detail.heroLine}
          </p>

          <div className="mt-[30px] flex flex-wrap gap-[12px]">
            <Metric icon={<CalendarDays className="h-4 w-4" />} label={compactDuration(detail.kind.duration)} />
            <Metric icon={<Users className="h-4 w-4" />} label={detail.guests} />
            <Metric icon={<TrendingUp className="h-4 w-4" />} label={detail.pace} />
            <Metric label={`from ${detail.price}`} />
          </div>

          <div className="mt-[28px]">
            <Link href="#style-tours" className="inline-flex min-h-[52px] items-center gap-[10px] rounded-full bg-gold px-[24px] text-[14px] font-black uppercase tracking-[0.16em] text-navy shadow-[0_18px_42px_rgba(200,169,106,0.26)] transition duration-300 ease-luxe hover:-translate-y-0.5 hover:bg-ivory">
              View matching tours
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Experience({ detail }: { detail: StyleDetail }) {
  return (
    <section className="bg-[#fbfaf7] py-[76px] md:py-[104px]">
      <Container width="page">
        <div className="grid gap-[44px] border-b border-navy/10 pb-[70px] lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)] lg:gap-[72px]">
          <div>
            <SectionLabel>The Experience</SectionLabel>
            <p className="mt-[28px] max-w-[760px] text-[clamp(19px,1.7vw,28px)] font-semibold leading-[1.65] tracking-[-0.04em] text-navy">
              {detail.experienceLead}
            </p>
            <p className="mt-[30px] max-w-[720px] text-[17px] font-medium leading-[1.85] text-navy/60">
              {detail.kind.text}
            </p>
          </div>

          <div className="grid gap-[26px]">
            {detail.features.map((feature) => (
              <article key={feature.title} className="grid grid-cols-[28px_minmax(0,1fr)] gap-[16px]">
                <span className="mt-[2px] grid h-[24px] w-[24px] place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold-dark">
                  <Check className="h-4 w-4" />
                </span>
                <span>
                  <h2 className="text-[18px] font-black leading-6 tracking-[-0.02em] text-navy">{feature.title}</h2>
                  <p className="mt-[8px] text-[16px] font-medium leading-7 text-navy/58">{feature.body}</p>
                </span>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function Photography({ detail }: { detail: StyleDetail }) {
  const [hero, ...supporting] = detail.gallery;

  return (
    <section className="bg-[#fbfaf7] pb-[78px]">
      <Container width="page">
        <SectionLabel>Photography</SectionLabel>
        <div className="mt-[34px] grid gap-[14px] lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="relative min-h-[360px] overflow-hidden rounded-[18px] bg-champagne md:min-h-[520px]">
            <Image src={hero.image} alt={hero.alt} fill sizes="(min-width: 1280px) 820px, 100vw" quality={100} className="object-cover" />
          </div>
          <div className="grid gap-[14px] sm:grid-cols-3 lg:grid-cols-1">
            {supporting.slice(0, 3).map((item, index) => (
              <div key={`${item.title}-${index}`} className="relative min-h-[180px] overflow-hidden rounded-[14px] border border-gold/40 bg-champagne">
                <Image src={item.image} alt={item.alt} fill sizes="(min-width: 1280px) 400px, 33vw" quality={95} className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function Journey({ detail }: { detail: StyleDetail }) {
  return (
    <section className="bg-[#fbfaf7] pb-[88px]">
      <Container width="page">
        <div className="border-y border-navy/10 py-[70px]">
          <SectionLabel>Your Journey</SectionLabel>
          <div className="mt-[42px] max-w-[900px]">
            {detail.journey.map((item, index) => (
              <details key={item.day} open={index === 0} className="group border-b border-navy/10 first:border-t">
                <summary className="grid cursor-pointer list-none grid-cols-[90px_minmax(0,1fr)_24px] gap-[16px] py-[22px] text-left [&::-webkit-details-marker]:hidden">
                  <span className="text-[14px] font-black text-gold-dark">{item.day}</span>
                  <span className="text-[18px] font-black tracking-[-0.02em] text-navy">{item.title}</span>
                  <ChevronDown className="mt-[2px] h-4 w-4 text-gold-dark transition group-open:rotate-180" />
                </summary>
                <p className="pb-[24px] pl-0 text-[16px] font-medium leading-8 text-navy/62 sm:pl-[106px]">{item.body}</p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function Planning({ detail, tours }: { detail: StyleDetail; tours: CmsItem[] }) {
  return (
    <section className="bg-[#fbfaf7] pb-[88px]">
      <Container width="page">
        <div className="grid gap-[64px] border-b border-navy/10 pb-[78px] lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1fr)]">
          <div>
            <SectionLabel>What&apos;s Included</SectionLabel>
            <ul className="mt-[32px] grid gap-[18px]">
              {detail.included.map((item) => (
                <li key={item} className="flex items-start gap-[16px] text-[18px] font-medium leading-7 text-navy">
                  <span className="mt-[3px] grid h-[20px] w-[20px] shrink-0 place-items-center rounded-full bg-gold/12 text-gold-dark">
                    <Check className="h-4 w-4" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-[48px] grid gap-[14px] text-[16px] font-medium text-navy/62">
              <a href="tel:+84962819091" className="inline-flex items-center gap-[12px] transition hover:text-gold-dark">
                <Phone className="h-4 w-4 text-gold-dark" />
                +84 962 819 091
              </a>
              <a href="mailto:info@halongluxury.com" className="inline-flex items-center gap-[12px] transition hover:text-gold-dark">
                <Mail className="h-4 w-4 text-gold-dark" />
                info@halongluxury.com
              </a>
            </div>
          </div>

          <div>
            <SectionLabel>Sample Hotels</SectionLabel>
            <div className="mt-[28px] divide-y divide-navy/10">
              {detail.hotels.map((hotel) => (
                <article key={hotel.name} className="grid grid-cols-[minmax(0,1fr)_120px] gap-[16px] py-[22px]">
                  <div>
                    <h2 className="text-[18px] font-black tracking-[-0.02em] text-navy">{hotel.name}</h2>
                    <p className="mt-[4px] text-[15px] font-medium text-navy/54">{hotel.location}</p>
                  </div>
                  <span className="flex justify-end gap-[3px] text-gold-dark" aria-label="Five star hotel">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </span>
                </article>
              ))}
            </div>
            <p className="mt-[20px] text-[15px] italic leading-7 text-navy/48">
              Hotels vary by departure date and availability. All properties meet our quality standard.
            </p>
          </div>
        </div>

        <div id="style-tours" className="scroll-mt-[112px] pt-[56px]">
          <div className="flex flex-col gap-[24px] md:flex-row md:items-end md:justify-between">
            <div>
              <SectionLabel>{detail.kind.title} Tours</SectionLabel>
              <h2 className="mt-[24px] max-w-[16ch] text-[clamp(30px,3.5vw,56px)] font-black leading-[0.98] tracking-[-0.065em] text-navy">
                Tours matched to this style.
              </h2>
              <p className="mt-[22px] max-w-[720px] text-[17px] font-medium leading-8 text-navy/62">
                These journeys are tagged and ranked for {detail.kind.title.toLowerCase()} based on route, activities, water time and the tour style data.
              </p>
            </div>
            <Link href="/customize-your-trip/" className="inline-flex min-h-[52px] shrink-0 items-center justify-center gap-[10px] rounded-full border border-gold/35 bg-[#fffdf7] px-[22px] text-[12px] font-black uppercase tracking-[0.16em] text-navy shadow-[0_12px_28px_rgba(11,27,43,0.06)] transition hover:-translate-y-0.5 hover:bg-gold">
              Customize this style
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {tours.length > 0 ? (
            <StyleTourCarousel tours={tours} styleTitle={detail.kind.title} />
          ) : (
            <div className="mt-[38px] rounded-[30px] border border-gold/22 bg-[#fffaf0] p-[28px] shadow-[0_18px_46px_rgba(11,27,43,0.07)]">
              <h3 className="font-serif text-[clamp(28px,3vw,46px)] font-semibold leading-[1] tracking-[-0.06em] text-navy">No fixed tour matched yet.</h3>
              <p className="mt-4 max-w-[58ch] text-[16px] font-medium leading-7 text-navy/62">This style can still be built as a private itinerary. Tell us your dates and we will design the route around the best season and water conditions.</p>
              <Link href="/customize-your-trip/" className="mt-6 inline-flex min-h-[52px] items-center justify-center rounded-full bg-navy px-[22px] text-[12px] font-black uppercase tracking-[0.16em] text-ivory transition hover:bg-gold hover:text-navy">
                Build a private route
              </Link>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

function OtherStyles({ detail }: { detail: StyleDetail }) {
  return (
    <section className="bg-[#fbfaf7] pb-[94px]">
      <Container width="page">
        <SectionLabel>Other Styles</SectionLabel>
        <div className="mt-[34px] grid gap-[20px] md:grid-cols-3">
          {detail.related.map((kind) => (
            <Link key={kind.title} href={tripStylePath(kind)} className="group relative min-h-[296px] overflow-hidden rounded-[16px] bg-navy text-ivory shadow-[0_18px_46px_rgba(11,27,43,0.12)]">
              <Image src={kind.image} alt={kind.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-700 ease-luxe group-hover:scale-105" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,31,0.06),rgba(7,17,31,0.78))]" />
              <div className="absolute bottom-[22px] left-[20px] right-[20px]">
                <p className="text-[12px] font-black uppercase tracking-[0.22em] text-gold">{kind.mood}</p>
                <h2 className="mt-[8px] text-[23px] font-black leading-7 tracking-[-0.04em] text-ivory">{kind.title}</h2>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Metric({ icon, label }: { icon?: ReactNode; label: string }) {
  return (
    <span className="inline-flex min-h-[42px] items-center gap-[9px] rounded-full border border-ivory/18 bg-ivory/12 px-[16px] text-[15px] font-semibold text-ivory/88 shadow-[inset_0_1px_0_rgba(248,245,239,0.10)] backdrop-blur-sm">
      {icon ? <span className="text-gold">{icon}</span> : null}
      {label}
    </span>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-[13px] font-black uppercase tracking-[0.36em] text-gold-dark">{children}</p>;
}

function compactDuration(value: string) {
  return value.replace(/\s+to\s+/i, '-');
}

function readText(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function readStringArray(value: unknown) {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  if (typeof value === 'string' && value.trim()) return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
}

const styleAliasSlugs: Record<string, string[]> = {
  'beach-vacation': ['beach-escapes', 'island-villas', 'diving-and-marine', 'honeymoon'],
  luxury: ['luxury-stays', 'island-villas', 'celebration-trips', 'golf-holidays', 'wellness-and-spa'],
  culinary: ['culinary-journeys'],
  family: ['family-holidays'],
  honeymoon: ['honeymoon', 'island-villas'],
  adventure: ['adventure-vacations', 'mountain-retreats', 'waterfall-retreats', 'wildlife-and-safari'],
  culture: ['culture-and-heritage', 'photography-trips', 'rail-journeys', 'city-breaks'],
  private: []
};

const styleMatcherPatterns: Record<string, RegExp[]> = {
  'beach-escapes': [/\bbeach\b/i, /\bcoast|coastal|shore|seaside\b/i, /\bphu\s*quoc|nha\s*trang|mui\s*ne|phan\s*thiet\b/i, /\bresort|island\b/i],
  'island-villas': [/\bisland|villa|private hideaway\b/i, /\bphu\s*quoc|phuket|koh\s*samui|phi\s*phi|krabi\b/i, /\bpool villa|overwater\b/i],
  honeymoon: [/\bhoneymoon|romantic|romance|couple\b/i, /\banniversary|private dinner\b/i],
  'luxury-stays': [/\bluxury|deluxe|premium|ultimate|signature|resort\b/i, /\baman|six senses|capella|rosewood|park hyatt\b/i],
  'culture-and-heritage': [/\bculture|cultural|heritage|temple|imperial|citadel|ancient|local\b/i, /\bangkor|hoi\s*an|hue|luang\s*prabang|bagan\b/i],
  'adventure-vacations': [/\badventure|trek|hiking|cycling|biking|motorbike|kayak\b/i, /\bmountain|trail|cave|forest\b/i],
  'waterfall-retreats': [/\bwaterfall|kuang\s*si|ban\s*gioc\b/i, /\bforest pool|nature reset\b/i],
  'culinary-journeys': [/\bfood|cooking|culinary|cuisine|market|chef|taste\b/i, /\bstreet food|dining|kitchen\b/i],
  'family-holidays': [/\bfamily|kid|children|multi-generation\b/i, /\bconnecting room|pool time\b/i],
  'wellness-and-spa': [/\bwellness|spa|yoga|retreat|healing|herbal\b/i, /\bmassage|recovery|restorative\b/i],
  'wildlife-and-safari': [/\bwildlife|safari|elephant|bird|nature reserve\b/i, /\bnational park|naturalist\b/i],
  'cruise-voyages': [/\bcruise|river cruise|bay cruise|cabin|onboard\b/i, /\bha\s*long|halong|lan\s*ha|mekong\b/i],
  'photography-trips': [/\bphotography|photo|camera|golden hour|viewpoint\b/i],
  'celebration-trips': [/\bcelebration|birthday|anniversary|milestone|private event\b/i],
  'mountain-retreats': [/\bmountain|highland|sapa|ha\s*giang|mai\s*chau|pu\s*luong\b/i, /\blodge|valley|viewpoint\b/i],
  'city-breaks': [/\bcity|urban|bangkok|saigon|ho\s*chi\s*minh|hanoi\b/i, /\brooftop|neighborhood|street\b/i],
  'rail-journeys': [/\brail|train|railway\b/i],
  'diving-and-marine': [/\bdiving|marine|snorkel|snorkeling|scuba|reef\b/i, /\bspeedboat|boat|lagoon|ocean\b/i, /\bphu\s*quoc|nha\s*trang|cham island|con\s*dao|phuket|phi\s*phi|krabi|koh\s*tao|similan\b/i],
  'golf-holidays': [/\bgolf|fairway|tee time|course\b/i],
  'multi-country': [/\bmulti-country|indochina|vietnam\s*-\s*cambodia|vietnam\s*-\s*laos|thailand.*vietnam|cambodia.*laos\b/i]
};

function tourSearchText(tour: CmsItem) {
  const details = tour.meta.details || {};
  return [
    tour.title,
    tour.slug,
    tour.excerpt,
    tour.content,
    readText(details.style),
    readText(details.route),
    readText(details.theme),
    readText(details.country),
    readText(details.sourceUrl),
    readStringArray(details.places).join(' '),
    readStringArray(details.highlights).join(' '),
    readStringArray(details.includes).join(' ')
  ]
    .join(' ')
    .toLowerCase();
}

function explicitTourStyleSlugs(tour: CmsItem) {
  const details = tour.meta.details || {};
  const rawSlugs = [
    ...readStringArray(details.travelStyleSlugs),
    ...readStringArray(details.travelStyles),
    readText(details.travelStyleSlug),
    readText(details.travelStyle)
  ].filter(Boolean);
  const style = readText(details.style);
  const normalizedStyle = tripStyleSlug(style);
  return Array.from(new Set([...rawSlugs.map(tripStyleSlug), normalizedStyle, ...(styleAliasSlugs[normalizedStyle] || [])].filter(Boolean)));
}

function tourStyleScore(tour: CmsItem, kind: TripKind) {
  const slug = tripStyleSlug(kind.title);
  const explicitSlugs = explicitTourStyleSlugs(tour);
  let score = explicitSlugs.includes(slug) ? 42 : 0;
  const haystack = tourSearchText(tour);
  const titleText = `${tour.title} ${tour.excerpt}`.toLowerCase();
  const patterns = styleMatcherPatterns[slug] || [];

  for (const pattern of patterns) {
    if (pattern.test(haystack)) score += 14;
    if (pattern.test(titleText)) score += 120;
  }

  if (slug === 'culture-and-heritage' && /\bculture|cultural|heritage\b/i.test(titleText)) score += 220;
  if (tripStyleSlug(readText(tour.meta.details?.style)) === slug) score += 60;
  if (score > 0 && tour.featuredImage) score += 2;
  return score;
}

function toursForStyle(tours: CmsItem[], detail: StyleDetail) {
  return tours
    .map((tour) => ({ tour, score: tourStyleScore(tour, detail.kind) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.tour.title.localeCompare(b.tour.title))
    .map(({ tour }) => tour);
}

function withStyleBadge(tour: CmsItem, styleTitle: string): CmsItem {
  const details = tour.meta.details || {};
  const slug = tripStyleSlug(styleTitle);
  const slugs = Array.from(new Set([...explicitTourStyleSlugs(tour), slug]));

  return {
    ...tour,
    meta: {
      ...tour.meta,
      details: {
        ...details,
        style: styleTitle,
        travelStyleSlugs: slugs
      }
    }
  };
}

function cmsStyleToKind(style: CmsItem): TripKind {
  return {
    num: '01',
    title: style.title,
    eyebrow: 'Private style',
    text: style.excerpt || 'A private journey shaped around your preferred mood, route and pace.',
    href: '/customize-your-trip/',
    image: style.featuredImage || '/images/trip-styles/luxury-stays-4k.jpg',
    alt: style.title,
    duration: 'Flexible',
    mood: 'Private and refined'
  };
}

function buildStyleDetail(kind: TripKind, requestedSlug: string): StyleDetail {
  const index = Math.max(0, tripKinds.findIndex((item) => item.title === kind.title));
  const slug = tripStyleSlug(kind.title) || requestedSlug;
  const gallery = circularKinds(index, 4, kind);
  const related = circularKinds(index + 1, 3, kind);
  const tone = styleTone(kind);
  const price = priceFor(index, tone);

  return {
    slug,
    kind,
    destination: destinationByTone[index] || 'Southeast Asia',
    price,
    guests: tone === 'family' ? '2-10 guests' : '2-8 guests',
    pace: paceFor(tone),
    heroLine: heroLineFor(tone),
    experienceLead: experienceLeadFor(kind, tone),
    features: featuresFor(tone),
    journey: journeyFor(kind, tone),
    included: includedFor(tone),
    hotels: hotelsFor(tone),
    gallery,
    related
  };
}

function circularKinds(startIndex: number, count: number, fallback: TripKind) {
  if (!tripKinds.length) return [fallback];
  return Array.from({ length: count }, (_, offset) => tripKinds[(startIndex + offset + tripKinds.length) % tripKinds.length]);
}

function styleTone(kind: TripKind) {
  const haystack = `${kind.title} ${kind.eyebrow} ${kind.mood} ${kind.text}`.toLowerCase();
  if (/beach|island|honeymoon|cruise|diving|marine/.test(haystack)) return 'coast';
  if (/culture|heritage|culinary|photography|rail/.test(haystack)) return 'culture';
  if (/family/.test(haystack)) return 'family';
  if (/adventure|wildlife|mountain|waterfall|nature/.test(haystack)) return 'nature';
  if (/city|golf/.test(haystack)) return 'city';
  if (/wellness|spa/.test(haystack)) return 'wellness';
  return 'luxury';
}

function priceFor(index: number, tone: string) {
  const base = tone === 'coast' ? 2400 : tone === 'luxury' ? 2200 : tone === 'family' ? 1800 : tone === 'nature' ? 1900 : 2000;
  return `US $${(base + (index % 4) * 250).toLocaleString('en-US')} pp`;
}

function paceFor(tone: string) {
  if (tone === 'nature') return 'Active';
  if (tone === 'city') return 'Polished';
  if (tone === 'family') return 'Easy';
  return 'Easy';
}

function heroLineFor(tone: string) {
  if (tone === 'coast') return 'The journey is the destination. Literally.';
  if (tone === 'culture') return 'Stories, tastes and heritage paced with private calm.';
  if (tone === 'nature') return 'Fresh air, good lodges and active days without rough edges.';
  if (tone === 'family') return 'A private holiday rhythm that keeps everyone comfortable.';
  if (tone === 'wellness') return 'Quiet recovery with every transfer and pause handled.';
  return 'A refined private route shaped around your idea of luxury.';
}

function experienceLeadFor(kind: TripKind, tone: string) {
  if (tone === 'coast') return `${kind.title} chosen for their water, their pacing and the quality of the stops. Transfers are private. Days are slow. Every detail is well chosen.`;
  if (tone === 'culture') return `${kind.title} shaped around context, local hosts and generous timing. You see more because the day is not rushed.`;
  if (tone === 'nature') return `${kind.title} designed for movement, scenery and recovery. The route stays active without losing comfort.`;
  if (tone === 'family') return `${kind.title} planned around safe transfers, easy meals and a pace that works for different ages.`;
  return `${kind.title} built as a private, polished journey with calm logistics and enough space for personal moments.`;
}

function featuresFor(tone: string) {
  if (tone === 'coast') {
    return [
      { title: 'Private beach access', body: 'Dedicated beach areas, shaded loungers and a discreet beach host when available.' },
      { title: 'Sunset water transfers', body: 'Speedboat or private transfer timing arranged around the best light.' },
      { title: 'In-villa dining', body: 'Breakfasts and special dinners can be served privately where the property allows.' },
      { title: 'Marine excursions', body: 'Snorkeling, paddling, sailing or bay time arranged around weather and tide.' }
    ];
  }

  if (tone === 'nature') {
    return [
      { title: 'Private guide pacing', body: 'Active days are adjusted around fitness, weather and comfort.' },
      { title: 'View-led routing', body: 'Scenic stops are placed where the light and timing work best.' },
      { title: 'Comfortable recovery', body: 'Good hotels, spa time and slower evenings protect the journey.' },
      { title: 'Seamless transfers', body: 'Drivers, luggage and route timing are handled before you arrive.' }
    ];
  }

  if (tone === 'family') {
    return [
      { title: 'Kid-aware pacing', body: 'Shorter touring blocks, pool time and meals planned before the day feels heavy.' },
      { title: 'Safe private transfers', body: 'Door-to-door movement with sensible timing and fewer handoff points.' },
      { title: 'Flexible guiding', body: 'Guides can slow down, simplify or adjust the route in real time.' },
      { title: 'Room planning', body: 'Connecting rooms, villas and family-friendly hotels are prioritized.' }
    ];
  }

  return [
    { title: 'Private expert guiding', body: 'Guides add context and access without turning the day into a checklist.' },
    { title: 'Signature hotel choices', body: 'Hotels are selected for service, location and a sense of place.' },
    { title: 'Calm route design', body: 'Each movement is checked against distance, weather and the desired pace.' },
    { title: 'Concierge support', body: 'Your designer keeps the plan flexible before and during the trip.' }
  ];
}

function journeyFor(kind: TripKind, tone: string) {
  if (tone === 'coast') {
    return [
      { day: 'Day 1', title: 'Arrival & Immersion', body: 'Private airport pickup, welcome drink, villa orientation and a quiet first evening by the water.' },
      { day: 'Day 2-4', title: 'Slow Days', body: 'Beach time, soft excursions and dining arranged around weather, privacy and your preferred rhythm.' },
      { day: 'Day 5-6', title: 'Island Excursion', body: 'A private boat, reef or bay experience with enough recovery time when you return.' },
      { day: 'Day 7', title: 'Farewell Morning', body: 'A slow breakfast, final swim and private transfer onward.' }
    ];
  }

  if (tone === 'nature') {
    return [
      { day: 'Day 1', title: 'Arrive & Settle', body: 'Private transfer to the first lodge with time to settle in before dinner.' },
      { day: 'Day 2-3', title: 'Viewpoints & Trails', body: 'Active touring balanced with comfortable pacing and recovery windows.' },
      { day: 'Day 4-5', title: 'Local Encounters', body: 'Guided stops, market time or wildlife viewing selected around season and light.' },
      { day: 'Day 6', title: 'Soft Landing', body: 'A lighter final day before your onward route.' }
    ];
  }

  return [
    { day: 'Day 1', title: 'Arrival & Orientation', body: `Private arrival support and a gentle introduction to the ${kind.title.toLowerCase()} rhythm.` },
    { day: 'Day 2-3', title: 'Signature Experiences', body: 'Private guiding, curated stops and enough open space to enjoy the destination.' },
    { day: 'Day 4-5', title: 'Deeper Discovery', body: 'Hotels, dining and local access refined around your preferred pace.' },
    { day: 'Day 6', title: 'Departure or Extension', body: 'Continue the route or slow the final morning before a private transfer.' }
  ];
}

function includedFor(tone: string) {
  const shared = [
    'Private airport transfers throughout',
    'Daily breakfast and selected private dining',
    'Dedicated travel designer before departure',
    '24/7 concierge support during travel'
  ];

  if (tone === 'coast') {
    return ['Luxury beachfront villa or resort stay', 'Private water transfers where required', 'Two half-day marine excursions', ...shared];
  }

  if (tone === 'family') {
    return ['Family room planning and safe transfer timing', 'Kid-friendly guide recommendations', 'Flexible touring windows', ...shared];
  }

  return ['Luxury hotel or boutique lodge selection', 'Private guiding on signature days', 'Route and restaurant recommendations', ...shared];
}

function hotelsFor(tone: string) {
  if (tone === 'coast' || tone === 'wellness') return hotelSets.coast;
  if (tone === 'culture') return hotelSets.culture;
  if (tone === 'nature') return hotelSets.nature;
  if (tone === 'city') return hotelSets.city;
  return hotelSets.culture;
}
