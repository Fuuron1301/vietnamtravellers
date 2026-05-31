import { NextRequest, NextResponse } from 'next/server';
import { submitBooking } from '@/lib/cms';
import { adminEmail, assertEmailReady, bookingEmailTemplate, confirmationEmailTemplate, EmailConfigurationError, sendMail } from '@/lib/email';
import { clientKey, isRateLimited } from '@/lib/security';

function bookingId() {
  return `HLT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function vietQrPayload(amount: number, note: string) {
  const bank = process.env.VIETQR_BANK_ID || 'BANK_ID';
  const account = process.env.VIETQR_ACCOUNT_NO || 'ACCOUNT_NO';
  const name = process.env.VIETQR_ACCOUNT_NAME || 'ACCOUNT_NAME';
  return `vietqr://${bank}/${account}?amount=${amount}&message=${encodeURIComponent(note)}&accountName=${encodeURIComponent(name)}`;
}

export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(clientKey(request, 'booking'), 3, 10 * 60 * 1000)) {
      return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
    }
    assertEmailReady();
    const body = await request.json();
    if (body.website) {
      return NextResponse.json({ message: 'Spam protection rejected this request' }, { status: 400 });
    }
  const id = bookingId();
  const amount = Number(body.amount || 0);
  const currency = body.currency || 'USD';
  const method = body.method || 'vietqr';
  const booking = await submitBooking({ ...body, bookingId: id, amount, currency, method });

  const paypalUrl = process.env.PAYPAL_CLIENT_ID
    ? `https://www.paypal.com/checkoutnow?token=${encodeURIComponent(id)}`
    : '';
  const vnpayUrl = process.env.VNPAY_TMN_CODE
    ? `/api/payments/vnpay?booking=${encodeURIComponent(id)}`
    : '';

  const result = {
    ...booking,
    bookingId: id,
    status: 'Pending',
    payment: {
      method,
      vietqr: vietQrPayload(amount, id),
      paypalUrl,
      vnpayUrl
    }
  };
  await sendMail({ to: adminEmail(), subject: 'New booking request', html: bookingEmailTemplate({ ...body, ...result }) });
  if (body.email) {
    await sendMail({ to: body.email, subject: 'Booking request received', html: confirmationEmailTemplate(result) });
  }
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof EmailConfigurationError) {
      return NextResponse.json({ message: error.message }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : 'Booking request failed';
    return NextResponse.json({ message }, { status: 400 });
  }
}


