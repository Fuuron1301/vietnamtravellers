'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { CmsItem } from '@/lib/types';
import { Container } from '@/components/layout/container';
import { shouldBypassNextImageOptimization } from '@/lib/image-delivery';
import type { BlogPreviewContent } from '@/lib/site-content-schema';
import { defaultHomeSectionContent } from '@/lib/site-content-schema';

type EditorialCard = {
  title: string;
  excerpt: string;
  image: string;
  href: string;
  publishedAt: string;
  category: string;
};

const defaultEditorialCards: EditorialCard[] = [
  {
    title: "Why Vietnam Feels Safe for Private Asia Travel",
    excerpt: "Calm cities, warm hospitality and smart routing make Vietnam a confident choice for first-time and returning travelers.",
    image: '/images/hero/vietnam-saigon-city-hall-4k.jpg',
    href: '/blog/',
    publishedAt: 'September 18, 2025',
    category: 'Tips & Experiences'
  },
  {
    title: "How to Plan a First Trip to Thailand in 7 Steps",
    excerpt: "A clear route through beaches, temples, hotels and transfer timing, designed so the trip feels polished from day one.",
    image: '/images/assurance/thailand-wat-arun-bangkok-4k.jpg',
    href: '/blog/',
    publishedAt: 'March 20, 2024',
    category: 'Tips & Experiences'
  },
  {
    title: "Best Food Recommendations for an Authentic Hanoi Tour",
    excerpt: "Street kitchens, market walks and family-run tables help Hanoi's food scene become part of the journey, not just a stop.",
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Bun-cha-hanoi.jpg/3840px-Bun-cha-hanoi.jpg',
    href: '/blog/',
    publishedAt: 'July 23, 2024',
    category: 'Culture & Cuisine'
  }
];

const fallbackDates = ['September 18, 2025', 'March 20, 2024', 'July 23, 2024'];

function detailString(post: CmsItem, key: string, fallback: string) {
  const value = post.meta.details?.[key];
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function postToCard(post: CmsItem, index: number): EditorialCard {
  return {
    title: post.title,
    excerpt: post.excerpt,
    image: post.featuredImage || defaultEditorialCards[index % defaultEditorialCards.length].image,
    href: `/blog/${post.slug}/`,
    publishedAt: detailString(post, 'publishedAt', fallbackDates[index % fallbackDates.length]),
    category: detailString(post, 'category', 'Tips & Experiences')
  };
}

function getHomeCards(posts: CmsItem[]) {
  const homeFeatured = posts.filter((post) => post.meta.details?.homeFeatured === true);
  const featuredSlugs = new Set(homeFeatured.map((post) => post.slug));
  const sourcePosts = [...homeFeatured, ...posts.filter((post) => !featuredSlugs.has(post.slug))];
  const cards = sourcePosts.slice(0, 20).map(postToCard);

  for (const fallbackCard of defaultEditorialCards) {
    if (cards.length >= 20) break;
    if (!cards.some((card) => card.title === fallbackCard.title)) {
      cards.push(fallbackCard);
    }
  }

  return cards;
}

export function BlogPreview({ posts, content = defaultHomeSectionContent.blogPreview }: { posts: CmsItem[]; content?: BlogPreviewContent }) {
  const cards = getHomeCards(posts);
  const railRef = useRef<HTMLDivElement>(null);

  function scrollRail(direction: 1 | -1) {
    const rail = railRef.current;
    if (!rail) return;
    const distance = Math.max(rail.clientWidth * 0.82, 360);
    rail.scrollBy({ left: distance * direction, behavior: 'smooth' });
  }

  return (
    <section className="relative overflow-hidden bg-ivory py-20 pb-32 text-navy md:py-28 md:pb-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(200,169,106,0.18),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(11,27,43,0.08),transparent_26%)]" />
      <Container width="page" className="relative">
        <div className="overflow-hidden rounded-[46px] border border-navy/10 bg-[linear-gradient(145deg,rgba(11,27,43,0.98),rgba(19,42,61,0.96))] p-5 text-ivory shadow-[0_30px_86px_rgba(11,27,43,0.18)] md:p-9 xl:p-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[52rem]">
              <p className="text-[12px] font-extrabold uppercase tracking-[0.26em] text-gold">{content.eyebrow}</p>
              <h2 className="mt-4 max-w-[15ch] font-serif text-[clamp(42px,5vw,76px)] font-semibold leading-[0.96] tracking-[-0.06em] text-ivory">
                {content.heading}
              </h2>
              <p className="mt-5 max-w-[40rem] text-[18px] font-bold leading-[1.68] tracking-[-0.02em] text-ivory/68 md:text-[20px]">
                {content.lead}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={content.ctaHref}
                className="inline-flex min-h-[52px] items-center gap-3 rounded-full border border-ivory/16 bg-ivory/8 px-6 text-[12px] font-extrabold uppercase tracking-[0.18em] text-ivory transition duration-300 ease-luxe hover:border-gold hover:bg-gold hover:text-navy"
              >
                {content.ctaLabel}
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
              </Link>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollRail(-1)}
                  aria-label="Previous articles"
                  className="grid h-12 w-12 place-items-center rounded-full border border-ivory/16 bg-ivory/8 text-ivory transition duration-300 ease-luxe hover:border-gold hover:bg-gold hover:text-navy"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollRail(1)}
                  aria-label="Next articles"
                  className="grid h-12 w-12 place-items-center rounded-full border border-ivory/16 bg-ivory/8 text-ivory transition duration-300 ease-luxe hover:border-gold hover:bg-gold hover:text-navy"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={railRef}
            className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 pr-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden xl:gap-6"
          >
            {cards.map((post) => (
              <Link
                key={post.title}
                href={post.href}
                className="group flex min-h-[540px] w-[84vw] flex-none snap-start flex-col overflow-hidden rounded-[32px] border border-ivory/10 bg-ivory text-navy shadow-[0_20px_54px_rgba(0,0,0,0.20)] transition duration-300 ease-luxe hover:-translate-y-1 hover:border-gold/70 hover:shadow-[0_30px_70px_rgba(0,0,0,0.28)] sm:w-[390px] xl:w-[420px]"
              >
                <span className="relative block h-[240px] overflow-hidden bg-champagne md:h-[260px] xl:h-[280px]">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(min-width: 1280px) 420px, (min-width: 640px) 390px, 84vw"
                    quality={92}
                    unoptimized={shouldBypassNextImageOptimization(post.image)}
                    className="object-cover transition duration-700 ease-luxe group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,21,34,0.02),rgba(7,21,34,0.22))]" />
                </span>

                <span className="flex flex-1 flex-col p-6 md:p-7">
                  <span className="block text-[11px] font-extrabold uppercase tracking-[0.16em] text-gold-dark">
                    {post.publishedAt} <span className="mx-2 text-navy/28">|</span> {post.category}
                  </span>
                  <span className="mt-4 block text-[25px] font-black leading-[1.05] tracking-[-0.05em] text-navy transition duration-300 group-hover:text-gold-dark md:text-[29px]">
                    {post.title}
                  </span>
                  <span className="mt-5 line-clamp-4 block text-[16px] font-semibold leading-[1.68] tracking-[-0.02em] text-navy/66 md:text-[17px]">
                    {post.excerpt}
                  </span>
                  <span className="mt-auto inline-flex items-center gap-3 pt-8 text-[12px] font-extrabold uppercase tracking-[0.18em] text-navy transition duration-300 group-hover:text-gold-dark">
                    Read insight
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
