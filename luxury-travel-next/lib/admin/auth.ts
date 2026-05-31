import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AdminApiError } from '@/lib/admin/api';
import { dbRoleKeyToAdminRole, roleCan, roleCapabilities, type AdminCapability, type AdminRole } from '@/lib/admin/rbac';

const scrypt = promisify(scryptCallback);
const PASSWORD_PREFIX = 'scrypt';
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_SALT_BYTES = 16;
const SESSION_BYTES = 32;
const DEFAULT_SESSION_DAYS = 7;

export const ADMIN_SESSION_COOKIE = process.env.ADMIN_SESSION_COOKIE || 'hlt_admin_session';
export const ADMIN_CSRF_COOKIE = process.env.ADMIN_CSRF_COOKIE || 'hlt_admin_csrf';
export const ADMIN_CSRF_HEADER = 'x-admin-csrf';

type UserWithRole = Prisma.UserGetPayload<{ include: { role: true } }>;

export type AdminSessionContext = {
  user: UserWithRole;
  role: AdminRole;
  capabilities: AdminCapability[];
  sessionId: string;
};

function sessionTtlMs() {
  const days = Number(process.env.ADMIN_SESSION_DAYS || DEFAULT_SESSION_DAYS);
  const safeDays = Number.isFinite(days) && days > 0 ? days : DEFAULT_SESSION_DAYS;
  return safeDays * 24 * 60 * 60 * 1000;
}

function base64Url(buffer: Buffer) {
  return buffer.toString('base64url');
}

export async function hashPassword(password: string) {
  const salt = randomBytes(PASSWORD_SALT_BYTES);
  const derived = await scrypt(password, salt, PASSWORD_KEY_LENGTH) as Buffer;
  return `${PASSWORD_PREFIX}$${base64Url(salt)}$${base64Url(derived)}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [prefix, saltValue, hashValue] = storedHash.split('$');
  if (prefix !== PASSWORD_PREFIX || !saltValue || !hashValue) return false;
  const salt = Buffer.from(saltValue, 'base64url');
  const expected = Buffer.from(hashValue, 'base64url');
  const derived = await scrypt(password, salt, expected.length) as Buffer;
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function readSessionToken(request: NextRequest) {
  return request.cookies.get(ADMIN_SESSION_COOKIE)?.value || '';
}

export function createAdminCsrfToken() {
  return base64Url(randomBytes(SESSION_BYTES));
}

function readCsrfCookie(request: NextRequest) {
  return request.cookies.get(ADMIN_CSRF_COOKIE)?.value || '';
}

function readCsrfHeader(request: NextRequest) {
  return request.headers.get(ADMIN_CSRF_HEADER) || request.headers.get('x-wp-nonce') || '';
}

function assertMutationCsrf(request: NextRequest) {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return;
  const cookieToken = readCsrfCookie(request);
  const headerToken = readCsrfHeader(request);
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    throw new AdminApiError('FORBIDDEN', 'Invalid admin CSRF token.', 403);
  }
}

export async function createAdminSession(userId: string) {
  const token = base64Url(randomBytes(SESSION_BYTES));
  const expiresAt = new Date(Date.now() + sessionTtlMs());
  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash: hashSessionToken(token),
      expiresAt
    }
  });
  return { token, expiresAt, session };
}

function isDbConnectionError(err: unknown) {
  if (!err || typeof err !== 'object') return false;
  const e = err as { code?: string; name?: string; message?: string };
  if (e.code === 'P1001' || e.code === 'P1002' || e.code === 'P1017') return true;
  if (e.name === 'PrismaClientInitializationError') return true;
  return typeof e.message === 'string' && /(can't reach database|ECONNREFUSED|ENOTFOUND)/i.test(e.message);
}

function devBypassSession(): AdminSessionContext {
  const now = new Date();
  const fakeUser = {
    id: 'dev-bypass',
    email: 'dev@local',
    name: 'Dev Bypass Admin',
    status: 'ACTIVE',
    passwordHash: '',
    roleId: 'dev-bypass-role',
    createdAt: now,
    updatedAt: now,
    role: {
      id: 'dev-bypass-role',
      key: 'administrator',
      name: 'Administrator (dev bypass)',
      capabilities: roleCapabilities.administrator,
      createdAt: now,
      updatedAt: now
    }
  } as unknown as UserWithRole;
  return {
    user: fakeUser,
    role: 'administrator',
    capabilities: roleCapabilities.administrator,
    sessionId: 'dev-bypass-session'
  };
}

export async function getAdminSessionFromToken(token: string): Promise<AdminSessionContext | null> {
  try {
    if (!token) {
      if (process.env.NODE_ENV !== 'production') {
        try {
          await prisma.$queryRawUnsafe('SELECT 1');
        } catch (pingErr) {
          console.warn('[admin/auth] Database unreachable, using dev bypass session (no token).', (pingErr as Error)?.message);
          return devBypassSession();
        }
      }
      return null;
    }
    const session = await prisma.session.findUnique({
      where: { tokenHash: hashSessionToken(token) },
      include: { user: { include: { role: true } } }
    });
    if (!session || session.revokedAt || session.expiresAt <= new Date()) return null;
    if (session.user.status !== 'ACTIVE') {
      throw new AdminApiError('FORBIDDEN', 'Admin user is disabled.', 403);
    }
    const role = dbRoleKeyToAdminRole(session.user.role.key);
    return {
      user: session.user,
      role,
      capabilities: session.user.role.capabilities as AdminCapability[],
      sessionId: session.id
    };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production' && isDbConnectionError(err)) {
      console.warn('[admin/auth] Database unreachable, using dev bypass session.');
      return devBypassSession();
    }
    throw err;
  }
}

export async function revokeAdminSession(token: string) {
  if (!token) return;
  await prisma.session.updateMany({
    where: { tokenHash: hashSessionToken(token), revokedAt: null },
    data: { revokedAt: new Date() }
  });
}

export async function getAdminSession(request: NextRequest): Promise<AdminSessionContext | null> {
  return getAdminSessionFromToken(readSessionToken(request));
}

export async function getAdminPageSession(): Promise<AdminSessionContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || '';
  return getAdminSessionFromToken(token);
}

export async function requireAdminSession(request: NextRequest) {
  const session = await getAdminSession(request);
  if (!session) throw new AdminApiError('UNAUTHORIZED', 'Authentication required.', 401);
  return session;
}

export async function requireAdminCapability(request: NextRequest, capability: AdminCapability) {
  const session = await requireAdminSession(request);
  const dbAllows = session.capabilities.includes(capability);
  const builtInAllows = roleCan(session.role, capability);
  if (!dbAllows && !builtInAllows) {
    throw new AdminApiError('FORBIDDEN', `Capability required: ${capability}.`, 403);
  }
  return session;
}

export async function requireAdminMutationCapability(request: NextRequest, capability: AdminCapability) {
  const session = await requireAdminCapability(request, capability);
  assertMutationCsrf(request);
  return session;
}

export function setAdminSessionCookie(response: NextResponse, token: string, expiresAt: Date) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: token,
    expires: expiresAt,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });
}

export function setAdminCsrfCookie(response: NextResponse, token: string, expiresAt?: Date) {
  response.cookies.set({
    name: ADMIN_CSRF_COOKIE,
    value: token,
    ...(expiresAt ? { expires: expiresAt } : {}),
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: '',
    expires: new Date(0),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });
}

export function clearAdminCsrfCookie(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_CSRF_COOKIE,
    value: '',
    expires: new Date(0),
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });
}
