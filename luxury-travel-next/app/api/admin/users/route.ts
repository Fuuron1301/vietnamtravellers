import { AdminRoleKey } from '@prisma/client';
import { NextRequest } from 'next/server';
import { adminOk, handleAdminApiError, readValidatedJson, AdminApiError, idBodySchema } from '@/lib/admin/api';
import { hashPassword, requireAdminCapability, requireAdminMutationCapability } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit-service';
import { userCreateSchema, userUpdateSchema } from '@/lib/admin/schemas';
import { adminRoleToDbKey, capabilitiesForRole, type AdminRole } from '@/lib/admin/rbac';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function normalizeRole(value: unknown): AdminRole {
  const role = stringValue(value, 'editor').toLowerCase();
  if (role === 'administrator' || role === 'editor' || role === 'author' || role === 'contributor') return role;
  throw new AdminApiError('VALIDATION_ERROR', 'Unsupported admin role.', 400);
}

async function ensureRole(role: AdminRole) {
  const key = adminRoleToDbKey(role) as AdminRoleKey;
  return prisma.role.upsert({
    where: { key },
    update: { capabilities: capabilitiesForRole(role) },
    create: { key, name: role.charAt(0).toUpperCase() + role.slice(1), capabilities: capabilitiesForRole(role) }
  });
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminCapability(request, 'manage_users');
    const page = Math.max(1, Number(request.nextUrl.searchParams.get('page') || '1'));
    const perPage = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get('perPage') || '20')));
    const [total, items] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.findMany({
        include: { role: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage
      })
    ]);
    return adminOk({
      items: items.map(({ passwordHash: _passwordHash, ...user }) => user),
      pagination: { page, perPage, total, totalPages: Math.max(1, Math.ceil(total / perPage)) }
    });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireAdminMutationCapability(request, 'manage_users');
    const body = await readValidatedJson(request, userCreateSchema);
    const email = stringValue(body.email).toLowerCase();
    const username = stringValue(body.username, email.split('@')[0]);
    const displayName = stringValue(body.displayName, username);
    const role = await ensureRole(normalizeRole(body.role));
    const user = await prisma.user.create({
      data: { email, username, displayName, passwordHash: await hashPassword(body.password), roleId: role.id },
      include: { role: true }
    });
    const { passwordHash: _passwordHash, ...safeUser } = user;
    await writeAuditLog({ actor, action: 'user_create', entityType: 'User', entityId: user.id, after: safeUser, request });
    return adminOk({ item: safeUser }, { status: 201 });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const actor = await requireAdminMutationCapability(request, 'manage_users');
    const body = await readValidatedJson(request, userUpdateSchema);
    const existing = await prisma.user.findUnique({ where: { id: body.id }, include: { role: true } });
    const before = existing ? (({ passwordHash: _passwordHash, ...safe }) => safe)(existing) : null;
    const role = body.role ? await ensureRole(normalizeRole(body.role)) : null;
    const user = await prisma.user.update({
      where: { id: body.id },
      data: {
        email: body.email ? stringValue(body.email).toLowerCase() : undefined,
        username: body.username ? stringValue(body.username) : undefined,
        displayName: body.displayName ? stringValue(body.displayName) : undefined,
        status: body.status,
        roleId: role?.id,
        passwordHash: body.password ? await hashPassword(body.password) : undefined
      },
      include: { role: true }
    });
    const { passwordHash: _passwordHash, ...safeUser } = user;
    await writeAuditLog({ actor, action: 'user_update', entityType: 'User', entityId: user.id, before, after: safeUser, request });
    return adminOk({ item: safeUser });
  } catch (error) {
    return handleAdminApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const actor = await requireAdminMutationCapability(request, 'manage_users');
    const body = await readValidatedJson(request, idBodySchema);
    const existing = await prisma.user.findUnique({ where: { id: body.id }, include: { role: true } });
    const before = existing ? (({ passwordHash: _passwordHash, ...safe }) => safe)(existing) : null;
    const user = await prisma.user.update({ where: { id: body.id }, data: { status: 'DISABLED' }, include: { role: true } });
    const { passwordHash: _passwordHash, ...safeUser } = user;
    await writeAuditLog({ actor, action: 'user_disable', entityType: 'User', entityId: body.id, before, after: safeUser, request });
    return adminOk({ disabled: true });
  } catch (error) {
    return handleAdminApiError(error);
  }
}
