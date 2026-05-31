import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { defaultSiteContent, type SiteContent } from '@/lib/site-content-schema';
import { normalizeSiteContent } from '@/lib/site-content';

export const ADMIN_SITE_CONTENT_OPTION_KEY = 'admin_site_content';
const LEGACY_SITE_CONTENT_OPTION_KEY = 'site_content';

export async function getAdminSiteContentMirror(): Promise<SiteContent> {
  if (!process.env.DATABASE_URL) return defaultSiteContent;
  try {
    const option = await prisma.option.findUnique({ where: { key: ADMIN_SITE_CONTENT_OPTION_KEY } });
    if (option) return normalizeSiteContent(option.value);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[admin-site-content] database read failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return defaultSiteContent;
}

export async function saveAdminSiteContentMirror(input: unknown): Promise<SiteContent> {
  const content = normalizeSiteContent(input);
  if (!process.env.DATABASE_URL) return content;
  for (const key of [ADMIN_SITE_CONTENT_OPTION_KEY, LEGACY_SITE_CONTENT_OPTION_KEY]) {
    await prisma.option.upsert({
      where: { key },
      update: { value: content as unknown as Prisma.InputJsonValue, autoload: 'NO' },
      create: { key, value: content as unknown as Prisma.InputJsonValue, autoload: 'NO' }
    });
  }
  return content;
}
