import { NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';
import { adminOk, handleAdminApiError, readValidatedJson } from '@/lib/admin/api';
import { requireAdminCapability, requireAdminMutationCapability } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit-service';
import { cmsContentMutationSchema, cmsDeleteSchema } from '@/lib/admin/schemas';
import { capabilityForResource, listContent, saveContent, trashContent, type CmsResource } from '@/lib/admin/content-service';

const AUDIT_NAME = 'product';
const RESOURCE = 'products' as CmsResource;
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireAdminCapability(request, 'read_admin');
    return adminOk(await listContent(RESOURCE, request.nextUrl.searchParams));
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireAdminMutationCapability(request, capabilityForResource(RESOURCE));
    const body = await readValidatedJson(request, cmsContentMutationSchema);
    const item = await saveContent(RESOURCE, body, actor);
    await writeAuditLog({ actor, action: `${AUDIT_NAME}_create`, entityType: 'Post', entityId: item.id, after: item, metadata: { resource: RESOURCE, postType: item.postType }, request });
    revalidateTag(`cms:${RESOURCE}`, 'max');
    revalidateTag('cms:site', 'max');
    return adminOk({ item }, { status: 201 });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const actor = await requireAdminMutationCapability(request, capabilityForResource(RESOURCE));
    const body = await readValidatedJson(request, cmsContentMutationSchema);
    const item = await saveContent(RESOURCE, body, actor);
    await writeAuditLog({ actor, action: `${AUDIT_NAME}_update`, entityType: 'Post', entityId: item.id, after: item, metadata: { resource: RESOURCE, postType: item.postType }, request });
    revalidateTag(`cms:${RESOURCE}`, 'max');
    revalidateTag('cms:site', 'max');
    return adminOk({ item });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const actor = await requireAdminMutationCapability(request, capabilityForResource(RESOURCE));
    const body = await readValidatedJson(request, cmsDeleteSchema);
    const id = body.id;
    await trashContent(RESOURCE, id, actor);
    await writeAuditLog({ actor, action: `${AUDIT_NAME}_trash`, entityType: 'Post', entityId: id, metadata: { resource: RESOURCE }, request });
    revalidateTag(`cms:${RESOURCE}`, 'max');
    revalidateTag('cms:site', 'max');
    return adminOk({ trashed: true });
  } catch (error) {
    return handleAdminApiError(error);
  }
}



