import { BlockTemplateType, CmsRevisionEntity, Prisma, ReusableBlockStatus, TemplateStatus } from '@prisma/client';
import type { AdminSessionContext } from '@/lib/admin/auth';
import { AdminApiError } from '@/lib/admin/api';
import { prisma } from '@/lib/prisma';

export type CmsBlockType =
  | 'hero'
  | 'text'
  | 'image'
  | 'gallery'
  | 'cta'
  | 'tourGrid'
  | 'blogGrid'
  | 'customHtml'
  | 'reusable'
  | 'container';

export type CmsBlockNode = {
  id: string;
  type: CmsBlockType;
  props?: Record<string, unknown>;
  children?: CmsBlockNode[];
};

function jsonValue(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function slugify(value: string) {
  return value.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `block-${Date.now()}`;
}

function asObject(value: unknown) {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

const supportedBlockTypes = new Set<CmsBlockType>(['hero', 'text', 'image', 'gallery', 'cta', 'tourGrid', 'blogGrid', 'customHtml', 'reusable', 'container']);

function canContainChildren(type: CmsBlockType) {
  return type === 'container';
}

function validateSingleBlock(block: unknown, allowCustomHtml: boolean, pathLabel = 'block'): CmsBlockNode {
  const source = asObject(block);
  const id = stringValue(source.id);
  const type = stringValue(source.type) as CmsBlockType;
  if (!id) throw new AdminApiError('VALIDATION_ERROR', `${pathLabel}.id is required.`, 400);
  if (!supportedBlockTypes.has(type)) throw new AdminApiError('VALIDATION_ERROR', `${pathLabel}.type is not supported.`, 400);
  if (type === 'customHtml' && !allowCustomHtml) throw new AdminApiError('FORBIDDEN', 'customHtml blocks require administrator access.', 403);
  const childrenInput = Array.isArray(source.children) ? source.children : [];
  if (childrenInput.length && !canContainChildren(type)) {
    throw new AdminApiError('VALIDATION_ERROR', `${pathLabel}.children is only allowed on container blocks.`, 400);
  }
  const children = childrenInput.map((child, index) => validateSingleBlock(child, allowCustomHtml, `${pathLabel}.children[${index}]`));
  return {
    id,
    type,
    props: asObject(source.props),
    ...(children.length ? { children } : {})
  };
}

export function validateBlockTree(input: unknown, actor?: AdminSessionContext) {
  const allowCustomHtml = actor?.role === 'administrator';
  const blocks = Array.isArray(input) ? input : Array.isArray(asObject(input).blocks) ? asObject(input).blocks as unknown[] : [input];
  return blocks.map((block, index) => validateSingleBlock(block, allowCustomHtml, `blocks[${index}]`));
}

async function uniqueSlug(model: 'reusableBlock' | 'blockTemplate', value: string, ignoreId?: string) {
  const base = slugify(value);
  let suffix = 0;
  while (true) {
    const slug = suffix === 0 ? base : `${base}-${suffix + 1}`;
    const where = { slug, ...(ignoreId ? { NOT: { id: ignoreId } } : {}) };
    const existing = model === 'reusableBlock'
      ? await prisma.reusableBlock.findFirst({ where, select: { id: true } })
      : await prisma.blockTemplate.findFirst({ where, select: { id: true } });
    if (!existing) return slug;
    suffix += 1;
  }
}

export async function listReusableBlocks(params: URLSearchParams) {
  const page = Math.max(1, Number(params.get('page') || '1'));
  const perPage = Math.min(100, Math.max(1, Number(params.get('perPage') || '20')));
  const search = params.get('search')?.trim() || '';
  const status = params.get('status')?.trim().toUpperCase() || '';
  const where: Prisma.ReusableBlockWhereInput = {
    ...(status && ['DRAFT', 'ACTIVE', 'ARCHIVED'].includes(status) ? { status: status as ReusableBlockStatus } : {}),
    ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { slug: { contains: search, mode: 'insensitive' } }, { blockType: { contains: search, mode: 'insensitive' } }] } : {})
  };
  const [total, items] = await prisma.$transaction([
    prisma.reusableBlock.count({ where }),
    prisma.reusableBlock.findMany({ where, orderBy: { updatedAt: 'desc' }, skip: (page - 1) * perPage, take: perPage })
  ]);
  return { kind: 'reusable' as const, items, pagination: { page, perPage, total, totalPages: Math.max(1, Math.ceil(total / perPage)) } };
}

export async function listBlockTemplates(params: URLSearchParams) {
  const page = Math.max(1, Number(params.get('page') || '1'));
  const perPage = Math.min(100, Math.max(1, Number(params.get('perPage') || '20')));
  const search = params.get('search')?.trim() || '';
  const status = params.get('status')?.trim().toUpperCase() || '';
  const type = params.get('type')?.trim().toUpperCase() || '';
  const where: Prisma.BlockTemplateWhereInput = {
    ...(status && ['DRAFT', 'ACTIVE', 'ARCHIVED'].includes(status) ? { status: status as TemplateStatus } : {}),
    ...(type && ['PAGE', 'SECTION', 'HEADER', 'FOOTER', 'LOOP', 'SINGLE'].includes(type) ? { type: type as BlockTemplateType } : {}),
    ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { slug: { contains: search, mode: 'insensitive' } }] } : {})
  };
  const [total, items] = await prisma.$transaction([
    prisma.blockTemplate.count({ where }),
    prisma.blockTemplate.findMany({ where, orderBy: { updatedAt: 'desc' }, skip: (page - 1) * perPage, take: perPage })
  ]);
  return { kind: 'template' as const, items, pagination: { page, perPage, total, totalPages: Math.max(1, Math.ceil(total / perPage)) } };
}

export async function saveReusableBlock(input: unknown, actor: AdminSessionContext) {
  const body = asObject(input);
  const id = stringValue(body.id);
  const name = stringValue(body.name, 'Reusable Block');
  const slug = slugify(stringValue(body.slug, name));
  const blockType = stringValue(body.blockType, 'container');
  const status = stringValue(body.status).toUpperCase() as ReusableBlockStatus | '';
  const content = validateBlockTree(body.content ?? body.block ?? body.blocks ?? [], actor);
  if (!content.length) throw new AdminApiError('VALIDATION_ERROR', 'Reusable block content is required.', 400);
  if (id) {
    const existing = await prisma.reusableBlock.findUnique({ where: { id } });
    if (!existing) throw new AdminApiError('NOT_FOUND', 'Reusable block not found.', 404);
    await prisma.revision.create({
      data: {
        entityType: CmsRevisionEntity.REUSABLE_BLOCK,
        reusableBlockId: existing.id,
        title: existing.name,
        snapshot: jsonValue({ id: existing.id, name: existing.name, slug: existing.slug, blockType: existing.blockType, status: existing.status, content: existing.content }),
        authorId: actor.user.id
      }
    });
    return prisma.reusableBlock.update({
      where: { id },
      data: {
        name,
        slug: await uniqueSlug('reusableBlock', slug, id),
        blockType,
        status: status && ['DRAFT', 'ACTIVE', 'ARCHIVED'].includes(status) ? status : undefined,
        content: jsonValue(content),
        updatedById: actor.user.id
      }
    });
  }
  return prisma.reusableBlock.create({
    data: {
      name,
      slug: await uniqueSlug('reusableBlock', slug),
      blockType,
      status: status && ['DRAFT', 'ACTIVE', 'ARCHIVED'].includes(status) ? status : 'DRAFT',
      content: jsonValue(content),
      createdById: actor.user.id,
      updatedById: actor.user.id
    }
  });
}

export async function deleteReusableBlock(id: string, actor: AdminSessionContext) {
  const existing = await prisma.reusableBlock.findUnique({ where: { id } });
  if (!existing) throw new AdminApiError('NOT_FOUND', 'Reusable block not found.', 404);
  await prisma.revision.create({
    data: {
      entityType: CmsRevisionEntity.REUSABLE_BLOCK,
      reusableBlockId: existing.id,
      title: existing.name,
      snapshot: jsonValue({ id: existing.id, name: existing.name, slug: existing.slug, blockType: existing.blockType, status: existing.status, content: existing.content }),
      authorId: actor.user.id
    }
  });
  return prisma.reusableBlock.update({ where: { id }, data: { status: 'ARCHIVED', updatedById: actor.user.id } });
}

export async function saveBlockTemplate(input: unknown, actor: AdminSessionContext) {
  const body = asObject(input);
  const id = stringValue(body.id);
  const name = stringValue(body.name, 'Block Template');
  const slug = slugify(stringValue(body.slug, name));
  const type = stringValue(body.type, 'PAGE').toUpperCase() as BlockTemplateType;
  const status = stringValue(body.status).toUpperCase() as TemplateStatus | '';
  const blocks = validateBlockTree(body.blocks ?? body.content ?? [], actor);
  if (!blocks.length) throw new AdminApiError('VALIDATION_ERROR', 'Block template blocks are required.', 400);
  if (!['PAGE', 'SECTION', 'HEADER', 'FOOTER', 'LOOP', 'SINGLE'].includes(type)) {
    throw new AdminApiError('VALIDATION_ERROR', 'Unsupported block template type.', 400);
  }
  if (id) {
    const existing = await prisma.blockTemplate.findUnique({ where: { id } });
    if (!existing) throw new AdminApiError('NOT_FOUND', 'Block template not found.', 404);
    await prisma.revision.create({
      data: {
        entityType: CmsRevisionEntity.BLOCK_TEMPLATE,
        blockTemplateId: existing.id,
        title: existing.name,
        snapshot: jsonValue({ id: existing.id, name: existing.name, slug: existing.slug, type: existing.type, status: existing.status, blocks: existing.blocks }),
        authorId: actor.user.id
      }
    });
    return prisma.blockTemplate.update({
      where: { id },
      data: {
        name,
        slug: await uniqueSlug('blockTemplate', slug, id),
        type,
        status: status && ['DRAFT', 'ACTIVE', 'ARCHIVED'].includes(status) ? status : undefined,
        blocks: jsonValue(blocks),
        updatedById: actor.user.id
      }
    });
  }
  return prisma.blockTemplate.create({
    data: {
      name,
      slug: await uniqueSlug('blockTemplate', slug),
      type,
      status: status && ['DRAFT', 'ACTIVE', 'ARCHIVED'].includes(status) ? status : 'DRAFT',
      blocks: jsonValue(blocks),
      createdById: actor.user.id,
      updatedById: actor.user.id
    }
  });
}

export async function activateTemplate(id: string, actor: AdminSessionContext) {
  const existing = await prisma.blockTemplate.findUnique({ where: { id } });
  if (!existing) throw new AdminApiError('NOT_FOUND', 'Block template not found.', 404);
  return prisma.$transaction(async (tx) => {
    await tx.revision.create({
      data: {
        entityType: CmsRevisionEntity.BLOCK_TEMPLATE,
        blockTemplateId: existing.id,
        title: existing.name,
        snapshot: jsonValue({ id: existing.id, name: existing.name, slug: existing.slug, type: existing.type, status: existing.status, blocks: existing.blocks }),
        authorId: actor.user.id
      }
    });
    await tx.blockTemplate.updateMany({ where: { type: existing.type, status: 'ACTIVE', NOT: { id } }, data: { status: 'DRAFT' } });
    return tx.blockTemplate.update({ where: { id }, data: { status: 'ACTIVE', updatedById: actor.user.id } });
  });
}

export async function deleteBlockTemplate(id: string, actor: AdminSessionContext) {
  const existing = await prisma.blockTemplate.findUnique({ where: { id } });
  if (!existing) throw new AdminApiError('NOT_FOUND', 'Block template not found.', 404);
  await prisma.revision.create({
    data: {
      entityType: CmsRevisionEntity.BLOCK_TEMPLATE,
      blockTemplateId: existing.id,
      title: existing.name,
      snapshot: jsonValue({ id: existing.id, name: existing.name, slug: existing.slug, type: existing.type, status: existing.status, blocks: existing.blocks }),
      authorId: actor.user.id
    }
  });
  return prisma.blockTemplate.update({ where: { id }, data: { status: 'ARCHIVED', updatedById: actor.user.id } });
}

export async function listBlockRevisions(params: URLSearchParams) {
  const blockTemplateId = stringValue(params.get('blockTemplateId'));
  const reusableBlockId = stringValue(params.get('reusableBlockId'));
  if (!blockTemplateId && !reusableBlockId) {
    throw new AdminApiError('VALIDATION_ERROR', 'blockTemplateId or reusableBlockId is required.', 400);
  }
  return prisma.revision.findMany({
    where: {
      ...(blockTemplateId ? { blockTemplateId } : {}),
      ...(reusableBlockId ? { reusableBlockId } : {})
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function restoreBlockRevision(revisionId: string, actor: AdminSessionContext) {
  if (!actor.capabilities.includes('restore_revisions')) {
    throw new AdminApiError('FORBIDDEN', 'Capability required: restore_revisions.', 403);
  }
  const revision = await prisma.revision.findUnique({ where: { id: revisionId } });
  if (!revision) throw new AdminApiError('NOT_FOUND', 'Revision not found.', 404);
  const snapshot = asObject(revision.snapshot);

  if (revision.entityType === CmsRevisionEntity.BLOCK_TEMPLATE && revision.blockTemplateId) {
    const current = await prisma.blockTemplate.findUnique({ where: { id: revision.blockTemplateId } });
    if (!current) throw new AdminApiError('NOT_FOUND', 'Block template not found.', 404);
    await prisma.revision.create({
      data: {
        entityType: CmsRevisionEntity.BLOCK_TEMPLATE,
        blockTemplateId: current.id,
        title: current.name,
        snapshot: jsonValue({ id: current.id, name: current.name, slug: current.slug, type: current.type, status: current.status, blocks: current.blocks }),
        authorId: actor.user.id
      }
    });
    return prisma.blockTemplate.update({
      where: { id: current.id },
      data: {
        name: stringValue(snapshot.name, current.name),
        slug: await uniqueSlug('blockTemplate', stringValue(snapshot.slug, current.slug), current.id),
        type: stringValue(snapshot.type, current.type) as BlockTemplateType,
        status: stringValue(snapshot.status, current.status) as TemplateStatus,
        blocks: jsonValue(validateBlockTree(snapshot.blocks ?? [], actor)),
        updatedById: actor.user.id
      }
    });
  }

  if (revision.entityType === CmsRevisionEntity.REUSABLE_BLOCK && revision.reusableBlockId) {
    const current = await prisma.reusableBlock.findUnique({ where: { id: revision.reusableBlockId } });
    if (!current) throw new AdminApiError('NOT_FOUND', 'Reusable block not found.', 404);
    await prisma.revision.create({
      data: {
        entityType: CmsRevisionEntity.REUSABLE_BLOCK,
        reusableBlockId: current.id,
        title: current.name,
        snapshot: jsonValue({ id: current.id, name: current.name, slug: current.slug, blockType: current.blockType, status: current.status, content: current.content }),
        authorId: actor.user.id
      }
    });
    return prisma.reusableBlock.update({
      where: { id: current.id },
      data: {
        name: stringValue(snapshot.name, current.name),
        slug: await uniqueSlug('reusableBlock', stringValue(snapshot.slug, current.slug), current.id),
        blockType: stringValue(snapshot.blockType, current.blockType),
        status: stringValue(snapshot.status, current.status) as ReusableBlockStatus,
        content: jsonValue(validateBlockTree(snapshot.content ?? [], actor)),
        updatedById: actor.user.id
      }
    });
  }

  throw new AdminApiError('VALIDATION_ERROR', 'Revision is not a block/template revision.', 400);
}
