import { unstable_noStore as noStore } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { CmsMenuItem, CmsMenuTree } from '@/lib/menus-types';

type MenuRuntimeRow = {
  id: string;
  name: string;
  slug: string;
  location: string;
  updatedAt: Date;
  items: Array<{
    id: string;
    parentId: string | null;
    label: string;
    url: string;
    target: string;
    cssClasses: string[];
    sortOrder: number;
    linkedPost: {
      id: string;
      title: string;
      slug: string;
      postType: string;
    } | null;
  }>;
};

function isSafeMenuHref(value: string) {
  const href = value.trim();
  if (!href) return false;
  if (href.startsWith('/') || href.startsWith('#')) return true;
  return /^(https?:|mailto:|tel:)/i.test(href);
}

function linkedPostHref(item: MenuRuntimeRow['items'][number]) {
  const post = item.linkedPost;
  if (!post) return '#';
  if (post.postType === 'POST') return `/blog/${post.slug}`;
  if (post.postType === 'PAGE') return `/${post.slug}`;
  return item.url || '#';
}

function normalizeMenuHref(item: MenuRuntimeRow['items'][number]) {
  const explicit = item.url.trim();
  const href = explicit && explicit !== '#' ? explicit : linkedPostHref(item);
  return isSafeMenuHref(href) ? href : '#';
}

function normalizeTarget(value: string) {
  return value === '_blank' ? '_blank' : '';
}

export function isDbMenuRuntimeEnabled() {
  return process.env.CMS_MENU_RUNTIME === 'db';
}

export function buildNestedMenuTree(items: MenuRuntimeRow['items']): CmsMenuItem[] {
  const byId = new Map<string, CmsMenuItem>();
  const roots: CmsMenuItem[] = [];

  for (const item of items) {
    byId.set(item.id, {
      id: item.id,
      label: item.label.trim(),
      href: normalizeMenuHref(item),
      target: normalizeTarget(item.target),
      cssClasses: item.cssClasses,
      linkedPost: item.linkedPost,
      children: []
    });
  }

  for (const item of items) {
    const normalized = byId.get(item.id);
    if (!normalized || !normalized.label) continue;
    const parent = item.parentId ? byId.get(item.parentId) : null;
    if (parent && parent.id !== normalized.id) {
      parent.children.push(normalized);
    } else {
      roots.push(normalized);
    }
  }

  return roots;
}

export async function getMenuByLocation(location: string): Promise<CmsMenuTree | null> {
  noStore();
  const normalizedLocation = location.trim();
  if (!isDbMenuRuntimeEnabled() || !normalizedLocation || !process.env.DATABASE_URL) return null;

  try {
    const menu = await prisma.menu.findFirst({
      where: { location: normalizedLocation },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        location: true,
        updatedAt: true,
        items: {
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            parentId: true,
            label: true,
            url: true,
            target: true,
            cssClasses: true,
            sortOrder: true,
            linkedPost: { select: { id: true, title: true, slug: true, postType: true } }
          }
        }
      }
    });

    if (!menu) return null;
    const row = menu as MenuRuntimeRow;
    const items = buildNestedMenuTree(row.items);
    if (!items.length) return null;

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      location: row.location,
      updatedAt: row.updatedAt.toISOString(),
      items
    };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[menus-runtime] "${normalizedLocation}" menu read failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    return null;
  }
}
