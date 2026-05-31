import { NextRequest } from 'next/server';
import { adminOk, handleAdminApiError } from '@/lib/admin/api';
import { writeAuditLog } from '@/lib/admin/audit-service';
import {
  ADMIN_SESSION_COOKIE,
  clearAdminCsrfCookie,
  clearAdminSessionCookie,
  requireAdminMutationCapability,
  revokeAdminSession
} from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const actor = await requireAdminMutationCapability(request, 'read_admin');
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value || '';
    await revokeAdminSession(token);
    await writeAuditLog({ actor, action: 'admin_logout', entityType: 'Session', entityId: actor.sessionId, request });
    const response = adminOk({ loggedOut: true });
    clearAdminSessionCookie(response);
    clearAdminCsrfCookie(response);
    return response;
  } catch (error) {
    return handleAdminApiError(error);
  }
}
