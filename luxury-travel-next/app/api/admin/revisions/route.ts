import { NextRequest } from 'next/server';
import { adminOk, handleAdminApiError, readValidatedJson, AdminApiError } from '@/lib/admin/api';
import { requireAdminCapability, requireAdminMutationCapability } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit-service';
import { listRevisions, restoreRevision } from '@/lib/admin/content-service';
import { listBlockRevisions, restoreBlockRevision } from '@/lib/admin/block-service';
import { revisionRestoreSchema } from '@/lib/admin/schemas';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireAdminCapability(request, 'restore_revisions');
    const postId = request.nextUrl.searchParams.get('postId')?.trim();
    const blockTemplateId = request.nextUrl.searchParams.get('blockTemplateId')?.trim();
    const reusableBlockId = request.nextUrl.searchParams.get('reusableBlockId')?.trim();
    if (blockTemplateId || reusableBlockId) return adminOk({ items: await listBlockRevisions(request.nextUrl.searchParams) });
    if (!postId) throw new AdminApiError('VALIDATION_ERROR', 'postId, blockTemplateId, or reusableBlockId is required.', 400);
    return adminOk({ items: await listRevisions(postId) });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireAdminMutationCapability(request, 'restore_revisions');
    const body = await readValidatedJson(request, revisionRestoreSchema);
    const revision = await prisma.revision.findUnique({ where: { id: body.revisionId }, select: { entityType: true } });
    const result = revision?.entityType === 'BLOCK_TEMPLATE' || revision?.entityType === 'REUSABLE_BLOCK'
      ? await restoreBlockRevision(body.revisionId, actor)
      : await restoreRevision(body.revisionId, actor);
    await writeAuditLog({ actor, action: 'revision_restore', entityType: revision?.entityType || 'Revision', entityId: body.revisionId, after: result, request });
    return adminOk(result);
  } catch (error) {
    return handleAdminApiError(error);
  }
}

