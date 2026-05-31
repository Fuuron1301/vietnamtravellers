import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { unstable_noStore as noStore } from 'next/cache';
import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { defaultLocale, normalizeLocale } from './i18n';
import { localizeSiteContent } from './locale-content';
import { getRequestLocale } from './request-locale';
import { defaultSiteContent, homeSectionIds, type HomeSectionId, type SiteContent, type TourNavItem } from './site-content-schema';

const dataDir = process.env.LOCAL_CAPTURE_DIR || path.join(process.cwd(), '.local-data');
const contentFile = path.join(dataDir, 'site-content.json');
const primarySiteContentOptionKey = 'admin_site_content';
const legacySiteContentOptionKey = 'site_content';
const siteContentOptionKeys = [primarySiteContentOptionKey, legacySiteContentOptionKey] as const;

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === 'string' ? value : fallback;
}

function linkArray(value: unknown, fallback: SiteContent['navigation']['aboutChoices']) {
  if (!Array.isArray(value)) return fallback;
  const links = value
    .filter(isObject)
    .map((item, index) => ({
      label: stringValue(item.label, fallback[index]?.label || 'Link'),
      href: stringValue(item.href, fallback[index]?.href || '/'),
      description: stringValue(item.description, fallback[index]?.description || '')
    }))
    .filter((item) => item.label.trim() && item.href.trim());
  return links.length ? links : fallback;
}

function mergeLinks(source: SiteContent['navigation']['aboutChoices'], fallback: SiteContent['navigation']['aboutChoices']) {
  const seen = new Set(source.map((item) => item.href.trim().toLowerCase()));
  return [...source, ...fallback.filter((item) => !seen.has(item.href.trim().toLowerCase()))];
}

function isDestinationColumnTitle(value: string) {
  return value.trim().toLowerCase().includes('destination');
}

function mergeTourChoices(source: TourNavItem[], fallback: TourNavItem[]) {
  const seen = new Set(source.map((item) => item.href));
  return [...source, ...fallback.filter((item) => !seen.has(item.href))];
}

function sanitizeHomeSections(value: unknown): SiteContent['home']['sections'] {
  const fallback = defaultSiteContent.home.sections;
  const object = isObject(value) ? value : {};
  const order = Array.isArray(object.order)
    ? object.order.filter((id): id is HomeSectionId => typeof id === 'string' && (homeSectionIds as readonly string[]).includes(id))
    : fallback.order;
  const normalizedOrder = [...order, ...homeSectionIds.filter((id) => !order.includes(id))];
  const visibilitySource = isObject(object.visibility) ? object.visibility : {};
  const visibility = homeSectionIds.reduce((acc, id) => {
    acc[id] = typeof visibilitySource[id] === 'boolean' ? Boolean(visibilitySource[id]) : fallback.visibility[id];
    return acc;
  }, {} as Record<HomeSectionId, boolean>);
  return { order: normalizedOrder, visibility };
}

export function normalizeSiteContent(input: unknown): SiteContent {
  const source = isObject(input) ? input : {};
  const identity = isObject(source.identity) ? source.identity : {};
  const navigation = isObject(source.navigation) ? source.navigation : {};
  const footer = isObject(source.footer) ? source.footer : {};
  const home = isObject(source.home) ? source.home : {};
  const hero = isObject(home.hero) ? home.hero : {};
  const defaultDestinationFooterLinks =
    defaultSiteContent.footer.columns.find((column) => isDestinationColumnTitle(column.title))?.links || defaultSiteContent.footer.columns[0].links;

  const tourChoices = Array.isArray(navigation.tourChoices)
    ? navigation.tourChoices.filter(isObject).map((item, index) => {
      const fallback = defaultSiteContent.navigation.tourChoices[index] || defaultSiteContent.navigation.tourChoices[0];
      return {
        label: stringValue(item.label, fallback.label),
        href: stringValue(item.href, fallback.href),
        note: stringValue(item.note, fallback.note),
        landmark: stringValue(item.landmark, fallback.landmark),
        description: stringValue(item.description, fallback.description || ''),
        image: stringValue(item.image, fallback.image),
        imageAlt: stringValue(item.imageAlt, fallback.imageAlt)
      };
      }).filter((item) => item.label.trim() && item.href.trim())
    : defaultSiteContent.navigation.tourChoices;
  const mergedTourChoices = mergeTourChoices(tourChoices, defaultSiteContent.navigation.tourChoices);

  const heroImages = Array.isArray(hero.images)
    ? hero.images.filter(isObject).map((item, index) => ({
      src: stringValue(item.src, defaultSiteContent.home.hero.images[index]?.src || defaultSiteContent.home.hero.image),
      position: stringValue(item.position, defaultSiteContent.home.hero.images[index]?.position || '50% 50%')
    })).filter((item) => item.src.trim())
    : defaultSiteContent.home.hero.images;

  return {
    version: 1,
    updatedAt: stringValue(source.updatedAt, new Date().toISOString()),
    translations: isObject(source.translations) ? source.translations : {},
    identity: {
      adminSiteName: stringValue(identity.adminSiteName, defaultSiteContent.identity.adminSiteName),
      ariaLabel: stringValue(identity.ariaLabel, defaultSiteContent.identity.ariaLabel),
      titleLine1: stringValue(identity.titleLine1, defaultSiteContent.identity.titleLine1),
      titleLine2: stringValue(identity.titleLine2, defaultSiteContent.identity.titleLine2),
      tagline: stringValue(identity.tagline, defaultSiteContent.identity.tagline),
      markImage: stringValue(identity.markImage, defaultSiteContent.identity.markImage)
    },
    navigation: {
      tourChoices: mergedTourChoices.length ? mergedTourChoices : defaultSiteContent.navigation.tourChoices,
      aboutChoices: linkArray(navigation.aboutChoices, defaultSiteContent.navigation.aboutChoices),
      primaryCta: {
        label: stringValue(isObject(navigation.primaryCta) ? navigation.primaryCta.label : undefined, defaultSiteContent.navigation.primaryCta.label),
        href: stringValue(isObject(navigation.primaryCta) ? navigation.primaryCta.href : undefined, defaultSiteContent.navigation.primaryCta.href)
      },
      mobileBlogLink: {
        label: stringValue(isObject(navigation.mobileBlogLink) ? navigation.mobileBlogLink.label : undefined, defaultSiteContent.navigation.mobileBlogLink.label),
        href: stringValue(isObject(navigation.mobileBlogLink) ? navigation.mobileBlogLink.href : undefined, defaultSiteContent.navigation.mobileBlogLink.href)
      }
    },
    footer: {
      contactHeading: stringValue(footer.contactHeading, defaultSiteContent.footer.contactHeading),
      openHours: stringValue(footer.openHours, defaultSiteContent.footer.openHours),
      phoneLabel: stringValue(footer.phoneLabel, defaultSiteContent.footer.phoneLabel),
      phoneHref: stringValue(footer.phoneHref, defaultSiteContent.footer.phoneHref),
      phoneDisplay: stringValue(footer.phoneDisplay, defaultSiteContent.footer.phoneDisplay),
      email: stringValue(footer.email, defaultSiteContent.footer.email),
      address: stringValue(footer.address, defaultSiteContent.footer.address),
      mapLink: stringValue(footer.mapLink, defaultSiteContent.footer.mapLink),
      copyright: stringValue(footer.copyright, defaultSiteContent.footer.copyright),
      columns: Array.isArray(footer.columns) ? footer.columns.filter(isObject).map((column, index) => {
        const title = stringValue(column.title, defaultSiteContent.footer.columns[index]?.title || 'Links');
        const links = linkArray(column.links, defaultSiteContent.footer.columns[index]?.links || []);
        return {
          title,
          links: isDestinationColumnTitle(title) ? mergeLinks(links, defaultDestinationFooterLinks) : links
        };
      }).filter((column) => column.title.trim()) : defaultSiteContent.footer.columns,
      legalLinks: linkArray(footer.legalLinks, defaultSiteContent.footer.legalLinks)
    },
    home: {
      hero: {
        eyebrow: stringValue(hero.eyebrow, defaultSiteContent.home.hero.eyebrow),
        title: stringValue(hero.title, defaultSiteContent.home.hero.title),
        subtitle: stringValue(hero.subtitle, defaultSiteContent.home.hero.subtitle),
        image: stringValue(hero.image, heroImages[0]?.src || defaultSiteContent.home.hero.image),
        images: heroImages.length ? heroImages : defaultSiteContent.home.hero.images,
        primaryCta: {
          label: stringValue(isObject(hero.primaryCta) ? hero.primaryCta.label : undefined, defaultSiteContent.home.hero.primaryCta.label),
          href: stringValue(isObject(hero.primaryCta) ? hero.primaryCta.href : undefined, defaultSiteContent.home.hero.primaryCta.href)
        },
        secondaryCta: {
          label: stringValue(isObject(hero.secondaryCta) ? hero.secondaryCta.label : undefined, defaultSiteContent.home.hero.secondaryCta.label),
          href: stringValue(isObject(hero.secondaryCta) ? hero.secondaryCta.href : undefined, defaultSiteContent.home.hero.secondaryCta.href)
        }
      },
      sections: sanitizeHomeSections(home.sections)
    }
  };
}

export async function getSiteContent(locale?: string | null): Promise<SiteContent> {
  noStore();
  const requestLocale = locale ? normalizeLocale(locale, defaultLocale) : await getRequestLocale(defaultLocale);
  if (process.env.DATABASE_URL) {
    try {
      for (const key of siteContentOptionKeys) {
        const option = await prisma.option.findUnique({ where: { key } });
        if (option) return normalizeSiteContent(localizeSiteContent(normalizeSiteContent(option.value), requestLocale));
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[site-content] database read failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  if (process.env.ALLOW_DEMO_FALLBACK !== 'true') {
    return normalizeSiteContent(localizeSiteContent(defaultSiteContent, requestLocale));
  }
  try {
    const raw = await readFile(contentFile, 'utf8');
    return normalizeSiteContent(localizeSiteContent(normalizeSiteContent(JSON.parse(raw)), requestLocale));
  } catch {
    return normalizeSiteContent(localizeSiteContent(defaultSiteContent, requestLocale));
  }
}

export async function saveSiteContent(input: unknown): Promise<SiteContent> {
  const content = normalizeSiteContent({ ...(isObject(input) ? input : {}), updatedAt: new Date().toISOString() });
  if (process.env.DATABASE_URL) {
    try {
      for (const key of siteContentOptionKeys) {
        await prisma.option.upsert({
          where: { key },
          update: { value: content as unknown as Prisma.InputJsonValue },
          create: { key, value: content as unknown as Prisma.InputJsonValue }
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'production') throw error;
      console.warn(`[site-content] database write failed, falling back to JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  if (process.env.ALLOW_DEMO_FALLBACK !== 'true') {
    return content;
  }
  await mkdir(dataDir, { recursive: true });
  const temp = `${contentFile}.${randomUUID()}.tmp`;
  await writeFile(temp, `${JSON.stringify(content, null, 2)}\n`, 'utf8');
  await rename(temp, contentFile);
  return content;
}
