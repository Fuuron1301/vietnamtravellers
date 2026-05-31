import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { submitLead } from '@/lib/cms';
import { adminEmail, assertEmailReady, EmailConfigurationError, leadEmailTemplate, confirmationEmailTemplate, sendMail } from '@/lib/email';
import { clientKey, hasBotPattern, isRateLimited, verifyRecaptcha } from '@/lib/security';

const leadSchema = z.object({
  destinations: z.array(z.string()).min(1),
  routeFocus: z.array(z.string()).optional(),
  dates: z.string().min(1),
  startEnd: z.string().optional(),
  duration: z.string().min(1),
  adults: z.number().min(1),
  children: z.number().min(0),
  travelerType: z.string().optional(),
  pace: z.string().optional(),
  style: z.string().min(1),
  budget: z.string().min(1),
  hotel: z.string().min(1),
  interests: z.array(z.string()),
  support: z.string().optional(),
  notes: z.string().optional(),
  website: z.string().optional(),
  recaptchaToken: z.string().optional(),
  matchedTours: z.array(z.object({
    title: z.string(),
    slug: z.string(),
    href: z.string(),
    score: z.number(),
    amountUsd: z.number(),
    reasons: z.array(z.string())
  })).optional(),
  contact: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    country: z.string().optional()
  })
});

export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(clientKey(request, 'lead'), 5, 10 * 60 * 1000)) {
      return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
    }
    assertEmailReady();
    const payload = leadSchema.parse(await request.json());
    if (hasBotPattern(payload) || !(await verifyRecaptcha(payload.recaptchaToken))) {
      return NextResponse.json({ message: 'Spam protection rejected this request' }, { status: 400 });
    }
    const result = await submitLead(payload);
    await sendMail({
      to: adminEmail(),
      subject: 'New tailor-made travel lead',
      html: leadEmailTemplate(payload),
      replyTo: payload.contact.email
    });
    // Send confirmation email to customer
    if (payload.contact.email) {
      await sendMail({
        to: payload.contact.email,
        subject: 'Your travel inquiry has been received',
        html: confirmationEmailTemplate({ id: result?.id || 'Tailor-made inquiry' }),
      });
    }
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof EmailConfigurationError) {
      return NextResponse.json({ message: error.message }, { status: 503 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        message: 'Please check the required booking information.',
        issues: error.issues.map((issue) => ({
          path: issue.path,
          message: issue.message
        }))
      }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Invalid lead payload';
    return NextResponse.json({ message }, { status: 400 });
  }
}


