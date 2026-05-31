export type TripKind = {
  num: string;
  title: string;
  eyebrow: string;
  text: string;
  href: string;
  image: string;
  alt: string;
  duration: string;
  mood: string;
};

export function tripStyleSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function tripStylePath(kind: Pick<TripKind, 'title'>) {
  return `/travel-styles/${tripStyleSlug(kind.title)}/`;
}

export function getTripKindBySlug(slug: string) {
  return tripKinds.find((kind) => tripStyleSlug(kind.title) === slug);
}

export const tripKinds: TripKind[] = [
  {
    num: '01',
    title: 'Beach Escapes',
    eyebrow: 'Ocean calm',
    text: 'Soft sand, private transfers, island resorts and slow water days shaped around the weather and your pace.',
    href: '/customize-your-trip/',
    image: '/images/trip-styles/beach-escapes-4k.jpg',
    alt: 'Clear tropical shoreline and soft sand for a private beach escape',
    duration: '7 to 12 days',
    mood: 'Restful and warm'
  },
  {
    num: '02',
    title: 'Island Villas',
    eyebrow: 'Private hideaway',
    text: 'Overwater villas, quiet decks, sunset dining and beach time balanced with seamless hosting.',
    href: '/travel-styles/luxury/',
    image: '/images/trip-styles/island-villas-4k.jpg',
    alt: 'Private island resort pool with tropical palms and polished loungers',
    duration: '5 to 10 days',
    mood: 'Secluded luxury'
  },
  {
    num: '03',
    title: 'Honeymoon',
    eyebrow: 'Romantic coast',
    text: 'Private dinners, spa pauses, soft adventure and resort days with every handoff handled quietly.',
    href: '/travel-styles/honeymoon/',
    image: '/images/assurance-hd/thailand-ang-thong-bay-4k-hd.jpg',
    alt: 'Crisp island bay with calm water for a romantic coast escape',
    duration: '8 to 14 days',
    mood: 'Intimate and calm'
  },
  {
    num: '04',
    title: 'Luxury Stays',
    eyebrow: 'Signature hotels',
    text: 'Design-led hotels, refined rooms, private arrival support and polished service throughout the route.',
    href: '/travel-styles/luxury/',
    image: '/images/trip-styles/luxury-stays-4k.jpg',
    alt: 'Refined resort pool with tropical palms and calm luxury seating',
    duration: 'Flexible',
    mood: 'Polished comfort'
  },
  {
    num: '05',
    title: 'Culture & Heritage',
    eyebrow: 'Living history',
    text: 'Heritage landscapes, local hosts, craft stops and guiding that gives context without rushing the day.',
    href: '/travel-styles/culture/',
    image: '/images/trip-styles/culture-heritage-4k.jpg',
    alt: 'Heritage temple landscape with warm tropical light and water gardens',
    duration: '9 to 16 days',
    mood: 'Deep discovery'
  },
  {
    num: '06',
    title: 'Adventure Vacations',
    eyebrow: 'Soft adventure',
    text: 'Mountain viewpoints, forest trails and active days designed with good hotels and recovery time protected.',
    href: '/travel-styles/adventure/',
    image: '/images/trip-styles/adventure-vacations-4k.jpg',
    alt: 'Layered mountain peaks and clear sky for refined adventure travel',
    duration: '8 to 15 days',
    mood: 'Active but refined'
  },
  {
    num: '07',
    title: 'Waterfall Retreats',
    eyebrow: 'Nature reset',
    text: 'Forest water, quiet lodges and gentle hikes for travelers who want fresh air without rough logistics.',
    href: '/customize-your-trip/',
    image: '/images/trip-styles/waterfall-retreats-4k.jpg',
    alt: 'Lush forest waterfall with fresh water and green rock pools',
    duration: '4 to 8 days',
    mood: 'Fresh and slow'
  },
  {
    num: '08',
    title: 'Culinary Journeys',
    eyebrow: 'Taste led',
    text: 'Market walks, chef tables, local kitchens and food-led routing with clean timing between meals.',
    href: '/travel-styles/culinary/',
    image: '/images/trip-styles/culinary-journeys-4k.jpg',
    alt: 'Chef plating refined dishes in a warm open kitchen',
    duration: '6 to 12 days',
    mood: 'Flavor and story'
  },
  {
    num: '09',
    title: 'Family Holidays',
    eyebrow: 'Easy rhythm',
    text: 'Kid-friendly pacing, pool time, safe transfers and guides who know when to slow the day down.',
    href: '/travel-styles/family/',
    image: '/images/trip-styles/family-holidays-4k.jpg',
    alt: 'Family sharing a bright outdoor holiday moment with relaxed pacing',
    duration: '7 to 13 days',
    mood: 'Relaxed and safe'
  },
  {
    num: '10',
    title: 'Wellness & Spa',
    eyebrow: 'Quiet recovery',
    text: 'Spa hotels, yoga mornings, healthy dining and low-pressure days for a restorative private route.',
    href: '/customize-your-trip/',
    image: '/images/trip-styles/wellness-spa-4k.jpg',
    alt: 'Quiet spa treatment room prepared for a restorative wellness journey',
    duration: '4 to 10 days',
    mood: 'Restorative'
  },
  {
    num: '11',
    title: 'Wildlife & Safari',
    eyebrow: 'Wild places',
    text: 'Wildlife viewing, naturalist guides and comfortable camps planned around light, heat and distance.',
    href: '/customize-your-trip/',
    image: '/images/trip-styles/wildlife-safari-4k.jpg',
    alt: 'Elephant walking through golden grassland with wide open space',
    duration: '6 to 12 days',
    mood: 'Rare and alive'
  },
  {
    num: '12',
    title: 'Cruise Voyages',
    eyebrow: 'By water',
    text: 'River and ocean-style travel with cabins, shore days and smooth pier-to-hotel arrangements.',
    href: '/cruises/',
    image: '/images/trip-styles/cruise-voyages-4k.jpg',
    alt: 'Elegant cruise ship moving through clear blue water near shore',
    duration: '2 to 7 days',
    mood: 'Slow horizon'
  },
  {
    num: '13',
    title: 'Photography Trips',
    eyebrow: 'Frame the route',
    text: 'Golden-hour timing, scenic viewpoints and flexible days for travelers who want the right light.',
    href: '/customize-your-trip/',
    image: '/images/trip-styles/photography-trips-4k.jpg',
    alt: 'Camera ready for a golden-hour photography-led travel route',
    duration: '7 to 14 days',
    mood: 'Visual and patient'
  },
  {
    num: '14',
    title: 'Celebration Trips',
    eyebrow: 'Milestone travel',
    text: 'Anniversaries, birthdays and private events with hotels, dining and surprises planned discreetly.',
    href: '/customize-your-trip/',
    image: '/images/trip-styles/celebration-trips-4k.jpg',
    alt: 'Elegant celebration table with flowers for a private milestone trip',
    duration: 'Flexible',
    mood: 'Personal and joyful'
  },
  {
    num: '15',
    title: 'Mountain Retreats',
    eyebrow: 'Highland air',
    text: 'View-led lodges, quiet trails, fireside dinners and soft mountain days with every transfer pre-arranged.',
    href: '/customize-your-trip/',
    image: '/images/trip-styles/mountain-retreats-4k.jpg',
    alt: 'Crisp mountain valley and lake light for a highland retreat',
    duration: '5 to 11 days',
    mood: 'Clear and cool'
  },
  {
    num: '16',
    title: 'City Breaks',
    eyebrow: 'Urban polish',
    text: 'Stylish hotels, private drivers, rooftop evenings and curated neighborhoods without rushed checklists.',
    href: '/customize-your-trip/',
    image: '/images/trip-styles/city-breaks-4k.jpg',
    alt: 'City skyline and urban lights for a polished private city break',
    duration: '3 to 6 days',
    mood: 'Sharp and lively'
  },
  {
    num: '17',
    title: 'Rail Journeys',
    eyebrow: 'Scenic slow travel',
    text: 'Panoramic train days, comfortable stopovers and luggage handling so the route feels calm, not complicated.',
    href: '/customize-your-trip/',
    image: '/images/trip-styles/rail-journeys-4k.jpg',
    alt: 'Scenic rail line cutting through a wide landscape for slow travel',
    duration: '6 to 12 days',
    mood: 'Measured and scenic'
  },
  {
    num: '18',
    title: 'Diving & Marine',
    eyebrow: 'Blue world',
    text: 'Reef days, boat support, resort recovery time and marine routes planned around the best seasonal water.',
    href: '/customize-your-trip/',
    image: '/images/trip-styles/diving-marine-4k.jpg',
    alt: 'Clear marine water and reef color for a diving holiday',
    duration: '5 to 10 days',
    mood: 'Bright and weightless'
  },
  {
    num: '19',
    title: 'Golf Holidays',
    eyebrow: 'Fairway days',
    text: 'Tee times, resort stays, private transfers and relaxed dining planned around easy rounds and good weather.',
    href: '/customize-your-trip/',
    image: '/images/trip-styles/golf-holidays-4k.jpg',
    alt: 'Manicured golf fairway and open sky for a polished golf holiday',
    duration: '4 to 9 days',
    mood: 'Leisurely precision'
  },
  {
    num: '20',
    title: 'Multi Country',
    eyebrow: 'Seamless borders',
    text: 'Connected countries, fewer logistics gaps, smart flight timing and one private plan across the whole route.',
    href: '/multi-country-tours/',
    image: '/images/trip-styles/multi-country-4k.jpg',
    alt: 'Passport, map and travel planning details for a multi-country route',
    duration: '10 to 21 days',
    mood: 'Connected and easy'
  }
];
