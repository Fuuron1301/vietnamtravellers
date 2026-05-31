import { NextRequest, NextResponse } from 'next/server';
import { buildPaymentSession, normalizePaymentRequest } from '@/lib/payment-session';
import { clientKey, isRateLimited } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(clientKey(request, 'payment-session'), 20, 10 * 60 * 1000)) {
      return NextResponse.json({ message: 'Too many payment session requests' }, { status: 429 });
    }

    const body = await request.json();
    const paymentRequest = normalizePaymentRequest(body);
    const session = buildPaymentSession(paymentRequest);

    return NextResponse.json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create payment session';
    return NextResponse.json({ message }, { status: 400 });
  }
}
