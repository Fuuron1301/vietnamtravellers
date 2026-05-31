import type { Metadata } from 'next';
import { getContent } from '@/lib/cms';
import { HeroSection } from '@/components/sections/hero-section';
import { Container, Section } from '@/components/layout/container';
import { CruiseCard } from '@/components/cruise-card';
import { Eyebrow, Heading, Lead } from '@/components/ui/typography';
import { CTAButton } from '@/components/ui/cta-button';
import { getSiteContent } from '@/lib/site-content';
import { resolveStaticPagesContent } from '@/lib/site-content-schema';

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent();
  const page = resolveStaticPagesContent(siteContent).cruisesIndex;
  return { title: page.metaTitle, description: page.metaDescription };
}

export default async function CruisesPage() {
  const [cruises, siteContent] = await Promise.all([getContent('cruises'), getSiteContent()]);
  const page = resolveStaticPagesContent(siteContent).cruisesIndex;
  return (
    <main className="bg-ivory">
      <HeroSection eyebrow={page.heroEyebrow} title={page.heroTitle} subtitle={page.heroSubtitle} image={page.heroImage} primaryCta={{ href: page.heroCtaHref, label: page.heroCtaLabel }} />
      <Section>
        <Container>
          <Eyebrow>{page.sectionEyebrow}</Eyebrow>
          <Heading className="mt-4 text-navy">{page.sectionHeading}</Heading>
          <Lead className="mt-8 max-w-3xl">{page.sectionLead}</Lead>
          {cruises.length > 0 ? (
            <div className="mt-12 grid gap-6 md:grid-cols-3">{cruises.map((cruise) => <CruiseCard key={cruise.slug} cruise={cruise} />)}</div>
          ) : (
            <div className="mt-12 rounded-panel bg-pearl p-8 shadow-soft">
              <Heading level={3} className="text-navy">{page.emptyHeading}</Heading>
              <Lead className="mt-4">{page.emptyLead}</Lead>
            </div>
          )}
          <div className="mt-12"><CTAButton href={page.finalCtaHref} variant="dark">{page.finalCtaLabel}</CTAButton></div>
        </Container>
      </Section>
    </main>
  );
}
