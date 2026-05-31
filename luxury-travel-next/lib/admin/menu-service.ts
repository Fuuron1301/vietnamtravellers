import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AdminApiError } from '@/lib/admin/api';
import type { AdminSessionContext } from '@/lib/admin/auth';

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function slugify(value: string) {
  return value.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `menu-${Date.now()}`;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function jsonSnapshot(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

type MenuItemInput = {
  label?: unknown;
  url?: unknown;
  target?: unknown;
  cssClasses?: unknown;
  linkedPostId?: unknown;
  children?: unknown;
};

export async function listMenus() {
  return prisma.menu.findMany({
    include: { items: { orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }], include: { linkedPost: { select: { id: true, title: true, slug: true, postType: true } } } } },
    orderBy: { name: 'asc' }
  });
}

async function createMenuItems(tx: Prisma.TransactionClient, menuId: string, items: unknown[], parentId: string | null = null) {
  for (let index = 0; index < items.length; index += 1) {
    const source = typeof items[index] === 'object' && items[index] !== null ? items[index] as MenuItemInput : {};
    const label = stringValue(source.label);
    const url = stringValue(source.url, '#');
    if (!label) continue;
    const item = await tx.menuItem.create({
      data: {
        menuId,
        parentId,
        label,
        url,
        target: stringValue(source.target),
        cssClasses: stringArray(source.cssClasses),
        linkedPostId: stringValue(source.linkedPostId) || null,
        sortOrder: index
      }
    });
    if (Array.isArray(source.children) && source.children.length) {
      await createMenuItems(tx, menuId, source.children, item.id);
    }
  }
}

export async function saveMenu(input: unknown, actor: AdminSessionContext) {
  const body = typeof input === 'object' && input !== null ? input as Record<string, unknown> : {};
  const id = stringValue(body.id);
  const name = stringValue(body.name, 'Main Menu');
  const slug = slugify(stringValue(body.slug, name));
  const location = stringValue(body.location);
  const items = Array.isArray(body.items) ? body.items : [];

  const existing = id ? await prisma.menu.findUnique({ where: { id }, include: { items: true } }) : null;
  if (id && !existing) throw new AdminApiError('NOT_FOUND', 'Menu not found.', 404);

  return prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.revision.create({
        data: {
          entityType: 'MENU',
          menuId: existing.id,
          title: existing.name,
          snapshot: jsonSnapshot(existing),
          authorId: actor.user.id
        }
      });
      await tx.menuItem.deleteMany({ where: { menuId: existing.id } });
    }
    const menu = existing
      ? await tx.menu.update({ where: { id: existing.id }, data: { name, slug, location } })
      : await tx.menu.create({ data: { name, slug, location } });
    await createMenuItems(tx, menu.id, items);
    return tx.menu.findUniqueOrThrow({
      where: { id: menu.id },
      include: { items: { orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }] } }
    });
  });
}

export async function deleteMenu(input: unknown) {
  const body = typeof input === 'object' && input !== null ? input as Record<string, unknown> : {};
  const id = stringValue(body.id);
  if (!id) throw new AdminApiError('VALIDATION_ERROR', 'Menu id is required.', 400);
  const item = await prisma.menu.findUnique({ where: { id }, include: { items: true } });
  if (!item) throw new AdminApiError('NOT_FOUND', 'Menu not found.', 404);
  await prisma.menu.delete({ where: { id } });
  return { deleted: true, item };
}
