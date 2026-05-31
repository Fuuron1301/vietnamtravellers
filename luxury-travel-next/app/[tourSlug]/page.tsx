import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { HubPage } from '@/components/hub-page';
import { getSingle } from '@/lib/cms';
import { hubs } from '@/lib/fallback-data';
import { absoluteUrl, pageMetadata } from '@/lib/seo';
import { hubKeyFromPathSlug, hubPath, tourPath } from '@/lib/routing';

export async function generateMetadata({ params }: { params: Promise<{ tourSlug: string }> }): Promise<Metadata> {
  const { tourSlug } = await params;
  const hubKey = hubKeyFromPathSlug(tourSlug);
  if (hubKey) {
    const hub = hubs[hubKey];
    return {
      title: hub.title,
      description: hub.intro,
      alternates: { canonical: absoluteUrl(hubPath(hubKey)) }
    };
  }

  const tour = await getSingle('tours', tourSlug);
  return pageMetadata(tour);
}

export default async function LegacyTourRedirect({ params }: { params: Promise<{ tourSlug: string }> }) {
  const { tourSlug } = await params;
  const hubKey = hubKeyFromPathSlug(tourSlug);
  if (hubKey) return <HubPage hubKey={hubKey} />;

  const tour = await getSingle('tours', tourSlug);
  if (!tour) notFound();
  redirect(tourPath(tour));
}
