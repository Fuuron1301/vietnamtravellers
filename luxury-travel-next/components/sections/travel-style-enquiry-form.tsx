'use client';

import Script from 'next/script';
import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';
import { ArrowUpRight, Check, Loader2 } from 'lucide-react';
import type { LeadPayload } from '@/lib/types';

type RecaptchaWindow = Window & {
  grecaptcha?: {
    ready: (callback: () => void) => void;
    execute: (key: string, options: { action: string }) => Promise<string>;
  };
};

type EnquiryStatus =
  | { type: 'idle'; message: string }
  | { type: 'loading'; message: string }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string };

export function TravelStyleEnquiryForm({
  styleTitle,
  duration,
  price,
  destination
}: {
  styleTitle: string;
  duration: string;
  price: string;
  destination: string;
}) {
  const [status, setStatus] = useState<EnquiryStatus>({ type: 'idle', message: '' });
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    dates: '',
    notes: ''
  });

  const updateField = (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  async function recaptchaToken() {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey || typeof window === 'undefined') return '';

    const grecaptcha = (window as RecaptchaWindow).grecaptcha;
    if (!grecaptcha) return '';

    return new Promise<string>((resolve) => {
      grecaptcha.ready(() => {
        grecaptcha.execute(siteKey, { action: 'lead_submit' }).then(resolve).catch(() => resolve(''));
      });
    });
  }

  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ type: 'loading', message: 'Sending your enquiry...' });

    const payload: LeadPayload = {
      destinations: [destination],
      routeFocus: [styleTitle],
      dates: form.dates,
      startEnd: 'Flexible',
      duration,
      adults: 2,
      children: 0,
      travelerType: 'Private travelers',
      pace: 'Balanced',
      style: styleTitle,
      budget: price,
      hotel: 'Luxury boutique or 5-star stay',
      interests: [styleTitle],
      support: 'Full planning and on-trip support',
      notes: form.notes ? `${form.notes}\n\nTravel style: ${styleTitle}` : `Travel style: ${styleTitle}`,
      website: '',
      recaptchaToken: await recaptchaToken(),
      contact: {
        fullName: form.fullName,
        email: form.email,
        phone: '',
        country: ''
      }
    };

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.message || 'Could not send enquiry');
      setStatus({ type: 'success', message: "Thank you. We'll respond within 24 hours." });
      setForm({ fullName: '', email: '', dates: '', notes: '' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Could not send enquiry'
      });
    }
  }

  return (
    <form onSubmit={submitEnquiry} className="grid gap-[20px]" id="begin-planning">
      {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? (
        <Script src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`} strategy="afterInteractive" />
      ) : null}

      <div className="grid gap-[20px] md:grid-cols-2">
        <Field
          label="Full Name"
          name="fullName"
          value={form.fullName}
          onChange={updateField('fullName')}
          placeholder="Your name"
          autoComplete="name"
          required
        />
        <Field
          label="Email Address"
          name="email"
          value={form.email}
          onChange={updateField('email')}
          placeholder="you@example.com"
          type="email"
          autoComplete="email"
          required
        />
      </div>

      <Field
        label="Preferred Travel Dates"
        name="dates"
        value={form.dates}
        onChange={updateField('dates')}
        placeholder="e.g. October 2026, or flexible"
        required
      />

      <label className="block">
        <span className="text-[14px] font-extrabold text-navy/62">Tell us more (optional)</span>
        <textarea
          rows={4}
          value={form.notes}
          onChange={updateField('notes')}
          placeholder="Group size, special requests, any questions..."
          className="mt-[8px] w-full rounded-[14px] border border-[#d8c7aa] bg-[#fffefb] px-[20px] py-[16px] text-[16px] font-semibold leading-7 text-navy outline-none transition duration-300 ease-luxe placeholder:text-navy/34 focus:border-gold focus:ring-4 focus:ring-gold/12"
        />
      </label>

      <button
        type="submit"
        disabled={status.type === 'loading'}
        className="inline-flex min-h-[60px] w-full items-center justify-center gap-[10px] rounded-[12px] bg-navy px-[28px] text-[16px] font-black text-ivory shadow-[0_18px_44px_rgba(11,27,43,0.16)] transition duration-300 ease-luxe hover:-translate-y-0.5 hover:bg-gold hover:text-navy disabled:pointer-events-none disabled:opacity-60"
      >
        {status.type === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : status.type === 'success' ? <Check className="h-4 w-4" /> : null}
        {status.type === 'loading' ? 'Sending...' : status.type === 'success' ? 'Enquiry Sent' : 'Send Enquiry'}
        <ArrowUpRight className="h-4 w-4" />
      </button>

      <p className="text-center text-[14px] font-semibold text-navy/42">
        {status.message || "No payment required. We'll respond within 24 hours."}
      </p>
    </form>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...input } = props;

  return (
    <label className="block">
      <span className="text-[14px] font-extrabold text-navy/62">{label}</span>
      <input
        {...input}
        className="mt-[8px] min-h-[58px] w-full rounded-[14px] border border-[#d8c7aa] bg-[#fffefb] px-[20px] text-[16px] font-semibold text-navy outline-none transition duration-300 ease-luxe placeholder:text-navy/34 focus:border-gold focus:ring-4 focus:ring-gold/12"
      />
    </label>
  );
}
