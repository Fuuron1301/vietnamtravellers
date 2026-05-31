'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Copy,
  Loader2,
  LockKeyhole,
  QrCode,
  ShieldCheck
} from 'lucide-react';
import type { PaymentMethodId, PaymentMode, PaymentSession } from '@/lib/payment-session';
import { cn } from '@/lib/utils';
import { checkoutPaymentMethods, PaymentMethodBadge } from './payment-method-badge';

type CopyTarget = 'note' | 'payload' | null;

const defaultBookingReference = 'HLT-QUOTE-001';

function formatPaymentAmount(session: Pick<PaymentSession, 'amount' | 'currency'>) {
  return new Intl.NumberFormat(session.currency === 'VND' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: session.currency,
    maximumFractionDigits: session.currency === 'VND' ? 0 : 2
  }).format(session.amount);
}

function modeLabel(mode: PaymentMode) {
  if (mode === 'real') return 'Real VietQR';
  if (mode === 'configuration_required') return 'Bank setup needed';
  return 'Demo handoff';
}

function modeClasses(mode: PaymentMode) {
  if (mode === 'real') return 'border-[#3abf7c]/30 bg-[#3abf7c]/10 text-[#0f6d45]';
  if (mode === 'configuration_required') return 'border-gold/35 bg-gold/12 text-gold-dark';
  return 'border-navy/10 bg-navy/[0.04] text-navy/58';
}

export function CheckoutExperience({
  initialBookingId = defaultBookingReference,
  initialAmount = '5000000',
  initialCurrency = 'VND',
  initialMethod = 'vietqr'
}: {
  initialBookingId?: string;
  initialAmount?: string;
  initialCurrency?: string;
  initialMethod?: PaymentMethodId;
}) {
  const [bookingId, setBookingId] = useState(initialBookingId || defaultBookingReference);
  const [amount, setAmount] = useState(initialAmount || '5000000');
  const [currency, setCurrency] = useState(initialCurrency || 'VND');
  const [method, setMethod] = useState<PaymentMethodId>(initialMethod);
  const [session, setSession] = useState<PaymentSession | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<CopyTarget>(null);

  const selectedMethod = useMemo(
    () => checkoutPaymentMethods.find((item) => item.id === method) || checkoutPaymentMethods[0],
    [method]
  );
  const displayMethodLabel = session?.methodLabel || selectedMethod.label;

  function markPaymentPending() {
    setSession(null);
    setLoading(true);
  }

  const createSession = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('/api/payments/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            amount: Number(amount),
            currency,
            method
          }),
          signal
        });
        const payload = await response.json() as PaymentSession | { message?: string };

        if (!response.ok) {
          throw new Error('message' in payload && payload.message ? payload.message : 'Unable to create payment session.');
        }

        setSession(payload as PaymentSession);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setSession(null);
        setError(err instanceof Error ? err.message : 'Unable to create payment session.');
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [amount, bookingId, currency, method]
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void createSession(controller.signal);
    }, 360);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [createSession]);

  async function copyValue(value: string, target: CopyTarget) {
    if (!value || !target) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(target);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      setError('Your browser blocked clipboard access. Please copy the text manually.');
    }
  }

  return (
    <section className="relative min-h-screen px-[16px] pb-[120px] pt-[112px] text-navy sm:px-[24px] md:px-[40px] md:pt-[118px]">
      <article className="mx-auto grid max-w-[1280px] overflow-hidden rounded-[34px] border border-[#e1d3bc] bg-[#fffdf8] shadow-[0_38px_120px_rgba(11,27,43,0.20)] sm:rounded-[46px] min-[900px]:grid-cols-[minmax(0,1fr)_400px] min-[1180px]:grid-cols-[minmax(0,1fr)_430px] xl:grid-cols-[minmax(0,1fr)_460px]">
        <div className="relative overflow-hidden bg-navy px-[20px] py-[36px] text-pearl sm:px-[32px] sm:py-[40px] md:px-[40px] min-[900px]:px-[40px] min-[900px]:py-[48px] min-[1180px]:px-[48px] xl:px-[56px] xl:py-[56px]">
          <div className="absolute inset-0 opacity-18 [background-image:url('/images/booking/vietnam-ha-long-kayaks-4k.jpg')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,27,43,0.98)_0%,rgba(11,27,43,0.93)_58%,rgba(11,27,43,0.82)_100%)]" />
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/34 bg-gold/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-gold">
                <LockKeyhole className="h-4 w-4" />
                Secure payment
              </span>
              <span className="hidden max-w-full items-center gap-3 rounded-full border border-pearl/14 bg-pearl/[0.08] px-3 py-2 min-[900px]:inline-flex">
                <PaymentMethodBadge id={method} active compact />
                <span className="text-[11px] font-black uppercase tracking-[0.14em] text-pearl/76">{selectedMethod.note}</span>
              </span>
            </div>

            <h1 className="mt-[28px] max-w-[13ch] pl-[3px] font-serif text-[42px] leading-[0.96] tracking-[-0.055em] text-pearl sm:text-[56px] lg:text-[64px]">
              Confirm your payment.
            </h1>
            <p className="mt-[18px] max-w-[60ch] text-[15px] font-semibold leading-7 text-pearl/72">
              One clear payment card for this booking. Review the reference, amount and QR before transferring.
            </p>

            <form
              className="mt-[30px] grid gap-[24px]"
              onSubmit={(event) => {
                event.preventDefault();
                void createSession();
              }}
            >
              <div className="grid gap-[18px] sm:grid-cols-[minmax(0,1fr)_180px]">
                <label className="grid gap-[8px]">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gold">Booking reference</span>
                  <input
                    value={bookingId}
                    onChange={(event) => {
                      markPaymentPending();
                      setBookingId(event.target.value);
                    }}
                    className="min-h-[60px] rounded-[20px] border border-pearl/14 bg-pearl/[0.08] px-[20px] text-[15px] font-black text-pearl outline-none transition duration-300 ease-luxe placeholder:text-pearl/32 focus:border-gold focus:bg-pearl/[0.12]"
                    placeholder="HLT-QUOTE-001"
                  />
                </label>
                <label className="grid gap-[8px]">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gold">Currency</span>
                  <select
                    value={currency}
                    onChange={(event) => {
                      markPaymentPending();
                      setCurrency(event.target.value);
                    }}
                    className="min-h-[60px] rounded-[20px] border border-pearl/14 bg-pearl/[0.08] px-[20px] text-[15px] font-black text-pearl outline-none transition duration-300 ease-luxe focus:border-gold focus:bg-[#12323f]"
                  >
                    <option className="bg-navy text-pearl" value="VND">VND</option>
                    <option className="bg-navy text-pearl" value="USD">USD</option>
                    <option className="bg-navy text-pearl" value="EUR">EUR</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-[18px] sm:grid-cols-[minmax(0,1fr)_180px]">
                <label className="grid gap-[8px]">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gold">Amount</span>
                  <input
                    value={amount}
                    onChange={(event) => {
                      markPaymentPending();
                      setAmount(event.target.value);
                    }}
                    type="number"
                    min="1"
                    step="1"
                    className="min-h-[60px] rounded-[20px] border border-pearl/14 bg-pearl/[0.08] px-[20px] text-[15px] font-black text-pearl outline-none transition duration-300 ease-luxe placeholder:text-pearl/32 focus:border-gold focus:bg-pearl/[0.12]"
                  />
                </label>
                <div className="grid content-end gap-[10px] rounded-[20px] border border-pearl/12 bg-pearl/[0.06] px-[20px] py-[14px]">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gold">Selected</span>
                  <span className="flex items-center gap-2 text-[15px] font-black text-pearl">
                    <PaymentMethodBadge id={method} active compact />
                    {selectedMethod.label}
                  </span>
                </div>
              </div>

              <div className="rounded-[30px] border border-pearl/12 bg-pearl/[0.055] p-[20px] shadow-[inset_0_1px_0_rgba(248,245,239,0.08)]">
                <div className="flex flex-wrap items-end justify-between gap-[16px] pb-[18px]">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gold">Choose payment method</span>
                  <span className="text-[12px] font-bold text-pearl/50">Select one gateway.</span>
                </div>
                <div className="grid grid-cols-2 gap-[14px] sm:grid-cols-4 min-[1180px]:gap-[16px]">
                  {checkoutPaymentMethods.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        markPaymentPending();
                        setMethod(item.id);
                      }}
                      aria-pressed={method === item.id}
                      className={cn(
                        'group min-w-0 rounded-[20px] border px-[12px] py-[14px] text-center transition duration-300 ease-luxe hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 sm:min-h-[104px]',
                        method === item.id
                          ? 'border-gold bg-pearl/[0.14] shadow-[0_18px_38px_rgba(200,169,106,0.18)]'
                          : 'border-pearl/10 bg-pearl/[0.055] hover:border-pearl/24 hover:bg-pearl/[0.08]'
                      )}
                    >
                      <span className="flex justify-center">
                        <PaymentMethodBadge id={item.id} active={method === item.id} compact />
                      </span>
                      <span className="mt-[8px] block truncate text-[11px] font-black tracking-[-0.02em] text-pearl">{item.label}</span>
                      <span className="mt-[2px] block truncate text-[9px] font-bold text-pearl/48">{item.note}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-[16px] pt-[4px] sm:flex-row sm:items-center">
                <button
                  type="submit"
                  className="inline-flex min-h-[60px] items-center justify-center gap-[12px] rounded-[20px] bg-gold px-[28px] text-[11px] font-black uppercase tracking-[0.18em] text-navy shadow-[0_18px_38px_rgba(200,169,106,0.22)] transition duration-300 ease-luxe hover:-translate-y-0.5 hover:bg-[#e2c57f]"
                >
                  Refresh QR <ArrowRight className="h-4 w-4" />
                </button>
                <p className="text-[13px] font-semibold leading-6 text-pearl/54">
                  QR also refreshes automatically when details change.
                </p>
              </div>
            </form>

            {error ? (
              <div className="mt-6 flex items-start gap-3 rounded-[20px] border border-[#ffbe85]/30 bg-[#ffbe85]/12 px-4 py-3 text-[14px] font-bold leading-6 text-[#ffe6cf]" role="alert" aria-live="polite">
                <AlertCircle className="mt-[2px] h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="bg-[linear-gradient(180deg,#fffdf8_0%,#efe5d1_100%)] px-[20px] py-[36px] sm:px-[32px] sm:py-[40px] md:px-[40px] min-[900px]:px-[36px] min-[900px]:py-[48px] xl:px-[44px] xl:py-[56px]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-gold-dark">Payment QR</p>
              <h2 className="mt-2 text-[28px] font-black leading-8 tracking-[-0.055em] text-navy">
                {displayMethodLabel} handoff
              </h2>
            </div>
            {session ? (
              <span className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em]', modeClasses(session.mode))}>
                <ShieldCheck className="h-4 w-4" />
                {modeLabel(session.mode)}
              </span>
            ) : null}
          </div>

          <div className="mt-[32px] grid gap-[28px] min-[700px]:grid-cols-[280px_minmax(0,1fr)] min-[900px]:grid-cols-1">
            <div className="grid min-h-[300px] place-items-center rounded-[34px] border border-navy/10 bg-[linear-gradient(145deg,#f9f6ee,#edf7f4)] p-[24px] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] min-[700px]:min-h-[280px] lg:min-h-[330px]">
              {loading ? (
                <div className="grid justify-items-center gap-4 text-center text-navy/62">
                  <Loader2 className="h-10 w-10 animate-spin text-gold-dark" />
                  <p className="text-[13px] font-black uppercase tracking-[0.18em]">Generating QR</p>
                </div>
              ) : session ? (
                <Image
                  src={session.qrImageUrl}
                  alt={`${session.methodLabel} QR for ${session.bookingId}`}
                  width={292}
                  height={292}
                  unoptimized
                  className="h-[min(58vw,278px)] w-[min(58vw,278px)] rounded-[24px] border border-navy/10 bg-white object-contain p-[20px] shadow-[0_16px_34px_rgba(11,27,43,0.12)] min-[700px]:h-[224px] min-[700px]:w-[224px] lg:h-[278px] lg:w-[278px]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="grid justify-items-center gap-4 text-center text-navy/56">
                  <QrCode className="h-12 w-12 text-gold-dark" />
                  <p className="text-[13px] font-black uppercase tracking-[0.18em]">Enter details to generate QR</p>
                </div>
              )}
            </div>

            {session ? (
              <div className="grid content-start gap-[20px]">
              <div className="grid gap-[20px] rounded-[30px] border border-navy/10 bg-navy/[0.035] p-[22px]">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-navy/42">Amount</p>
                  <p className="mt-2 text-[25px] font-black leading-8 tracking-[-0.06em] text-navy">{formatPaymentAmount(session)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-navy/42">Reference</p>
                  <p className="mt-2 break-all text-[14px] font-black leading-6 text-navy">{session.transferNote}</p>
                </div>
                {session.account ? (
                  <div className="border-t border-navy/10 pt-[20px]">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-navy/42">Receiving account</p>
                    <p className="mt-1 text-[13px] font-extrabold leading-6 text-navy">
                      {session.account.accountName} - {session.account.bankId} - {session.account.accountNo}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="grid gap-[12px]">
                {session.instructions.map((instruction) => (
                  <p key={instruction} className="flex items-start gap-3 text-[13px] font-semibold leading-7 text-navy/64">
                    <CheckCircle2 className="mt-[2px] h-4 w-4 shrink-0 text-gold-dark" />
                    <span>{instruction}</span>
                  </p>
                ))}
              </div>

              {session.warning ? (
                <div className="rounded-[20px] border border-gold/28 bg-gold/10 px-4 py-3 text-[13px] font-bold leading-6 text-navy/72">
                  {session.warning}
                </div>
              ) : null}

              <div className="grid gap-[12px] sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => void copyValue(session.transferNote, 'note')}
                  className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-[18px] border border-navy/10 bg-white px-4 text-[11px] font-black uppercase tracking-[0.14em] text-navy transition duration-300 ease-luxe hover:-translate-y-0.5 hover:border-gold"
                >
                  <Copy className="h-4 w-4" />
                  {copied === 'note' ? 'Copied note' : 'Copy note'}
                </button>
                <button
                  type="button"
                  onClick={() => void copyValue(session.qrPayload, 'payload')}
                  className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-[18px] border border-navy/10 bg-white px-4 text-[11px] font-black uppercase tracking-[0.14em] text-navy transition duration-300 ease-luxe hover:-translate-y-0.5 hover:border-gold"
                >
                  <QrCode className="h-4 w-4" />
                  {copied === 'payload' ? 'Copied QR data' : 'Copy QR data'}
                </button>
              </div>
              </div>
            ) : null}
          </div>
        </div>
      </article>
    </section>
  );
}
