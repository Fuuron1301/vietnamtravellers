import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { getContent } from '@/lib/cms';
import { Container } from '@/components/layout/container';
import { Heading } from '@/components/ui/typography';
import { CmsItem } from '@/lib/types';
import { shouldBypassNextImageOptimization } from '@/lib/image-delivery';

export const metadata = { title: 'Luxury Travel Blog', description: 'SEO travel guides for Southeast Asia luxury journeys.' };

type ArticleMeta = {
  publishedAt: string;
  category: string;
  readTime: string;
};

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
    category: detailString(post, 'category', 'Travel Guide'),
    readTime: detailString(post, 'readTime', '11 min read')
  };
}

function MetaStack({ meta, compact = false }: { meta: ArticleMeta; compact?: boolean }) {
  return (
    <div className={compact ? 'grid gap-1 text-[10px] font-black uppercase leading-5 tracking-[0.18em] text-gold-dark' : 'grid gap-1 text-[11px] font-black uppercase leading-5 tracking-[0.18em] text-gold-dark'}>
      <span>{meta.publishedAt}</span>
      <span>{meta.category} / {meta.readTime}</span>
    </div>
  );
}

function FeaturedArticle({ post }: { post: CmsItem }) {
  const meta = articleMeta(post);

  return (
    <Link href={articlePath(post)} className="group grid overflow-hidden rounded-[38px] border border-navy/10 bg-[linear-gradient(180deg,#fffdf7_0%,#f5efe4_100%)] shadow-[0_34px_96px_rgba(11,27,43,0.14)] transition duration-300 ease-luxe hover:-translate-y-1 hover:border-gold/45 hover:shadow-[0_42px_110px_rgba(11,27,43,0.18)] md:grid-cols-[1.08fr_0.92fr]">
      <span className="relative min-h-[340px] overflow-hidden bg-champagne md:min-h-[460px]">
        <Image
          src={post.featuredImage}
          alt={post.title}
          fill
          priority
          sizes="(min-width: 768px) 58vw, 100vw"
          quality={92}
          unoptimized={shouldBypassNextImageOptimization(post.featuredImage)}
          className="object-cover transition duration-700 ease-luxe group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,21,34,0.02),rgba(7,21,34,0.26))]" />
      </span>
      <span className="flex flex-col justify-center p-8 md:p-12 xl:p-12">
        <span className="inline-flex w-fit items-center gap-3 rounded-full bg-navy px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-ivory shadow-[0_12px_26px_rgba(11,27,43,0.14)]">
          <BookOpen className="h-4 w-4 text-gold" />
          Featured guide
        </span>
        <span className="mt-8">
          <MetaStack meta={meta} />
        </span>
        <Heading level={2} className="mt-5 max-w-[16ch] text-navy">
          {post.title}
        </Heading>
        <span className="mt-6 block max-w-[38rem] text-[18px] font-semibold leading-[1.78] tracking-[-0.02em] text-navy/68">
          {post.excerpt}
        </span>
        <span className="mt-10 inline-flex items-center gap-3 text-[12px] font-extrabold uppercase tracking-[0.18em] text-navy transition group-hover:text-gold-dark">
          Read full guide
          <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
        </span>
      </span>
    </Link>
  );
}

function BlogArticleCard({ post }: { post: CmsItem }) {
  const meta = articleMeta(post);

  return (
    <Link href={articlePath(post)} className="group flex h-full flex-col overflow-hidden rounded-[30px] border border-navy/10 bg-[linear-gradient(180deg,#fffdf7_0%,#f6f0e6_100%)] shadow-[0_18px_54px_rgba(11,27,43,0.08)] transition duration-300 ease-luxe hover:-translate-y-1 hover:border-gold/55 hover:shadow-[0_28px_74px_rgba(11,27,43,0.14)]">
      <span className="relative block aspect-[16/10.5] overflow-hidden bg-champagne">
        <Image
          src={post.featuredImage}
          alt={post.title}
          fill
          sizes="(min-width: 1280px) 31vw, (min-width: 768px) 48vw, 100vw"
          quality={90}
          unoptimized={shouldBypassNextImageOptimization(post.featuredImage)}
          className="object-cover transition duration-700 ease-luxe group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,21,34,0.02),rgba(7,21,34,0.22))]" />
      </span>
      <span className="flex flex-1 flex-col border-t border-navy/8 p-6 md:p-7">
        <MetaStack meta={meta} compact />
        <span className="mt-4 line-clamp-3 block max-w-[20ch] text-[24px] font-black leading-[1.04] tracking-[-0.05em] text-navy transition group-hover:text-gold-dark md:text-[26px]">
          {post.title}
        </span>
        <span className="mt-4 line-clamp-4 block max-w-[35ch] text-[15px] font-semibold leading-[1.76] tracking-[-0.02em] text-navy/68 md:text-[16px]">
          {post.excerpt}
        </span>
        <span className="mt-auto inline-flex items-center gap-3 pt-7 text-[12px] font-extrabold uppercase tracking-[0.18em] text-navy transition group-hover:text-gold-dark">
          Read guide
          <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
        </span>
      </span>
    </Link>
  );
}

export default async function BlogPage() {
  const posts = await getContent('posts');
  const featured = posts[0];
  const categories = Array.from(new Set(posts.map((post) => detailString(post, 'category', 'Travel Guide')))).slice(0, 9);

  return (
    <main className="bg-[linear-gradient(180deg,#f8f5ef_0%,#f4eee4_100%)] text-navy">
      <section className="relative overflow-hidden bg-navy pb-20 pt-[124px] text-ivory md:pb-24 md:pt-[136px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(200,169,106,0.24),transparent_30%),radial-gradient(circle_at_82%_8%,rgba(248,245,239,0.08),transparent_28%)]" />
        <Container width="page" className="relative">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-[12px] font-extrabold uppercase tracking-[0.28em] text-gold">Editorial travel magazine</p>
              <h1 className="mt-5 max-w-[12ch] font-serif text-[clamp(46px,5.4vw,82px)] font-semibold leading-[0.92] tracking-[-0.065em] text-ivory">
                Luxury Asia travel intelligence.
              </h1>
            </div>
            <div className="max-w-[58rem]">
              <p className="text-[17px] font-bold leading-[1.68] tracking-[-0.025em] text-ivory/70 md:text-[20px]">
                More than 50 original planning guides for Vietnam, Laos, Cambodia, Thailand, Myanmar and multi-country private routes.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                {categories.map((category) => (
                  <span key={category} className="rounded-full border border-ivory/14 bg-ivory/8 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-ivory/78">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="relative -mt-16 pb-28">
        <Container width="page">
          {featured && <FeaturedArticle post={featured} />}

          <div className="mt-16 flex flex-col gap-6 border-t border-navy/10 pt-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[12px] font-extrabold uppercase tracking-[0.26em] text-gold-dark">Latest articles</p>
              <h2 className="mt-3 max-w-[13ch] font-serif text-[clamp(36px,4vw,58px)] font-semibold leading-[0.96] tracking-[-0.055em] text-navy">
                Route-first guides for private travel.
              </h2>
            </div>
            <p className="max-w-[42rem] text-[17px] font-semibold leading-8 tracking-[-0.02em] text-navy/66 md:text-[19px]">
              Each article keeps the destination idea, season, route context and reading time visible, so the page feels like a calm library instead of a crowded feed.
            </p>
          </div>

          <div className="mt-10 grid items-stretch gap-8 md:grid-cols-2 xl:grid-cols-3">
            {posts.slice(1).map((post) => (
              <BlogArticleCard key={post.slug} post={post} />
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
