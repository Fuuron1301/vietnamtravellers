import { NextResponse } from 'next/server';
import { z, type ZodType } from 'zod';

export type AdminErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'LOCKED'
  | 'INTERNAL_ERROR';

export class AdminApiError extends Error {
  code: AdminErrorCode;
  status: number;
  details?: unknown;

  constructor(code: AdminErrorCode, message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'AdminApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function adminOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function adminFail(code: AdminErrorCode, message: string, status: number, details?: unknown) {
  return NextResponse.json({ ok: false, error: { code, message, details } }, { status });
}

export function handleAdminApiError(error: unknown) {
  if (error instanceof AdminApiError) {
    return adminFail(error.code, error.message, error.status, error.details);
  }
  return adminFail('INTERNAL_ERROR', error instanceof Error ? error.message : 'Unexpected admin API error', 500);
}

export async function readJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new AdminApiError('VALIDATION_ERROR', 'Request body must be valid JSON.', 400);
  }
}

export async function readValidatedJson<T>(request: Request, schema: ZodType<T>) {
  const body = await readJsonBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new AdminApiError('VALIDATION_ERROR', 'Request body failed validation.', 400, parsed.error.flatten());
  }
  return parsed.data;
}

export const idBodySchema = z.object({
  id: z.string().min(1)
});
