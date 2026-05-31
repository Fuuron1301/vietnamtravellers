import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { WordPressAdminClone, type AdminScreen } from '@/components/admin/wordpress-admin-clone';
import { getAdminPageData } from '@/lib/admin-data';
import { getAdminPageSession } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin - Local WordPress Admin Clone',
  description: 'Route-aware local WordPress-style CMS admin section.',
  robots: { index: false, follow: false }
};

const adminScreens: AdminScreen[] = [
  'dashboard',
  'identity',
  'navigation',
  'homeBuilder',
  'homeSections',
  'staticPages',
  'footerBuilder',
  'siteJson',
  'posts',
  'tours',
  'cruises',
  'media',
  'pages',
  'comments',
  'getwoo',
  'woocommerce',
  'products',
  'analytics',
  'marketing',
  'elementor',
  'templates',
  'design',
  'blocks',
  'appearance',
  'plugins',
  'users',
  'tools',
  'migration',
  'settings',
  'leads',
  'bookings',
  'travelOs'
];

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!adminScreens.includes(section as AdminScreen)) notFound();
  const session = await getAdminPageSession();
  if (!session) redirect(`/admin/login?next=${encodeURIComponent(`/admin/${section}`)}`);
  const { data, siteContent } = await getAdminPageData();
  return <WordPressAdminClone data={data} initialSiteContent={siteContent} initialScreen={section as AdminScreen} />;
}
