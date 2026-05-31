import type { ComponentName } from './contracts';

export type PageBlueprint = {
  page: 'Home' | 'CountryHub' | 'TourDetail' | 'BlogIndex' | 'BlogDetail' | 'CustomizeTrip';
  components: ComponentName[];
  requiredRoot: 'asia-pioneer-seo' | 'asiatica-conversion' | 'luxtravel-visual';
};

export const pageBlueprints: PageBlueprint[] = [
  { page: 'Home', requiredRoot: 'luxtravel-visual', components: ['NavigationBar', 'HeroSection', 'CinematicHeroScene', 'DestinationMosaicGrid', 'DestinationCard3D', 'TourCard', 'BookingWizard', 'MagneticCTA', 'TestimonialCarousel', 'BlogCard', 'StickyCTA'] },
  { page: 'CountryHub', requiredRoot: 'asia-pioneer-seo', components: ['NavigationBar', 'HeroSection', 'CinematicHeroScene', 'DestinationMosaicGrid', 'DestinationCard3D', 'TourCard', 'BookingWizard', 'MagneticCTA', 'FAQAccordion', 'StickyCTA'] },
  { page: 'TourDetail', requiredRoot: 'asiatica-conversion', components: ['NavigationBar', 'HeroSection', 'TourCard', 'BookingWizard', 'MagneticCTA', 'FAQAccordion', 'StickyCTA'] },
  { page: 'BlogIndex', requiredRoot: 'asia-pioneer-seo', components: ['NavigationBar', 'HeroSection', 'BlogCard', 'StickyCTA'] },
  { page: 'BlogDetail', requiredRoot: 'asia-pioneer-seo', components: ['NavigationBar', 'HeroSection', 'BlogCard', 'StickyCTA'] },
  { page: 'CustomizeTrip', requiredRoot: 'asiatica-conversion', components: ['NavigationBar', 'BookingWizard', 'MagneticCTA', 'StickyCTA'] }
];

