import { NextRequest } from 'next/server';
import { adminFail, adminOk, handleAdminApiError, readJsonBody } from '@/lib/admin/api';
import { createAdminCsrfToken, createAdminSession, setAdminCsrfCookie, setAdminSessionCookie, verifyPassword } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit-service';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function stringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    const login = stringValue(body?.login || body?.email || body?.username);
    const password = stringValue(body?.password);
    if (!login || !password) return adminFail('VALIDATION_ERROR', 'Login and password are required.', 400);

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: login.toLowerCase() }, { username: login }] },
      include: { role: true }
    });
    if (!user || user.status !== 'ACTIVE') {
      await writeAuditLog({ action: 'admin_login_failed', entityType: 'User', metadata: { login }, request });
      return adminFail('UNAUTHORIZED', 'Invalid admin credentials.', 401);
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      await writeAuditLog({ action: 'admin_login_failed', entityType: 'User', entityId: user.id, metadata: { login }, request });
      return adminFail('UNAUTHORIZED', 'Invalid admin credentials.', 401);
    }

    const { token, expiresAt, session } = await createAdminSession(user.id);
    const csrfToken = createAdminCsrfToken();
    const response = adminOk({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role.key
      },
      csrfToken
    });
    setAdminSessionCookie(response, token, expiresAt);
    setAdminCsrfCookie(response, csrfToken, expiresAt);
    await writeAuditLog({ action: 'admin_login', entityType: 'User', entityId: user.id, metadata: { sessionId: session.id }, request });
    return response;
  } catch (error) {
    return handleAdminApiError(error);
  }
}
