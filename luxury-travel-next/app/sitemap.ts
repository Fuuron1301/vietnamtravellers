import type { MetadataRoute } from 'next';
import { getContent } from '@/lib/cms';
import { hubs } from '@/lib/fallback-data';
import { tourPath } from '@/lib/routing';
import { site } from '@/lib/seo';
import { teamProfilePath, travelersTeam } from '@/lib/travelers-team';
import { tripKinds, tripStylePath } from '@/lib/trip-styles';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tours, cruises, posts, styles] = await Promise.all([getContent('tours'), getContent('cruises'), getContent('posts'), getContent('styles')]);
  const staticRoutes = [
    '/',
    '/why-travel-with-us/',
    '/planning-flow/',
    '/faqs/',
    '/travel-journal/',
    '/guest-memory/',
    '/customize-your-trip/',
    '/payment/',
    '/blog/',
    '/blog/team/',
    '/terms-and-conditions/',
    '/privacy-security/',
    '/cruises/',
    '/travel-styles/',
    ...Object.values(hubs).map((hub) => `/${hub.slug}/`)
  ];
  return [
    ...staticRoutes.map((path) => ({ url: `${site.url}${path}`, changeFrequency: 'weekly' as const, priority: path === '/' ? 1 : 0.8 })),
    ...tours.map((item) => ({ url: `${site.url}${tourPath(item)}`, changeFrequency: 'weekly' as const, priority: 0.85 })),
    ...cruises.map((item) => ({ url: `${site.url}/cruise/${item.slug}/`, changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...tripKinds.map((item) => ({ url: `${site.url}${tripStylePath(item)}`, changeFrequency: 'monthly' as const, priority: 0.72 })),
    ...styles.map((item) => ({ url: `${site.url}/travel-styles/${item.slug}/`, changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...travelersTeam.map((member) => ({ url: `${site.url}${teamProfilePath(member)}`, changeFrequency: 'monthly' as const, priority: 0.65 })),
    ...posts.map((item) => ({ url: `${site.url}/blog/${item.slug}/`, changeFrequency: 'monthly' as const, priority: 0.65 }))
  ];
}

