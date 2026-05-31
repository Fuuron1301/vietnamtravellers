import nodemailer from 'nodemailer';

type MailInput = {
  to?: string;
  subject: string;
  html: string;
  replyTo?: string;
};

function envValue(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return undefined;
}

const fromEmail = envValue('MAIL_FROM_EMAIL', 'SMTP_FROM', 'SENDGRID_FROM') || 'booking@example.com';
const fromName = envValue('MAIL_FROM_NAME');
const fromAddress = fromName ? { name: fromName, address: fromEmail } : fromEmail;
const adminAddress = envValue('SALES_NOTIFICATION_EMAIL', 'MAIL_TO', 'SMTP_TO', 'MAIL_FROM_EMAIL') || fromEmail;

export class EmailConfigurationError extends Error {
  constructor(message = 'SMTP is not configured for production delivery') {
    super(message);
    this.name = 'EmailConfigurationError';
  }
}

function smtpTransport() {
  const enabled = envValue('MAIL_ENABLED')?.toLowerCase();
  if (enabled === '0' || enabled === 'false' || enabled === 'no') return null;

  const host = envValue('MAIL_SMTP_HOST', 'SMTP_HOST');
  const user = envValue('MAIL_SMTP_USER', 'SMTP_USER');
  const pass = envValue('MAIL_SMTP_PASS', 'SMTP_PASS');
  if (!host || !user || !pass || !fromAddress || !adminAddress) return null;

  const port = Number(envValue('MAIL_SMTP_PORT', 'SMTP_PORT') || 587);
  const secureMode = envValue('MAIL_SMTP_SECURE', 'SMTP_SECURE')?.toLowerCase();

  return nodemailer.createTransport({
    host,
    port,
    secure: secureMode === 'true' || secureMode === 'ssl' || port === 465,
    requireTLS: secureMode === 'tls' || secureMode === 'starttls',
    auth: { user, pass }
  });
}

export function assertEmailReady() {
  if (!smtpTransport()) {
    throw new EmailConfigurationError('MAIL_SMTP_HOST, MAIL_SMTP_USER, MAIL_SMTP_PASS and MAIL_FROM_EMAIL are required when using MAIL_* SMTP settings');
  }
}

export function escapeHtml(value: unknown) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function leadEmailTemplate(payload: Record<string, unknown>) {
  const contact = (payload.contact || {}) as Record<string, unknown>;
  const destinations = Array.isArray(payload.destinations) ? payload.destinations.join(', ') : '';
  const routeFocus = Array.isArray(payload.routeFocus) ? payload.routeFocus.join(', ') : '';
  const interests = Array.isArray(payload.interests) ? payload.interests.join(', ') : '';
  const matchedTours = Array.isArray(payload.matchedTours)
    ? payload.matchedTours
        .slice(0, 4)
        .map((item) => {
          const tour = item as Record<string, unknown>;
          const reasons = Array.isArray(tour.reasons) ? tour.reasons.join(', ') : '';
          return `<li><strong>${escapeHtml(tour.title)}</strong> (${escapeHtml(tour.amountUsd)} USD) · ${escapeHtml(reasons)}<br><span>${escapeHtml(tour.href)}</span></li>`;
        })
        .join('')
    : '';
  return luxuryEmailShell('New tailor-made inquiry', `
    <p><strong>Guest:</strong> ${escapeHtml(contact.fullName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(contact.email)}</p>
    <p><strong>WhatsApp / Zalo:</strong> ${escapeHtml(contact.phone)}</p>
    <p><strong>Country:</strong> ${escapeHtml(contact.country)}</p>
    <p><strong>Destinations:</strong> ${escapeHtml(destinations)}</p>
    <p><strong>Route focus:</strong> ${escapeHtml(routeFocus)}</p>
    <p><strong>Dates:</strong> ${escapeHtml(payload.dates)}</p>
    <p><strong>Arrival / departure:</strong> ${escapeHtml(payload.startEnd)}</p>
    <p><strong>Duration:</strong> ${escapeHtml(payload.duration)}</p>
    <p><strong>Travelers:</strong> ${escapeHtml(payload.adults)} adults, ${escapeHtml(payload.children)} children (${escapeHtml(payload.travelerType)})</p>
    <p><strong>Pace:</strong> ${escapeHtml(payload.pace)}</p>
    <p><strong>Style:</strong> ${escapeHtml(payload.style)}</p>
    <p><strong>Budget:</strong> ${escapeHtml(payload.budget)}</p>
    <p><strong>Hotel:</strong> ${escapeHtml(payload.hotel)}</p>
    <p><strong>Interests:</strong> ${escapeHtml(interests)}</p>
    <p><strong>Support:</strong> ${escapeHtml(payload.support)}</p>
    <p><strong>Notes:</strong> ${escapeHtml(payload.notes)}</p>
    ${matchedTours ? `<p><strong>Recommended matches:</strong></p><ol>${matchedTours}</ol>` : ''}
  `);
}

export function bookingEmailTemplate(payload: Record<string, unknown>) {
  const destinations = Array.isArray(payload.destinations) ? payload.destinations.join(', ') : '';
  const routeFocus = Array.isArray(payload.routeFocus) ? payload.routeFocus.join(', ') : '';
  const interests = Array.isArray(payload.interests) ? payload.interests.join(', ') : '';
  return luxuryEmailShell('New booking request', `
    <p><strong>Booking ID:</strong> ${escapeHtml(payload.bookingId)}</p>
    <p><strong>Amount:</strong> ${escapeHtml(payload.amount)} ${escapeHtml(payload.currency)}</p>
    <p><strong>Method:</strong> ${escapeHtml(payload.method)}</p>
    <p><strong>Status:</strong> Pending</p>
    <p><strong>Destinations:</strong> ${escapeHtml(destinations)}</p>
    <p><strong>Route focus:</strong> ${escapeHtml(routeFocus)}</p>
    <p><strong>Dates:</strong> ${escapeHtml(payload.dates)}</p>
    <p><strong>Duration:</strong> ${escapeHtml(payload.duration)}</p>
    <p><strong>Travelers:</strong> ${escapeHtml(payload.adults)} adults, ${escapeHtml(payload.children)} children</p>
    <p><strong>Style:</strong> ${escapeHtml(payload.style)}</p>
    <p><strong>Hotel:</strong> ${escapeHtml(payload.hotel)}</p>
    <p><strong>Interests:</strong> ${escapeHtml(interests)}</p>
    <p><strong>Support:</strong> ${escapeHtml(payload.support)}</p>
  `);
}

export function confirmationEmailTemplate(payload: Record<string, unknown>) {
  return luxuryEmailShell('Your private journey request is received', `
    <p>Thank you. Our travel designer has received your request and will reply within 24 hours.</p>
    <p><strong>Reference:</strong> ${escapeHtml(payload.bookingId || payload.id || 'Tailor-made inquiry')}</p>
    <p>This is a no-obligation consultation. Your information remains private.</p>
  `);
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

export async function sendMail(input: MailInput) {
  const transport = smtpTransport();
  if (!transport) {
    throw new EmailConfigurationError();
  }
  return transport.sendMail({
    from: fromAddress,
    to: input.to || adminAddress,
    subject: input.subject,
    html: input.html,
    replyTo: input.replyTo
  });
}

export function adminEmail() {
  return adminAddress;
}
