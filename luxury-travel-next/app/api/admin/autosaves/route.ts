import { NextRequest } from 'next/server';
import { adminOk, handleAdminApiError, readValidatedJson, AdminApiError } from '@/lib/admin/api';
import { requireAdminCapability, requireAdminMutationCapability } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit-service';
import { deleteAutosave, getAutosave, saveAutosave, type CmsResource } from '@/lib/admin/content-service';
import { autosaveDeleteSchema, autosaveMutationSchema } from '@/lib/admin/schemas';

export const dynamic = 'force-dynamic';

function normalizeResource(value: unknown): CmsResource {
  if (value === 'pages' || value === 'tours' || value === 'products' || value === 'cruises') return value;
  if (value === 'posts' || value === undefined || value === null || value === '') return 'posts';
  throw new AdminApiError('VALIDATION_ERROR', 'Unsupported autosave resource.', 400);
}

export async function GET(request: NextRequest) {
  try {
    const actor = await requireAdminCapability(request, 'edit_posts');
    const postId = request.nextUrl.searchParams.get('postId')?.trim();
    if (!postId) throw new AdminApiError('VALIDATION_ERROR', 'postId is required.', 400);
    const item = await getAutosave(postId, actor.user.id);
    return adminOk({ item });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireAdminMutationCapability(request, 'edit_posts');
    const body = await readValidatedJson(request, autosaveMutationSchema);
    const resource = normalizeResource(body.resource);
    const result = await saveAutosave(resource, body, actor);
    await writeAuditLog({ actor, action: 'autosave_save', entityType: 'Autosave', entityId: body.postId || body.id, after: result, metadata: { resource }, request });
    return adminOk(result);
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const actor = await requireAdminMutationCapability(request, 'edit_posts');
    const body = await readValidatedJson(request, autosaveDeleteSchema);
    const postId = body.postId || body.id;
    if (!postId) throw new AdminApiError('VALIDATION_ERROR', 'postId is required.', 400);
    const before = await getAutosave(postId, actor.user.id);
    const result = await deleteAutosave(postId, actor.user.id);
    await writeAuditLog({ actor, action: 'autosave_dismiss', entityType: 'Autosave', entityId: postId, before, after: result, request });
    return adminOk(result);
  } catch (error) {
    return handleAdminApiError(error);
  }
}
