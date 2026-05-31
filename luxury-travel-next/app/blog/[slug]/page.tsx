import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, CalendarDays, Clock3 } from 'lucide-react';
import { getContent, getSingle } from '@/lib/cms';
import { pageMetadata } from '@/lib/seo';
import { Container } from '@/components/layout/container';
import { CmsItem } from '@/lib/types';
import { shouldBypassNextImageOptimization } from '@/lib/image-delivery';
import { BlogRail } from '@/components/blog/blog-rail';
import type { BlogArticleSection, BlogArticleSubsection, BlogArticleTable } from '@/lib/blog-library';

type BlogSection = BlogArticleSection;

type TocChildItem = {
  id: string;
  heading: string;
  summary: string;
  index: number;
};

type TocItem = TocChildItem & {
  children?: TocChildItem[];
};

export const revalidate = 300;
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getSingle('posts', slug);
  return pageMetadata(post);
}

function detailString(post: CmsItem, key: string, fallback: string) {
  const value = post.meta.details?.[key];
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
}

function parseSubsections(value: unknown): BlogArticleSubsection[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((subsection): BlogArticleSubsection[] => {
    if (!isRecord(subsection) || typeof subsection.heading !== 'string') return [];
    const body = stringArray(subsection.body);
    return [{
      heading: subsection.heading,
      body: body.length ? body : [],
      bullets: stringArray(subsection.bullets)
    }];
  }).filter((subsection) => subsection.body.length || subsection.bullets?.length);
}

function parseTable(value: unknown): BlogArticleTable | undefined {
  if (!isRecord(value) || typeof value.heading !== 'string' || !Array.isArray(value.rows)) return undefined;
  const rows = value.rows.flatMap((row): BlogArticleTable['rows'] => {
    if (!isRecord(row) || typeof row.label !== 'string' || typeof row.bestFor !== 'string' || typeof row.watchOut !== 'string') return [];
    return [{ label: row.label, bestFor: row.bestFor, watchOut: row.watchOut }];
  });

  return rows.length ? { heading: value.heading, rows } : undefined;
}

function slugForHeading(value: string, index: number) {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return slug || `section-${index + 1}`;
}

function slugForSubheading(parentId: string, value: string, childIndex: number) {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${parentId}-${slug || `detail-${childIndex + 1}`}`;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function firstSentence(value: string) {
  const cleaned = value.replace(/\s+/g, ' ').trim();
  const match = cleaned.match(/^.+?[.!?](?:\s|$)/);
  return match ? match[0].trim() : cleaned;
}

function shortSnippet(value: string, maxLength = 86) {
  const cleaned = value.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength - 1).trimEnd()}...`;
}

function sectionSummary(section: BlogSection) {
  const heading = section.heading.toLowerCase();
  if (heading.includes('guide')) return 'Start with the brief.';
  if (heading.includes('route') || heading.includes('pacing')) return 'Balance route and pacing.';
  if (heading.includes('timing') || heading.includes('season')) return 'Choose the calmest window.';
  if (heading.includes('book')) return 'Check hotels and transfers.';

  const source = section.body[0] ?? section.bullets?.[0] ?? section.heading;
  return shortSnippet(firstSentence(source), 44);
}

function subsectionSummary(subsection: BlogArticleSubsection) {
  const source = subsection.body[0] ?? subsection.bullets?.[0] ?? subsection.heading;
  return shortSnippet(firstSentence(source), 38);
}

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function sectionWordCount(section: BlogSection) {
  const sectionWords = [
    section.heading,
    ...section.body,
    ...(section.bullets ?? []),
    ...(section.subsections ?? []).flatMap((subsection) => [subsection.heading, ...subsection.body, ...(subsection.bullets ?? [])]),
    ...(section.table ? [section.table.heading, ...section.table.rows.flatMap((row) => [row.label, row.bestFor, row.watchOut])] : [])
  ];
  return sectionWords.reduce((total, value) => total + countWords(value), 0);
}

function estimatedReadTime(post: CmsItem, sections: BlogSection[]) {
  const words = countWords(stripHtml(post.excerpt)) + sections.reduce((total, section) => total + sectionWordCount(section), 0);
  return `${Math.max(11, Math.ceil(words / 185))} min read`;
}

type FallbackBlogProfile = {
  destination: string;
  country: string;
  route: string;
  season: string;
  mood: string;
  highlights: string[];
};

function fallbackBlogProfile(post: CmsItem): FallbackBlogProfile {
  const title = post.title.toLowerCase();

  if (title.includes('hanoi') || title.includes('food')) {
    return {
      destination: 'Hanoi',
      country: 'Vietnam',
      route: 'Old Quarter kitchens, market lanes, family-run tables, egg coffee stops and a calmer dinner finish',
      season: 'October to April for cooler walking weather, with early evenings reserved ahead on busy dates',
      mood: 'street food texture with private cultural context',
      highlights: ['Balance pho, bun cha, banh cuon and egg coffee without rushing', 'Use a local host who can explain etiquette and neighborhood timing', 'Keep one refined dinner or cafe stop for contrast']
    };
  }

  if (title.includes('thailand')) {
    return {
      destination: 'Thailand',
      country: 'Thailand',
      route: 'Bangkok for 3-4 days, Chiang Mai or Chiang Rai for northern culture (3 days), then Phuket or Koh Samui for beach recovery (4-5 days), with flexible connections via domestic flights',
      season: 'November to February for optimal weather across regions, avoiding March-April humidity in the north and May-October rains in the south',
      mood: 'vibrant temples, street food adventures, boutique hotels, and serene beach retreats with authentic local connections',
      highlights: ['Start with Bangkok\'s energy but limit to 3-4 days to avoid overload', 'Choose one northern base (Chiang Mai) for culture or skip to beaches for relaxation', 'Book domestic flights early and protect beach time from travel fatigue', 'Focus on family-run restaurants and quiet temple visits over tourist crowds']
    };
  }

  if (title.includes('indochina')) {
    return {
      destination: 'Indochina',
      country: 'Multi Country',
      route: 'Vietnam, Cambodia, Laos and Thailand connected by clean regional flights',
      season: 'November to March for the smoothest multi-country weather window',
      mood: 'many cultural layers shaped into one calm private route',
      highlights: ['Use flights where overland travel steals too much time', 'Give Angkor and Luang Prabang enough nights to breathe', 'End with a softer city, river or beach finish']
    };
  }

  if (title.includes('vietnam')) {
    return {
      destination: 'Vietnam',
      country: 'Vietnam',
      route: 'Hanoi, Ha Long Bay, Hue, Hoi An, Saigon and the Mekong shaped by regional weather',
      season: 'October to April for north and central comfort, with coastal checks for summer and shoulder months',
      mood: 'heritage cities, cuisine, limestone scenery and private transfer ease',
      highlights: ['Build the route by region instead of chasing one perfect national season', 'Use central hotels and private drivers for calmer city days', 'Leave a flexible pocket for weather, food and river timing']
    };
  }

  return {
    destination: detailString(post, 'destination', detailString(post, 'category', 'This journey')),
    country: detailString(post, 'category', 'Southeast Asia'),
    route: 'arrival, signature experiences, private transfers, hotel recovery and a softer final day',
    season: 'the most comfortable season for the route, with one flexible day kept open',
    mood: 'private travel with calm pacing and clear decisions',
    highlights: ['Choose the hotel base before adding more sightseeing', 'Keep transfer days light and realistic', 'Confirm guide style, meal timing and backup support']
  };
}

function fallbackSections(post: CmsItem): BlogSection[] {
  const title = post.title.toLowerCase();
  if (title.includes('thailand')) {
    return [
      {
        heading: 'Step 1: Choose Your Thailand Focus',
        body: [
          'Thailand offers incredible diversity - from bustling Bangkok to serene islands. For a first trip, focus on 2-3 regions to avoid feeling rushed. Most travelers combine Bangkok\'s urban energy with either northern culture (Chiang Mai) or southern beaches (Phuket/Koh Samui).',
          'Consider your interests: temples and history point north, while relaxation and water activities suggest the islands. Family travelers often prefer beach-focused itineraries, while couples might enjoy the cultural depth of Chiang Mai.'
        ],
        bullets: [
          'Bangkok: Urban temples, street food, shopping - perfect for 3-4 days',
          'Northern Thailand: Chiang Mai\'s temples, hill tribes, cooler weather',
          'Southern Islands: Phuket or Koh Samui for beaches, diving, and recovery',
          'Avoid trying to see everything - quality over quantity'
        ],
        subsections: [
          {
            heading: 'Bangkok as your starting point',
            body: ['Most international flights arrive in Bangkok. Use it as a gateway city rather than a full destination. Focus on key temples like Wat Arun and Wat Phra Kaew, plus one authentic street food experience.']
          },
          {
            heading: 'Northern vs Southern decision',
            body: ['If you want culture and cooler weather, choose Chiang Mai. For beaches and relaxation, head south. Both offer incredible experiences but require different pacing.']
          }
        ]
      },
      {
        heading: 'Step 2: Plan the Best Time to Visit',
        body: [
          'Thailand\'s weather varies dramatically by region and season. The "best" time depends on your chosen destinations. November to February offers optimal conditions across most of Thailand, with clear skies and comfortable temperatures.',
          'Avoid the hot season (March-May) in the north and rainy season (May-October) in the south. Peak tourist season means higher prices and crowds, but also more flight options.'
        ],
        bullets: [
          'November-February: Ideal for north and south, cooler temperatures',
          'March-April: Hot and humid in north, still good for beaches',
          'May-October: Rainy in south, but fewer crowds and lower prices',
          'Check regional weather - Chiang Mai and islands have different patterns'
        ],
        subsections: [
          {
            heading: 'Seasonal considerations',
            body: ['Northern Thailand is most comfortable November-March. Southern beaches are best December-April. Plan around these windows for the best experience.']
          },
          {
            heading: 'Crowd and price impact',
            body: ['High season (Dec-Feb) brings more tourists but also more services. Shoulder seasons offer better deals and fewer people at popular sites.']
          }
        ]
      },
      {
        heading: 'Step 3: Design Your Itinerary',
        body: [
          'A successful Thailand itinerary balances activity with recovery. Plan for 10-14 days to do justice to your chosen regions. Include buffer time for unexpected delays and spontaneous discoveries.',
          'Structure your days with morning activities, afternoon relaxation, and evening cultural experiences. Leave one flexible day for weather changes or extended stays in favorite spots.'
        ],
        bullets: [
          '10-14 days: Bangkok (3-4), North/South (4-5), Beach (4-5)',
          'Include domestic flights between regions',
          'Build in rest days and flexible timing',
          'Consider travel fatigue between regions'
        ],
        subsections: [
          {
            heading: 'Sample 12-day itinerary',
            body: ['Days 1-4: Bangkok arrival and exploration. Days 5-8: Chiang Mai temples and culture. Days 9-12: Phuket beach recovery. Adjust based on your focus.']
          },
          {
            heading: 'Pacing for different travelers',
            body: ['Families need more beach time and fewer temples. Couples might prefer romantic dinners and spa days. Solo travelers can handle more intensive cultural schedules.']
          }
        ]
      },
      {
        heading: 'Step 4: Select Accommodations',
        body: [
          'Thailand offers everything from budget guesthouses to luxury resorts. For a first trip, prioritize location and comfort over price. Boutique hotels in central locations often provide the best value.',
          'Book directly with hotels or through reputable platforms. Consider airport transfers and any special requests (pool access, spa facilities) when choosing.'
        ],
        bullets: [
          'Bangkok: Riverside or central business district locations',
          'Chiang Mai: Old city center for walking access',
          'Phuket: Beachfront or hilltop villas with views',
          'Look for hotels with pools, especially in hot weather'
        ],
        subsections: [
          {
            heading: 'Hotel location matters',
            body: ['A great hotel in the wrong location means wasted time in traffic. Research walking distances to key attractions and transportation options.']
          },
          {
            heading: 'Booking considerations',
            body: ['Book popular hotels 2-3 months ahead during peak season. Check for free cancellation policies and read recent reviews for current service quality.']
          }
        ]
      },
      {
        heading: 'Step 5: Arrange Transportation',
        body: [
          'Getting around Thailand is straightforward but requires planning. International flights arrive in Bangkok, then domestic flights connect regions. Private transfers offer comfort and convenience.',
          'Book domestic flights early, especially during peak season. Consider the timing of flights to maximize daylight hours at your destinations.'
        ],
        bullets: [
          'International: Fly into Bangkok (BKK)',
          'Domestic: Bangkok Airways or Thai Airways between regions',
          'Private transfers: Airport pickups and inter-city travel',
          'Tuk-tuks and Grab for local city transport'
        ],
        subsections: [
          {
            heading: 'Flight timing strategy',
            body: ['Schedule domestic flights for morning departures to arrive with full days ahead. Avoid late afternoon flights that waste precious time.']
          },
          {
            heading: 'Ground transportation',
            body: ['Private drivers offer comfort and English-speaking service. For budget travel, Grab (Thailand\'s Uber) works well in cities.']
          }
        ]
      },
      {
        heading: 'Step 6: Prepare for Culture and Practicalities',
        body: [
          'Thailand\'s culture emphasizes respect and mindfulness. Learn basic greetings, dress modestly for temples, and remove shoes when entering homes. The people are incredibly welcoming.',
          'Practical preparations include visa requirements, health considerations, and local customs. Most visitors need a visa exemption or e-visa for stays up to 30 days.'
        ],
        bullets: [
          'Respect: Dress modestly, remove shoes, use right hand for giving/receiving',
          'Language: "Sawadee" for hello, "Khop khun" for thank you',
          'Temples: Cover shoulders and knees, women should wear skirts',
          'Tipping: 20-50 THB for small services, more for guides'
        ],
        subsections: [
          {
            heading: 'Health and safety',
            body: ['Stay hydrated, use sunscreen, and consider travel insurance. Mosquito repellent is essential. Medical facilities are good in tourist areas.']
          },
          {
            heading: 'Money and payments',
            body: ['ATMs are widespread. Credit cards accepted at most hotels and restaurants. Carry some cash (THB) for markets and small purchases.']
          }
        ]
      },
      {
        heading: 'Step 7: Pack Smart and Final Tips',
        body: [
          'Pack light but prepare for Thailand\'s tropical climate. Layering is key for air-conditioned temples and hot streets. Comfortable walking shoes are essential for exploring.',
          'Include swimwear for beaches, light cover-ups for temples, and versatile clothing that can transition from day to evening.'
        ],
        bullets: [
          'Clothing: Light, breathable fabrics, modest temple wear',
          'Essentials: Sunscreen, hat, comfortable walking shoes',
          'Electronics: Adapters for Type C/F plugs, portable charger',
          'Documents: Passport copies, travel insurance, visa if needed'
        ],
        subsections: [
          {
            heading: 'Weather-appropriate packing',
            body: ['Pack for heat and humidity. Quick-dry fabrics, moisture-wicking clothing, and light layers work best. Include rain gear if traveling in wet season.']
          },
          {
            heading: 'Last-minute checklist',
            body: ['Confirm all bookings, check weather forecasts, download offline maps, and ensure you have emergency contact numbers for your destinations.']
          }
        ]
      }
    ];
  }

  const profile = fallbackBlogProfile(post);
  const intro = stripHtml(post.content) || post.excerpt;
  const table: BlogArticleTable = {
    heading: `${profile.destination} planning table`,
    rows: [
      { label: 'Route spine', bestFor: profile.route, watchOut: 'Do not add extra stops until the transfer logic is clear.' },
      { label: 'Best timing', bestFor: profile.season, watchOut: 'Peak periods need earlier hotel holds and softer daily pacing.' },
      { label: 'Private guide', bestFor: profile.mood, watchOut: 'Guide style should match your preferred balance of stories, food and quiet time.' },
      { label: 'Comfort check', bestFor: profile.highlights[0] ?? 'A calmer trip with fewer rushed decisions.', watchOut: 'Check hotel zone, meal timing and driver plan together before booking.' }
    ]
  };

  return [
    {
      heading: 'How to use this guide',
      body: [
        intro,
        `Read this as a planning brief for ${profile.destination}, not as a fixed package. The goal is to turn the article into a route that feels personal, spacious and easy to operate on the ground.`
      ],
      bullets: profile.highlights,
      subsections: [
        {
          heading: 'Start with the travel feeling',
          body: [`The first decision is the mood: ${profile.mood}. Once that is clear, it becomes easier to choose the right hotel zone, guide style, meal timing and daily intensity.`]
        },
        {
          heading: 'Decide what does not need to be included',
          body: ['A polished private journey is not the longest possible list. Skip ideas that repeat the same purpose, create awkward transfers or reduce time around the experience that matters most.']
        }
      ]
    },
    {
      heading: 'Route and pacing notes',
      body: [
        `A strong version of this trip can follow ${profile.route}. The order should make the day easier for the traveler, not just efficient on paper.`,
        'A polished private journey should feel calm before it feels full. Build the most important cultural moments into the best part of the day, then leave softer time for meals, hotel recovery and local wandering.'
      ],
      image: post.featuredImage || undefined,
      imageAlt: post.title,
      caption: 'Editorial travel image selected for this private journey guide.',
      table,
      subsections: [
        {
          heading: 'Protect the first full day',
          body: ['The first full day sets the tone for the trip. Avoid a late start followed by heavy sightseeing. Use a clear anchor, a confident guide and an easy evening so the traveler feels settled.']
        },
        {
          heading: 'Treat transfers as part of the design',
          body: ['If the route includes flights, cruises or long drives, those transitions need comfort, timing and recovery built in. A short scenic pause or calm lunch can make the transfer feel intentional.']
        }
      ]
    },
    {
      heading: 'Big decisions before small details',
      body: [
        `For ${profile.destination}, the big decisions are season, route order, hotel base and how much private guiding you want. Small details only become useful after those choices are stable.`,
        'This is where many trips become crowded. Travelers compare restaurants, side trips and photo stops before they know where they are sleeping or how long the transfer actually takes.'
      ],
      bullets: [
        profile.highlights[0] ?? 'Choose the hotel base before adding more sightseeing',
        profile.highlights[1] ?? 'Keep transfer days light and realistic',
        profile.highlights[2] ?? 'Confirm guide style, meal timing and backup support'
      ],
      subsections: [
        {
          heading: 'Choose the base first',
          body: ['Hotel location shapes the whole day. A beautiful property can still be wrong if it adds repeated traffic, awkward dinner transfers or a difficult start time.']
        },
        {
          heading: 'Then choose the daily anchor',
          body: ['Each day needs one clear anchor. Meals, walks, shopping, spa time and extra stops should support that anchor rather than compete with it.']
        }
      ]
    },
    {
      heading: 'Season, reservations and daily flow',
      body: [
        `${profile.season}. Even in the best season, the itinerary should include one flexible pocket for weather, local recommendations or traveler energy.`,
        'Reservations matter most when a meal, guide, boat, viewpoint or hotel experience is part of the emotional reason for the trip. Hold those pieces early, then build the lighter details around them.'
      ],
      subsections: [
        {
          heading: 'Use the best hours carefully',
          body: ['The most atmospheric experience should sit in the best hour of the day. That may mean early morning markets, softer afternoon light, a sunset on the water or a dinner after proper recovery time.']
        },
        {
          heading: 'Avoid three hard days in a row',
          body: ['Stacking early starts, long drives and heavy sightseeing creates fatigue even in beautiful places. Alternate intensity so the trip keeps its sense of ease.']
        }
      ]
    },
    {
      heading: 'Comfort details that make it feel private',
      body: [
        'Private travel feels different when small details are handled before the guest has to ask: luggage timing, driver pickup points, restaurant arrival, guide pace and backup options when weather changes.',
        `For ${profile.country}, these details are especially important because the destination can feel very different depending on heat, traffic, language, crowds and how confidently the day is hosted.`
      ],
      subsections: [
        {
          heading: 'Guide style should be chosen, not assumed',
          body: ['Some travelers want deep cultural interpretation. Others want a warm host who keeps the day moving and steps back during private moments. Confirm the style before the trip begins.']
        },
        {
          heading: 'Meals need their own pacing',
          body: ['A special meal after a heavy transfer rarely lands well. Put expressive food experiences after a calmer day, and use lighter stops when the schedule is already full.']
        }
      ]
    },
    {
      heading: 'Before you book',
      body: [
        'Check the season, hotel location, guide style and transfer route together. A beautiful property can still feel wrong if it adds too much friction to the day.',
        'For high-touch trips, ask your travel designer to explain why each stop earns its place in the itinerary and where the route can flex if timing changes.'
      ],
      bullets: ['Confirm transfer windows, not just distances', 'Review hotel zone against each day of the route', 'Ask where the buffers, meals and backup plans sit'],
      subsections: [
        {
          heading: 'What a strong proposal should show',
          body: ['A strong proposal explains the route logic, the expected transfer time, the role of each guide and the reason each hotel was chosen. If those answers are clear, the trip is much easier to trust.']
        },
        {
          heading: 'When to customize further',
          body: ['Customize further for families, honeymoons, dietary needs, mobility limits, photography goals or multi-country routes. Those details change the pace more than the headline itinerary suggests.']
        }
      ]
    }
  ];
}

function getSections(post: CmsItem): BlogSection[] {
  const rawSections = post.meta.details?.sections;
  if (!Array.isArray(rawSections)) return fallbackSections(post);

  const sections = rawSections.flatMap((section): BlogSection[] => {
    if (!isRecord(section) || typeof section.heading !== 'string') return [];
    const body = stringArray(section.body);
    return [{
      heading: section.heading,
      body: body.length ? body : [post.excerpt],
      bullets: stringArray(section.bullets),
      subsections: parseSubsections(section.subsections),
      table: parseTable(section.table),
      image: typeof section.image === 'string' ? section.image : undefined,
      imageAlt: typeof section.imageAlt === 'string' ? section.imageAlt : section.heading,
      caption: typeof section.caption === 'string' ? section.caption : undefined
    }];
  });

  return sections.length ? sections : fallbackSections(post);
}

function articlePath(post: CmsItem) {
  return `/blog/${post.slug}/`;
}

function PlanningTable({ table }: { table: BlogArticleTable }) {
  return (
    <section className="mt-12 border-y border-navy/10 py-8">
      <div className="grid gap-[12px] md:grid-cols-[180px_minmax(0,1fr)] md:gap-8">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-dark">Planning table</p>
        <h3 className="max-w-[32ch] text-[24px] font-black leading-[1.12] tracking-[-0.045em] text-navy md:text-[30px]">
          {table.heading}
        </h3>
      </div>

      <div className="mt-6 grid gap-[18px] md:hidden">
        {table.rows.map((row) => (
          <article key={`${row.label}-${row.bestFor}`} className="border-t border-navy/10 pt-[18px] first:border-t-0 first:pt-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gold-dark">{row.label}</p>
            <p className="mt-[10px] text-[14px] font-bold leading-7 text-navy/74">{row.bestFor}</p>
            <p className="mt-[8px] text-[13px] font-semibold leading-6 text-navy/54">{row.watchOut}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 hidden md:block">
        <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/48">
              <th scope="col" className="w-[22%] border-b border-navy/15 py-4 pr-6">Decision</th>
              <th scope="col" className="w-[40%] border-b border-navy/15 px-6 py-4">Best for</th>
              <th scope="col" className="border-b border-navy/15 py-4 pl-6">Watch before booking</th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={`${row.label}-${row.bestFor}`} className="align-top text-[15px] font-semibold leading-[1.72] text-navy/68">
                <th scope="row" className="border-b border-navy/8 py-[20px] pr-6 text-[12px] font-black uppercase tracking-[0.16em] text-gold-dark">
                  {row.label}
                </th>
                <td className="border-b border-navy/8 px-6 py-[20px]">{row.bestFor}</td>
                <td className="border-b border-navy/8 py-[20px] pl-6 text-navy/58">{row.watchOut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function BlogDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, posts] = await Promise.all([getSingle('posts', slug), getContent('posts')]);
  if (!post) notFound();

  const sections = getSections(post);
  const tocItems: TocItem[] = sections.map((section, index) => {
    const id = slugForHeading(section.heading, index);
    return {
      id,
      heading: section.heading,
      summary: sectionSummary(section),
      index,
      children: section.subsections?.map((subsection, childIndex) => ({
        id: slugForSubheading(id, subsection.heading, childIndex),
        heading: subsection.heading,
        summary: subsectionSummary(subsection),
        index: childIndex
      }))
    };
  });
  const subsectionCount = sections.reduce((total, section) => total + (section.subsections?.length ?? 0), 0);
  const tableCount = sections.filter((section) => section.table).length;
  const category = detailString(post, 'category', 'Travel Guide');
  const publishedAt = detailString(post, 'publishedAt', 'Updated travel guide');
  const updatedAt = detailString(post, 'updatedAt', publishedAt);
  const readTime = detailString(post, 'readTime', estimatedReadTime(post, sections));
  const author = detailString(post, 'author', 'Ha Long Luxury Travel Design Team');
  const sidebarCta = detailString(post, 'sidebarCta', 'Travel without the stress');
  const rawSidebarText = detailString(post, 'sidebarText', 'A personal travel designer can check hotel base, transfer time, and the right order of experiences before you book.');
  const sidebarText = rawSidebarText.includes('polished private itinerary') ? 'We check hotel base, transfer time and the right order of experiences before you book.' : rawSidebarText;
  const related = posts.filter((item) => item.slug !== post.slug && detailString(item, 'category', '') === category).slice(0, 3);
  const fallbackRelated = related.length ? related : posts.filter((item) => item.slug !== post.slug).slice(0, 3);
  const briefLead = firstSentence(post.excerpt);
  const briefNote = detailString(post, 'briefNote', 'Route flow, hotel placement and transfer timing are the three decisions that shape the whole trip.');
  const planningPoints = [
    { label: 'Base', text: detailString(post, 'planningPoint1', 'Pick the hotel zone first.') },
    { label: 'Timing', text: detailString(post, 'planningPoint2', 'Keep transfer days light.') },
    { label: 'Pace', text: detailString(post, 'planningPoint3', 'Leave one flexible buffer.') }
  ];

  return (
    <main className="bg-[linear-gradient(180deg,#f6f1e7_0%,#f4ecdf_100%)] text-navy">
      <section className="blog-detail-hero relative isolate overflow-hidden bg-[linear-gradient(180deg,#0b1b2b_0%,#10251f_72%,#f6f1e7_72%,#f6f1e7_100%)] pb-10 pt-[124px] text-ivory md:pt-[140px]">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[72%] bg-[radial-gradient(circle_at_12%_5%,rgba(200,169,106,0.20),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(248,245,239,0.10),transparent_28%)]" />
        <Container width="page" className="relative">
          <nav aria-label="Article breadcrumb" className="inline-flex flex-wrap items-center gap-[10px] rounded-full border border-ivory/14 bg-ivory/[0.06] px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-ivory/72 shadow-[0_12px_34px_rgba(0,0,0,0.14)]">
            <Link href="/" className="transition hover:text-gold">Home</Link>
            <span className="text-gold/70">/</span>
            <Link href="/blog/" className="transition hover:text-gold">Blog</Link>
            <span className="text-gold/70">/</span>
            <span className="text-ivory">{category}</span>
          </nav>

          <div className="hero-image-plate relative mt-8 min-h-[610px] overflow-hidden rounded-[38px] bg-navy shadow-[0_38px_110px_rgba(0,0,0,0.34)] ring-1 ring-ivory/12 md:min-h-[620px] md:rounded-[52px]">
            <Image src={post.featuredImage} alt={post.title} fill priority sizes="100vw" quality={94} unoptimized={shouldBypassNextImageOptimization(post.featuredImage)} className="object-cover brightness-[0.96] saturate-[1.08]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,21,31,0.96)_0%,rgba(11,30,32,0.88)_42%,rgba(11,30,32,0.48)_70%,rgba(11,30,32,0.16)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,21,31,0.22)_0%,rgba(8,21,31,0.02)_38%,rgba(8,21,31,0.74)_100%)]" />

            <div className="relative z-10 flex min-h-[610px] max-w-[900px] flex-col justify-center p-[clamp(24px,4.6vw,72px)] md:min-h-[620px]">
              <div>
                <div className="inline-flex flex-wrap items-center gap-1 rounded-full border border-ivory/35 bg-ivory p-1 text-navy shadow-[0_16px_38px_rgba(0,0,0,0.18)]">
                  <span className="inline-flex min-h-[30px] items-center rounded-full bg-gold px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-navy">
                    Article dossier
                  </span>
                  <span className="inline-flex min-h-[30px] items-center px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-navy/66">
                    {category}
                  </span>
                </div>
                <h1 className="mt-8 max-w-[820px] font-serif text-[clamp(40px,5.8vw,82px)] font-semibold leading-[0.96] tracking-[-0.06em] text-ivory drop-shadow-[0_18px_44px_rgba(0,0,0,0.26)]">
                  {post.title}
                </h1>
                <p className="mt-7 max-w-[660px] text-[17px] font-semibold leading-[1.78] tracking-[-0.018em] text-ivory/82 md:text-[20px]">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-10 max-w-[820px] overflow-hidden rounded-[28px] bg-ivory text-navy shadow-[0_24px_70px_rgba(0,0,0,0.22)] ring-1 ring-ivory/40">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy/10 px-6 py-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.26em] text-gold-dark">Reading compass</p>
                  <p className="max-w-[340px] truncate text-[10px] font-black uppercase tracking-[0.18em] text-navy/45">{author}</p>
                </div>
                <div className="grid divide-y divide-navy/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                  <div className="px-6 py-4">
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-navy/50">
                      <CalendarDays className="h-4 w-4 text-gold-dark" />
                      Published
                    </span>
                    <span className="mt-2 block text-[14px] font-black leading-6 text-navy">{publishedAt}</span>
                  </div>
                  <div className="px-6 py-4">
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-navy/50">
                      <Clock3 className="h-4 w-4 text-gold-dark" />
                      Reading
                    </span>
                    <span className="mt-2 block text-[14px] font-black leading-6 text-navy">{readTime}</span>
                  </div>
                  <div className="px-6 py-4">
                    <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-navy/50">Taste path</span>
                    <span className="mt-2 block text-[14px] font-black leading-6 text-navy">Markets and family tables</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="relative pb-32 pt-10 md:pt-16">
        <Container width="page">
          <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-[56px]">
            <BlogRail items={tocItems} title={post.title} />

            <article className="min-w-0 xl:max-w-[940px]">
              <div className="border-b border-navy/10 pb-10 md:pb-12">
                <div className="flex items-center gap-[12px]">
                  <span className="h-px w-8 bg-gold/60" />
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-gold-dark">Article brief</p>
                </div>
                <p className="mt-[20px] max-w-[62ch] font-serif text-[clamp(23px,2.35vw,32px)] leading-[1.52] tracking-[-0.04em] text-navy/90">
                  {briefLead}
                </p>
                <p className="mt-[22px] max-w-[68ch] text-[16px] font-semibold leading-[1.9] tracking-[-0.015em] text-navy/60">
                  {briefNote}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-[12px] border-t border-navy/10 pt-[20px] text-[10px] font-black uppercase tracking-[0.22em] text-gold-dark">
                  <span>{sections.length} sections</span>
                  <span className="text-navy/25">/</span>
                  <span>{subsectionCount} sub notes</span>
                  <span className="text-navy/25">/</span>
                  <span>{tableCount} tables</span>
                  <span className="text-navy/25">/</span>
                  <span>Last updated {updatedAt}</span>
                </div>
              </div>

              <div className="mt-[72px] space-y-[56px] md:space-y-16">
                {sections.map((section, index) => {
                  const sectionId = tocItems[index]?.id ?? slugForHeading(section.heading, index);
                  const chapterLabel = String(index + 1).padStart(2, '0');
                  return (
                    <section key={section.heading} id={sectionId} className="scroll-mt-[156px] border-t border-navy/10 pt-[56px] md:pt-16">
                      <header className="grid gap-6 md:grid-cols-[150px_minmax(0,1fr)] md:items-start">
                        <div className="flex items-center gap-[12px] md:block">
                          <span className="text-[11px] font-black uppercase tracking-[0.22em] text-gold-dark">
                            Chapter {chapterLabel}
                          </span>
                          <span className="h-px flex-1 bg-gold/35 md:mt-[20px] md:block md:w-12" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-dark">Major section</p>
                          <h2 className="mt-4 max-w-[18ch] font-serif text-[clamp(34px,3.35vw,54px)] font-semibold leading-[1.06] tracking-[-0.055em] text-navy">
                            {section.heading}
                          </h2>
                          <p className="mt-[20px] max-w-[56ch] text-[14px] font-extrabold leading-7 tracking-[-0.015em] text-navy/48 md:text-[15px]">
                            {tocItems[index]?.summary ?? sectionSummary(section)}
                          </p>
                        </div>
                      </header>

                      <div className="mt-10 md:ml-[150px]">
                        <div className="space-y-6">
                          {section.body.map((paragraph) => (
                            <p key={paragraph} className="max-w-[70ch] text-[17px] font-medium leading-[1.95] tracking-[-0.015em] text-navy/74 md:text-[18px]">
                              {paragraph}
                            </p>
                          ))}
                        </div>

                        {section.bullets?.length ? (
                          <div className="mt-10 border-y border-navy/10 py-[28px]">
                            <div className="flex flex-wrap items-center gap-[14px]">
                              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-gold-dark">Field notes</p>
                              <span className="h-px min-w-[44px] flex-1 bg-gold/25" />
                            </div>
                            <ul className="mt-[20px] grid gap-[14px] md:gap-[16px]">
                              {section.bullets.map((bullet) => (
                                <li key={bullet} className="grid grid-cols-[18px_minmax(0,1fr)] gap-[14px] text-[15px] font-semibold leading-[1.8] text-navy/76 md:text-[16px]">
                                  <span className="mt-[0.75rem] h-[6px] w-[6px] rounded-full bg-gold-dark" aria-hidden="true" />
                                  <span className="max-w-[68ch] pt-[2px]">{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}

                        {section.table ? <PlanningTable table={section.table} /> : null}

                        {section.subsections?.length ? (
                          <div className="mt-[48px] border-y border-navy/10 py-8">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-gold-dark">Details in this chapter</p>
                                <p className="mt-2 text-[13px] font-semibold leading-6 text-navy/48">Read these smaller notes after the main route decision.</p>
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-gold-dark">
                                {section.subsections.length} notes
                              </span>
                            </div>
                            <div className="mt-6 divide-y divide-navy/10">
                              {section.subsections.map((subsection, childIndex) => {
                                const childId = tocItems[index]?.children?.[childIndex]?.id ?? slugForSubheading(sectionId, subsection.heading, childIndex);
                                return (
                                  <section key={subsection.heading} id={childId} className="scroll-mt-[156px] px-[20px] py-[28px] md:grid md:grid-cols-[132px_minmax(0,1fr)] md:gap-8 md:px-[28px] md:py-8">
                                    <div className="mb-4 flex items-center gap-[12px] md:mb-0 md:block md:pt-1">
                                      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-gold-dark">
                                        Detail {String(childIndex + 1).padStart(2, '0')}
                                      </span>
                                      <span className="h-px flex-1 bg-navy/10 md:mt-4 md:block md:w-10" />
                                    </div>
                                    <div>
                                      <h3 className="max-w-[34ch] text-[24px] font-black leading-[1.12] tracking-[-0.045em] text-navy md:text-[30px]">
                                        {subsection.heading}
                                      </h3>
                                      <div className="mt-[18px] space-y-[18px]">
                                        {subsection.body.map((paragraph) => (
                                          <p key={`${subsection.heading}-${paragraph}`} className="max-w-[68ch] text-[15px] font-medium leading-[1.92] tracking-[-0.012em] text-navy/68 md:text-[16px]">
                                            {paragraph}
                                          </p>
                                        ))}
                                      </div>
                                      {subsection.bullets?.length ? (
                                        <ul className="mt-6 grid gap-[12px]">
                                          {subsection.bullets.map((bullet) => (
                                            <li key={`${subsection.heading}-${bullet}`} className="flex gap-[12px] text-[14px] font-semibold leading-7 text-navy/66">
                                              <span className="mt-[0.65rem] h-[5px] w-[5px] shrink-0 rounded-full bg-gold-dark" />
                                              <span className="max-w-[66ch]">{bullet}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      ) : null}
                                    </div>
                                  </section>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}

                        {section.image ? (
                          <figure className="mt-12 border-y border-navy/10 py-[20px]">
                            <div className="relative h-[320px] overflow-hidden rounded-[28px] md:h-[500px]">
                              <Image src={section.image} alt={section.imageAlt ?? section.heading} fill sizes="(min-width: 1280px) 820px, 100vw" quality={92} unoptimized={shouldBypassNextImageOptimization(section.image)} className="object-cover" />
                            </div>
                            {section.caption ? <figcaption className="pt-4 text-[12px] font-semibold italic leading-5 text-navy/48">{section.caption}</figcaption> : null}
                          </figure>
                        ) : null}
                      </div>
                    </section>
                  );
                })}
              </div>
            </article>

            <aside className="min-w-0 lg:col-start-2 xl:max-w-[940px]">
              <div className="overflow-hidden rounded-[34px] border border-navy/10 bg-[linear-gradient(180deg,#081827_0%,#112238_100%)] p-[28px] text-ivory shadow-[0_22px_60px_rgba(11,27,43,0.18)]">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-gold">Planning note</p>
                <p className="mt-[20px] max-w-[16ch] text-[23px] font-black leading-[1.18] tracking-[-0.045em]">{sidebarCta}</p>
                <p className="mt-[20px] text-[15px] font-semibold leading-[1.85] text-ivory/72">{sidebarText}</p>
                <div className="mt-[28px] divide-y divide-ivory/10 border-y border-ivory/10">
                  {planningPoints.map((point) => (
                    <div key={point.label} className="grid grid-cols-[64px_minmax(0,1fr)] gap-4 py-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-gold">{point.label}</span>
                      <span className="text-[13px] font-semibold leading-6 text-ivory/72">{point.text}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <Link href="/customize-your-trip/" className="inline-flex min-h-[56px] w-full items-center justify-center rounded-full bg-gold px-6 text-center text-[11px] font-black uppercase tracking-[0.18em] text-navy shadow-[0_18px_30px_rgba(0,0,0,0.16)] transition duration-300 ease-luxe hover:-translate-y-0.5 hover:bg-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70">
                    Request a free quote
                  </Link>
                </div>
              </div>

              <div className="mt-6 rounded-[34px] border border-navy/10 bg-[#fbf7ed] p-6 shadow-[0_18px_46px_rgba(11,27,43,0.07)]">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-gold-dark">More to read</p>
                <div className="mt-[20px] grid gap-[12px]">
                  {fallbackRelated.map((item) => (
                    <Link key={item.slug} href={articlePath(item)} className="group block rounded-[24px] border border-navy/10 bg-[#fffaf1] px-4 py-4 transition duration-300 ease-luxe hover:-translate-y-0.5 hover:border-gold/30 hover:bg-ivory">
                      <span className="block text-[15px] font-black leading-[1.45] tracking-[-0.035em] text-navy transition group-hover:text-gold-dark">{item.title}</span>
                      <span className="mt-[12px] flex items-center justify-between gap-[12px] text-[10px] font-black uppercase tracking-[0.17em] text-gold-dark">
                        <span>
                          {detailString(item, 'category', 'Travel guide')}
                          <span className="mx-2 text-navy/25">/</span>
                          {detailString(item, 'readTime', 'Read')}
                        </span>
                        <ArrowUpRight className="h-[14px] w-[14px] shrink-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </main>
  );
}

