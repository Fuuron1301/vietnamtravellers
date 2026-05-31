import { NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';
import { adminOk, handleAdminApiError, readValidatedJson, idBodySchema } from '@/lib/admin/api';
import { requireAdminCapability, requireAdminMutationCapability } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit-service';
import { activateDesignPreset, archiveDesignPreset, createDesignPreset, listDesignPresets, updateDesignPreset } from '@/lib/admin/design-service';
import { designPresetCreateSchema, designPresetUpdateSchema } from '@/lib/admin/schemas';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireAdminCapability(request, 'read_admin');
    return adminOk(await listDesignPresets(request.nextUrl.searchParams));
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireAdminMutationCapability(request, 'manage_options');
    const body = await readValidatedJson(request, designPresetCreateSchema);
    const item = await createDesignPreset(body, actor);
    await writeAuditLog({ actor, action: 'design_preset_create', entityType: 'DesignPreset', entityId: item.id, after: item, request });
    revalidateTag('cms:design', 'max');
    revalidateTag('cms:site', 'max');
    return adminOk({ item }, { status: 201 });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const actor = await requireAdminMutationCapability(request, 'manage_options');
    const body = await readValidatedJson(request, designPresetUpdateSchema);
    const before = body.id ? await prisma.designPreset.findUnique({ where: { id: body.id } }) : null;
    const item = body.action === 'activate'
      ? await activateDesignPreset(body.id, actor)
      : await updateDesignPreset(body, actor);
    await writeAuditLog({ actor, action: body.action === 'activate' ? 'design_preset_activate' : 'design_preset_update', entityType: 'DesignPreset', entityId: item.id, before, after: item, request });
    revalidateTag('cms:design', 'max');
    revalidateTag('cms:site', 'max');
    return adminOk({ item });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const actor = await requireAdminMutationCapability(request, 'manage_options');
    const body = await readValidatedJson(request, idBodySchema);
    const before = await prisma.designPreset.findUnique({ where: { id: body.id } });
    const item = await archiveDesignPreset(body.id, actor);
    await writeAuditLog({ actor, action: 'design_preset_archive', entityType: 'DesignPreset', entityId: body.id, before, after: item, request });
    revalidateTag('cms:design', 'max');
    revalidateTag('cms:site', 'max');
    return adminOk({ item });
  } catch (error) {
    return handleAdminApiError(error);
  }
}
