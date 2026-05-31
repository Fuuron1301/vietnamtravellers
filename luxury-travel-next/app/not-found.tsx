import Link from 'next/link';
import { Container, Section } from '@/components/layout/container';
import { CTAButton } from '@/components/ui/cta-button';
import { BodyText, Eyebrow, Heading } from '@/components/ui/typography';

export default function NotFound() {
  return (
    <main className="bg-ivory pt-32">
      <Section>
        <Container className="text-center">
          <Eyebrow>Journey not found</Eyebrow>
          <Heading level={1} className="mt-4 text-navy">This route is no longer available.</Heading>
          <BodyText className="mx-auto mt-6 max-w-2xl">
            The tour may have been updated, archived or moved into a new destination collection.
          </BodyText>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <CTAButton href="/customize-your-trip/">Craft a private journey</CTAButton>
            <Link href="/vietnam-tours/" className="inline-flex min-h-12 items-center justify-center rounded-button border border-navy/20 px-6 py-4 text-sm font-extrabold uppercase tracking-widest text-navy transition hover:border-gold hover:text-gold">Browse Vietnam Tours</Link>
          </div>
        </Container>
      </Section>
    </main>
  );
}
