import path from 'node:path';
import { revalidateTag } from 'next/cache';
import { NextRequest } from 'next/server';
import { adminOk, handleAdminApiError, readJsonBody, AdminApiError } from '@/lib/admin/api';
import { requireAdminCapability, requireAdminMutationCapability } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit-service';
import { capabilityForResource, saveContent, trashContent, type CmsResource } from '@/lib/admin/content-service';
import { capabilityForWriteResource } from '@/lib/admin/rbac';
import { getAdminSiteContentMirror, saveAdminSiteContentMirror } from '@/lib/admin/site-content-mirror';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function normalizeResource(value: unknown) {
  return stringValue(value, 'site-content');
}

function isCmsResource(resource: string): resource is CmsResource {
  return resource === 'posts' || resource === 'pages' || resource === 'tours' || resource === 'products' || resource === 'cruises';
}

function auditNameForResource(resource: CmsResource) {
  return {
    posts: 'post',
    pages: 'page',
    tours: 'tour',
    products: 'product',
    cruises: 'cruise'
  }[resource];
}

function mediaKind(mimeType: string) {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.startsWith('audio/')) return 'AUDIO';
  if (mimeType === 'application/pdf' || mimeType.startsWith('text/')) return 'DOCUMENT';
  return 'OTHER';
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminCapability(request, 'read_admin');
    const content = await getAdminSiteContentMirror();
    return adminOk({ content });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    const resource = normalizeResource(body?.resource);
    if (isCmsResource(resource)) {
      const actor = await requireAdminMutationCapability(request, capabilityForResource(resource));
      const item = await saveContent(resource, body?.item ?? body, actor);
      await writeAuditLog({ actor, action: `${auditNameForResource(resource)}_legacy_save`, entityType: 'Post', entityId: item.id, after: item, metadata: { resource, legacyMirror: true }, request });
      revalidateTag(`cms:${resource}`, 'max');
      return adminOk({ item }, { status: 201 });
    }

    if (resource === 'media') {
      const actor = await requireAdminMutationCapability(request, 'upload_files');
      const item = typeof body?.item === 'object' && body.item !== null ? body.item as Record<string, unknown> : body;
      const url = stringValue(item.url || item.src);
      if (!url) throw new AdminApiError('VALIDATION_ERROR', 'Media url is required.', 400);
      const saved = await prisma.media.create({
        data: {
          fileName: path.basename(url),
          originalName: stringValue(item.title, path.basename(url)),
          mimeType: stringValue(item.mimeType, 'application/octet-stream'),
          kind: mediaKind(stringValue(item.mimeType)),
          url,
          size: Number(item.size || 0),
          altText: stringValue(item.altText),
          caption: stringValue(item.caption),
          description: stringValue(item.description),
          authorId: actor.user.id
        }
      });
      await writeAuditLog({ actor, action: 'media_legacy_create', entityType: 'Media', entityId: saved.id, after: saved, metadata: { resource, legacyMirror: true }, request });
      return adminOk({ item: saved }, { status: 201 });
    }

    throw new AdminApiError('VALIDATION_ERROR', `Unsupported legacy admin resource: ${resource}`, 400);
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    const resource = normalizeResource(body?.resource);
    if (isCmsResource(resource)) {
      const actor = await requireAdminMutationCapability(request, capabilityForResource(resource));
      const id = stringValue(body?.id);
      await trashContent(resource, id, actor);
      await writeAuditLog({ actor, action: `${auditNameForResource(resource)}_legacy_trash`, entityType: 'Post', entityId: id, metadata: { resource, legacyMirror: true }, request });
      revalidateTag(`cms:${resource}`, 'max');
      return adminOk({ trashed: true });
    }
    if (resource === 'media') {
      const actor = await requireAdminMutationCapability(request, 'manage_media');
      const id = stringValue(body?.id);
      if (!id) throw new AdminApiError('VALIDATION_ERROR', 'Media id is required.', 400);
      const before = await prisma.media.findUnique({ where: { id } });
      await prisma.media.delete({ where: { id } });
      await writeAuditLog({ actor, action: 'media_legacy_delete', entityType: 'Media', entityId: id, before, metadata: { resource, legacyMirror: true }, request });
      return adminOk({ deleted: true });
    }
    throw new AdminApiError('VALIDATION_ERROR', `Unsupported legacy admin resource: ${resource}`, 400);
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    const resource = normalizeResource(body?.resource);
    const actor = await requireAdminMutationCapability(request, capabilityForWriteResource(resource));
    if (resource === 'settings') {
      const content = await saveAdminSiteContentMirror(body?.settings ?? body?.content ?? body);
      revalidateTag('cms:settings', 'max');
      await writeAuditLog({ actor, action: 'site_content_mirror_settings_update', entityType: 'SiteContentMirror', after: content, metadata: { resource, legacyMirror: true }, request });
      return adminOk({ content, settings: content });
    }
    const content = await saveAdminSiteContentMirror(body?.content ?? body);
    await writeAuditLog({ actor, action: 'site_content_mirror_update', entityType: 'SiteContentMirror', after: content, metadata: { resource, legacyMirror: true }, request });
    return adminOk({ content });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

