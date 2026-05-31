import type { Metadata } from 'next';
import { TravelStyleAtlas } from '@/components/sections/travel-style-atlas';
import { absoluteUrl, site } from '@/lib/seo';
import { getSiteContent } from '@/lib/site-content';
import { resolveStaticPagesContent } from '@/lib/site-content-schema';

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent();
  const page = resolveStaticPagesContent(siteContent).travelStyles;
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: absoluteUrl('/travel-styles/') },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: absoluteUrl('/travel-styles/'),
      siteName: site.name
    }
  };
}

export default async function TravelStylesPage() {
  const siteContent = await getSiteContent();
  const page = resolveStaticPagesContent(siteContent).travelStyles;
  return (
    <main className="bg-ivory text-navy">
      <TravelStyleAtlas content={page} />
    </main>
  );
}
