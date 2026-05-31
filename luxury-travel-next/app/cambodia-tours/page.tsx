import type { Metadata } from 'next';
import { HubPage } from '@/components/hub-page';
import { hubs } from '@/lib/fallback-data';
import { getSiteContent } from '@/lib/site-content';
import { resolveStaticPagesContent } from '@/lib/site-content-schema';

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent();
  const override = resolveStaticPagesContent(siteContent).hubs['cambodia'] || {};
  return { title: override.title || hubs['cambodia'].title, description: override.intro || hubs['cambodia'].intro };
}

export default function Page() {
  return <HubPage hubKey="cambodia" />;
}

