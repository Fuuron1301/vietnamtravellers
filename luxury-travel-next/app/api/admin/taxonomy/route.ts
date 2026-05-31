import { NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';
import { adminOk, handleAdminApiError, readValidatedJson, idBodySchema } from '@/lib/admin/api';
import { requireAdminCapability, requireAdminMutationCapability } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit-service';
import { taxonomyMutationSchema } from '@/lib/admin/schemas';
import { deleteTaxonomy, listTaxonomy, normalizeTaxonomyKind, saveTaxonomy } from '@/lib/admin/taxonomy-service';

export const dynamic = 'force-dynamic';

const taxonomyDeleteSchema = idBodySchema.extend({
  kind: taxonomyMutationSchema.shape.kind
});

export async function GET(request: NextRequest) {
  try {
    await requireAdminCapability(request, 'read_admin');
    return adminOk(await listTaxonomy(normalizeTaxonomyKind(request.nextUrl.searchParams.get('kind'))));
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireAdminMutationCapability(request, 'manage_taxonomy');
    const body = await readValidatedJson(request, taxonomyMutationSchema);
    const result = await saveTaxonomy(body);
    revalidateTag('cms:taxonomy', 'max');
    await writeAuditLog({ actor, action: `${result.kind === 'tags' ? 'tag' : 'category'}_create`, entityType: result.kind === 'tags' ? 'Tag' : 'Category', entityId: result.item.id, after: result.item, request });
    return adminOk(result, { status: 201 });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const actor = await requireAdminMutationCapability(request, 'manage_taxonomy');
    const body = await readValidatedJson(request, taxonomyMutationSchema);
    const result = await saveTaxonomy(body);
    revalidateTag('cms:taxonomy', 'max');
    await writeAuditLog({ actor, action: `${result.kind === 'tags' ? 'tag' : 'category'}_update`, entityType: result.kind === 'tags' ? 'Tag' : 'Category', entityId: result.item.id, after: result.item, request });
    return adminOk(result);
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const actor = await requireAdminMutationCapability(request, 'manage_taxonomy');
    const body = await readValidatedJson(request, taxonomyDeleteSchema);
    const result = await deleteTaxonomy(body);
    revalidateTag('cms:taxonomy', 'max');
    await writeAuditLog({ actor, action: `${result.kind === 'tags' ? 'tag' : 'category'}_delete`, entityType: result.kind === 'tags' ? 'Tag' : 'Category', entityId: body.id, request });
    return adminOk(result);
  } catch (error) {
    return handleAdminApiError(error);
  }
}
