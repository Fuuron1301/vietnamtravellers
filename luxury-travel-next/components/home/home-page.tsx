import { CmsItem } from '@/lib/types';
import type { ReactNode } from 'react';
import { HeroSection } from '@/components/sections/hero-section';
import { DestinationMosaic } from '@/components/sections/destination-mosaic';
import { TripStyleDeck } from '@/components/sections/trip-style-deck';
import { FeaturedTours } from '@/components/sections/featured-tours';
import { HomeFeatureSpotlight } from '@/components/sections/home-feature-spotlight';
import { WhyChooseUs } from '@/components/sections/why-choose-us';
import { JourneyFlow } from '@/components/sections/journey-flow';
import { EasyBookingSteps } from '@/components/sections/easy-booking-steps';
import { TestimonialCinema } from '@/components/sections/testimonial-cinema';
import { TravelDesignersStrip } from '@/components/sections/travel-designers-strip';
import { TrustedByStrip } from '@/components/sections/trusted-by-strip';
import { BlogPreview } from '@/components/sections/blog-preview';
import { MemoryGallery } from '@/components/sections/memory-gallery';
import { CmsBlockRenderer } from '@/components/blocks/cms-block-renderer';
import type { CmsBlockNode, ReusableBlockMap } from '@/lib/blocks/block-types';
import { defaultSiteContent, resolveHomeSectionContent, type HomeSectionId, type SiteContent } from '@/lib/site-content-schema';

type HomePageProps = {
  tours: CmsItem[];
  styles: CmsItem[];
  testimonials: CmsItem[];
  posts: CmsItem[];
  siteContent?: SiteContent;
  cmsBlocks?: CmsBlockNode[];
  reusableBlocks?: ReusableBlockMap;
};

export function HomePage({ tours, testimonials, posts, siteContent = defaultSiteContent, cmsBlocks = [], reusableBlocks }: HomePageProps) {
  const hero = siteContent.home.hero;
  const sectionContent = resolveHomeSectionContent(siteContent);
  const sections: Record<HomeSectionId, ReactNode> = {
    destinations: <DestinationMosaic content={sectionContent.destinations} />,
    styles: <TripStyleDeck content={sectionContent.styles} />,
    featuredTours: <FeaturedTours tours={tours} content={sectionContent.featuredTours} />,
    spotlight: <HomeFeatureSpotlight content={sectionContent.spotlight} />,
    whyChooseUs: <WhyChooseUs content={sectionContent.whyChooseUs} />,
    journeyFlow: <JourneyFlow content={sectionContent.journeyFlow} />,
    bookingSteps: <EasyBookingSteps content={sectionContent.bookingSteps} />,
    testimonials: <TestimonialCinema testimonials={testimonials} content={sectionContent.testimonials} />,
    designers: <TravelDesignersStrip content={sectionContent.designers} />,
    trustedBy: <TrustedByStrip content={sectionContent.trustedBy} />,
    blogPreview: <BlogPreview posts={posts} content={sectionContent.blogPreview} />,
    memoryGallery: <MemoryGallery eyebrow={sectionContent.memoryGallery.eyebrow} title={sectionContent.memoryGallery.heading} description={sectionContent.memoryGallery.description} sideNote={sectionContent.memoryGallery.sideNote} />
  };

  return (
    <main className="bg-ivory">
      <HeroSection
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        image={hero.image}
        images={hero.images}
        imagePosition={hero.images[0]?.position}
        primaryCta={hero.primaryCta}
        secondaryCta={hero.secondaryCta}
        showPlanningFilter
      />
      {cmsBlocks.length ? <section className="ds-section bg-[color:var(--cms-color-background)]"><div className="mx-auto max-w-7xl px-4"><CmsBlockRenderer blocks={cmsBlocks} reusableBlocks={reusableBlocks} /></div></section> : null}
      {siteContent.home.sections.order.map((sectionId) => (
        siteContent.home.sections.visibility[sectionId] ? <div key={sectionId}>{sections[sectionId]}</div> : null
      ))}
    </main>
  );
}

