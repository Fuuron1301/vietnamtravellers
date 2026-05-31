import { prisma } from '@/lib/prisma';
import { AdminApiError } from '@/lib/admin/api';

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function slugify(value: string) {
  return value.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `term-${Date.now()}`;
}

export type TaxonomyKind = 'categories' | 'tags';

export function normalizeTaxonomyKind(value: string | null): TaxonomyKind {
  return value === 'tags' || value === 'tag' ? 'tags' : 'categories';
}

export async function listTaxonomy(kind: TaxonomyKind) {
  if (kind === 'tags') return { kind, items: await prisma.tag.findMany({ orderBy: { name: 'asc' } }) };
  return { kind, items: await prisma.category.findMany({ orderBy: [{ parentId: 'asc' }, { name: 'asc' }] }) };
}

export async function saveTaxonomy(input: unknown) {
  const body = typeof input === 'object' && input !== null ? input as Record<string, unknown> : {};
  const kind = normalizeTaxonomyKind(stringValue(body.kind || body.type));
  const id = stringValue(body.id);
  const name = stringValue(body.name);
  if (!name) throw new AdminApiError('VALIDATION_ERROR', 'Taxonomy name is required.', 400);
  const slug = slugify(stringValue(body.slug, name));
  const description = stringValue(body.description);

  if (kind === 'tags') {
    const item = id
      ? await prisma.tag.update({ where: { id }, data: { name, slug, description } })
      : await prisma.tag.create({ data: { name, slug, description } });
    return { kind, item };
  }

  const parentId = stringValue(body.parentId) || null;
  const item = id
    ? await prisma.category.update({ where: { id }, data: { name, slug, description, parentId } })
    : await prisma.category.create({ data: { name, slug, description, parentId } });
  return { kind, item };
}

export async function deleteTaxonomy(input: unknown) {
  const body = typeof input === 'object' && input !== null ? input as Record<string, unknown> : {};
  const kind = normalizeTaxonomyKind(stringValue(body.kind || body.type));
  const id = stringValue(body.id);
  if (!id) throw new AdminApiError('VALIDATION_ERROR', 'Taxonomy id is required.', 400);
  if (kind === 'tags') await prisma.tag.delete({ where: { id } });
  else await prisma.category.delete({ where: { id } });
  return { kind, deleted: true };
}
