import Link from 'next/link';
import { DestinationCard3D } from '@/components/3d/destination-card-3d';
import { Container, Grid12 } from '@/components/layout/container';
import { Eyebrow, Heading, Lead } from '@/components/ui/typography';
import { bookingCatalogStats, bookingDestinations } from '@/lib/booking-options';
import { hubs } from '@/lib/fallback-data';
import { hubOrder } from '@/lib/routing';
import type { HubKey } from '@/lib/types';
import type { DestinationsContent } from '@/lib/site-content-schema';
import { defaultHomeSectionContent } from '@/lib/site-content-schema';

const image = (fileName: string) => `/images/destinations/${fileName}`;

type DestinationAtlasCard = {
  hub: HubKey;
  label: string;
  image: string;
  imageAlt: string;
  imagePosition?: string;
  landmarks: string[];
  routeNote: string;
  className: string;
};

const destinationAtlas: DestinationAtlasCard[] = [
  {
    hub: 'vietnam',
    label: 'Vietnam',
    image: image('vietnam-ha-long-bay.jpg'),
    imageAlt: 'Ha Long Bay limestone karsts and luxury cruise routes in northern Vietnam',
    imagePosition: '54% 46%',
    landmarks: ['Ha Long Bay', 'Hanoi', 'Hoi An'],
    routeNote: 'Limestone cruising, heritage cities and lantern-lit coastal evenings in one refined route.',
    className: 'sm:col-span-2 lg:col-span-7 lg:row-span-4 min-h-[34rem] lg:min-h-0'
  },
  {
    hub: 'laos',
    label: 'Laos',
    image: image('laos-kuang-si-falls.jpg'),
    imageAlt: 'Turquoise Kuang Si waterfall pools near Luang Prabang, Laos',
    imagePosition: '48% 58%',
    landmarks: ['Luang Prabang', 'Mekong', 'Kuang Si'],
    routeNote: 'Slow luxury, river days, waterfall pauses and spiritual mornings along the Mekong.',
    className: 'lg:col-span-5 lg:row-span-2 min-h-[24rem] lg:min-h-0'
  },
  {
    hub: 'cambodia',
    label: 'Cambodia',
    image: image('cambodia-angkor-wat.jpg'),
    imageAlt: 'Angkor Wat reflected at sunrise in Siem Reap, Cambodia',
    imagePosition: '50% 52%',
    landmarks: ['Angkor', 'Siem Reap', 'Tonle Sap'],
    routeNote: 'Ancient grandeur, expert guiding and quieter temple pacing around Siem Reap.',
    className: 'lg:col-span-5 lg:row-span-2 min-h-[24rem] lg:min-h-0'
  },
  {
    hub: 'thailand',
    label: 'Thailand',
    image: image('thailand-temple.jpg'),
    imageAlt: 'Golden temple architecture for private Thailand travel',
    imagePosition: '50% 45%',
    landmarks: ['Bangkok', 'Chiang Mai', 'Phuket'],
    routeNote: 'Temple mornings, mountain craft and island resorts with private transfers throughout.',
    className: 'lg:col-span-4 lg:row-span-2 min-h-[24rem] lg:min-h-0'
  },
  {
    hub: 'myanmar',
    label: 'Myanmar',
    image: '/images/hubs/myanmar-bagan-temples-4k.jpg',
    imageAlt: 'Hot air balloons rising over the temple plain of Bagan in Myanmar',
    imagePosition: '50% 46%',
    landmarks: ['Bagan', 'Yangon', 'Inle Lake'],
    routeNote: 'Golden plains, teak heritage and lakeside villages arranged with careful private pacing.',
    className: 'lg:col-span-4 lg:row-span-2 min-h-[24rem] lg:min-h-0'
  },
  {
    hub: 'multi-country',
    label: 'Multi Country',
    image: image('multi-country-route-map.jpg'),
    imageAlt: 'Travel map and camera used to plan a multi-country Southeast Asia route',
    imagePosition: '55% 55%',
    landmarks: ['Indochina', 'Smart flights', 'Private routing'],
    routeNote: 'Vietnam, Laos, Cambodia, Thailand and Myanmar connected without wasting traveler energy.',
    className: 'sm:col-span-2 lg:col-span-4 lg:row-span-2 min-h-[24rem] lg:min-h-0'
  }
];

const destinationHubKeysByLabel: Record<string, HubKey> = {
  Vietnam: 'vietnam',
  Laos: 'laos',
  Cambodia: 'cambodia',
  Thailand: 'thailand',
  Myanmar: 'myanmar',
  Indonesia: 'indonesia',
  Malaysia: 'malaysia',
  Singapore: 'singapore',
  Philippines: 'philippines',
  China: 'china',
  'Hong Kong': 'hong-kong',
  Japan: 'japan',
  'South Korea': 'south-korea',
  Bhutan: 'bhutan',
  Nepal: 'nepal',
  India: 'india',
  'Sri Lanka': 'sri-lanka',
  'Multi Country': 'multi-country'
};

const destinationByHubKey = new Map(bookingDestinations.map((destination) => [destinationHubKeysByLabel[destination.label], destination]));

const destinationIndex = hubOrder.map((hub, index) => {
  const destination = destinationByHubKey.get(hub.key);
  const label = destination?.label || hub.label.replace(/\s+Tours$/, '');
  return {
    label,
    note: destination?.note || hubs[hub.key].intro,
    count: bookingCatalogStats.countryCounts[label as keyof typeof bookingCatalogStats.countryCounts] || 0,
    href: hub.path,
    rank: String(index + 1).padStart(2, '0')
  };
});

export function DestinationMosaic({ content = defaultHomeSectionContent.destinations }: { content?: DestinationsContent } = {}) {
  const atlas = content.atlas.length === destinationAtlas.length
    ? destinationAtlas.map((card, index) => ({ ...card, ...content.atlas[index], hub: card.hub }))
    : destinationAtlas;
  return (
    <section id="destinations" className="relative overflow-hidden bg-ivory py-20 sm:py-24 lg:py-32">
      <div className="pointer-events-none absolute left-[-12rem] top-[-14rem] h-[34rem] w-[34rem] rounded-full bg-gold/8 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-18rem] right-[-14rem] h-[38rem] w-[38rem] rounded-full bg-navy/6 blur-3xl" />
      <Container width="page">
        <Grid12 className="relative items-start gap-y-12 lg:gap-x-12">
          <div className="md:col-span-3 lg:sticky lg:top-28">
            <Eyebrow>{content.eyebrow}</Eyebrow>
            <Heading className="ds-gold-rule mt-4 max-w-full text-navy sm:max-w-[18ch] lg:max-w-[10ch]">{content.heading}</Heading>
            <Lead className="mt-8 max-w-[30rem]">
              {content.lead.replace('all destination hubs', `all ${destinationIndex.length} destination hubs`)}
            </Lead>
            <div className="mt-10 rounded-[28px] border border-navy/10 bg-pearl/88 p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-gold">{content.indexEyebrow}</p>
                  <p className="mt-2 max-w-[20ch] text-[13px] font-bold leading-6 text-navy/52">
                    {content.indexCaption.replace('thousands of tour facts', `${bookingCatalogStats.totalTours.toLocaleString('en-US')} tour facts`)}
                  </p>
                </div>
                <span className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-gold-dark">
                  {destinationIndex.length} hubs
                </span>
              </div>
              <nav aria-label="Destination country hubs" className="mt-6 grid max-h-[min(62vh,760px)] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 md:grid-cols-1">
                {destinationIndex.map((destination) => (
                  <Link
                    key={destination.label}
                    href={destination.href}
                    title={destination.note}
                    className="group flex min-h-[64px] items-center justify-between gap-4 rounded-[22px] border border-navy/10 bg-[linear-gradient(135deg,rgba(255,254,251,0.98),rgba(241,233,219,0.94))] px-4 py-3 text-navy transition duration-300 hover:-translate-y-0.5 hover:border-gold/35 hover:shadow-[0_16px_36px_rgba(11,27,43,0.08)]"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/18 bg-gold/10 text-[11px] font-black uppercase tracking-[0.16em] text-gold-dark">
                        {destination.rank}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-black uppercase tracking-[0.03em] text-navy">
                          {destination.label}
                        </span>
                        <span className="mt-1 block truncate text-[11px] font-bold text-navy/46">
                          {destination.note}
                        </span>
                      </span>
                    </span>
                    <span className="rounded-full border border-gold/18 bg-gold/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-gold-dark transition group-hover:bg-gold group-hover:text-navy">
                      {destination.count} tours
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-9 lg:grid-flow-dense lg:auto-rows-[8rem] lg:grid-cols-12">
            {atlas.map((destination, index) => {
              const hub = hubs[destination.hub];
              const variant = index === 0 ? 'feature' : 'standard';
              return (
                <DestinationCard3D
                  key={destination.hub}
                  href={`/${hub.slug}/`}
                  title={hub.title}
                  kicker={destination.label}
                  image={destination.image}
                  imageAlt={destination.imageAlt}
                  imagePosition={destination.imagePosition}
                  landmarks={destination.landmarks}
                  imagePriority={index < 2}
                  variant={variant}
                  className={destination.className}
                >
                  {variant !== 'standard' ? <p>{destination.routeNote}</p> : null}
                </DestinationCard3D>
              );
            })}
          </div>
        </Grid12>
      </Container>
    </section>
  );
}
