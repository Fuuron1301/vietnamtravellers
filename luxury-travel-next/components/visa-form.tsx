'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useMemo, useState } from 'react';
import { ArrowRight, ArrowLeft, Check, FileText, Globe2, Plane, Car, CreditCard, Shield, Users, Clock, AlertCircle, Mail, Phone, MessageSquare, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/tracking';

/* ═══════════════════════════════════════════════════════════════
   DATA — 1:1 đồng bộ từ Visa2Asia (visa2asia.com/order)
═══════════════════════════════════════════════════════════════ */

const VISA_QUANTITIES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const VISA_TYPES = [
  { id: '1-month-single', label: '1 Month Single Entry' },
];

const PURPOSES = [
  { id: 'tourist', label: 'For tourist' },
];

const AIRPORTS = [
  { id: 'sgn', label: 'Tan Son Nhat International Airport (Ho Chi Minh City)' },
  { id: 'han', label: 'Noi Bai International Airport (Ha Noi)' },
  { id: 'dad', label: 'Da Nang International Airport' },
  { id: 'cxr', label: 'Cam Ranh International Airport (Khanh Hoa)' },
  { id: 'hph', label: 'Cat Bi International Airport (Hai Phong)' },
  { id: 'hue', label: 'Phu Bai International Airport (Hue)' },
  { id: 'vca', label: 'Can Tho Internation Airport (Can Tho)' },
  { id: 'pqc', label: 'Phu Quoc International Airport (Kien Giang)' },
];

const PROCESSING_OPTIONS = [
  { id: 'normal', label: 'e-Visa Service Normal', time: '3-5 business days', price: 50 },
  { id: 'urgent', label: 'e-Visa Service Urgent', time: '8 business hours', price: 139 },
];

/* ─── CAR PICKUP PRICING (per airport + seat type, USD) ─── */
const CAR_PICKUP_PRICES: Record<string, Record<string, number>> = {
  sgn: { '4': 45, '7': 50, '16': 72 },
  han: { '4': 38, '7': 45, '16': 52 },
  dad: { '4': 38, '7': 40, '16': 52 },
  cxr: { '4': 42, '7': 45, '16': 70 },
  hph: { '4': 50, '7': 65, '16': 86 },
  hue: { '4': 33, '7': 40, '16': 50 },
  vca: { '4': 40, '7': 50, '16': 68 },
  pqc: { '4': 65, '7': 65, '16': 76 },
};

/* ─── ADDON SERVICES PRICING (USD) ─── */
const ADDON_PRICES = {
  fastTrack: 20,
  babySeat: 15,
  englishDriver: 20,
  nightTrip: 20, // 10 PM - 5 AM
};

const CAR_SEATS = [
  { id: '4', label: '4 seats', babyMax: 2 },
  { id: '7', label: '7 seats', babyMax: 5 },
  { id: '16', label: '16 seats', babyMax: 14 },
];

const NATIONALITIES = [
  'Andorra', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Belarus', 'Belgium', 'Bosnia & Herzegovina', 'Brazil', 'Brunei', 'Bulgaria',
  'Canada', 'Chile', 'China', 'Colombia', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Denmark', 'Estonia', 'Fiji', 'Finland', 'France',
  'Georgia', 'Germany', 'Greece', 'Hungary', 'Iceland',
  'India', 'Ireland', 'Italy', 'Japan', 'Kazakhstan',
  'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macedonia',
  'Malta', 'Marshall Islands', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro',
  'Myanmar (Burma)', 'Nauru', 'Netherlands', 'New Zealand', 'Norway',
  'Palau', 'Panama', 'Papua New Guinea', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar', 'Romania', 'Russia', 'Samoa', 'San Marino', 'Serbia',
  'Slovakia', 'Slovenia', 'Solomon Islands', 'South Korea', 'Spain',
  'Sweden', 'Switzerland', 'Timor-Leste',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Vanuatu', 'Venezuela'
];

const COUNTRY_CODES = [
  { code: '+1', country: 'US' }, { code: '+1', country: 'CA' },
  { code: '+7', country: 'RU' }, { code: '+7', country: 'KZ' },
  { code: '+30', country: 'GR' }, { code: '+31', country: 'NL' },
  { code: '+32', country: 'BE' }, { code: '+33', country: 'FR' },
  { code: '+34', country: 'ES' }, { code: '+36', country: 'HU' },
  { code: '+39', country: 'IT' }, { code: '+40', country: 'RO' },
  { code: '+41', country: 'CH' }, { code: '+43', country: 'AT' },
  { code: '+44', country: 'GB' }, { code: '+45', country: 'DK' },
  { code: '+46', country: 'SE' }, { code: '+47', country: 'NO' },
  { code: '+48', country: 'PL' }, { code: '+49', country: 'DE' },
  { code: '+51', country: 'PE' }, { code: '+52', country: 'MX' },
  { code: '+53', country: 'CU' }, { code: '+54', country: 'AR' },
  { code: '+55', country: 'BR' }, { code: '+56', country: 'CL' },
  { code: '+57', country: 'CO' }, { code: '+61', country: 'AU' },
  { code: '+63', country: 'PH' }, { code: '+64', country: 'NZ' },
  { code: '+81', country: 'JP' }, { code: '+82', country: 'KR' },
  { code: '+86', country: 'CN' }, { code: '+91', country: 'IN' },
  { code: '+95', country: 'MM' }, { code: '+351', country: 'PT' },
  { code: '+352', country: 'LU' }, { code: '+353', country: 'IE' },
  { code: '+354', country: 'IS' }, { code: '+356', country: 'MT' },
  { code: '+357', country: 'CY' }, { code: '+358', country: 'FI' },
  { code: '+359', country: 'BG' }, { code: '+370', country: 'LT' },
  { code: '+371', country: 'LV' }, { code: '+372', country: 'EE' },
  { code: '+373', country: 'MD' }, { code: '+374', country: 'AM' },
  { code: '+375', country: 'BY' }, { code: '+376', country: 'AD' },
  { code: '+377', country: 'MC' }, { code: '+378', country: 'SM' },
  { code: '+381', country: 'RS' }, { code: '+382', country: 'ME' },
  { code: '+385', country: 'HR' }, { code: '+386', country: 'SI' },
  { code: '+387', country: 'BA' }, { code: '+389', country: 'MK' },
  { code: '+420', country: 'CZ' }, { code: '+421', country: 'SK' },
  { code: '+423', country: 'LI' }, { code: '+507', country: 'PA' },
  { code: '+598', country: 'UY' }, { code: '+670', country: 'TL' },
  { code: '+673', country: 'BN' }, { code: '+674', country: 'NR' },
  { code: '+675', country: 'PG' }, { code: '+677', country: 'SB' },
  { code: '+678', country: 'VU' }, { code: '+679', country: 'FJ' },
  { code: '+680', country: 'PW' }, { code: '+685', country: 'WS' },
  { code: '+691', country: 'FM' }, { code: '+692', country: 'MH' },
  { code: '+971', country: 'AE' }, { code: '+974', country: 'QA' },
  { code: '+976', country: 'MN' }, { code: '+994', country: 'AZ' },
  { code: '+995', country: 'GE' },
];

const TITLE_NAMES = ['Mr.', 'Ms.', 'Mrs.'];

/* ─── PHASES ────────────────────────────────────────────────── */

const PHASES = [
  { title: 'Visa Options', subtitle: 'Choose type & processing' },
  { title: 'Applicant Details', subtitle: 'Passport & contact info' },
  { title: 'Review & Pay', subtitle: 'Verify and submit' },
];

/* ─── FORM STATE ────────────────────────────────────────────── */

type ApplicantInfo = {
  fullName: string;
  gender: string;
  birthDate: string;
  nationality: string;
  passportNumber: string;
};

type ContactInfo = {
  fullName: string;
  title: string;
  email: string;
  countryCode: string;
  phone: string;
  message: string;
};

type VisaFormData = {
  // Step 1
  numberOfVisa: number;
  visaType: string;
  purpose: string;
  entryDate: string;
  exitDate: string;
  arrivalAirport: string;
  processingTime: string;
  carPickup: boolean;
  carSeats: string;
  fastTrack: boolean;
  babySeat: boolean;
  englishDriver: boolean;
  nightTrip: boolean;
  pickupTime: string;
  // Step 2
  applicants: ApplicantInfo[];
  contact: ContactInfo;
};

const defaultApplicant: ApplicantInfo = {
  fullName: '',
  gender: '',
  birthDate: '',
  nationality: '',
  passportNumber: '',
};

const initialForm: VisaFormData = {
  numberOfVisa: 1,
  visaType: '1-month-single',
  purpose: 'tourist',
  entryDate: '',
  exitDate: '',
  arrivalAirport: 'sgn',
  processingTime: 'normal',
  carPickup: false,
  carSeats: '4',
  fastTrack: false,
  babySeat: false,
  englishDriver: false,
  nightTrip: false,
  pickupTime: '',
  applicants: [{ ...defaultApplicant }],
  contact: {
    fullName: '',
    title: 'Mr.',
    email: '',
    countryCode: '+1',
    phone: '',
    message: '',
  },
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */

export function VisaApplicationForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<VisaFormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = useCallback(<K extends keyof VisaFormData>(field: K, value: VisaFormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  }, []);

  const updateApplicant = useCallback((index: number, field: keyof ApplicantInfo, value: string) => {
    setForm((prev) => {
      const applicants = [...prev.applicants];
      applicants[index] = { ...applicants[index], [field]: value };
      return { ...prev, applicants };
    });
  }, []);

  const updateContact = useCallback((field: keyof ContactInfo, value: string) => {
    setForm((prev) => ({ ...prev, contact: { ...prev.contact, [field]: value } }));
  }, []);

  const setNumberOfVisa = useCallback((count: number) => {
    setForm((prev) => {
      const applicants = [...prev.applicants];
      while (applicants.length < count) applicants.push({ ...defaultApplicant });
      return { ...prev, numberOfVisa: count, applicants: applicants.slice(0, count) };
    });
  }, []);

  const selectedProcessing = PROCESSING_OPTIONS.find((p) => p.id === form.processingTime)!;
  const visaFee = selectedProcessing.price * form.numberOfVisa;
  // Car pickup price depends on airport + car seats
  const carPickupBase = form.carPickup
    ? (CAR_PICKUP_PRICES[form.arrivalAirport]?.[form.carSeats] ?? 0)
    : 0;
  // Addon services
  const addonFee =
    (form.fastTrack ? ADDON_PRICES.fastTrack : 0) +
    (form.babySeat ? ADDON_PRICES.babySeat : 0) +
    (form.englishDriver ? ADDON_PRICES.englishDriver : 0) +
    (form.nightTrip ? ADDON_PRICES.nightTrip : 0);
  const extraFee = carPickupBase + (form.carPickup ? addonFee : 0);
  const totalFee = visaFee + extraFee;

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};
    if (s === 0) {
      if (!form.entryDate) errs.entryDate = 'Entry date is required';
      if (!form.exitDate) errs.exitDate = 'Exit date is required';
    }
    if (s === 1) {
      form.applicants.forEach((app, i) => {
        if (!app.fullName) errs[`applicant-${i}-name`] = 'Required';
        if (!app.gender) errs[`applicant-${i}-gender`] = 'Required';
        if (!app.birthDate) errs[`applicant-${i}-birth`] = 'Required';
        if (!app.nationality) errs[`applicant-${i}-nationality`] = 'Required';
        if (!app.passportNumber) errs[`applicant-${i}-passport`] = 'Required';
      });
      if (!form.contact.fullName) errs['contact-name'] = 'Required';
      if (!form.contact.email) errs['contact-email'] = 'Required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 2));
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = { ...form, visaFee, extraFee, totalFee };
      const res = await fetch('/api/visa-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Submission failed');
      trackEvent('visa_application_submit', { visa_type: form.visaType, processing: form.processingTime });
      setSubmitted(true);
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again or contact us directly.' });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Success ── */
  if (submitted) {
    return (
      <div className="rounded-[40px] border border-[#e4d8c2] bg-[linear-gradient(180deg,#fffdf8,#faf5ec)] p-10 text-center shadow-[0_30px_92px_rgba(11,27,43,0.13)] md:p-16">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-8 grid h-24 w-24 place-items-center rounded-full bg-gold text-navy shadow-[0_16px_40px_rgba(200,169,106,0.3)]"
        >
          <Check className="h-10 w-10" strokeWidth={2.5} />
        </motion.div>
        <h2 className="font-serif text-[clamp(28px,3.4vw,42px)] font-bold text-navy">Application Submitted!</h2>
        <p className="mx-auto mt-5 max-w-[520px] text-[16px] leading-relaxed text-navy/60">
          Your visa application has been received. We will process it and send your approval letter to <strong className="text-navy">{form.contact.email}</strong> within {selectedProcessing.time}.
        </p>
        <div className="mx-auto mt-10 max-w-[400px] rounded-[24px] border border-gold/30 bg-gold/5 p-7">
          <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-gold-dark">Estimated delivery</p>
          <p className="mt-2 text-[22px] font-bold text-navy">{selectedProcessing.time}</p>
        </div>
      </div>
    );
  }

  /* ── Main Form ── */
  return (
    <div className="rounded-[40px] border border-[#e4d8c2] bg-[linear-gradient(180deg,#fffdf8,#faf5ec)] p-6 shadow-[0_30px_92px_rgba(11,27,43,0.13)] md:p-10 lg:p-14">
      {/* ── Phase Indicators ── */}
      <div className="mb-14">
        <div className="grid gap-4 min-[520px]:grid-cols-3 min-[520px]:gap-8">
          {PHASES.map((phase, index) => {
            const done = index < step;
            const active = index === step;
            return (
              <button
                key={phase.title}
                type="button"
                onClick={() => { if (done) setStep(index); }}
                className={cn(
                  'flex items-center gap-10 rounded-2xl border-2 bg-[#fffefb] px-10 py-8 text-left transition duration-300',
                  done ? 'cursor-pointer border-gold/40 hover:border-gold/70' : active ? 'border-gold/50 shadow-[0_8px_24px_rgba(200,169,106,0.12)]' : 'border-navy/8 cursor-default'
                )}
              >
                <span
                  className={cn(
                    'grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 text-[15px] font-black transition duration-300 aspect-square',
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

        {/* Progress bar */}
        <div className="mt-10 mb-4 h-[5px] rounded-full bg-[#eadfcf]">
          <motion.div
            className="h-full rounded-full bg-gold"
            animate={{ width: `${((step + 1) / 3) * 100}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      {/* ── Step Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {step === 0 && <StepVisaOptions form={form} updateField={updateField} setNumberOfVisa={setNumberOfVisa} errors={errors} />}
          {step === 1 && <StepApplicantDetails form={form} updateApplicant={updateApplicant} updateContact={updateContact} errors={errors} />}
          {step === 2 && <StepReview form={form} selectedProcessing={selectedProcessing} visaFee={visaFee} extraFee={extraFee} totalFee={totalFee} goToStep={setStep} />}
        </motion.div>
      </AnimatePresence>

      {/* ── Navigation ── */}
      <div className="mt-12 flex items-center justify-between border-t border-[#eadcc8] pt-8">
        {step > 0 ? (
          <button
            type="button"
            onClick={prevStep}
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
          onClick={step < 2 ? nextStep : handleSubmit}
          disabled={submitting}
          className={cn(
            'flex items-center gap-3 rounded-full px-10 py-4.5 text-[13px] font-black uppercase tracking-[0.16em] shadow-[0_16px_40px_rgba(11,27,43,0.22)] transition',
            step < 2
              ? 'bg-navy text-pearl hover:bg-gold hover:text-navy'
              : 'bg-gold text-navy hover:bg-navy hover:text-pearl',
            submitting && 'opacity-60 cursor-not-allowed'
          )}
        >
          {submitting ? 'Processing...' : step < 2 ? 'Continue' : 'Checkout'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 1 — VISA OPTIONS
═══════════════════════════════════════════════════════════════ */

function StepVisaOptions({ form, updateField, setNumberOfVisa, errors }: {
  form: VisaFormData;
  updateField: <K extends keyof VisaFormData>(field: K, value: VisaFormData[K]) => void;
  setNumberOfVisa: (count: number) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_420px] lg:items-start">
      {/* Main Fields */}
      <div className="space-y-10">
        {/* Number of visa */}
        <FieldGroup>
          <FieldLabel>Number of visa <Req /></FieldLabel>
          <select
            value={form.numberOfVisa}
            onChange={(e) => setNumberOfVisa(Number(e.target.value))}
            className={fieldBase}
          >
            {VISA_QUANTITIES.map((n) => (
              <option key={n} value={n}>{n} person{n > 1 ? 's' : ''}</option>
            ))}
          </select>
        </FieldGroup>

        {/* Type of visa */}
        <FieldGroup>
          <FieldLabel>Type of visa <Req /></FieldLabel>
          <select
            value={form.visaType}
            onChange={(e) => updateField('visaType', e.target.value)}
            className={fieldBase}
          >
            {VISA_TYPES.map((v) => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </select>
        </FieldGroup>

        {/* Purpose of entry */}
        <FieldGroup>
          <FieldLabel>Purpose of entry <Req /></FieldLabel>
          <select
            value={form.purpose}
            onChange={(e) => updateField('purpose', e.target.value)}
            className={fieldBase}
          >
            {PURPOSES.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </FieldGroup>

        {/* Entry & Exit Date */}
        <div className="grid gap-8 md:grid-cols-2">
          <FieldGroup>
            <FieldLabel>Entry date <Req /></FieldLabel>
            <input
              type="date"
              value={form.entryDate}
              onChange={(e) => updateField('entryDate', e.target.value)}
              className={cn(fieldBase, errors.entryDate && 'border-red-400')}
            />
            {errors.entryDate && <FieldError>{errors.entryDate}</FieldError>}
          </FieldGroup>
          <FieldGroup>
            <FieldLabel>Exit date <Req /></FieldLabel>
            <input
              type="date"
              value={form.exitDate}
              onChange={(e) => updateField('exitDate', e.target.value)}
              className={cn(fieldBase, errors.exitDate && 'border-red-400')}
            />
            {errors.exitDate && <FieldError>{errors.exitDate}</FieldError>}
          </FieldGroup>
        </div>

        {/* Arrival Airport */}
        <FieldGroup>
          <FieldLabel>Arrival airport <Req /></FieldLabel>
          <select
            value={form.arrivalAirport}
            onChange={(e) => updateField('arrivalAirport', e.target.value)}
            className={fieldBase}
          >
            {AIRPORTS.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        </FieldGroup>

        {/* Processing Time */}
        <FieldGroup>
          <FieldLabel>Processing Time <Req /></FieldLabel>
          <div className="space-y-4">
            {PROCESSING_OPTIONS.map((option) => (
              <label
                key={option.id}
                className={cn(
                  'group flex cursor-pointer items-center gap-4 rounded-[16px] border-2 px-6 py-4 transition-all duration-300',
                  form.processingTime === option.id
                    ? 'border-gold bg-gold/5 shadow-[0_4px_16px_rgba(200,169,106,0.15)]'
                    : 'border-[#e4d8c2] bg-white hover:border-gold/60 hover:bg-gold/[0.02] hover:shadow-[0_2px_8px_rgba(200,169,106,0.08)]'
                )}
                onClick={() => updateField('processingTime', option.id)}
              >
                <input
                  type="radio"
                  name="processingTime"
                  checked={form.processingTime === option.id}
                  onChange={() => updateField('processingTime', option.id)}
                  className="h-[22px] w-[22px] shrink-0 cursor-pointer appearance-none rounded-md border-2 border-[#bbb] bg-white bg-[length:14px_14px] bg-center bg-no-repeat shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] transition-all duration-200 checked:border-gold checked:bg-gold checked:bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22white%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M12.207%204.793a1%201%200%20010%201.414l-5%205a1%201%200%2001-1.414%200l-2-2a1%201%200%20011.414-1.414L6.5%209.086l4.293-4.293a1%201%200%20011.414%200z%22%2F%3E%3C%2Fsvg%3E')] checked:shadow-[0_0_0_2px_rgba(200,169,106,0.2)] hover:border-gold/70 hover:shadow-[0_0_0_3px_rgba(200,169,106,0.1)]"
                />
                <span className={cn(
                  'text-[15px] transition-colors duration-200',
                  form.processingTime === option.id ? 'font-medium text-navy' : 'text-navy/80 group-hover:text-navy'
                )}>
                  {option.label} <span className={cn(
                    'transition-colors duration-200',
                    form.processingTime === option.id ? 'text-navy/50' : 'text-navy/40 group-hover:text-navy/50'
                  )}>({option.time})</span>
                </span>
              </label>
            ))}
          </div>
        </FieldGroup>
      </div>

      {/* Upon Arrival Services — Sidebar */}
      <div className="lg:sticky lg:top-[120px]">
        <div className="rounded-[28px] border-2 border-[#e4d8c2] bg-[linear-gradient(180deg,#fffdf8_0%,#f6eddf_100%)] p-10 shadow-[0_16px_48px_rgba(11,27,43,0.07)]">
          <div className="flex items-center gap-3 border-b border-[#eadcc8] pb-6 mb-8">
            <Car className="h-5 w-5 text-gold-dark" />
            <h4 className="font-serif text-[20px] font-semibold text-navy">Upon arrival services</h4>
          </div>

          {/* Airport car pick-up checkbox */}
          <label className={cn(
            'flex cursor-pointer items-start gap-4 rounded-[16px] border-2 p-6 transition duration-200',
            form.carPickup
              ? 'border-gold bg-gold/5'
              : 'border-[#e4d8c2] bg-white hover:border-gold/50'
          )}>
            <input
              type="checkbox"
              checked={form.carPickup}
              onChange={(e) => updateField('carPickup', e.target.checked)}
              className="mt-0.5 h-[22px] w-[22px] shrink-0 cursor-pointer appearance-none rounded-md border-2 border-[#bbb] bg-white bg-[length:14px_14px] bg-center bg-no-repeat shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] transition-all duration-200 checked:border-gold checked:bg-gold checked:bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22white%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M12.207%204.793a1%201%200%20010%201.414l-5%205a1%201%200%2001-1.414%200l-2-2a1%201%200%20011.414-1.414L6.5%209.086l4.293-4.293a1%201%200%20011.414%200z%22%2F%3E%3C%2Fsvg%3E')] checked:shadow-[0_0_0_2px_rgba(200,169,106,0.2)] hover:border-gold/70 hover:shadow-[0_0_0_3px_rgba(200,169,106,0.1)]"
            />
            <div>
              <p className="text-[16px] font-bold text-navy">Airport car pick-up</p>
              <p className="mt-2 text-[13px] leading-relaxed text-navy/55">
                Our driver will wait outside to pick you up to your hotel or a predetermined place.
              </p>
              <p className="mt-2 text-[14px] font-semibold text-gold-dark">
                From ${Math.min(...Object.values(CAR_PICKUP_PRICES[form.arrivalAirport] ?? CAR_PICKUP_PRICES.sgn))} USD
              </p>
            </div>
          </label>

          {/* Expanded car options */}
          {form.carPickup && (
            <div className="mt-6 divide-y divide-[#eadcc8] rounded-[16px] border-2 border-blue-200 bg-white px-2">
              {/* Car Seats */}
              <div className="flex items-center justify-between px-7 py-6">
                <span className="text-[15px] font-semibold text-navy">Car Seats</span>
                <select
                  value={form.carSeats}
                  onChange={(e) => updateField('carSeats', e.target.value)}
                  className="rounded-[10px] border-2 border-[#e4d8c2] bg-white px-5 py-3 text-[14px] text-navy transition focus:border-gold focus:outline-none"
                >
                  {CAR_SEATS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>

              {/* Fast track */}
              <label className="flex cursor-pointer items-start gap-4 px-7 py-6">
                <input
                  type="checkbox"
                  checked={form.fastTrack}
                  onChange={(e) => updateField('fastTrack', e.target.checked)}
                  className="mt-0.5 h-[22px] w-[22px] shrink-0 cursor-pointer appearance-none rounded-md border-2 border-[#bbb] bg-white bg-[length:14px_14px] bg-center bg-no-repeat shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] transition-all duration-200 checked:border-gold checked:bg-gold checked:bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22white%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M12.207%204.793a1%201%200%20010%201.414l-5%205a1%201%200%2001-1.414%200l-2-2a1%201%200%20011.414-1.414L6.5%209.086l4.293-4.293a1%201%200%20011.414%200z%22%2F%3E%3C%2Fsvg%3E')] checked:shadow-[0_0_0_2px_rgba(200,169,106,0.2)] hover:border-gold/70 hover:shadow-[0_0_0_3px_rgba(200,169,106,0.1)]"
                />
                <div>
                  <p className="text-[15px] font-semibold text-navy">Fast track <span className="font-normal text-navy/50">($20)</span></p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-navy/50">Our staff will greet you at the arrival gate and make sure a smooth transition from the plane.</p>
                </div>
              </label>

              {/* Baby seat */}
              <label className="flex cursor-pointer items-center gap-4 px-7 py-6">
                <input
                  type="checkbox"
                  checked={form.babySeat}
                  onChange={(e) => updateField('babySeat', e.target.checked)}
                  className="h-[22px] w-[22px] shrink-0 cursor-pointer appearance-none rounded-md border-2 border-[#bbb] bg-white bg-[length:14px_14px] bg-center bg-no-repeat shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] transition-all duration-200 checked:border-gold checked:bg-gold checked:bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22white%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M12.207%204.793a1%201%200%20010%201.414l-5%205a1%201%200%2001-1.414%200l-2-2a1%201%200%20011.414-1.414L6.5%209.086l4.293-4.293a1%201%200%20011.414%200z%22%2F%3E%3C%2Fsvg%3E')] checked:shadow-[0_0_0_2px_rgba(200,169,106,0.2)] hover:border-gold/70 hover:shadow-[0_0_0_3px_rgba(200,169,106,0.1)]"
                />
                <p className="text-[15px] font-semibold text-navy">Baby seat <span className="font-normal text-navy/50">($15)</span></p>
              </label>

              {/* English speaking driver */}
              <label className="flex cursor-pointer items-center gap-4 px-7 py-6">
                <input
                  type="checkbox"
                  checked={form.englishDriver}
                  onChange={(e) => updateField('englishDriver', e.target.checked)}
                  className="h-[22px] w-[22px] shrink-0 cursor-pointer appearance-none rounded-md border-2 border-[#bbb] bg-white bg-[length:14px_14px] bg-center bg-no-repeat shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] transition-all duration-200 checked:border-gold checked:bg-gold checked:bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22white%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M12.207%204.793a1%201%200%20010%201.414l-5%205a1%201%200%2001-1.414%200l-2-2a1%201%200%20011.414-1.414L6.5%209.086l4.293-4.293a1%201%200%20011.414%200z%22%2F%3E%3C%2Fsvg%3E')] checked:shadow-[0_0_0_2px_rgba(200,169,106,0.2)] hover:border-gold/70 hover:shadow-[0_0_0_3px_rgba(200,169,106,0.1)]"
                />
                <p className="text-[15px] font-semibold text-navy">English speaking driver <span className="font-normal text-navy/50">($20)</span></p>
              </label>

              {/* Night trip surcharge */}
              <label className="flex cursor-pointer items-start gap-4 px-7 py-6">
                <input
                  type="checkbox"
                  checked={form.nightTrip}
                  onChange={(e) => updateField('nightTrip', e.target.checked)}
                  className="mt-0.5 h-[22px] w-[22px] shrink-0 cursor-pointer appearance-none rounded-md border-2 border-[#bbb] bg-white bg-[length:14px_14px] bg-center bg-no-repeat shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] transition-all duration-200 checked:border-gold checked:bg-gold checked:bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22white%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M12.207%204.793a1%201%200%20010%201.414l-5%205a1%201%200%2001-1.414%200l-2-2a1%201%200%20011.414-1.414L6.5%209.086l4.293-4.293a1%201%200%20011.414%200z%22%2F%3E%3C%2Fsvg%3E')] checked:shadow-[0_0_0_2px_rgba(200,169,106,0.2)] hover:border-gold/70 hover:shadow-[0_0_0_3px_rgba(200,169,106,0.1)]"
                />
                <div>
                  <p className="text-[15px] font-semibold text-navy">Night trip <span className="font-normal text-navy/50">($20)</span></p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-navy/50">Pick-up between 10 PM to 5 AM the following day.</p>
                </div>
              </label>

              {/* Pick-up time */}
              <div className="space-y-3 px-7 py-6">
                <span className="text-[15px] font-semibold text-navy">Pick-up time</span>
                <input
                  type="datetime-local"
                  value={form.pickupTime}
                  onChange={(e) => updateField('pickupTime', e.target.value)}
                  className="w-full rounded-[16px] border-2 border-[#e4d8c2] bg-white px-6 py-4 text-[15px] text-navy transition focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/10"
                />
                <p className="mt-1 text-[12px] leading-relaxed text-navy/50">
                  Please note that pick-up time between 10 PM to 5 AM the following day will be subject to an extra charge (20 USD).
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 2 — APPLICANT DETAILS
═══════════════════════════════════════════════════════════════ */

function StepApplicantDetails({ form, updateApplicant, updateContact, errors }: {
  form: VisaFormData;
  updateApplicant: (index: number, field: keyof ApplicantInfo, value: string) => void;
  updateContact: (field: keyof ContactInfo, value: string) => void;
  errors: Record<string, string>;
}) {
  const selectedProcessing = PROCESSING_OPTIONS.find((p) => p.id === form.processingTime)!;
  const visaFee = selectedProcessing.price * form.numberOfVisa;
  const carPickupBase = form.carPickup
    ? (CAR_PICKUP_PRICES[form.arrivalAirport]?.[form.carSeats] ?? 0)
    : 0;
  const addonFee =
    (form.fastTrack ? ADDON_PRICES.fastTrack : 0) +
    (form.babySeat ? ADDON_PRICES.babySeat : 0) +
    (form.englishDriver ? ADDON_PRICES.englishDriver : 0) +
    (form.nightTrip ? ADDON_PRICES.nightTrip : 0);
  const extraFee = carPickupBase + (form.carPickup ? addonFee : 0);
  const totalFee = visaFee + extraFee;

  return (
    <div className="space-y-12">
      {/* Passport Information */}
      <FormSection title="Passport Information" icon={<FileText className="h-5 w-5" />}>
        <div className="space-y-10">
          {form.applicants.map((applicant, index) => (
            <div key={index} className="relative">
              {form.numberOfVisa > 1 && (
                <div className="absolute -left-2 -top-2 grid h-8 w-8 place-items-center rounded-full bg-gold text-[12px] font-black text-navy shadow-[0_4px_12px_rgba(200,169,106,0.3)]">
                  {index + 1}
                </div>
              )}
              <div className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-5', form.numberOfVisa > 1 && 'pl-8')}>
                <div className="sm:col-span-2 lg:col-span-1">
                  <FieldLabel size="sm">Full Name <Req /></FieldLabel>
                  <input
                    type="text"
                    value={applicant.fullName}
                    onChange={(e) => updateApplicant(index, 'fullName', e.target.value)}
                    className={cn(fieldBase, errors[`applicant-${index}-name`] && 'border-red-400')}
                    placeholder="As in passport"
                  />
                </div>
                <div>
                  <FieldLabel size="sm">Gender <Req /></FieldLabel>
                  <select
                    value={applicant.gender}
                    onChange={(e) => updateApplicant(index, 'gender', e.target.value)}
                    className={cn(fieldBase, !applicant.gender && 'text-navy/40', errors[`applicant-${index}-gender`] && 'border-red-400')}
                  >
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <FieldLabel size="sm">Birth date <Req /></FieldLabel>
                  <input
                    type="date"
                    value={applicant.birthDate}
                    onChange={(e) => updateApplicant(index, 'birthDate', e.target.value)}
                    className={cn(fieldBase, errors[`applicant-${index}-birth`] && 'border-red-400')}
                  />
                </div>
                <div>
                  <FieldLabel size="sm">Nationality <Req /></FieldLabel>
                  <select
                    value={applicant.nationality}
                    onChange={(e) => updateApplicant(index, 'nationality', e.target.value)}
                    className={cn(fieldBase, !applicant.nationality && 'text-navy/40', errors[`applicant-${index}-nationality`] && 'border-red-400')}
                  >
                    <option value="">Select...</option>
                    {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <FieldLabel size="sm">Passport number <Req /></FieldLabel>
                  <input
                    type="text"
                    value={applicant.passportNumber}
                    onChange={(e) => updateApplicant(index, 'passportNumber', e.target.value)}
                    className={cn(fieldBase, errors[`applicant-${index}-passport`] && 'border-red-400')}
                    placeholder="e.g. B12345678"
                  />
                </div>
              </div>
              {index < form.numberOfVisa - 1 && (
                <div className="mt-8 border-b border-dashed border-[#e4d8c2]" />
              )}
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-10 rounded-[20px] bg-navy/[0.03] border border-navy/8 px-7 py-5">
          <p className="text-[13px] font-bold text-navy/70">Tips:</p>
          <ul className="mt-2 space-y-1.5 text-[13px] text-navy/55">
            <li>- Your declared information here must match exactly that of your passport.</li>
            <li>- Your passport must have at least 6 months to expiration when arriving in Vietnam.</li>
          </ul>
        </div>
      </FormSection>

      {/* Contact Information */}
      <FormSection title="Contact Information" icon={<Mail className="h-5 w-5" />}>
        <div className="space-y-8">
          {/* Full Name with title */}
          <FieldGroup>
            <FieldLabel>Full Name <Req /></FieldLabel>
            <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
              <select
                value={form.contact.title}
                onChange={(e) => updateContact('title', e.target.value)}
                className={fieldBase}
              >
                {TITLE_NAMES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input
                type="text"
                value={form.contact.fullName}
                onChange={(e) => updateContact('fullName', e.target.value)}
                className={cn(fieldBase, errors['contact-name'] && 'border-red-400')}
                placeholder="Your full name"
              />
            </div>
            {errors['contact-name'] && <FieldError>{errors['contact-name']}</FieldError>}
          </FieldGroup>

          {/* Email */}
          <FieldGroup>
            <FieldLabel>Your Email <Req /></FieldLabel>
            <input
              type="email"
              value={form.contact.email}
              onChange={(e) => updateContact('email', e.target.value)}
              className={cn(fieldBase, errors['contact-email'] && 'border-red-400')}
              placeholder="your@email.com"
            />
            {errors['contact-email'] && <FieldError>{errors['contact-email']}</FieldError>}
          </FieldGroup>

          {/* Phone */}
          <FieldGroup>
            <FieldLabel>Phone Number</FieldLabel>
            <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
              <select
                value={form.contact.countryCode}
                onChange={(e) => updateContact('countryCode', e.target.value)}
                className={fieldBase}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>{c.country} {c.code}</option>
                ))}
              </select>
              <input
                type="tel"
                value={form.contact.phone}
                onChange={(e) => updateContact('phone', e.target.value)}
                className={fieldBase}
                placeholder="Phone number"
              />
            </div>
          </FieldGroup>

          {/* Message */}
          <FieldGroup>
            <FieldLabel>Leave a message</FieldLabel>
            <textarea
              value={form.contact.message}
              onChange={(e) => updateContact('message', e.target.value)}
              rows={4}
              className={cn(fieldBase, 'resize-y min-h-[140px]')}
              placeholder="Any special requests or notes..."
            />
          </FieldGroup>
        </div>
      </FormSection>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 3 — REVIEW & PAY
═══════════════════════════════════════════════════════════════ */

function StepReview({ form, selectedProcessing, visaFee, extraFee, totalFee, goToStep }: {
  form: VisaFormData;
  selectedProcessing: typeof PROCESSING_OPTIONS[number];
  visaFee: number;
  extraFee: number;
  totalFee: number;
  goToStep: (step: number) => void;
}) {
  const visaType = VISA_TYPES.find((v) => v.id === form.visaType)!;
  const purpose = PURPOSES.find((p) => p.id === form.purpose)!;
  const airport = AIRPORTS.find((a) => a.id === form.arrivalAirport)!;

  return (
    <div className="space-y-12">
      <p className="text-[16px] text-navy/70">Please review your visa application details!</p>

      {/* Visa Details Table */}
      <div>
        <div className="overflow-hidden rounded-[20px] border border-[#e4d8c2]">
          <div className="grid grid-cols-5 bg-navy text-center">
            <TableHead>Type of visa</TableHead>
            <TableHead>Purpose of entry</TableHead>
            <TableHead>Entry date</TableHead>
            <TableHead>Exit date</TableHead>
            <TableHead>Arrival airport</TableHead>
          </div>
          <div className="grid grid-cols-5 text-center bg-white">
            <TableCell>{visaType.label}</TableCell>
            <TableCell>{purpose.label}</TableCell>
            <TableCell>{form.entryDate}</TableCell>
            <TableCell>{form.exitDate}</TableCell>
            <TableCell>{airport.label}</TableCell>
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div>
        <div className="mb-4 flex items-center gap-4">
          <h3 className="text-[16px] font-semibold text-navy">Contact details</h3>
          <button type="button" onClick={() => goToStep(1)} className="flex items-center gap-1.5 rounded-full bg-gold px-4 py-1.5 text-[12px] font-bold text-navy transition hover:bg-gold/80">
            <Edit3 className="h-3 w-3" /> Edit
          </button>
        </div>
        <div className="overflow-hidden rounded-[20px] border border-[#e4d8c2]">
          <div className="grid grid-cols-4 bg-navy text-center">
            <TableHead>Fullname</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Message</TableHead>
          </div>
          <div className="grid grid-cols-4 text-center bg-white">
            <TableCell>{form.contact.title} {form.contact.fullName}</TableCell>
            <TableCell>{form.contact.email}</TableCell>
            <TableCell>{form.contact.countryCode} {form.contact.phone}</TableCell>
            <TableCell>{form.contact.message || '—'}</TableCell>
          </div>
        </div>
      </div>

      {/* Passport Details */}
      <div>
        <div className="mb-4 flex items-center gap-4">
          <h3 className="text-[16px] font-semibold text-navy">Passport details</h3>
          <button type="button" onClick={() => goToStep(1)} className="flex items-center gap-1.5 rounded-full bg-gold px-4 py-1.5 text-[12px] font-bold text-navy transition hover:bg-gold/80">
            <Edit3 className="h-3 w-3" /> Edit
          </button>
        </div>
        <div className="overflow-hidden rounded-[20px] border border-[#e4d8c2]">
          <div className="grid grid-cols-6 bg-navy text-center">
            <TableHead>No.</TableHead>
            <TableHead>Fullname</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Date of birth</TableHead>
            <TableHead>Nationality</TableHead>
            <TableHead>Passport number</TableHead>
          </div>
          {form.applicants.map((app, i) => (
            <div key={i} className={cn('grid grid-cols-6 text-center', i % 2 === 0 ? 'bg-white' : 'bg-pearl/50')}>
              <TableCell>{i + 1}</TableCell>
              <TableCell>{app.fullName}</TableCell>
              <TableCell>{app.gender}</TableCell>
              <TableCell>{app.birthDate}</TableCell>
              <TableCell>{app.nationality}</TableCell>
              <TableCell>{app.passportNumber}</TableCell>
            </div>
          ))}
        </div>
      </div>

      {/* Visa Service Fee */}
      <div>
        <h3 className="mb-4 text-[16px] font-semibold text-navy">Visa service fee</h3>
        <div className="overflow-hidden rounded-[20px] border border-[#e4d8c2]">
          <div className="grid grid-cols-5 bg-navy text-center">
            <TableHead>No.</TableHead>
            <TableHead className="col-span-2">Type of service</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit price</TableHead>
            <TableHead>Total fee</TableHead>
          </div>
          <div className="grid grid-cols-5 text-center bg-white">
            <TableCell>1</TableCell>
            <TableCell className="col-span-2">{selectedProcessing.label} ({selectedProcessing.time})</TableCell>
            <TableCell>{form.numberOfVisa}</TableCell>
            <TableCell>${selectedProcessing.price} USD</TableCell>
            <TableCell className="font-bold">${visaFee} USD</TableCell>
          </div>
          <div className="grid grid-cols-5 text-center bg-pearl/30 border-t border-[#e4d8c2]">
            <div className="col-span-4 px-6 py-4 text-right text-[14px] font-semibold text-navy">Sub-total</div>
            <div className="px-6 py-4 text-[15px] font-bold text-navy">${visaFee} USD</div>
          </div>
        </div>
      </div>

      {/* Extra Service Fee */}
      <div>
        <h3 className="mb-4 text-[16px] font-semibold text-navy">Extra service fee</h3>
        <div className="overflow-hidden rounded-[20px] border border-[#e4d8c2]">
          <div className="grid grid-cols-5 bg-navy text-center">
            <TableHead>No.</TableHead>
            <TableHead className="col-span-2">Type of service</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit price</TableHead>
            <TableHead>Total fee</TableHead>
          </div>
          {form.carPickup && (() => {
            const carPrice = CAR_PICKUP_PRICES[form.arrivalAirport]?.[form.carSeats] ?? 0;
            let rowNum = 0;
            return (
              <>
                <div className="grid grid-cols-5 text-center bg-white">
                  <TableCell>{++rowNum}</TableCell>
                  <TableCell className="col-span-2">Airport car pick-up ({form.carSeats} seats)</TableCell>
                  <TableCell>1</TableCell>
                  <TableCell>${carPrice} USD</TableCell>
                  <TableCell className="font-bold">${carPrice} USD</TableCell>
                </div>
                {form.fastTrack && (
                  <div className="grid grid-cols-5 text-center bg-white border-t border-[#e4d8c2]/50">
                    <TableCell>{++rowNum}</TableCell>
                    <TableCell className="col-span-2">Fast track</TableCell>
                    <TableCell>1</TableCell>
                    <TableCell>${ADDON_PRICES.fastTrack} USD</TableCell>
                    <TableCell className="font-bold">${ADDON_PRICES.fastTrack} USD</TableCell>
                  </div>
                )}
                {form.babySeat && (
                  <div className="grid grid-cols-5 text-center bg-white border-t border-[#e4d8c2]/50">
                    <TableCell>{++rowNum}</TableCell>
                    <TableCell className="col-span-2">Baby seat</TableCell>
                    <TableCell>1</TableCell>
                    <TableCell>${ADDON_PRICES.babySeat} USD</TableCell>
                    <TableCell className="font-bold">${ADDON_PRICES.babySeat} USD</TableCell>
                  </div>
                )}
                {form.englishDriver && (
                  <div className="grid grid-cols-5 text-center bg-white border-t border-[#e4d8c2]/50">
                    <TableCell>{++rowNum}</TableCell>
                    <TableCell className="col-span-2">English speaking driver</TableCell>
                    <TableCell>1</TableCell>
                    <TableCell>${ADDON_PRICES.englishDriver} USD</TableCell>
                    <TableCell className="font-bold">${ADDON_PRICES.englishDriver} USD</TableCell>
                  </div>
                )}
                {form.nightTrip && (
                  <div className="grid grid-cols-5 text-center bg-white border-t border-[#e4d8c2]/50">
                    <TableCell>{++rowNum}</TableCell>
                    <TableCell className="col-span-2">Night trip (10PM-5AM)</TableCell>
                    <TableCell>1</TableCell>
                    <TableCell>${ADDON_PRICES.nightTrip} USD</TableCell>
                    <TableCell className="font-bold">${ADDON_PRICES.nightTrip} USD</TableCell>
                  </div>
                )}
              </>
            );
          })()}
          <div className="grid grid-cols-5 text-center bg-pearl/30 border-t border-[#e4d8c2]">
            <div className="col-span-4 px-6 py-4 text-right text-[14px] font-semibold text-navy">Sub-total</div>
            <div className="px-6 py-4 text-[15px] font-bold text-navy">${extraFee} USD</div>
          </div>
        </div>
      </div>

      {/* Grand Total */}
      <div className="rounded-[24px] border-2 border-gold/40 bg-gold/5 p-8">
        <div className="flex items-center justify-between">
          <span className="text-[18px] font-bold text-navy">TOTAL PAYMENT</span>
          <span className="text-[32px] font-bold text-navy">${totalFee} <span className="text-[16px] font-normal text-navy/50">USD</span></span>
        </div>
        <p className="mt-3 text-[13px] text-navy/50">Payment is required after we confirm your visa approval. You will receive an email with payment instructions.</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════ */

const fieldBase = 'w-full rounded-[16px] border-2 border-[#e4d8c2] bg-white px-6 py-4 text-[15px] text-navy transition focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/10 placeholder:text-navy/35';

function FormSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-[32px] border-2 border-[#e4d8c2] bg-[linear-gradient(180deg,#fffdf8,#faf5ec)] shadow-[0_16px_48px_rgba(11,27,43,0.06)]">
      <div className="flex items-center gap-4 border-b-2 border-[#eadcc8]/80 px-8 py-7 md:px-10">
        <span className="text-gold-dark">{icon}</span>
        <h3 className="font-serif text-[22px] font-semibold text-gold-dark">{title}</h3>
      </div>
      <div className="p-8 md:p-10">{children}</div>
    </section>
  );
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="space-y-0">{children}</div>;
}

function FieldLabel({ children, size }: { children: React.ReactNode; size?: 'sm' }) {
  return (
    <label className={cn(
      'mb-3 block font-semibold text-navy',
      size === 'sm' ? 'text-[13px]' : 'text-[15px]'
    )}>
      {children}
    </label>
  );
}

function Req() {
  return <span className="text-red-500">*</span>;
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 flex items-center gap-1.5 text-[12px] text-red-500"><AlertCircle className="h-3.5 w-3.5" />{children}</p>;
}

function TableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-4 py-4 text-[13px] font-bold text-pearl', className)}>{children}</div>;
}

function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-4 py-4 text-[14px] text-navy border-b border-[#f0e8da]', className)}>{children}</div>;
}
