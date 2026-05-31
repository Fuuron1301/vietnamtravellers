import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TourDetailPage } from '@/components/tour-detail-page';
import { CmsBlockRuntime } from '@/components/blocks/cms-block-runtime';
import { getContent, getSingle } from '@/lib/cms';
import { pageMetadata } from '@/lib/seo';
import { HubKey } from '@/lib/types';
import { tourHubKey, tourPath } from '@/lib/routing';

export async function generateTourStaticParams(hubKey: HubKey) {
  const tours = await getContent('tours');
  return tours.filter((tour) => tourHubKey(tour) === hubKey).map((tour) => ({ tourSlug: tour.slug }));
}

export async function generateTourMetadata(slug: string, hubKey: HubKey): Promise<Metadata> {
  const tour = await getSingle('tours', slug);
  if (!tour || tourHubKey(tour) !== hubKey) return {};
  const metadata = pageMetadata(tour);
  return {
    ...metadata,
    alternates: { canonical: tourPath(tour) }
  };
}

export async function RenderTourRoute({ slug, hubKey }: { slug: string; hubKey: HubKey }) {
  const [tour, allTours, posts] = await Promise.all([getSingle('tours', slug), getContent('tours'), getContent('posts')]);
  if (!tour || tourHubKey(tour) !== hubKey) notFound();
  const relatedTours = allTours.filter((item) => item.slug !== tour.slug && (tourHubKey(item) === hubKey || hubKey === 'multi-country')).slice(0, 3);
  const relatedPosts = posts.filter((post) => {
    const haystack = `${post.title} ${post.excerpt} ${post.content}`.toLowerCase();
    return haystack.includes(hubKey.split('-')[0]) || haystack.includes('indochina') || hubKey === 'multi-country';
  });
  return (
    <>
      <TourDetailPage tour={tour} relatedTours={relatedTours} relatedPosts={relatedPosts.length ? relatedPosts : posts.slice(0, 1)} />
      {tour.meta.blocks?.length ? <CmsBlockRuntime blocks={tour.meta.blocks} className="bg-[color:var(--cms-color-background)] px-4 py-16" /> : null}
    </>
  );
}
