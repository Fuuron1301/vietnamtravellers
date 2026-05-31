import { Prisma } from '@prisma/client';
import { AdminApiError } from '@/lib/admin/api';
import { prisma } from '@/lib/prisma';

export type MetaEntityType = 'post' | 'media' | 'user' | 'category' | 'tag';

function jsonValue(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export function normalizeMetaEntityType(value: unknown): MetaEntityType {
  const entityType = typeof value === 'string' ? value.toLowerCase() : '';
  if (entityType === 'post' || entityType === 'media' || entityType === 'user' || entityType === 'category' || entityType === 'tag') {
    return entityType;
  }
  throw new AdminApiError('VALIDATION_ERROR', 'Unsupported metadata entity type.', 400);
}

export async function getEntityMeta(entityTypeInput: unknown, entityId: string) {
  const entityType = normalizeMetaEntityType(entityTypeInput);
  if (!entityId) throw new AdminApiError('VALIDATION_ERROR', 'entityId is required.', 400);
  if (entityType === 'post') return prisma.postMeta.findMany({ where: { postId: entityId }, orderBy: { key: 'asc' } });
  if (entityType === 'media') return prisma.mediaMeta.findMany({ where: { mediaId: entityId }, orderBy: { key: 'asc' } });
  if (entityType === 'user') return prisma.userMeta.findMany({ where: { userId: entityId }, orderBy: { key: 'asc' } });
  if (entityType === 'category') return prisma.categoryMeta.findMany({ where: { categoryId: entityId }, orderBy: { key: 'asc' } });
  return prisma.tagMeta.findMany({ where: { tagId: entityId }, orderBy: { key: 'asc' } });
}

export async function setEntityMeta(entityTypeInput: unknown, entityId: string, key: string, value: unknown) {
  const entityType = normalizeMetaEntityType(entityTypeInput);
  if (!entityId || !key) throw new AdminApiError('VALIDATION_ERROR', 'entityId and key are required.', 400);
  const dataValue = jsonValue(value);
  if (entityType === 'post') {
    return prisma.postMeta.upsert({
      where: { postId_key: { postId: entityId, key } },
      update: { value: dataValue },
      create: { postId: entityId, key, value: dataValue }
    });
  }
  if (entityType === 'media') {
    return prisma.mediaMeta.upsert({
      where: { mediaId_key: { mediaId: entityId, key } },
      update: { value: dataValue },
      create: { mediaId: entityId, key, value: dataValue }
    });
  }
  if (entityType === 'user') {
    return prisma.userMeta.upsert({
      where: { userId_key: { userId: entityId, key } },
      update: { value: dataValue },
      create: { userId: entityId, key, value: dataValue }
    });
  }
  if (entityType === 'category') {
    return prisma.categoryMeta.upsert({
      where: { categoryId_key: { categoryId: entityId, key } },
      update: { value: dataValue },
      create: { categoryId: entityId, key, value: dataValue }
    });
  }
  return prisma.tagMeta.upsert({
    where: { tagId_key: { tagId: entityId, key } },
    update: { value: dataValue },
    create: { tagId: entityId, key, value: dataValue }
  });
}

export async function deleteEntityMeta(entityTypeInput: unknown, entityId: string, key: string) {
  const entityType = normalizeMetaEntityType(entityTypeInput);
  if (!entityId || !key) throw new AdminApiError('VALIDATION_ERROR', 'entityId and key are required.', 400);
  if (entityType === 'post') return prisma.postMeta.deleteMany({ where: { postId: entityId, key } });
  if (entityType === 'media') return prisma.mediaMeta.deleteMany({ where: { mediaId: entityId, key } });
  if (entityType === 'user') return prisma.userMeta.deleteMany({ where: { userId: entityId, key } });
  if (entityType === 'category') return prisma.categoryMeta.deleteMany({ where: { categoryId: entityId, key } });
  return prisma.tagMeta.deleteMany({ where: { tagId: entityId, key } });
}
