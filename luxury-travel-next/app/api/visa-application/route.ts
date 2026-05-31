import { NextRequest, NextResponse } from 'next/server';
import { adminEmail, assertEmailReady, EmailConfigurationError, escapeHtml, sendMail } from '@/lib/email';
import { clientKey, isRateLimited } from '@/lib/security';

function visaId() {
  return `VISA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
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

function adminVisaEmailTemplate(payload: Record<string, unknown>, id: string) {
  const contact = (payload.contact || {}) as Record<string, unknown>;
  const applicants = Array.isArray(payload.applicants) ? payload.applicants : [];
  const applicantRows = applicants
    .map((a: Record<string, unknown>, i: number) =>
      `<tr>
        <td style="padding:8px;border:1px solid #eee">${i + 1}</td>
        <td style="padding:8px;border:1px solid #eee">${escapeHtml(a.fullName)}</td>
        <td style="padding:8px;border:1px solid #eee">${escapeHtml(a.gender)}</td>
        <td style="padding:8px;border:1px solid #eee">${escapeHtml(a.birthDate)}</td>
        <td style="padding:8px;border:1px solid #eee">${escapeHtml(a.nationality)}</td>
        <td style="padding:8px;border:1px solid #eee">${escapeHtml(a.passportNumber)}</td>
      </tr>`
    )
    .join('');

  return luxuryEmailShell('New Visa Application', `
    <p><strong>Application ID:</strong> ${escapeHtml(id)}</p>
    <p><strong>Contact:</strong> ${escapeHtml(contact.title)} ${escapeHtml(contact.fullName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(contact.email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(contact.countryCode)} ${escapeHtml(contact.phone)}</p>
    <p><strong>Message:</strong> ${escapeHtml(contact.message)}</p>
    <hr style="border:none;border-top:1px solid #EFE5D1;margin:20px 0">
    <p><strong>Visa Type:</strong> ${escapeHtml(payload.visaType)}</p>
    <p><strong>Purpose:</strong> ${escapeHtml(payload.purpose)}</p>
    <p><strong>Processing:</strong> ${escapeHtml(payload.processingTime)}</p>
    <p><strong>Entry Date:</strong> ${escapeHtml(payload.entryDate)}</p>
    <p><strong>Exit Date:</strong> ${escapeHtml(payload.exitDate)}</p>
    <p><strong>Airport:</strong> ${escapeHtml(payload.arrivalAirport)}</p>
    <p><strong>Number of Visas:</strong> ${escapeHtml(payload.numberOfVisa)}</p>
    <hr style="border:none;border-top:1px solid #EFE5D1;margin:20px 0">
    <p><strong>Car Pickup:</strong> ${payload.carPickup ? 'Yes' : 'No'}</p>
    ${payload.carPickup ? `
      <p><strong>Car Seats:</strong> ${escapeHtml(payload.carSeats)}</p>
      <p><strong>Pickup Time:</strong> ${escapeHtml(payload.pickupTime)}</p>
      <p><strong>Fast Track:</strong> ${payload.fastTrack ? 'Yes' : 'No'}</p>
      <p><strong>Baby Seat:</strong> ${payload.babySeat ? 'Yes' : 'No'}</p>
      <p><strong>English Driver:</strong> ${payload.englishDriver ? 'Yes' : 'No'}</p>
      <p><strong>Night Trip:</strong> ${payload.nightTrip ? 'Yes' : 'No'}</p>
    ` : ''}
    <hr style="border:none;border-top:1px solid #EFE5D1;margin:20px 0">
    <p><strong>Visa Fee:</strong> $${escapeHtml(payload.visaFee)} USD</p>
    <p><strong>Extra Fee:</strong> $${escapeHtml(payload.extraFee)} USD</p>
    <p style="font-size:18px"><strong>TOTAL:</strong> $${escapeHtml(payload.totalFee)} USD</p>
    <hr style="border:none;border-top:1px solid #EFE5D1;margin:20px 0">
    <h3 style="margin:16px 0 8px">Applicants</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <tr style="background:#f5f0e8">
        <th style="padding:8px;border:1px solid #eee">#</th>
        <th style="padding:8px;border:1px solid #eee">Name</th>
        <th style="padding:8px;border:1px solid #eee">Gender</th>
        <th style="padding:8px;border:1px solid #eee">Birth Date</th>
        <th style="padding:8px;border:1px solid #eee">Nationality</th>
        <th style="padding:8px;border:1px solid #eee">Passport</th>
      </tr>
      ${applicantRows}
    </table>
  `);
}

function customerVisaConfirmationTemplate(payload: Record<string, unknown>, id: string) {
  const contact = (payload.contact || {}) as Record<string, unknown>;
  const processingTime = payload.processingTime === 'urgent' ? '8 business hours' : '3-5 business days';

  return luxuryEmailShell('Your Visa Application is Received', `
    <p>Dear ${escapeHtml(contact.title)} ${escapeHtml(contact.fullName)},</p>
    <p>Thank you for submitting your Vietnam e-Visa application. We have received your request and will process it promptly.</p>
    <div style="background:#f8f5ef;border:1px solid #efe5d1;border-radius:12px;padding:20px;margin:20px 0">
      <p style="margin:0 0 8px"><strong>Application ID:</strong> ${escapeHtml(id)}</p>
      <p style="margin:0 0 8px"><strong>Number of Visas:</strong> ${escapeHtml(payload.numberOfVisa)}</p>
      <p style="margin:0 0 8px"><strong>Processing Time:</strong> ${escapeHtml(processingTime)}</p>
      <p style="margin:0 0 8px"><strong>Entry Date:</strong> ${escapeHtml(payload.entryDate)}</p>
      <p style="margin:0 0 8px"><strong>Airport:</strong> ${escapeHtml(payload.arrivalAirport)}</p>
      <p style="margin:0"><strong>Total Fee:</strong> $${escapeHtml(payload.totalFee)} USD</p>
    </div>
    <p><strong>What happens next?</strong></p>
    <ol style="padding-left:20px">
      <li>We will review your application and verify the details.</li>
      <li>You will receive your visa approval letter via email within <strong>${escapeHtml(processingTime)}</strong>.</li>
      <li>Payment instructions will be sent once your visa is confirmed.</li>
    </ol>
    <p>If you have any questions, simply reply to this email or contact us directly.</p>
    <p style="margin-top:24px;color:#666;font-size:13px">This is a no-obligation service. Your personal information is kept secure and private.</p>
  `);
}

export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(clientKey(request, 'visa'), 3, 10 * 60 * 1000)) {
      return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
    }
    assertEmailReady();
    const body = await request.json();

    // Honeypot check
    if (body.website) {
      return NextResponse.json({ message: 'Spam protection rejected this request' }, { status: 400 });
    }

    const contact = body.contact as { email?: string; fullName?: string } | undefined;
    if (!contact?.email || !contact?.fullName) {
      return NextResponse.json({ message: 'Contact email and name are required' }, { status: 400 });
    }

    const id = visaId();

    // Send to admin
    await sendMail({
      to: adminEmail(),
      subject: `New Visa Application - ${contact.fullName}`,
      html: adminVisaEmailTemplate(body, id),
      replyTo: contact.email,
    });

    // Send confirmation to customer
    await sendMail({
      to: contact.email,
      subject: 'Your Vietnam Visa Application has been received',
      html: customerVisaConfirmationTemplate(body, id),
    });

    return NextResponse.json({ id, status: 'received' }, { status: 201 });
  } catch (error) {
    if (error instanceof EmailConfigurationError) {
      return NextResponse.json({ message: error.message }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : 'Visa application failed';
    return NextResponse.json({ message }, { status: 400 });
  }
}
