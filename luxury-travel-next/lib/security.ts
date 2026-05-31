import { NextRequest } from 'next/server';

const buckets = new Map<string, { count: number; resetAt: number }>();

export function clientKey(request: NextRequest, scope: string) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const agent = request.headers.get('user-agent') || 'unknown';
  return `${scope}:${ip}:${agent}`;
}

export function isRateLimited(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  current.count += 1;
  return current.count > limit;
}

export async function verifyRecaptcha(token?: string) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return process.env.NODE_ENV !== 'production';
  if (!token) return false;
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token })
  });
  const json = await response.json() as { success?: boolean; score?: number };
  return Boolean(json.success) && Number(json.score || 0) >= Number(process.env.RECAPTCHA_MIN_SCORE || 0.5);
}

export function hasBotPattern(payload: { website?: string; notes?: string }) {
  if (payload.website) return true;
  const notes = String(payload.notes || '').toLowerCase();
  return /(https?:\/\/.*){3,}|viagra|casino|loan|crypto bonus/.test(notes);
}
