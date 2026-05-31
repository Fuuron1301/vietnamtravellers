export type ComponentName =
  | 'HeroSection'
  | 'DestinationMosaicGrid'
  | 'TourCard'
  | 'BookingWizard'
  | 'StickyCTA'
  | 'NavigationBar'
  | 'TestimonialCarousel'
  | 'BlogCard'
  | 'FAQAccordion'
  | 'CinematicHeroScene'
  | 'DestinationCard3D'
  | 'ParallaxDepthLayer'
  | 'MagneticCTA';

export type RootReference = 'asia-pioneer-seo' | 'asiatica-conversion' | 'luxtravel-visual';

export type ComponentContract = {
  name: ComponentName;
  structure: {
    layoutType: 'hero' | 'grid' | 'card' | 'wizard' | 'navigation' | 'carousel' | 'accordion' | 'cta';
    gridAlignment: '12-column' | '8-column' | '4-column' | 'content-container' | 'viewport';
    maxWidth: 'content-1200' | 'page-1440' | 'viewport' | 'intrinsic';
  };
  style: {
    spacing: string[];
    typography: string[];
    colors: string[];
  };
  motion: {
    entry: 'fadeUp800' | 'none';
    hover: 'lift200' | 'imageZoom400' | 'none';
    transition: 'micro200' | 'ui400' | 'section800';
  };
  interaction: string[];
  roots: RootReference[];
};

