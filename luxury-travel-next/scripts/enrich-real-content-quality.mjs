#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';
import { getImageMetadata, isFourKLike } from './media-dimension-utils.mjs';

const prisma = new PrismaClient();
const rootDir = process.cwd();

function assertLocalDatabase() {
  const url = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null;
  if (!url) throw new Error('DATABASE_URL is required.');
  if (!['localhost', '127.0.0.1'].includes(url.hostname)) {
    throw new Error(`Refusing non-local DATABASE_URL host: ${url.hostname}`);
  }
}

function article(title, blocks) {
  return blocks.map((block) => {
    if (block.type === 'h2') return `<h2>${block.text}</h2>`;
    if (block.type === 'ul') return `<ul>${block.items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
    return `<p>${block.text}</p>`;
  }).join('');
}

function jsonSnapshot(value) {
  return JSON.parse(JSON.stringify(value));
}

function slugText(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function hashString(value) {
  let hash = 0;
  for (const char of String(value || '')) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  return Math.abs(hash);
}

function readLegalImagePools() {
  const filePath = path.join(rootDir, 'data/legal-tour-landmark-images.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const pools = new Map();
  for (const [key, images] of Object.entries(data)) {
    const valid = (Array.isArray(images) ? images : []).filter((image) => {
      const width = Number(image.width || 0);
      const height = Number(image.height || 0);
      return image.url && (width >= 3840 || height >= 2160);
    });
    if (valid.length) pools.set(key, valid.map((image) => ({ ...image, key })));
  }
  return pools;
}

const countryImageKeys = {
  vietnam: ['ha-long-bay', 'hanoi', 'hoi-an', 'hue', 'ninh-binh', 'sapa', 'mekong-delta', 'da-nang', 'phu-quoc'],
  thailand: ['bangkok', 'chiang-mai', 'phuket', 'krabi', 'koh-samui', 'ayutthaya'],
  cambodia: ['angkor', 'siem-reap', 'phnom-penh'],
  laos: ['luang-prabang', 'kuang-si', 'vang-vieng', 'vientiane'],
  myanmar: ['bagan', 'yangon', 'inle-lake', 'mandalay'],
  indonesia: ['phuket', 'krabi', 'koh-samui'],
  malaysia: ['bangkok', 'phuket', 'krabi'],
  singapore: ['bangkok', 'hanoi'],
  philippines: ['phuket', 'krabi', 'koh-samui'],
  china: ['hanoi', 'hue'],
  japan: ['hanoi', 'hue'],
  'south-korea': ['hanoi', 'hoi-an'],
  bhutan: ['sapa', 'luang-prabang'],
  nepal: ['sapa', 'ninh-binh'],
  india: ['hanoi', 'angkor'],
  'sri-lanka': ['phu-quoc', 'krabi'],
  'multi-country': ['ha-long-bay', 'angkor', 'luang-prabang', 'bangkok', 'hoi-an', 'mekong-delta']
};

const placeKeyAliases = [
  ['ha long', 'ha-long-bay'],
  ['halong', 'ha-long-bay'],
  ['hanoi', 'hanoi'],
  ['ha noi', 'hanoi'],
  ['hoi an', 'hoi-an'],
  ['hue', 'hue'],
  ['ninh binh', 'ninh-binh'],
  ['sapa', 'sapa'],
  ['sa pa', 'sapa'],
  ['mekong', 'mekong-delta'],
  ['da nang', 'da-nang'],
  ['phu quoc', 'phu-quoc'],
  ['bangkok', 'bangkok'],
  ['chiang mai', 'chiang-mai'],
  ['phuket', 'phuket'],
  ['krabi', 'krabi'],
  ['samui', 'koh-samui'],
  ['ayutthaya', 'ayutthaya'],
  ['angkor', 'angkor'],
  ['siem reap', 'siem-reap'],
  ['phnom penh', 'phnom-penh'],
  ['luang prabang', 'luang-prabang'],
  ['kuang si', 'kuang-si'],
  ['vang vieng', 'vang-vieng'],
  ['vientiane', 'vientiane'],
  ['bagan', 'bagan'],
  ['yangon', 'yangon'],
  ['inle', 'inle-lake'],
  ['mandalay', 'mandalay']
];

function rawMeta(post) {
  const raw = post.meta.find((entry) => entry.key === '_mirror_raw')?.value;
  return raw && typeof raw === 'object' ? raw : {};
}

function likelyKeysForPost(post, pools) {
  const raw = rawMeta(post);
  const haystack = slugText(`${post.slug} ${post.title} ${raw.country || ''} ${raw.countryLabel || ''} ${raw.sourceDestinationKey || ''} ${(raw.places || []).join(' ')}`);
  const aliasKeys = placeKeyAliases.filter(([needle]) => haystack.includes(needle)).map(([, key]) => key);
  const directKeys = Array.from(pools.keys()).filter((key) => haystack.includes(key.replace(/-/g, ' ')));
  const country = slugText(raw.country || raw.sourceDestinationKey || raw.countryLabel || '').replace(/\s+/g, '-');
  return [...new Set([...aliasKeys, ...directKeys, ...(countryImageKeys[country] || countryImageKeys['multi-country'])])].filter((key) => pools.has(key));
}

function pickLegalImage(post, pools) {
  const keys = likelyKeysForPost(post, pools);
  const key = keys[0] || Array.from(pools.keys())[hashString(post.slug) % pools.size];
  const pool = pools.get(key) || Array.from(pools.values()).flat();
  return pool[0];
}

const blogEnrichment = {
  'why-vietnam-feels-safe-for-private-asia-travel': {
    excerpt: 'Calm cities, warm hospitality, private drivers and smart routing make Vietnam feel clear, supported and comfortable for first-time and returning Asia travelers.',
    content: article('Why Vietnam Feels Safe for Private Asia Travel', [
      { text: 'Vietnam feels safe for private Asia travel when the trip is designed around clear routing, trusted local hosts and comfortable hotel zones. The country has lively cities and busy streets, but a private plan turns that energy into something understandable: hotel pickup, local context, reliable transfers and daily pacing that avoids unnecessary stress.' },
      { text: 'For many travelers, the confidence comes from practical details. A good guide explains how to cross old streets, where to eat comfortably, when traffic is easier and which neighborhoods work best after dark. A private driver removes the pressure of finding transport between hotels, airports, heritage areas and dinner reservations.' },
      { type: 'h2', text: 'Why Vietnam works well for careful private planning' },
      { text: 'Vietnam also suits first-time Asia travelers because the main route can be kept simple. Hanoi, Ha Long Bay, Ninh Binh, Hoi An, Hue, Ho Chi Minh City and the Mekong Delta can be arranged in a logical north-to-south or south-to-north flow. That gives guests a strong sense of progression without too many awkward travel days.' },
      { text: 'The safest-feeling itineraries usually protect the first arrival day, use central hotels, avoid late road transfers and keep one flexible pocket for weather, appetite or a guide recommendation. This is especially helpful for families, older guests and couples who want culture without fatigue.' },
      { type: 'ul', items: ['Use hotels in walkable central zones for easier evenings.', 'Keep private transfers for airport, cruise and countryside days.', 'Start city touring early, then leave space for lunch and rest.', 'Use local hosts for food, markets and neighborhood walks.'] },
      { type: 'h2', text: 'Best route style for confidence' },
      { text: 'A confident Vietnam route is not the longest one. It is the route with the least friction. Pair Hanoi with Ha Long Bay and Ninh Binh, then continue to Hoi An or Hue before ending in Ho Chi Minh City or the Mekong. Each place should have a clear purpose, not just a name on the map.' },
      { text: 'When the trip is built this way, Vietnam feels warm, legible and well supported. Travelers still experience real streets, food culture and local life, but the hard logistics sit quietly in the background.' }
    ])
  },
  'how-to-plan-a-first-trip-to-thailand-in-7-steps': {
    excerpt: 'A calm seven-step Thailand planning guide covering Bangkok, northern culture, island choices, hotel zones, private transfers and the right pace for a polished first trip.',
    content: article('How to Plan a First Trip to Thailand in 7 Steps', [
      { text: 'A strong first trip to Thailand starts with restraint. Thailand offers temples, beaches, markets, food, islands and mountain culture, but a polished itinerary does not need everything at once. The best first journey usually combines Bangkok with one cultural region and one beach base, then protects enough time for recovery.' },
      { type: 'h2', text: 'Step 1: choose the trip shape' },
      { text: 'Decide whether the trip should feel cultural, beach-focused or balanced. A balanced route might use Bangkok for two or three nights, Chiang Mai for craft and temples, then Phuket, Krabi, Koh Samui or another island for a softer finish. Avoid changing hotels every two nights unless the purpose is very clear.' },
      { type: 'h2', text: 'Step 2: match season to region' },
      { text: 'Thailand is not one weather zone. Phuket and Krabi are strongest from November to April, while Koh Samui can be useful outside that window. Bangkok and Chiang Mai are best when heat and haze are manageable. A private designer should match beach choice to month before confirming flights.' },
      { type: 'h2', text: 'Step 3: make Bangkok easy' },
      { text: 'Bangkok rewards a smart base. Riverside hotels work beautifully for temples and boats, while other districts suit dining or shopping. Start major temples early, add a private longtail boat if the river matters, and save Chinatown or a refined Thai dinner for the evening.' },
      { type: 'ul', items: ['Keep arrival day light.', 'Use private airport transfers.', 'Do not stack Grand Palace, shopping, markets and dinner too tightly.', 'Book the beach at the end if the trip is celebratory.'] },
      { type: 'h2', text: 'Step 4-7: protect comfort' },
      { text: 'The final steps are about comfort: choose hotel zones by purpose, avoid awkward domestic flight times, reserve at least one unplanned beach day and use a private guide where context changes the experience. Thailand feels much more elegant when the route leaves space for heat, traffic and mood.' }
    ])
  },
  'best-food-recommendations-for-an-authentic-hanoi-tour': {
    excerpt: 'A practical Hanoi food guide for private tours, pairing pho, bun cha, market snacks, egg coffee and family-run kitchens with timing, comfort and local context.',
    content: article('Best Food Recommendations for an Authentic Hanoi Tour', [
      { text: 'An authentic Hanoi food tour is not only a tasting list. The best route explains why each dish belongs in a specific neighborhood, time of day and local rhythm. With a private host, food becomes a way to understand Hanoi rather than a series of rushed stops.' },
      { text: 'Start with comfort and appetite. A morning route can focus on pho, fresh rice rolls, market produce and coffee. An evening route can move through bun cha, grilled snacks, noodle shops and a softer final drink. The point is to balance texture, story and pace.' },
      { type: 'h2', text: 'Core dishes to include' },
      { text: 'Pho is the obvious starting point, but the bowl matters less than the context. A good guide can explain broth style, herbs, lime, chili and the difference between neighborhood shops. Bun cha is another strong anchor because it connects grilled pork, herbs, dipping sauce and the rhythm of a local lunch.' },
      { text: 'Egg coffee works best as a pause, not a novelty. Place it between market walking and the next savory stop so the day has a natural break. If guests want a deeper route, add banh cuon, bun thang, cha ca or seasonal street snacks.' },
      { type: 'ul', items: ['Choose fewer stops and sit properly where the dish deserves time.', 'Avoid arrival night if guests may be tired.', 'Use a local host for translation, hygiene judgment and story.', 'Balance street kitchens with one refined or family-run table.'] },
      { type: 'h2', text: 'Private-tour pacing' },
      { text: 'The food route should fit the larger Hanoi day. If the morning already includes temples and museums, keep lunch simple and comfortable. If food is the main event, start later and give the Old Quarter enough time. For families, add familiar breaks and avoid too many standing-only counters.' },
      { text: 'A well-designed Hanoi food tour feels generous, not overloaded. Guests leave with favorite dishes, neighborhood memory and enough confidence to keep exploring the city on their own.' }
    ])
  },
  'best-time-to-visit-vietnam': {
    excerpt: 'Season-by-season planning notes for a refined Vietnam holiday, with route ideas for Hanoi, Ha Long Bay, Hoi An, Hue, the Mekong and beach extensions.',
    content: article('Best Time to Visit Vietnam in Style', [
      { text: 'The best time to visit Vietnam depends on the route. Vietnam stretches across several climate zones, so a stylish journey is less about finding one perfect month and more about matching each region to the right season, hotel style and daily rhythm.' },
      { text: 'For a classic first journey, October to April is often the easiest planning window. Hanoi, Ninh Binh and Ha Long Bay feel cooler, central Vietnam can be beautiful outside heavy rain periods, and the south usually works well for city touring and Mekong travel.' },
      { type: 'h2', text: 'Northern Vietnam' },
      { text: 'Hanoi, Ninh Binh, Ha Long Bay and Sapa are strongest when the air is cooler and visibility is stable. October, November, March and April can be especially attractive. Winter may be misty in Ha Long Bay, but that can also create beautiful atmosphere if cruise expectations are set correctly.' },
      { type: 'h2', text: 'Central Vietnam' },
      { text: 'Hoi An, Hue and Da Nang need more careful timing. February to August often works well, while late-year storms can affect beach days and transfers. For travelers who care about culture more than beach time, central Vietnam can still be rewarding with the right hotel and flexible guiding.' },
      { type: 'h2', text: 'Southern Vietnam' },
      { text: 'Ho Chi Minh City and the Mekong Delta are warm year-round. December to April is usually the clearest and easiest period. During wetter months, private touring can still work if the day starts early and includes indoor or shaded stops.' },
      { type: 'ul', items: ['Use October to April for a comfortable first Vietnam route.', 'Choose February to August for stronger central-coast beach logic.', 'Avoid building a trip around one weather promise.', 'Let hotels and private transfers absorb seasonal friction.'] },
      { text: 'A refined Vietnam trip protects mood as much as weather. The right season helps, but route order, guide quality, hotel location and transfer timing matter just as much.' }
    ])
  },
  'luxury-indochina-routing-guide': {
    excerpt: 'Smart ways to connect Vietnam, Cambodia, Laos and Thailand with cleaner flights, calmer pacing and stronger cultural contrast.',
    content: article('How to Route a Luxury Indochina Journey', [
      { text: 'A luxury Indochina journey should feel like one composed story, not four countries stitched together by flights. Vietnam, Cambodia, Laos and Thailand all pair beautifully, but only when the route protects energy and gives each place a clear role.' },
      { text: 'Start by choosing the emotional arc. Vietnam can provide city life, coastline and countryside. Cambodia brings Angkor and powerful heritage. Laos slows the rhythm around Luang Prabang and the Mekong. Thailand can add temples, food, river hotels or a polished beach ending.' },
      { type: 'h2', text: 'Classic first-time route' },
      { text: 'A strong first route is Hanoi, Ha Long Bay, Hoi An or Hue, Siem Reap and Luang Prabang, with Bangkok or a Thai beach only if time allows. This gives contrast without too many border crossings. Keep at least three nights for Siem Reap if Angkor matters.' },
      { type: 'h2', text: 'When to add Thailand' },
      { text: 'Thailand is best added when the trip needs a major international gateway, a food-focused city break or a beach finish. Do not add Bangkok only because it is famous; add it because it improves flight logic, hotel quality or the traveler’s preferred pace.' },
      { type: 'ul', items: ['Use flights to simplify, not to collect more countries.', 'Keep Luang Prabang as a slow middle or soft finish.', 'Protect Angkor from being squeezed between travel days.', 'End with beach time only when the season supports it.'] },
      { type: 'h2', text: 'Luxury routing rule' },
      { text: 'The best rule is simple: every stop must earn its place. If a city repeats the same role as another stop, remove it or extend the stronger destination. A cleaner Indochina route creates better memories because travelers are not always packing, flying or recovering.' }
    ])
  },
  'best-hanoi-city-tour-luxury-guide': {
    excerpt: 'A detailed Hanoi city tour guide for travelers who want the classic highlights, Old Quarter texture, refined food stops and private luxury pacing in one graceful day.',
    content: article('Best Hanoi City Tour: A Luxury Guide to Culture, Food and Elegant Pacing', [
      { text: 'A strong Hanoi city tour is not only a list of landmarks. It is a carefully paced day that balances Hoan Kiem Lake, the Old Quarter, heritage sites, food culture, coffee rituals and enough quiet space to enjoy the city in comfort.' },
      { text: 'This guide turns the classic Hanoi city tour into a more polished private experience, with better timing, softer transfers, beautiful photo moments and refined breaks between the busy streets.' },
      { type: 'h2', text: 'What makes Hanoi worth a full private day' },
      { text: 'Hanoi compresses history, food, architecture and daily life into a compact but intense urban core. Hoan Kiem Lake, the Temple of Literature, the Old Quarter, the French Quarter and local markets all matter, but the experience depends on order and pacing.' },
      { text: 'For luxury travelers, the goal should be understanding rather than coverage. A good route puts the most cultural stops in the morning, uses private transfers for wider districts and leaves the Old Quarter for slow walking when the atmosphere is strongest.' },
      { type: 'ul', items: ['Begin around Hoan Kiem Lake or a heritage site.', 'Use a private guide who can explain layers without rushing.', 'Place food and coffee as comfort pauses, not side notes.', 'Keep one flexible window for photography or shopping.'] },
      { type: 'h2', text: 'Best one-day rhythm' },
      { text: 'Start early with the lake, a temple or a historic district. Continue to the Temple of Literature or another heritage anchor before lunch. Use the afternoon for the Old Quarter, coffee, architecture and a lighter local stop. End with dinner, water puppets or a refined cocktail if energy allows.' },
      { text: 'Hanoi rewards patience. With the right pacing, the city becomes elegant: shaded courtyards, narrow lanes, family kitchens, balconies, lake reflections and streets that feel more atmospheric once the day stops trying to do too much.' }
    ])
  }
};

async function enrichBlogs(adminId) {
  let updated = 0;
  for (const [slug, value] of Object.entries(blogEnrichment)) {
    const post = await prisma.post.findUnique({ where: { postType_slug: { postType: 'POST', slug } } });
    if (!post) continue;
    await prisma.revision.create({
      data: {
        entityType: 'POST',
        postId: post.id,
        title: post.title,
        snapshot: jsonSnapshot(post),
        authorId: adminId
      }
    });
    await prisma.post.update({
      where: { id: post.id },
      data: {
        excerpt: value.excerpt,
        content: value.content,
        seoDescription: value.excerpt
      }
    });
    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'real_blog_quality_enrich',
        entityType: 'Post',
        entityId: post.id,
        before: jsonSnapshot(post),
        after: { slug, excerpt: value.excerpt, contentLength: value.content.length },
        metadata: { source: 'current-public-blog-quality-gap' }
      }
    });
    updated += 1;
  }
  return updated;
}

async function enrichMedia() {
  const media = await prisma.media.findMany({ where: { kind: 'IMAGE' }, include: { meta: true } });
  let updatedRows = 0;
  let metaRows = 0;
  let fourK = 0;
  for (const item of media) {
    const metadata = getImageMetadata(item.url, rootDir);
    if (isFourKLike(metadata)) fourK += 1;
    if (metadata.width || metadata.height) {
      const nextWidth = item.width || metadata.width;
      const nextHeight = item.height || metadata.height;
      if (nextWidth !== item.width || nextHeight !== item.height) {
        await prisma.media.update({
          where: { id: item.id },
          data: {
            width: nextWidth,
            height: nextHeight
          }
        });
        updatedRows += 1;
      }
    }
    await prisma.mediaMeta.upsert({
      where: { mediaId_key: { mediaId: item.id, key: '_image_quality' } },
      update: {
        value: {
          width: metadata.width,
          height: metadata.height,
          fourKLike: isFourKLike(metadata),
          provider: metadata.provider,
          sourceUrl: metadata.sourceUrl,
          license: metadata.license,
          dimensionSource: metadata.dimensionSource,
          auditedAt: new Date().toISOString()
        }
      },
      create: {
        mediaId: item.id,
        key: '_image_quality',
        value: {
          width: metadata.width,
          height: metadata.height,
          fourKLike: isFourKLike(metadata),
          provider: metadata.provider,
          sourceUrl: metadata.sourceUrl,
          license: metadata.license,
          dimensionSource: metadata.dimensionSource,
          auditedAt: new Date().toISOString()
        }
      }
    });
    metaRows += 1;
  }
  return { totalImages: media.length, updatedRows, metaRows, fourK };
}

async function ensureMediaForLegalImage(image, adminId) {
  const existing = await prisma.media.findUnique({ where: { url: image.url } });
  const data = {
    fileName: decodeURIComponent(image.url.split(/[?#]/)[0].split('/').filter(Boolean).pop() || `tour-image-${Date.now()}.jpg`),
    originalName: decodeURIComponent(image.url.split(/[?#]/)[0].split('/').filter(Boolean).pop() || `tour-image-${Date.now()}.jpg`),
    mimeType: /\.png$/i.test(image.url) ? 'image/png' : /\.webp$/i.test(image.url) ? 'image/webp' : 'image/jpeg',
    kind: 'IMAGE',
    size: 0,
    width: Number(image.width || 3840),
    height: Number(image.height || 2160),
    altText: image.alt || 'Luxury tour destination image',
    caption: image.provider ? `${image.provider} source-backed 4K tour image` : 'Source-backed 4K tour image',
    description: image.sourceUrl || '',
    authorId: adminId
  };
  const media = existing
    ? await prisma.media.update({ where: { id: existing.id }, data: { width: data.width, height: data.height, altText: existing.altText || data.altText, caption: existing.caption || data.caption, description: existing.description || data.description } })
    : await prisma.media.create({ data: { ...data, url: image.url } });

  await prisma.mediaMeta.upsert({
    where: { mediaId_key: { mediaId: media.id, key: '_image_quality' } },
    update: { value: { width: data.width, height: data.height, fourKLike: true, provider: image.provider || '', sourceUrl: image.sourceUrl || '', license: image.license || '', dimensionSource: 'legal-tour-landmark-images', auditedAt: new Date().toISOString() } },
    create: { mediaId: media.id, key: '_image_quality', value: { width: data.width, height: data.height, fourKLike: true, provider: image.provider || '', sourceUrl: image.sourceUrl || '', license: image.license || '', dimensionSource: 'legal-tour-landmark-images', auditedAt: new Date().toISOString() } }
  });
  await prisma.mediaMeta.upsert({
    where: { mediaId_key: { mediaId: media.id, key: '_mirror_media_source' } },
    update: { value: { originalSource: image.sourceUrl || image.url, mirrorSource: 'legal-source-backed-4k-upgrade', provider: image.provider || '', license: image.license || '', key: image.key || '' } },
    create: { mediaId: media.id, key: '_mirror_media_source', value: { originalSource: image.sourceUrl || image.url, mirrorSource: 'legal-source-backed-4k-upgrade', provider: image.provider || '', license: image.license || '', key: image.key || '' } }
  });
  return media;
}

async function upgradeTourFeaturedImages(adminId) {
  const pools = readLegalImagePools();
  const tours = await prisma.post.findMany({
    where: { postType: 'TOUR' },
    include: {
      featuredImage: true,
      meta: { select: { key: true, value: true } }
    }
  });
  let upgraded = 0;
  const samples = [];
  for (const post of tours) {
    const current = post.featuredImage;
    const currentQuality = getImageMetadata(current?.url || '', rootDir);
    const currentIsFourK = current && (Number(current.width || 0) >= 3840 || Number(current.height || 0) >= 2160 || isFourKLike(currentQuality));
    const alreadyUpgraded = post.meta.some((entry) => entry.key === '_featured_image_quality_upgrade');
    if (currentIsFourK && !alreadyUpgraded) continue;
    const legalImage = pickLegalImage(post, pools);
    if (!legalImage?.url) continue;
    if (current?.url === legalImage.url) continue;
    const nextMedia = await ensureMediaForLegalImage(legalImage, adminId);
    await prisma.postMeta.upsert({
      where: { postId_key: { postId: post.id, key: '_original_featured_image' } },
      update: { value: { url: current?.url || '', mediaId: current?.id || null, preservedAt: new Date().toISOString() } },
      create: { postId: post.id, key: '_original_featured_image', value: { url: current?.url || '', mediaId: current?.id || null, preservedAt: new Date().toISOString() } }
    });
    await prisma.postMeta.upsert({
      where: { postId_key: { postId: post.id, key: '_featured_image_quality_upgrade' } },
      update: { value: { from: current?.url || '', to: legalImage.url, width: legalImage.width, height: legalImage.height, provider: legalImage.provider || '', sourceUrl: legalImage.sourceUrl || '', upgradedAt: new Date().toISOString() } },
      create: { postId: post.id, key: '_featured_image_quality_upgrade', value: { from: current?.url || '', to: legalImage.url, width: legalImage.width, height: legalImage.height, provider: legalImage.provider || '', sourceUrl: legalImage.sourceUrl || '', upgradedAt: new Date().toISOString() } }
    });
    await prisma.post.update({ where: { id: post.id }, data: { featuredImageId: nextMedia.id } });
    await prisma.postMedia.createMany({
      data: [{ postId: post.id, mediaId: nextMedia.id, role: 'featured-quality-upgrade', sortOrder: -1 }],
      skipDuplicates: true
    });
    upgraded += 1;
    if (samples.length < 20) samples.push({ slug: post.slug, from: current?.url || '', to: legalImage.url });
  }
  await prisma.auditLog.create({
    data: {
      actorId: adminId,
      action: 'real_tour_featured_image_quality_upgrade',
      entityType: 'Tour',
      metadata: { upgraded, samples }
    }
  });
  return { upgraded, samples };
}

async function main() {
  assertLocalDatabase();
  const admin = await prisma.user.findFirst({ where: { role: { key: 'ADMINISTRATOR' }, status: 'ACTIVE' }, orderBy: { createdAt: 'asc' } });
  if (!admin) throw new Error('No active administrator user found.');
  const blogUpdates = await enrichBlogs(admin.id);
  const mediaUpdates = await enrichMedia();
  const tourImageUpdates = await upgradeTourFeaturedImages(admin.id);
  const mediaUpdatesAfterTourUpgrade = await enrichMedia();
  console.log(JSON.stringify({ blogUpdates, mediaUpdates, tourImageUpdates, mediaUpdatesAfterTourUpgrade }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
