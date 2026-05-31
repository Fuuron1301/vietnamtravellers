import type { CmsPostType } from '@prisma/client';
import { unstable_noStore as noStore } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { CmsBlockNode, CmsBlockType, ReusableBlockMap } from '@/lib/blocks/block-types';

const supportedBlockTypes = new Set<CmsBlockType>([
  'hero',
  'text',
  'image',
  'gallery',
  'cta',
  'tourGrid',
  'blogGrid',
  'customHtml',
  'reusable',
  'container'
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function normalizeBlockNode(value: unknown, index = 0): CmsBlockNode | null {
  if (!isRecord(value)) return null;
  const type = stringValue(value.type) as CmsBlockType;
  if (!supportedBlockTypes.has(type)) return null;
  const id = stringValue(value.id, `${type}-${index + 1}`);
  const children = Array.isArray(value.children)
    ? value.children.map((child, childIndex) => normalizeBlockNode(child, childIndex)).filter((child): child is CmsBlockNode => Boolean(child))
    : [];
  return {
    id,
    type,
    props: isRecord(value.props) ? value.props : {},
    ...(children.length ? { children } : {})
  };
}

export function normalizeBlockTree(value: unknown): CmsBlockNode[] {
  const source = Array.isArray(value)
    ? value
    : isRecord(value) && Array.isArray(value.blocks)
      ? value.blocks
      : isRecord(value) && Array.isArray(value.content)
        ? value.content
        : [];
  return source.map((block, index) => normalizeBlockNode(block, index)).filter((block): block is CmsBlockNode => Boolean(block));
}

export function extractBlocksFromMeta(meta: Array<{ key: string; value: unknown }>) {
  const blocksEntry = meta.find((entry) => entry.key === '_cms_blocks');
  const templateEntry = meta.find((entry) => entry.key === '_cms_block_template');
  return {
    blocks: normalizeBlockTree(blocksEntry?.value),
    templateSlug: stringValue(templateEntry?.value)
  };
}

function warnRuntimeReadFailed(scope: string, error: unknown) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[cms-runtime] ${scope} read failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getReusableBlockMap(): Promise<ReusableBlockMap> {
  if (!process.env.DATABASE_URL) return {};
  noStore();
  try {
    const items = await prisma.reusableBlock.findMany({
      where: { status: 'ACTIVE' },
      select: { slug: true, content: true }
    });
    return items.reduce<ReusableBlockMap>((acc, item) => {
      acc[item.slug] = normalizeBlockTree(item.content);
      return acc;
    }, {});
  } catch (error) {
    warnRuntimeReadFailed('reusable blocks', error);
    return {};
  }
}

export async function getActiveTemplateBlocks(type: 'PAGE' | 'SECTION' | 'HEADER' | 'FOOTER' | 'LOOP' | 'SINGLE' = 'PAGE') {
  if (!process.env.DATABASE_URL) return [];
  noStore();
  try {
    const template = await prisma.blockTemplate.findFirst({
      where: { type, status: 'ACTIVE' },
      orderBy: { updatedAt: 'desc' },
      select: { blocks: true }
    });
    return normalizeBlockTree(template?.blocks);
  } catch (error) {
    warnRuntimeReadFailed(`${type.toLowerCase()} template blocks`, error);
    return [];
  }
}

export async function getOptionBlocks(key: string) {
  if (!process.env.DATABASE_URL || !key) return [];
  noStore();
  try {
    const option = await prisma.option.findUnique({ where: { key }, select: { value: true } });
    return normalizeBlockTree(option?.value);
  } catch (error) {
    warnRuntimeReadFailed(`option blocks "${key}"`, error);
    return [];
  }
}

export async function getPublishedPostBlockRuntime(postType: CmsPostType, slug: string) {
  if (!process.env.DATABASE_URL || !slug) return { blocks: [], reusableBlocks: {} };
  noStore();
  try {
    const post = await prisma.post.findFirst({
      where: {
        postType,
        slug,
        status: 'PUBLISHED',
        OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }]
      },
      select: {
        meta: { select: { key: true, value: true } }
      }
    });
    const { blocks } = extractBlocksFromMeta(post?.meta || []);
    return {
      blocks,
      reusableBlocks: blocks.length ? await getReusableBlockMap() : {}
    };
  } catch (error) {
    warnRuntimeReadFailed(`${postType.toLowerCase()} blocks "${slug}"`, error);
    return { blocks: [], reusableBlocks: {} };
  }
}
