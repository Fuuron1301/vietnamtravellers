import { NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';
import { adminOk, handleAdminApiError, readValidatedJson, AdminApiError } from '@/lib/admin/api';
import { requireAdminCapability, requireAdminMutationCapability } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit-service';
import { deleteEntityMeta, getEntityMeta, setEntityMeta, type MetaEntityType } from '@/lib/admin/meta-service';
import { metaMutationSchema } from '@/lib/admin/schemas';
import type { AdminCapability } from '@/lib/admin/rbac';

export const dynamic = 'force-dynamic';

function capabilityForMetaMutation(entityType: MetaEntityType): AdminCapability {
  if (entityType === 'post') return 'edit_posts';
  if (entityType === 'media') return 'manage_media';
  if (entityType === 'user') return 'manage_users';
  return 'manage_taxonomy';
}

function revalidateMetaEntity(entityType: MetaEntityType) {
  if (entityType === 'post') revalidateTag('cms:posts', 'max');
  if (entityType === 'media') revalidateTag('cms:media', 'max');
  if (entityType === 'category' || entityType === 'tag') revalidateTag('cms:taxonomy', 'max');
  revalidateTag('cms:site', 'max');
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminCapability(request, 'read_admin');
    const entityType = request.nextUrl.searchParams.get('entityType') as MetaEntityType | null;
    const entityId = request.nextUrl.searchParams.get('entityId')?.trim() || '';
    if (!entityType || !entityId) throw new AdminApiError('VALIDATION_ERROR', 'entityType and entityId are required.', 400);
    return adminOk({ items: await getEntityMeta(entityType, entityId) });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await readValidatedJson(request, metaMutationSchema);
    const actor = await requireAdminMutationCapability(request, capabilityForMetaMutation(body.entityType));
    const before = await getEntityMeta(body.entityType, body.entityId);
    const item = body.action === 'delete'
      ? await deleteEntityMeta(body.entityType, body.entityId, body.key)
      : await setEntityMeta(body.entityType, body.entityId, body.key, body.value);
    await writeAuditLog({ actor, action: body.action === 'delete' ? 'meta_delete' : 'meta_set', entityType: `${body.entityType}Meta`, entityId: body.entityId, before, after: item, metadata: { key: body.key }, request });
    revalidateMetaEntity(body.entityType);
    return adminOk({ item });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await readValidatedJson(request, metaMutationSchema);
    const actor = await requireAdminMutationCapability(request, capabilityForMetaMutation(body.entityType));
    const before = await getEntityMeta(body.entityType, body.entityId);
    const item = await deleteEntityMeta(body.entityType, body.entityId, body.key);
    await writeAuditLog({ actor, action: 'meta_delete', entityType: `${body.entityType}Meta`, entityId: body.entityId, before, after: item, metadata: { key: body.key }, request });
    revalidateMetaEntity(body.entityType);
    return adminOk({ item });
  } catch (error) {
    return handleAdminApiError(error);
  }
}
