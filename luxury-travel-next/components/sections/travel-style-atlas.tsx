'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { tripKinds, tripStylePath, type TripKind } from '@/lib/trip-styles';
import { cn } from '@/lib/utils';
import type { TravelStylesPageContent } from '@/lib/site-content-schema';
import { defaultStaticPagesContent } from '@/lib/site-content-schema';

type StyleFilterKey = 'all' | 'luxury' | 'romantic' | 'family' | 'culture' | 'adventure' | 'water' | 'city' | 'wellness' | 'nature' | 'multi-country';

type StyleFilter = {
  key: StyleFilterKey;
  label: string;
  keywords: string[];
};

type StyleTag = {
  key: Exclude<StyleFilterKey, 'all'>;
  label: string;
  keywords: string[];
  className: string;
};

const styleFilters: StyleFilter[] = [
  { key: 'all', label: 'All styles', keywords: [] },
  { key: 'luxury', label: 'Luxury', keywords: ['luxury', 'signature', 'polished', 'refined', 'premium', 'villa', 'hotel', 'golf'] },
  { key: 'romantic', label: 'Romantic', keywords: ['honeymoon', 'romantic', 'celebration', 'anniversary', 'intimate'] },
  { key: 'family', label: 'Family', keywords: ['family', 'kid', 'safe', 'relaxed'] },
  { key: 'culture', label: 'Culture', keywords: ['culture', 'heritage', 'history', 'culinary', 'photography', 'rail'] },
  { key: 'adventure', label: 'Adventure', keywords: ['adventure', 'active', 'mountain', 'safari', 'trail', 'diving', 'wildlife'] },
  { key: 'water', label: 'Water', keywords: ['beach', 'island', 'cruise', 'water', 'bay', 'ocean', 'sea', 'river', 'marine'] },
  { key: 'city', label: 'City', keywords: ['city', 'urban', 'break', 'rail'] },
  { key: 'wellness', label: 'Wellness', keywords: ['wellness', 'spa', 'restorative', 'recovery', 'retreat'] },
  { key: 'nature', label: 'Nature', keywords: ['nature', 'waterfall', 'wildlife', 'mountain', 'forest', 'highland', 'marine'] },
  { key: 'multi-country', label: 'Multi-city', keywords: ['multi country', 'multi-country', 'borders', 'connected', 'indochina', 'rail', 'cruise'] }
];

const styleTags: StyleTag[] = [
  { key: 'luxury', label: 'Luxury', keywords: styleFilters[1].keywords, className: 'border-[#dcc48c] bg-[#fff8e8] text-[#8a641d]' },
  { key: 'romantic', label: 'Romantic', keywords: styleFilters[2].keywords, className: 'border-[#efc4bd] bg-[#fff3ef] text-[#a84c3d]' },
  { key: 'family', label: 'Family', keywords: styleFilters[3].keywords, className: 'border-[#b8cfe6] bg-[#f1f7fc] text-[#315c84]' },
  { key: 'culture', label: 'Culture', keywords: styleFilters[4].keywords, className: 'border-[#d9c6a2] bg-[#fbf3e3] text-[#84622e]' },
  { key: 'adventure', label: 'Adventure', keywords: styleFilters[5].keywords, className: 'border-[#a9cbb0] bg-[#f2faef] text-[#356f41]' },
  { key: 'water', label: 'Water', keywords: styleFilters[6].keywords, className: 'border-[#a9d8df] bg-[#edfafe] text-[#24727d]' },
  { key: 'city', label: 'City', keywords: styleFilters[7].keywords, className: 'border-[#cbd3dd] bg-[#f5f7f9] text-[#384b60]' },
  { key: 'wellness', label: 'Wellness', keywords: styleFilters[8].keywords, className: 'border-[#a9d3c4] bg-[#effaf5] text-[#34705f]' },
  { key: 'nature', label: 'Nature', keywords: styleFilters[9].keywords, className: 'border-[#c4d59c] bg-[#f7f9ea] text-[#637b23]' },
  { key: 'multi-country', label: 'Multi-city', keywords: styleFilters[10].keywords, className: 'border-[#bdc7e8] bg-[#f3f5ff] text-[#3d538d]' }
];

function styleHaystack(kind: TripKind) {
  return [kind.title, kind.eyebrow, kind.mood, kind.duration, kind.text, kind.href].join(' ').toLowerCase();
}

function matchesKeywords(haystack: string, keywords: string[]) {
  return keywords.some((keyword) => haystack.includes(keyword));
}

function matchStyleFilter(kind: TripKind, filter: StyleFilter) {
  if (filter.key === 'all') return true;
  return matchesKeywords(styleHaystack(kind), filter.keywords);
}

function tagsForKind(kind: TripKind) {
  const haystack = styleHaystack(kind);
  const tags = styleTags.filter((tag) => matchesKeywords(haystack, tag.keywords));
  return (tags.length ? tags : [styleTags[0]]).slice(0, 2);
}

function compactDuration(value: string) {
  return value.replace(/\s+to\s+/i, '-').replace(/days$/i, 'days').trim();
}

function StyleTagPill({ tag }: { tag: StyleTag }) {
  return (
    <span className={cn('inline-flex min-h-[28px] items-center rounded-full border px-[12px] py-[6px] text-[12px] font-extrabold leading-none', tag.className)}>
      {tag.label}
    </span>
  );
}

export function TravelStyleAtlas({ content = defaultStaticPagesContent.travelStyles }: { content?: TravelStylesPageContent } = {}) {
  const [activeFilterKey, setActiveFilterKey] = useState<StyleFilterKey>('all');
  const [query, setQuery] = useState('');

  const activeFilter = useMemo(
    () => styleFilters.find((filter) => filter.key === activeFilterKey) ?? styleFilters[0],
    [activeFilterKey]
  );

  const normalizedQuery = query.trim().toLowerCase();

  const filterCounts = useMemo(() => {
    return styleFilters.reduce((counts, filter) => {
      counts[filter.key] = tripKinds.filter((kind) => matchStyleFilter(kind, filter)).length;
      return counts;
    }, {} as Record<StyleFilterKey, number>);
  }, []);

  const filteredKinds = useMemo(() => {
    return tripKinds.filter((kind) => {
      const haystack = styleHaystack(kind);
      const matchesFilter = matchStyleFilter(kind, activeFilter);
      const matchesSearch = !normalizedQuery || haystack.includes(normalizedQuery);
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, normalizedQuery]);

  const resultLabel = `${filteredKinds.length} ${filteredKinds.length === 1 ? 'style' : 'styles'}`;

  return (
    <section className="relative min-h-[clamp(680px,94svh,920px)] overflow-hidden bg-[linear-gradient(180deg,#f7f2e9_0%,#fbfaf7_44%,#f7f2e9_100%)] pb-20 text-navy md:pb-24">
      <div className="relative min-h-[540px] overflow-hidden bg-navy pt-[108px] text-ivory md:min-h-[660px] md:pt-[122px]">
        <Image
          src={content.heroImage}
          alt="Ha Long Bay limestone islands at golden hour"
          fill
          priority
          sizes="100vw"
          quality={100}
          className="object-cover object-center brightness-[0.78] contrast-[1.04] saturate-[1.08]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,13,22,0.86)_0%,rgba(5,13,22,0.58)_45%,rgba(5,13,22,0.28)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,13,22,0.20)_0%,rgba(5,13,22,0.08)_42%,rgba(5,13,22,0.84)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(200,169,106,0.20),transparent_24%),radial-gradient(circle_at_80%_12%,rgba(248,245,239,0.10),transparent_24%)]" />

        <Container width="page" className="relative z-10 flex min-h-[484px] items-end md:min-h-[606px]">
          <div className="max-w-[980px] pb-[68px] md:pb-[90px]">
            <p className="text-[12px] font-black uppercase tracking-[0.32em] text-gold md:text-[13px]">
              {content.heroEyebrow}
            </p>
            <h1 className="mt-[18px] max-w-[900px] text-[clamp(40px,5vw,72px)] font-black leading-[0.92] tracking-[-0.07em] text-ivory drop-shadow-[0_18px_44px_rgba(0,0,0,0.30)]">
              {content.heroTitle}
            </h1>
            <p className="mt-[24px] max-w-[720px] text-[16px] font-semibold leading-7 text-ivory/82 md:text-[18px] md:leading-8">
              {content.heroLead.replace('{count}', String(tripKinds.length))}
            </p>
            <div className="mt-[28px] flex flex-wrap gap-[10px]">
              <span className="inline-flex min-h-[38px] items-center rounded-full border border-ivory/20 bg-ivory/12 px-[16px] text-[12px] font-black uppercase tracking-[0.14em] text-ivory/86 backdrop-blur-sm">
                {tripKinds.length} {content.stylesBadgeSuffix}
              </span>
              <span className="inline-flex min-h-[38px] items-center rounded-full border border-gold/35 bg-gold/18 px-[16px] text-[12px] font-black uppercase tracking-[0.14em] text-gold backdrop-blur-sm">
                {content.privateBadge}
              </span>
            </div>
          </div>
        </Container>
      </div>

      <Container width="page" className="relative z-20">
        <div className="mx-auto w-full">
          <div className="relative -mt-[64px] overflow-hidden rounded-[38px] border border-ivory/80 bg-[linear-gradient(135deg,rgba(255,253,248,0.98)_0%,rgba(248,243,233,0.97)_100%)] px-[24px] py-[24px] shadow-[0_34px_110px_rgba(11,27,43,0.20)] backdrop-blur-md md:-mt-[74px] md:px-[32px] md:py-[30px]">
            <div className="pointer-events-none absolute inset-x-[24px] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(200,169,106,0.75),transparent)]" />

            <div className="mb-[20px] flex flex-col gap-[14px] sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[12px] font-black uppercase tracking-[0.30em] text-gold-dark">
                {content.refineEyebrow}
              </p>
              <div className="flex flex-wrap gap-[10px]">
                <span className="inline-flex min-h-[40px] items-center rounded-full border border-gold/25 bg-gold/12 px-[16px] text-[12px] font-black uppercase tracking-[0.13em] text-gold-dark">
                  {resultLabel}
                </span>
                <span className="inline-flex min-h-[40px] items-center rounded-full border border-navy/10 bg-navy/[0.045] px-[16px] text-[12px] font-black uppercase tracking-[0.13em] text-navy/58">
                  {activeFilter.label}
                </span>
              </div>
            </div>

            <div className="grid gap-[16px] xl:grid-cols-[400px_minmax(0,1fr)] xl:items-start">
              <label className="relative block w-full" htmlFor="travel-style-search">
                <span className="pointer-events-none absolute left-[22px] top-1/2 -translate-y-1/2 text-navy/38">
                  <Search className="h-[20px] w-[20px]" strokeWidth={2.2} />
                </span>
                <input
                  id="travel-style-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search mood, family, cruise..."
                  type="search"
                  className="h-[68px] w-full rounded-full border border-navy/12 bg-[#fffefb] pl-[58px] pr-[22px] text-[17px] font-semibold text-navy outline-none transition duration-300 ease-luxe placeholder:text-navy/34 focus:border-gold focus:bg-ivory focus:shadow-[0_0_0_4px_rgba(200,169,106,0.12)]"
                />
              </label>

              <div className="flex flex-nowrap gap-[12px] overflow-x-auto pb-[3px] no-scrollbar xl:flex-wrap xl:overflow-visible">
                {styleFilters.map((filter) => {
                  const active = activeFilterKey === filter.key;
                  return (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => setActiveFilterKey(filter.key)}
                      aria-pressed={active}
                      className={cn(
                        'inline-flex min-h-[50px] shrink-0 items-center rounded-full border px-[20px] text-[15px] font-extrabold transition duration-300 ease-luxe focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 md:min-h-[52px] md:px-[22px]',
                        active
                          ? 'border-navy bg-navy text-ivory shadow-[inset_0_0_0_2px_rgba(248,245,239,0.88)]'
                          : 'border-navy/10 bg-[#fffefb] text-navy/68 shadow-[0_8px_18px_rgba(11,27,43,0.04)] hover:border-gold/55 hover:bg-champagne hover:text-navy'
                      )}
                    >
                      {filter.label}
                      <span
                        className={cn(
                          'ml-[10px] rounded-full px-[9px] py-[4px] text-[12px] leading-none',
                          active ? 'bg-ivory/16 text-ivory/82' : 'bg-navy/[0.055] text-navy/44'
                        )}
                      >
                        {filterCounts[filter.key]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-[18px] divide-y divide-navy/8 border-y border-navy/10 bg-[#fffdf8]/46">
            {filteredKinds.map((kind) => {
              const tags = tagsForKind(kind);
              return (
                <Link
                  key={kind.title}
                  href={tripStylePath(kind)}
                  aria-label={kind.title}
                  className="group grid grid-cols-[44px_76px_minmax(0,1fr)] gap-x-[14px] gap-y-[12px] px-[8px] py-[14px] transition duration-300 ease-luxe hover:bg-[#fffefb] md:grid-cols-[50px_92px_minmax(0,1fr)] md:px-[14px] lg:grid-cols-[50px_96px_minmax(0,1fr)_230px_90px_112px] lg:items-center lg:gap-x-[20px] lg:py-[15px]"
                >
                  <span className="self-start pt-[7px] font-serif text-[18px] font-semibold tabular-nums tracking-[-0.03em] text-navy/24 transition group-hover:text-gold-dark md:self-center md:pt-0 md:text-[20px]">
                    {kind.num}
                  </span>

                  <span className="relative block h-[58px] w-[76px] overflow-hidden rounded-[12px] bg-champagne shadow-[0_10px_24px_rgba(11,27,43,0.09)] ring-1 ring-navy/[0.045] md:h-[64px] md:w-[92px] lg:w-[96px]">
                    <Image
                      src={kind.image}
                      alt={kind.alt}
                      fill
                      sizes="(min-width: 1280px) 96px, (min-width: 768px) 92px, 76px"
                      className="object-cover transition duration-500 ease-luxe group-hover:scale-105 group-hover:saturate-110"
                    />
                  </span>

                  <span className="min-w-0">
                    <span className="flex flex-wrap items-baseline gap-x-[12px] gap-y-[4px]">
                      <span className="text-[19px] font-black leading-6 tracking-[-0.035em] text-navy transition group-hover:text-gold-dark md:text-[21px]">
                        {kind.title}
                      </span>
                      <span className="hidden h-px w-4 bg-navy/24 sm:inline-block" />
                      <span className="text-[11px] font-black uppercase tracking-[0.13em] text-navy/42">
                        {kind.mood}
                      </span>
                    </span>
                    <span className="mt-[7px] block max-w-[690px] truncate text-[15px] font-semibold leading-7 text-navy/56 md:text-[16px]">
                      {kind.text}
                    </span>
                  </span>

                  <span className="col-start-3 flex flex-wrap items-center gap-[8px] lg:contents">
                    <span className="flex flex-wrap items-center gap-[8px] lg:justify-end">
                      {tags.map((tag) => <StyleTagPill key={tag.key} tag={tag} />)}
                    </span>

                    <span className="text-[14px] font-bold text-navy/48 lg:text-right">
                      {compactDuration(kind.duration)}
                    </span>

                    <span className="inline-flex min-h-[42px] w-fit items-center justify-center gap-[8px] rounded-[13px] bg-navy/[0.055] px-[16px] text-[14px] font-extrabold text-navy/76 transition duration-300 ease-luxe group-hover:-translate-y-0.5 group-hover:bg-navy group-hover:text-ivory lg:w-full">
                      Explore
                      <ArrowUpRight className="h-4 w-4" strokeWidth={2.1} />
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>

          {!filteredKinds.length ? (
            <div className="mt-8 rounded-[28px] border border-navy/10 bg-ivory p-8 text-center shadow-[0_18px_54px_rgba(11,27,43,0.06)]">
              <p className="font-serif text-[clamp(32px,4vw,52px)] font-semibold tracking-[-0.05em] text-navy">No style matched.</p>
              <p className="mx-auto mt-[12px] max-w-[34rem] text-[16px] font-semibold leading-7 text-navy/58">Clear the search or choose All styles to reopen the full atlas.</p>
              <button
                type="button"
                onClick={() => { setQuery(''); setActiveFilterKey('all'); }}
                className="mt-6 inline-flex min-h-[46px] items-center rounded-full bg-navy px-6 text-[12px] font-extrabold uppercase tracking-[0.16em] text-ivory transition duration-300 ease-luxe hover:bg-gold hover:text-navy"
              >
                Show all styles
              </button>
            </div>
          ) : null}

          <div className="mt-10 grid gap-[20px] overflow-hidden rounded-[28px] border border-gold/22 bg-[linear-gradient(135deg,#0b1b2b_0%,#132c3f_100%)] p-[22px] text-ivory shadow-[0_24px_70px_rgba(11,27,43,0.16)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center md:p-[26px]">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-gold">Concierge match</p>
              <p className="mt-[10px] max-w-[54rem] text-[15px] font-semibold leading-7 text-ivory/70 md:text-[16px]">
                Not sure which style fits? Tell us your travel mood and we will match the route, hotels and pace.
              </p>
            </div>
            <Link
              href="/customize-your-trip/"
              className="inline-flex min-h-[52px] w-fit items-center justify-center rounded-full bg-gold px-[28px] text-[13px] font-extrabold uppercase tracking-[0.14em] text-navy shadow-[0_16px_34px_rgba(200,169,106,0.24)] transition duration-300 ease-luxe hover:-translate-y-0.5 hover:bg-ivory"
            >
              Speak to a Specialist
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
