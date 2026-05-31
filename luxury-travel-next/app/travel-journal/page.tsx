import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, Compass, MapPinned, MessageCircle, Sparkles } from 'lucide-react';
import { getContent } from '@/lib/cms';
import { shouldBypassNextImageOptimization } from '@/lib/image-delivery';
import { Container } from '@/components/layout/container';
import { CmsItem } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Travel Journal',
  description: 'Editorial travel notes, destination ideas and seasonal inspiration for Southeast Asia.'
};

type ArticleMeta = {
  publishedAt: string;
  category: string;
  readTime: string;
};

type AtlasCue = {
  label: string;
  copy: string;
};

const atlasCues: AtlasCue[] = [
  {
    label: 'Season window',
    copy: 'Weather, festivals and regional timing before the route is fixed.'
  },
  {
    label: 'Pace notes',
    copy: 'Where to slow down, where to connect, where to avoid a rushed transfer.'
  },
  {
    label: 'Hotel mood',
    copy: 'City calm, river heritage, beach privacy and soft luxury choices.'
  }
];

const themeCopy = [
  'Route logic, transfer rhythm and smart country pairing for private Asia travel.',
  'Seasonal timing, local atmosphere and what each destination feels like month by month.',
  'Culture, cuisine and hotel mood for travelers who want the trip to feel personal.',
  'Practical notes for first-time guests, families, couples and returning travelers.',
  'Soft adventure, water days, heritage walks and quieter local moments.',
  'Planning cues that turn inspiration into a route, not just a reading list.'
];

const dossierDetails = [
  { label: 'Best entry point', value: 'Start simple' },
  { label: 'Route rhythm', value: 'Unhurried pace' },
  { label: 'Private detail', value: 'Designer checked' }
];

function detailString(post: CmsItem, key: string, fallback: string) {
  const value = post.meta.details?.[key];
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function articlePath(post: CmsItem) {
  return `/blog/${post.slug}/`;
}

function articleMeta(post: CmsItem): ArticleMeta {
  return {
    publishedAt: detailString(post, 'publishedAt', 'Travel guide'),
    category: formatTravelLabel(detailString(post, 'category', 'Travel Guide')),
    readTime: detailString(post, 'readTime', '7 min read')
  };
}

function formatTravelLabel(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

function ArticleImage({ post, priority = false, className = '' }: { post: CmsItem; priority?: boolean; className?: string }) {
  return (
    <Image
      src={post.featuredImage}
      alt={post.title}
      fill
      priority={priority}
      sizes="(min-width: 1440px) 720px, (min-width: 768px) 58vw, 100vw"
      quality={95}
      unoptimized={shouldBypassNextImageOptimization(post.featuredImage)}
      className={`object-cover transition duration-700 ease-luxe ${className}`}
    />
  );
}

function MetaCaps({ meta, light = false }: { meta: ArticleMeta; light?: boolean }) {
  return (
    <span className={`text-[11px] font-black uppercase leading-5 tracking-[0.24em] ${light ? 'text-gold' : 'text-gold-dark'}`}>
      {meta.category} <span className={light ? 'mx-2 text-ivory/26' : 'mx-2 text-navy/24'}>/</span> {meta.readTime}
    </span>
  );
}

function HeroAtlas({ post, categories }: { post?: CmsItem; categories: string[] }) {
  const meta = post ? articleMeta(post) : null;
  const browseCategories = categories.slice(0, 7);

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#0b1b2b_0%,#10273a_42%,#efe5d1_42%,#efe5d1_100%)] pb-[36px] pt-[108px] text-navy md:pb-[44px] md:pt-[122px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_10%,rgba(200,169,106,0.24),transparent_30%),radial-gradient(circle_at_86%_8%,rgba(11,27,43,0.08),transparent_26%)]" />
      <Container width="page" className="relative">
        <div className="overflow-hidden rounded-[52px] bg-[linear-gradient(135deg,#0b1b2b_0%,#132f45_58%,#071522_100%)] text-ivory shadow-[0_36px_110px_rgba(11,27,43,0.24)] ring-1 ring-navy/10">
          <div className="grid min-h-[650px] lg:grid-cols-[0.92fr_1.08fr]">
            <div className="relative flex flex-col justify-between p-8 md:p-12 xl:p-14">
              <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(248,245,239,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(248,245,239,0.12)_1px,transparent_1px)] [background-size:72px_72px]" />
              <div className="relative">
                <p className="text-[14px] font-black uppercase tracking-[0.36em] text-gold">Travel journal</p>
                <h1 className="mt-6 max-w-[9.5ch] font-serif text-[clamp(46px,5.6vw,82px)] font-semibold leading-[0.9] tracking-[-0.07em] text-ivory">
                  The private Asia atlas.
                </h1>
                <p className="mt-7 max-w-[43rem] text-[18px] font-bold leading-[1.76] tracking-[-0.025em] text-ivory/76 md:text-[21px]">
                  A curated desk of route notes, seasonal cues and private travel intelligence. Less archive, more inspiration you can turn into a real journey.
                </p>
              </div>

              <div className="relative mt-12 max-w-[42rem] divide-y divide-ivory/12 border-y border-ivory/12">
                {atlasCues.map((cue, index) => (
                  <div
                    key={cue.label}
                    className="grid gap-4 py-[18px] sm:grid-cols-[54px_minmax(0,1fr)] sm:gap-6"
                  >
                    <span className="font-serif text-[30px] font-semibold leading-none tracking-[-0.06em] text-gold">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="grid gap-[10px]">
                      <span className="flex items-center gap-3 text-[12px] font-black uppercase tracking-[0.3em] text-gold">
                        {cue.label}
                        <span className="h-px flex-1 bg-ivory/14" />
                      </span>
                      <span className="max-w-[35rem] text-[15px] font-bold leading-7 text-ivory/82">{cue.copy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[520px] bg-navy/30 p-5 md:p-8 lg:min-h-0">
              {post ? (
                <Link href={articlePath(post)} className="group relative block h-full min-h-[560px] overflow-hidden rounded-[42px] bg-champagne shadow-[0_28px_86px_rgba(0,0,0,0.28)] ring-1 ring-ivory/12 lg:min-h-0">
                  <ArticleImage post={post} priority className="brightness-[0.9] contrast-[1.08] saturate-[1.05] group-hover:scale-105" />
                  <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,21,34,0.06),rgba(7,21,34,0.22)_42%,rgba(7,21,34,0.78)_100%)]" />
                  <span className="absolute left-6 top-6 inline-flex items-center gap-3 rounded-full border border-ivory/20 bg-navy/66 px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-ivory shadow-[0_12px_28px_rgba(0,0,0,0.22)] backdrop-blur-md">
                    <Sparkles className="h-4 w-4 text-gold" />
                    Atlas cover
                  </span>
                  <span className="absolute right-6 top-6 hidden rounded-full border border-ivory/18 bg-ivory/12 px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-ivory/82 shadow-[0_12px_28px_rgba(0,0,0,0.18)] backdrop-blur-md md:inline-flex">
                    {meta?.publishedAt}
                  </span>
                  <span className="absolute inset-x-0 bottom-0 block p-7 md:p-10">
                    {meta ? <MetaCaps meta={meta} light /> : null}
                    <span className="mt-5 block max-w-[12ch] font-serif text-[clamp(34px,3.7vw,58px)] font-semibold leading-[0.94] tracking-[-0.06em] text-ivory [text-shadow:0_8px_28px_rgba(0,0,0,0.4)]">
                      {post.title}
                    </span>
                    <span className="mt-7 inline-flex items-center gap-3 text-[12px] font-black uppercase tracking-[0.24em] text-gold transition group-hover:text-ivory">
                      Read the atlas note
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </span>
                </Link>
              ) : null}
            </div>
          </div>

          <div className="border-t border-ivory/10 bg-navy/20 px-8 py-8 md:px-12 xl:px-14">
            <div className="grid gap-6 lg:grid-cols-[148px_minmax(0,1fr)] lg:items-center">
              <span className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.34em] text-gold">
                Browse
                <span className="hidden h-px w-12 bg-gold/36 lg:block" />
              </span>
              <div className="flex flex-wrap items-center gap-x-[30px] gap-y-[12px] text-[11px] font-black uppercase tracking-[0.17em] text-ivory/82">
                {browseCategories.map((category) => (
                  <Link
                    key={category}
                    href="/blog/"
                    className="inline-flex whitespace-nowrap border-b border-ivory/16 pb-[6px] transition duration-300 ease-luxe hover:-translate-y-0.5 hover:border-gold hover:text-gold"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function DossierFeature({ post }: { post?: CmsItem }) {
  if (!post) return null;
  const meta = articleMeta(post);

  return (
    <Link href={articlePath(post)} className="group grid overflow-hidden rounded-[48px] border border-navy/10 bg-[linear-gradient(180deg,#fffdf7_0%,#f2eadc_100%)] shadow-[0_26px_78px_rgba(11,27,43,0.12)] transition duration-300 ease-luxe hover:-translate-y-1 hover:border-gold/50 lg:grid-cols-[0.82fr_1.18fr]">
      <span className="relative min-h-[420px] overflow-hidden bg-champagne lg:min-h-[570px]">
        <ArticleImage post={post} priority className="brightness-[0.98] contrast-[1.06] group-hover:scale-105" />
        <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,21,34,0.04),rgba(7,21,34,0.3))]" />
      </span>
      <span className="flex flex-col justify-between p-8 md:p-12 xl:p-14">
        <span>
          <span className="inline-flex w-fit items-center gap-3 rounded-full border border-gold/24 bg-champagne px-5 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-gold-dark">
            <BookOpen className="h-4 w-4 text-gold" />
            Route dossier
          </span>
          <span className="mt-9 block"><MetaCaps meta={meta} /></span>
          <span className="mt-5 block max-w-[13ch] font-serif text-[clamp(34px,3.7vw,58px)] font-semibold leading-[0.96] tracking-[-0.06em] text-navy">
            {post.title}
          </span>
          <span className="mt-8 block max-w-[46rem] text-[17px] font-bold leading-[1.78] tracking-[-0.02em] text-navy/68 md:text-[19px]">
            {post.excerpt}
          </span>
        </span>
        <span className="mt-12 grid gap-6 border-t border-navy/10 pt-7 md:grid-cols-3">
          {dossierDetails.map((item) => (
            <span key={item.label} className="relative grid gap-2 pl-5">
              <span className="absolute left-0 top-1 h-10 w-px bg-gold/55" />
              <span className="text-[11px] font-black uppercase tracking-[0.24em] text-gold-dark">{item.label}</span>
              <span className="text-[18px] font-black leading-6 tracking-[-0.025em] text-navy">{item.value}</span>
            </span>
          ))}
        </span>
      </span>
    </Link>
  );
}

function VisualDispatch({ post, large = false }: { post: CmsItem; large?: boolean }) {
  const meta = articleMeta(post);

  return (
    <Link
      href={articlePath(post)}
      className={`group grid overflow-hidden rounded-[34px] border border-navy/10 bg-[linear-gradient(180deg,#fffdf7_0%,#f1eadf_100%)] text-navy shadow-[0_20px_58px_rgba(11,27,43,0.1)] transition duration-300 ease-luxe hover:-translate-y-1 hover:border-gold/55 ${large ? 'min-h-[560px] lg:grid-cols-[0.92fr_1.08fr]' : 'min-h-[405px] lg:grid-cols-[0.9fr_1.1fr]'}`}
    >
      <span className={`relative block overflow-hidden bg-champagne ${large ? 'min-h-[320px] lg:min-h-0' : 'min-h-[220px] lg:min-h-0'}`}>
        <ArticleImage post={post} className="brightness-[0.98] contrast-[1.06] saturate-[1.04] group-hover:scale-105" />
        <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,21,34,0.02),rgba(7,21,34,0.18))]" />
      </span>
      <span className={`${large ? 'flex flex-col justify-center p-7 md:p-10' : 'flex flex-col justify-center p-6 md:p-7'} `}>
        <MetaCaps meta={meta} />
        <span className={`mt-4 block font-serif font-semibold leading-[1] tracking-[-0.055em] text-navy transition group-hover:text-gold-dark ${large ? 'line-clamp-3 text-[clamp(36px,4vw,54px)]' : 'line-clamp-3 text-[clamp(27px,2.6vw,36px)]'}`}>
          {post.title}
        </span>
        <span className={`mt-4 block text-[15px] font-semibold leading-[1.72] tracking-[-0.02em] text-navy/64 ${large ? 'line-clamp-2 max-w-[48rem] md:text-[16px]' : 'line-clamp-3'}`}>
          {post.excerpt}
        </span>
        <span className="mt-6 inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.22em] text-gold-dark">
          Open dispatch
          <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </span>
    </Link>
  );
}

function BriefDispatch({ post, index }: { post: CmsItem; index: number }) {
  const meta = articleMeta(post);

  return (
    <Link href={articlePath(post)} className={`group flex min-h-[292px] flex-col border-t border-navy/10 py-7 transition duration-300 ease-luxe hover:-translate-y-1 xl:border-t-0 xl:px-8 ${index === 1 ? '' : 'xl:border-l xl:border-navy/10'}`}>
      <span className="flex items-center justify-between gap-4">
        <span className="text-[12px] font-black uppercase tracking-[0.26em] text-gold-dark">No. {String(index).padStart(2, '0')}</span>
        <span className="grid h-9 w-9 place-items-center rounded-full text-navy/42 transition group-hover:bg-gold group-hover:text-navy">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </span>
      <span className="mt-8 block">
        <span className="block"><MetaCaps meta={meta} /></span>
        <span className="mt-4 line-clamp-3 block font-serif text-[30px] font-semibold leading-[1.02] tracking-[-0.06em] text-navy transition group-hover:text-gold-dark md:text-[34px]">
          {post.title}
        </span>
        <span className="mt-5 line-clamp-4 block text-[15px] font-semibold leading-[1.76] text-navy/64">
          {post.excerpt}
        </span>
      </span>
      <span className="mt-auto pt-7 text-[11px] font-black uppercase tracking-[0.22em] text-gold-dark opacity-0 transition group-hover:opacity-100">
        Open note
      </span>
    </Link>
  );
}

function ThemeAtlas({ categories }: { categories: string[] }) {
  const themes = categories.length ? categories.slice(0, 6) : ['Route Ideas', 'Seasonal Notes', 'Culture & Cuisine', 'Travel Tips', 'Vietnam Guide', 'Thailand Guide'];

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#efe5d1_0%,#f8f5ef_100%)] py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(200,169,106,0.22),transparent_28%),radial-gradient(circle_at_90%_20%,rgba(11,27,43,0.08),transparent_28%)]" />
      <Container width="page" className="relative">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="text-[13px] font-black uppercase tracking-[0.32em] text-gold-dark">Atlas index</p>
            <h2 className="mt-4 max-w-[10ch] font-serif text-[clamp(36px,4vw,62px)] font-semibold leading-[0.95] tracking-[-0.06em] text-navy">
              Browse by travel mood.
            </h2>
            <p className="mt-6 max-w-[34rem] text-[17px] font-bold leading-[1.72] tracking-[-0.02em] text-navy/62">
              This page is a curated route desk. The full blog remains the archive, while the journal groups ideas by how a trip should feel.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {themes.map((theme, index) => (
              <Link
                key={`${theme}-${index}`}
                href="/blog/"
                className={`group relative overflow-hidden rounded-[30px] border border-navy/10 bg-[linear-gradient(180deg,#fffdf7_0%,#f6efdf_100%)] px-6 py-6 shadow-[0_16px_42px_rgba(11,27,43,0.06)] transition duration-300 ease-luxe hover:-translate-y-1 hover:border-gold/40 md:px-7 md:py-7 ${index % 2 === 1 ? 'md:mt-8' : ''}`}
              >
                <span className="pointer-events-none absolute right-4 top-3 font-serif text-[72px] font-semibold leading-none tracking-[-0.08em] text-navy/6">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="relative z-10 inline-flex w-fit items-center rounded-full bg-gold/12 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-gold-dark ring-1 ring-gold/15">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="relative z-10 mt-6 block text-[28px] font-black leading-[1.04] tracking-[-0.055em] text-navy transition group-hover:text-gold-dark">{theme}</span>
                <span className="relative z-10 mt-4 block max-w-[28rem] text-[15px] font-semibold leading-[1.78] text-navy/64">{themeCopy[index % themeCopy.length]}</span>
                <span className="relative z-10 mt-8 inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.24em] text-gold-dark">
                  Explore mood
                  <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function JournalShelf({ posts }: { posts: CmsItem[] }) {
  if (!posts.length) return null;

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8f5ef_0%,#efe5d1_100%)] py-24 text-navy md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_10%,rgba(200,169,106,0.2),transparent_28%),radial-gradient(circle_at_92%_18%,rgba(11,27,43,0.07),transparent_30%)]" />
      <Container width="page" className="relative">
        <div className="grid gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="text-[13px] font-black uppercase tracking-[0.32em] text-gold-dark">Dispatch shelf</p>
            <h2 className="mt-4 max-w-[10ch] font-serif text-[clamp(38px,4.2vw,66px)] font-semibold leading-[0.94] tracking-[-0.06em] text-navy">
              Short notes, no clutter.
            </h2>
            <p className="mt-7 max-w-[28rem] text-[17px] font-semibold leading-[1.78] tracking-[-0.02em] text-navy/62">
              A quiet reading shelf for route decisions, hotel mood and cultural timing before a private itinerary is shaped.
            </p>
            <span className="mt-10 inline-flex items-center gap-4 border-t border-gold/45 pt-5 text-[12px] font-black uppercase tracking-[0.26em] text-gold-dark">
              {String(posts.slice(0, 6).length).padStart(2, '0')} notes
            </span>
          </div>

          <div className="border-y border-navy/12">
            {posts.slice(0, 6).map((post, index) => {
              const meta = articleMeta(post);
              return (
                <Link key={post.slug} href={articlePath(post)} className={`group grid gap-6 py-9 transition duration-300 ease-luxe hover:bg-ivory/60 md:grid-cols-[86px_minmax(0,1fr)_auto] md:items-start md:px-6 md:py-10 ${index === 0 ? '' : 'border-t border-navy/10'}`}>
                  <span className="font-serif text-[34px] font-semibold leading-none tracking-[-0.06em] text-gold-dark md:text-[38px]">{String(index + 1).padStart(2, '0')}</span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-black uppercase leading-5 tracking-[0.26em] text-gold-dark">{meta.category} / {meta.readTime}</span>
                    <span className="mt-4 block max-w-[30ch] font-serif text-[clamp(30px,2.9vw,44px)] font-semibold leading-[1.06] tracking-[-0.06em] text-navy transition group-hover:text-gold-dark">{post.title}</span>
                    <span className="mt-5 block max-w-[54rem] text-[16px] font-semibold leading-[1.88] text-navy/64">{post.excerpt}</span>
                  </span>
                  <span className="inline-flex h-fit items-center gap-3 border-b border-gold/45 pb-1.5 pt-1 text-[11px] font-black uppercase tracking-[0.24em] text-gold-dark transition group-hover:border-navy group-hover:text-navy">
                    Read
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

function JourneyCta() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8f5ef_0%,#efe5d1_100%)] py-20 md:py-28">
      <Container width="page">
        <div className="relative overflow-hidden rounded-[48px] border border-navy/10 bg-[linear-gradient(135deg,#fffaf1_0%,#f0e4ce_100%)] px-8 py-10 text-navy shadow-[0_30px_90px_rgba(11,27,43,0.11)] md:px-12 md:py-12 xl:px-14">
          <div className="pointer-events-none absolute right-[-2rem] top-[-3rem] font-serif text-[180px] font-semibold leading-none tracking-[-0.08em] text-navy/[0.035] md:text-[240px]">
            Route
          </div>
          <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="flex items-center gap-4 text-[13px] font-black uppercase tracking-[0.32em] text-gold-dark">
                From atlas to itinerary
                <span className="hidden h-px w-16 bg-gold/50 md:block" />
              </p>
              <h2 className="mt-5 max-w-[11ch] font-serif text-[clamp(38px,4.2vw,66px)] font-semibold leading-[0.92] tracking-[-0.065em] text-navy">
                Bring one note into your route.
              </h2>
            </div>
            <div className="border-t border-navy/10 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0 xl:pl-14">
              <p className="max-w-[52rem] text-[19px] font-bold leading-[1.72] tracking-[-0.02em] text-navy/68 md:text-[21px]">
                Send us the article, destination or travel mood you like. We will translate it into dates, hotels, transfers and a private route that feels calm from the first day.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Link href="/customize-your-trip/" className="inline-flex min-h-[56px] items-center justify-center gap-3 rounded-full bg-navy px-6 text-[12px] font-black uppercase tracking-[0.2em] text-ivory transition duration-300 ease-luxe hover:bg-gold hover:text-navy">
                  Design your trip
                  <Compass className="h-4 w-4" />
                </Link>
                <Link href="/contact/" className="inline-flex min-h-[56px] items-center justify-center gap-3 rounded-full border border-navy/14 px-6 text-[12px] font-black uppercase tracking-[0.2em] text-navy transition duration-300 ease-luxe hover:border-gold hover:text-gold-dark">
                  Talk to a designer
                  <MessageCircle className="h-4 w-4" />
                </Link>
                <Link href="/blog/" className="inline-flex min-h-[56px] items-center justify-center gap-3 rounded-full border border-navy/14 px-6 text-[12px] font-black uppercase tracking-[0.2em] text-navy/64 transition duration-300 ease-luxe hover:border-gold hover:text-gold-dark">
                  Full archive
                  <MapPinned className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default async function TravelJournalPage() {
  const posts = await getContent('posts');
  const categories = Array.from(new Set(posts.map((post) => formatTravelLabel(detailString(post, 'category', 'Travel Guide'))))).slice(0, 7);
  const coverPost = posts[0];
  const dossierPost = posts[1] ?? posts[0];
  const visualPosts = posts.slice(2, 5);
  const briefPosts = posts.slice(5, 9);
  const shelfPosts = posts.slice(9, 15).length ? posts.slice(9, 15) : posts.slice(3, 9);

  return (
    <main className="bg-[linear-gradient(180deg,#f8f5ef_0%,#f1eadf_54%,#f8f5ef_100%)] text-navy">
      <HeroAtlas post={coverPost} categories={categories} />

      <section className="relative pb-20 pt-[36px] md:pb-28 md:pt-[44px]">
        <Container width="page">
          <div className="grid gap-8 lg:grid-cols-[0.68fr_1.32fr] lg:items-center">
            <div>
              <p className="text-[13px] font-black uppercase tracking-[0.32em] text-gold-dark">Selected dossier</p>
              <h2 className="mt-4 max-w-[11ch] font-serif text-[clamp(36px,4vw,62px)] font-semibold leading-[0.96] tracking-[-0.06em] text-navy">
                One idea, carefully opened.
              </h2>
            </div>
            <p className="max-w-[52rem] text-[18px] font-bold leading-[1.76] tracking-[-0.02em] text-navy/64 md:text-[20px]">
              Travel Journal is not another blog feed. It is a curated atlas of decisions: where to start, what to skip, when to slow down and how to shape the route privately.
            </p>
          </div>

          <div className="mt-10">
            <DossierFeature post={dossierPost} />
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            {visualPosts[0] ? <VisualDispatch post={visualPosts[0]} large /> : null}
            <div className="grid gap-8">
              {visualPosts.slice(1, 3).map((post) => (
                <VisualDispatch key={post.slug} post={post} />
              ))}
            </div>
          </div>

          <div className="mt-12 grid gap-8 border-y border-navy/10 py-8 md:grid-cols-2 xl:grid-cols-4 xl:gap-0">
            {briefPosts.map((post, index) => (
              <BriefDispatch key={post.slug} post={post} index={index + 1} />
            ))}
          </div>
        </Container>
      </section>

      <ThemeAtlas categories={categories} />
      <JournalShelf posts={shelfPosts} />
      <JourneyCta />
    </main>
  );
}
