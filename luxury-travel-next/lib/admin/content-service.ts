import { Prisma, CmsPostStatus, CmsPostType, CmsRevisionEntity } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AdminApiError } from '@/lib/admin/api';
import { capabilityForWriteResource, type AdminCapability } from '@/lib/admin/rbac';
import type { AdminSessionContext } from '@/lib/admin/auth';

export type CmsResource = 'posts' | 'pages' | 'tours' | 'products' | 'cruises';

const resourceMap: Record<CmsResource, { postType: CmsPostType; capability: AdminCapability }> = {
  posts: { postType: 'POST', capability: 'publish_posts' },
  pages: { postType: 'PAGE', capability: 'publish_pages' },
  tours: { postType: 'TOUR', capability: 'manage_tours' },
  products: { postType: 'PRODUCT', capability: 'manage_tours' },
  cruises: { postType: 'CRUISE', capability: 'manage_tours' }
};

const statusValues: CmsPostStatus[] = ['DRAFT', 'PUBLISHED', 'SCHEDULED', 'PRIVATE', 'TRASH'];

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOwnKey(source: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(source, key);
}

function arrayOfStrings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
}

function fileNameFromUrl(value: string) {
  return value.split(/[?#]/)[0]?.split('/').filter(Boolean).pop() || `media-${Date.now()}`;
}

function mimeTypeFromUrl(value: string) {
  const clean = value.split(/[?#]/)[0]?.toLowerCase() || '';
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'image/jpeg';
  if (clean.endsWith('.png')) return 'image/png';
  if (clean.endsWith('.webp')) return 'image/webp';
  if (clean.endsWith('.gif')) return 'image/gif';
  if (clean.endsWith('.svg')) return 'image/svg+xml';
  return 'application/octet-stream';
}

function toDate(value: unknown) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `item-${Date.now()}`;
}

function resourceConfig(resource: CmsResource) {
  const config = resourceMap[resource];
  if (!config) throw new AdminApiError('VALIDATION_ERROR', `Unsupported CMS resource: ${resource}`, 400);
  return config;
}

function metaValue(meta: Array<{ key: string; value: unknown }> | undefined, key: string) {
  return meta?.find((entry) => entry.key === key)?.value;
}

function postTranslations(post: { meta?: Array<{ key: string; value: unknown }> }) {
  const translations = metaValue(post.meta, 'translations');
  return isRecord(translations) ? translations : {};
}

function postMetaMap(post: { meta?: Array<{ key: string; value: unknown }> }) {
  return Object.fromEntries((post.meta || []).map((entry) => [entry.key, entry.value]));
}

function translationsPayload(body: Record<string, unknown>) {
  if (hasOwnKey(body, 'translations')) {
    if (body.translations === null) return null;
    if (!isRecord(body.translations)) throw new AdminApiError('VALIDATION_ERROR', 'translations must be a JSON object.', 400);
    return body.translations;
  }

  const meta = isRecord(body.meta) ? body.meta : null;
  if (meta && hasOwnKey(meta, 'translations')) {
    if (meta.translations === null) return null;
    if (!isRecord(meta.translations)) throw new AdminApiError('VALIDATION_ERROR', 'meta.translations must be a JSON object.', 400);
    return meta.translations;
  }

  return undefined;
}

function normalizeStatus(value: unknown): CmsPostStatus {
  const candidate = typeof value === 'string' ? value.toUpperCase() : '';
  return (statusValues.includes(candidate as CmsPostStatus) ? candidate : 'DRAFT') as CmsPostStatus;
}

function monthRange(value: string) {
  if (!value || value === 'ALL') return null;
  const now = new Date();
  const start = value === 'current'
    ? new Date(now.getFullYear(), now.getMonth(), 1)
    : value === 'previous'
      ? new Date(now.getFullYear(), now.getMonth() - 1, 1)
      : /^\d{4}-\d{2}$/.test(value)
        ? new Date(Number(value.slice(0, 4)), Number(value.slice(5, 7)) - 1, 1)
        : null;
  if (!start || Number.isNaN(start.getTime())) return null;
  return { gte: start, lt: new Date(start.getFullYear(), start.getMonth() + 1, 1) };
}

async function uniqueSlug(postType: CmsPostType, value: string, ignoreId?: string) {
  const base = slugify(value);
  let suffix = 0;
  while (true) {
    const slug = suffix === 0 ? base : `${base}-${suffix + 1}`;
    const existing = await prisma.post.findFirst({
      where: {
        postType,
        slug,
        ...(ignoreId ? { NOT: { id: ignoreId } } : {})
      },
      select: { id: true }
    });
    if (!existing) return slug;
    suffix += 1;
  }
}

function mapPost(post: Prisma.PostGetPayload<{
  include: {
    author: { select: { id: true; displayName: true; email: true; username: true; role: { select: { key: true; name: true } } } };
    featuredImage: true;
    categories: { include: { category: true } };
    tags: { include: { tag: true } };
    media: { include: { media: true } };
    revisions: { select: { id: true; createdAt: true; title: true } };
    tourMeta: true;
    meta: true;
  };
}>) {
  return {
    id: post.id,
    postType: post.postType,
    status: post.status,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    canonicalUrl: post.canonicalUrl,
    author: post.author,
    featuredImage: post.featuredImage,
    categories: post.categories.map((entry) => entry.category),
    tags: post.tags.map((entry) => entry.tag),
    media: post.media.map((entry) => ({ ...entry.media, role: entry.role, sortOrder: entry.sortOrder })),
    parentId: post.parentId,
    menuOrder: post.menuOrder,
    scheduledAt: post.scheduledAt,
    publishedAt: post.publishedAt,
    trashedAt: post.trashedAt,
    tourMeta: post.tourMeta,
    translations: postTranslations(post),
    meta: postMetaMap(post),
    revisionsCount: post.revisions.length,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt
  };
}

function contentInclude() {
  return {
    author: { select: { id: true, displayName: true, email: true, username: true, role: { select: { key: true, name: true } } } },
    featuredImage: true,
    categories: { include: { category: true } },
    tags: { include: { tag: true } },
    media: { include: { media: true } },
    revisions: { select: { id: true, createdAt: true, title: true } },
    tourMeta: true,
    meta: true
  } satisfies Prisma.PostInclude;
}

export function capabilityForResource(resource: CmsResource) {
  return resourceConfig(resource).capability;
}

export async function listContent(resource: CmsResource, params: URLSearchParams) {
  const { postType } = resourceConfig(resource);
  const page = Math.max(1, Number(params.get('page') || '1'));
  const perPage = Math.min(100, Math.max(1, Number(params.get('perPage') || '20')));
  const search = params.get('search')?.trim() || '';
  const status = params.get('status')?.trim().toUpperCase() || 'ALL';
  const category = params.get('category')?.trim() || 'ALL';
  const month = params.get('month')?.trim() || 'ALL';
  const orderBy = params.get('orderBy') || 'updatedAt';
  const order = params.get('order')?.toLowerCase() === 'asc' ? 'asc' : 'desc';

  const where: Prisma.PostWhereInput = { postType };
  if (status !== 'ALL') {
    if (!statusValues.includes(status as CmsPostStatus)) throw new AdminApiError('VALIDATION_ERROR', `Unsupported status filter: ${status}`, 400);
    where.status = status as CmsPostStatus;
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } }
    ];
  }
  if (category !== 'ALL') {
    if (category === 'with-category') {
      where.categories = { some: {} };
    } else if (category === 'uncategorized') {
      where.categories = { none: {} };
    } else {
      where.categories = { some: { categoryId: category } };
    }
  }
  const createdRange = monthRange(month);
  if (createdRange) {
    where.createdAt = createdRange;
  }

  const sortableFields: Record<string, Prisma.PostOrderByWithRelationInput> = {
    title: { title: order },
    slug: { slug: order },
    status: { status: order },
    publishedAt: { publishedAt: order },
    updatedAt: { updatedAt: order },
    createdAt: { createdAt: order }
  };
  const orderByClause = sortableFields[orderBy] || sortableFields.updatedAt;

  const [total, items] = await prisma.$transaction([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      include: contentInclude(),
      orderBy: orderByClause,
      skip: (page - 1) * perPage,
      take: perPage
    })
  ]);

  return {
    items: items.map(mapPost),
    pagination: { page, perPage, total, totalPages: Math.max(1, Math.ceil(total / perPage)) }
  };
}

async function syncPostRelations(tx: Prisma.TransactionClient, postId: string, input: {
  categoryIds?: string[];
  tagIds?: string[];
  mediaIds?: string[];
  featuredImageId?: string | null;
}) {
  if (input.categoryIds !== undefined) {
    await tx.postCategory.deleteMany({ where: { postId } });
    if (input.categoryIds.length) {
      await tx.postCategory.createMany({
        data: input.categoryIds.map((categoryId) => ({ postId, categoryId }))
      });
    }
  }
  if (input.tagIds !== undefined) {
    await tx.postTag.deleteMany({ where: { postId } });
    if (input.tagIds.length) {
      await tx.postTag.createMany({
        data: input.tagIds.map((tagId) => ({ postId, tagId }))
      });
    }
  }
  if (input.mediaIds !== undefined) {
    await tx.postMedia.deleteMany({ where: { postId } });
    if (input.mediaIds.length) {
      await tx.postMedia.createMany({
        data: input.mediaIds.map((mediaId, index) => ({ postId, mediaId, role: 'gallery', sortOrder: index }))
      });
    }
  }
  if (input.featuredImageId !== undefined) {
    await tx.post.update({ where: { id: postId }, data: { featuredImageId: input.featuredImageId } });
  }
}

function revisionSnapshot(post: Prisma.PostGetPayload<{ include: { categories: { include: { category: true } }; tags: { include: { tag: true } }; media: { include: { media: true } }; featuredImage: true; tourMeta: true; meta: true } }>) {
  return {
    id: post.id,
    postType: post.postType,
    status: post.status,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    canonicalUrl: post.canonicalUrl,
    featuredImageId: post.featuredImageId,
    parentId: post.parentId,
    menuOrder: post.menuOrder,
    scheduledAt: post.scheduledAt,
    publishedAt: post.publishedAt,
    trashedAt: post.trashedAt,
    categories: post.categories.map((entry) => entry.categoryId),
    tags: post.tags.map((entry) => entry.tagId),
    media: post.media.map((entry) => ({ mediaId: entry.mediaId, role: entry.role, sortOrder: entry.sortOrder })),
    tourMeta: post.tourMeta,
    translations: postTranslations(post),
    meta: postMetaMap(post)
  };
}

function jsonSnapshot(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function syncPostTranslations(
  tx: Prisma.TransactionClient,
  postId: string,
  translations: Record<string, unknown> | null | undefined
) {
  if (translations === undefined) return;
  if (translations === null) {
    await tx.postMeta.deleteMany({ where: { postId, key: 'translations' } });
    return;
  }
  const value = jsonSnapshot(translations);
  await tx.postMeta.upsert({
    where: { postId_key: { postId, key: 'translations' } },
    update: { value },
    create: { postId, key: 'translations', value }
  });
}

const editablePublicMetaKeys = new Set(['_public_details', '_public_pricing', '_public_faq', '_google_maps_embed']);

function publicMetaPayload(body: Record<string, unknown>) {
  const meta = isRecord(body.meta) ? body.meta : undefined;
  if (!meta) return undefined;
  const entries = Object.entries(meta).filter(([key]) => editablePublicMetaKeys.has(key));
  return entries.length ? Object.fromEntries(entries) : undefined;
}

async function syncPublicPostMeta(
  tx: Prisma.TransactionClient,
  postId: string,
  meta: Record<string, unknown> | undefined
) {
  if (meta === undefined) return;
  for (const [key, value] of Object.entries(meta)) {
    if (!editablePublicMetaKeys.has(key)) continue;
    if (value === null || value === undefined || value === '') {
      await tx.postMeta.deleteMany({ where: { postId, key } });
      continue;
    }
    const jsonValue = jsonSnapshot(value);
    await tx.postMeta.upsert({
      where: { postId_key: { postId, key } },
      update: { value: jsonValue },
      create: { postId, key, value: jsonValue }
    });
  }
}

export async function saveContent(resource: CmsResource, input: unknown, actor: AdminSessionContext) {
  const { postType, capability } = resourceConfig(resource);
  if (!actor.capabilities.includes(capability) && !actor.capabilities.includes(capabilityForWriteResource(resource))) {
    throw new AdminApiError('FORBIDDEN', `Capability required: ${capability}.`, 403);
  }

  const body = typeof input === 'object' && input !== null ? input as Record<string, unknown> : {};
  const hasOwn = (key: string) => Object.prototype.hasOwnProperty.call(body, key);
  const id = stringValue(body.id);
  const title = stringValue(body.title, 'Untitled');
  const slug = await uniqueSlug(postType, stringValue(body.slug, title), id || undefined);
  const excerpt = stringValue(body.excerpt);
  const content = stringValue(body.content);
  const seoTitle = stringValue(body.seoTitle, title);
  const seoDescription = stringValue(body.seoDescription, excerpt);
  const canonicalUrl = stringValue(body.canonicalUrl);
  const status = normalizeStatus(body.status);
  const translations = translationsPayload(body);
  const publicMeta = publicMetaPayload(body);
  const categoryIds = hasOwn('categoryIds') ? arrayOfStrings(body.categoryIds) : undefined;
  const tagIds = hasOwn('tagIds') ? arrayOfStrings(body.tagIds) : undefined;
  const mediaIds = hasOwn('mediaIds') ? arrayOfStrings(body.mediaIds) : undefined;
  const featuredImageId = hasOwn('featuredImageId') ? (stringValue(body.featuredImageId) || null) : undefined;
  const featuredImageUrl = stringValue(body.featuredImageUrl || body.featuredImage);
  const parentId = hasOwn('parentId') ? (stringValue(body.parentId) || null) : undefined;
  const menuOrder = hasOwn('menuOrder') && Number.isFinite(Number(body.menuOrder)) ? Number(body.menuOrder) : undefined;
  const scheduledAt = hasOwn('scheduledAt') ? toDate(body.scheduledAt) : undefined;
  const publishedAt = hasOwn('publishedAt') ? toDate(body.publishedAt) : undefined;
  const explicitTrashedAt = hasOwn('trashedAt');
  const trashedAt = explicitTrashedAt ? toDate(body.trashedAt) : undefined;
  const tourMetaInput = hasOwn('tourMeta') && typeof body.tourMeta === 'object' && body.tourMeta ? body.tourMeta as Record<string, unknown> : undefined;

  const existing = id ? await prisma.post.findUnique({
    where: { id },
    include: { categories: { include: { category: true } }, tags: { include: { tag: true } }, media: { include: { media: true } }, featuredImage: true, tourMeta: true, meta: true }
  }) : null;
  if (id && !existing) throw new AdminApiError('NOT_FOUND', 'Content item not found.', 404);

  const snapshot = existing ? revisionSnapshot(existing) : null;
  const nextTrashedAt = explicitTrashedAt
    ? (status === 'TRASH' ? trashedAt ?? existing?.trashedAt ?? new Date() : trashedAt)
    : (status === 'TRASH' ? existing?.trashedAt ?? new Date() : null);

  const saved = await prisma.$transaction(async (tx) => {
    const resolvedFeaturedImageId = featuredImageId === undefined && featuredImageUrl
      ? (await tx.media.upsert({
        where: { url: featuredImageUrl },
        update: {},
        create: {
          fileName: fileNameFromUrl(featuredImageUrl),
          originalName: fileNameFromUrl(featuredImageUrl),
          mimeType: mimeTypeFromUrl(featuredImageUrl),
          kind: mimeTypeFromUrl(featuredImageUrl).startsWith('image/') ? 'IMAGE' : 'OTHER',
          url: featuredImageUrl,
          size: 0,
          altText: title,
          caption: title,
          authorId: actor.user.id
        }
      })).id
      : featuredImageId;

    if (existing && snapshot) {
      await tx.revision.create({
        data: {
          entityType: 'POST',
          postId: existing.id,
          title: existing.title,
          snapshot: jsonSnapshot(snapshot),
          authorId: actor.user.id
        }
      });
    }

    const post = existing
      ? await tx.post.update({
        where: { id: existing.id },
        data: {
          postType,
          status,
          title,
          slug,
          excerpt,
          content,
          seoTitle,
          seoDescription,
          canonicalUrl,
          authorId: actor.user.id,
          ...(resolvedFeaturedImageId !== undefined ? { featuredImageId: resolvedFeaturedImageId } : {}),
          ...(parentId !== undefined ? { parentId } : {}),
          ...(menuOrder !== undefined ? { menuOrder } : {}),
          ...(scheduledAt !== undefined ? { scheduledAt } : {}),
          ...(publishedAt !== undefined ? { publishedAt } : {}),
          trashedAt: nextTrashedAt
        },
        include: contentInclude()
      })
      : await tx.post.create({
        data: {
          postType,
          status,
          title,
          slug,
          excerpt,
          content,
          seoTitle,
          seoDescription,
          canonicalUrl,
          authorId: actor.user.id,
          ...(resolvedFeaturedImageId !== undefined ? { featuredImageId: resolvedFeaturedImageId } : {}),
          ...(parentId !== undefined ? { parentId } : {}),
          ...(menuOrder !== undefined ? { menuOrder } : {}),
          ...(scheduledAt !== undefined ? { scheduledAt } : {}),
          ...(publishedAt !== undefined ? { publishedAt } : {}),
          trashedAt: nextTrashedAt
        },
        include: contentInclude()
      });

    const nextMediaIds = mediaIds === undefined && resolvedFeaturedImageId ? [resolvedFeaturedImageId] : mediaIds;
    await syncPostRelations(tx, post.id, { categoryIds, tagIds, mediaIds: nextMediaIds, featuredImageId: resolvedFeaturedImageId });

    if (postType === 'TOUR' && tourMetaInput !== undefined) {
      const meta = tourMetaInput;
      const hasMeta = (key: string) => Object.prototype.hasOwnProperty.call(meta, key);
      await tx.tourMeta.upsert({
        where: { postId: post.id },
        update: {
          ...(hasMeta('basePrice') ? { basePrice: meta.basePrice === undefined || meta.basePrice === null || meta.basePrice === '' ? null : new Prisma.Decimal(String(meta.basePrice)) } : {}),
          ...(hasMeta('currency') ? { currency: stringValue(meta.currency, 'USD') } : {}),
          ...(hasMeta('duration') ? { duration: stringValue(meta.duration) } : {}),
          ...(hasMeta('availability') ? { availability: stringValue(meta.availability, 'available') } : {}),
          ...(hasMeta('gallery') ? { gallery: Array.isArray(meta.gallery) ? meta.gallery as Prisma.InputJsonValue : Prisma.JsonNull } : {}),
          ...(hasMeta('itinerary') ? { itinerary: Array.isArray(meta.itinerary) || typeof meta.itinerary === 'object' ? meta.itinerary as Prisma.InputJsonValue : Prisma.JsonNull } : {})
        },
        create: {
          postId: post.id,
          basePrice: meta.basePrice === undefined || meta.basePrice === null || meta.basePrice === '' ? null : new Prisma.Decimal(String(meta.basePrice)),
          currency: stringValue(meta.currency, 'USD'),
          duration: stringValue(meta.duration),
          availability: stringValue(meta.availability, 'available'),
          gallery: Array.isArray(meta.gallery) ? meta.gallery as Prisma.InputJsonValue : Prisma.JsonNull,
          itinerary: Array.isArray(meta.itinerary) || typeof meta.itinerary === 'object' ? meta.itinerary as Prisma.InputJsonValue : Prisma.JsonNull
        }
      });
    }

    await syncPostTranslations(tx, post.id, translations);
    await syncPublicPostMeta(tx, post.id, publicMeta);

    return tx.post.findUniqueOrThrow({ where: { id: post.id }, include: contentInclude() });
  });

  return mapPost(saved);
}

export async function trashContent(resource: CmsResource, id: string, actor: AdminSessionContext) {
  const { capability, postType } = resourceConfig(resource);
  if (!actor.capabilities.includes(capability) && !actor.capabilities.includes(capabilityForWriteResource(resource))) {
    throw new AdminApiError('FORBIDDEN', `Capability required: ${capability}.`, 403);
  }
  const post = await prisma.post.findFirst({
    where: { id, postType },
    include: { categories: { include: { category: true } }, tags: { include: { tag: true } }, media: { include: { media: true } }, featuredImage: true, tourMeta: true, meta: true }
  });
  if (!post) throw new AdminApiError('NOT_FOUND', 'Content item not found.', 404);
  await prisma.revision.create({
    data: {
      entityType: 'POST',
      postId: post.id,
      title: post.title,
      snapshot: jsonSnapshot(revisionSnapshot(post)),
      authorId: actor.user.id
    }
  });
  await prisma.post.update({ where: { id }, data: { status: 'TRASH', trashedAt: new Date() } });
  return { ok: true };
}

export async function restoreRevision(revisionId: string, actor: AdminSessionContext) {
  const revision = await prisma.revision.findUnique({ where: { id: revisionId } });
  if (!revision || !revision.postId) throw new AdminApiError('NOT_FOUND', 'Revision not found.', 404);
  if (!actor.capabilities.includes('restore_revisions')) throw new AdminApiError('FORBIDDEN', 'Capability required: restore_revisions.', 403);
  const snapshot = revision.snapshot as Record<string, unknown>;
  const id = stringValue(snapshot.id);
  if (!id) throw new AdminApiError('VALIDATION_ERROR', 'Revision snapshot is missing a post id.', 400);
  const current = await prisma.post.findUnique({
    where: { id },
    include: { categories: { include: { category: true } }, tags: { include: { tag: true } }, media: { include: { media: true } }, featuredImage: true, tourMeta: true, meta: true }
  });
  if (!current) throw new AdminApiError('NOT_FOUND', 'Content item not found for revision restore.', 404);
  const categoryIds = arrayOfStrings(snapshot.categories);
  const tagIds = arrayOfStrings(snapshot.tags);
  const mediaIds = Array.isArray(snapshot.media)
    ? snapshot.media.map((entry) => typeof entry === 'object' && entry ? stringValue((entry as Record<string, unknown>).mediaId) : '').filter(Boolean)
    : undefined;
  const restored = await prisma.$transaction(async (tx) => {
    const restoreRevision = await tx.revision.create({
      data: {
        entityType: 'POST',
        postId: current.id,
        title: `Before restoring ${current.title}`,
        snapshot: jsonSnapshot(revisionSnapshot(current)),
        authorId: actor.user.id
      }
    });
    await tx.post.update({
      where: { id },
      data: {
        status: normalizeStatus(snapshot.status),
        title: stringValue(snapshot.title),
        slug: stringValue(snapshot.slug),
        excerpt: stringValue(snapshot.excerpt),
        content: stringValue(snapshot.content),
        seoTitle: stringValue(snapshot.seoTitle),
        seoDescription: stringValue(snapshot.seoDescription),
        canonicalUrl: stringValue(snapshot.canonicalUrl),
        featuredImageId: stringValue(snapshot.featuredImageId) || null,
        parentId: stringValue(snapshot.parentId) || null,
        menuOrder: Number(snapshot.menuOrder || 0),
        scheduledAt: toDate(snapshot.scheduledAt),
        publishedAt: toDate(snapshot.publishedAt),
        trashedAt: toDate(snapshot.trashedAt)
      }
    });
    await syncPostRelations(tx, id, {
      categoryIds,
      tagIds,
      mediaIds,
      featuredImageId: stringValue(snapshot.featuredImageId) || null
    });
    if (typeof snapshot.tourMeta === 'object' && snapshot.tourMeta) {
      const tourMeta = snapshot.tourMeta as Record<string, unknown>;
      await tx.tourMeta.upsert({
        where: { postId: id },
        update: {
          basePrice: tourMeta.basePrice == null ? null : String(tourMeta.basePrice),
          currency: stringValue(tourMeta.currency, 'USD'),
          duration: stringValue(tourMeta.duration),
          availability: stringValue(tourMeta.availability, 'available'),
          gallery: jsonSnapshot(tourMeta.gallery || []),
          itinerary: jsonSnapshot(tourMeta.itinerary || {})
        },
        create: {
          postId: id,
          basePrice: tourMeta.basePrice == null ? null : String(tourMeta.basePrice),
          currency: stringValue(tourMeta.currency, 'USD'),
          duration: stringValue(tourMeta.duration),
          availability: stringValue(tourMeta.availability, 'available'),
          gallery: jsonSnapshot(tourMeta.gallery || []),
          itinerary: jsonSnapshot(tourMeta.itinerary || {})
        }
      });
    } else {
      await tx.tourMeta.deleteMany({ where: { postId: id } });
    }
    if (hasOwnKey(snapshot, 'translations')) {
      await syncPostTranslations(tx, id, isRecord(snapshot.translations) ? snapshot.translations : null);
    }
    return restoreRevision;
  });
  return { ok: true, revisionId: restored.id };
}

export async function saveAutosave(resource: CmsResource, input: unknown, actor: AdminSessionContext) {
  const { postType, capability } = resourceConfig(resource);
  if (!actor.capabilities.includes(capability) && !actor.capabilities.includes(capabilityForWriteResource(resource))) {
    throw new AdminApiError('FORBIDDEN', `Capability required: ${capability}.`, 403);
  }
  const body = typeof input === 'object' && input !== null ? input as Record<string, unknown> : {};
  const postId = stringValue(body.postId || body.id);
  if (!postId) throw new AdminApiError('VALIDATION_ERROR', 'postId is required.', 400);
  const post = await prisma.post.findFirst({ where: { id: postId, postType } });
  if (!post) throw new AdminApiError('NOT_FOUND', 'Content item not found.', 404);
  const translations = translationsPayload(body);
  const snapshot = {
    title: stringValue(body.title, post.title),
    slug: stringValue(body.slug, post.slug),
    excerpt: stringValue(body.excerpt, post.excerpt),
    content: stringValue(body.content, post.content),
    seoTitle: stringValue(body.seoTitle, post.seoTitle),
    seoDescription: stringValue(body.seoDescription, post.seoDescription),
    status: normalizeStatus(body.status),
    featuredImageUrl: stringValue(body.featuredImageUrl || body.featuredImage),
    featuredImageId: stringValue(body.featuredImageId) || post.featuredImageId,
    parentId: stringValue(body.parentId) || post.parentId,
    menuOrder: Number.isFinite(Number(body.menuOrder)) ? Number(body.menuOrder) : post.menuOrder,
    publicDetailsJson: body.publicDetailsJson,
    publicPricingJson: body.publicPricingJson,
    publicFaqJson: body.publicFaqJson,
    itineraryJson: body.itineraryJson,
    googleMapsEmbed: stringValue(body.googleMapsEmbed),
    overview: stringValue(body.overview),
    conciergeNote: stringValue(body.conciergeNote),
    signatureMoments: stringValue(body.signatureMoments),
    departure: stringValue(body.departure),
    category: stringValue(body.category),
    theme: stringValue(body.theme),
    route: stringValue(body.route),
    suitable: stringValue(body.suitable),
    tourType: stringValue(body.tourType),
    includes: stringValue(body.includes),
    excludes: stringValue(body.excludes),
    meals: stringValue(body.meals),
    transport: stringValue(body.transport),
    accommodation: stringValue(body.accommodation),
    reviewQuote: stringValue(body.reviewQuote),
    reviewRating: stringValue(body.reviewRating),
    reviewCount: stringValue(body.reviewCount),
    sourceUrl: stringValue(body.sourceUrl),
    tourMeta: body.tourMeta,
    meta: body.meta,
    ...(translations !== undefined ? { translations } : {}),
    updatedAt: new Date().toISOString()
  };
  await prisma.autosave.upsert({
    where: { postId_authorId: { postId, authorId: actor.user.id } },
    update: { snapshot: snapshot as Prisma.InputJsonValue },
    create: { postId, authorId: actor.user.id, snapshot: snapshot as Prisma.InputJsonValue }
  });
  return { ok: true };
}

export async function listRevisions(postId: string) {
  return prisma.revision.findMany({ where: { postId }, orderBy: { createdAt: 'desc' } });
}

export async function getAutosave(postId: string, authorId: string) {
  return prisma.autosave.findUnique({ where: { postId_authorId: { postId, authorId } } });
}

export async function deleteAutosave(postId: string, authorId: string) {
  await prisma.autosave.deleteMany({ where: { postId, authorId } });
  return { deleted: true };
}
