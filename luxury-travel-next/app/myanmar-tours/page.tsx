import type { Metadata } from 'next';
import { HubPage } from '@/components/hub-page';
import { hubs } from '@/lib/fallback-data';
import { getSiteContent } from '@/lib/site-content';
import { resolveStaticPagesContent } from '@/lib/site-content-schema';

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent();
  const override = resolveStaticPagesContent(siteContent).hubs['myanmar'] || {};
  return { title: override.title || hubs['myanmar'].title, description: override.intro || hubs['myanmar'].intro };
}

export default function Page() {
  return <HubPage hubKey="myanmar" />;
}
