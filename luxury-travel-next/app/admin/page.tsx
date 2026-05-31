import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { WordPressAdminClone } from '@/components/admin/wordpress-admin-clone';
import { getAdminPageData } from '@/lib/admin-data';
import { getAdminPageSession } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Bảng tin - Local WordPress Admin Clone',
  description: 'Local WordPress-style admin clone for the integrated Next.js travel website.',
  robots: { index: false, follow: false }
};

export default async function AdminPage() {
  const session = await getAdminPageSession();
  if (!session) redirect(`/admin/login?next=${encodeURIComponent('/admin')}`);
  const { data, siteContent } = await getAdminPageData();
  return <WordPressAdminClone data={data} initialSiteContent={siteContent} />;
}
