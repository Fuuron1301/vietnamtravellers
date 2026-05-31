import { HomePage } from '@/components/home/home-page';
import { getContent } from '@/lib/cms';
import { getOptionBlocks, getReusableBlockMap } from '@/lib/blocks/cms-runtime';
import { getSiteContent } from '@/lib/site-content';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [tours, styles, testimonials, posts, siteContent] = await Promise.all([
    getContent('tours'),
    getContent('styles'),
    getContent('testimonials'),
    getContent('posts'),
    getSiteContent()
  ]);
  const cmsBlocks = await getOptionBlocks('homepage_cms_blocks');
  const reusableBlocks = cmsBlocks.length ? await getReusableBlockMap() : undefined;
  return <HomePage tours={tours} styles={styles} testimonials={testimonials} posts={posts} siteContent={siteContent} cmsBlocks={cmsBlocks} reusableBlocks={reusableBlocks} />;
}

