import { Prisma } from '@prisma/client';
import type { NextRequest } from 'next/server';
import type { AdminSessionContext } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';

function toJson(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function requestIp(request?: NextRequest) {
  if (!request) return undefined;
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || undefined;
}

export async function writeAuditLog(input: {
  actor?: AdminSessionContext | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
  metadata?: Record<string, unknown>;
  request?: NextRequest;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actor?.user.id,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId || undefined,
        ipAddress: requestIp(input.request),
        userAgent: input.request?.headers.get('user-agent') || undefined,
        before: toJson(input.before),
        after: toJson(input.after),
        metadata: toJson(input.metadata)
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'production' && input.metadata?.critical === true) throw error;
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[audit] log write failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
