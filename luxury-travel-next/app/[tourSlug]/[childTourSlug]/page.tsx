import { notFound } from 'next/navigation';
import { generateTourMetadata, RenderTourRoute } from '@/app/tour-page';
import { hubKeyFromPathSlug } from '@/lib/routing';

export const revalidate = 300;
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ tourSlug: string; childTourSlug: string }> }) {
  const { tourSlug, childTourSlug } = await params;
  const hubKey = hubKeyFromPathSlug(tourSlug);
  if (!hubKey) return {};
  return generateTourMetadata(childTourSlug, hubKey);
}

export default async function Page({ params }: { params: Promise<{ tourSlug: string; childTourSlug: string }> }) {
  const { tourSlug, childTourSlug } = await params;
  const hubKey = hubKeyFromPathSlug(tourSlug);
  if (!hubKey) notFound();
  return <RenderTourRoute slug={childTourSlug} hubKey={hubKey} />;
}
