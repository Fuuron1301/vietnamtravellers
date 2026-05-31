export type SiteIdentity = {
  adminSiteName: string;
  ariaLabel: string;
  titleLine1: string;
  titleLine2: string;
  tagline: string;
  markImage: string;
};

export type NavLink = {
  label: string;
  href: string;
  description?: string;
};

export type TourNavItem = NavLink & {
  note: string;
  landmark: string;
  image: string;
  imageAlt: string;
};

export type CtaLink = {
  label: string;
  href: string;
};

export type HomeHeroImage = {
  src: string;
  position: string;
};

export const homeSectionIds = [
  'destinations',
  'styles',
  'featuredTours',
  'spotlight',
  'whyChooseUs',
  'journeyFlow',
  'bookingSteps',
  'testimonials',
  'designers',
  'trustedBy',
  'blogPreview',
  'memoryGallery'
] as const;

export type HomeSectionId = (typeof homeSectionIds)[number];

export type HomeSectionLayout = {
  order: HomeSectionId[];
  visibility: Record<HomeSectionId, boolean>;
};

export type WhyChooseUsItem = { title: string; body: string };
export type WhyChooseUsContent = {
  eyebrow: string;
  heading: string;
  backgroundImage: string;
  items: WhyChooseUsItem[];
};

export type JourneyFlowStep = { num: string; label: string; title: string; text: string; detail: string };
export type JourneyFlowAssurance = { num: string; title: string; text: string };
export type JourneyFlowContent = {
  eyebrow: string;
  heading: string;
  lead: string;
  bannerEyebrow: string;
  bannerBody: string;
  steps: JourneyFlowStep[];
  assuranceItems: JourneyFlowAssurance[];
};

export type BookingStepItem = { number: string; title: string; copy: string };
export type BookingStepsContent = {
  heading: string;
  ctaLabel: string;
  ctaHref: string;
  steps: BookingStepItem[];
  image: string;
  imageAlt: string;
  imageOverlay: string;
};

export type TrustedByLogo = { name: string; src: string; width: number; height: number; className: string };
export type TrustedByContent = {
  eyebrow: string;
  heading: string;
  lead: string;
  partnersLabel: string;
  logos: TrustedByLogo[];
  pressLabel: string;
  pressMarks: string[];
};

export type SpotlightFeature = { iconKey: string; eyebrow: string; title: string; copy: string; image: string; alt: string };
export type SpotlightContent = {
  eyebrow: string;
  heading: string;
  lead: string;
  ctaLabel: string;
  ctaHref: string;
  assurances: string[];
  heroImage: string;
  heroImageAlt: string;
  heroBadgeLeft: string;
  heroBadgeRight: string;
  heroEyebrow: string;
  heroTitle: string;
  features: SpotlightFeature[];
};

export type BlogPreviewContent = {
  eyebrow: string;
  heading: string;
  lead: string;
  ctaLabel: string;
  ctaHref: string;
};

export type TestimonialsContent = {
  eyebrow: string;
  backgroundImage: string;
  fallbackQuote: string;
  fallbackAuthor: string;
};

export type DesignersContent = {
  eyebrow: string;
  heading: string;
  lead: string;
  ctaLabel: string;
  ctaHref: string;
  sliderHelper: string;
};

export type MemoryGalleryContent = {
  eyebrow: string;
  heading: string;
  description: string;
  sideNote: string;
};

export type DestinationsAtlasItem = {
  hub: string;
  label: string;
  image: string;
  imageAlt: string;
  imagePosition: string;
  landmarks: string[];
  routeNote: string;
  className: string;
};
export type DestinationsContent = {
  eyebrow: string;
  heading: string;
  lead: string;
  indexEyebrow: string;
  indexCaption: string;
  atlas: DestinationsAtlasItem[];
};

export type TripStyleDeckContent = {
  eyebrow: string;
  heading: string;
  lead: string;
  ctaLabel: string;
  ctaHref: string;
  countLabel: string;
  galleryEyebrow: string;
  galleryTitle: string;
};

export type FeaturedToursContent = {
  eyebrow: string;
  heading: string;
};

export type LegalSectionContent = { title: string; intro: string; points: string[] };
export type LegalPageContent = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  description: string;
  updated: string;
  highlights: string[];
  sections: LegalSectionContent[];
};

export type ContactPageContent = {
  metaTitle: string;
  metaDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroCtaLabel: string;
  heroCtaHref: string;
  phoneNumber: string;
  compactPhoneNumber: string;
  emailAddress: string;
  officeAddress: string;
  mapHref: string;
  consultEyebrow: string;
  consultHeading: string;
  consultLead: string;
  responseEyebrow: string;
  responseHeading: string;
  responseSteps: Array<{ step: string; title: string; copy: string }>;
  planningDetailsHeading: string;
  planningDetails: string[];
};

export type FaqItemContent = { question: string; answer: string };
export type FaqGroupContent = { id: string; eyebrow: string; title: string; iconKey: string; items: FaqItemContent[] };
export type FaqsPageContent = {
  metaTitle: string;
  metaDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  heroLead: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaHref: string;
  heroImage: string;
  quickNotes: Array<{ label: string; copy: string }>;
  navEyebrow: string;
  navTitle: string;
  navLead: string;
  navConciergeEyebrow: string;
  navConciergeBody: string;
  promiseEyebrow: string;
  promiseHeading: string;
  promiseLead: string;
  finalEyebrow: string;
  finalHeading: string;
  finalLead: string;
  finalCtaPrimaryLabel: string;
  finalCtaPrimaryHref: string;
  finalCtaSecondaryLabel: string;
  finalCtaSecondaryHref: string;
  groups: FaqGroupContent[];
};

export type HubPageOverride = {
  kicker?: string;
  title?: string;
  intro?: string;
  narrative?: string;
  highlights?: string[];
  heroImage?: string;
  heroPosition?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  sectionEyebrow?: string;
  sectionHeadingSuffix?: string;
  featuredEyebrow?: string;
  featuredLead?: string;
};

export type TravelStylesPageContent = {
  metaTitle: string;
  metaDescription: string;
  heroImage: string;
  heroEyebrow: string;
  heroTitle: string;
  heroLead: string;
  refineEyebrow: string;
  stylesBadgeSuffix: string;
  privateBadge: string;
};

export type CruisesPageContent = {
  metaTitle: string;
  metaDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroCtaLabel: string;
  heroCtaHref: string;
  sectionEyebrow: string;
  sectionHeading: string;
  sectionLead: string;
  emptyHeading: string;
  emptyLead: string;
  finalCtaLabel: string;
  finalCtaHref: string;
};

export type StaticPagesContent = {
  privacy: LegalPageContent;
  terms: LegalPageContent;
  contact: ContactPageContent;
  faqs: FaqsPageContent;
  hubs: Record<string, HubPageOverride>;
  travelStyles: TravelStylesPageContent;
  cruisesIndex: CruisesPageContent;
};

export type HomeSectionContent = {
  whyChooseUs: WhyChooseUsContent;
  journeyFlow: JourneyFlowContent;
  bookingSteps: BookingStepsContent;
  trustedBy: TrustedByContent;
  spotlight: SpotlightContent;
  blogPreview: BlogPreviewContent;
  testimonials: TestimonialsContent;
  designers: DesignersContent;
  memoryGallery: MemoryGalleryContent;
  destinations: DestinationsContent;
  styles: TripStyleDeckContent;
  featuredTours: FeaturedToursContent;
};

export type SiteContent = {
  version: number;
  updatedAt: string;
  translations?: Record<string, unknown>;
  identity: SiteIdentity;
  navigation: {
    tourChoices: TourNavItem[];
    aboutChoices: NavLink[];
    primaryCta: CtaLink;
    mobileBlogLink: NavLink;
  };
  footer: {
    contactHeading: string;
    openHours: string;
    phoneLabel: string;
    phoneHref: string;
    phoneDisplay: string;
    email: string;
    address: string;
    mapLink: string;
    copyright: string;
    columns: Array<{ title: string; links: NavLink[] }>;
    legalLinks: NavLink[];
  };
  home: {
    hero: {
      eyebrow: string;
      title: string;
      subtitle: string;
      image: string;
      images: HomeHeroImage[];
      primaryCta: CtaLink;
      secondaryCta: CtaLink;
    };
    sections: HomeSectionLayout;
    sectionContent?: Partial<HomeSectionContent>;
  };
  pages?: Partial<StaticPagesContent>;
};

const defaultHeroImages: HomeHeroImage[] = [
  { src: '/images/hero/vietnam-hanoi-temple-of-literature-4k.jpg', position: '50% 52%' },
  { src: '/images/hero/vietnam-da-nang-dragon-bridge-panorama-4k.jpg', position: '50% 48%' },
  { src: '/images/hero/vietnam-saigon-city-hall-4k.jpg', position: '50% 54%' },
  { src: '/images/hero/vietnam-phu-quoc-bai-sao-4k.jpg', position: '50% 50%' }
];

const defaultVisibility = homeSectionIds.reduce((acc, id) => ({ ...acc, [id]: true }), {} as Record<HomeSectionId, boolean>);

export const defaultHomeSectionContent: HomeSectionContent = {
  whyChooseUs: {
    eyebrow: 'Why choose us',
    heading: 'Luxury tailor-made travel, handled with quiet precision.',
    backgroundImage: '/images/collections/tailor-made-private-pool-asia-4k.jpg',
    items: [
      { title: 'Luxury curation', body: 'Vetted hotels, guides and rare local moments.' },
      { title: 'Private operations', body: 'Routing, transfers and suppliers controlled quietly.' },
      { title: 'Human planning', body: 'A consultant refines your route after the form.' },
      { title: 'Curated confidence', body: 'Every detail is checked before your journey begins.' }
    ]
  },
  journeyFlow: {
    eyebrow: 'Journey flow',
    heading: 'Private planning, made beautifully clear.',
    lead: 'A refined process with fewer surprises: your ideas become a balanced route, then a secure booking, then quiet support while you travel.',
    bannerEyebrow: 'Luxury route method',
    bannerBody: 'No rushed package, no generic route. Every proposal is checked for comfort, timing and the feeling you want from the journey.',
    steps: [
      { num: '01', label: 'Private brief', title: 'Share your travel shape', text: 'Destinations, dates, pace, hotel taste and budget become one concise planning brief.', detail: 'What matters first' },
      { num: '02', label: 'Route design', title: 'Refine the itinerary', text: 'A consultant balances flights, drive times, signature stays, guides and rest days.', detail: 'Rhythm and routing' },
      { num: '03', label: 'Secure approval', title: 'Confirm with confidence', text: 'You receive a clean proposal, booking ID, payment handoff and transparent inclusions.', detail: 'Clear handoff' },
      { num: '04', label: 'Travel support', title: 'Move with calm support', text: 'Behind the scenes, operations track suppliers, transfers and on-trip follow-up.', detail: 'Quiet operations' }
    ],
    assuranceItems: [
      { num: '01', title: 'Route logic reviewed', text: 'Checked for pace, comfort and real-world timing.' },
      { num: '02', title: 'Secure booking handoff', text: 'Proposal, booking ID, payment step and inclusions stay clear.' },
      { num: '03', title: 'Quiet travel support', text: 'Suppliers, transfers and on-trip details are tracked quietly.' }
    ]
  },
  bookingSteps: {
    heading: 'Plan once. Travel calmly.',
    ctaLabel: 'Start planning',
    ctaHref: '/customize-your-trip/',
    steps: [
      { number: '01', title: 'Share a brief', copy: 'Tell us the route, dates, pace and must-haves. We turn loose ideas into a clean planning brief.' },
      { number: '02', title: 'Shape the route', copy: 'Your consultant balances hotels, guides, drives and pauses into a route that feels natural.' },
      { number: '03', title: 'Confirm clearly', copy: 'Review inclusions, booking ID, payment steps and support details before departure.' }
    ],
    image: '/images/booking/vietnam-ha-long-kayaks-4k.jpg',
    imageAlt: 'Travelers kayaking between limestone cliffs in Ha Long Bay',
    imageOverlay: 'A beautiful route, confirmed clearly.'
  },
  trustedBy: {
    eyebrow: 'Trusted by',
    heading: 'Trusted by travelers and leading platforms.',
    lead: 'Real travel partners, review signals and media mentions help every private Asia journey feel calm before guests arrive.',
    partnersLabel: 'Recognized travel partners',
    logos: [
      { name: 'VietnamTravelers', src: '/images/trusted-by/vietnamtravelers-logo-transparent.png', width: 1849, height: 1139, className: 'h-[102px] w-auto max-w-[230px] md:h-[124px] xl:h-[132px]' },
      { name: 'GetYourGuide', src: '/images/trusted-by/getyourguide-logo.svg', width: 382, height: 302, className: 'h-[72px] w-auto max-w-[180px] md:h-[86px] xl:h-[92px]' },
      { name: 'Klook', src: '/images/trusted-by/klook-logo-transparent.png', width: 588, height: 168, className: 'h-[48px] w-auto max-w-[198px] md:h-[58px] xl:h-[64px]' },
      { name: 'Trustpilot', src: '/images/trusted-by/trustpilot-logo-transparent.png', width: 320, height: 132, className: 'h-[50px] w-auto max-w-[205px] md:h-[62px] xl:h-[68px]' }
    ],
    pressLabel: 'Also seen in',
    pressMarks: ['NBC News', 'ABC News', 'CBS', 'AP', 'FOX News']
  },
  spotlight: {
    eyebrow: 'Why travel with us',
    heading: 'Quiet luxury, planned with precision.',
    lead: 'A calm ivory planning layer with refined imagery, confident hierarchy and three clear reasons to trust the journey before you book.',
    ctaLabel: 'Start your private brief',
    ctaHref: '/customize-your-trip/',
    assurances: ['Private consultant', '24h first route', 'Checked suppliers'],
    heroImage: '/images/assurance-true4k/vietnam-pu-luong-rice-terraces-true-4k.jpg',
    heroImageAlt: 'Sharp green rice terraces in Pu Luong, Vietnam',
    heroBadgeLeft: 'Signature planning layer',
    heroBadgeRight: 'Human reviewed',
    heroEyebrow: 'Beyond the tour card',
    heroTitle: 'The hidden work that makes travel feel effortless.',
    features: [
      { iconKey: 'Compass', eyebrow: 'Route design', title: 'A journey shaped around your pace.', copy: 'Bay days, flights, private drives and quiet time are balanced so the route feels generous, not rushed.', image: '/images/assurance-true4k/laos-wat-pa-phon-phao-river-true-4k.jpg', alt: 'Wat Pa Phon Phao and Nam Khan River in Luang Prabang, Laos' },
      { iconKey: 'Hotel', eyebrow: 'Luxury curation', title: 'Hotels and guides chosen with taste.', copy: 'Every stay, host and local moment is selected for comfort, atmosphere and the way you prefer to travel.', image: '/images/assurance-true4k/thailand-similan-donald-duck-bay-true-4k.jpg', alt: 'Clear turquoise water and granite rocks at Donald Duck Bay, Similan Islands, Thailand' },
      { iconKey: 'ShieldCheck', eyebrow: 'Human checked', title: 'Every detail reviewed before departure.', copy: 'A consultant checks timing, transfers and supplier fit before your final itinerary is confirmed.', image: '/images/assurance-true4k/cambodia-preah-khan-stone-corridor-true-4k.jpg', alt: 'Crisp stone corridor and carvings at Preah Khan, Angkor, Cambodia' }
    ]
  },
  blogPreview: {
    eyebrow: 'Travel intelligence',
    heading: 'Asia travel tips, best practices, and updates.',
    lead: 'Practical planning notes from our designers, built for travelers who want fewer surprises and smoother private days.',
    ctaLabel: 'View more',
    ctaHref: '/blog/'
  },
  testimonials: {
    eyebrow: 'Guest stories',
    backgroundImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=2200&q=85',
    fallbackQuote: 'Every detail felt effortless, personal and beautifully paced.',
    fallbackAuthor: 'Private guest'
  },
  designers: {
    eyebrow: 'Vietnam Travelers',
    heading: 'Meet Our Travel Designers',
    lead: 'Click a portrait to open the full profile and story.',
    ctaLabel: 'View all profiles',
    ctaHref: '/blog/team/',
    sliderHelper: 'Slide to meet the team'
  },
  memoryGallery: {
    eyebrow: 'Guest memory',
    heading: 'Unforgettable Memories',
    description: 'Real journey moments feel less like content and more like keepsakes: a meal, a quiet view, a face lit up by the day.',
    sideNote: 'Sample memories below use legal high-resolution travel imagery. Replace them with your own guest photos whenever you have approved real client images.'
  },
  destinations: {
    eyebrow: 'Destinations',
    heading: 'Asia routes, framed as a quiet index.',
    lead: 'Six large visual hubs hold the core story. The full index below covers all destination hubs from the current catalog.',
    indexEyebrow: 'Country index',
    indexCaption: 'Search the full catalog across thousands of tour facts.',
    atlas: [
      { hub: 'vietnam', label: 'Vietnam', image: '/images/destinations/vietnam-ha-long-bay.jpg', imageAlt: 'Ha Long Bay limestone karsts and luxury cruise routes in northern Vietnam', imagePosition: '54% 46%', landmarks: ['Ha Long Bay', 'Hanoi', 'Hoi An'], routeNote: 'Limestone cruising, heritage cities and lantern-lit coastal evenings in one refined route.', className: 'sm:col-span-2 lg:col-span-7 lg:row-span-4 min-h-[34rem] lg:min-h-0' },
      { hub: 'laos', label: 'Laos', image: '/images/destinations/laos-kuang-si-falls.jpg', imageAlt: 'Turquoise Kuang Si waterfall pools near Luang Prabang, Laos', imagePosition: '48% 58%', landmarks: ['Luang Prabang', 'Mekong', 'Kuang Si'], routeNote: 'Slow luxury, river days, waterfall pauses and spiritual mornings along the Mekong.', className: 'lg:col-span-5 lg:row-span-2 min-h-[24rem] lg:min-h-0' },
      { hub: 'cambodia', label: 'Cambodia', image: '/images/destinations/cambodia-angkor-wat.jpg', imageAlt: 'Angkor Wat reflected at sunrise in Siem Reap, Cambodia', imagePosition: '50% 52%', landmarks: ['Angkor', 'Siem Reap', 'Tonle Sap'], routeNote: 'Ancient grandeur, expert guiding and quieter temple pacing around Siem Reap.', className: 'lg:col-span-5 lg:row-span-2 min-h-[24rem] lg:min-h-0' },
      { hub: 'thailand', label: 'Thailand', image: '/images/destinations/thailand-temple.jpg', imageAlt: 'Golden temple architecture for private Thailand travel', imagePosition: '50% 45%', landmarks: ['Bangkok', 'Chiang Mai', 'Phuket'], routeNote: 'Temple mornings, mountain craft and island resorts with private transfers throughout.', className: 'lg:col-span-4 lg:row-span-2 min-h-[24rem] lg:min-h-0' },
      { hub: 'myanmar', label: 'Myanmar', image: '/images/hubs/myanmar-bagan-temples-4k.jpg', imageAlt: 'Hot air balloons rising over the temple plain of Bagan in Myanmar', imagePosition: '50% 46%', landmarks: ['Bagan', 'Yangon', 'Inle Lake'], routeNote: 'Golden plains, teak heritage and lakeside villages arranged with careful private pacing.', className: 'lg:col-span-4 lg:row-span-2 min-h-[24rem] lg:min-h-0' },
      { hub: 'multi-country', label: 'Multi Country', image: '/images/destinations/multi-country-route-map.jpg', imageAlt: 'Travel map and camera used to plan a multi-country Southeast Asia route', imagePosition: '55% 55%', landmarks: ['Indochina', 'Smart flights', 'Private routing'], routeNote: 'Vietnam, Laos, Cambodia, Thailand and Myanmar connected without wasting traveler energy.', className: 'sm:col-span-2 lg:col-span-4 lg:row-span-2 min-h-[24rem] lg:min-h-0' }
    ]
  },
  styles: {
    eyebrow: 'Curated travel styles',
    heading: 'Choose your perfect escape.',
    lead: 'Choose a style below and the preview changes in place, without pulling you away from the section.',
    ctaLabel: 'View all',
    ctaHref: '/travel-styles/',
    countLabel: '20 kinds',
    galleryEyebrow: 'Style gallery',
    galleryTitle: 'Pick a style'
  },
  featuredTours: {
    eyebrow: 'Guest-loved journeys',
    heading: 'Journeys guests keep talking about.'
  }
};

export const defaultStaticPagesContent: StaticPagesContent = {
  privacy: {
    metaTitle: 'Privacy Policy | Ha Long Luxury Travel',
    metaDescription: 'See how Ha Long Luxury Travel collects, stores, protects and uses personal information when you browse, request a quote or book a trip.',
    eyebrow: 'Privacy and security',
    title: 'Privacy Policy',
    description: 'How we collect, store and protect information while planning private journeys, sending quotes, processing bookings and supporting travelers.',
    updated: 'May 5, 2026',
    highlights: [
      'We collect only what is needed to plan your trip well.',
      'Sensitive details are shared only with trusted service partners.',
      'You can contact us to review, update or remove your information where allowed.'
    ],
    sections: [
      { title: 'Information we collect', intro: 'We collect only the information needed to plan, confirm and support your journey, together with basic website analytics that help us improve the experience.', points: ['Contact details such as your name, phone number, email address and preferred language when you request a quote or send an inquiry.', 'Trip details such as destination, dates, number of travelers, hotel preferences, budget range, flight notes and special requests.', 'Technical information from your browser, device and usage patterns to help us keep the website secure and useful.'] },
      { title: 'How we use your data', intro: 'We use personal data to answer inquiries, prepare proposals, confirm reservations, send travel documents and support the trip before, during and after travel.', points: ['To respond to messages, build itinerary options and communicate any booking updates.', 'To arrange services with suppliers such as hotels, cruises, transport providers, local guides and ticketing partners.', 'To improve website content, measure interest in routes and make our consultation process clearer and faster.'] },
      { title: 'Sharing with trusted partners', intro: 'We share information only when needed to deliver the services you requested or when the law requires it.', points: ['Relevant booking details may be shared with suppliers who need them to confirm or operate your trip.', 'Payment partners, email providers, analytics tools and customer support platforms may process limited data on our behalf.', 'We do not sell your personal information as a business model.'] },
      { title: 'Payment and security', intro: 'We use reasonable technical and organizational measures to reduce unauthorized access, loss or misuse of data.', points: ['Payment information is processed through the payment methods and gateways listed at checkout or in your invoice flow.', 'We encourage travelers to use secure devices, strong passwords and trusted networks when sending sensitive information.', 'No online system is perfectly secure, but we work to keep our tools, forms and internal processes well maintained and access-controlled.'] },
      { title: 'Cookies, browsing and analytics', intro: 'Like most travel websites, we may use cookies or similar tools to remember preferences, measure traffic and understand which content is useful.', points: ['Cookies may help the site remember language choice, form progress or browsing preferences.', 'Analytics help us understand route interest, page performance and device behavior so we can improve the experience.', 'You can usually control cookies through your browser settings, although some features may work less smoothly if they are disabled.'] },
      { title: 'Retention and access', intro: 'We keep information only for as long as needed for business, legal, accounting or service support purposes.', points: ['You can ask for access, correction or deletion of information where applicable and lawful.', 'If you want us to stop using your data for marketing emails, you can unsubscribe or contact our team directly.', 'Some records may need to be retained for tax, dispute resolution or supplier administration requirements.'] },
      { title: 'Third-party websites and legal updates', intro: 'External links, map embeds and supplier pages are controlled by their own privacy rules and terms.', points: ['Please review the privacy practices of any third-party service you interact with through links on our site.', 'We may update this policy when our services, suppliers or legal duties change.', 'The most recent version on this page always replaces older drafts.'] }
    ]
  },
  terms: {
    metaTitle: 'Terms & Conditions | Ha Long Luxury Travel',
    metaDescription: 'Booking terms for Ha Long Luxury Travel: proposals, payments, changes, travel documents and supplier responsibility for private Asia journeys.',
    eyebrow: 'Booking terms',
    title: 'Terms & Conditions',
    description: 'Clear rules for proposals, payments, changes, travel documents, supplier responsibility and the way we protect each confirmed journey.',
    updated: 'May 5, 2026',
    highlights: [
      'Final inclusions are confirmed in writing before payment.',
      'Supplier conditions can vary by cruise, hotel and season.',
      'Travel insurance is strongly recommended for every guest.'
    ],
    sections: [
      { title: 'Supplier responsibility', intro: 'Ha Long Luxury Travel acts as a travel designer and coordinator for services delivered by hotels, cruises, airlines, transport providers, guides and local suppliers.', points: ['We select suppliers with care, but we cannot control every operational decision made by independent providers, authorities or carriers.', 'We are not liable for delays, losses or service interruptions caused by weather, natural events, illness, strikes, government action, transport disruption, border closures or other events beyond reasonable control.', 'If an issue happens during travel, guests should notify our team as soon as possible so we can help while the service is still taking place.'] }
    ]
  },
  contact: {
    metaTitle: 'Contact Ha Long Luxury Travel',
    metaDescription: 'Speak with a private Asia travel designer for Vietnam, Thailand, Cambodia, Laos and Indochina journeys.',
    heroEyebrow: 'Contact',
    heroTitle: 'Speak with a private Asia travel designer.',
    heroSubtitle: 'Tell us where you want to go, how you like to travel and what pace feels right. We reply within 24 hours.',
    heroImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2400&q=90',
    heroCtaLabel: 'Tailor-made / Customize Your Trip',
    heroCtaHref: '/customize-your-trip/',
    phoneNumber: '+84 962 819 091',
    compactPhoneNumber: '+84962819091',
    emailAddress: 'info@halongluxury.com',
    officeAddress: '32 Hang Buom, Hoan Kiem, Hanoi',
    mapHref: 'https://www.google.com/maps?ll=21.035974,105.851913&z=16&t=m&hl=vi&gl=US&mapclient=embed&cid=2990637696405975621',
    consultEyebrow: 'Private consultation',
    consultHeading: 'Talk to a real Asia travel designer.',
    consultLead: 'A concise message is enough. Tell us the destination, dates and pace you want, and our team will shape the route for you.',
    responseEyebrow: 'Response flow',
    responseHeading: 'How we reply to a private brief.',
    responseSteps: [
      { step: '01', title: 'Confirm details', copy: 'We check destination, dates, guest count and pace.' },
      { step: '02', title: 'Match a specialist', copy: 'Your brief goes to the right consultant or cruise specialist.' },
      { step: '03', title: 'Send a proposal', copy: 'You receive a clear recommendation within 24 hours.' }
    ],
    planningDetailsHeading: 'Helpful details to share',
    planningDetails: ['Route ideas', 'Travel dates', 'Number of travelers', 'Hotel, cruise & pace']
  },
  faqs: {
    metaTitle: 'FAQs | Ha Long Luxury Travel',
    metaDescription: 'Answers to common questions about tailor-made luxury travel, private itineraries, deposits, hotels, guides and support with Ha Long Luxury Travel.',
    heroEyebrow: 'FAQs',
    heroTitle: 'Questions, answered with care.',
    heroLead: 'Practical answers for private Asia journeys: planning, hotels, deposits, visas and the quiet support that keeps a luxury trip feeling effortless.',
    heroPrimaryCtaLabel: 'Start your brief',
    heroPrimaryCtaHref: '/customize-your-trip/',
    heroSecondaryCtaLabel: 'Ask our team',
    heroSecondaryCtaHref: '/contact/',
    heroImage: '/images/collections/tailor-made-private-pool-asia-4k.jpg',
    quickNotes: [
      { label: 'Private by design', copy: 'Every route is shaped around your dates, travel mood, room style and pace.' },
      { label: 'Human checked', copy: 'Hotels, transfers, guides and special notes are reviewed before confirmation.' },
      { label: 'Supported on trip', copy: 'Your travel team stays close enough to solve issues, quietly and quickly.' }
    ],
    navEyebrow: 'Find your answer',
    navTitle: 'Choose the right lane.',
    navLead: 'Browse by planning stage, then send the one detail that affects your route.',
    navConciergeEyebrow: 'Concierge note',
    navConciergeBody: 'If an answer changes the route, ask us directly. We will explain the tradeoff before you commit.',
    promiseEyebrow: 'What we promise',
    promiseHeading: 'Answers are only useful when the plan is clear.',
    promiseLead: 'Every reply should help you understand the route, the cost logic and the support behind the journey, not just move you toward a checkout.',
    finalEyebrow: 'Still deciding?',
    finalHeading: 'Send a question before you send a brief.',
    finalLead: 'Tell us what feels unclear. A travel designer can explain route logic, hotel tradeoffs, timing and the next sensible step.',
    finalCtaPrimaryLabel: 'Contact us',
    finalCtaPrimaryHref: '/contact/',
    finalCtaSecondaryLabel: 'See planning flow',
    finalCtaSecondaryHref: '/planning-flow/',
    groups: [
      { id: 'planning', eyebrow: 'Planning', title: 'Before We Design The Route', iconKey: 'Route', items: [
        { question: 'How does a tailor-made trip begin?', answer: 'It begins with a short brief: your dates, destinations, hotel mood, travel pace, budget range, special occasion notes and anything you already know you want to avoid. From there, a travel designer builds a private route instead of pushing a fixed package.' },
        { question: 'Can you help if we only have a rough idea?', answer: 'Yes. Many guests start with a season, a country or a feeling rather than a full itinerary. We can suggest the right route order, number of nights, hotel bases and private experiences before you commit.' },
        { question: 'How quickly can we receive an itinerary?', answer: 'For simple routes, the first proposal is usually prepared within one to two business days. Complex multi-country journeys, peak-season hotel checks or special access requests may need more time so the plan is accurate.' }
      ] }
    ]
  },
  hubs: {},
  travelStyles: {
    metaTitle: 'Travel styles',
    metaDescription: 'Browse every luxury travel style in one elegant view, then jump into the route that fits your pace.',
    heroImage: '/images/hubs/vietnam-ha-long-bay-4k-crisp.jpg',
    heroEyebrow: 'Curated travel styles',
    heroTitle: 'Choose the mood, then let the journey unfold.',
    heroLead: 'A concise library of private travel styles, filtered by pace, occasion and route type.',
    refineEyebrow: 'Refine your journey',
    stylesBadgeSuffix: 'styles',
    privateBadge: 'Private Asia journeys'
  },
  cruisesIndex: {
    metaTitle: 'Luxury Cruises in Vietnam',
    metaDescription: 'Luxury Ha Long Bay, Lan Ha Bay, Mekong and Vietnam river cruises with cabins, pricing and services.',
    heroEyebrow: 'Luxury cruises',
    heroTitle: 'Private waters, refined cabins and cinematic bays.',
    heroSubtitle: 'Choose premium cruises across Ha Long Bay, Lan Ha Bay, the Mekong and heritage Indochina river routes.',
    heroImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2400&q=90',
    heroCtaLabel: 'Customize Your Cruise',
    heroCtaHref: '/customize-your-trip/',
    sectionEyebrow: 'Cruise collection',
    sectionHeading: 'Curated vessels for quiet luxury on the water.',
    sectionLead: 'Every cruise profile includes cabin types, route flow, price tiers, gallery imagery and included services, ready for consultation or direct booking follow-up.',
    emptyHeading: 'Cruise collection is being curated.',
    emptyLead: 'Ask our team for current Ha Long Bay, Lan Ha Bay and Mekong cruise options.',
    finalCtaLabel: 'Tailor-made / Customize Your Trip',
    finalCtaHref: '/customize-your-trip/'
  }
};

export const defaultSiteContent: SiteContent = {
  version: 1,
  updatedAt: '2026-05-06T00:00:00.000Z',
  translations: {},
  identity: {
    adminSiteName: 'Ha Long Luxury',
    ariaLabel: 'Ha Long Luxury home',
    titleLine1: 'Ha Long',
    titleLine2: 'Luxury',
    tagline: 'Private Asia Journeys',
    markImage: ''
  },
  navigation: {
    tourChoices: [
      { label: 'Vietnam', href: '/vietnam-tours/', note: 'Ha Long, Hanoi, Hoi An, Mekong', landmark: 'Ha Long Bay', description: 'Private routing with bay cruises, lantern towns, imperial stories and slow Mekong river days.', image: 'https://images.pexels.com/photos/34635615/pexels-photo-34635615.jpeg?auto=compress&cs=tinysrgb&w=3840&q=100', imageAlt: 'Sharp aerial view of Ha Long Bay limestone islands in Vietnam' },
      { label: 'Laos', href: '/laos-tours/', note: 'Luang Prabang, Kuang Si, Mekong', landmark: 'Kuang Si Falls', description: 'A slower luxury rhythm through saffron mornings, waterfalls, Mekong viewpoints and serene lodges.', image: 'https://images.pexels.com/photos/31504653/pexels-photo-31504653.jpeg?auto=compress&cs=tinysrgb&w=3840&q=100', imageAlt: 'Clear turquoise water at Kuang Si Falls near Luang Prabang in Laos' },
      { label: 'Cambodia', href: '/cambodia-tours/', note: 'Angkor, Siem Reap, Khmer culture', landmark: 'Angkor Wat', description: 'Temple dawns, private historians, countryside craft encounters and calm boutique stays near Siem Reap.', image: 'https://images.pexels.com/photos/37251717/pexels-photo-37251717.jpeg?auto=compress&cs=tinysrgb&w=3840&q=100', imageAlt: 'Cinematic view of Angkor Wat temple complex in Cambodia' },
      { label: 'Thailand', href: '/thailand-tours/', note: 'Bangkok, Chiang Mai, Phi Phi Islands', landmark: 'Phi Phi Islands', description: 'Island villas, riverfront Bangkok, northern craft villages and soft beach time shaped around your pace.', image: 'https://images.pexels.com/photos/31048318/pexels-photo-31048318.jpeg?auto=compress&cs=tinysrgb&w=3840&q=100', imageAlt: 'High resolution tropical view of Phi Phi Islands in Thailand' },
      { label: 'Myanmar', href: '/myanmar-tours/', note: 'Bagan, Yangon, Mandalay, Inle Lake', landmark: 'Bagan Temples', description: 'Golden plains, teak monasteries, lakeside villages and private heritage days paced with care.', image: '/images/hubs/myanmar-bagan-temples-4k.jpg', imageAlt: 'Hot air balloons rising over the temple plain of Bagan in Myanmar' },
      { label: 'Indonesia', href: '/indonesia-tours/', note: 'Bali, Java, Borobudur, Komodo', landmark: 'Bali and Java', description: 'Temple towns, volcano sunrise, island beaches and soft adventure through Bali and Java.', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=3840&q=90', imageAlt: 'Beach and island scenery for Indonesia tours' },
      { label: 'Malaysia', href: '/malaysia-tours/', note: 'Kuala Lumpur, Penang, Borneo', landmark: 'Kuala Lumpur', description: 'City food, heritage lanes, rainforest wildlife and island escapes shaped with easy luxury pacing.', image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=3840&q=90', imageAlt: 'Skyline and city lights for Malaysia tours' },
      { label: 'Singapore', href: '/singapore-tours/', note: 'Marina Bay, Sentosa, hawker food', landmark: 'Marina Bay', description: 'Short premium city breaks with skyline views, gardens, food halls and polished transit.', image: 'https://images.unsplash.com/photo-1477768663691-9f2f113fa0d5?auto=format&fit=crop&w=3840&q=90', imageAlt: 'Night city skyline for Singapore tours' },
      { label: 'Philippines', href: '/philippines-tours/', note: 'Palawan, Cebu, Bohol, Manila', landmark: 'Palawan', description: 'Lagoon hopping, island beaches, reef days and relaxed tropical routes across the archipelago.', image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=3840&q=90', imageAlt: 'Tropical lagoon scenery for Philippines tours' },
      { label: 'China', href: '/china-tours/', note: 'Beijing, Xian, Shanghai, Guilin', landmark: 'Great Wall', description: 'Classic icons, rail-linked heritage, landscapes, food and active routes for different travel interests.', image: 'https://images.unsplash.com/photo-1547981609-4b6a5b2f0f32?auto=format&fit=crop&w=3840&q=90', imageAlt: 'Great Wall scenery for China tours' },
      { label: 'Hong Kong', href: '/hong-kong-tours/', note: 'Harbour, The Peak, markets', landmark: 'Victoria Harbour', description: 'Harbour lights, food lanes, shopping districts and compact premium stopovers.', image: 'https://images.unsplash.com/photo-1544989164-31dc3c645987?auto=format&fit=crop&w=3840&q=90', imageAlt: 'Harbour skyline for Hong Kong tours' },
      { label: 'Japan', href: '/japan-tours/', note: 'Tokyo, Kyoto, Osaka, Hakone', landmark: 'Kyoto', description: 'Rail journeys, seasonal scenery, temple calm and design-rich cities for first-time and repeat travelers.', image: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=3840&q=90', imageAlt: 'Temple and seasonal scenery for Japan tours' },
      { label: 'South Korea', href: '/south-korea-tours/', note: 'Seoul, Busan, Gyeongju, Jeju', landmark: 'Seoul', description: 'Palace culture, food streets, K-culture energy and coast time balanced in a compact route.', image: 'https://images.unsplash.com/photo-1517157326770-9fedd4f5b0a7?auto=format&fit=crop&w=3840&q=90', imageAlt: 'Modern city skyline for South Korea tours' },
      { label: 'Bhutan', href: '/bhutan-tours/', note: 'Paro, Thimphu, Punakha, Tiger Nest', landmark: 'Tiger Nest', description: 'Mindful mountain travel with monasteries, passes, valleys and quiet premium pacing.', image: 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?auto=format&fit=crop&w=3840&q=90', imageAlt: 'Mountain valley scenery for Bhutan tours' },
      { label: 'Nepal', href: '/nepal-tours/', note: 'Kathmandu, Pokhara, Chitwan', landmark: 'Kathmandu Valley', description: 'Heritage squares, lakes, wildlife and Himalaya views in one naturally varied route.', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=3840&q=90', imageAlt: 'Himalayan landscape for Nepal tours' },
      { label: 'India', href: '/india-tours/', note: 'Delhi, Agra, Jaipur, Kerala', landmark: 'Taj Mahal', description: 'Golden Triangle classics, palaces, backwaters and wildlife routes for longer journeys.', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=3840&q=90', imageAlt: 'Taj Mahal style landmark for India tours' },
      { label: 'Sri Lanka', href: '/sri-lanka-tours/', note: 'Sigiriya, Kandy, Ella, Galle', landmark: 'Sigiriya', description: 'Rock fortresses, tea hills, safari parks and beach finishes across one compact island.', image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=3840&q=90', imageAlt: 'Island and coast scenery for Sri Lanka tours' },
      { label: 'Multi Country', href: '/multi-country-tours/', note: 'Vietnam, Laos, Cambodia, Thailand, Myanmar', landmark: 'Indochina Circuit', description: 'Connected private routes across borders with smart pacing, smooth transfers and one consistent travel team.', image: 'https://images.pexels.com/photos/35676846/pexels-photo-35676846.jpeg?auto=compress&cs=tinysrgb&w=3840&q=100', imageAlt: 'Golden river landscape representing a private Indochina multi-country journey' }
    ],
    aboutChoices: [
      { label: 'Why Travel With Us', href: '/why-travel-with-us/', description: 'Private planning, trusted local hosts and quieter luxury pacing.' },
      { label: 'Our Planning Flow', href: '/planning-flow/', description: 'See how a travel idea becomes a polished tailor-made itinerary.' },
      { label: 'FAQs', href: '/faqs/', description: 'Clear answers on planning, payments, hotels, visas and private support.' },
      { label: 'Travel Journal', href: '/travel-journal/', description: 'Destination notes, route inspiration and seasonal travel ideas.' },
      { label: 'Contact Our Team', href: '/contact/', description: 'Start a conversation with a specialist for your journey.' }
    ],
    primaryCta: { href: '/customize-your-trip/', label: 'Design Your Trip' },
    mobileBlogLink: { href: '/blog/', label: 'Blog' }
  },
  footer: {
    contactHeading: 'Contact Info',
    openHours: 'Open from 8 AM to 10 PM everyday.',
    phoneLabel: 'Tel/WhatsApp/Viber:',
    phoneHref: 'tel:+84962819091',
    phoneDisplay: '+84962819091',
    email: 'info@halongluxury.com',
    address: '32 Hang Buom, Hoan Kiem, Hanoi',
    mapLink: 'https://www.google.com/maps?ll=21.035974,105.851913&z=16&t=m&hl=vi&gl=US&mapclient=embed&cid=2990637696405975621',
    copyright: 'Copyright 2026 Ha Long Luxury. All rights reserved. Tailor-made journeys across Southeast Asia.',
    columns: [
      { title: 'Destinations', links: [{ label: 'All destinations', href: '/#destinations' }, { label: 'Vietnam', href: '/vietnam-tours/' }, { label: 'Laos', href: '/laos-tours/' }, { label: 'Cambodia', href: '/cambodia-tours/' }, { label: 'Thailand', href: '/thailand-tours/' }, { label: 'Myanmar', href: '/myanmar-tours/' }, { label: 'Indonesia', href: '/indonesia-tours/' }, { label: 'Malaysia', href: '/malaysia-tours/' }, { label: 'Singapore', href: '/singapore-tours/' }, { label: 'Philippines', href: '/philippines-tours/' }, { label: 'China', href: '/china-tours/' }, { label: 'Hong Kong', href: '/hong-kong-tours/' }, { label: 'Japan', href: '/japan-tours/' }, { label: 'South Korea', href: '/south-korea-tours/' }, { label: 'Bhutan', href: '/bhutan-tours/' }, { label: 'Nepal', href: '/nepal-tours/' }, { label: 'India', href: '/india-tours/' }, { label: 'Sri Lanka', href: '/sri-lanka-tours/' }, { label: 'Multi Country', href: '/multi-country-tours/' }] },
      { title: 'About Us', links: [{ label: 'Why travel with us', href: '/why-travel-with-us/' }, { label: 'Planning flow', href: '/planning-flow/' }, { label: 'Meet Our Team', href: '/blog/team/' }, { label: 'Agent signup', href: '/contact/' }, { label: 'Career', href: '/contact/' }, { label: 'Contact us', href: '/contact/' }] },
      { title: 'Community', links: [{ label: 'Travel Journal', href: '/travel-journal/' }, { label: 'Travel Blog', href: '/blog/' }, { label: 'Testimonials', href: '/#trusted-by' }, { label: 'Social Responsibility', href: '/blog/' }, { label: 'FAQs', href: '/faqs/' }] }
    ],
    legalLinks: [{ label: 'Terms & Conditions', href: '/terms-and-conditions/' }, { label: 'Privacy Policy', href: '/privacy-security/' }]
  },
  home: {
    hero: {
      eyebrow: 'Tailor-made luxury travel in Southeast Asia',
      title: 'Private journeys, designed with quiet precision.',
      subtitle: 'Private Asia journeys across Vietnam, Laos, Cambodia, Thailand, Myanmar and beyond — tailor-made itineraries, small groups, seamless 5-star service.',
      image: defaultHeroImages[0].src,
      images: defaultHeroImages,
      primaryCta: { href: '/customize-your-trip/', label: 'Tailor-made Journey' },
      secondaryCta: { href: '/vietnam-tours/', label: 'Explore destinations' }
    },
    sections: { order: [...homeSectionIds], visibility: defaultVisibility },
    sectionContent: defaultHomeSectionContent
  },
  pages: defaultStaticPagesContent
};

export function resolveStaticPagesContent(content?: SiteContent): StaticPagesContent {
  const overrides = content?.pages || {};
  return {
    privacy: { ...defaultStaticPagesContent.privacy, ...(overrides.privacy || {}) },
    terms: { ...defaultStaticPagesContent.terms, ...(overrides.terms || {}) },
    contact: { ...defaultStaticPagesContent.contact, ...(overrides.contact || {}) },
    faqs: { ...defaultStaticPagesContent.faqs, ...(overrides.faqs || {}) },
    hubs: { ...defaultStaticPagesContent.hubs, ...(overrides.hubs || {}) },
    travelStyles: { ...defaultStaticPagesContent.travelStyles, ...(overrides.travelStyles || {}) },
    cruisesIndex: { ...defaultStaticPagesContent.cruisesIndex, ...(overrides.cruisesIndex || {}) }
  };
}

export function resolveHomeSectionContent(content?: SiteContent): HomeSectionContent {
  const overrides = content?.home?.sectionContent || {};
  return {
    whyChooseUs: { ...defaultHomeSectionContent.whyChooseUs, ...(overrides.whyChooseUs || {}) },
    journeyFlow: { ...defaultHomeSectionContent.journeyFlow, ...(overrides.journeyFlow || {}) },
    bookingSteps: { ...defaultHomeSectionContent.bookingSteps, ...(overrides.bookingSteps || {}) },
    trustedBy: { ...defaultHomeSectionContent.trustedBy, ...(overrides.trustedBy || {}) },
    spotlight: { ...defaultHomeSectionContent.spotlight, ...(overrides.spotlight || {}) },
    blogPreview: { ...defaultHomeSectionContent.blogPreview, ...(overrides.blogPreview || {}) },
    testimonials: { ...defaultHomeSectionContent.testimonials, ...(overrides.testimonials || {}) },
    designers: { ...defaultHomeSectionContent.designers, ...(overrides.designers || {}) },
    memoryGallery: { ...defaultHomeSectionContent.memoryGallery, ...(overrides.memoryGallery || {}) },
    destinations: { ...defaultHomeSectionContent.destinations, ...(overrides.destinations || {}) },
    styles: { ...defaultHomeSectionContent.styles, ...(overrides.styles || {}) },
    featuredTours: { ...defaultHomeSectionContent.featuredTours, ...(overrides.featuredTours || {}) }
  };
}
