'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, ChevronLeft, Mail, Phone, User, Calendar, Smartphone,
  MessageSquare, Star, Wifi, ShieldCheck, Send, ArrowRight, ArrowLeft,
  AlertCircle, Edit3, Package, Globe2,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/* ══════════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════════ */

const COUNTRY_CODES = [
  { code: '+1', country: 'US/CA' }, { code: '+7', country: 'RU/KZ' },
  { code: '+30', country: 'GR' }, { code: '+31', country: 'NL' },
  { code: '+32', country: 'BE' }, { code: '+33', country: 'FR' },
  { code: '+34', country: 'ES' }, { code: '+39', country: 'IT' },
  { code: '+41', country: 'CH' }, { code: '+44', country: 'GB' },
  { code: '+45', country: 'DK' }, { code: '+46', country: 'SE' },
  { code: '+47', country: 'NO' }, { code: '+48', country: 'PL' },
  { code: '+49', country: 'DE' }, { code: '+54', country: 'AR' },
  { code: '+55', country: 'BR' }, { code: '+56', country: 'CL' },
  { code: '+60', country: 'MY' }, { code: '+61', country: 'AU' },
  { code: '+62', country: 'ID' }, { code: '+63', country: 'PH' },
  { code: '+64', country: 'NZ' }, { code: '+65', country: 'SG' },
  { code: '+66', country: 'TH' }, { code: '+81', country: 'JP' },
  { code: '+82', country: 'KR' }, { code: '+84', country: 'VN' },
  { code: '+86', country: 'CN' }, { code: '+91', country: 'IN' },
  { code: '+351', country: 'PT' }, { code: '+352', country: 'LU' },
  { code: '+353', country: 'IE' }, { code: '+358', country: 'FI' },
  { code: '+852', country: 'HK' }, { code: '+886', country: 'TW' },
  { code: '+971', country: 'AE' }, { code: '+974', country: 'QA' },
];

const TITLES = ['Mr.', 'Ms.', 'Mrs.', 'Dr.'];

const PHASES = [
  { title: 'Choose booking', subtitle: 'Select your package' },
  { title: 'Enter info', subtitle: 'Contact & travel details' },
  { title: 'Confirm', subtitle: 'Review & send' },
];

const fieldBase = 'w-full rounded-[16px] border-2 border-[#e4d8c2] bg-white px-6 py-4 text-[15px] text-navy transition focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/10 placeholder:text-navy/35';

/* ══════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════ */

type FormData = {
  title: string;
  fullName: string;
  email: string;
  countryCode: string;
  phone: string;
  travelDate: string;
  deviceModel: string;
  quantity: number;
  message: string;
};

type Errors = Partial<Record<keyof FormData | 'submit', string>>;

type Props = {
  productId: number;
  productTitle: string;
  productSlug: string;
  productOperator: string;
  productScore: number;
  productReviews: number;
  packageName: string;
  packagePrice: string;
  packageData: string;
  packageValidity: string;
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */

export default function SimBookForm({
  productId,
  productTitle,
  productSlug,
  productOperator,
  productScore,
  productReviews,
  packageName,
  packagePrice,
  packageData,
  packageValidity,
}: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    title: 'Mr.',
    fullName: '',
    email: '',
    countryCode: '+1',
    phone: '',
    travelDate: '',
    deviceModel: '',
    quantity: 1,
    message: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState('');

  const price = parseFloat(packagePrice || '0');
  const total = (price * form.quantity).toFixed(2);
  const shortTitle = productTitle.split('|')[0].trim();

  const set = <K extends keyof FormData>(field: K, value: FormData[K]) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const clearErr = (field: keyof FormData) =>
    setErrors(prev => ({ ...prev, [field]: '' }));

  const validate = (): boolean => {
    const errs: Errors = {};
    if (!form.fullName.trim()) errs.fullName = 'Please enter your full name';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Please enter a valid email address';
    if (!form.phone.trim()) errs.phone = 'Please enter your phone number';
    if (!form.travelDate) errs.travelDate = 'Please select your travel date';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => { if (validate()) setStep(1); };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const parts = packageName.split(' · ');
      const payload = {
        product: {
          id: productId,
          name: `${shortTitle} — ${packageName}`,
          category: 'esim',
          data: packageData || parts[2] || '',
          validity: packageValidity || parts[1] || '',
          network: productOperator,
          provider: productOperator,
        },
        contact: {
          fullName: `${form.title} ${form.fullName}`.trim(),
          email: form.email,
          countryCode: form.countryCode,
          phone: form.phone,
        },
        quantity: form.quantity,
        totalPrice: total,
        delivery: 'email (eSIM QR code)',
        arrivalDate: form.travelDate,
        deviceModel: form.deviceModel || undefined,
        message: form.message || undefined,
      };

      const res = await fetch('/api/sim-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || 'Submission failed');
      }

      const data = await res.json() as { id?: string };
      setOrderId(data.id || '');
      setSubmitted(true);
    } catch (err: unknown) {
      setErrors({ submit: err instanceof Error ? err.message : 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div className="mx-auto max-w-[820px]">
        <PhaseBar stage={2} />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 rounded-[40px] border border-[#e4d8c2] bg-[linear-gradient(180deg,#fffdf8,#faf5ec)] p-10 text-center shadow-[0_30px_92px_rgba(11,27,43,0.13)] md:p-16"
        >
          <div className="mx-auto mb-8 grid h-24 w-24 place-items-center rounded-full bg-gold shadow-[0_16px_40px_rgba(200,169,106,0.35)]">
            <Check className="h-11 w-11 text-navy" strokeWidth={2.5} />
          </div>
          <h2 className="font-serif text-[clamp(28px,3.4vw,40px)] font-bold text-navy">Order Submitted!</h2>
          <p className="mx-auto mt-5 max-w-[520px] text-[16px] leading-relaxed text-navy/60">
            Your eSIM order has been received. We&apos;ll send your QR code and confirmation to{' '}
            <strong className="text-navy">{form.email}</strong> shortly.
          </p>
          {orderId && (
            <div className="mx-auto mt-10 max-w-[400px] rounded-[24px] border border-gold/30 bg-gold/5 p-7">
              <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-gold-dark">Order ID</p>
              <p className="mt-2 font-serif text-[26px] font-bold tracking-wide text-navy">{orderId}</p>
            </div>
          )}
          <div className="mx-auto mt-10 max-w-[480px] space-y-4 text-left">
            {[
              'eSIM QR code will be emailed within 15 minutes of processing.',
              'Scan the QR code on your device before departure.',
              'Enable data roaming when you arrive in Japan.',
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-5">
                <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/20">
                  <Check className="h-3.5 w-3.5 text-gold-dark" strokeWidth={2.5} />
                </div>
                <p className="text-[14px] leading-relaxed text-navy/70">{s}</p>
              </div>
            ))}
          </div>
          <Link
            href={`/sim-card/${productSlug}`}
            className="mt-12 inline-flex items-center gap-2 rounded-full border-2 border-[#d9ccb4] bg-[#fffefb] px-8 py-4 text-[13px] font-black uppercase tracking-[0.1em] text-navy transition hover:border-gold hover:text-gold-dark"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to product
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="rounded-[40px] border border-[#e4d8c2] bg-[linear-gradient(180deg,#fffdf8,#faf5ec)] p-6 shadow-[0_30px_92px_rgba(11,27,43,0.13)] md:p-10 lg:p-14">
      {/* PhaseBar inside container, like visa form */}
      <PhaseBar stage={step + 1} />

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* LEFT: form */}
        <div className="min-w-0 flex-1">
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {step === 0 && (
                  <StepEnterInfo form={form} set={set} clearErr={clearErr} errors={errors} />
                )}
                {step === 1 && (
                  <StepReview
                    form={form}
                    packageName={packageName}
                    packageData={packageData}
                    packageValidity={packageValidity}
                    productTitle={shortTitle}
                    price={price}
                    total={total}
                    goBack={() => setStep(0)}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="mt-12 flex items-center justify-between border-t border-[#eadcc8] pt-8">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="flex items-center gap-3 rounded-full border-2 border-[#d9ccb4] bg-[#fffefb] px-8 py-4 text-[13px] font-black uppercase tracking-[0.16em] text-navy transition hover:border-gold hover:text-gold-dark"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {errors.submit && (
                <div className="flex items-center gap-2 text-[13px] text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.submit}
                </div>
              )}

              <button
                type="button"
                onClick={step === 0 ? nextStep : handleSubmit}
                disabled={submitting}
                className={cn(
                  'flex items-center gap-3 rounded-full px-10 py-4 text-[13px] font-black uppercase tracking-[0.16em] shadow-[0_16px_40px_rgba(11,27,43,0.22)] transition',
                  step === 0
                    ? 'bg-navy text-pearl hover:bg-gold hover:text-navy'
                    : 'bg-gold text-navy hover:bg-navy hover:text-pearl',
                  submitting && 'cursor-not-allowed opacity-60'
                )}
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/40 border-t-current" />
                    Sending…
                  </>
                ) : step === 0 ? (
                  <>Review order <ArrowRight className="h-4 w-4" /></>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: order summary */}
        <OrderSummary
          productTitle={shortTitle}
          packageName={packageName}
          packageData={packageData}
          packageValidity={packageValidity}
          productScore={productScore}
          productReviews={productReviews}
          productOperator={productOperator}
          price={price}
          quantity={form.quantity}
          total={total}
          productSlug={productSlug}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STEP 1 — ENTER INFO
══════════════════════════════════════════════════════════════ */

function StepEnterInfo({ form, set, clearErr, errors }: {
  form: FormData;
  set: <K extends keyof FormData>(f: K, v: FormData[K]) => void;
  clearErr: (f: keyof FormData) => void;
  errors: Errors;
}) {
  return (
    <div className="space-y-10">
      <FormSection title="Contact Information" icon={<Mail className="h-5 w-5" />}>
        <div className="space-y-8">
          <FieldGroup>
            <FieldLabel>Full name <Req /></FieldLabel>
            <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
              <select
                value={form.title}
                onChange={e => set('title', e.target.value)}
                className={fieldBase}
              >
                {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input
                type="text"
                value={form.fullName}
                onChange={e => { set('fullName', e.target.value); clearErr('fullName'); }}
                placeholder="Your full name (as in passport)"
                className={cn(fieldBase, errors.fullName && 'border-red-400')}
              />
            </div>
            {errors.fullName && <FieldError>{errors.fullName}</FieldError>}
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Email address <Req /></FieldLabel>
            <input
              type="email"
              value={form.email}
              onChange={e => { set('email', e.target.value); clearErr('email'); }}
              placeholder="your@email.com — eSIM QR code will be sent here"
              className={cn(fieldBase, errors.email && 'border-red-400')}
            />
            {errors.email && <FieldError>{errors.email}</FieldError>}
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Phone number <Req /></FieldLabel>
            <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
              <select
                value={form.countryCode}
                onChange={e => set('countryCode', e.target.value)}
                className={fieldBase}
              >
                {COUNTRY_CODES.map(c => (
                  <option key={`${c.code}-${c.country}`} value={c.code}>
                    {c.country} {c.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                value={form.phone}
                onChange={e => { set('phone', e.target.value); clearErr('phone'); }}
                placeholder="Phone number"
                className={cn(fieldBase, errors.phone && 'border-red-400')}
              />
            </div>
            {errors.phone && <FieldError>{errors.phone}</FieldError>}
          </FieldGroup>
        </div>
      </FormSection>

      <FormSection title="Travel Information" icon={<Globe2 className="h-5 w-5" />}>
        <div className="space-y-8">
          <FieldGroup>
            <FieldLabel>Travel / arrival date <Req /></FieldLabel>
            <input
              type="date"
              value={form.travelDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => { set('travelDate', e.target.value); clearErr('travelDate'); }}
              className={cn(fieldBase, errors.travelDate && 'border-red-400')}
            />
            {errors.travelDate && <FieldError>{errors.travelDate}</FieldError>}
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Device model <span className="font-normal text-navy/40">(optional)</span></FieldLabel>
            <input
              type="text"
              value={form.deviceModel}
              onChange={e => set('deviceModel', e.target.value)}
              placeholder="e.g. iPhone 15 Pro, Samsung Galaxy S24"
              className={fieldBase}
            />
            <p className="mt-2 text-[12px] text-navy/45">Helps us verify eSIM compatibility before sending</p>
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Quantity (eSIM)</FieldLabel>
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => set('quantity', Math.max(1, form.quantity - 1))}
                disabled={form.quantity <= 1}
                className="grid h-12 w-12 place-items-center rounded-full border-2 border-[#e4d8c2] bg-white text-[20px] font-bold text-navy transition hover:border-gold/60 disabled:opacity-30"
              >
                −
              </button>
              <span className="w-10 text-center font-serif text-[28px] font-bold text-navy">{form.quantity}</span>
              <button
                type="button"
                onClick={() => set('quantity', Math.min(10, form.quantity + 1))}
                disabled={form.quantity >= 10}
                className="grid h-12 w-12 place-items-center rounded-full border-2 border-[#e4d8c2] bg-white text-[20px] font-bold text-navy transition hover:border-gold/60 disabled:opacity-30"
              >
                +
              </button>
              <span className="text-[14px] text-navy/50">eSIM card{form.quantity > 1 ? 's' : ''}</span>
            </div>
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Message <span className="font-normal text-navy/40">(optional)</span></FieldLabel>
            <textarea
              rows={4}
              value={form.message}
              onChange={e => set('message', e.target.value)}
              placeholder="Any special requirements, questions, or notes for our team..."
              className={cn(fieldBase, 'resize-y min-h-[120px]')}
            />
          </FieldGroup>
        </div>
      </FormSection>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STEP 2 — REVIEW
══════════════════════════════════════════════════════════════ */

function StepReview({ form, packageName, packageData, packageValidity, productTitle, price, total, goBack }: {
  form: FormData;
  packageName: string;
  packageData: string;
  packageValidity: string;
  productTitle: string;
  price: number;
  total: string;
  goBack: () => void;
}) {
  return (
    <div className="space-y-10">
      <p className="text-[16px] text-navy/70">Please review your order before sending.</p>

      <div>
        <h3 className="mb-4 text-[16px] font-semibold text-navy">Product selected</h3>
        <div className="overflow-hidden rounded-[20px] border border-[#e4d8c2]">
          <div className="grid grid-cols-3 bg-navy text-center">
            <TableHead>Product</TableHead>
            <TableHead>Package</TableHead>
            <TableHead>Price</TableHead>
          </div>
          <div className="grid grid-cols-3 bg-white text-center">
            <TableCell>{productTitle}</TableCell>
            <TableCell>{packageName}</TableCell>
            <TableCell className="font-bold">US${price.toFixed(2)}</TableCell>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center gap-4">
          <h3 className="text-[16px] font-semibold text-navy">Contact details</h3>
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-1.5 rounded-full bg-gold px-4 py-1.5 text-[12px] font-bold text-navy transition hover:bg-gold/80"
          >
            <Edit3 className="h-3 w-3" /> Edit
          </button>
        </div>
        <div className="overflow-hidden rounded-[20px] border border-[#e4d8c2]">
          <div className="grid grid-cols-3 bg-navy text-center">
            <TableHead>Full name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
          </div>
          <div className="grid grid-cols-3 bg-white text-center">
            <TableCell>{form.title} {form.fullName}</TableCell>
            <TableCell>{form.email}</TableCell>
            <TableCell>{form.countryCode} {form.phone}</TableCell>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center gap-4">
          <h3 className="text-[16px] font-semibold text-navy">Travel details</h3>
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-1.5 rounded-full bg-gold px-4 py-1.5 text-[12px] font-bold text-navy transition hover:bg-gold/80"
          >
            <Edit3 className="h-3 w-3" /> Edit
          </button>
        </div>
        <div className="overflow-hidden rounded-[20px] border border-[#e4d8c2]">
          <div className="grid grid-cols-4 bg-navy text-center">
            <TableHead>Arrival date</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Validity</TableHead>
            <TableHead>Quantity</TableHead>
          </div>
          <div className="grid grid-cols-4 bg-white text-center">
            <TableCell>{form.travelDate}</TableCell>
            <TableCell>{packageData}</TableCell>
            <TableCell>{packageValidity}</TableCell>
            <TableCell>eSIM × {form.quantity}</TableCell>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border-2 border-gold/40 bg-gold/5 p-8">
        <div className="flex items-center justify-between">
          <span className="text-[18px] font-bold text-navy">TOTAL</span>
          <span className="text-[32px] font-bold text-navy">
            US${total} <span className="text-[16px] font-normal text-navy/50">USD</span>
          </span>
        </div>
        <p className="mt-3 text-[13px] text-navy/50">
          No payment now — we will confirm your order and send payment instructions via email.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ORDER SUMMARY (RIGHT PANEL)
══════════════════════════════════════════════════════════════ */

function OrderSummary({ productTitle, packageName, packageData, packageValidity, productScore, productReviews, productOperator, price, quantity, total, productSlug }: {
  productTitle: string;
  packageName: string;
  packageData: string;
  packageValidity: string;
  productScore: number;
  productReviews: number;
  productOperator: string;
  price: number;
  quantity: number;
  total: string;
  productSlug: string;
}) {
  // Parse plan type from package name (last segment, e.g. "Data only")
  const parts = packageName.split(' · ');
  const planType = parts[3] ?? parts[0] ?? '';

  const packageRows = [
    { label: 'Data coverage', value: packageData },
    { label: 'Valid duration', value: packageValidity },
    { label: 'Network', value: productOperator },
    { label: 'Plan type', value: planType },
  ].filter(r => r.value && r.value !== packageData || r.label === 'Data coverage');

  return (
    <div className="w-full lg:sticky lg:top-24 lg:w-[460px]">
      <div className="overflow-hidden rounded-[32px] border border-[#e4d8c2] bg-[linear-gradient(180deg,#fffdf8,#faf5ec)] shadow-[0_16px_48px_rgba(11,27,43,0.08)]">

        {/* Header */}
        <div className="border-b border-[#eadcc8] px-8 py-6">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gold-dark/70">Your order</p>
        </div>

        {/* Product identity */}
        <div className="border-b border-[#eadcc8] px-8 py-7">
          <div className="flex items-center gap-5">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[16px] bg-navy/5 shadow-[inset_0_2px_6px_rgba(11,27,43,0.06)]">
              <Wifi className="h-7 w-7 text-navy/55" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[17px] font-bold leading-snug text-navy">{productTitle}</p>
              {productScore > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={cn('h-3 w-3', s <= Math.round(productScore) ? 'fill-gold text-gold' : 'fill-navy/15 text-navy/15')} />
                    ))}
                  </div>
                  <span className="text-[13px] font-bold text-navy">{productScore.toFixed(1)}</span>
                  <span className="text-[12px] text-navy/40">({productReviews.toLocaleString()} reviews)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Package details */}
        <div className="border-b border-[#eadcc8] px-8 py-7">
          <p className="mb-4 text-[11px] font-black uppercase tracking-[0.16em] text-gold-dark/60">Package details</p>
          <div className="divide-y divide-[#eadcc8] rounded-[18px] border border-[#e4d8c2] bg-white">
            {[
              { label: 'Data coverage', value: packageData },
              { label: 'Valid duration', value: packageValidity },
              { label: 'Network', value: productOperator },
              { label: 'Plan type', value: planType },
            ].filter(r => r.value).map(({ label, value }) => (
              <div key={label} className="grid grid-cols-[1fr_auto] gap-x-4 px-6 py-6">
                <span className="text-[13px] text-navy/50">{label}</span>
                <span className="max-w-[200px] text-right text-[13px] font-semibold leading-relaxed text-navy">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order details */}
        <div className="border-b border-[#eadcc8] px-8 py-7">
          <p className="mb-4 text-[11px] font-black uppercase tracking-[0.16em] text-gold-dark/60">Order details</p>
          <div className="divide-y divide-[#eadcc8] rounded-[18px] border border-[#e4d8c2] bg-white">
            {[
              { label: 'Delivery method', value: 'Email — eSIM QR code' },
              { label: 'Unit price', value: `US$${price.toFixed(2)}` },
              { label: 'Quantity', value: `eSIM × ${quantity}` },
            ].map(({ label, value }) => (
              <div key={label} className="grid grid-cols-[1fr_auto] gap-x-4 px-6 py-6">
                <span className="text-[13px] text-navy/50">{label}</span>
                <span className="text-[13px] font-semibold text-navy">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="border-b border-[#eadcc8] px-8 py-7">
          {quantity > 1 && (
            <div className="mb-3 flex justify-between text-[13px] text-navy/50">
              <span>US${price.toFixed(2)} × {quantity} eSIM</span>
              <span>US${total}</span>
            </div>
          )}
          <div className="flex items-baseline justify-between">
            <span className="text-[15px] font-black uppercase tracking-[0.08em] text-navy/60">Total</span>
            <span className="font-serif text-[38px] font-bold text-navy leading-none">US${total}</span>
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-navy/40">
            No payment required now — payment instructions will be sent by email after confirmation.
          </p>
        </div>

        {/* Trust badges */}
        <div className="px-8 py-6">
          {[
            { icon: <Check className="h-4 w-4 shrink-0 text-gold-dark" strokeWidth={2.5} />, text: 'QR code sent within 15 minutes' },
            { icon: <Check className="h-4 w-4 shrink-0 text-gold-dark" strokeWidth={2.5} />, text: 'Softbank 5G / DOCOMO 4G LTE' },
            { icon: <Check className="h-4 w-4 shrink-0 text-gold-dark" strokeWidth={2.5} />, text: 'No payment needed to request' },
          ].map(({ icon, text }, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              {icon}
              <span className="text-[13px] text-navy/65">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <Link
        href={`/sim-card/${productSlug}`}
        className="mt-5 flex items-center gap-1.5 text-[13px] font-medium text-navy/45 transition hover:text-navy/70"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to product
      </Link>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PHASE BAR
══════════════════════════════════════════════════════════════ */

function PhaseBar({ stage }: { stage: number }) {
  return (
    <div className="mb-14">
      <div className="grid gap-4 min-[520px]:grid-cols-3 min-[520px]:gap-8">
        {PHASES.map((phase, index) => {
          const done = index < stage;
          const active = index === stage;
          return (
            <button
              key={phase.title}
              type="button"
              onClick={() => { /* noop — not interactive, just visual */ }}
              className={cn(
                'flex items-center gap-10 rounded-2xl border-2 bg-[#fffefb] px-10 py-8 text-left transition duration-300',
                done ? 'cursor-pointer border-gold/40 hover:border-gold/70' : active ? 'border-gold/50 shadow-[0_8px_24px_rgba(200,169,106,0.12)]' : 'border-navy/8 cursor-default'
              )}
            >
              <span
                className={cn(
                  'grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 text-[15px] font-black aspect-square transition duration-300',
                  done || active
                    ? 'border-gold bg-gold text-navy shadow-[0_12px_28px_rgba(200,169,106,0.24)]'
                    : 'border-[#dfd2bb] bg-pearl text-navy/36'
                )}
              >
                {done ? <Check className="h-5 w-5" /> : index + 1}
              </span>
              <div className="min-w-0">
                <p className={cn('text-[14px] font-black uppercase tracking-[0.1em]', done || active ? 'text-navy' : 'text-navy/40')}>
                  {phase.title}
                </p>
                <p className={cn('mt-1.5 text-[13px]', done || active ? 'text-navy/50' : 'text-navy/30')}>{phase.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Progress bar — animated like visa form */}
      <div className="mt-10 mb-4 h-[5px] rounded-full bg-[#eadfcf]">
        <motion.div
          className="h-full rounded-full bg-gold"
          animate={{ width: `${((stage) / 3) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════════ */

function FormSection({ title, icon, children }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[32px] border-2 border-[#e4d8c2] bg-[linear-gradient(180deg,#fffdf8_0%,#faf5ec_100%)] shadow-[0_16px_48px_rgba(11,27,43,0.06)]">
      <div className="flex items-center gap-4 border-b-2 border-[#eadcc8]/80 px-8 py-7 md:px-10">
        <span className="text-gold-dark">{icon}</span>
        <h3 className="font-serif text-[20px] font-semibold text-gold-dark">{title}</h3>
      </div>
      <div className="p-8 md:p-10">{children}</div>
    </section>
  );
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="space-y-0">{children}</div>;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-3 block text-[15px] font-semibold text-navy">{children}</label>
  );
}

function Req() {
  return <span className="text-red-500">*</span>;
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 flex items-center gap-1.5 text-[12px] text-red-500">
      <AlertCircle className="h-3.5 w-3.5" />
      {children}
    </p>
  );
}

function TableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-5 py-4 text-[13px] font-bold text-pearl', className)}>{children}</div>
  );
}

function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('border-b border-[#f0e8da] px-5 py-4 text-[14px] text-navy', className)}>
      {children}
    </div>
  );
}