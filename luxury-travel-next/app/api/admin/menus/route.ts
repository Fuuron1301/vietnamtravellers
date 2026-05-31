import { NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';
import { adminOk, handleAdminApiError, readValidatedJson, idBodySchema } from '@/lib/admin/api';
import { requireAdminCapability, requireAdminMutationCapability } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit-service';
import { deleteMenu, listMenus, saveMenu } from '@/lib/admin/menu-service';
import { menuMutationSchema } from '@/lib/admin/schemas';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireAdminCapability(request, 'read_admin');
    return adminOk({ items: await listMenus() });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireAdminMutationCapability(request, 'manage_navigation');
    const body = await readValidatedJson(request, menuMutationSchema);
    const item = await saveMenu(body, actor);
    revalidateTag('cms:menus', 'max');
    revalidateTag('cms:site', 'max');
    await writeAuditLog({ actor, action: 'menu_create', entityType: 'Menu', entityId: item.id, after: item, request });
    return adminOk({ item }, { status: 201 });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const actor = await requireAdminMutationCapability(request, 'manage_navigation');
    const body = await readValidatedJson(request, menuMutationSchema);
    const item = await saveMenu(body, actor);
    revalidateTag('cms:menus', 'max');
    revalidateTag('cms:site', 'max');
    await writeAuditLog({ actor, action: 'menu_update', entityType: 'Menu', entityId: item.id, after: item, request });
    return adminOk({ item });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const actor = await requireAdminMutationCapability(request, 'manage_navigation');
    const body = await readValidatedJson(request, idBodySchema);
    const result = await deleteMenu(body);
    revalidateTag('cms:menus', 'max');
    revalidateTag('cms:site', 'max');
    await writeAuditLog({ actor, action: 'menu_delete', entityType: 'Menu', entityId: body.id, before: result.item, request });
    return adminOk(result);
  } catch (error) {
    return handleAdminApiError(error);
  }
}


