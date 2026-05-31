import { NextRequest } from 'next/server';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { adminOk, handleAdminApiError, readValidatedJson } from '@/lib/admin/api';
import { requireAdminCapability, requireAdminMutationCapability } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit-service';
import { activateTemplate, deleteBlockTemplate, deleteReusableBlock, listBlockTemplates, listReusableBlocks, saveBlockTemplate, saveReusableBlock } from '@/lib/admin/block-service';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const blockMutationSchema = z.object({
  kind: z.enum(['reusable', 'template']),
  id: z.string().min(1).optional(),
  action: z.enum(['activate']).optional()
}).passthrough();
const blockDeleteSchema = z.object({ id: z.string().min(1), kind: z.enum(['reusable', 'template']) });

function capabilityForKind(kind: 'reusable' | 'template') {
  return kind === 'reusable' ? 'manage_options' : 'edit_pages';
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminCapability(request, 'read_admin');
    const type = request.nextUrl.searchParams.get('type')?.trim();
    if (type === 'reusable') return adminOk(await listReusableBlocks(request.nextUrl.searchParams));
    if (type === 'template') return adminOk(await listBlockTemplates(request.nextUrl.searchParams));
    return adminOk({
      reusable: await listReusableBlocks(request.nextUrl.searchParams),
      templates: await listBlockTemplates(request.nextUrl.searchParams)
    });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await readValidatedJson(request, blockMutationSchema);
    const kind = body.kind;
    const actor = await requireAdminMutationCapability(request, capabilityForKind(kind));
    const item = kind === 'reusable' ? await saveReusableBlock(body, actor) : await saveBlockTemplate(body, actor);
    await writeAuditLog({ actor, action: `${kind}_block_create`, entityType: kind === 'reusable' ? 'ReusableBlock' : 'BlockTemplate', entityId: item.id, after: item, request });
    revalidateTag('cms:blocks', 'max');
    revalidateTag('cms:design', 'max');
    revalidateTag('cms:site', 'max');
    return adminOk({ item }, { status: 201 });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await readValidatedJson(request, blockMutationSchema);
    const kind = body.kind;
    const actor = await requireAdminMutationCapability(request, capabilityForKind(kind));
    const before = body.id
      ? kind === 'reusable'
        ? await prisma.reusableBlock.findUnique({ where: { id: body.id } })
        : await prisma.blockTemplate.findUnique({ where: { id: body.id } })
      : null;
    const item = kind === 'template' && body.action === 'activate' && typeof body.id === 'string'
      ? await activateTemplate(body.id, actor)
      : kind === 'reusable'
        ? await saveReusableBlock(body, actor)
        : await saveBlockTemplate(body, actor);
    await writeAuditLog({ actor, action: kind === 'template' && body.action === 'activate' ? 'template_block_activate' : `${kind}_block_update`, entityType: kind === 'reusable' ? 'ReusableBlock' : 'BlockTemplate', entityId: item.id, before, after: item, request });
    revalidateTag('cms:blocks', 'max');
    revalidateTag('cms:design', 'max');
    revalidateTag('cms:site', 'max');
    return adminOk({ item });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await readValidatedJson(request, blockDeleteSchema);
    const actor = await requireAdminMutationCapability(request, capabilityForKind(body.kind));
    const before = body.kind === 'reusable'
      ? await prisma.reusableBlock.findUnique({ where: { id: body.id } })
      : await prisma.blockTemplate.findUnique({ where: { id: body.id } });
    const item = body.kind === 'reusable'
      ? await deleteReusableBlock(body.id, actor)
      : await deleteBlockTemplate(body.id, actor);
    await writeAuditLog({ actor, action: `${body.kind}_block_archive`, entityType: body.kind === 'reusable' ? 'ReusableBlock' : 'BlockTemplate', entityId: body.id, before, after: item, request });
    revalidateTag('cms:blocks', 'max');
    revalidateTag('cms:design', 'max');
    revalidateTag('cms:site', 'max');
    return adminOk({ item });
  } catch (error) {
    return handleAdminApiError(error);
  }
}
