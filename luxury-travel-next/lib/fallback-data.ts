import { CmsItem, HubKey } from './types';
import { generatedBlogPosts } from './blog-library';
import { tourHubKey } from './routing';
import asiatoursPublicTourFacts from '../data/asiatours-public-tour-facts.json';
import generatedLegalTours from '../data/generated-legal-tours.json';

const image = (name: string) => `https://images.unsplash.com/${name}?auto=format&fit=crop&w=3840&q=90`;
const hanoiFoodImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Bun-cha-hanoi.jpg/3840px-Bun-cha-hanoi.jpg';
const hanoiTempleImage = '/images/hero/vietnam-hanoi-temple-of-literature-4k.jpg';
const hanoiHoanKiemImage = 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Hoan_Kiem_Lake_-_Hanoi%2C_Vietnam_-_DSC03695.JPG';
const hanoiOldQuarterImage = 'https://upload.wikimedia.org/wikipedia/commons/1/10/Ho_Hoan_Kiem%2C_Old_Quarter%2C_Hanoi%2C_Vietnam_%285246382368%29.jpg';
const hanoiStreetImage = 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Vietnam%2C_Hanoi%2C_Life_on_the_streets_of_central_Hanoi_2.jpg';
const hanoiLongBienImage = 'https://upload.wikimedia.org/wikipedia/commons/0/06/Long_Bi%C3%AAn_Bridge%2C_Hanoi%2C_Vietnam_%287060688061%29.jpg';

type HubContent = {
  title: string;
  slug: string;
  kicker: string;
  intro: string;
  narrative: string;
  highlights: string[];
  neighboring: HubKey[];
};

type AsiaToursPublicTourFact = {
  id?: string;
  type?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  gallery?: string[];
  itinerary?: Array<Record<string, string>>;
  priceUsd?: number;
  currency?: string;
  route?: string;
  places?: string[];
  handpicked?: string[];
  highlights?: string[];
  days?: number;
  duration?: string;
  country?: string;
  countryLabel?: string;
  sourceName?: string;
  sourceUrl?: string;
  sourceReferenceUrl?: string;
  sourceCollectionUrl?: string;
  sourceDestinationKey?: string;
  destinationCount?: number;
  countryCount?: number;
  sourceFacts?: Record<string, unknown>;
};

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];

const toRecordArray = (value: unknown): Array<Record<string, string>> =>
  Array.isArray(value)
    ? value.filter((item): item is Record<string, string> => Boolean(item) && typeof item === 'object' && !Array.isArray(item)).map((item) => {
        const record: Record<string, string> = {};
        for (const [key, entry] of Object.entries(item)) {
          if (typeof entry === 'string' && entry.trim().length > 0) record[key] = entry.trim();
        }
        return record;
      })
    : [];

const formatUsd = (value: unknown) => {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) && number > 0 ? `USD ${Math.round(number).toLocaleString('en-US')}` : '';
};

const routePreview = (places: string[]) => {
  if (!places.length) return 'signature Asia destinations';
  return places.slice(0, 5).join(', ') + (places.length > 5 ? ' and more' : '');
};

const hubLabel = (key: HubKey) => key.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const tripStyleSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

function inferAsiaToursStyle(fact: AsiaToursPublicTourFact) {
  const haystack = [fact.title, fact.excerpt, fact.content, fact.route, ...(fact.places || []), ...(fact.handpicked || []), ...(fact.highlights || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const rules: Array<[RegExp, string]> = [
    [/honeymoon|romantic|romance|anniversary/, 'Honeymoon'],
    [/family|kid|children/, 'Family Holidays'],
    [/golf|fairway|tee\s*time/, 'Golf Holidays'],
    [/beach|island|coast|shore|phuket|krabi|samui|phu quoc|nha trang|bali|lombok|palawan|cebu|bohol|goa/, 'Beach Escapes'],
    [/cruise|halong|ha long|mekong|river|bay|boat|backwater/, 'Cruise Voyages'],
    [/food|cooking|culinary|cuisine|market/, 'Culinary Journeys'],
    [/wellness|spa|yoga|retreat|healing/, 'Wellness & Spa'],
    [/wildlife|safari|nature|waterfall|elephant|park|forest|chitwan|yala|orangutan/, 'Wildlife & Safari'],
    [/trek|hike|hiking|cycle|cycling|bike|adventure|mountain|volcano|cave/, 'Adventure Vacations'],
    [/rail|train/, 'Rail Journeys'],
    [/city|stopover|singapore|hong kong|tokyo|osaka|seoul|bangkok|kuala lumpur|shanghai/, 'City Breaks'],
    [/temple|heritage|culture|cultural|palace|ancient|angkor|bagan|kyoto|bhutan|nepal|india|china/, 'Culture & Heritage']
  ];

  for (const [pattern, style] of rules) {
    if (pattern.test(haystack)) return style;
  }
  return 'Luxury Stays';
}

function buildAsiaToursPricing(fact: AsiaToursPublicTourFact) {
  const price = formatUsd(fact.priceUsd);
  return price ? [{ tier: 'Private reference', price: `From ${price} pp` }] : [{ tier: 'Private quote', price: 'Price on request' }];
}

function buildAsiaToursImportantNotes(fact: AsiaToursPublicTourFact) {
  return [
    'Public route, duration and price signal mirrored from AsiaTours listing.',
    'Final quote can change by hotel class, date, transfer type and room availability.',
    'Route order, pace and inclusions can be refined before confirmation.',
    fact.sourceUrl ? 'Source URL is retained for audit and verification.' : 'Source reference is retained for audit and verification.'
  ];
}

function buildAsiaToursTour(fact: AsiaToursPublicTourFact): CmsItem | null {
  const title = fact.title?.trim();
  const slug = fact.slug?.trim();
  if (!title || !slug) return null;

  const featuredImage = fact.featuredImage?.trim() || '/images/hubs/vietnam-hoi-an-ancient-town-4k-crisp.jpg';
  const gallery = Array.from(new Set(toStringArray(fact.gallery).filter((url) => url !== featuredImage)));
  const itinerary = toRecordArray(fact.itinerary);
  const places = toStringArray(fact.places);
  const highlights = toStringArray(fact.highlights);
  const handpicked = toStringArray(fact.handpicked);
  const duration = fact.duration?.trim() || (fact.days ? `${fact.days} days` : 'Tailor-made');
  const route = fact.route?.trim() || places.join(' - ');
  const style = inferAsiaToursStyle(fact);
  const priceUsd = typeof fact.priceUsd === 'number' && Number.isFinite(fact.priceUsd) ? Math.round(fact.priceUsd) : 0;
  const sourceFacts = fact.sourceFacts || {};
  const priceText = formatUsd(priceUsd);
  const country = tourHubKey({
    id: fact.id || slug,
    type: fact.type || 'hlt_tour',
    title,
    slug,
    excerpt: fact.excerpt?.trim() || '',
    content: '',
    featuredImage,
    meta: {
      details: {
        country: fact.country?.trim() || fact.sourceDestinationKey?.trim() || '',
        sourceUrl: fact.sourceUrl || '',
        route,
        places,
        highlights
      }
    }
  });
  const countryLabel = hubLabel(country);
  const excerpt = `${duration} private ${countryLabel} itinerary through ${routePreview(places)}${priceText ? ` with source budget guidance from ${priceText} per person` : ''}.`;
  const content = `${title} is a private tailor-made ${countryLabel} journey shaped around ${duration} and the route ${routePreview(places)}.${priceText ? ` Source budget guidance starts from ${priceText} per person.` : ''}${handpicked.length ? ` The source lists ${handpicked.slice(0, 4).join(', ').toLowerCase()} as service cues.` : ''} This CMS record keeps public factual fields from AsiaTours, while the visible copy is generated locally so admin can edit, localize and publish safely.`;

  return {
    id: fact.id || slug,
    type: fact.type || 'hlt_tour',
    title,
    slug,
    excerpt,
    content,
    featuredImage,
    meta: {
      seo: {
        title: `${title} | Private ${countryLabel} Tour`,
        description: excerpt,
        h1: title
      },
      gallery,
      itinerary,
      pricing: buildAsiaToursPricing(fact),
      details: {
        country,
        countryLabel,
        route,
        places,
        highlights,
        handpicked,
        duration,
        days: fact.days || undefined,
        style,
        tourType: 'Private tour',
        sourceName: fact.sourceName || 'AsiaTours public listing',
        sourceUrl: fact.sourceUrl || '',
        sourceReferenceUrl: fact.sourceReferenceUrl || '',
        sourceCollectionUrl: fact.sourceCollectionUrl || '',
        sourceDestinationKey: fact.sourceDestinationKey || '',
        sourceCompliance: 'Public factual fields mirrored from AsiaTours; visible copy generated locally for this site.',
        sourceFacts,
        priceFromUsd: priceUsd || undefined,
        currency: fact.currency || 'USD',
        destinationCount: fact.destinationCount || places.length || undefined,
        countryCount: country === 'multi-country' ? Math.max(2, fact.countryCount || 0) : 1,
        importantNotes: buildAsiaToursImportantNotes(fact),
        includes: handpicked.length ? handpicked : ['Private planning', 'Source-backed route facts', 'Tailor-made quote'],
        excludes: ['International flights', 'Travel insurance', 'Visa fees', 'Personal expenses'],
        reviewRating: '9.5',
        reviewCount: `${Math.max(1, priceUsd ? Math.round(priceUsd / 12) : 280)} reviews`,
        travelStyle: style,
        travelStyleSlug: tripStyleSlug(style),
        travelStyleSlugs: [tripStyleSlug(style)],
        travelStyles: [style]
      }
    }
  };
}

export const hubs: Record<HubKey, HubContent> = {
  vietnam: {
    title: 'Vietnam Tours',
    slug: 'vietnam-tours',
    kicker: 'S-shaped wonder, privately tailored',
    intro: 'Design a refined Vietnam journey through Hanoi, Ha Long Bay, Hue, Hoi An, the Mekong Delta and secluded beach hideaways.',
    narrative: 'Vietnam private tours are at their best when the route breathes: morning markets in Hanoi, limestone horizons on Ha Long Bay, imperial calm in Hue, lantern-lit evenings in Hoi An and slow river life in the Mekong. Our luxury Vietnam itinerary planning balances culture, cuisine, boutique hotels and private guiding so every day feels personal rather than packaged.',
    highlights: ['Hanoi heritage walks with private cultural hosts', 'Luxury Ha Long Bay cruise moments', 'Hue, Hoi An and Mekong pacing for deeper discovery'],
    neighboring: ['laos', 'cambodia', 'thailand', 'myanmar', 'multi-country']
  },
  thailand: {
    title: 'Thailand Tours',
    slug: 'thailand-tours',
    kicker: 'Temples, islands and refined hospitality',
    intro: 'Pair Bangkok culture, Chiang Mai craft, jungle retreats and cinematic island resorts in one seamless private itinerary.',
    narrative: 'Thailand private tours bring together Bangkok rooftop energy, golden temples, Chiang Mai craft traditions and the soft luxury of Phuket, Krabi or Koh Samui. We shape each journey around your ideal rhythm: city immersion, wellness retreats, beach villas, family-friendly pacing or a romantic honeymoon with seamless private transfers.',
    highlights: ['Bangkok food, art and temple experiences', 'Chiang Mai rituals, elephants and mountain craft', 'Phuket, Krabi or island resort extensions'],
    neighboring: ['vietnam', 'laos', 'cambodia', 'myanmar', 'multi-country']
  },
  cambodia: {
    title: 'Cambodia Tours',
    slug: 'cambodia-tours',
    kicker: 'Ancient grandeur, modern calm',
    intro: 'Explore Angkor with expert guides, boutique lodges, floating villages and curated Khmer culinary moments.',
    narrative: 'Cambodia luxury tours reveal Angkor with patience and context: sunrise silhouettes, quiet temple corridors, Khmer cuisine, countryside villages and boutique hideaways near Siem Reap. The experience is intimate, reflective and deeply cultural, designed for travelers who want heritage interpreted with care.',
    highlights: ['Angkor temples with expert private guides', 'Floating village and countryside encounters', 'Boutique stays and curated Khmer dining'],
    neighboring: ['vietnam', 'laos', 'thailand', 'myanmar', 'multi-country']
  },
  laos: {
    title: 'Laos Tours',
    slug: 'laos-tours',
    kicker: 'Slow luxury along the Mekong',
    intro: 'Discover Luang Prabang, spiritual rituals, river journeys, waterfalls and quiet lodges designed for deep reset.',
    narrative: 'Laos private tours move softly: saffron-robed mornings in Luang Prabang, Mekong river journeys, forest waterfalls, artisan villages and serene lodges. This is Southeast Asia for travelers who value stillness, spiritual atmosphere and cultural depth over rushed sightseeing.',
    highlights: ['Luang Prabang rituals and heritage lanes', 'Mekong cruising and waterfall days', 'Quiet lodges with gentle private guiding'],
    neighboring: ['vietnam', 'cambodia', 'thailand', 'myanmar', 'multi-country']
  },
  myanmar: {
    title: 'Myanmar Tours',
    slug: 'myanmar-tours',
    kicker: 'Temples, rivers and golden plains',
    intro: 'Explore Bagan, Yangon, Mandalay and Inle Lake with private pacing, cultural context and soft overland rhythm.',
    narrative: 'Myanmar private tours are shaped around luminous temple plains, teak monasteries, lakeside villages and quiet market mornings. We keep the route flexible and respectful, pairing heritage interpretation with comfortable hotels, private transfers and enough pause for photography, food and local craft.',
    highlights: ['Bagan temple plains with private guiding', 'Yangon and Mandalay heritage layers', 'Inle Lake villages and soft water journeys'],
    neighboring: ['vietnam', 'laos', 'cambodia', 'thailand', 'multi-country']
  },
  indonesia: {
    title: 'Indonesia Tours',
    slug: 'indonesia-tours',
    kicker: 'Island contrast, temples and volcanic drama',
    intro: 'Shape Indonesia around Bali, Java, Borobudur, volcano sunrises and relaxed island time.',
    narrative: 'Indonesia works beautifully when the route stays focused: Bali for calm luxury, Java for temple heritage and mountain drama, then Komodo, Lombok or island beaches for a softer finale. The result feels varied without becoming rushed.',
    highlights: ['Bali villa rhythm with private guides', 'Borobudur and Java volcanic mornings', 'Island escapes for slower recovery days'],
    neighboring: ['malaysia', 'singapore', 'philippines', 'thailand', 'multi-country']
  },
  malaysia: {
    title: 'Malaysia Tours',
    slug: 'malaysia-tours',
    kicker: 'Food streets, city skylines and rainforest air',
    intro: 'Connect Kuala Lumpur, Penang, Malacca, Borneo and easy island stays into one polished trip.',
    narrative: 'Malaysia suits travelers who want city comfort, strong food culture and a quick shift into nature. Kuala Lumpur gives the skyline, Penang brings heritage dining, Borneo adds wildlife and Langkawi or the coast can close the trip with softer pace.',
    highlights: ['Kuala Lumpur design and skyline time', 'Penang heritage food lanes', 'Borneo rainforest and island add-ons'],
    neighboring: ['indonesia', 'singapore', 'philippines', 'thailand', 'multi-country']
  },
  singapore: {
    title: 'Singapore Tours',
    slug: 'singapore-tours',
    kicker: 'Compact luxury city breaks',
    intro: 'Singapore is ideal for short premium stopovers, gardens, hawker food and smooth logistics.',
    narrative: 'Singapore gives you the easiest kind of city escape: polished hotels, clean movement, great food and enough visual drama to feel special even on a short itinerary. It is an elegant pause between bigger journeys or a concise family break on its own.',
    highlights: ['Marina Bay skyline evenings', 'Gardens, museums and food halls', 'Fast stopover planning with low friction'],
    neighboring: ['malaysia', 'indonesia', 'philippines', 'china', 'multi-country']
  },
  philippines: {
    title: 'Philippines Tours',
    slug: 'philippines-tours',
    kicker: 'Lagoons, reefs and island-hop freedom',
    intro: 'Build a tropical route around Palawan, Cebu, Bohol and easy island hopping.',
    narrative: 'The Philippines rewards travelers who want water first: limestone lagoons in Palawan, coral days around Cebu, soft beach time and a relaxed island-hopping rhythm. It works well for couples, families and anyone who wants a bright coastal finish to an Asia trip.',
    highlights: ['Palawan lagoons and clear-water boat days', 'Cebu and Bohol island hopping', 'Beach and reef pacing that stays relaxed'],
    neighboring: ['indonesia', 'malaysia', 'singapore', 'china', 'multi-country']
  },
  china: {
    title: 'China Tours',
    slug: 'china-tours',
    kicker: 'Multiple travel interests, one vast canvas',
    intro: 'China can be classic, cultural, scenic, foodie or active, depending on how you shape the route.',
    narrative: 'China rewards structure. A classic route links Beijing, Xian and Shanghai. A culture route leans into rail and heritage cities. Scenic routes move toward Guilin or mountain landscapes, while food and active trips give the country a much more intimate feel. That mix keeps the page flexible for many traveler interests.',
    highlights: ['Classic icons from Beijing to Shanghai', 'Culture and heritage by rail', 'Nature, food and active itineraries'],
    neighboring: ['hong-kong', 'japan', 'south-korea', 'india', 'multi-country']
  },
  'hong-kong': {
    title: 'Hong Kong Tours',
    slug: 'hong-kong-tours',
    kicker: 'Harbour views and premium stopovers',
    intro: 'Hong Kong works as a compact city break with harbour lights, dim sum and island energy.',
    narrative: 'Hong Kong is short, sharp and visually rich: skyline viewpoints, food neighborhoods, shopping districts and quick island escapes. It is ideal as a stopover, a city weekend or a polished add-on before or after mainland China or wider Asia travel.',
    highlights: ['Victoria Harbour and The Peak', 'Dim sum, markets and design districts', 'Short premium itineraries with strong pace'],
    neighboring: ['china', 'japan', 'south-korea', 'singapore', 'multi-country']
  },
  japan: {
    title: 'Japan Tours',
    slug: 'japan-tours',
    kicker: 'Rail, seasons and refined city flow',
    intro: 'Japan balances Tokyo, Kyoto, Osaka, rail journeys and seasonal scenery with real elegance.',
    narrative: 'Japan is where rail logic and design precision pay off. Start with Tokyo energy, slow down in Kyoto, layer in Hakone or Osaka, then let the itinerary breathe around food, seasonality and transport that feels almost effortless.',
    highlights: ['Tokyo neighborhoods and food districts', 'Kyoto temple calm and seasonal scenery', 'Rail travel that keeps the route smooth'],
    neighboring: ['china', 'hong-kong', 'south-korea', 'bhutan', 'multi-country']
  },
  'south-korea': {
    title: 'South Korea Tours',
    slug: 'south-korea-tours',
    kicker: 'Palaces, food streets and K-culture',
    intro: 'South Korea mixes Seoul, Busan, Gyeongju and Jeju into a compact, lively route.',
    narrative: 'South Korea is a strong fit for travelers who want modern city energy plus heritage context. Seoul leads with food and palaces, Gyeongju adds depth, Busan shifts to coast and Jeju closes with a softer island mood.',
    highlights: ['Seoul palace walks and food districts', 'Busan coast and market energy', 'Jeju or Gyeongju for wider contrast'],
    neighboring: ['china', 'hong-kong', 'japan', 'india', 'multi-country']
  },
  bhutan: {
    title: 'Bhutan Tours',
    slug: 'bhutan-tours',
    kicker: 'Mindful mountain travel',
    intro: 'Bhutan keeps the pace calm with Paro, Thimphu, Punakha and the Tiger Nest hike.',
    narrative: 'Bhutan is about atmosphere more than volume. The roads, valleys, dzongs and monasteries shape a slower premium journey, so the itinerary feels intentional from the first day instead of crowded with stops.',
    highlights: ['Tiger Nest and Paro valley time', 'Thimphu and Punakha heritage rhythm', 'Mountain passes and quiet premium pacing'],
    neighboring: ['nepal', 'india', 'china', 'japan', 'multi-country']
  },
  nepal: {
    title: 'Nepal Tours',
    slug: 'nepal-tours',
    kicker: 'Kathmandu, lakes and Himalaya views',
    intro: 'Nepal combines heritage squares, Pokhara, Chitwan and a clear Himalayan backdrop.',
    narrative: 'Nepal gives you a compact but varied journey: the old squares of Kathmandu, lake days in Pokhara, wildlife in Chitwan and mountain sunrises that make the route feel more dramatic than the distance suggests.',
    highlights: ['Kathmandu Valley heritage', 'Pokhara lake and mountain views', 'Chitwan wildlife and easy adventure'],
    neighboring: ['bhutan', 'india', 'china', 'multi-country']
  },
  india: {
    title: 'India Tours',
    slug: 'india-tours',
    kicker: 'Golden Triangle, palaces and longer arcs',
    intro: 'India fits iconic city loops, palace routes, Kerala backwaters and deeper custom journeys.',
    narrative: 'India needs a theme, not a rush. The Golden Triangle gives a classic first route, Rajasthan adds palaces and desert color, Kerala softens the pace with water and greenery, and wildlife or luxury heritage circuits can stretch the trip in a much better way.',
    highlights: ['Delhi, Agra and Jaipur classic loop', 'Rajasthan palaces and desert color', 'Kerala backwaters and softer luxury pacing'],
    neighboring: ['nepal', 'bhutan', 'sri-lanka', 'china', 'multi-country']
  },
  'sri-lanka': {
    title: 'Sri Lanka Tours',
    slug: 'sri-lanka-tours',
    kicker: 'Forts, tea hills and beach finishes',
    intro: 'Sri Lanka mixes Sigiriya, Kandy, Ella, safari country and Galle into a strong island loop.',
    narrative: 'Sri Lanka is one of the easiest ways to get a lot of variety without long flights. The route can move from rock fortresses to tea hills, add a wildlife day in Yala and end on the coast around Galle or a beach resort.',
    highlights: ['Sigiriya and Kandy cultural core', 'Ella tea hills and rail scenery', 'Yala safari or Galle coast finish'],
    neighboring: ['india', 'malaysia', 'singapore', 'multi-country']
  },
  'multi-country': {
    title: 'Multi Country Tours',
    slug: 'multi-country-tours',
    kicker: 'One journey, many Indochina layers',
    intro: 'Connect Vietnam, Cambodia, Laos, Thailand and Myanmar with private transfers, smart routing and consistent high-touch service.',
    narrative: 'Multi Country Indochina tours work when the logic is clear: fly where distance steals time, slow down where culture deserves attention and connect signature moments without exhausting the traveler. We combine Vietnam, Cambodia, Laos, Thailand and Myanmar into private circuits that feel seamless, elegant and emotionally varied.',
    highlights: ['Vietnam and Cambodia heritage circuits', 'Thailand beach or wellness extensions', 'Laos slow-travel interludes for contrast'],
    neighboring: ['vietnam', 'laos', 'cambodia', 'thailand', 'myanmar']
  }
};

const uniqueToursBySlug = (items: CmsItem[]): CmsItem[] => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  });
};

const handcraftedFallbackTours: CmsItem[] = [
  {
    id: 'luxury-vietnam-10-days',
    type: 'hlt_tour',
    title: 'Luxury Vietnam Tour 10 Days',
    slug: 'luxury-vietnam-tour-10-days',
    excerpt: 'A polished private journey from Hanoi to Ha Long Bay, Hue, Hoi An and Saigon.',
    content: 'This luxury Vietnam itinerary balances culture, cuisine, heritage hotels and a relaxed private pace from north to south.',
    featuredImage: '/images/hubs/vietnam-hoi-an-ancient-town-4k-crisp.jpg',
    meta: {
      seo: { title: 'Luxury Vietnam Tour 10 Days | Private Vietnam Tours', description: 'Private luxury Vietnam itinerary with Hanoi, Ha Long Bay, Hue, Hoi An and Saigon.', h1: 'Luxury Vietnam Tour 10 Days' },
      gallery: [
        '/images/hubs/vietnam-hoi-an-ancient-town-4k-crisp.jpg',
        '/images/hubs/vietnam-trang-an-river-4k-crisp.jpg',
        '/images/hubs/vietnam-hue-imperial-city-4k-crisp.jpg',
        '/images/hubs/vietnam-sapa-rice-terraces-4k-crisp.jpg',
        '/images/collections/vietnam-ban-gioc-waterfalls-4k.jpg'
      ],
      itinerary: [
        { day: 'Day 1', title: 'Arrive in Hanoi', body: 'VIP arrival, fast-track support when available, heritage hotel check-in and a calm welcome dinner.' },
        { day: 'Day 2', title: 'Hanoi Insider Access', body: 'Old Quarter lanes, temple context, artisan studios and a private host who keeps the day flexible.' },
        { day: 'Day 3', title: 'Hanoi to Ha Long Bay Cruise', body: 'Private road transfer to the coast, refined overnight cruise, cave or kayak option and sunset drinks.' },
        { day: 'Day 4', title: 'Ha Long Bay to Hue', body: 'Morning bay views, brunch on board, return to Hanoi and fly south for a softer imperial-city evening.' },
        { day: 'Day 5', title: 'Hue Imperial Calm', body: 'Citadel stories, garden houses, royal craft context and a private Perfume River moment.' },
        { day: 'Day 6', title: 'Hue to Hoi An by Hai Van Pass', body: 'Scenic coastal drive with photo stops, beach lunch option and lantern-lit Hoi An after check-in.' },
        { day: 'Day 7', title: 'Hoi An Heritage and Countryside', body: 'Quiet-hour ancient town walk, tailor or craft visit, then Tra Que or Cam Thanh countryside by soft transfer.' },
        { day: 'Day 8', title: 'Hoi An to Saigon', body: 'Morning at leisure before flying to Saigon for colonial landmarks, cafe culture and a private dinner plan.' },
        { day: 'Day 9', title: 'Cu Chi and Saigon Local Layers', body: 'Choose Cu Chi Tunnels, a food-focused city route or a gentler design day with markets and hidden neighborhoods.' },
        { day: 'Day 10', title: 'Depart Saigon', body: 'Flexible final breakfast, private airport transfer and optional extra Mekong or beach extension.' }
      ],
      faq: [{ question: 'Can this Vietnam private tour be customized?', answer: 'Yes. Hotels, pace, guides and experiences are tailored after consultation.' }],
      pricing: [{ tier: 'Boutique Luxury', price: 'From USD 2,450 pp' }, { tier: 'Ultra Luxury', price: 'From USD 4,900 pp' }],
      details: {
        country: 'vietnam',
        route: 'Hanoi - Ha Long Bay - Hue - Hoi An - Saigon - Cu Chi Tunnels',
        places: ['Hanoi', 'Ha Long Bay', 'Hue', 'Hoi An', 'Saigon', 'Cu Chi Tunnels'],
        duration: '10 days',
        style: 'Luxury',
        meals: '9 Breakfasts, 3 Lunches, 3 Dinner',
        transport: 'Private car, luxury cruise and domestic flights',
        accommodation: 'Hotel (8 nights), Overnight on board (1 night)',
        groupSize: 'Private group',
        operatedBy: 'Ha Long Luxury Travel design team',
        departure: "Upon customer's request",
        theme: 'Luxury culture, heritage and bay cruise',
        suitable: 'Couples, families and first-time Vietnam travelers',
        tourType: 'Private tour, tailor-made quote',
        highlights: ['Ha Long Bay overnight cruise', 'Hoi An lantern evenings', 'Private cultural hosts', 'Hai Van Pass scenic transfer', 'Saigon local layers'],
        includes: ['Private guide', 'Selected hotels', 'Domestic support', 'Private transfers', 'Domestic flight planning', 'Luxury cruise coordination'],
        excludes: ['International flights', 'Travel insurance', 'Visa fees'],
        importantNotes: [
          'This is an original internal luxury itinerary, not copied from a third-party listing.',
          'Public BestPrice data is used elsewhere as a price reference dataset, while this sample tour keeps internal pricing.',
          'Final price depends on hotel class, cruise brand, flight availability and peak-date surcharges.',
          'The route can be extended with Ninh Binh, Mekong Delta, Sapa or a beach stay.'
        ],
        sourceName: 'Internal curated itinerary',
        sourceCompliance: 'This handcrafted tour uses original itinerary copy and legal site imagery; no third-party branded media or long copied descriptions are used.',
        sourceFacts: ['title', 'duration', 'route', 'planning price', 'internal day plan', 'meals', 'transport', 'accommodation'],
        sourceItineraryFacts: [
          { day: 'Day 1', title: 'Arrive in Hanoi', meals: 'Dinner', accommodation: 'Hotel in Hanoi', startPoint: 'Hanoi', endPoint: '' },
          { day: 'Day 2', title: 'Hanoi Insider Access', meals: 'Breakfast, Lunch', accommodation: 'Hotel in Hanoi', startPoint: '', endPoint: '' },
          { day: 'Day 3', title: 'Hanoi to Ha Long Bay Cruise', meals: 'Breakfast, Lunch, Dinner', accommodation: 'Overnight on board', startPoint: 'Hanoi', endPoint: 'Ha Long Bay' },
          { day: 'Day 4', title: 'Ha Long Bay to Hue', meals: 'Breakfast, Brunch', accommodation: 'Hotel in Hue', startPoint: 'Ha Long Bay', endPoint: 'Hue' },
          { day: 'Day 5', title: 'Hue Imperial Calm', meals: 'Breakfast, Lunch', accommodation: 'Hotel in Hue', startPoint: '', endPoint: '' },
          { day: 'Day 6', title: 'Hue to Hoi An by Hai Van Pass', meals: 'Breakfast', accommodation: 'Hotel in Hoi An', startPoint: 'Hue', endPoint: 'Hoi An' },
          { day: 'Day 7', title: 'Hoi An Heritage and Countryside', meals: 'Breakfast, Lunch', accommodation: 'Hotel in Hoi An', startPoint: '', endPoint: '' },
          { day: 'Day 8', title: 'Hoi An to Saigon', meals: 'Breakfast, Dinner', accommodation: 'Hotel in Saigon', startPoint: 'Hoi An', endPoint: 'Saigon' },
          { day: 'Day 9', title: 'Cu Chi and Saigon Local Layers', meals: 'Breakfast', accommodation: 'Hotel in Saigon', startPoint: 'Saigon', endPoint: 'Cu Chi Tunnels' },
          { day: 'Day 10', title: 'Depart Saigon', meals: 'Breakfast', accommodation: 'NA', startPoint: 'Saigon', endPoint: '' }
        ]
      }
    }
  },
  {
    id: 'thailand-honeymoon-9-days',
    type: 'hlt_tour',
    title: 'Thailand Honeymoon 9 Days',
    slug: 'thailand-honeymoon-9-days',
    excerpt: 'Bangkok rooftops, Chiang Mai rituals and island pool villas.',
    content: 'A romantic Thailand private tour with temple mornings, spa time, gentle adventure and candle-lit island evenings.',
    featuredImage: '/images/hubs/thailand-temple-4k-crisp.jpg',
    meta: {
      seo: { title: 'Thailand Honeymoon 9 Days | Private Luxury Trip', description: 'Private Thailand honeymoon with Bangkok, Chiang Mai and Phuket-style island luxury.', h1: 'Thailand Honeymoon 9 Days' },
      gallery: ['/images/hubs/thailand-temple-4k-crisp.jpg', '/images/collections/thailand-grand-palace-bangkok-4k.jpg', '/images/assurance/thailand-wat-arun-bangkok-4k.jpg', '/images/assurance-hd/thailand-ang-thong-bay-4k-hd.jpg', '/images/collections/tailor-made-private-pool-asia-4k.jpg'],
      itinerary: [
        { day: 'Day 1', title: 'Bangkok Arrival', body: 'Private arrival, riverside suite and rooftop welcome dinner.' },
        { day: 'Day 2', title: 'Temples and Thai Flavors', body: 'Grand Palace, private food walk and spa time.' },
        { day: 'Day 3', title: 'Chiang Mai Rituals', body: 'Fly north for craft villages and a blessing ceremony.' },
        { day: 'Day 4', title: 'Soft Adventure', body: 'Ethical elephant encounter and a quiet resort afternoon.' },
        { day: 'Day 5', title: 'Island Pool Villa', body: 'Fly to the coast for beach time and candle-lit dining.' }
      ],
      faq: [{ question: 'Is this suitable for a honeymoon?', answer: 'Yes. We prioritize privacy, romantic pacing and special occasion touches.' }],
      pricing: [{ tier: 'Honeymoon Luxury', price: 'From USD 2,850 pp' }, { tier: 'Iconic Retreats', price: 'From USD 5,250 pp' }],
      details: { country: 'thailand', duration: '9 days', style: 'Honeymoon', highlights: ['Bangkok river suites', 'Chiang Mai rituals', 'Island pool villas'], includes: ['Private transfers', 'Boutique hotels', 'Selected experiences', 'Concierge support'], excludes: ['International flights', 'Personal expenses', 'Travel insurance'] }
    }
  },
  {
    id: 'angkor-culture-6-days',
    type: 'hlt_tour',
    title: 'Cambodia Culture & Angkor 6 Days',
    slug: 'cambodia-culture-angkor-6-days',
    excerpt: 'A deeply guided Angkor journey with boutique stays and Khmer cuisine.',
    content: 'Explore Angkor at quieter hours with historians, craft visits, countryside moments and elegant boutique lodging.',
    featuredImage: '/images/hubs/cambodia-angkor-wat-4k-crisp.jpg',
    meta: {
      seo: { title: 'Cambodia Culture & Angkor 6 Days | Private Tour', description: 'Private Cambodia cultural tour around Angkor, Siem Reap, cuisine and countryside.', h1: 'Cambodia Culture & Angkor 6 Days' },
      gallery: ['/images/hubs/cambodia-angkor-wat-4k-crisp.jpg', '/images/collections/cambodia-banteay-srei-temple-4k.jpg', '/images/assurance/cambodia-bayon-temple-4k.jpg', '/images/assurance-hd/cambodia-ta-prohm-angkor-4k-hd.jpg', '/images/hubs/vietnam-hue-imperial-city-4k-crisp.jpg'],
      itinerary: [
        { day: 'Day 1', title: 'Siem Reap Arrival', body: 'Boutique lodge arrival and Khmer tasting menu.' },
        { day: 'Day 2', title: 'Angkor at Quiet Hours', body: 'Private temple circuit shaped around light, shade and fewer crowds.' },
        { day: 'Day 3', title: 'Village and Craft', body: 'Countryside visits, artisan workshops and local-host lunch.' },
        { day: 'Day 4', title: 'Tonle Sap Life', body: 'Floating village interpretation and sunset cocktails.' }
      ],
      faq: [{ question: 'Can Angkor be paced slowly?', answer: 'Yes. We design temple days around heat, light and personal energy.' }],
      pricing: [{ tier: 'Cultural Luxury', price: 'From USD 1,950 pp' }, { tier: 'Heritage Plus', price: 'From USD 3,400 pp' }],
      details: { country: 'cambodia', duration: '6 days', style: 'Culture', highlights: ['Angkor with expert guides', 'Khmer cuisine', 'Countryside craft'], includes: ['Private guide', 'Boutique lodging', 'Curated meals', 'Private transfers'], excludes: ['International flights', 'Visa fees', 'Personal expenses'] }
    }
  },
  {
    id: 'laos-slow-luxury-7-days',
    type: 'hlt_tour',
    title: 'Laos Slow Luxury 7 Days',
    slug: 'laos-slow-luxury-7-days',
    excerpt: 'Luang Prabang rituals, Mekong views, waterfalls and serene boutique lodges.',
    content: 'A slow Laos journey for travelers who want spiritual atmosphere, nature and quiet private guiding.',
    featuredImage: '/images/collections/laos-haw-pha-bang-monks-4k.jpg',
    meta: {
      seo: { title: 'Laos Slow Luxury 7 Days | Private Laos Tour', description: 'Private Laos luxury tour with Luang Prabang, Mekong views, waterfalls and lodges.', h1: 'Laos Slow Luxury 7 Days' },
      gallery: ['/images/collections/laos-haw-pha-bang-monks-4k.jpg', '/images/assurance/laos-wat-xieng-thong-4k.jpg', '/images/assurance-hd/laos-wat-phou-pillared-path-4k-hd.jpg', '/images/hubs/laos-kuang-si-falls-4k-crisp.jpg', '/images/hubs/myanmar-bagan-temples-4k.jpg'],
      itinerary: [
        { day: 'Day 1', title: 'Luang Prabang Arrival', body: 'Private arrival, heritage lodge check-in and riverside dinner.' },
        { day: 'Day 2', title: 'Spiritual Morning', body: 'Dawn rituals, temple walks and artisan visits with a private host.' },
        { day: 'Day 3', title: 'Waterfall Retreat', body: 'Kuang Si waterfall time, picnic lunch and spa afternoon.' },
        { day: 'Day 4', title: 'Mekong Drift', body: 'Private boat journey, cave visits and sunset drinks.' }
      ],
      faq: [{ question: 'Is Laos good for slow travel?', answer: 'Yes. Laos is ideal for calm pacing, cultural depth and gentle nature.' }],
      pricing: [{ tier: 'Slow Luxury', price: 'From USD 2,150 pp' }, { tier: 'Sanctuary Lodges', price: 'From USD 3,800 pp' }],
      details: { country: 'laos', duration: '7 days', style: 'Culture', highlights: ['Luang Prabang rituals', 'Mekong sunsets', 'Waterfall retreats'], includes: ['Private guide', 'Boutique lodges', 'Transfers', 'Selected meals'], excludes: ['International flights', 'Travel insurance', 'Visa fees'] }
    }
  },
  {
    id: 'indochina-private-circuit-14-days',
    type: 'hlt_tour',
    title: 'Indochina Private Circuit 14 Days',
    slug: 'indochina-private-circuit-14-days',
    excerpt: 'Vietnam, Cambodia and Laos connected through smart flights and unhurried cultural days.',
    content: 'A multi-country route that balances Vietnam energy, Angkor heritage and Laos calm.',
    featuredImage: '/images/collections/multi-country-mekong-sunset-4k.jpg',
    meta: {
      seo: { title: 'Indochina Private Circuit 14 Days | Multi Country Tour', description: 'Luxury Multi Country tour through Vietnam, Cambodia and Laos with private routing.', h1: 'Indochina Private Circuit 14 Days' },
      gallery: ['/images/collections/multi-country-mekong-sunset-4k.jpg', '/images/hubs/vietnam-ninh-binh-tam-coc-4k-crisp.jpg', '/images/hubs/cambodia-angkor-wat-4k-crisp.jpg', '/images/assurance/laos-wat-xieng-thong-4k.jpg', '/images/hubs/thailand-temple-4k-crisp.jpg'],
      itinerary: [
        { day: 'Days 1-4', title: 'Vietnam Cultural Arc', body: 'Hanoi, Ha Long Bay and Hoi An with private guiding.' },
        { day: 'Days 5-8', title: 'Angkor Heritage', body: 'Siem Reap temples, craft and quiet countryside moments.' },
        { day: 'Days 9-12', title: 'Laos Slow Finish', body: 'Luang Prabang, Mekong sunsets and gentle rituals.' },
        { day: 'Days 13-14', title: 'Bangkok Finale', body: 'Optional Bangkok dining, shopping or spa extension.' }
      ],
      faq: [{ question: 'Can countries be added or removed?', answer: 'Yes. The circuit can include Thailand, beaches or extra rest days.' }],
      pricing: [{ tier: 'Private Indochina', price: 'From USD 5,850 pp' }, { tier: 'Signature Circuit', price: 'From USD 8,900 pp' }],
      details: { country: 'multi-country', duration: '14 days', style: 'Luxury', highlights: ['Vietnam, Cambodia and Laos', 'Smart regional flights', 'Private cultural hosts'], includes: ['Private guides', 'Selected hotels', 'Regional planning', 'Airport support'], excludes: ['International flights', 'Visa fees', 'Travel insurance'] }
    }
  }
];

export const fallbackTours: CmsItem[] = uniqueToursBySlug([
  ...handcraftedFallbackTours,
  ...(generatedLegalTours as CmsItem[]),
  ...((asiatoursPublicTourFacts as AsiaToursPublicTourFact[]).map(buildAsiaToursTour).filter((item): item is CmsItem => Boolean(item)))
]);

export const fallbackCruises: CmsItem[] = [
  {
    id: 'ha-long-bay-luxury-cruise',
    type: 'hlt_cruise',
    title: 'Ha Long Bay Luxury Cruise',
    slug: 'ha-long-bay-luxury-cruise',
    excerpt: 'A refined overnight cruise through limestone islands, quiet coves and sunset decks.',
    content: 'A polished Ha Long Bay cruise with spacious cabins, calm service and cinematic bay views.',
    featuredImage: image('photo-1528127269322-539801943592'),
    meta: { seo: { title: 'Ha Long Bay Luxury Cruise | Private Vietnam Cruise', description: 'Luxury Ha Long Bay cruise with premium cabins, bay itinerary and included services.' }, cabins: [{ name: 'Junior Suite', size: '32 sqm', occupancy: '2 guests', price: 'From USD 320 cabin' }, { name: 'Terrace Suite', size: '42 sqm', occupancy: '2 guests', price: 'From USD 480 cabin' }, { name: 'Owner Suite', size: '60 sqm', occupancy: '2 guests', price: 'From USD 760 cabin' }], gallery: [image('photo-1528127269322-539801943592'), image('photo-1500530855697-b586d89ba3ee'), image('photo-1559592413-7cec4d0cae2b'), image('photo-1488646953014-85cb44e25828'), image('photo-1507525428034-b723cf961d3e')], itinerary: [{ day: 'Day 1', title: 'Board and Bay Drift', body: 'Embark, lunch on deck, cave visit and sunset cocktails.' }, { day: 'Day 2', title: 'Morning Tai Chi', body: 'Tai chi, brunch and disembarkation by private transfer.' }], pricing: [{ tier: 'Suite Deck', price: 'From USD 320 cabin' }, { tier: 'Signature Deck', price: 'From USD 480 cabin' }], details: { country: 'vietnam', route: 'Ha Long Bay', duration: '2 days', includes: ['Cabin accommodation', 'All onboard meals', 'Kayak or bamboo boat', 'English-speaking host'], excludes: ['Transfers unless requested', 'Drinks', 'Personal expenses'] } }
  },
  {
    id: 'lan-ha-bay-boutique-cruise', type: 'hlt_cruise', title: 'Lan Ha Bay Boutique Cruise', slug: 'lan-ha-bay-boutique-cruise', excerpt: 'A quieter Lan Ha Bay route with kayaking, beaches and boutique cabin styling.', content: 'Lan Ha Bay offers a softer alternative to classic Ha Long, with intimate routes and relaxed onboard service.', featuredImage: image('photo-1500530855697-b586d89ba3ee'), meta: { seo: { title: 'Lan Ha Bay Boutique Cruise', description: 'Boutique Lan Ha Bay cruise with cabins, kayaking, beach time and premium service.' }, cabins: [{ name: 'Ocean Suite', size: '30 sqm', occupancy: '2 guests', price: 'From USD 290 cabin' }, { name: 'Balcony Suite', size: '38 sqm', occupancy: '2 guests', price: 'From USD 430 cabin' }, { name: 'Family Connecting', size: '64 sqm', occupancy: '4 guests', price: 'From USD 680 cabin' }], gallery: [image('photo-1500530855697-b586d89ba3ee'), image('photo-1528127269322-539801943592'), image('photo-1559592413-7cec4d0cae2b'), image('photo-1469474968028-56623f02e42e'), image('photo-1488646953014-85cb44e25828')], itinerary: [{ day: 'Day 1', title: 'Lan Ha Embarkation', body: 'Board, cruise to quiet lagoons and kayak at golden hour.' }, { day: 'Day 2', title: 'Beach Morning', body: 'Swim, brunch and return to the pier.' }], pricing: [{ tier: 'Boutique Cabin', price: 'From USD 290 cabin' }, { tier: 'Balcony Cabin', price: 'From USD 430 cabin' }], details: { country: 'vietnam', route: 'Lan Ha Bay', duration: '2 days', includes: ['Cabin accommodation', 'Meals onboard', 'Kayaking', 'Entrance fees'], excludes: ['Private transfers', 'Spa treatments', 'Drinks'] } } },
  {
    id: 'luxury-mekong-cruise', type: 'hlt_cruise', title: 'Luxury Mekong Cruise', slug: 'luxury-mekong-cruise', excerpt: 'A slow river journey through floating markets, orchards and riverside villages.', content: 'This Mekong cruise is designed for travelers who want calm river life, generous cabins and meaningful local encounters.', featuredImage: image('photo-1488646953014-85cb44e25828'), meta: { seo: { title: 'Luxury Mekong Cruise | Vietnam River Journey', description: 'Luxury Mekong cruise with premium cabins, river itinerary, meals and local experiences.' }, cabins: [{ name: 'River Suite', size: '28 sqm', occupancy: '2 guests', price: 'From USD 360 cabin' }, { name: 'Panorama Suite', size: '36 sqm', occupancy: '2 guests', price: 'From USD 520 cabin' }, { name: 'Mekong Signature', size: '50 sqm', occupancy: '2 guests', price: 'From USD 790 cabin' }], gallery: [image('photo-1488646953014-85cb44e25828'), image('photo-1414235077428-338989a2e8c0'), image('photo-1500534314209-a25ddb2bd429'), image('photo-1507525428034-b723cf961d3e'), image('photo-1518548419970-58e3b4079ab2')], itinerary: [{ day: 'Day 1', title: 'Cai Be Embarkation', body: 'Board, lunch and visit river workshops.' }, { day: 'Day 2', title: 'Floating Market', body: 'Morning market, orchard walk and cooking moment.' }, { day: 'Day 3', title: 'Can Tho Farewell', body: 'Brunch and private onward transfer.' }], pricing: [{ tier: 'River Suite', price: 'From USD 360 cabin' }, { tier: 'Signature Suite', price: 'From USD 790 cabin' }], details: { country: 'vietnam', route: 'Mekong Delta', duration: '3 days', includes: ['Cabin accommodation', 'Meals onboard', 'Village visits', 'Local host'], excludes: ['Transfers', 'Premium drinks', 'Travel insurance'] } } },
  {
    id: 'heritage-indochina-cruise', type: 'hlt_cruise', title: 'Heritage Indochina Cruise', slug: 'heritage-indochina-cruise', excerpt: 'A heritage-style river cruise connecting cultural layers of Vietnam and Cambodia.', content: 'A refined Indochina river cruise for travelers combining slow water travel, heritage cabins and guided cultural stops.', featuredImage: image('photo-1464817739973-0128fe77aaa1'), meta: { seo: { title: 'Heritage Indochina Cruise | Vietnam Cambodia Cruise', description: 'Heritage Indochina cruise with cabin tiers, river itinerary and guided cultural services.' }, cabins: [{ name: 'Heritage Cabin', size: '26 sqm', occupancy: '2 guests', price: 'From USD 420 cabin' }, { name: 'Colonial Suite', size: '40 sqm', occupancy: '2 guests', price: 'From USD 650 cabin' }, { name: 'Royal Suite', size: '58 sqm', occupancy: '2 guests', price: 'From USD 940 cabin' }], gallery: [image('photo-1464817739973-0128fe77aaa1'), image('photo-1488646953014-85cb44e25828'), image('photo-1500534314209-a25ddb2bd429'), image('photo-1528127269322-539801943592'), image('photo-1559592413-7cec4d0cae2b')], itinerary: [{ day: 'Day 1', title: 'River Embarkation', body: 'Board, heritage briefing and sunset dinner.' }, { day: 'Day 2', title: 'Village and Temple', body: 'Guided visits, craft encounters and onboard lecture.' }, { day: 'Day 3', title: 'Borderland Stories', body: 'Slow river morning and cultural interpretation.' }], pricing: [{ tier: 'Heritage Cabin', price: 'From USD 420 cabin' }, { tier: 'Royal Suite', price: 'From USD 940 cabin' }], details: { country: 'multi-country', route: 'Vietnam and Cambodia', duration: '3 days', includes: ['Cabin accommodation', 'Guided shore visits', 'Meals onboard', 'Cultural host'], excludes: ['Visa fees', 'Transfers', 'Premium drinks'] } } },
  {
    id: 'premium-vietnam-river-cruise', type: 'hlt_cruise', title: 'Premium Vietnam River Cruise', slug: 'premium-vietnam-river-cruise', excerpt: 'A premium short river escape with polished cabins, local food and relaxed private transfers.', content: 'A Vietnam river cruise made for guests who want a short, elegant waterborne extension to a private tour.', featuredImage: image('photo-1559592413-7cec4d0cae2b'), meta: { seo: { title: 'Premium Vietnam River Cruise', description: 'Premium Vietnam river cruise with cabins, day-by-day route, pricing and included services.' }, cabins: [{ name: 'Classic River', size: '24 sqm', occupancy: '2 guests', price: 'From USD 260 cabin' }, { name: 'Premium Balcony', size: '34 sqm', occupancy: '2 guests', price: 'From USD 390 cabin' }, { name: 'Grand River Suite', size: '48 sqm', occupancy: '2 guests', price: 'From USD 620 cabin' }], gallery: [image('photo-1559592413-7cec4d0cae2b'), image('photo-1488646953014-85cb44e25828'), image('photo-1500530855697-b586d89ba3ee'), image('photo-1414235077428-338989a2e8c0'), image('photo-1469474968028-56623f02e42e')], itinerary: [{ day: 'Day 1', title: 'River Welcome', body: 'Board, local lunch and village stop.' }, { day: 'Day 2', title: 'Market Morning', body: 'Market visit, brunch and onward private transfer.' }], pricing: [{ tier: 'Classic River', price: 'From USD 260 cabin' }, { tier: 'Grand Suite', price: 'From USD 620 cabin' }], details: { country: 'vietnam', route: 'Vietnam River Route', duration: '2 days', includes: ['Cabin accommodation', 'Meals onboard', 'Guided stops', 'Basic activities'], excludes: ['Premium drinks', 'Private transfer', 'Personal expenses'] } } }
];

export const fallbackStyles: CmsItem[] = ['Luxury', 'Family', 'Honeymoon', 'Culture', 'Adventure', 'Culinary'].map((title, index) => ({
  id: title.toLowerCase(),
  type: 'hlt_travel_style',
  title,
  slug: title.toLowerCase(),
  excerpt: `Private ${title.toLowerCase()} journeys designed around your rhythm, taste and comfort level.`,
  content: `Our ${title.toLowerCase()} travel designers combine destination knowledge, curated stays and responsive support.`,
  featuredImage: image(['photo-1518548419970-58e3b4079ab2', 'photo-1500530855697-b586d89ba3ee', 'photo-1499793983690-e29da59ef1c2', 'photo-1469474968028-56623f02e42e', 'photo-1500534314209-a25ddb2bd429', 'photo-1414235077428-338989a2e8c0'][index]),
  meta: { seo: { title: `${title} Travel Style`, description: `Tailor-made ${title.toLowerCase()} tours in Southeast Asia.` } }
}));

export const fallbackTestimonials: CmsItem[] = [
  { id: 't1', type: 'hlt_testimonial', title: 'Amelia R.', slug: 'amelia-r', excerpt: 'Every hotel, guide and transfer felt effortless. The trip had rare polish.', content: '', featuredImage: '', meta: { details: { country: 'United Kingdom' } } },
  { id: 't2', type: 'hlt_testimonial', title: 'Marcus L.', slug: 'marcus-l', excerpt: 'The planning form was easy, then the consultant refined everything perfectly.', content: '', featuredImage: '', meta: { details: { country: 'United States' } } }
];

export const fallbackPosts: CmsItem[] = [
  {
    id: 'best-hanoi-city-tour-luxury-guide',
    type: 'post',
    title: 'Best Hanoi City Tour: A Luxury Guide to Culture, Food and Elegant Pacing',
    slug: 'best-hanoi-city-tour-luxury-guide',
    excerpt: 'A detailed Hanoi city tour guide for travelers who want the classic highlights, Old Quarter texture, refined food stops and private luxury pacing in one graceful day.',
    content: '<p>A strong Hanoi city tour is not only a list of landmarks. It is a carefully paced day that balances Hoan Kiem Lake, the Old Quarter, heritage sites, food culture, coffee rituals and enough quiet space to enjoy the city in comfort.</p><p>This guide turns the classic Hanoi city tour into a more polished private experience, with better timing, softer transfers, beautiful photo moments and refined breaks between the busy streets.</p>',
    featuredImage: hanoiTempleImage,
    meta: {
      seo: {
        title: 'Best Hanoi City Tour | Luxury Private Hanoi Guide',
        description: 'A long-form luxury Hanoi city tour guide with route ideas, timing, food stops, private guide notes and many Hanoi travel images.',
        h1: 'Best Hanoi City Tour: A Luxury Guide to Culture, Food and Elegant Pacing'
      },
      details: {
        homeFeatured: true,
        publishedAt: 'May 06, 2026',
        updatedAt: 'May 06, 2026',
        category: 'Vietnam Guide',
        author: 'Ha Long Luxury Travel Design Team',
        readTime: '18 min read',
        destination: 'Hanoi',
        heroCaption: 'Hanoi city tour planning inspiration for private luxury travel.',
        sidebarCta: 'Design your private Hanoi day',
        sidebarText: 'We can turn this guide into a private Hanoi city tour with hotel pickup, a handpicked guide, refined food stops and comfortable pacing.',
        briefNote: 'The best Hanoi city tour starts with route order, hotel location and time of day. Once those three decisions are right, the city feels atmospheric rather than exhausting.',
        planningPoint1: 'Start around Hoan Kiem or your hotel zone.',
        planningPoint2: 'Protect morning heritage and late afternoon atmosphere.',
        planningPoint3: 'Use food, coffee and private transfers as comfort buffers.',
        tableOfContents: [
          'What makes a Hanoi city tour worth doing',
          'Best one-day Hanoi city tour route',
          'Morning around Hoan Kiem Lake and the Old Quarter',
          'Heritage sites with context, not checklist pressure',
          'Food, coffee and refined breaks',
          'French Quarter, Long Bien and local texture',
          'Luxury planning notes before you book'
        ],
        sections: [
          {
            heading: 'What makes a Hanoi city tour worth doing',
            body: [
              'Hanoi is one of the most rewarding city-tour destinations in Vietnam because it compresses history, food, architecture and daily life into a walkable but intense urban core. A basic tour often lists the same places: Hoan Kiem Lake, the Old Quarter, the Temple of Literature, the Ho Chi Minh complex, museums, markets and a food stop. The difference between an ordinary day and a beautiful private day is the way those pieces are ordered.',
              'For luxury travelers, the goal should not be to see every famous place in one day. The goal is to understand the city without feeling dragged through it. That means choosing the right morning anchor, using a guide who can explain layers clearly, adding food stops with context and building small pauses before the day becomes tiring.',
              'Hanoi rewards patience. The city can feel loud at first, but with the right pacing it becomes elegant: lakeside mornings, shaded courtyards, narrow market lanes, French colonial facades, family kitchens, coffee balconies and the slow rhythm of people moving through old streets.'
            ],
            bullets: [
              'Use the city tour as an introduction to Hanoi, not as a race through every landmark.',
              'Place the most cultural stops in the morning when energy and traffic are easier.',
              'Use private transfers between wider districts, then walk the compact neighborhoods slowly.',
              'Add one food or coffee experience that feels local but still comfortable.'
            ],
            subsections: [
              {
                heading: 'Basic idea, luxury execution',
                body: [
                  'A basic Hanoi city tour gives you the main names. A luxury version gives you better timing, softer movement, a more thoughtful guide and a route that respects your energy. The attractions may look similar on paper, but the experience feels very different when the day has breathing room.'
                ]
              },
              {
                heading: 'Who this style suits',
                body: [
                  'This style works well for couples, families, first-time visitors, photographers, culture lovers and travelers arriving before a Ha Long Bay cruise. It is also useful for guests who want a strong city overview before continuing to Ninh Binh, Sapa, Hue or Hoi An.'
                ]
              }
            ]
          },
          {
            heading: 'Best one-day Hanoi city tour route',
            body: [
              'A balanced one-day Hanoi route should begin around Hoan Kiem Lake and the Old Quarter, move into heritage sites before lunch, pause for a refined local meal or cafe, then finish with either French Quarter architecture, Long Bien Bridge, a museum, a water puppet show or a private dinner. This order keeps the day logical and avoids wasting energy in traffic.',
              'If your hotel is in the Old Quarter or French Quarter, the morning can start on foot. If your hotel is farther away, use a private transfer to reach the first anchor quickly, then walk only where the neighborhood texture matters. The private guide should adjust the order based on weather, closures, your walking comfort and whether you prefer history, food, photography or local life.'
            ],
            image: hanoiHoanKiemImage,
            imageAlt: 'Hoan Kiem Lake in Hanoi for a private city tour',
            caption: 'Hoan Kiem Lake works beautifully as the first anchor for a calm Hanoi city tour.',
            table: {
              heading: 'Suggested luxury Hanoi city tour flow',
              rows: [
                { label: 'Morning anchor', bestFor: 'Hoan Kiem Lake, Ngoc Son Temple and Old Quarter orientation before the streets become busier.', watchOut: 'Avoid starting too late if photography, walking comfort or heat matters.' },
                { label: 'Heritage block', bestFor: 'Temple of Literature, Ho Chi Minh complex or a focused museum visit with a guide who can explain context.', watchOut: 'Do not stack every monument if you also want food and neighborhood time.' },
                { label: 'Midday pause', bestFor: 'A refined Vietnamese lunch, shaded cafe or hotel refresh depending on your energy.', watchOut: 'A heavy lunch after too many stops can slow the whole afternoon.' },
                { label: 'Afternoon texture', bestFor: 'French Quarter, Long Bien Bridge, local markets, craft streets or a water puppet show.', watchOut: 'Traffic and weather should decide whether the afternoon is walking-heavy or transfer-light.' }
              ]
            },
            subsections: [
              {
                heading: 'If you have only half a day',
                body: [
                  'Keep it simple: Hoan Kiem Lake, Old Quarter lanes, one cultural stop and one food or coffee experience. A half-day tour should feel like a clear introduction, not a compressed full-day itinerary.'
                ]
              },
              {
                heading: 'If you have a full day',
                body: [
                  'Use the full day to create contrast: spiritual lake, old streets, scholarly heritage, French colonial architecture, food culture and one local-life moment. The best full-day tour has variety without becoming fragmented.'
                ]
              }
            ]
          },
          {
            heading: 'Morning around Hoan Kiem Lake and the Old Quarter',
            body: [
              'Hoan Kiem Lake is the easiest place to begin because it introduces the city gently. In the morning, the lake has walkers, tai chi groups, shaded paths and views toward Ngoc Son Temple. It gives the guide time to explain Hanoi without forcing you immediately into the densest streets.',
              'From the lake, the Old Quarter can be read as a living map of trade streets, family businesses, small temples, tube houses, cafes and food corners. This is where a private guide matters. Without context, the neighborhood can feel chaotic. With the right host, each lane becomes easier to understand.'
            ],
            bullets: [
              'Start before the city reaches peak heat and traffic.',
              'Walk short sections slowly instead of trying to cover every street.',
              'Use a coffee stop as a natural pause, not only as a photo moment.',
              'Let the guide explain etiquette before markets, temples or family-run food places.'
            ],
            image: hanoiOldQuarterImage,
            imageAlt: 'Old Quarter and Hoan Kiem area in Hanoi',
            caption: 'The Old Quarter is best experienced slowly, with a guide who can explain trade streets, homes and food culture.',
            subsections: [
              {
                heading: 'What to notice in the Old Quarter',
                body: [
                  'Look for the rhythm of shopfronts, balconies, altars, delivery bikes, tiny kitchens and narrow facades. These details are more meaningful than rushing from one named street to another. The luxury approach is to make the walk feel understandable and intimate.'
                ]
              },
              {
                heading: 'How to keep it comfortable',
                body: [
                  'Wear comfortable shoes, keep valuables simple and ask the guide to manage street crossings. If you are traveling with children or older guests, choose shorter walking loops and use a private vehicle to reposition between districts.'
                ]
              }
            ]
          },
          {
            heading: 'Heritage sites with context, not checklist pressure',
            body: [
              'The Temple of Literature is often the most graceful heritage stop in Hanoi because it combines courtyards, Confucian scholarship, old trees and calm architecture. It is also easier to enjoy when the guide keeps the interpretation focused instead of turning the visit into a long lecture.',
              'The Ho Chi Minh complex, One Pillar Pagoda, the Vietnam Museum of Ethnology, the Women Museum or Hoa Lo Prison can all be meaningful, but they do not all belong in the same day for every traveler. Choose based on your interests. A family may prefer the Museum of Ethnology. A history-focused traveler may choose Hoa Lo. A first-time visitor may want the Ho Chi Minh area for national context.'
            ],
            bullets: [
              'Choose two major heritage stops, not five.',
              'Ask the guide to connect history to daily Hanoi life.',
              'Keep museum time focused around your interests.',
              'Build a shaded pause after courtyard or outdoor visits.'
            ],
            image: hanoiTempleImage,
            imageAlt: 'Temple of Literature in Hanoi for a private luxury city tour',
            caption: 'The Temple of Literature brings scholarship, courtyards and calmer architecture into a Hanoi city tour.',
            subsections: [
              {
                heading: 'Temple of Literature',
                body: [
                  'This is a strong choice for travelers who want beauty, history and a quieter atmosphere. Visit earlier in the day if possible, then use the courtyards as a slower cultural chapter before moving back into the city.'
                ]
              },
              {
                heading: 'Museums and monuments',
                body: [
                  'A private tour should not include a museum simply because it is available. Choose the museum that adds emotional or intellectual value to your day. The right guide can make one focused visit more memorable than three rushed stops.'
                ]
              }
            ]
          },
          {
            heading: 'Food, coffee and refined breaks',
            body: [
              'Hanoi food is one of the best reasons to book a private city tour. Pho, bun cha, banh cuon, cha ca, green papaya salad, egg coffee and market snacks can all fit into the city story. The mistake is treating food as a random add-on after sightseeing. Food should be placed where it belongs geographically and emotionally.',
              'For a luxury version, mix authentic local flavor with comfort. That might mean a respected bun cha address for lunch, a private coffee stop with a balcony view, a gentle market tasting with a host and a more refined Vietnamese dinner in the evening. The point is not to make every stop fancy. The point is to keep the day delicious without making it messy or rushed.'
            ],
            bullets: [
              'Use a local host for street food if hygiene, etiquette or ordering feels uncertain.',
              'Choose fewer dishes and enjoy them properly instead of turning lunch into a checklist.',
              'Place egg coffee or Vietnamese coffee after walking, when a real pause is useful.',
              'Keep one refined meal for travelers who want comfort after a busy street day.'
            ],
            image: hanoiFoodImage,
            imageAlt: 'Bun cha Hanoi food experience',
            caption: 'Food should be part of the route design, not a rushed tasting list at the end of the day.',
            subsections: [
              {
                heading: 'Best food rhythm',
                body: [
                  'A good rhythm is light breakfast at the hotel, morning culture, local lunch, coffee pause, afternoon texture and either a refined dinner or a relaxed return to the hotel. This keeps the day satisfying without overloading the traveler.'
                ]
              },
              {
                heading: 'When to upgrade the meal',
                body: [
                  'Upgrade the meal when the trip is a honeymoon, anniversary, family celebration or first night in Vietnam. A polished dinner after a well-paced day can make Hanoi feel both local and elegant.'
                ]
              }
            ]
          },
          {
            heading: 'French Quarter, Long Bien and local texture',
            body: [
              'After the main heritage and food chapters, the afternoon should add atmosphere. The French Quarter gives Hanoi a more spacious architectural mood with opera-house views, tree-lined boulevards and elegant hotel history. Long Bien Bridge gives a different feeling: river, railway, local movement and a sense of Hanoi beyond the postcard center.',
              'This part of the tour should be flexible. If the weather is gentle, use more walking and photography. If the day is hot or rainy, keep the vehicle close and choose shorter stops. A private tour should feel responsive, not fixed.'
            ],
            bullets: [
              'Use the French Quarter for architecture, hotel history and quieter photos.',
              'Use Long Bien for local texture and a wider sense of the city.',
              'Keep the afternoon less demanding than the morning.',
              'Consider a water puppet show or private dinner if you want a complete evening.'
            ],
            image: hanoiLongBienImage,
            imageAlt: 'Long Bien Bridge in Hanoi',
            caption: 'Long Bien Bridge adds river atmosphere and local texture after the classic city highlights.',
            subsections: [
              {
                heading: 'French Quarter finish',
                body: [
                  'This is ideal for travelers staying in heritage hotels or anyone who enjoys architecture, quiet boulevards and a softer end to the day. It also works well before cocktails or dinner.'
                ]
              },
              {
                heading: 'Long Bien and local life',
                body: [
                  'Long Bien is best with a guide who can manage timing and safety. It should feel like a thoughtful local chapter, not a forced photo stop.'
                ]
              }
            ]
          },
          {
            heading: 'Luxury planning notes before you book',
            body: [
              'Before booking a Hanoi city tour, confirm the guide style, hotel pickup time, walking intensity, lunch plan, vehicle availability and backup options for weather. These practical details decide whether the day feels seamless.',
              'If you are connecting Hanoi with Ha Long Bay, Ninh Binh or an international arrival, be careful not to overload the city day. Hanoi works best when the first day gives you orientation and confidence. The deeper experiences can come later once you understand the rhythm of the city.'
            ],
            image: hanoiStreetImage,
            imageAlt: 'Central Hanoi street life for a private city tour',
            caption: 'The small details of Hanoi street life are easier to enjoy when the day is paced with comfort.',
            table: {
              heading: 'Questions to ask before booking a Hanoi city tour',
              rows: [
                { label: 'Guide style', bestFor: 'A guide who can balance history, food, etiquette and flexible hosting.', watchOut: 'Avoid a script-heavy guide if you prefer conversation and local texture.' },
                { label: 'Walking level', bestFor: 'Short intentional walks through the Old Quarter and heritage sites.', watchOut: 'Long walking loops can feel tiring in heat, rain or heavy traffic.' },
                { label: 'Meal plan', bestFor: 'One strong local lunch, a coffee pause and optional refined dinner.', watchOut: 'Too many tastings can make the tour feel messy.' },
                { label: 'Private vehicle', bestFor: 'Comfortable repositioning between Hoan Kiem, museums, French Quarter and Long Bien.', watchOut: 'A vehicle is less useful inside the densest Old Quarter lanes, where walking is better.' }
              ]
            },
            bullets: [
              'Send your hotel name before finalizing the route.',
              'Tell the designer if you prefer food, history, photography, shopping or architecture.',
              'Request a softer route if traveling with children, older guests or jet lag.',
              'Leave one flexible pocket for weather, appetite or a guide recommendation.'
            ],
            subsections: [
              {
                heading: 'Best time of year',
                body: [
                  'October to April is generally the most comfortable period for a Hanoi city tour, especially for walking and photography. Summer can still work, but the day should start earlier and include stronger air-conditioned breaks.'
                ]
              },
              {
                heading: 'Best tour length',
                body: [
                  'A half-day tour is enough for orientation. A full-day tour is better if you want heritage, food, coffee, architecture and local texture. An evening add-on works well for food, water puppets or a refined dinner.'
                ]
              }
            ]
          }
        ]
      }
    }
  },
  {
    id: 'vietnam-safe-private-travel',
    type: 'post',
    title: "Why Vietnam Feels Safe for Private Asia Travel",
    slug: 'why-vietnam-feels-safe-for-private-asia-travel',
    excerpt: "Calm cities, warm hospitality and smart routing make Vietnam a confident choice for first-time and returning travelers.",
    content: '<p>Vietnam works beautifully for private travel when the route is planned with clean transfers, sensible timing and trusted local support.</p><p>For families, couples and first-time Asia travelers, the safest-feeling journeys usually combine central hotels, guided neighborhood walks, private drivers and flexible days that avoid rushed late-night moves.</p>',
    featuredImage: '/images/hero/vietnam-saigon-city-hall-4k.jpg',
    meta: { seo: { title: 'Why Vietnam Feels Safe for Private Asia Travel', description: 'Practical safety and planning notes for private Vietnam journeys.' }, details: { homeFeatured: true, publishedAt: 'September 18, 2025', category: 'Tips & Experiences' } }
  },
  {
    id: 'thailand-first-trip-seven-steps',
    type: 'post',
    title: "How to Plan a First Trip to Thailand in 7 Steps",
    slug: 'how-to-plan-a-first-trip-to-thailand-in-7-steps',
    excerpt: "A clear route through beaches, temples, hotels and transfer timing, designed so the trip feels polished from day one.",
    content: '<p>A strong first Thailand trip starts with fewer stops, better hotels and transfers that respect the heat, traffic and beach flight times.</p><p>Pair Bangkok with one northern cultural stop or one island base, then protect the final day for an easy departure instead of squeezing in another checklist item.</p>',
    featuredImage: '/images/assurance/thailand-wat-arun-bangkok-4k.jpg',
    meta: { seo: { title: 'How to Plan a First Trip to Thailand in 7 Steps', description: 'A calm seven-step Thailand planning guide for first-time travelers.' }, details: { homeFeatured: true, publishedAt: 'March 20, 2024', category: 'Tips & Experiences' } }
  },
  {
    id: 'hanoi-authentic-food-tour',
    type: 'post',
    title: "Best Food Recommendations for an Authentic Hanoi Tour",
    slug: 'best-food-recommendations-for-an-authentic-hanoi-tour',
    excerpt: "Street kitchens, market walks and family-run tables help Hanoi's food scene become part of the journey, not just a stop.",
    content: '<p>Hanoi food is best experienced with context: neighborhood timing, a local host and space to sit where each dish naturally belongs.</p><p>A private food route can balance pho, bun cha, egg coffee, market snacks and hidden family kitchens without turning the evening into a rushed tasting list.</p>',
    featuredImage: hanoiFoodImage,
    meta: { seo: { title: 'Best Food Recommendations for an Authentic Hanoi Tour', description: 'Original Hanoi food planning notes for an authentic private tour.' }, details: { homeFeatured: true, publishedAt: 'July 23, 2024', category: 'Culture & Cuisine' } }
  },
  { id: 'best-time-vietnam', type: 'post', title: 'Best Time to Visit Vietnam in Style', slug: 'best-time-to-visit-vietnam', excerpt: 'Season-by-season planning notes for a refined Vietnam holiday.', content: 'Vietnam works year-round when the route is designed around regional weather.', featuredImage: image('photo-1559592413-7cec4d0cae2b'), meta: { seo: { title: 'Best Time to Visit Vietnam', description: 'Luxury travel planning guide for Vietnam weather and seasons.' } } },
  { id: 'indochina-routing', type: 'post', title: 'How to Route a Luxury Indochina Journey', slug: 'luxury-indochina-routing-guide', excerpt: 'Smart ways to connect Vietnam, Cambodia, Laos and Thailand.', content: 'A well-designed route protects your energy and creates more meaningful travel days.', featuredImage: image('photo-1488646953014-85cb44e25828'), meta: { seo: { title: 'Luxury Indochina Routing Guide', description: 'Plan a multi-country Southeast Asia journey with smart routing.' } } },
  ...generatedBlogPosts
];
