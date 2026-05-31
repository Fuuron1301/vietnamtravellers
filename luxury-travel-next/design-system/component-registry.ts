import type { ComponentContract } from './contracts';

export const componentRegistry: ComponentContract[] = [
  {
    name: 'CinematicHeroScene',
    structure: { layoutType: 'hero', gridAlignment: 'viewport', maxWidth: 'viewport' },
    style: { spacing: ['24', '32', '48', '96'], typography: ['display-80', 'body-18'], colors: ['navy', 'ivory', 'gold'] },
    motion: { entry: 'fadeUp800', hover: 'none', transition: 'section800' },
    interaction: ['client-only lazy WebGL', 'static fallback', 'cursor camera tilt', 'SEO content remains DOM-first'],
    roots: ['luxtravel-visual']
  },
  {
    name: 'DestinationCard3D',
    structure: { layoutType: 'card', gridAlignment: '12-column', maxWidth: 'intrinsic' },
    style: { spacing: ['16', '24', '32'], typography: ['heading-32', 'body-14'], colors: ['navy', 'ivory', 'gold'] },
    motion: { entry: 'fadeUp800', hover: 'imageZoom400', transition: 'ui400' },
    interaction: ['floating sine motion', 'hover tilt', 'country hub link'],
    roots: ['asia-pioneer-seo', 'luxtravel-visual']
  },
  {
    name: 'ParallaxDepthLayer',
    structure: { layoutType: 'hero', gridAlignment: 'viewport', maxWidth: 'viewport' },
    style: { spacing: ['32', '64', '96'], typography: ['body-16'], colors: ['navy', 'ivory', 'gold'] },
    motion: { entry: 'none', hover: 'none', transition: 'section800' },
    interaction: ['scroll depth illusion', 'non-blocking visual enhancement'],
    roots: ['luxtravel-visual']
  },
  {
    name: 'MagneticCTA',
    structure: { layoutType: 'cta', gridAlignment: 'content-container', maxWidth: 'intrinsic' },
    style: { spacing: ['16', '24'], typography: ['body-14'], colors: ['gold', 'navy'] },
    motion: { entry: 'none', hover: 'lift200', transition: 'micro200' },
    interaction: ['cursor spring attraction', 'glow on hover', 'links to booking wizard'],
    roots: ['asiatica-conversion', 'luxtravel-visual']
  },
  {
    name: 'HeroSection',
    structure: { layoutType: 'hero', gridAlignment: 'viewport', maxWidth: 'viewport' },
    style: { spacing: ['24', '32', '48', '96'], typography: ['display-80', 'body-18'], colors: ['navy', 'ivory', 'gold'] },
    motion: { entry: 'fadeUp800', hover: 'none', transition: 'section800' },
    interaction: ['primary CTA visible above the fold', 'content centered over cinematic media'],
    roots: ['luxtravel-visual', 'asiatica-conversion']
  },
  {
    name: 'DestinationMosaicGrid',
    structure: { layoutType: 'grid', gridAlignment: '12-column', maxWidth: 'content-1200' },
    style: { spacing: ['16', '24', '48', '96'], typography: ['heading-48', 'body-18'], colors: ['navy', 'ivory', 'gold'] },
    motion: { entry: 'fadeUp800', hover: 'imageZoom400', transition: 'ui400' },
    interaction: ['country hub cards link to SEO hub pages'],
    roots: ['asia-pioneer-seo', 'luxtravel-visual']
  },
  {
    name: 'TourCard',
    structure: { layoutType: 'card', gridAlignment: 'content-container', maxWidth: 'intrinsic' },
    style: { spacing: ['16', '24', '32'], typography: ['heading-32', 'body-14'], colors: ['navy', 'ivory', 'gold'] },
    motion: { entry: 'fadeUp800', hover: 'imageZoom400', transition: 'ui400' },
    interaction: ['hover reveal CTA', 'duration price rating micro UI'],
    roots: ['luxtravel-visual', 'asiatica-conversion']
  },
  {
    name: 'BookingWizard',
    structure: { layoutType: 'wizard', gridAlignment: 'content-container', maxWidth: 'content-1200' },
    style: { spacing: ['16', '24', '32', '48'], typography: ['heading-40', 'body-16'], colors: ['navy', 'ivory', 'gold'] },
    motion: { entry: 'fadeUp800', hover: 'none', transition: 'ui400' },
    interaction: ['one question per step', 'progress visible', 'summary before submit', 'local draft autosave'],
    roots: ['asiatica-conversion']
  },
  {
    name: 'StickyCTA',
    structure: { layoutType: 'cta', gridAlignment: 'viewport', maxWidth: 'intrinsic' },
    style: { spacing: ['16', '24'], typography: ['body-14'], colors: ['gold', 'navy'] },
    motion: { entry: 'none', hover: 'lift200', transition: 'micro200' },
    interaction: ['always visible mobile and desktop', 'links to tailor-made form'],
    roots: ['asiatica-conversion']
  },
  {
    name: 'NavigationBar',
    structure: { layoutType: 'navigation', gridAlignment: 'content-container', maxWidth: 'content-1200' },
    style: { spacing: ['16', '24', '32'], typography: ['body-14'], colors: ['navy', 'ivory', 'gold'] },
    motion: { entry: 'none', hover: 'none', transition: 'ui400' },
    interaction: ['transparent on load', 'solid blur on scroll', 'country hub links visible'],
    roots: ['asia-pioneer-seo', 'luxtravel-visual']
  },
  {
    name: 'TestimonialCarousel',
    structure: { layoutType: 'carousel', gridAlignment: 'content-container', maxWidth: 'content-1200' },
    style: { spacing: ['32', '48', '96'], typography: ['display-64', 'body-14'], colors: ['navy', 'ivory', 'gold'] },
    motion: { entry: 'fadeUp800', hover: 'none', transition: 'section800' },
    interaction: ['cinematic quote presentation'],
    roots: ['luxtravel-visual']
  },
  {
    name: 'BlogCard',
    structure: { layoutType: 'card', gridAlignment: 'content-container', maxWidth: 'intrinsic' },
    style: { spacing: ['16', '24', '32'], typography: ['heading-32', 'body-14'], colors: ['navy', 'ivory', 'gold'] },
    motion: { entry: 'fadeUp800', hover: 'lift200', transition: 'micro200' },
    interaction: ['links blog to hub and form'],
    roots: ['asia-pioneer-seo', 'luxtravel-visual']
  },
  {
    name: 'FAQAccordion',
    structure: { layoutType: 'accordion', gridAlignment: 'content-container', maxWidth: 'content-1200' },
    style: { spacing: ['16', '24'], typography: ['heading-24', 'body-14'], colors: ['navy', 'ivory', 'gold'] },
    motion: { entry: 'fadeUp800', hover: 'none', transition: 'ui400' },
    interaction: ['FAQ schema support', 'minimal disclosure'],
    roots: ['asia-pioneer-seo']
  }
];

