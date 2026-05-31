import { NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';
import { Prisma } from '@prisma/client';
import { adminOk, handleAdminApiError, readValidatedJson } from '@/lib/admin/api';
import { requireAdminCapability, requireAdminMutationCapability } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit-service';
import { settingMutationSchema } from '@/lib/admin/schemas';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireAdminCapability(request, 'read_admin');
    const key = request.nextUrl.searchParams.get('key')?.trim();
    if (key) return adminOk({ item: await prisma.option.findUnique({ where: { key } }) });
    const items = await prisma.option.findMany({ orderBy: { key: 'asc' } });
    return adminOk({ items });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const actor = await requireAdminMutationCapability(request, 'manage_options');
    const body = await readValidatedJson(request, settingMutationSchema);
    const key = body.key;
    const value = body.value ?? {};
    const existing = await prisma.option.findUnique({ where: { key } });
    const item = await prisma.$transaction(async (tx) => {
      if (existing) {
        await tx.revision.create({
          data: {
            entityType: 'OPTION',
            optionId: existing.id,
            title: existing.key,
            snapshot: existing.value as Prisma.InputJsonValue,
            authorId: actor.user.id
          }
        });
      }
      return tx.option.upsert({
        where: { key },
        update: { value: value as Prisma.InputJsonValue },
        create: { key, value: value as Prisma.InputJsonValue }
      });
    });
    revalidateTag('cms:settings', 'max');
    revalidateTag('cms:site', 'max');
    await writeAuditLog({ actor, action: 'option_update', entityType: 'Option', entityId: item.id, before: existing, after: item, metadata: { key }, request });
    return adminOk({ item });
  } catch (error) {
    return handleAdminApiError(error);
  }
}


