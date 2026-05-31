import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';
import { adminOk, handleAdminApiError, readValidatedJson, AdminApiError, idBodySchema } from '@/lib/admin/api';
import { requireAdminCapability, requireAdminMutationCapability } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit-service';
import { mediaUpdateSchema, mediaUrlMutationSchema } from '@/lib/admin/schemas';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function sanitizeFileName(value: string) {
  const ext = path.extname(value).toLowerCase().replace(/[^.a-z0-9]/g, '');
  const base = path.basename(value, ext).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'media';
  return `${base}-${Date.now()}${ext || ''}`;
}

function mediaKind(mimeType: string) {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.startsWith('audio/')) return 'AUDIO';
  if (mimeType === 'application/pdf' || mimeType.startsWith('text/')) return 'DOCUMENT';
  return 'OTHER';
}

function parseMonthFilter(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  if (!Number.isInteger(year) || !Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) return null;
  const start = new Date(Date.UTC(year, monthIndex, 1));
  const end = new Date(Date.UTC(year, monthIndex + 1, 1));
  return { start, end };
}

function monthValue(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(value: string) {
  const [year, month] = value.split('-');
  return `${month}/${year}`;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminCapability(request, 'read_admin');
    const page = Math.max(1, Number(request.nextUrl.searchParams.get('page') || '1'));
    const perPage = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get('perPage') || '40')));
    const search = request.nextUrl.searchParams.get('search')?.trim() || '';
    const kind = request.nextUrl.searchParams.get('kind')?.trim().toUpperCase() || '';
    const month = parseMonthFilter(request.nextUrl.searchParams.get('month')?.trim() || '');
    const where: Prisma.MediaWhereInput = {
      ...(kind && ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'OTHER'].includes(kind) ? { kind: kind as 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'OTHER' } : {}),
      ...(month ? { createdAt: { gte: month.start, lt: month.end } } : {}),
      ...(search ? {
        OR: [
          { originalName: { contains: search, mode: 'insensitive' } },
          { fileName: { contains: search, mode: 'insensitive' } },
          { url: { contains: search, mode: 'insensitive' } },
          { altText: { contains: search, mode: 'insensitive' } },
          { caption: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      } : {})
    };
    const [total, items, monthRows] = await prisma.$transaction([
      prisma.media.count({ where }),
      prisma.media.findMany({
        where,
        include: {
          meta: { orderBy: { key: 'asc' } },
          featuredPosts: { select: { id: true, title: true, postType: true, slug: true } },
          postLinks: { select: { postId: true, role: true, sortOrder: true, post: { select: { id: true, title: true, postType: true, slug: true } } } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage
      }),
      prisma.media.findMany({ select: { createdAt: true }, orderBy: { createdAt: 'desc' } })
    ]);
    const monthCounts = monthRows.reduce<Record<string, number>>((acc, item) => {
      const value = monthValue(item.createdAt);
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
    const months = Object.entries(monthCounts).map(([value, count]) => ({ value, label: monthLabel(value), count }));
    return adminOk({
      items: items.map((item) => ({
        ...item,
        attachedCount: item.featuredPosts.length + item.postLinks.length,
        attachments: {
          featuredPosts: item.featuredPosts,
          postLinks: item.postLinks
        }
      })),
      months,
      pagination: { page, perPage, total, totalPages: Math.max(1, Math.ceil(total / perPage)) }
    });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireAdminMutationCapability(request, 'upload_files');
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      const file = form.get('file');
      if (!(file instanceof File)) throw new AdminApiError('VALIDATION_ERROR', 'A media file is required.', 400);
      const now = new Date();
      const year = String(now.getFullYear());
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const fileName = sanitizeFileName(file.name);
      const relativeDir = `/uploads/admin/${year}/${month}`;
      const publicDir = path.join(process.cwd(), 'public', relativeDir);
      await mkdir(publicDir, { recursive: true });
      const bytes = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(publicDir, fileName), bytes);
      const item = await prisma.media.create({
        data: {
          fileName,
          originalName: file.name,
          mimeType: file.type || 'application/octet-stream',
          kind: mediaKind(file.type || ''),
          url: `${relativeDir}/${fileName}`,
          size: bytes.byteLength,
          altText: stringValue(form.get('altText')),
          caption: stringValue(form.get('caption')),
          description: stringValue(form.get('description')),
          authorId: actor.user.id
        }
      });
      revalidateTag('cms:media', 'max');
      revalidateTag('cms:site', 'max');
      await writeAuditLog({ actor, action: 'media_upload', entityType: 'Media', entityId: item.id, after: item, metadata: { source: 'upload', fileName: file.name }, request });
      return adminOk({ item }, { status: 201 });
    }

    const body = await readValidatedJson(request, mediaUrlMutationSchema);
    const url = stringValue(body?.url || body?.src);
    if (!url) throw new AdminApiError('VALIDATION_ERROR', 'Media url is required.', 400);
    const item = await prisma.media.create({
      data: {
        fileName: path.basename(url),
        originalName: stringValue(body?.title, path.basename(url)),
        mimeType: stringValue(body?.mimeType, 'application/octet-stream'),
        kind: mediaKind(stringValue(body?.mimeType)),
        url,
        size: Number(body?.size || 0),
        altText: stringValue(body?.altText),
        caption: stringValue(body?.caption),
        description: stringValue(body?.description),
        authorId: actor.user.id
      }
    });
    revalidateTag('cms:media', 'max');
    revalidateTag('cms:site', 'max');
    await writeAuditLog({ actor, action: 'media_create', entityType: 'Media', entityId: item.id, after: item, metadata: { source: 'url' }, request });
    return adminOk({ item }, { status: 201 });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const actor = await requireAdminMutationCapability(request, 'manage_media');
    const body = await readValidatedJson(request, mediaUpdateSchema);
    const action = body.action || 'update';
    const role = stringValue(body.role, 'gallery');

    if (action === 'attach') {
      const postId = stringValue(body.postId);
      if (!postId) throw new AdminApiError('VALIDATION_ERROR', 'postId is required to attach media.', 400);
      const [media, post] = await Promise.all([
        prisma.media.findUnique({ where: { id: body.id } }),
        prisma.post.findUnique({ where: { id: postId }, select: { id: true } })
      ]);
      if (!media) throw new AdminApiError('NOT_FOUND', 'Media item not found.', 404);
      if (!post) throw new AdminApiError('NOT_FOUND', 'Content item not found.', 404);
      const attachment = await prisma.$transaction(async (tx) => {
        const link = await tx.postMedia.upsert({
          where: { postId_mediaId_role: { postId, mediaId: body.id, role } },
          update: { sortOrder: body.sortOrder ?? 0 },
          create: { postId, mediaId: body.id, role, sortOrder: body.sortOrder ?? 0 }
        });
        if (role === 'featured') {
          await tx.post.update({ where: { id: postId }, data: { featuredImageId: body.id } });
        }
        return link;
      });
      revalidateTag('cms:media', 'max');
      revalidateTag('cms:site', 'max');
      await writeAuditLog({ actor, action: 'media_attach', entityType: 'Media', entityId: body.id, after: attachment, metadata: { postId, role }, request });
      return adminOk({ item: media, attachment });
    }

    if (action === 'detach') {
      const postId = stringValue(body.postId);
      if (!postId) throw new AdminApiError('VALIDATION_ERROR', 'postId is required to detach media.', 400);
      const media = await prisma.media.findUnique({ where: { id: body.id } });
      if (!media) throw new AdminApiError('NOT_FOUND', 'Media item not found.', 404);
      await prisma.$transaction(async (tx) => {
        await tx.postMedia.deleteMany({ where: { postId, mediaId: body.id, ...(body.role ? { role } : {}) } });
        await tx.post.updateMany({ where: { id: postId, featuredImageId: body.id }, data: { featuredImageId: null } });
      });
      revalidateTag('cms:media', 'max');
      revalidateTag('cms:site', 'max');
      await writeAuditLog({ actor, action: 'media_detach', entityType: 'Media', entityId: body.id, after: { detached: true }, metadata: { postId, role: body.role ? role : undefined }, request });
      return adminOk({ item: media, detached: true });
    }

    const before = await prisma.media.findUnique({ where: { id: body.id } });
    const item = await prisma.media.update({
      where: { id: body.id },
      data: {
        altText: body.altText,
        caption: body.caption,
        description: body.description,
        originalName: body.title
      }
    });
    revalidateTag('cms:media', 'max');
    revalidateTag('cms:site', 'max');
    await writeAuditLog({ actor, action: 'media_update', entityType: 'Media', entityId: item.id, before, after: item, request });
    return adminOk({ item });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const actor = await requireAdminMutationCapability(request, 'manage_media');
    const body = await readValidatedJson(request, idBodySchema);
    const media = await prisma.media.findUnique({
      where: { id: body.id },
      include: { featuredPosts: { select: { id: true } }, postLinks: { select: { postId: true } } }
    });
    if (!media) throw new AdminApiError('NOT_FOUND', 'Media item not found.', 404);
    if (media.featuredPosts.length || media.postLinks.length) {
      throw new AdminApiError('CONFLICT', 'Media is attached to content. Detach it before deleting.', 409);
    }
    await prisma.media.delete({ where: { id: body.id } });
    revalidateTag('cms:media', 'max');
    revalidateTag('cms:site', 'max');
    await writeAuditLog({ actor, action: 'media_delete', entityType: 'Media', entityId: body.id, before: media, request });
    return adminOk({ deleted: true });
  } catch (error) {
    return handleAdminApiError(error);
  }
}
