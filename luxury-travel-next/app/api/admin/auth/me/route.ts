import { NextRequest } from 'next/server';
import { adminOk, handleAdminApiError } from '@/lib/admin/api';
import { ADMIN_CSRF_COOKIE, createAdminCsrfToken, requireAdminSession, setAdminCsrfCookie } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession(request);
    const csrfToken = request.cookies.get(ADMIN_CSRF_COOKIE)?.value || createAdminCsrfToken();
    const response = adminOk({
      user: {
        id: session.user.id,
        email: session.user.email,
        username: session.user.username,
        displayName: session.user.displayName,
        role: session.role,
        capabilities: session.capabilities
      },
      csrfToken
    });
    if (!request.cookies.get(ADMIN_CSRF_COOKIE)?.value) setAdminCsrfCookie(response, csrfToken);
    return response;
  } catch (error) {
    return handleAdminApiError(error);
  }
}
