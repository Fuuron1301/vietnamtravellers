import { tripKinds } from './trip-styles';

export type BookingOption = {
  value: string;
  label: string;
  note?: string;
};

export const bookingCatalogStats = {
  totalTours: 1559,
  source: 'BestPrice + AsiaTours public tour facts',
  countryCounts: {
    Vietnam: 685,
    Thailand: 185,
    Cambodia: 140,
    Myanmar: 94,
    Laos: 85,
    'Multi Country': 76,
    Indonesia: 59,
    Malaysia: 41,
    Philippines: 31,
    Japan: 28,
    Bhutan: 28,
    China: 24,
    Nepal: 22,
    India: 20,
    'Sri Lanka': 18,
    'South Korea': 14,
    Singapore: 6,
    'Hong Kong': 3
  }
};

export const bookingDestinations: BookingOption[] = [
  { value: 'Vietnam', label: 'Vietnam', note: '685 routes: Hanoi, Ha Long, Hoi An, Mekong, Sapa' },
  { value: 'Laos', label: 'Laos', note: '85 routes: Luang Prabang, Mekong, Kuang Si, Nong Khiaw' },
  { value: 'Cambodia', label: 'Cambodia', note: '140 routes: Siem Reap, Angkor, Phnom Penh, coast' },
  { value: 'Thailand', label: 'Thailand', note: '185 routes: Bangkok, Chiang Mai, Phuket, islands' },
  { value: 'Myanmar', label: 'Myanmar', note: '94 routes: Yangon, Bagan, Inle, Mandalay' },
  { value: 'Indonesia', label: 'Indonesia', note: '59 routes: Bali, Java, Borobudur, Komodo' },
  { value: 'Malaysia', label: 'Malaysia', note: '41 routes: Kuala Lumpur, Penang, Borneo, Langkawi' },
  { value: 'Singapore', label: 'Singapore', note: '6 routes: Marina Bay, gardens, hawker food, Sentosa' },
  { value: 'Philippines', label: 'Philippines', note: '31 routes: Palawan, Cebu, Bohol, Manila' },
  { value: 'China', label: 'China', note: '24 routes: Beijing, Xian, Shanghai, Guilin' },
  { value: 'Hong Kong', label: 'Hong Kong', note: '3 routes: Victoria Harbour, The Peak, dim sum' },
  { value: 'Japan', label: 'Japan', note: '28 routes: Tokyo, Kyoto, Osaka, Hakone' },
  { value: 'South Korea', label: 'South Korea', note: '14 routes: Seoul, Busan, Gyeongju, Jeju' },
  { value: 'Bhutan', label: 'Bhutan', note: '28 routes: Paro, Thimphu, Punakha, Tiger Nest' },
  { value: 'Nepal', label: 'Nepal', note: '22 routes: Kathmandu, Pokhara, Chitwan, Himalaya' },
  { value: 'India', label: 'India', note: '20 routes: Delhi, Agra, Jaipur, Rajasthan, Kerala' },
  { value: 'Sri Lanka', label: 'Sri Lanka', note: '18 routes: Sigiriya, Kandy, Ella, Galle' },
  { value: 'Multi Country', label: 'Multi Country', note: '76 routes: Indochina and cross-border combinations' }
];

export const bookingRouteFocus: BookingOption[] = [
  { value: 'Classic highlights', label: 'Classic highlights', note: 'Signature cities and heritage flow' },
  { value: 'Northern mountains', label: 'Northern mountains', note: 'Sapa, Mai Chau and highland valleys' },
  { value: 'Bay and river journeys', label: 'Bay and river journeys', note: 'Ha Long, Lan Ha and Mekong days' },
  { value: 'Temples and heritage', label: 'Temples and heritage', note: 'Angkor, Hue, Bagan and Luang Prabang' },
  { value: 'Beach and island recovery', label: 'Beach and island recovery', note: 'Phuket, Phu Quoc and quiet coastlines' },
  { value: 'Cross-border Indochina', label: 'Cross-border Indochina', note: 'Vietnam, Cambodia, Laos and Thailand' }
];

export const bookingDurations: BookingOption[] = [
  { value: 'Half-day / 1 day add-on', label: 'Half-day / 1 day add-on', note: 'Private city, food, boat or countryside extension' },
  { value: '3-5 days', label: '3-5 days', note: 'Short country focus or premium stopover' },
  { value: '6-8 days', label: '6-8 days', note: 'One country with calmer pacing' },
  { value: '9-12 days', label: '9-12 days', note: 'Most requested private journey length' },
  { value: '13-16 days', label: '13-16 days', note: 'Deeper route with beach, cruise or mountain time' },
  { value: '17+ days', label: '17+ days', note: 'Grand Indochina or multi-country route' }
];

export const bookingTravelerTypes: BookingOption[] = [
  { value: 'Couple', label: 'Couple', note: 'Private pace, boutique hotels and memorable dinners' },
  { value: 'Family', label: 'Family', note: 'Safe timing, bedding and softer transfer days' },
  { value: 'Friends / Private group', label: 'Friends / Private group', note: 'Shared villas, group dining and flexible rhythm' },
  { value: 'Solo traveler', label: 'Solo traveler', note: 'Trusted guides, clear support and efficient routing' }
];

export const bookingPaces: BookingOption[] = [
  { value: 'Relaxed', label: 'Relaxed', note: 'More hotel time, fewer moves and softer starts' },
  { value: 'Balanced', label: 'Balanced', note: 'Signature sightseeing with enough breathing room' },
  { value: 'Active', label: 'Active', note: 'Longer days, hiking, biking, food walks or more transfers' },
  { value: 'Very flexible', label: 'Very flexible', note: 'Designer recommends the rhythm after reviewing dates' }
];

export const bookingStyles: BookingOption[] = [
  { value: 'Private', label: 'Private', note: 'The largest style group in the updated tour data' },
  ...tripKinds.map((kind) => ({
    value: kind.title,
    label: kind.title,
    note: kind.text
  }))
];

export const bookingBudgets: BookingOption[] = [
  { value: 'USD 1,000 - 2,000 pp', label: 'USD 1,000 - 2,000 pp', note: 'Smart boutique comfort and selective private touring' },
  { value: 'USD 2,000 - 4,000 pp', label: 'USD 2,000 - 4,000 pp', note: 'Most flexible luxury-private planning range' },
  { value: 'USD 4,000 - 7,000 pp', label: 'USD 4,000 - 7,000 pp', note: 'Premium hotels, guides, flights and special access' },
  { value: 'USD 7,000+ pp', label: 'USD 7,000+ pp', note: 'Top suites, rare experiences and high-touch support' },
  { value: 'Please advise', label: 'Please advise', note: 'Designer recommends budget after route scope is clear' }
];

export const bookingHotels: BookingOption[] = [
  { value: '4-star boutique', label: '4-star boutique', note: 'Characterful, comfortable and efficient' },
  { value: '5-star boutique', label: '5-star boutique', note: 'Refined comfort with local atmosphere' },
  { value: 'Iconic luxury', label: 'Iconic luxury', note: 'Best-in-class hotels, suites or landmark stays' },
  { value: 'Villa / resort focus', label: 'Villa / resort focus', note: 'Space, privacy and slower recovery days' },
  { value: 'Best available mix', label: 'Best available mix', note: 'Practical mix by destination and route logic' }
];

export const bookingInterests: BookingOption[] = [
  { value: 'Food and markets', label: 'Food and markets', note: 'Street food, coffee, markets and cooking' },
  { value: 'Cruise and water', label: 'Cruise and water', note: 'Ha Long, Mekong, islands and river routes' },
  { value: 'Wellness and spa', label: 'Wellness and spa', note: 'Retreats, spa hotels and slower stays' },
  { value: 'Heritage and temples', label: 'Heritage and temples', note: 'UNESCO, Angkor, Hue, Bagan, Luang Prabang' },
  { value: 'Beach and islands', label: 'Beach and islands', note: 'Resort recovery and coastal extensions' },
  { value: 'Wildlife and nature', label: 'Wildlife and nature', note: 'Caves, parks, waterfalls and countryside' },
  { value: 'Photography', label: 'Photography', note: 'Scenic timing, viewpoints and golden-hour pacing' },
  { value: 'Local craft', label: 'Local craft', note: 'Villages, workshops, textiles and artisan visits' },
  { value: 'Trains and scenic transfers', label: 'Trains and scenic transfers', note: 'Rail, private drivers and slow-route days' },
  { value: 'Golf and special access', label: 'Golf and special access', note: 'Tee times, private access and premium extras' }
];

export const bookingSupportOptions: BookingOption[] = [
  { value: 'Quote and itinerary only', label: 'Quote and itinerary only', note: 'A clear proposal before you decide' },
  { value: 'Hotels, guides and transfers', label: 'Hotels, guides and transfers', note: 'Core booking support for the private route' },
  { value: 'Flights and border timing', label: 'Flights and border timing', note: 'Domestic flights and border flow checks' },
  { value: 'Full booking and on-trip support', label: 'Full booking and on-trip support', note: 'End-to-end service with travel-day assistance' }
];
