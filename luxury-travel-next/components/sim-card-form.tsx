'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useMemo, useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Wifi, Smartphone, Globe2, Signal, Clock, Zap, Mail, Phone, ChevronDown, Star, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/tracking';

/* ═══════════════════════════════════════════════════════════════
   DATA — eSIM & SIM Card Products (Klook-style catalog)
═══════════════════════════════════════════════════════════════ */

type ProductCategory = 'esim' | 'sim-card';

interface SimProduct {
  id: string;
  category: ProductCategory;
  name: string;
  provider: string;
  network: string;
  coverage: string[];
  data: string;
  validity: string;
  price: number;
  originalPrice?: number;
  features: string[];
  rating: number;
  reviews: number;
  popular?: boolean;
  badge?: string;
}

const SIM_PRODUCTS: SimProduct[] = [
  // ── eSIM Plans ──
  {
    id: 'esim-1gb-3d',
    category: 'esim',
    name: 'Vietnam eSIM 1GB / 3 Days',
    provider: 'Viettel',
    network: '4G/5G',
    coverage: ['Vietnam'],
    data: '1GB',
    validity: '3 Days',
    price: 4.00,
    features: ['Instant activation via QR code', 'No physical SIM needed', '5G supported'],
    rating: 4.5,
    reviews: 328,
  },
  {
    id: 'esim-3gb-7d',
    category: 'esim',
    name: 'Vietnam eSIM 3GB / 7 Days',
    provider: 'Vinaphone',
    network: '4G/5G',
    coverage: ['Vietnam'],
    data: '3GB',
    validity: '7 Days',
    price: 8.00,
    features: ['Instant activation via QR code', 'No physical SIM needed', '5G supported', 'Tethering allowed'],
    rating: 4.6,
    reviews: 512,
    popular: true,
    badge: 'Best Seller',
  },
  {
    id: 'esim-5gb-15d',
    category: 'esim',
    name: 'Vietnam eSIM 5GB / 15 Days',
    provider: 'Viettel',
    network: '4G/5G',
    coverage: ['Vietnam'],
    data: '5GB',
    validity: '15 Days',
    price: 10.50,
    features: ['Instant activation via QR code', 'No physical SIM needed', '5G supported', 'Tethering allowed'],
    rating: 4.7,
    reviews: 689,
    popular: true,
  },
  {
    id: 'esim-10gb-30d',
    category: 'esim',
    name: 'Vietnam eSIM 10GB / 30 Days',
    provider: 'Vinaphone',
    network: '4G/5G',
    coverage: ['Vietnam'],
    data: '10GB',
    validity: '30 Days',
    price: 18.00,
    features: ['Instant activation via QR code', 'No physical SIM needed', '5G supported', 'Tethering allowed'],
    rating: 4.6,
    reviews: 445,
  },
  {
    id: 'esim-20gb-30d',
    category: 'esim',
    name: 'Vietnam eSIM 20GB / 30 Days',
    provider: 'Viettel',
    network: '4G/5G',
    coverage: ['Vietnam'],
    data: '20GB',
    validity: '30 Days',
    price: 29.00,
    features: ['Instant activation via QR code', 'No physical SIM needed', '5G supported', 'Tethering allowed', 'High-speed data'],
    rating: 4.8,
    reviews: 723,
    popular: true,
    badge: 'Best Value',
  },
  {
    id: 'esim-50gb-30d',
    category: 'esim',
    name: 'Vietnam eSIM 50GB / 30 Days',
    provider: 'Viettel',
    network: '4G/5G',
    coverage: ['Vietnam'],
    data: '50GB',
    validity: '30 Days',
    price: 49.00,
    features: ['Instant activation via QR code', 'No physical SIM needed', '5G supported', 'Tethering allowed', 'High-speed data', 'Best for heavy users'],
    rating: 4.7,
    reviews: 298,
  },
  {
    id: 'esim-unlimited-7d',
    category: 'esim',
    name: 'Vietnam eSIM Unlimited / 7 Days',
    provider: 'Vinaphone',
    network: '4G/5G',
    coverage: ['Vietnam'],
    data: 'Unlimited (5GB high-speed/day)',
    validity: '7 Days',
    price: 12.90,
    features: ['Instant activation via QR code', 'Unlimited data', '5G supported', 'Throttled after daily limit'],
    rating: 4.5,
    reviews: 892,
    popular: true,
    badge: 'Popular',
  },
  {
    id: 'esim-unlimited-15d',
    category: 'esim',
    name: 'Vietnam eSIM Unlimited / 15 Days',
    provider: 'Viettel',
    network: '4G/5G',
    coverage: ['Vietnam'],
    data: 'Unlimited (5GB high-speed/day)',
    validity: '15 Days',
    price: 20.00,
    features: ['Instant activation via QR code', 'Unlimited data', '5G supported', 'Throttled after daily limit', 'Tethering allowed'],
    rating: 4.6,
    reviews: 567,
  },
  {
    id: 'esim-unlimited-30d',
    category: 'esim',
    name: 'Vietnam eSIM Unlimited / 30 Days',
    provider: 'Viettel',
    network: '4G/5G',
    coverage: ['Vietnam'],
    data: 'Unlimited (5GB high-speed/day)',
    validity: '30 Days',
    price: 35.00,
    features: ['Instant activation via QR code', 'Unlimited data', '5G supported', 'Throttled after daily limit', 'Tethering allowed', 'Best for long stays'],
    rating: 4.7,
    reviews: 412,
  },
  {
    id: 'esim-asia-6gb-8d',
    category: 'esim',
    name: 'Asia Multi-Country eSIM 6GB / 8 Days',
    provider: 'Roaming',
    network: '4G/5G',
    coverage: ['Vietnam', 'Thailand', 'Cambodia', 'Laos', 'Myanmar', 'Singapore', 'Malaysia', 'Indonesia'],
    data: '6GB',
    validity: '8 Days',
    price: 18.00,
    features: ['Covers 8 Asian countries', 'Instant activation', '5G where available', 'Single QR for all countries'],
    rating: 4.4,
    reviews: 234,
  },
  {
    id: 'esim-asia-15gb-15d',
    category: 'esim',
    name: 'Asia Multi-Country eSIM 15GB / 15 Days',
    provider: 'Roaming',
    network: '4G/5G',
    coverage: ['Vietnam', 'Thailand', 'Cambodia', 'Laos', 'Myanmar', 'Singapore', 'Malaysia', 'Indonesia', 'Philippines', 'Japan', 'Korea'],
    data: '15GB',
    validity: '15 Days',
    price: 30.00,
    features: ['Covers 11 Asian countries', 'Instant activation', '5G where available', 'Single QR for all countries', 'Tethering allowed'],
    rating: 4.5,
    reviews: 178,
  },
  // ── Physical SIM Cards ──
  {
    id: 'sim-10gb-7d',
    category: 'sim-card',
    name: 'Vietnam SIM Card 4G/5G — 10GB / 7 Days',
    provider: 'Viettel',
    network: '4G/5G',
    coverage: ['Vietnam'],
    data: '10GB',
    validity: '7 Days',
    price: 8.00,
    features: ['Airport pickup available', 'Local Vietnamese number (+84)', 'Free incoming calls', 'Nationwide coverage'],
    rating: 4.6,
    reviews: 1245,
    popular: true,
    badge: 'Best Seller',
  },
  {
    id: 'sim-30gb-15d',
    category: 'sim-card',
    name: 'Vietnam SIM Card 4G/5G — 30GB / 15 Days',
    provider: 'Viettel',
    network: '4G/5G',
    coverage: ['Vietnam'],
    data: '30GB',
    validity: '15 Days',
    price: 15.00,
    features: ['Airport pickup available', 'Local Vietnamese number (+84)', 'Free incoming calls', 'Unlimited local calls', '5G in major cities'],
    rating: 4.7,
    reviews: 987,
    popular: true,
  },
  {
    id: 'sim-unlimited-30d',
    category: 'sim-card',
    name: 'Vietnam SIM Card 4G/5G — Unlimited / 30 Days',
    provider: 'Mobifone',
    network: '4G/5G',
    coverage: ['Vietnam'],
    data: 'Unlimited (high-speed 4GB/day)',
    validity: '30 Days',
    price: 25.00,
    features: ['Airport pickup available', 'Local Vietnamese number (+84)', 'Free incoming calls', 'Unlimited local calls', '5G supported', 'Throttled after daily high-speed'],
    rating: 4.5,
    reviews: 654,
    badge: 'Best Value',
  },
  {
    id: 'sim-asia-6gb-8d',
    category: 'sim-card',
    name: 'Asia Multi-Country SIM — 6GB / 8 Days',
    provider: 'AIS',
    network: '4G',
    coverage: ['Vietnam', 'Thailand', 'Cambodia', 'Laos', 'Myanmar', 'Singapore', 'Malaysia', 'Indonesia'],
    data: '6GB',
    validity: '8 Days',
    price: 18.00,
    features: ['Airport pickup available', 'Works in 8 countries', 'Plug & play', 'No registration needed'],
    rating: 4.3,
    reviews: 432,
  },
  {
    id: 'sim-asia-15gb-15d',
    category: 'sim-card',
    name: 'Asia Multi-Country SIM — 15GB / 15 Days',
    provider: 'AIS',
    network: '4G/5G',
    coverage: ['Vietnam', 'Thailand', 'Cambodia', 'Laos', 'Myanmar', 'Singapore', 'Malaysia', 'Indonesia', 'Philippines', 'Japan', 'Korea'],
    data: '15GB',
    validity: '15 Days',
    price: 30.00,
    features: ['Airport pickup available', 'Works in 11 countries', '5G in select countries', 'Plug & play', 'No registration needed'],
    rating: 4.4,
    reviews: 321,
  },
];

const CATEGORIES: { id: 'all' | ProductCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'esim', label: 'eSIM' },
  { id: 'sim-card', label: 'SIM Card' },
];

const COUNTRY_CODES = [
  { code: '+1', country: 'US/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+61', country: 'Australia' },
  { code: '+81', country: 'Japan' },
  { code: '+82', country: 'Korea' },
  { code: '+84', country: 'Vietnam' },
  { code: '+86', country: 'China' },
  { code: '+91', country: 'India' },
  { code: '+33', country: 'France' },
  { code: '+49', country: 'Germany' },
  { code: '+39', country: 'Italy' },
  { code: '+34', country: 'Spain' },
  { code: '+7', country: 'Russia' },
  { code: '+65', country: 'Singapore' },
  { code: '+66', country: 'Thailand' },
  { code: '+60', country: 'Malaysia' },
  { code: '+62', country: 'Indonesia' },
  { code: '+63', country: 'Philippines' },
  { code: '+852', country: 'Hong Kong' },
  { code: '+886', country: 'Taiwan' },
];

const DELIVERY_OPTIONS = [
  { id: 'email', label: 'Email delivery (eSIM QR code)', forCategory: 'esim' as ProductCategory },
  { id: 'airport-hanoi', label: 'Pickup at Noi Bai Airport (Hanoi)', forCategory: 'sim-card' as ProductCategory },
  { id: 'airport-hcm', label: 'Pickup at Tan Son Nhat Airport (Ho Chi Minh)', forCategory: 'sim-card' as ProductCategory },
  { id: 'airport-danang', label: 'Pickup at Da Nang Airport', forCategory: 'sim-card' as ProductCategory },
  { id: 'hotel', label: 'Hotel delivery (Hanoi/HCMC only, +$3)', forCategory: 'sim-card' as ProductCategory },
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */

const PHASES = [
  { title: 'Choose Plan', subtitle: 'Select your eSIM or SIM' },
  { title: 'Your Info', subtitle: 'Contact & delivery' },
  { title: 'Review & Order', subtitle: 'Confirm and submit' },
];

export function SimCardForm() {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<'all' | ProductCategory>('all');
  const [selectedProduct, setSelectedProduct] = useState<SimProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    countryCode: '+1',
    phone: '',
    arrivalDate: '',
    flightNumber: '',
    delivery: '',
    hotelName: '',
    hotelAddress: '',
    message: '',
    website: '', // honeypot
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const filteredProducts = useMemo(() => {
    if (category === 'all') return SIM_PRODUCTS;
    return SIM_PRODUCTS.filter(p => p.category === category);
  }, [category]);

  const totalPrice = useMemo(() => {
    if (!selectedProduct) return 0;
    let total = selectedProduct.price * quantity;
    if (form.delivery === 'hotel') total += 3;
    return total;
  }, [selectedProduct, quantity, form.delivery]);

  const deliveryOptions = useMemo(() => {
    if (!selectedProduct) return DELIVERY_OPTIONS;
    return DELIVERY_OPTIONS.filter(d => d.forCategory === selectedProduct.category);
  }, [selectedProduct]);

  const updateField = useCallback((field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }, []);

  const validateStep1 = () => {
    if (!selectedProduct) {
      setErrors({ product: 'Please select a plan' });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    if (!form.delivery) e.delivery = 'Please select delivery method';
    if (form.delivery === 'hotel' && !form.hotelName.trim()) e.hotelName = 'Hotel name is required';
    if (selectedProduct?.category === 'sim-card' && !form.arrivalDate) e.arrivalDate = 'Arrival date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && !validateStep1()) return;
    if (step === 1 && !validateStep2()) return;
    setStep(s => Math.min(s + 1, 2));
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (form.website) return; // honeypot
    setSubmitting(true);
    try {
      const res = await fetch('/api/sim-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: selectedProduct,
          quantity,
          totalPrice,
          contact: {
            fullName: form.fullName,
            email: form.email,
            countryCode: form.countryCode,
            phone: form.phone,
          },
          delivery: form.delivery,
          arrivalDate: form.arrivalDate,
          flightNumber: form.flightNumber,
          hotelName: form.hotelName,
          hotelAddress: form.hotelAddress,
          message: form.message,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      trackEvent('sim_order_submitted', { product: selectedProduct?.id, quantity });
      setSubmitted(true);
    } catch {
      setErrors({ submit: 'Failed to submit order. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-[40px] border border-[#e4d8c2] bg-[linear-gradient(180deg,#fffdf8,#faf5ec)] p-10 text-center shadow-[0_30px_92px_rgba(11,27,43,0.13)] md:p-14">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-gold/20">
          <Check className="h-10 w-10 text-gold" />
        </div>
        <h2 className="text-[28px] font-bold text-navy">Order Confirmed!</h2>
        <p className="mt-4 text-[16px] leading-7 text-navy/60">
          Thank you for your order. We&apos;ve sent a confirmation email to <strong>{form.email}</strong>.
          {selectedProduct?.category === 'esim' && ' Your eSIM QR code will be delivered to your email within 15 minutes.'}
          {selectedProduct?.category === 'sim-card' && ' We will contact you to confirm the pickup/delivery details.'}
        </p>
      </div>
    );
  }

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
          {step === 0 && (
            <StepChoosePlan
              category={category}
              setCategory={setCategory}
              filteredProducts={filteredProducts}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
              quantity={quantity}
              setQuantity={setQuantity}
              errors={errors}
            />
          )}
          {step === 1 && (
            <StepContactInfo
              form={form}
              updateField={updateField}
              errors={errors}
              deliveryOptions={deliveryOptions}
              selectedProduct={selectedProduct}
            />
          )}
          {step === 2 && (
            <StepReview
              selectedProduct={selectedProduct}
              quantity={quantity}
              totalPrice={totalPrice}
              form={form}
              goToStep={setStep}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Navigation ── */}
      <div className="mt-10 flex items-center justify-between">
        {step > 0 ? (
          <button type="button" onClick={handleBack} className="flex items-center gap-2 rounded-full border border-navy/12 px-6 py-3 text-[14px] font-bold text-navy/60 transition hover:border-navy/25 hover:text-navy">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        ) : <span />}
        {step < 2 ? (
          <button type="button" onClick={handleNext} className="flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 text-[14px] font-black text-navy shadow-[0_8px_24px_rgba(200,169,106,0.3)] transition hover:bg-gold/90">
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 text-[14px] font-black text-navy shadow-[0_8px_24px_rgba(200,169,106,0.3)] transition hover:bg-gold/90 disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Order'} {!submitting && <Mail className="h-4 w-4" />}
          </button>
        )}
      </div>
      {errors.submit && <p className="mt-4 text-center text-[13px] text-red-600">{errors.submit}</p>}
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" value={form.website} onChange={e => updateField('website', e.target.value)} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 1 — Choose Plan
═══════════════════════════════════════════════════════════════ */

function StepChoosePlan({
  category, setCategory, filteredProducts, selectedProduct, setSelectedProduct, quantity, setQuantity, errors
}: {
  category: 'all' | ProductCategory;
  setCategory: (c: 'all' | ProductCategory) => void;
  filteredProducts: SimProduct[];
  selectedProduct: SimProduct | null;
  setSelectedProduct: (p: SimProduct) => void;
  quantity: number;
  setQuantity: (q: number) => void;
  errors: Record<string, string>;
}) {
  return (
    <div>
      {/* Category Filter */}
      <div className="mb-8 flex items-center gap-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            className={cn(
              'rounded-full border px-5 py-2.5 text-[13px] font-bold transition',
              category === cat.id
                ? 'border-gold bg-gold/10 text-navy'
                : 'border-navy/10 text-navy/50 hover:border-navy/25 hover:text-navy/70'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {errors.product && <p className="mb-4 text-[13px] text-red-600">{errors.product}</p>}

      {/* Product Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredProducts.map(product => (
          <button
            key={product.id}
            type="button"
            onClick={() => setSelectedProduct(product)}
            className={cn(
              'group relative rounded-2xl border-2 bg-white p-5 text-left transition duration-200',
              selectedProduct?.id === product.id
                ? 'border-gold shadow-[0_8px_32px_rgba(200,169,106,0.18)]'
                : 'border-navy/8 hover:border-gold/40 hover:shadow-[0_4px_16px_rgba(200,169,106,0.08)]'
            )}
          >
            {product.badge && (
              <span className="absolute -top-2.5 right-4 rounded-full bg-gold px-3 py-1 text-[10px] font-black uppercase tracking-wider text-navy">
                {product.badge}
              </span>
            )}
            <div className="flex items-start gap-4">
              <div className={cn(
                'grid h-11 w-11 shrink-0 place-items-center rounded-xl',
                product.category === 'esim' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
              )}>
                {product.category === 'esim' ? <Wifi className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-navy leading-tight">{product.name}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-navy/50">
                  <span className="flex items-center gap-1"><Signal className="h-3 w-3" />{product.network}</span>
                  <span className="flex items-center gap-1"><Globe2 className="h-3 w-3" />{product.provider}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{product.validity}</span>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                  <span className="text-[12px] font-semibold text-navy/60">{product.rating}</span>
                  <span className="text-[11px] text-navy/40">({product.reviews.toLocaleString()})</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[20px] font-black text-navy">${product.price.toFixed(2)}</p>
                {product.originalPrice && (
                  <p className="text-[12px] text-navy/40 line-through">${product.originalPrice.toFixed(2)}</p>
                )}
                <p className="text-[11px] text-navy/40">per unit</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.features.slice(0, 3).map(f => (
                <span key={f} className="rounded-full bg-pearl px-2.5 py-1 text-[10px] font-medium text-navy/60">{f}</span>
              ))}
            </div>
            {/* Selection indicator */}
            {selectedProduct?.id === product.id && (
              <div className="absolute right-3 top-3">
                <div className="grid h-6 w-6 place-items-center rounded-full bg-gold">
                  <Check className="h-3.5 w-3.5 text-navy" />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Quantity */}
      {selectedProduct && (
        <div className="mt-8 flex items-center gap-6 rounded-2xl border border-navy/8 bg-white p-5">
          <span className="text-[14px] font-bold text-navy">Quantity:</span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="grid h-9 w-9 place-items-center rounded-full border border-navy/15 text-navy/60 transition hover:border-navy/30">−</button>
            <span className="w-8 text-center text-[16px] font-black text-navy">{quantity}</span>
            <button type="button" onClick={() => setQuantity(Math.min(10, quantity + 1))} className="grid h-9 w-9 place-items-center rounded-full border border-navy/15 text-navy/60 transition hover:border-navy/30">+</button>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[12px] text-navy/40">Subtotal</p>
            <p className="text-[20px] font-black text-navy">${(selectedProduct.price * quantity).toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 2 — Contact Info
═══════════════════════════════════════════════════════════════ */

function StepContactInfo({
  form, updateField, errors, deliveryOptions, selectedProduct
}: {
  form: Record<string, string>;
  updateField: (field: string, value: string) => void;
  errors: Record<string, string>;
  deliveryOptions: typeof DELIVERY_OPTIONS;
  selectedProduct: SimProduct | null;
}) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <FieldInput label="Full Name" value={form.fullName} onChange={v => updateField('fullName', v)} error={errors.fullName} placeholder="John Smith" />
        <FieldInput label="Email" type="email" value={form.email} onChange={v => updateField('email', v)} error={errors.email} placeholder="you@email.com" icon={<Mail className="h-4 w-4" />} />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-[12px] font-bold uppercase tracking-[0.1em] text-navy/60">Phone</label>
          <div className="flex gap-2">
            <select
              value={form.countryCode}
              onChange={e => updateField('countryCode', e.target.value)}
              className="w-[110px] rounded-xl border border-navy/12 bg-white px-3 py-3 text-[14px] text-navy focus:border-gold focus:outline-none"
            >
              {COUNTRY_CODES.map(c => (
                <option key={c.code} value={c.code}>{c.code} {c.country}</option>
              ))}
            </select>
            <input
              type="tel"
              value={form.phone}
              onChange={e => updateField('phone', e.target.value)}
              placeholder="Phone number"
              className={cn('flex-1 rounded-xl border bg-white px-4 py-3 text-[14px] text-navy placeholder:text-navy/30 focus:outline-none', errors.phone ? 'border-red-400' : 'border-navy/12 focus:border-gold')}
            />
          </div>
          {errors.phone && <p className="mt-1 text-[12px] text-red-600">{errors.phone}</p>}
        </div>
        {selectedProduct?.category === 'sim-card' && (
          <FieldInput label="Arrival Date" type="date" value={form.arrivalDate} onChange={v => updateField('arrivalDate', v)} error={errors.arrivalDate} />
        )}
      </div>

      {selectedProduct?.category === 'sim-card' && (
        <FieldInput label="Flight Number (optional)" value={form.flightNumber} onChange={v => updateField('flightNumber', v)} placeholder="VN123" />
      )}

      {/* Delivery Method */}
      <div>
        <label className="mb-3 block text-[12px] font-bold uppercase tracking-[0.1em] text-navy/60">Delivery Method</label>
        <div className="grid gap-3 md:grid-cols-2">
          {deliveryOptions.map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => updateField('delivery', opt.id)}
              className={cn(
                'flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left text-[13px] font-semibold transition',
                form.delivery === opt.id
                  ? 'border-gold bg-gold/5 text-navy'
                  : 'border-navy/8 text-navy/60 hover:border-navy/20'
              )}
            >
              <span className={cn('grid h-5 w-5 shrink-0 place-items-center rounded-full border-2', form.delivery === opt.id ? 'border-gold bg-gold' : 'border-navy/20')}>
                {form.delivery === opt.id && <Check className="h-3 w-3 text-navy" />}
              </span>
              {opt.label}
            </button>
          ))}
        </div>
        {errors.delivery && <p className="mt-1 text-[12px] text-red-600">{errors.delivery}</p>}
      </div>

      {form.delivery === 'hotel' && (
        <div className="grid gap-6 md:grid-cols-2">
          <FieldInput label="Hotel Name" value={form.hotelName} onChange={v => updateField('hotelName', v)} error={errors.hotelName} placeholder="Hotel name" />
          <FieldInput label="Hotel Address (optional)" value={form.hotelAddress} onChange={v => updateField('hotelAddress', v)} placeholder="Hotel address" />
        </div>
      )}

      <div>
        <label className="mb-2 block text-[12px] font-bold uppercase tracking-[0.1em] text-navy/60">Message (optional)</label>
        <textarea
          value={form.message}
          onChange={e => updateField('message', e.target.value)}
          rows={3}
          placeholder="Any special requests..."
          className="w-full rounded-xl border border-navy/12 bg-white px-4 py-3 text-[14px] text-navy placeholder:text-navy/30 focus:border-gold focus:outline-none"
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 3 — Review
═══════════════════════════════════════════════════════════════ */

function StepReview({
  selectedProduct, quantity, totalPrice, form, goToStep
}: {
  selectedProduct: SimProduct | null;
  quantity: number;
  totalPrice: number;
  form: Record<string, string>;
  goToStep: (s: number) => void;
}) {
  if (!selectedProduct) return null;

  return (
    <div className="grid gap-6">
      {/* Order Summary */}
      <div className="rounded-2xl border border-navy/8 bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-black text-navy">Order Summary</h3>
          <button type="button" onClick={() => goToStep(0)} className="text-[12px] font-bold text-gold hover:text-gold-dark">Edit</button>
        </div>
        <div className="mt-4 space-y-3">
          <div className="flex justify-between text-[14px]">
            <span className="text-navy/60">Product</span>
            <span className="font-semibold text-navy">{selectedProduct.name}</span>
          </div>
          <div className="flex justify-between text-[14px]">
            <span className="text-navy/60">Category</span>
            <span className="font-semibold text-navy">{selectedProduct.category === 'esim' ? 'eSIM' : 'Physical SIM Card'}</span>
          </div>
          <div className="flex justify-between text-[14px]">
            <span className="text-navy/60">Data</span>
            <span className="font-semibold text-navy">{selectedProduct.data}</span>
          </div>
          <div className="flex justify-between text-[14px]">
            <span className="text-navy/60">Validity</span>
            <span className="font-semibold text-navy">{selectedProduct.validity}</span>
          </div>
          <div className="flex justify-between text-[14px]">
            <span className="text-navy/60">Network</span>
            <span className="font-semibold text-navy">{selectedProduct.network} • {selectedProduct.provider}</span>
          </div>
          <div className="flex justify-between text-[14px]">
            <span className="text-navy/60">Quantity</span>
            <span className="font-semibold text-navy">{quantity}</span>
          </div>
          <div className="flex justify-between text-[14px]">
            <span className="text-navy/60">Unit Price</span>
            <span className="font-semibold text-navy">${selectedProduct.price.toFixed(2)}</span>
          </div>
          {form.delivery === 'hotel' && (
            <div className="flex justify-between text-[14px]">
              <span className="text-navy/60">Hotel Delivery Fee</span>
              <span className="font-semibold text-navy">$3.00</span>
            </div>
          )}
          <div className="border-t border-navy/8 pt-3">
            <div className="flex justify-between text-[18px]">
              <span className="font-bold text-navy">Total</span>
              <span className="font-black text-navy">${totalPrice.toFixed(2)} USD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info Summary */}
      <div className="rounded-2xl border border-navy/8 bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-black text-navy">Contact & Delivery</h3>
          <button type="button" onClick={() => goToStep(1)} className="text-[12px] font-bold text-gold hover:text-gold-dark">Edit</button>
        </div>
        <div className="mt-4 space-y-2 text-[14px]">
          <p><span className="text-navy/50">Name:</span> <span className="font-semibold text-navy">{form.fullName}</span></p>
          <p><span className="text-navy/50">Email:</span> <span className="font-semibold text-navy">{form.email}</span></p>
          <p><span className="text-navy/50">Phone:</span> <span className="font-semibold text-navy">{form.countryCode} {form.phone}</span></p>
          <p><span className="text-navy/50">Delivery:</span> <span className="font-semibold text-navy">{DELIVERY_OPTIONS.find(d => d.id === form.delivery)?.label}</span></p>
          {form.arrivalDate && <p><span className="text-navy/50">Arrival:</span> <span className="font-semibold text-navy">{form.arrivalDate}</span></p>}
          {form.flightNumber && <p><span className="text-navy/50">Flight:</span> <span className="font-semibold text-navy">{form.flightNumber}</span></p>}
          {form.hotelName && <p><span className="text-navy/50">Hotel:</span> <span className="font-semibold text-navy">{form.hotelName}</span></p>}
        </div>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-3 rounded-xl bg-gold/8 p-4">
        <Shield className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
        <p className="text-[13px] leading-5 text-navy/60">
          No payment required now. After submitting, we&apos;ll confirm your order via email and provide payment instructions. Your SIM/eSIM will be delivered after payment confirmation.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED — Field Input
═══════════════════════════════════════════════════════════════ */

function FieldInput({
  label, value, onChange, error, placeholder, type = 'text', icon
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-[12px] font-bold uppercase tracking-[0.1em] text-navy/60">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-xl border bg-white py-3 text-[14px] text-navy placeholder:text-navy/30 focus:outline-none',
            icon ? 'pl-10 pr-4' : 'px-4',
            error ? 'border-red-400' : 'border-navy/12 focus:border-gold'
          )}
        />
      </div>
      {error && <p className="mt-1 text-[12px] text-red-600">{error}</p>}
    </div>
  );
}
