import { NextRequest, NextResponse } from 'next/server';
import { adminEmail, assertEmailReady, EmailConfigurationError, escapeHtml, sendMail } from '@/lib/email';
import { clientKey, isRateLimited } from '@/lib/security';

function orderId() {
  return `SIM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function luxuryEmailShell(title: string, body: string) {
  return `
    <div style="font-family:Manrope,Arial,sans-serif;background:#F8F5EF;padding:32px;color:#0B1B2B">
      <div style="max-width:640px;margin:0 auto;background:#fffaf0;border:1px solid #EFE5D1;padding:32px">
        <p style="letter-spacing:.18em;text-transform:uppercase;color:#C8A96A;font-weight:800">Ha Long Luxury</p>
        <h1 style="font-family:Georgia,serif;font-size:32px;line-height:1.2;margin:12px 0 24px">${escapeHtml(title)}</h1>
        <div style="font-size:15px;line-height:1.7">${body}</div>
      </div>
    </div>
  `;
}

function adminSimEmailTemplate(payload: Record<string, unknown>, id: string) {
  const contact = (payload.contact || {}) as Record<string, unknown>;
  const product = (payload.product || {}) as Record<string, unknown>;

  return luxuryEmailShell('New SIM Card / eSIM Order', `
    <p><strong>Order ID:</strong> ${escapeHtml(id)}</p>
    <hr style="border:none;border-top:1px solid #EFE5D1;margin:20px 0">
    <h3 style="margin:0 0 12px">Product</h3>
    <p><strong>Name:</strong> ${escapeHtml(product.name)}</p>
    <p><strong>Category:</strong> ${escapeHtml(product.category)}</p>
    <p><strong>Data:</strong> ${escapeHtml(product.data)}</p>
    <p><strong>Validity:</strong> ${escapeHtml(product.validity)}</p>
    <p><strong>Network:</strong> ${escapeHtml(product.network)} • ${escapeHtml(product.provider)}</p>
    <p><strong>Quantity:</strong> ${escapeHtml(payload.quantity)}</p>
    <p style="font-size:18px"><strong>Total:</strong> $${escapeHtml(payload.totalPrice)} USD</p>
    <hr style="border:none;border-top:1px solid #EFE5D1;margin:20px 0">
    <h3 style="margin:0 0 12px">Contact</h3>
    <p><strong>Name:</strong> ${escapeHtml(contact.fullName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(contact.email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(contact.countryCode)} ${escapeHtml(contact.phone)}</p>
    <hr style="border:none;border-top:1px solid #EFE5D1;margin:20px 0">
    <h3 style="margin:0 0 12px">Delivery</h3>
    <p><strong>Method:</strong> ${escapeHtml(payload.delivery)}</p>
    ${payload.arrivalDate ? `<p><strong>Arrival Date:</strong> ${escapeHtml(payload.arrivalDate)}</p>` : ''}
    ${payload.flightNumber ? `<p><strong>Flight:</strong> ${escapeHtml(payload.flightNumber)}</p>` : ''}
    ${payload.hotelName ? `<p><strong>Hotel:</strong> ${escapeHtml(payload.hotelName)}</p>` : ''}
    ${payload.hotelAddress ? `<p><strong>Hotel Address:</strong> ${escapeHtml(payload.hotelAddress)}</p>` : ''}
    ${payload.message ? `<p><strong>Message:</strong> ${escapeHtml(payload.message)}</p>` : ''}
  `);
}

function customerSimConfirmationTemplate(payload: Record<string, unknown>, id: string) {
  const contact = (payload.contact || {}) as Record<string, unknown>;
  const product = (payload.product || {}) as Record<string, unknown>;

  return luxuryEmailShell('Your SIM Card Order is Confirmed', `
    <p>Dear ${escapeHtml(contact.fullName)},</p>
    <p>Thank you for your order. We have received your request and will process it shortly.</p>
    <div style="background:#f8f5ef;border:1px solid #efe5d1;border-radius:12px;padding:20px;margin:20px 0">
      <p style="margin:0 0 8px"><strong>Order ID:</strong> ${escapeHtml(id)}</p>
      <p style="margin:0 0 8px"><strong>Product:</strong> ${escapeHtml(product.name)}</p>
      <p style="margin:0 0 8px"><strong>Data:</strong> ${escapeHtml(product.data)} / ${escapeHtml(product.validity)}</p>
      <p style="margin:0 0 8px"><strong>Quantity:</strong> ${escapeHtml(payload.quantity)}</p>
      <p style="margin:0"><strong>Total:</strong> $${escapeHtml(payload.totalPrice)} USD</p>
    </div>
    <p><strong>What happens next?</strong></p>
    <ul style="padding-left:20px">
      ${String(product.category) === 'esim'
        ? '<li>Your eSIM QR code will be sent to this email within 15 minutes after payment confirmation.</li><li>Simply scan the QR code with your phone to activate.</li>'
        : '<li>We will confirm your pickup/delivery details via email.</li><li>Please bring your passport for SIM registration at pickup.</li>'
      }
      <li>Payment instructions will be sent in a separate email.</li>
    </ul>
    <p style="margin-top:20px">If you have questions, reply to this email or contact us at your convenience.</p>
    <p style="margin-top:24px;color:#C8A96A;font-weight:700">Ha Long Luxury Travel</p>
  `);
}

export async function POST(req: NextRequest) {
  try {
    assertEmailReady();
  } catch (e) {
    if (e instanceof EmailConfigurationError) {
      return NextResponse.json({ error: 'Email service unavailable' }, { status: 503 });
    }
    throw e;
  }

  const key = clientKey(req);
  if (isRateLimited(key, { windowMs: 60_000, maxHits: 5 })) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const payload = await req.json();

  // Basic validation
  const contact = payload.contact;
  if (!contact?.fullName || !contact?.email || !contact?.phone) {
    return NextResponse.json({ error: 'Missing contact info' }, { status: 400 });
  }
  if (!payload.product?.id || !payload.quantity) {
    return NextResponse.json({ error: 'Missing product selection' }, { status: 400 });
  }

  const id = orderId();

  // Send admin notification
  try {
    await sendMail({
      to: adminEmail(),
      subject: `New eSIM Order ${id} — ${payload.product.name}`,
      html: adminSimEmailTemplate(payload, id),
    });
  } catch (err) {
    console.error('[sim-order] admin email failed:', err);
    // non-fatal: continue to confirm customer
  }

  // Send customer confirmation
  try {
    await sendMail({
      to: contact.email,
      subject: `Your eSIM order is confirmed — ${id}`,
      html: customerSimConfirmationTemplate(payload, id),
      replyTo: adminEmail(),
    });
  } catch (err) {
    console.error('[sim-order] customer email failed:', err);
    return NextResponse.json({ error: 'Order received but confirmation email failed to send. Please contact us.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id });
}
