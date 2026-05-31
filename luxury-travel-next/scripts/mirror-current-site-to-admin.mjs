#!/usr/bin/env node
import fs from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import * as ts from 'typescript';
import { PrismaClient, Prisma } from '@prisma/client';
import { getImageMetadata } from './media-dimension-utils.mjs';

const prisma = new PrismaClient();
const nodeRequire = createRequire(import.meta.url);
const rootDir = process.cwd();
const moduleCache = new Map();
const refreshExisting = process.argv.includes('--refresh-existing');
const forceDraftMirror = process.argv.includes('--admin-draft-mirror');
const reportDir = path.join(rootDir, '.local-logs');

function log(message) {
  console.log(`[mirror] ${message}`);
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `item-${Date.now()}`;
}

function tryResolveFile(basePath) {
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    `${basePath}.mjs`,
    `${basePath}.json`,
    path.join(basePath, 'index.ts'),
    path.join(basePath, 'index.tsx'),
    path.join(basePath, 'index.js'),
    path.join(basePath, 'index.json')
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function resolveModulePath(specifier, parentDir) {
  if (specifier.startsWith('@/')) {
    const resolved = tryResolveFile(path.join(rootDir, specifier.slice(2)));
    if (resolved) return resolved;
  }
  if (specifier.startsWith('.') || specifier.startsWith('/')) {
    const resolved = tryResolveFile(path.resolve(parentDir, specifier));
    if (resolved) return resolved;
  }
  return null;
}

function loadModule(filePath) {
  const resolvedPath = path.resolve(filePath);
  if (moduleCache.has(resolvedPath)) return moduleCache.get(resolvedPath);

  if (resolvedPath.endsWith('.json')) {
    const parsed = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
    moduleCache.set(resolvedPath, parsed);
    return parsed;
  }

  if (!resolvedPath.endsWith('.ts') && !resolvedPath.endsWith('.tsx') && !resolvedPath.endsWith('.js') && !resolvedPath.endsWith('.mjs')) {
    return nodeRequire(resolvedPath);
  }

  const source = fs.readFileSync(resolvedPath, 'utf8');
  const output = resolvedPath.endsWith('.tsx') || source.includes('jsx') || source.includes('<')
    ? ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        resolveJsonModule: true,
        jsx: ts.JsxEmit.ReactJSX
      },
      fileName: resolvedPath
    }).outputText
    : ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        resolveJsonModule: true
      },
      fileName: resolvedPath
    }).outputText;

  const loadedModule = { exports: {} };
  const dirname = path.dirname(resolvedPath);
  const localRequire = (specifier) => {
    const resolved = resolveModulePath(specifier, dirname);
    if (resolved) return loadModule(resolved);
    return nodeRequire(specifier);
  };

  const wrapped = new Function('exports', 'require', 'module', '__filename', '__dirname', output);
  wrapped(loadedModule.exports, localRequire, loadedModule, resolvedPath, dirname);
  moduleCache.set(resolvedPath, loadedModule.exports);
  return loadedModule.exports;
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function extractString(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function parseDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function toInputJson(value) {
  return plain(value);
}

function readItemMeta(item) {
  return isRecord(item.meta) ? item.meta : {};
}

function readDetails(item) {
  const meta = readItemMeta(item);
  return isRecord(meta.details) ? meta.details : {};
}

function readSeo(item) {
  const meta = readItemMeta(item);
  return isRecord(meta.seo) ? meta.seo : {};
}

function readGallery(item) {
  const meta = readItemMeta(item);
  return Array.isArray(meta.gallery) ? meta.gallery.filter((entry) => typeof entry === 'string' && entry.trim()) : [];
}

function readItinerary(item) {
  const meta = readItemMeta(item);
  return Array.isArray(meta.itinerary) ? meta.itinerary.filter(isRecord) : [];
}

function readPricing(item) {
  const meta = readItemMeta(item);
  return Array.isArray(meta.pricing) ? meta.pricing.filter(isRecord) : [];
}

function uniqueStrings(values) {
  return [...new Set(values.map((value) => extractString(value)).filter(Boolean))];
}

function deriveTags(item) {
  const details = readDetails(item);
  const seo = readSeo(item);
  const candidates = [
    details.country,
    details.category,
    details.style,
    details.theme,
    details.suitable,
    details.destination,
    seo.focusKeyword
  ];
  if (Array.isArray(details.highlights)) {
    candidates.push(...details.highlights.slice(0, 3));
  }
  return uniqueStrings(candidates).slice(0, 8);
}

function deriveCategory(item, fallbackLabel) {
  const details = readDetails(item);
  return extractString(details.category || details.country || fallbackLabel, fallbackLabel);
}

function currentMirrorTokens() {
  return {
    colors: {
      primary: '#0B1B2B',
      secondary: '#12323f',
      accent: '#C8A96A',
      background: '#F8F5EF',
      foreground: '#0B1B2B',
      muted: '#6d746f',
      border: '#ded3bc'
    },
    typography: {
      headingFont: '\'Playfair Display\', Georgia, serif',
      bodyFont: 'Manrope, Inter, sans-serif',
      baseSize: '16px',
      scaleRatio: '1.2',
      lineHeight: '1.65'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '40px',
      sectionY: '96px'
    },
    radius: {
      sm: '4px',
      md: '8px',
      lg: '22px',
      pill: '999px'
    },
    shadow: {
      sm: '0 2px 8px rgba(11,27,43,0.08)',
      md: '0 12px 28px rgba(11,27,43,0.12)',
      lg: '0 24px 60px rgba(11,27,43,0.16)',
      luxury: '0 30px 90px rgba(11,27,43,0.18)'
    }
  };
}

async function ensureAdminUser() {
  const admin = await prisma.user.findFirst({
    where: { role: { key: 'ADMINISTRATOR' } },
    include: { role: true },
    orderBy: { createdAt: 'asc' }
  });
  if (!admin) {
    throw new Error('No administrator user found. Run `npm run cms:seed` first.');
  }
  return admin;
}

async function upsertUserMeta(userId, key, value) {
  await prisma.userMeta.upsert({
    where: { userId_key: { userId, key } },
    update: { value: toInputJson(value) },
    create: { userId, key, value: toInputJson(value) }
  });
}

async function upsertMediaMeta(mediaId, key, value) {
  await prisma.mediaMeta.upsert({
    where: { mediaId_key: { mediaId, key } },
    update: { value: toInputJson(value) },
    create: { mediaId, key, value: toInputJson(value) }
  });
}

async function upsertCategoryMeta(categoryId, key, value) {
  await prisma.categoryMeta.upsert({
    where: { categoryId_key: { categoryId, key } },
    update: { value: toInputJson(value) },
    create: { categoryId, key, value: toInputJson(value) }
  });
}

async function upsertTagMeta(tagId, key, value) {
  await prisma.tagMeta.upsert({
    where: { tagId_key: { tagId, key } },
    update: { value: toInputJson(value) },
    create: { tagId, key, value: toInputJson(value) }
  });
}

async function saveAdminUserMirrorMeta(admin) {
  await upsertUserMeta(admin.id, '_admin_profile_source', {
    mirrorSource: 'current-public-output',
    role: admin.role?.key || 'ADMINISTRATOR',
    email: admin.email,
    username: admin.username,
    lastMirrorCheck: new Date().toISOString()
  });
}

async function createOptionIfMissing(key, value) {
  const existing = await prisma.option.findUnique({ where: { key } });
  if (existing) return { created: false, id: existing.id };
  const item = await prisma.option.create({
    data: { key, value: toInputJson(value), autoload: 'NO' }
  });
  return { created: true, id: item.id };
}

async function createDesignPresetIfMissing(adminId) {
  const slug = 'current-live-design-mirror';
  const existing = await prisma.designPreset.findUnique({ where: { slug } });
  if (existing) return { created: false, id: existing.id };
  const item = await prisma.designPreset.create({
    data: {
      name: 'Current Live Design Mirror',
      slug,
      status: 'DRAFT',
      tokens: toInputJson(currentMirrorTokens()),
      createdById: adminId,
      updatedById: adminId
    }
  });
  return { created: true, id: item.id };
}

async function ensureMediaByUrl(url, adminId, cache, altText = '', caption = '', description = '') {
  if (!url) return null;
  if (cache.has(url)) return cache.get(url);
  const existing = await prisma.media.findUnique({ where: { url } });
  if (existing) {
    cache.set(url, existing.id);
    return existing.id;
  }
  const fileName = decodeURIComponent(url.split(/[?#]/)[0].split('/').filter(Boolean).pop() || `media-${Date.now()}`);
  const mimeType = /\.(png)$/i.test(fileName)
    ? 'image/png'
    : /\.(webp)$/i.test(fileName)
      ? 'image/webp'
      : /\.(gif)$/i.test(fileName)
        ? 'image/gif'
        : /\.(svg)$/i.test(fileName)
          ? 'image/svg+xml'
          : /\.(mp4)$/i.test(fileName)
            ? 'video/mp4'
          : 'image/jpeg';
  const imageMetadata = getImageMetadata(url, rootDir);
  const item = await prisma.media.create({
    data: {
      fileName,
      originalName: fileName,
      mimeType,
      kind: mimeType.startsWith('image/') ? 'IMAGE' : mimeType.startsWith('video/') ? 'VIDEO' : 'OTHER',
      url,
      size: 0,
      ...(imageMetadata.width ? { width: imageMetadata.width } : {}),
      ...(imageMetadata.height ? { height: imageMetadata.height } : {}),
      altText,
      caption,
      description,
      authorId: adminId
    }
  });
  cache.set(url, item.id);
  return item.id;
}

async function ensureCategory(name, cache) {
  const value = extractString(name);
  if (!value) return null;
  const slug = slugify(value);
  if (cache.has(slug)) return cache.get(slug);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    cache.set(slug, existing.id);
    return existing.id;
  }
  const item = await prisma.category.create({
    data: { name: value, slug, description: value }
  });
  cache.set(slug, item.id);
  return item.id;
}

async function ensureTag(name, cache) {
  const value = extractString(name);
  if (!value) return null;
  const slug = slugify(value);
  if (cache.has(slug)) return cache.get(slug);
  const existing = await prisma.tag.findUnique({ where: { slug } });
  if (existing) {
    cache.set(slug, existing.id);
    return existing.id;
  }
  const item = await prisma.tag.create({
    data: { name: value, slug, description: value }
  });
  cache.set(slug, item.id);
  return item.id;
}

function buildMirrorMeta(item, sourceType, sourceCollection, sourceIndex) {
  return {
    _mirror_source: 'current-public-output',
    _mirror_source_type: sourceType,
    _mirror_source_collection: sourceCollection,
    _mirror_source_index: sourceIndex,
    _mirror_source_id: String(item.id),
    _mirror_source_slug: item.slug,
    _mirror_raw: toInputJson(item)
  };
}

const realPageMirrorCollections = new Set(['static-pages', 'trip-styles', 'hubs']);

function createStaticPageItem({ id, title, slug, excerpt, content, featuredImage = '', route, details = {} }) {
  return {
    id,
    type: 'hlt_static_page',
    title,
    slug,
    excerpt,
    content,
    featuredImage,
    meta: {
      seo: {
        title,
        description: excerpt,
        canonical: route
      },
      details: {
        route,
        ...details
      }
    }
  };
}

function buildStaticWebsitePages({ currentSiteContent, currentPosts, currentCruises, fallbackTestimonials, travelersTeam, memories, memoryPhotoTotal, bookingCatalogStats }) {
  const hero = currentSiteContent.home.hero;
  const navigation = currentSiteContent.navigation;
  const footer = currentSiteContent.footer;
  const firstTourChoiceImage = navigation.tourChoices.find((item) => item.image)?.image || '';
  const firstTripStyleImage = currentSiteContent.home.travelStyles?.items?.find((item) => item.image)?.image || '';
  const pageImages = {
    contact: firstTourChoiceImage || hero.image,
    customize: hero.image,
    faqs: firstTourChoiceImage || hero.image,
    payment: firstTourChoiceImage || hero.image,
    planningFlow: hero.image,
    privacySecurity: firstTripStyleImage || hero.image,
    terms: firstTripStyleImage || hero.image,
    travelStyles: firstTripStyleImage || hero.image,
    whyTravelWithUs: hero.image
  };
  const tourRoutes = navigation.tourChoices.map((item) => `${item.label}: ${item.href} - ${item.description || item.note}`).join('\n');
  const aboutRoutes = navigation.aboutChoices.map((item) => `${item.label}: ${item.href} - ${item.description || ''}`).join('\n');
  const cruiseTitles = currentCruises.map((item) => item.title).slice(0, 8).join(', ');
  const blogTitles = currentPosts.map((item) => item.title).slice(0, 12).join('\n');
  const teamLines = travelersTeam.map((member) => `${member.name} - ${member.role}. ${member.bio}`).join('\n\n');
  const memoryLines = memories.map((album) => `${album.label}: ${album.note}`).join('\n');
  const testimonialLines = fallbackTestimonials.map((item) => `${item.title}: ${item.excerpt}`).join('\n');

  return [
    createStaticPageItem({
      id: 'static-home',
      title: 'Homepage',
      slug: 'home',
      route: '/',
      excerpt: hero.subtitle,
      featuredImage: hero.image,
      content: [
        hero.eyebrow,
        hero.title,
        hero.subtitle,
        `Primary CTA: ${hero.primaryCta.label} (${hero.primaryCta.href})`,
        `Secondary CTA: ${hero.secondaryCta.label} (${hero.secondaryCta.href})`,
        `Hero images: ${hero.images.map((image) => image.src).join(', ')}`,
        `Homepage sections: ${currentSiteContent.home.sections.order.join(', ')}`,
        'Navigation:',
        tourRoutes,
        aboutRoutes,
        'Footer:',
        `${footer.contactHeading} - ${footer.phoneDisplay} - ${footer.email} - ${footer.address}`,
        'Testimonials:',
        testimonialLines
      ].join('\n\n'),
      details: { template: 'home-page', sectionOrder: currentSiteContent.home.sections.order }
    }),
    createStaticPageItem({
      id: 'static-blog',
      title: 'Luxury Travel Blog',
      slug: 'blog',
      route: '/blog/',
      excerpt: 'SEO travel guides for Southeast Asia luxury journeys.',
      featuredImage: currentPosts[0]?.featuredImage || '',
      content: `The public blog index lists current travel guides and links into DB/blog detail routes.\n\nCurrent mirrored guide titles:\n${blogTitles}`,
      details: { postCount: currentPosts.length }
    }),
    createStaticPageItem({
      id: 'static-blog-team',
      title: 'Meet the Vietnam Travelers Team',
      slug: 'blog-team',
      route: '/blog/team/',
      excerpt: 'Meet the Vietnam Travelers team and open each profile for the full bio and story.',
      featuredImage: travelersTeam[0]?.image || '',
      content: teamLines,
      details: { teamCount: travelersTeam.length, sourceUrl: 'https://vietnamtravelers.com/about-us-2/' }
    }),
    createStaticPageItem({
      id: 'static-contact',
      title: 'Contact Our Team',
      slug: 'contact',
      route: '/contact/',
      excerpt: 'Send a concise message with destination, dates and pace so the travel team can shape the route.',
      featuredImage: pageImages.contact,
      content: [
        'A concise message is enough. Tell us the destination, dates and pace you want, and our team will shape the route for you.',
        `Tel/WhatsApp/Viber: ${footer.phoneDisplay}`,
        `Email: ${footer.email}`,
        `Office: ${footer.address}`,
        'Planning details requested: Route ideas, Travel dates, Number of travelers, Hotel, cruise and pace.'
      ].join('\n\n'),
      details: { phoneHref: footer.phoneHref, email: footer.email, address: footer.address }
    }),
    createStaticPageItem({
      id: 'static-cruises',
      title: 'Luxury Cruises',
      slug: 'cruises',
      route: '/cruises/',
      excerpt: 'Ask our team for current Ha Long Bay, Lan Ha Bay and Mekong cruise options.',
      featuredImage: currentCruises[0]?.featuredImage || '',
      content: `Ask our team for current Ha Long Bay, Lan Ha Bay and Mekong cruise options.\n\nCurrent cruise catalog: ${cruiseTitles}`,
      details: { cruiseCount: currentCruises.length }
    }),
    createStaticPageItem({
      id: 'static-customize',
      title: 'Customize Your Trip',
      slug: 'customize-your-trip',
      route: '/customize-your-trip/',
      excerpt: 'Multi-step tailor-made luxury travel inquiry form.',
      featuredImage: pageImages.customize,
      content: [
        'Multi-step tailor-made luxury travel inquiry form.',
        'Selected destinations create recommended tour matches.',
        'The team can still advise the closest route if no catalog match appears.',
        'The flow collects destination, route, dates, duration, travelers, pace, style, budget, hotel, interests, support, notes, summary, recommended tours and contact.',
        `Booking catalog stats: ${JSON.stringify(bookingCatalogStats || {})}`
      ].join('\n\n'),
      details: { formSteps: 15, source: 'tailor-made-form' }
    }),
    createStaticPageItem({
      id: 'static-faqs',
      title: 'FAQs',
      slug: 'faqs',
      route: '/faqs/',
      excerpt: 'Answers to common questions about tailor-made luxury travel, private itineraries, deposits, hotels, guides and support.',
      featuredImage: pageImages.faqs,
      content: 'FAQ page covers tailor-made luxury travel, private itineraries, deposits, hotels, guides, visa questions, support and practical issue handling during travel.',
      details: { pageType: 'faq' }
    }),
    createStaticPageItem({
      id: 'static-guest-memory',
      title: 'Guest Memory',
      slug: 'guest-memory',
      route: '/guest-memory/',
      excerpt: 'Browse curated guest memory albums and sample travel imagery for private Southeast Asia journeys.',
      featuredImage: memories[0]?.cover || '',
      content: `Guest memory archive with ${memories.length} albums and ${memoryPhotoTotal} photos.\n\n${memoryLines}`,
      details: { albumCount: memories.length, photoCount: memoryPhotoTotal }
    }),
    createStaticPageItem({
      id: 'static-payment',
      title: 'Payment',
      slug: 'payment',
      route: '/payment/',
      excerpt: 'Secure payment handoff page for selected private journey options.',
      featuredImage: pageImages.payment,
      content: 'Payment page supports the booking flow after a selected tour is saved and the guest is ready for secure payment or team review.',
      details: { pageType: 'payment' }
    }),
    createStaticPageItem({
      id: 'static-planning-flow',
      title: 'Our Planning Flow',
      slug: 'planning-flow',
      route: '/planning-flow/',
      excerpt: 'See how a travel idea becomes a polished tailor-made itinerary.',
      featuredImage: pageImages.planningFlow,
      content: 'Planning flow explains how a travel idea becomes a polished private itinerary with route design, hotel matching, private transfers, final checks and support.',
      details: { pageType: 'about' }
    }),
    createStaticPageItem({
      id: 'static-privacy-security',
      title: 'Privacy & Security',
      slug: 'privacy-security',
      route: '/privacy-security/',
      excerpt: 'Privacy, data handling, marketing unsubscribe and travel-support security notes.',
      featuredImage: pageImages.privacySecurity,
      content: 'Privacy and security page explains personal data handling, marketing opt-out, direct contact options and how the team protects planning information.',
      details: { pageType: 'legal' }
    }),
    createStaticPageItem({
      id: 'static-terms',
      title: 'Terms & Conditions',
      slug: 'terms-and-conditions',
      route: '/terms-and-conditions/',
      excerpt: 'Booking terms, guest responsibilities, payment notes and in-travel issue handling.',
      featuredImage: pageImages.terms,
      content: 'Terms and conditions page explains booking responsibilities, travel services, payments, changes, cancellations and notifying the team quickly if an issue happens during travel.',
      details: { pageType: 'legal' }
    }),
    createStaticPageItem({
      id: 'static-travel-journal',
      title: 'Travel Journal',
      slug: 'travel-journal',
      route: '/travel-journal/',
      excerpt: 'Destination notes, route inspiration and seasonal travel ideas.',
      featuredImage: currentPosts[0]?.featuredImage || '',
      content: 'Travel Journal presents destination notes, route inspiration, seasonal travel ideas, atlas cues, theme copy and travel-planning dossiers for private Southeast Asia journeys.',
      details: { pageType: 'journal' }
    }),
    createStaticPageItem({
      id: 'static-travel-styles',
      title: 'Travel Styles',
      slug: 'travel-styles',
      route: '/travel-styles/',
      excerpt: 'Browse private journey styles from beach escapes and villas to culture, wellness, family, rail, golf and multi-country routes.',
      featuredImage: pageImages.travelStyles,
      content: 'Travel styles index presents the full style atlas used across the current website so travelers can choose the tone, duration and mood of a tailor-made journey.',
      details: { pageType: 'style-index' }
    }),
    createStaticPageItem({
      id: 'static-why-travel-with-us',
      title: 'Why Travel With Us',
      slug: 'why-travel-with-us',
      route: '/why-travel-with-us/',
      excerpt: 'Private planning, trusted local hosts and quieter luxury pacing.',
      featuredImage: pageImages.whyTravelWithUs,
      content: 'Why Travel With Us explains private planning, trusted local hosts, quieter luxury pacing, proof points, atelier notes and planning principles behind the service.',
      details: { pageType: 'about' }
    })
  ];
}

function buildTripStylePages(tripKinds, tripStyleSlug) {
  return tripKinds.map((kind) => {
    const slug = tripStyleSlug(kind.title);
    return {
      id: `trip-style-${slug}`,
      type: 'hlt_travel_style',
      title: kind.title,
      slug,
      excerpt: kind.text,
      content: [
        kind.eyebrow,
        kind.text,
        `Duration: ${kind.duration}`,
        `Mood: ${kind.mood}`,
        `Primary action: ${kind.href}`,
        `Image alt: ${kind.alt}`
      ].join('\n\n'),
      featuredImage: kind.image,
      meta: {
        seo: {
          title: `${kind.title} | Private Luxury Travel Style`,
          description: kind.text,
          canonical: `/travel-styles/${slug}/`
        },
        details: {
          styleNumber: kind.num,
          eyebrow: kind.eyebrow,
          duration: kind.duration,
          mood: kind.mood,
          route: `/travel-styles/${slug}/`,
          ctaHref: kind.href,
          imageAlt: kind.alt
        }
      }
    };
  });
}

async function saveMirrorMeta(postId, item, sourceType, sourceCollection, sourceIndex) {
  const meta = buildMirrorMeta(item, sourceType, sourceCollection, sourceIndex);
  await prisma.postMeta.upsert({
    where: { postId_key: { postId, key: '_mirror_raw' } },
    update: { value: meta._mirror_raw },
    create: { postId, key: '_mirror_raw', value: meta._mirror_raw }
  });
  for (const [key, value] of Object.entries(meta)) {
    if (key === '_mirror_raw') continue;
    await prisma.postMeta.upsert({
      where: { postId_key: { postId, key } },
      update: { value: toInputJson(value) },
      create: { postId, key, value: toInputJson(value) }
    });
  }
}

async function saveCategoryMirrorMeta(categoryId, categoryName, sourceCollection) {
  if (!categoryId) return;
  const usageCount = await prisma.postCategory.count({ where: { categoryId } });
  await upsertCategoryMeta(categoryId, '_mirror_taxonomy_source', {
    mirrorSource: 'current-public-output',
    taxonomy: 'category',
    sourceCollection,
    name: categoryName,
    usageCount
  });
}

async function saveTagMirrorMeta(tagId, tagName, sourceCollection) {
  if (!tagId) return;
  const usageCount = await prisma.postTag.count({ where: { tagId } });
  await upsertTagMeta(tagId, '_mirror_taxonomy_source', {
    mirrorSource: 'current-public-output',
    taxonomy: 'tag',
    sourceCollection,
    name: tagName,
    usageCount
  });
}

async function saveMediaMirrorMeta(mediaId, imageUrl, item, postId, sourceCollection, sourceIndex, role) {
  if (!mediaId) return;
  const attachments = await prisma.postMedia.findMany({
    where: { mediaId },
    select: { postId: true, role: true, sortOrder: true }
  });
  const attachedPostIds = uniqueStrings([...attachments.map((entry) => entry.postId), postId]);
  await upsertMediaMeta(mediaId, '_mirror_media_source', {
    originalSource: imageUrl,
    mirrorSource: 'current-public-output',
    sourceCollection,
    sourceIndex,
    sourceSlug: item.slug || '',
    sourceTitle: item.title || '',
    ...(getImageMetadata(imageUrl, rootDir))
  });
  await upsertMediaMeta(mediaId, '_mirror_media_usage', {
    usage: role,
    attachedPostIds,
    attachments,
    mirroredFromPostId: postId
  });
}

async function populateMirrorEntityMeta({ postId, item, sourceCollection, sourceIndex, categoryId, categoryName, tagEntries, mediaEntries }) {
  await saveCategoryMirrorMeta(categoryId, categoryName, sourceCollection);
  for (const entry of tagEntries) {
    await saveTagMirrorMeta(entry.id, entry.name, sourceCollection);
  }
  for (const entry of mediaEntries) {
    await saveMediaMirrorMeta(entry.id, entry.url, item, postId, sourceCollection, sourceIndex, entry.role);
  }
}

async function mirrorPostItem({ item, postType, sourceCollection, sourceIndex, adminId, mediaCache, categoryCache, tagCache, stats }) {
  const slug = extractString(item.slug);
  if (!slug) {
    stats.skipped += 1;
    stats.warnings.push(`Skipped item without slug in ${sourceCollection}[${sourceIndex}]`);
    return;
  }

  const details = readDetails(item);
  const seo = readSeo(item);
  const galleryUrls = readGallery(item);
  const featuredImageUrl = extractString(item.featuredImage);
  const allImageUrls = uniqueStrings([featuredImageUrl, ...galleryUrls]);
  const sourcePublishedAt = parseDate(details.publishedAt) || parseDate(item.publishedAt) || parseDate(item.datePublished) || new Date();
  const mirrorStatus = forceDraftMirror ? 'DRAFT' : 'PUBLISHED';
  const categoryName = deriveCategory(item, postType === 'PAGE' ? 'Pages' : postType === 'TOUR' ? 'Tours' : postType === 'CRUISE' ? 'Cruises' : 'Blog');
  const categoryId = await ensureCategory(categoryName, categoryCache);
  const tagEntries = [];
  for (const tagName of deriveTags(item)) {
    const tagId = await ensureTag(tagName, tagCache);
    if (tagId) tagEntries.push({ id: tagId, name: tagName });
  }
  const tagIds = tagEntries.map((entry) => entry.id);

  const existing = await prisma.post.findUnique({
    where: { postType_slug: { postType, slug } },
    include: { meta: true }
  });
  if (existing && !refreshExisting) {
    await saveMirrorMeta(existing.id, item, item.type || postType.toLowerCase(), sourceCollection, sourceIndex);
    const mediaEntries = [];
    for (let index = 0; index < allImageUrls.length; index += 1) {
      const imageUrl = allImageUrls[index];
      const mediaId = await ensureMediaByUrl(imageUrl, adminId, mediaCache, extractString(seo.ogImage, item.title), extractString(item.title), extractString(item.excerpt));
      if (mediaId) mediaEntries.push({ id: mediaId, url: imageUrl, role: index === 0 && imageUrl === featuredImageUrl ? 'featured' : 'gallery' });
    }
    await populateMirrorEntityMeta({ postId: existing.id, item, sourceCollection, sourceIndex, categoryId, categoryName, tagEntries, mediaEntries });
    const shouldRefreshRealPageMirror = postType === 'PAGE' && realPageMirrorCollections.has(sourceCollection);
    if (shouldRefreshRealPageMirror) {
      const featuredImageId = await ensureMediaByUrl(featuredImageUrl, adminId, mediaCache, extractString(seo.ogImage, item.title), extractString(item.title), extractString(item.excerpt));
      await prisma.post.update({
        where: { id: existing.id },
        data: {
          title: extractString(item.title, existing.title),
          excerpt: extractString(item.excerpt, existing.excerpt),
          content: extractString(item.content, existing.content),
          seoTitle: extractString(seo.title, existing.seoTitle || item.title),
          seoDescription: extractString(seo.description, existing.seoDescription || item.excerpt),
          canonicalUrl: extractString(seo.canonical, existing.canonicalUrl),
          ...(featuredImageId ? { featuredImageId } : {}),
          ...(forceDraftMirror
            ? {
              status: 'DRAFT',
              publishedAt: null,
              scheduledAt: null,
              trashedAt: null
            }
            : {
              status: mirrorStatus,
              publishedAt: sourcePublishedAt,
              scheduledAt: null,
              trashedAt: null
            })
        }
      });
      if (categoryId) {
        await prisma.postCategory.createMany({
          data: [{ postId: existing.id, categoryId }],
          skipDuplicates: true
        });
      }
      if (tagIds.length) {
        await prisma.postTag.createMany({
          data: tagIds.map((tagId) => ({ postId: existing.id, tagId })),
          skipDuplicates: true
        });
      }
      if (mediaEntries.length) {
        await prisma.postMedia.createMany({
          data: mediaEntries.map((entry, index) => ({ postId: existing.id, mediaId: entry.id, role: 'gallery', sortOrder: index })),
          skipDuplicates: true
        });
      }
      stats.updated += 1;
      return;
    }
    if (forceDraftMirror && existing.status !== 'DRAFT') {
      await prisma.post.update({
        where: { id: existing.id },
        data: {
          status: 'DRAFT',
          publishedAt: null,
          scheduledAt: null,
          trashedAt: null
        }
      });
    }
    if (!forceDraftMirror && (existing.status !== 'PUBLISHED' || !existing.publishedAt)) {
      await prisma.post.update({
        where: { id: existing.id },
        data: {
          status: 'PUBLISHED',
          publishedAt: existing.publishedAt || sourcePublishedAt,
          scheduledAt: null,
          trashedAt: null
        }
      });
    }
    stats.existing += 1;
    return;
  }

  if (existing && refreshExisting) {
    const featuredImageId = await ensureMediaByUrl(featuredImageUrl, adminId, mediaCache, extractString(seo.ogImage, item.title), extractString(item.title), extractString(item.excerpt));
    await prisma.post.update({
      where: { id: existing.id },
      data: {
        title: extractString(item.title, existing.title),
        excerpt: extractString(item.excerpt, existing.excerpt),
        content: extractString(item.content, existing.content),
        seoTitle: extractString(seo.title, existing.seoTitle || item.title),
        seoDescription: extractString(seo.description, existing.seoDescription || item.excerpt),
        canonicalUrl: extractString(seo.canonical, existing.canonicalUrl),
        featuredImageId: featuredImageId || existing.featuredImageId,
        ...(forceDraftMirror
          ? {
            status: 'DRAFT',
            publishedAt: null,
            scheduledAt: null,
            trashedAt: null
          }
          : {
            status: mirrorStatus,
            publishedAt: existing.publishedAt || sourcePublishedAt,
            scheduledAt: null,
            trashedAt: null
          })
      }
    });
    await saveMirrorMeta(existing.id, item, item.type || postType.toLowerCase(), sourceCollection, sourceIndex);
    const mediaEntries = [];
    for (let index = 0; index < allImageUrls.length; index += 1) {
      const imageUrl = allImageUrls[index];
      const mediaId = await ensureMediaByUrl(imageUrl, adminId, mediaCache, extractString(seo.ogImage, item.title), extractString(item.title), extractString(item.excerpt));
      if (mediaId) mediaEntries.push({ id: mediaId, url: imageUrl, role: index === 0 && imageUrl === featuredImageUrl ? 'featured' : 'gallery' });
    }
    await populateMirrorEntityMeta({ postId: existing.id, item, sourceCollection, sourceIndex, categoryId, categoryName, tagEntries, mediaEntries });
    stats.updated += 1;
    return;
  }

  const featuredImageId = await ensureMediaByUrl(featuredImageUrl, adminId, mediaCache, extractString(seo.ogImage, item.title), extractString(item.title), extractString(item.excerpt));
  const post = await prisma.post.create({
    data: {
      postType,
      status: mirrorStatus,
      title: extractString(item.title, slug),
      slug,
      excerpt: extractString(item.excerpt),
      content: extractString(item.content),
      seoTitle: extractString(seo.title, extractString(item.title, slug)),
      seoDescription: extractString(seo.description, extractString(item.excerpt)),
      canonicalUrl: extractString(seo.canonical),
      authorId: adminId,
      publishedAt: sourcePublishedAt,
      ...(featuredImageId ? { featuredImageId } : {})
    }
  });

  if (categoryId) {
    await prisma.postCategory.create({ data: { postId: post.id, categoryId } });
  }
  if (tagIds.length) {
    await prisma.postTag.createMany({ data: tagIds.map((tagId) => ({ postId: post.id, tagId })) });
  }
  if (allImageUrls.length) {
    const mediaIds = [];
    for (let index = 0; index < allImageUrls.length; index += 1) {
      const imageUrl = allImageUrls[index];
      const mediaId = await ensureMediaByUrl(imageUrl, adminId, mediaCache, extractString(seo.ogImage, item.title), extractString(item.title), extractString(item.excerpt));
      if (mediaId) mediaIds.push(mediaId);
    }
    if (mediaIds.length) {
      await prisma.postMedia.createMany({
        data: mediaIds.map((mediaId, index) => ({ postId: post.id, mediaId, role: 'gallery', sortOrder: index }))
      });
    }
  }

  const mediaEntries = [];
  for (let index = 0; index < allImageUrls.length; index += 1) {
    const imageUrl = allImageUrls[index];
    const mediaId = await ensureMediaByUrl(imageUrl, adminId, mediaCache, extractString(seo.ogImage, item.title), extractString(item.title), extractString(item.excerpt));
    if (mediaId) mediaEntries.push({ id: mediaId, url: imageUrl, role: index === 0 && imageUrl === featuredImageUrl ? 'featured' : 'gallery' });
  }
  await populateMirrorEntityMeta({ postId: post.id, item, sourceCollection, sourceIndex, categoryId, categoryName, tagEntries, mediaEntries });

  if (postType === 'TOUR') {
    const basePrice = Number(String(details.price || readPricing(item)[0]?.price || '').replace(/[^0-9.]/g, ''));
    await prisma.tourMeta.upsert({
      where: { postId: post.id },
      update: {
        basePrice: Number.isFinite(basePrice) && basePrice > 0 ? new Prisma.Decimal(String(basePrice)) : null,
        currency: extractString(details.currency, 'USD'),
        duration: extractString(details.duration, ''),
        availability: extractString(details.availability, 'available'),
        gallery: toInputJson(allImageUrls),
        itinerary: toInputJson(readItinerary(item))
      },
      create: {
        postId: post.id,
        basePrice: Number.isFinite(basePrice) && basePrice > 0 ? new Prisma.Decimal(String(basePrice)) : null,
        currency: extractString(details.currency, 'USD'),
        duration: extractString(details.duration, ''),
        availability: extractString(details.availability, 'available'),
        gallery: toInputJson(allImageUrls),
        itinerary: toInputJson(readItinerary(item))
      }
    });
  }

  await saveMirrorMeta(post.id, item, item.type || postType.toLowerCase(), sourceCollection, sourceIndex);
  stats.created += 1;
}

async function mirrorOptions(currentSiteContent, hubs, testimonials) {
  const adminSiteContent = await createOptionIfMissing('admin_site_content', currentSiteContent);
  const adminHubs = await createOptionIfMissing('admin_hubs', hubs);
  const adminTestimonials = await createOptionIfMissing('admin_testimonials', testimonials);
  return { adminSiteContent, adminHubs, adminTestimonials };
}

async function mirrorMenus(adminId, currentSiteContent) {
  const existing = await prisma.menu.findUnique({ where: { slug: 'admin-current-header-menu' } });
  if (existing) return { created: false, id: existing.id };
  const menu = await prisma.menu.create({
    data: {
      name: 'Admin Current Header Menu',
      slug: 'admin-current-header-menu',
      location: 'admin-mirror-primary'
    }
  });
  const items = [
    { label: 'Home', url: '/', sortOrder: 0 },
    ...currentSiteContent.navigation.tourChoices.map((choice, index) => ({ label: choice.label, url: choice.href, sortOrder: index + 1 })),
    ...currentSiteContent.navigation.aboutChoices.map((choice, index) => ({ label: choice.label, url: choice.href, sortOrder: index + 100 }))
  ];
  for (const item of items) {
    await prisma.menuItem.create({
      data: {
        menuId: menu.id,
        label: item.label,
        url: item.url,
        target: '',
        cssClasses: [],
        sortOrder: item.sortOrder
      }
    });
  }
  return { created: true, id: menu.id };
}

function buildCurrentHomepageBlocks(currentSiteContent, currentPosts) {
  const hero = currentSiteContent.home.hero;
  const navigation = currentSiteContent.navigation;
  const footer = currentSiteContent.footer;
  const tourItems = navigation.tourChoices.map((choice) => ({
    title: choice.label,
    href: choice.href,
    image: choice.image,
    excerpt: choice.description || choice.note,
    landmark: choice.landmark,
    note: choice.note
  }));
  const blogItems = currentPosts.slice(0, 6).map((item) => ({
    title: item.title,
    href: `/blog/${item.slug}/`,
    image: item.featuredImage,
    excerpt: item.excerpt
  }));

  return [
    {
      id: 'current-home-hero',
      type: 'hero',
      props: {
        eyebrow: hero.eyebrow,
        title: hero.title,
        subtitle: hero.subtitle,
        image: hero.image,
        primaryCta: hero.primaryCta,
        secondaryCta: hero.secondaryCta
      }
    },
    {
      id: 'current-home-destinations',
      type: 'tourGrid',
      props: { items: tourItems }
    },
    {
      id: 'current-home-blog-preview',
      type: 'blogGrid',
      props: { items: blogItems }
    },
    {
      id: 'current-home-footer-contact',
      type: 'text',
      props: {
        content: `${footer.contactHeading}: ${footer.phoneDisplay} | ${footer.email} | ${footer.address}`
      }
    },
    {
      id: 'current-home-primary-cta',
      type: 'reusable',
      props: { slug: 'current-site-primary-cta' }
    }
  ];
}

function buildCurrentHeaderBlocks(currentSiteContent) {
  const identity = currentSiteContent.identity;
  const navigation = currentSiteContent.navigation;
  const links = [
    'Home: /',
    ...navigation.tourChoices.map((choice) => `${choice.label}: ${choice.href}`),
    ...navigation.aboutChoices.map((choice) => `${choice.label}: ${choice.href}`)
  ];
  return [
    {
      id: 'current-header-identity',
      type: 'text',
      props: {
        content: `${identity.titleLine1} ${identity.titleLine2}\n${identity.tagline}`
      }
    },
    {
      id: 'current-header-links',
      type: 'text',
      props: { content: links.join('\n') }
    },
    {
      id: 'current-header-cta',
      type: 'cta',
      props: {
        eyebrow: identity.tagline,
        title: navigation.primaryCta.label,
        href: navigation.primaryCta.href,
        label: navigation.primaryCta.label
      }
    }
  ];
}

function buildCurrentFooterBlocks(currentSiteContent) {
  const footer = currentSiteContent.footer;
  const footerLinks = footer.columns
    .map((column) => `${column.title}: ${column.links.map((link) => `${link.label} (${link.href})`).join(', ')}`)
    .join('\n');
  return [
    {
      id: 'current-footer-contact',
      type: 'text',
      props: {
        content: [
          footer.contactHeading,
          `${footer.phoneLabel} ${footer.phoneDisplay}`,
          `Email: ${footer.email}`,
          `Address: ${footer.address}`,
          `Open: ${footer.openHours}`
        ].join('\n')
      }
    },
    {
      id: 'current-footer-links',
      type: 'text',
      props: { content: footerLinks }
    },
    {
      id: 'current-footer-legal',
      type: 'text',
      props: {
        content: `${footer.copyright}\n${footer.legalLinks.map((link) => `${link.label}: ${link.href}`).join('\n')}`
      }
    }
  ];
}

async function upsertReusableBlockMirror(adminId, block) {
  const existing = await prisma.reusableBlock.findUnique({ where: { slug: block.slug } });
  const data = {
    name: block.name,
    blockType: block.blockType,
    status: block.status,
    content: toInputJson(block.content),
    updatedById: adminId
  };
  const item = await prisma.reusableBlock.upsert({
    where: { slug: block.slug },
    update: data,
    create: {
      ...data,
      slug: block.slug,
      createdById: adminId
    }
  });
  return { created: !existing, id: item.id };
}

async function upsertBlockTemplateMirror(adminId, template) {
  const existing = await prisma.blockTemplate.findUnique({ where: { slug: template.slug } });
  const data = {
    name: template.name,
    type: template.type,
    status: template.status,
    blocks: toInputJson(template.blocks),
    updatedById: adminId
  };
  const item = await prisma.blockTemplate.upsert({
    where: { slug: template.slug },
    update: data,
    create: {
      ...data,
      slug: template.slug,
      createdById: adminId
    }
  });
  return { created: !existing, id: item.id };
}

async function mirrorCurrentWebsiteBlocks(adminId, currentSiteContent, currentPosts) {
  const homepageBlocks = buildCurrentHomepageBlocks(currentSiteContent, currentPosts);
  const results = {
    reusable: [],
    templates: [],
    homeMeta: { updated: false, postId: null }
  };

  results.reusable.push(await upsertReusableBlockMirror(adminId, {
    name: 'Current Site Primary CTA',
    slug: 'current-site-primary-cta',
    blockType: 'cta',
    status: 'ACTIVE',
    content: [
      {
        id: 'current-site-primary-cta',
        type: 'cta',
        props: {
          eyebrow: currentSiteContent.identity.tagline,
          title: currentSiteContent.home.hero.title,
          href: currentSiteContent.navigation.primaryCta.href,
          label: currentSiteContent.navigation.primaryCta.label
        }
      }
    ]
  }));

  results.templates.push(await upsertBlockTemplateMirror(adminId, {
    name: 'Current Website Homepage Mirror',
    slug: 'current-website-homepage-mirror',
    type: 'PAGE',
    status: 'DRAFT',
    blocks: homepageBlocks
  }));
  results.templates.push(await upsertBlockTemplateMirror(adminId, {
    name: 'Current Website Header Mirror',
    slug: 'current-website-header-mirror',
    type: 'HEADER',
    status: 'DRAFT',
    blocks: buildCurrentHeaderBlocks(currentSiteContent)
  }));
  results.templates.push(await upsertBlockTemplateMirror(adminId, {
    name: 'Current Website Footer Mirror',
    slug: 'current-website-footer-mirror',
    type: 'FOOTER',
    status: 'DRAFT',
    blocks: buildCurrentFooterBlocks(currentSiteContent)
  }));

  const homePage = await prisma.post.findUnique({
    where: { postType_slug: { postType: 'PAGE', slug: 'home' } },
    select: { id: true }
  });
  if (homePage) {
    await prisma.postMeta.upsert({
      where: { postId_key: { postId: homePage.id, key: '_cms_blocks' } },
      update: { value: toInputJson(homepageBlocks) },
      create: { postId: homePage.id, key: '_cms_blocks', value: toInputJson(homepageBlocks) }
    });
    await prisma.postMeta.upsert({
      where: { postId_key: { postId: homePage.id, key: '_cms_block_template' } },
      update: { value: 'current-website-homepage-mirror' },
      create: { postId: homePage.id, key: '_cms_block_template', value: 'current-website-homepage-mirror' }
    });
    results.homeMeta = { updated: true, postId: homePage.id };
  }

  return results;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required.');
  }

  const { getContent } = loadModule(path.join(rootDir, 'lib/cms.ts'));
  const { getSiteContent } = loadModule(path.join(rootDir, 'lib/site-content.ts'));
  const { fallbackTestimonials, hubs } = loadModule(path.join(rootDir, 'lib/fallback-data.ts'));
  const { tripKinds, tripStyleSlug } = loadModule(path.join(rootDir, 'lib/trip-styles.ts'));
  const { travelersTeam } = loadModule(path.join(rootDir, 'lib/travelers-team.ts'));
  const { memories, memoryPhotoTotal } = loadModule(path.join(rootDir, 'components/sections/memory-data.ts'));
  const { bookingCatalogStats } = loadModule(path.join(rootDir, 'lib/booking-options.ts'));

  const admin = await ensureAdminUser();
  await saveAdminUserMirrorMeta(admin);
  const currentSiteContent = await getSiteContent();
  const currentPosts = await getContent('posts');
  const currentTours = await getContent('tours');
  const currentCruises = await getContent('cruises');
  const currentStyles = await getContent('styles');
  const hubImageBySlug = new Map(
    currentSiteContent.navigation.tourChoices.map((choice) => [
      choice.href.replace(/^\/+|\/+$/g, ''),
      choice.image || currentSiteContent.home.hero.image
    ])
  );
  const hubPages = Object.values(hubs).map((hub) => ({
    id: hub.slug,
    type: 'hlt_destination_hub',
    title: hub.title,
    slug: hub.slug,
    excerpt: hub.intro,
    content: `${hub.kicker}\n\n${hub.intro}\n\n${hub.narrative}`,
    featuredImage: hubImageBySlug.get(hub.slug) || currentSiteContent.home.hero.image,
    meta: {
      seo: {
        title: hub.title,
        description: hub.intro,
        h1: hub.title
      },
      details: {
        highlights: hub.highlights,
        neighboring: hub.neighboring,
        kicker: hub.kicker
      }
    }
  }));
  const staticPages = buildStaticWebsitePages({
    currentSiteContent,
    currentPosts,
    currentCruises,
    fallbackTestimonials,
    travelersTeam,
    memories,
    memoryPhotoTotal,
    bookingCatalogStats
  });
  const tripStylePages = buildTripStylePages(tripKinds, tripStyleSlug);

  const mediaCache = new Map();
  const categoryCache = new Map();
  const tagCache = new Map();
  const stats = { created: 0, updated: 0, existing: 0, skipped: 0, warnings: [] };

  log('Mirroring admin-only site content snapshot...');
  const mirrorOptionsResult = await mirrorOptions(currentSiteContent, hubs, fallbackTestimonials);
  log(`Admin site content mirror ${mirrorOptionsResult.adminSiteContent.created ? 'created' : 'already existed'}.`);

  log('Mirroring design preset with current live fonts...');
  const designResult = await createDesignPresetIfMissing(admin.id);
  log(`Design preset ${designResult.created ? 'created' : 'already existed'}.`);

  log('Mirroring header menu snapshot...');
  const menuResult = await mirrorMenus(admin.id, currentSiteContent);
  log(`Header menu ${menuResult.created ? 'created' : 'already existed'}.`);

  log('Mirroring current website blocks/templates...');
  const blockMirrorResult = await mirrorCurrentWebsiteBlocks(admin.id, currentSiteContent, currentPosts);
  log(`Block mirror reusable created ${blockMirrorResult.reusable.filter((item) => item.created).length}/${blockMirrorResult.reusable.length}, templates created ${blockMirrorResult.templates.filter((item) => item.created).length}/${blockMirrorResult.templates.length}, home _cms_blocks ${blockMirrorResult.homeMeta.updated ? 'updated' : 'not found'}.`);

  const collections = [
    { label: 'posts', postType: 'POST', items: currentPosts },
    { label: 'tours', postType: 'TOUR', items: currentTours },
    { label: 'cruises', postType: 'CRUISE', items: currentCruises },
    { label: 'static-pages', postType: 'PAGE', items: staticPages },
    { label: 'styles', postType: 'PAGE', items: currentStyles },
    { label: 'trip-styles', postType: 'PAGE', items: tripStylePages },
    { label: 'hubs', postType: 'PAGE', items: hubPages }
  ];

  for (const collection of collections) {
    log(`Mirroring ${collection.label} (${collection.items.length} items)...`);
    for (let index = 0; index < collection.items.length; index += 1) {
      await mirrorPostItem({
        item: collection.items[index],
        postType: collection.postType,
        sourceCollection: collection.label,
        sourceIndex: index,
        adminId: admin.id,
        mediaCache,
        categoryCache,
        tagCache,
        stats
      });
    }
  }

  const report = {
    timestamp: new Date().toISOString(),
    refreshExisting,
    forceDraftMirror,
    adminUser: { id: admin.id, email: admin.email, username: admin.username },
    options: mirrorOptionsResult,
    designPreset: designResult,
    menu: menuResult,
    blockMirror: blockMirrorResult,
    stats,
    counts: {
      posts: currentPosts.length,
      tours: currentTours.length,
      cruises: currentCruises.length,
      staticPages: staticPages.length,
      tripStyles: tripStylePages.length,
      styles: currentStyles.length,
      hubs: hubPages.length,
      testimonials: fallbackTestimonials.length
    }
  };

  await mkdir(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, `mirror-current-site-${Date.now()}.json`);
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  log(`Report written to ${path.relative(rootDir, reportPath)}`);
  log(`Created ${stats.created}, updated ${stats.updated}, existing ${stats.existing}, skipped ${stats.skipped}.`);
  if (stats.warnings.length) {
    for (const warning of stats.warnings) {
      log(`Warning: ${warning}`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
