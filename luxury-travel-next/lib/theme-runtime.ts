import { getActiveTemplateBlocks } from '@/lib/blocks/cms-runtime';
import type { CmsBlockNode } from '@/lib/blocks/block-types';

export type CmsThemeRegion = 'HEADER' | 'FOOTER';

export function isDbThemeRuntimeEnabled() {
  return process.env.CMS_THEME_RUNTIME === 'db';
}

export async function getActiveThemeTemplateBlocks(region: CmsThemeRegion): Promise<CmsBlockNode[]> {
  if (!isDbThemeRuntimeEnabled()) return [];
  return getActiveTemplateBlocks(region);
}
