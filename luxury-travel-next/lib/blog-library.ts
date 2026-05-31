import { CmsItem } from './types';
import landmarkImages from '../data/legal-tour-landmark-images.json';

type LandmarkImage = { url: string; alt?: string; width?: number; height?: number };
type DestinationSeed = {
  destination: string;
  country: string;
  imageKey: string;
  route: string;
  season: string;
  mood: string;
  highlights: string[];
};
type BlogImageAsset = LandmarkImage & { key: string; renderedUrl: string };
export type BlogArticleTableRow = { label: string; bestFor: string; watchOut: string };
export type BlogArticleTable = { heading: string; rows: BlogArticleTableRow[] };
export type BlogArticleSubsection = { heading: string; body: string[]; bullets?: string[] };
export type BlogArticleSection = {
  heading: string;
  body: string[];
  bullets?: string[];
  subsections?: BlogArticleSubsection[];
  table?: BlogArticleTable;
  image?: string;
  imageAlt?: string;
  caption?: string;
};

const legalImages = landmarkImages as Record<string, LandmarkImage[]>;
const fallbackImage = 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=3840&q=90';
const manualBlogImageReservations = [
  '/images/hero/vietnam-saigon-city-hall-4k.jpg',
  '/images/assurance/thailand-wat-arun-bangkok-4k.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Bun-cha-hanoi.jpg/3840px-Bun-cha-hanoi.jpg',
  'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=3840&q=90',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=3840&q=90'
];

const countryImageKeys: Record<string, string[]> = {
  Vietnam: ['hanoi', 'ha-long-bay', 'hoi-an', 'hue', 'ninh-binh', 'sapa', 'mekong-delta', 'phu-quoc', 'da-nang', 'ban-gioc', 'ho-chi-minh-city', 'tam-coc', 'mua-cave', 'ben-tre', 'food'],
  Thailand: ['bangkok', 'chiang-mai', 'phuket', 'krabi', 'koh-samui', 'ayutthaya'],
  Cambodia: ['angkor', 'siem-reap', 'phnom-penh'],
  Laos: ['luang-prabang', 'kuang-si', 'vang-vieng', 'vientiane'],
  Myanmar: ['bagan', 'yangon', 'inle-lake', 'mandalay'],
  'Multi Country': ['ha-long-bay', 'hanoi', 'hoi-an', 'angkor', 'luang-prabang', 'bangkok', 'krabi', 'phu-quoc', 'food', 'mekong-delta']
};

function wikimediaThumbUrl(rawUrl: string, sourceWidth?: number) {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.hostname !== 'upload.wikimedia.org' || !parsed.pathname.startsWith('/wikipedia/commons/') || parsed.pathname.includes('/thumb/')) {
      return rawUrl;
    }

    const commonsPath = parsed.pathname.replace('/wikipedia/commons/', '');
    const fileName = commonsPath.split('/').pop();
    if (!fileName) return rawUrl;

    const thumbWidth = Number(sourceWidth ?? 0) >= 3840 ? 3840 : 2560;
    return `${parsed.origin}/wikipedia/commons/thumb/${commonsPath}/${thumbWidth}px-${fileName}${parsed.search}`;
  } catch {
    return rawUrl;
  }
}

function stableImageUrl(image?: LandmarkImage) {
  if (!image?.url) return fallbackImage;
  return wikimediaThumbUrl(image.url, image.width);
}

function imageIdentity(src: string) {
  try {
    const parsed = new URL(src, 'https://local.invalid');
    const path = decodeURIComponent(parsed.pathname);
    const fileName = path.match(/\/\d+px-([^/]+)$/)?.[1] ?? path.split('/').pop() ?? src;
    if (/upload\.wikimedia\.org/i.test(parsed.hostname)) return `wikimedia:${fileName.toLowerCase()}`;
    return `${parsed.hostname}${path}`.toLowerCase();
  } catch {
    return src.toLowerCase();
  }
}

function isSharpImage(image: LandmarkImage) {
  const width = Number(image.width ?? 0);
  return Boolean(image.url) && (width >= 3840 || image.url.includes('w=3840'));
}

function uniqueKeys(values: string[]) {
  return Array.from(new Set(values.filter((value) => legalImages[value]?.length)));
}

function relatedImageKeys(seed: DestinationSeed) {
  return uniqueKeys([seed.imageKey, ...(countryImageKeys[seed.country] ?? countryImageKeys['Multi Country'])]);
}

function imageCandidates(keys: string[]) {
  const seen = new Set<string>();
  return keys.flatMap((key) => (legalImages[key] ?? []).map((image): BlogImageAsset => ({ ...image, key, renderedUrl: stableImageUrl(image) })))
    .filter(isSharpImage)
    .filter((image) => {
      const identity = imageIdentity(image.renderedUrl);
      if (seen.has(identity)) return false;
      seen.add(identity);
      return true;
    });
}

const globalImageCandidates = imageCandidates(Object.keys(legalImages));
const usedBlogImageIdentities = new Set(manualBlogImageReservations.map(imageIdentity));

function takeUniqueBlogImage(seed: DestinationSeed, offset = 0): BlogImageAsset {
  const exactCandidates = imageCandidates([seed.imageKey]);
  const broaderCandidates = imageCandidates(relatedImageKeys(seed).filter((key) => key !== seed.imageKey));
  const pools = [exactCandidates, broaderCandidates, globalImageCandidates];

  for (const pool of pools) {
    if (!pool.length) continue;
    const start = offset % pool.length;
    for (let step = 0; step < pool.length; step += 1) {
      const candidate = pool[(start + step) % pool.length];
      const identity = imageIdentity(candidate.renderedUrl);
      if (usedBlogImageIdentities.has(identity)) continue;
      usedBlogImageIdentities.add(identity);
      return candidate;
    }
  }

  const fallbackAsset = { url: fallbackImage, renderedUrl: fallbackImage, alt: 'Southeast Asia private travel landscape', width: 3840, height: 2160, key: 'fallback' };
  usedBlogImageIdentities.add(imageIdentity(fallbackImage));
  return fallbackAsset;
}

function imageAltFor(image: BlogImageAsset, title: string) {
  return image.alt ?? title;
}

const publishingDates = ['January 18, 2026', 'January 25, 2026', 'February 02, 2026', 'February 09, 2026', 'February 16, 2026', 'February 23, 2026', 'March 02, 2026', 'March 09, 2026', 'March 16, 2026', 'March 23, 2026', 'March 30, 2026', 'April 06, 2026'];

const destinationSeeds: DestinationSeed[] = [
  { destination: 'Hanoi', country: 'Vietnam', imageKey: 'hanoi', route: 'Hoan Kiem Lake, Old Quarter, French Quarter and refined cafe stops', season: 'October to April', mood: 'heritage city rhythm', highlights: ['Start early around Hoan Kiem Lake', 'Use a private food host in the Old Quarter', 'Keep one evening for a refined dinner'] },
  { destination: 'Ha Long Bay', country: 'Vietnam', imageKey: 'ha-long-bay', route: 'Hanoi, Ha Long Bay, Lan Ha Bay and quiet limestone waters', season: 'October to May', mood: 'cinematic cruise scenery', highlights: ['Compare cabin size before route promises', 'Choose Lan Ha for softer crowds', 'Protect the transfer day from extra touring'] },
  { destination: 'Hoi An', country: 'Vietnam', imageKey: 'hoi-an', route: 'Ancient Town, lantern lanes, Tra Que village and An Bang beach', season: 'February to August', mood: 'lantern-lit culture and beach calm', highlights: ['Walk the old town after day groups leave', 'Pair craft stops with a private food route', 'Use the beach as a soft reset'] },
  { destination: 'Hue', country: 'Vietnam', imageKey: 'hue', route: 'Imperial Citadel, garden houses, Perfume River and royal tombs', season: 'January to April', mood: 'slow imperial heritage', highlights: ['Visit the citadel with a historian', 'Cruise the Perfume River privately', 'Save time for royal-style cuisine'] },
  { destination: 'Ninh Binh', country: 'Vietnam', imageKey: 'ninh-binh', route: 'Trang An, Tam Coc, Mua Cave and limestone villages', season: 'November to May', mood: 'limestone countryside escape', highlights: ['Choose one boat route, not all of them', 'Climb viewpoints outside midday heat', 'Stay overnight for better light'] },
  { destination: 'Sapa', country: 'Vietnam', imageKey: 'sapa', route: 'Sapa, Muong Hoa Valley, village walks and mountain viewpoints', season: 'September to November', mood: 'highland terrace landscapes', highlights: ['Avoid overloaded trekking days', 'Use a local host for village context', 'Keep one flexible weather window'] },
  { destination: 'Mekong Delta', country: 'Vietnam', imageKey: 'mekong-delta', route: 'Cai Be, Ben Tre, Can Tho and orchard waterways', season: 'December to April', mood: 'slow river life', highlights: ['Sleep near the river if possible', 'Start markets before sunrise', 'Balance boat time with village walks'] },
  { destination: 'Phu Quoc', country: 'Vietnam', imageKey: 'phu-quoc', route: 'Bai Sao, island resorts, southern beaches and sunset dining', season: 'November to April', mood: 'Vietnam beach recovery', highlights: ['Match resort location to your beach mood', 'Avoid too many island hops', 'Check direct flights before confirming'] },
  { destination: 'Da Nang and Hoi An', country: 'Vietnam', imageKey: 'da-nang', route: 'Da Nang airport, Hoi An, the Hai Van Pass and Hue', season: 'February to August', mood: 'central Vietnam made seamless', highlights: ['Use Da Nang airport strategically', 'Sleep in Hoi An for evenings', 'Cross Hai Van Pass with pauses'] },
  { destination: 'Ban Gioc and Cao Bang', country: 'Vietnam', imageKey: 'ban-gioc', route: 'Cao Bang, Ban Gioc Waterfall and limestone border valleys', season: 'September to November', mood: 'remote northern scenery', highlights: ['Allow enough overland time', 'Pair waterfalls with village stops', 'Use the best rural stays available'] },
  { destination: 'Bangkok', country: 'Thailand', imageKey: 'bangkok', route: 'Grand Palace, Wat Arun, khlongs, Chinatown and riverside hotels', season: 'November to February', mood: 'temples, food and river energy', highlights: ['Start temples early', 'Use a private longtail boat', 'Keep one evening for Chinatown food'] },
  { destination: 'Chiang Mai', country: 'Thailand', imageKey: 'chiang-mai', route: 'Old City, Doi Suthep, craft villages and countryside lodges', season: 'November to February', mood: 'northern craft and mountain air', highlights: ['Keep temple days short and focused', 'Add craft villages with context', 'Use a countryside lodge for contrast'] },
  { destination: 'Phuket', country: 'Thailand', imageKey: 'phuket', route: 'Phuket beaches, Phang Nga Bay, old town and resort dining', season: 'November to April', mood: 'resort polish and island access', highlights: ['Choose beach location carefully', 'Do not overbook boat days', 'Reserve one recovery day'] },
  { destination: 'Krabi', country: 'Thailand', imageKey: 'krabi', route: 'Railay, Phi Phi Islands, limestone bays and quiet beach hotels', season: 'November to April', mood: 'limestone beach drama', highlights: ['Use Krabi for scenery', 'Check boat conditions by season', 'Protect sunset time'] },
  { destination: 'Koh Samui', country: 'Thailand', imageKey: 'koh-samui', route: 'Koh Samui, Ang Thong Marine Park and private villa stays', season: 'January to September', mood: 'soft island honeymoon pacing', highlights: ['Choose the beach by mood', 'Keep marine park optional', 'Protect private dinner time'] },
  { destination: 'Ayutthaya', country: 'Thailand', imageKey: 'ayutthaya', route: 'Bangkok, Ayutthaya Historical Park and riverside temples', season: 'November to February', mood: 'ancient capital day trip', highlights: ['Leave Bangkok early', 'Use a historian guide', 'Return by river if timing allows'] },
  { destination: 'Angkor', country: 'Cambodia', imageKey: 'angkor', route: 'Angkor Wat, Angkor Thom, Ta Prohm and quieter temple circuits', season: 'November to March', mood: 'monumental temple heritage', highlights: ['Split sunrise and big temples', 'Use midday for rest', 'Keep one quiet circuit'] },
  { destination: 'Siem Reap', country: 'Cambodia', imageKey: 'siem-reap', route: 'Siem Reap, Tonle Sap, local galleries and countryside villages', season: 'November to March', mood: 'temples plus creative culture', highlights: ['Add a countryside afternoon', 'Book one Khmer dining experience', 'Leave space after sunrise'] },
  { destination: 'Phnom Penh', country: 'Cambodia', imageKey: 'phnom-penh', route: 'Royal Palace, riverside, markets and reflective history sites', season: 'November to February', mood: 'capital history and riverside calm', highlights: ['Choose a sensitive guide', 'Avoid overcrowding the day', 'Use the riverfront for breathing room'] },
  { destination: 'Tonle Sap', country: 'Cambodia', imageKey: 'siem-reap', route: 'Siem Reap, Tonle Sap lake villages and seasonal waterways', season: 'August to February', mood: 'water village context', highlights: ['Choose ethical operators', 'Understand water levels', 'Keep photography respectful'] },
  { destination: 'Luang Prabang', country: 'Laos', imageKey: 'luang-prabang', route: 'old town temples, Mekong river, craft villages and quiet hotels', season: 'November to March', mood: 'slow spiritual atmosphere', highlights: ['Keep dawn rituals respectful', 'Use afternoons for river views', 'Choose old-town access'] },
  { destination: 'Kuang Si Falls', country: 'Laos', imageKey: 'kuang-si', route: 'Luang Prabang, Kuang Si Falls and forest pools', season: 'November to April', mood: 'clear water and forest reset', highlights: ['Start early from Luang Prabang', 'Bring dry clothes and good shoes', 'Add a village or craft stop'] },
  { destination: 'Laos Mekong', country: 'Laos', imageKey: 'luang-prabang', route: 'Luang Prabang, Pak Ou, riverside villages and slow river days', season: 'November to February', mood: 'unhurried river travel', highlights: ['Choose comfort over speed', 'Check cabin and deck style', 'Keep expectations slow and scenic'] },
  { destination: 'Vang Vieng', country: 'Laos', imageKey: 'vang-vieng', route: 'Nam Song River, caves, viewpoints and mountain lodges', season: 'November to March', mood: 'soft adventure with views', highlights: ['Start viewpoints early', 'Choose soft adventure, not overload', 'Use riverside hotels for calm'] },
  { destination: 'Bagan', country: 'Myanmar', imageKey: 'bagan', route: 'Bagan temples, village lanes and sunset viewpoints', season: 'November to February', mood: 'golden temple plains', highlights: ['Choose fewer temples with better stories', 'Protect sunrise and sunset time', 'Move respectfully through villages'] },
  { destination: 'Yangon', country: 'Myanmar', imageKey: 'yangon', route: 'downtown streets, Shwedagon, markets and tea shops', season: 'November to February', mood: 'golden pagodas and layered streets', highlights: ['Visit Shwedagon near golden hour', 'Walk downtown with context', 'Add tea shop culture'] },
  { destination: 'Inle Lake', country: 'Myanmar', imageKey: 'inle-lake', route: 'floating gardens, villages, monasteries and lakeside hotels', season: 'November to February', mood: 'soft water landscapes', highlights: ['Start on the water early', 'Avoid repetitive workshop stops', 'Choose a lakeside stay carefully'] },
  { destination: 'Mandalay', country: 'Myanmar', imageKey: 'mandalay', route: 'Mandalay, Amarapura, Sagaing and Inwa', season: 'November to February', mood: 'ancient capitals and river heritage', highlights: ['Use one strong guide', 'Group ancient capitals logically', 'Keep sunset flexible'] },
  { destination: 'Vietnam and Cambodia', country: 'Multi Country', imageKey: 'angkor', route: 'Hanoi, Ha Long Bay, Hoi An, Ho Chi Minh City, Siem Reap and Angkor', season: 'November to March', mood: 'classic Indochina contrast', highlights: ['Avoid too many Vietnam stops', 'Protect Angkor with three nights', 'Use private transfers for comfort'] },
  { destination: 'Vietnam and Laos', country: 'Multi Country', imageKey: 'luang-prabang', route: 'Hanoi, Ha Long Bay, Luang Prabang and optional Hoi An', season: 'November to March', mood: 'energy followed by stillness', highlights: ['Use Hanoi as a gateway', 'End with Luang Prabang calm', 'Avoid awkward overland links'] },
  { destination: 'Thailand and Cambodia', country: 'Multi Country', imageKey: 'krabi', route: 'Bangkok, Siem Reap, Phuket or Krabi', season: 'November to March', mood: 'beach plus temples', highlights: ['Do temples before the beach', 'Use Bangkok as a clean gateway', 'Keep flight days light'] },
  { destination: 'Indochina', country: 'Multi Country', imageKey: 'ha-long-bay', route: 'Vietnam, Cambodia, Laos and Thailand with clean flight logic', season: 'November to March', mood: 'many layers, one calm plan', highlights: ['Limit the trip to three or four countries', 'Use Luang Prabang as a pause', 'End somewhere restorative'] },
  { destination: 'Southeast Asia Food Trail', country: 'Multi Country', imageKey: 'food', route: 'Hanoi, Hoi An, Bangkok, Chiang Mai and Luang Prabang markets', season: 'Year round', mood: 'market walks and refined tables', highlights: ['Use local hosts, not only lists', 'Alternate street food and fine dining', 'Avoid food tours on arrival night'] },
  { destination: 'Southeast Asia Family Route', country: 'Multi Country', imageKey: 'hoi-an', route: 'Hanoi, Hoi An, Siem Reap, Bangkok and a Thai beach', season: 'December to April', mood: 'multi-generation ease', highlights: ['Keep mornings meaningful and afternoons flexible', 'Use pool-friendly hotels', 'Avoid late domestic flights'] },
  { destination: 'Southeast Asia Honeymoon', country: 'Multi Country', imageKey: 'phu-quoc', route: 'Hanoi, Ha Long Bay, Hoi An, Bangkok and a Thai island', season: 'November to April', mood: 'culture first, beach last', highlights: ['Place the beach at the end', 'Use boutique hotels early', 'Keep two private dinners'] },
  { destination: 'Private Asia Planning', country: 'Multi Country', imageKey: 'train', route: 'route design, hotels, guiding, transfers and backup support', season: 'Year round', mood: 'effortless tailor-made travel', highlights: ['Start with pace, not places', 'Choose hotels by function', 'Build support into transfer days'] }
];

const anglePairs = [
  ['How to Plan a Private {destination} Journey', 'A First-Timer Guide to {destination} Without the Rush'],
  ['{destination} Travel Tips for a More Graceful Trip', 'Where to Stay and What to Skip in {destination}'],
  ['The Smart Luxury Route Through {destination}', '{destination} With Better Pacing: A Designer Guide'],
  ['Best Time to Visit {destination} in Style', 'Food, Culture and Quiet Moments in {destination}'],
  ['A Family-Friendly Private Guide to {destination}', '{destination} for Couples: Romance, Comfort and Timing'],
  ['Photography and Golden-Hour Planning in {destination}', 'How to Add {destination} to a Multi-Stop Asia Trip']
] as const;

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function formatTitle(template: string, destination: string) {
  return template.replace('{destination}', destination);
}

function articleIntro(title: string, seed: DestinationSeed) {
  return `${title} focuses on ${seed.mood}, with a private route through ${seed.route}. It is written for travelers who want sharp logistics, beautiful stays and enough space to enjoy the destination properly.`;
}

function seedHighlight(seed: DestinationSeed, index: number, fallback: string) {
  return seed.highlights[index] ?? fallback;
}

function makePlanningTable(seed: DestinationSeed, variant: number): BlogArticleTable {
  const routeLabel = variant === 1 ? 'Daily anchor' : 'Route spine';
  return {
    heading: `${seed.destination} planning table`,
    rows: [
      {
        label: routeLabel,
        bestFor: `A private route through ${seed.route}.`,
        watchOut: 'Do not add nearby stops just because they fit on a map.'
      },
      {
        label: 'Signature mood',
        bestFor: `Travelers who want ${seed.mood} without losing comfort or context.`,
        watchOut: 'If every day has the same intensity, the trip will feel flat by the middle.'
      },
      {
        label: 'Best window',
        bestFor: `${seed.season}, with one flexible pocket for weather, traffic or a local recommendation.`,
        watchOut: 'Peak dates need earlier hotel holds and softer daily pacing.'
      },
      {
        label: 'Private detail',
        bestFor: `${seedHighlight(seed, 0, 'Use private guiding where context changes the experience')}.`,
        watchOut: 'Confirm guide style, transfer duration and hotel zone before comparing price.'
      }
    ]
  };
}

function makeSections(title: string, seed: DestinationSeed, variant: number, detailImage: BlogImageAsset): BlogArticleSection[] {
  const firstHighlight = seedHighlight(seed, 0, 'Use a private host where timing and context matter');
  const secondHighlight = seedHighlight(seed, 1, 'Keep the most scenic moment away from the busiest hour');
  const thirdHighlight = seedHighlight(seed, 2, 'Leave one quiet pocket for recovery');
  const planningTable = makePlanningTable(seed, variant);

  if (variant === 1) {
    return [
      {
        heading: `What this ${seed.destination} guide helps you avoid`,
        body: [
          `${title} is written for travelers who want ${seed.destination} to feel personal, not over-planned. The strongest private trips in ${seed.country} usually come from fewer decisions made with more care: the right base, the right guide, the right time of day and a route that respects how people actually travel.`,
          `Use this guide as a practical filter. It keeps the focus on ${seed.mood}, then turns that mood into hotel choices, transfer logic, meal timing and daily rhythm instead of a long list of disconnected recommendations.`
        ],
        bullets: seed.highlights.map((highlight) => `${highlight}, with enough room around it to feel unhurried`),
        subsections: [
          {
            heading: 'Start with friction, not fantasy',
            body: [
              `Most disappointing ${seed.destination} days are not ruined by the main attraction. They are weakened by late starts, awkward hotel zones, long gaps between meals or a guide who turns a private day into a lecture. Solve those practical points first and the destination has space to shine.`
            ]
          },
          {
            heading: 'Decide what can be skipped',
            body: [
              `A refined route through ${seed.route} should include a few generous moments, not every possible stop. If two ideas serve the same purpose, choose the one with better timing, better access or a stronger sense of place.`
            ]
          }
        ]
      },
      {
        heading: 'Build the day around one strong anchor',
        body: [
          `The easiest way to make ${seed.destination} feel graceful is to choose one anchor for each day. It might be a temple circuit, a cruise moment, a food route, a village walk or a quiet hotel afternoon. Everything else should support that anchor rather than compete with it.`,
          `For most private travelers, the strongest anchor belongs early in the day when energy, light and traffic are easier to manage. Softer experiences can sit later, especially if the route includes markets, cafe stops, spa time, riverside walks or beach recovery.`
        ],
        image: detailImage.renderedUrl,
        imageAlt: imageAltFor(detailImage, title),
        caption: `${seed.destination} travel detail, selected for high-resolution editorial use without repeating another blog image.`,
        subsections: [
          {
            heading: 'Morning should carry the weight',
            body: [
              `${firstHighlight} works best when it is planned before the day becomes hot, crowded or transfer-heavy. A private guide can adjust the order in real time, but the original structure should still protect the most important moment.`
            ]
          },
          {
            heading: 'Afternoon should reduce pressure',
            body: [
              `After the anchor, the itinerary should become lighter: lunch with a view, a short neighborhood walk, hotel recovery or a single local stop with a clear reason. This is where luxury becomes emotional, because the traveler feels looked after instead of processed.`
            ]
          }
        ],
        table: planningTable
      },
      {
        heading: 'Map the smaller moments that make it feel local',
        body: [
          `${seed.destination} becomes memorable through details that are easy to miss: how a neighborhood wakes up, where families eat, which craft tradition still has a living workshop, or when the light makes a familiar landmark feel private. These smaller moments should not be treated as filler.`,
          `The route can follow ${seed.route}, but the day needs pauses that help the traveler absorb it. A good plan alternates interpretation, atmosphere and rest so the experience feels layered rather than busy.`
        ],
        bullets: [
          `${secondHighlight} so the day has a clear visual or cultural reward`,
          'Place meals where they naturally belong in the neighborhood, not wherever there is a gap',
          'Leave enough walking time for texture, photos and small discoveries'
        ],
        subsections: [
          {
            heading: 'Use a local host for context',
            body: [
              `Private guiding is most valuable when etiquette, history, cuisine or family stories change what the traveler notices. In those moments, a host should make the experience feel clearer and warmer, not more scripted.`
            ]
          },
          {
            heading: 'Keep one unscheduled pocket',
            body: [
              `A short open pocket lets the guide respond to weather, appetite or a nearby opportunity. It also gives the traveler permission to linger when something feels special, which is often where the best memories happen.`
            ]
          }
        ]
      },
      {
        heading: 'Keep the pace spacious, especially in high season',
        body: [
          `${seed.season} is usually the strongest window for this style of journey, but good weather can also bring fuller hotels, tighter restaurant slots and more visitors at famous places. The answer is not to avoid the season. The answer is to design the days more intelligently.`,
          `Private travel should make the destination feel smoother than it would feel alone. That means shorter waits, cleaner transfers, well chosen start times and a daily rhythm that acknowledges heat, crowds and the need for recovery.`
        ],
        subsections: [
          {
            heading: 'Use buffers as a luxury feature',
            body: [
              `A buffer is not empty time. It protects the quality of the next experience. In ${seed.destination}, even a thirty-minute pause can save a dinner, a sunset or a hotel check-in from feeling rushed.`
            ]
          },
          {
            heading: 'Avoid stacking difficult days',
            body: [
              `If one day has an early start, a long drive or a heavy cultural program, the next day should be softer. Alternating intensity keeps the trip elegant and helps families, couples and multi-generation groups stay aligned.`
            ]
          }
        ]
      },
      {
        heading: 'Plan food, privacy and recovery time',
        body: [
          `Food and hotel time are part of the itinerary, not rewards after the itinerary. In ${seed.country}, a carefully placed lunch, a relaxed cafe stop or a quiet pool hour can make the difference between a trip that looks impressive and a trip that actually feels good.`,
          `For ${seed.destination}, the best private plans usually connect atmosphere with comfort. Choose the meal that belongs to the neighborhood, the hotel that makes evenings easier and the guide who knows when to step forward or step back.`
        ],
        bullets: [
          'Reserve special meals before the route is finalized, then shape the day around them',
          'Use private transfers for difficult links, late returns and family travel days',
          'Keep recovery time visible in the plan so it does not disappear during booking'
        ],
        subsections: [
          {
            heading: 'Match meals to energy',
            body: [
              `A tasting dinner after a long arrival day rarely feels luxurious. Put the most expressive meal after a calm day, then use lighter local stops when the route is already full.`
            ]
          },
          {
            heading: 'Let the hotel do some work',
            body: [
              `A well placed hotel can reduce transfer time, make evenings easier and create a sense of retreat. Before choosing the most photogenic property, check whether it supports the actual route.`
            ]
          }
        ]
      },
      {
        heading: 'Turn the article into a personal itinerary',
        body: [
          `This guide is a starting brief, not a fixed package. The right version of ${seed.destination} depends on your dates, room standard, walking comfort, meal style, flight logic and how much private guiding you want each day.`,
          `If two options look similar on paper, choose the one with fewer transfers, better timing and a clearer emotional purpose. A calm itinerary usually creates better memories than a crowded one.`
        ],
        bullets: [
          `${thirdHighlight} so the final days still feel fresh`,
          'Confirm hotel zone, guide style, transfer time and meal reservations together',
          'Ask your designer why each stop earns its place before you confirm the deposit'
        ],
        subsections: [
          {
            heading: 'What to send your travel designer',
            body: [
              `Share your ideal pace, preferred hotel mood, dietary needs, must-see moments and anything you would rather skip. Clear constraints help the designer create a more personal version of ${seed.destination}.`
            ]
          },
          {
            heading: 'What to check before booking',
            body: [
              `Look at the route as a day-by-day experience, not just a list of inclusions. The plan should explain why the order works, where the buffers sit and how support is handled if weather or timing changes.`
            ]
          }
        ]
      }
    ];
  }

  return [
    {
      heading: `Why ${seed.destination} deserves careful planning`,
      body: [
        `${title} starts with one principle: ${seed.destination} is strongest when the route is shaped around ${seed.mood}, not just landmarks. The best private journeys protect timing, comfort and context from the first transfer, because those small details decide whether the trip feels polished or tiring.`,
        `For travelers choosing ${seed.country}, careful planning does not mean filling every hour. It means choosing the right order for ${seed.route}, then giving each signature moment enough space to be enjoyed properly.`
      ],
      bullets: seed.highlights,
      subsections: [
        {
          heading: 'Define the trip mood before the route',
          body: [
            `A route for ${seed.mood} should feel different from a checklist tour. The hotel base, start times, dining choices and guide style all need to support the mood, otherwise the itinerary may look correct but feel generic.`
          ]
        },
        {
          heading: 'Choose fewer promises, executed better',
          body: [
            `If the plan tries to include every landmark, the traveler spends more time switching contexts than experiencing ${seed.destination}. A refined itinerary makes each stop earn its place.`
          ]
        }
      ]
    },
    {
      heading: 'How to shape the route',
      body: [
        `A polished route usually follows this line: ${seed.route}. Keep the most demanding sightseeing early in the day, then use afternoons for hotel time, transfers or slower neighborhood discovery.`,
        `Private guiding is most valuable where history, food or local etiquette changes the experience. Free time matters just as much in resort areas, beach stops and atmospheric towns, because that is where the trip begins to feel personal.`
      ],
      image: detailImage.renderedUrl,
      imageAlt: imageAltFor(detailImage, title),
      caption: `${seed.destination} image selected to match the travel theme and avoid duplicate blog visuals.`,
      subsections: [
        {
          heading: 'Make the route legible',
          body: [
            `The traveler should understand why the day moves in this order. When the logic is clear, transfers feel calmer, guides can adapt more easily and the guest can relax into the experience.`
          ]
        },
        {
          heading: 'Use transitions as design moments',
          body: [
            `A flight, cruise pier or overland drive should not be treated as empty time. Add a light lunch, a scenic stop or a quiet hotel arrival so the transition still feels cared for.`
          ]
        }
      ],
      table: planningTable
    },
    {
      heading: 'Where to slow down instead of adding stops',
      body: [
        `The luxury version of ${seed.destination} often comes from restraint. Add depth to the most important places before adding more places, especially when the trip includes long transfers, family travel or a special occasion.`,
        `A slower plan can still feel rich. It simply lets the traveler notice more: the way a market changes after breakfast, the sound of a river at dusk, the calm of returning to a well chosen hotel before dinner.`
      ],
      bullets: [
        `${firstHighlight} before adding secondary stops`,
        `${secondHighlight} when light, crowds and energy are easier to manage`,
        `${thirdHighlight} so the itinerary keeps its shape until the end`
      ],
      subsections: [
        {
          heading: 'Give the main experience a wider frame',
          body: [
            `A signature stop feels more meaningful when it has arrival time, context and recovery around it. Do not place the most important moment between two rushed transfers.`
          ]
        },
        {
          heading: 'Let meals and walks carry texture',
          body: [
            `Short local walks, well timed meals and quiet viewpoints can carry more atmosphere than another formal attraction. Use them to make the day feel lived in.`
          ]
        }
      ]
    },
    {
      heading: 'Best timing and trip rhythm',
      body: [
        `${seed.season} is the most reliable planning window for this idea, though the final answer depends on route, coast, altitude and your comfort level. A good itinerary leaves space for weather and energy, especially when moving between regions.`,
        `For a luxury private journey, avoid stacking too many early starts together. One intense cultural day followed by a softer day often feels better than three average days in a row.`
      ],
      subsections: [
        {
          heading: 'Plan around light and heat',
          body: [
            `The best hour for the main experience is not always the most convenient hour. A private itinerary should protect the light, shade or breeze that makes ${seed.destination} feel at its best.`
          ]
        },
        {
          heading: 'Keep one weather option ready',
          body: [
            `A backup plan should feel curated, not like a compromise. Build one indoor, culinary, spa or neighborhood option into the route before the trip begins.`
          ]
        }
      ]
    },
    {
      heading: 'Comfort details that change the whole experience',
      body: [
        `The difference between a good trip and a seamless one is often practical: hotel zone, room category, transfer vehicle, luggage handling, guide pacing, restaurant timing and how quickly support responds when plans shift.`,
        `These details are easy to overlook when comparing itineraries online. They matter most in ${seed.destination} because the right logistical choices make the destination feel more intimate and less demanding.`
      ],
      subsections: [
        {
          heading: 'Hotel location comes before hotel drama',
          body: [
            `A beautiful hotel still needs to work for the route. If it adds repeated transfer time, choose it for a retreat day or pick a better base for active sightseeing.`
          ]
        },
        {
          heading: 'Guide style should match the traveler',
          body: [
            `Some guests want deep interpretation, some want a quiet host who handles timing and etiquette. Confirm this before the trip, because guide chemistry shapes the whole day.`
          ]
        }
      ]
    },
    {
      heading: 'Designer notes before you book',
      body: [
        `Confirm the hotel location, transfer duration and guide style before comparing prices. These details decide whether ${seed.destination} feels seamless or tiring, and they are harder to fix once deposits and flights are locked.`,
        `If this article matches your travel mood, use it as a starting brief. A travel designer can refine hotels, flight logic and special access around your dates, pace and occasion.`
      ],
      bullets: [
        'Ask for a day-by-day route with realistic transfer windows',
        'Check where meals, rest time and hotel arrivals sit in the flow',
        'Keep the final itinerary calm enough that a weather change does not break it'
      ],
      subsections: [
        {
          heading: 'What a strong proposal should show',
          body: [
            `The proposal should explain why each base is chosen, how long transfers take and where the route can flex. If those answers are vague, the trip may depend too much on luck.`
          ]
        },
        {
          heading: 'When to customize further',
          body: [
            `Customize further if you are celebrating, traveling with children, managing dietary needs or combining ${seed.destination} with another country. Those details change the pace more than the headline route suggests.`
          ]
        }
      ]
    }
  ];
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function paragraphsToHtml(paragraphs: string[]) {
  return paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
}

function bulletsToHtml(bullets?: string[]) {
  return bullets?.length ? `<ul>${bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>` : '';
}

function tableToHtml(table?: BlogArticleTable) {
  if (!table?.rows.length) return '';
  const rows = table.rows.map((row) => (
    `<tr><td>${escapeHtml(row.label)}</td><td>${escapeHtml(row.bestFor)}</td><td>${escapeHtml(row.watchOut)}</td></tr>`
  )).join('');
  return `<h3>${escapeHtml(table.heading)}</h3><table><thead><tr><th>Decision</th><th>Best for</th><th>Watch before booking</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function sectionsToHtml(sections: BlogArticleSection[]) {
  return sections.map((section) => {
    const body = paragraphsToHtml(section.body);
    const bullets = bulletsToHtml(section.bullets);
    const subsections = section.subsections?.map((subsection) => (
      `<h3>${escapeHtml(subsection.heading)}</h3>${paragraphsToHtml(subsection.body)}${bulletsToHtml(subsection.bullets)}`
    )).join('') ?? '';
    return `<h2>${escapeHtml(section.heading)}</h2>${body}${bullets}${subsections}${tableToHtml(section.table)}`;
  }).join('');
}

export const generatedBlogPosts: CmsItem[] = destinationSeeds.flatMap((seed, seedIndex) => {
  const templates = anglePairs[seedIndex % anglePairs.length];
  return templates.map((template, variant) => {
    const index = seedIndex * 2 + variant;
    const title = formatTitle(template, seed.destination);
    const featuredImage = takeUniqueBlogImage(seed, index * 2);
    const detailImage = takeUniqueBlogImage(seed, index * 2 + 1);
    const sections = makeSections(title, seed, variant, detailImage);
    const publishedAt = publishingDates[index % publishingDates.length];
    const category = variant === 0 ? seed.country === 'Multi Country' ? 'Multi Country' : `${seed.country} Guide` : seed.highlights[0].includes('food') ? 'Culture & Cuisine' : 'Travel Tips';

    return {
      id: `blog-${slugify(title)}`,
      type: 'post',
      title,
      slug: slugify(title),
      excerpt: articleIntro(title, seed),
      content: sectionsToHtml(sections),
      featuredImage: featuredImage.renderedUrl,
      meta: {
        seo: { title, description: articleIntro(title, seed) },
        details: {
          publishedAt,
          updatedAt: publishedAt,
          category,
          author: 'Ha Long Luxury Travel Design Team',
          readTime: `${11 + (index % 5)} min read`,
          destination: seed.destination,
          tableOfContents: sections.flatMap((section) => [section.heading, ...(section.subsections?.map((subsection) => subsection.heading) ?? [])]),
          sections,
          heroCaption: `${seed.destination} planning inspiration for private luxury travel.`,
          sidebarCta: 'Travel without the stress',
          sidebarText: 'A personal travel designer can turn this idea into a polished private itinerary.'
        }
      }
    };
  });
});

export const generatedBlogPostCount = generatedBlogPosts.length;
