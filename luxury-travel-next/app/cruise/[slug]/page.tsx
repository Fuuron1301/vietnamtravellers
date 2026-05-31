import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Anchor, BedDouble, CheckCircle2, CircleSlash } from 'lucide-react';
import { getContent, getSingle } from '@/lib/cms';
import { pageMetadata } from '@/lib/seo';
import { HeroSection } from '@/components/sections/hero-section';
import { Container, Grid12, Section } from '@/components/layout/container';
import { Eyebrow, Heading, BodyText } from '@/components/ui/typography';
import { CTAButton } from '@/components/ui/cta-button';
import { CruiseCard } from '@/components/cruise-card';
import { TailorMadeForm } from '@/components/tailor-made-form';
import { createBookingTourCatalog } from '@/lib/booking-tour-matcher';

export const revalidate = 300;
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cruise = await getSingle('cruises', slug);
  return pageMetadata(cruise);
}

export default async function CruiseDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [cruise, cruises, tours] = await Promise.all([getSingle('cruises', slug), getContent('cruises'), getContent('tours')]);
  if (!cruise) notFound();
  const gallery = cruise.meta.gallery?.length ? cruise.meta.gallery : [cruise.featuredImage];
  const cabins = cruise.meta.cabins || [];
  const itinerary = cruise.meta.itinerary || [];
  const pricing = cruise.meta.pricing || [];
  const includes = (cruise.meta.details?.includes as string[] | undefined) || [];
  const excludes = (cruise.meta.details?.excludes as string[] | undefined) || [];
  const related = cruises.filter((item) => item.slug !== cruise.slug).slice(0, 3);
  const bookingTourCatalog = createBookingTourCatalog(tours);

  return (
    <main className="bg-ivory">
      <HeroSection eyebrow="Luxury cruise" title={cruise.title} subtitle={cruise.excerpt} image={cruise.featuredImage} primaryCta={{ href: '/customize-your-trip/', label: 'Customize this cruise' }} />
      <Section className="pb-0"><Container><nav aria-label="Breadcrumb" className="text-sm font-extrabold uppercase tracking-widest text-navy/56"><Link href="/">Home</Link><span className="mx-2 text-gold">/</span><Link href="/cruises/">Cruises</Link><span className="mx-2 text-gold">/</span><span className="text-navy">{cruise.title}</span></nav></Container></Section>
      <Section>
        <Grid12>
          <div className="md:col-span-8">
            <div className="grid gap-4 md:grid-cols-3">{gallery.slice(0, 5).map((src, index) => <div key={src} className={index === 0 ? 'relative min-h-96 overflow-hidden rounded-card shadow-soft md:col-span-2' : 'relative min-h-48 overflow-hidden rounded-card shadow-soft'}><Image src={src} alt={`${cruise.title} view ${index + 1}`} fill className="object-cover" /></div>)}</div>
            {cabins.length > 0 && (
              <>
                <Eyebrow className="mt-16">Cabins</Eyebrow>
                <Heading className="mt-4 text-navy">Choose your cabin style.</Heading>
                <div className="mt-8 grid gap-4 md:grid-cols-3">{cabins.map((cabin) => <div key={cabin.name} className="rounded-card bg-pearl p-6 shadow-soft"><BedDouble className="h-6 w-6 text-gold" /><h3 className="ds-h3 mt-4 text-navy">{cabin.name}</h3><BodyText className="mt-4 text-sm">{[cabin.size, cabin.occupancy].filter(Boolean).join(' | ')}</BodyText>{cabin.price && <p className="mt-4 text-sm font-extrabold uppercase tracking-widest text-gold">{cabin.price}</p>}</div>)}</div>
              </>
            )}
            {itinerary.length > 0 && (
              <>
                <Eyebrow className="mt-16">Route</Eyebrow>
                <Heading className="mt-4 text-navy">Cruise itinerary.</Heading>
                <div className="mt-8 grid gap-4">{itinerary.map((day) => <div key={`${day.day}-${day.title}`} className="rounded-card bg-pearl p-6 shadow-soft"><p className="text-sm font-extrabold uppercase tracking-widest text-gold">{day.day}</p><h3 className="ds-h3 mt-4 text-navy">{day.title}</h3><BodyText className="mt-4 text-sm">{day.body}</BodyText></div>)}</div>
              </>
            )}
            {pricing.length > 0 && <div className="mt-16 rounded-panel bg-navy p-8 text-pearl shadow-soft"><Anchor className="h-7 w-7 text-gold" /><Heading level={3} className="mt-4 text-pearl">Pricing tiers</Heading><div className="mt-6 grid gap-4">{pricing.map((row) => <div key={row.tier} className="flex items-center justify-between rounded-button border border-pearl/20 bg-pearl/10 p-4"><span>{row.tier}</span><span className="text-gold">{row.price}</span></div>)}</div></div>}
            {(includes.length > 0 || excludes.length > 0) && <div className="mt-16 grid gap-6 md:grid-cols-2">{includes.length > 0 && <div className="rounded-card bg-pearl p-6 shadow-soft"><Heading level={3} className="text-navy">Included services</Heading><ul className="mt-6 grid gap-4 text-sm text-navy/66">{includes.map((item) => <li key={item} className="flex gap-4"><CheckCircle2 className="h-5 w-5 shrink-0 text-gold" /> {item}</li>)}</ul></div>}{excludes.length > 0 && <div className="rounded-card bg-pearl p-6 shadow-soft"><Heading level={3} className="text-navy">Not included</Heading><ul className="mt-6 grid gap-4 text-sm text-navy/66">{excludes.map((item) => <li key={item} className="flex gap-4"><CircleSlash className="h-5 w-5 shrink-0 text-gold" /> {item}</li>)}</ul></div>}</div>}
          </div>
          <aside className="md:col-span-4 md:sticky md:top-24 md:self-start"><TailorMadeForm compact tourCatalog={bookingTourCatalog} /></aside>
        </Grid12>
      </Section>
      {related.length > 0 && <Section><Container><Eyebrow>Related cruises</Eyebrow><Heading className="mt-4 text-navy">More refined routes on the water.</Heading><div className="mt-12 grid gap-6 md:grid-cols-3">{related.map((item) => <CruiseCard key={item.slug} cruise={item} />)}</div></Container></Section>}
    </main>
  );
}
