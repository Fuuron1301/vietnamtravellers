import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Star, Heart, ChevronRight, Check, Lightbulb } from 'lucide-react';
import rawProducts from '@/data/klook-raw-products.json';
import detailProducts from '@/data/klook-detail-data.json';
import SimDetailScrollNav from '@/components/sim-detail-scroll-nav';
import SimPackageOptions from '@/components/sim-package-options';
import { SimFaqAccordion } from '@/components/sim-faq-accordion';

type RawProduct = {
  id: number;
  title: string;
  score: number;
  reviews: number;
  country: string;
  price: string;
  priceUnit?: string;
  booked: string;
  validity: string;
  speed: string;
  serviceType: string;
  coverage: string;
  operator?: string;
  hotspot?: string;
  urlSeo: string;
  imageKey: string;
};

type DetailPackage = {
  id: number;
  name: string;
  sellPrice: string;
  marketPrice?: string;
};

type DetailProduct = {
  id: number;
  description?: string;
  packages: DetailPackage[];
};

type ParsedPackage = {
  id: number;
  packageType: string;
  validity: string;
  dataPackage: string;
  serviceType: string;
  label: string;
};

const PRODUCT_LIST = rawProducts as RawProduct[];
const DETAIL_LIST = detailProducts as DetailProduct[];
const DETAIL_BY_ID = new Map(DETAIL_LIST.map(item => [item.id, item]));

const DEFAULT_FAQS = [
  {
    question: 'What devices are compatible with eSIM?',
    answer: 'Most modern smartphones support eSIM, including iPhone XS (2018) and newer, Samsung Galaxy S20 and newer, Google Pixel 3 and newer, and many other Android flagships. To check: on iPhone go to Settings → General → About → look for "Available SIM" or "eSIM"; on Android go to Settings → Connections → SIM Card Manager → check for "Add eSIM" option. Note: devices purchased in mainland China or carrier-locked phones typically do not support eSIM.'
  },
  {
    question: 'How can I activate the eSIM directly from the Klook app?',
    answer: 'Open the Klook app → tap Account (bottom right) → Bookings → find your eSIM order → tap "Activate". The app will guide you through each step automatically. Keep your Wi-Fi connection stable throughout the process — it typically takes 1–3 minutes. Once installed, the eSIM will appear in your device\'s SIM settings ready to configure.'
  },
  {
    question: 'How can I activate the eSIM with a QR code?',
    answer: 'On iPhone: go to Settings → Cellular → Add Cellular Plan → scan the QR code. On Android: go to Settings → Connections → SIM Card Manager → Add Mobile Plan → scan QR code. You need an active Wi-Fi connection and must keep the screen on during installation. The QR code is sent to your email and available in the Klook app under Bookings. Each QR code can only be scanned once on one device.'
  },
  {
    question: "The eSIM didn't get activated on my device. What should I do?",
    answer: 'First, ensure your Wi-Fi connection is stable and retry the activation. If still failing: (1) Check that your device is eSIM-compatible and not carrier-locked. (2) Restart your phone and try again. (3) If using a QR code, try entering the SM-DP+ address and activation code manually instead of scanning. (4) Ensure your phone\'s software is up to date. If the issue persists, contact Klook support via Account → Bookings → your booking → "Contact Merchant".'
  },
  {
    question: 'Can I scan one QR code with multiple devices?',
    answer: 'No — each QR code is single-use and bound to one device. Once scanned and activated on a device, the QR code becomes invalid. If you need eSIM on multiple devices, you must purchase a separate plan for each device. Attempting to scan the same QR code on a second device will result in an error.'
  },
  {
    question: 'Should I turn on data roaming when I am using the eSIM?',
    answer: 'Yes — data roaming must be enabled specifically for the eSIM line (not your home SIM). On iPhone: Settings → Cellular → select the eSIM line → turn on Data Roaming. On Android: Settings → Connections → Mobile Networks → Data Roaming → enable for the eSIM. Make sure the eSIM is set as your active data line. Your home SIM\'s data roaming should remain off to avoid unexpected charges.'
  },
  {
    question: 'An error occurred while I was installing the eSIM. What should I do?',
    answer: 'Common fixes: (1) Check your Wi-Fi connection — installation requires stable internet. (2) Restart your phone and retry. (3) Ensure your phone has sufficient storage. (4) Check that your device\'s date and time are set to automatic. (5) If the QR scan fails, tap "Enter details manually" and input the SM-DP+ address and activation code from your voucher. If none of these work, contact Klook support and provide your booking reference number for a replacement QR code.'
  }
];

const JAPAN_REVIEWS = [
  {
    author: 'MARIA *****************',
    date: 'Today',
    title: 'Highly recommended',
    review: 'Absolutely loved using this eSIM! It is completely hassle-free, budget-friendly, and way more convenient than traditional SIM cards. The data speeds were excellent and activation was straightforward.',
    packageLabel: 'Data per day · 5 days · Unlimited · Data only'
  },
  {
    author: 'MARIA *****************',
    date: 'Today',
    title: 'Highly recommended',
    review: 'Installation was easy - just scan a QR code before leaving and connect on landing. The connection was fast and reliable throughout Osaka, Nara, and Kyoto.',
    packageLabel: 'Data in total · 7 days · 3GB · Data only'
  },
  {
    author: 'Luz ********',
    date: '16 May',
    title: 'Highly recommended',
    review: 'Super quick to book and easy to use. We stayed connected in Osaka, Nara, and Kyoto with no issues.',
    packageLabel: 'Data per day · 9 days · Unlimited · Data only'
  },
  {
    author: 'Klook User',
    date: '5 May',
    title: 'Highly recommended',
    review: 'Used this for an 8-day Japan trip. Activation was a breeze, and speed was great for maps and social media.',
    packageLabel: 'Data per day · 9 days · Unlimited · Data only'
  }
];

const HOW_TO_STEPS = [
  'Activate in Klook App (Update Klook APP to the latest version)',
  'Klook App: Account > Bookings > Click activate (or use QR code in voucher)',
  'Read the reminder and start installing the eSIM',
  'Install under WiFi and do not leave the page during setup',
  'After arriving at destination, turn on eSIM line and data roaming',
  'Switch cellular data to the eSIM card and verify status in bookings'
];

const EXPLORE_TOKYO = [
  'Ginza', 'Shibuya Sky', 'Ghibli Museum', 'Asakusa', 'Imperial Palace', 'Tokyo Skytree', 'Sensoji Temple',
  'Tokyo Tower', 'Rainbow Bridge', 'Tokyo Station', 'Akihabara', 'Odaiba', 'Shinjuku Station', 'Ueno',
  'Harajuku', 'Pokemon Center Tokyo DX', 'Tsukiji Outer Market', 'Ueno Zoo', 'Tokyo Dome City', 'Ueno Park'
];

const EXPLORE_NEEDS = [
  'Tokyo Hotels', 'Tokyo Car rentals', 'Tokyo Private airport transfers', 'Tokyo Tours', 'Tokyo Cultural experiences', 'Tokyo SIM cards',
  'Tokyo Rail pass', 'Tokyo Metro pass', 'Tokyo Attraction pass', 'Tokyo Disney tickets', 'Tokyo eSIM', 'Tokyo Travel insurance',
  'Tokyo Night tours', 'Tokyo Local guides', 'Tokyo Food tours', 'Tokyo Airport lounge'
];

const EXPLORE_JAPAN = [
  'Tokyo', 'Osaka', 'Kyoto', 'Nara', 'Yokohama', 'Sapporo', 'Fukuoka', 'Nagoya', 'Hiroshima', 'Okinawa',
  'Kobe', 'Kawaguchiko', 'Hakone', 'Kanazawa', 'Nikko', 'Kamakura', 'Sendai', 'Kumamoto', 'Miyajima', 'Takayama'
];

const SECTION_TABS = [
  { label: 'Overview', id: 'overview' },
  { label: 'Package options', id: 'package-options' },
  { label: 'Product details', id: 'product-details' },
  { label: 'What to expect', id: 'what-to-expect' },
  { label: 'Terms & Conditions', id: 'terms' },
  { label: 'How to use', id: 'how-to-use' },
  { label: 'Additional information', id: 'additional-info' },
  { label: 'Reviews', id: 'reviews' },
  { label: 'FAQs', id: 'faqs' }
];

function parseProductIdFromSlug(slug: string) {
  const matched = slug.match(/^(\d+)/);
  return matched ? Number.parseInt(matched[1], 10) : NaN;
}

function formatScoreCompact(value: number) {
  if (value >= 1000) return `${Math.round(value / 1000)}K+`;
  return `${value}+`;
}

function parsePackage(pkg: DetailPackage): ParsedPackage {
  const parts = pkg.name.split('·').map(part => part.trim()).filter(Boolean);
  return {
    id: pkg.id,
    packageType: parts[0] || 'Data package',
    validity: parts[1] || 'Flexible validity',
    dataPackage: parts[2] || 'Data only',
    serviceType: parts[3] || 'Data only',
    label: pkg.name
  };
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values)).filter(Boolean);
}

function normalizeValue(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function preferredValues(source: string[], expected: string[]) {
  const normalizedSource = source.map(item => normalizeValue(item));
  const picked = expected.filter(item => normalizedSource.includes(normalizeValue(item)));
  if (picked.length) return picked;
  return source.slice(0, 10);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const id = parseProductIdFromSlug(slug);
  const product = PRODUCT_LIST.find(item => item.id === id);
  if (!product) return { title: 'SIM details' };
  return {
    title: `${product.title} | eSIM details`,
    description: `Detailed SIM information, package options, reviews, and usage guide for ${product.title}.`
  };
}

export default async function SimCardDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const id = parseProductIdFromSlug(slug);
  if (!Number.isFinite(id)) notFound();

  const product = PRODUCT_LIST.find(item => item.id === id);
  if (!product) notFound();

  const detail = DETAIL_BY_ID.get(product.id);
  const packages = (detail?.packages || []).map(parsePackage);

  const packageTypes = uniqueValues(packages.map(item => item.packageType));
  const validities = uniqueValues(packages.map(item => item.validity));
  const dataPackages = uniqueValues(packages.map(item => item.dataPackage));
  const serviceTypes = uniqueValues(packages.map(item => item.serviceType));

  const packageTypeOptions = preferredValues(packageTypes, ['Data per day', 'Data in total']);
  const validityOptions = preferredValues(validities, ['1 day', '2 days', '3 days', '5 days', '7 days', '8 days', '10 days', '15 days', '30 days']);
  const dataOptions = preferredValues(dataPackages, ['Unlimited', '500MB', '1GB', '3GB', '5GB', '10GB', '20GB', '50GB']);
  const serviceOptions = preferredValues(serviceTypes, ['Data only']);

  const price = Number.parseFloat(product.price) || 0;
  const isJapanEsim = product.id === 109393;
  const productDescription = detail?.description || `${product.title} provides reliable travel connectivity with flexible data plans and instant activation.`;

  const whatToExpectTitle = `What to Expect with ${product.title.split('|')[0].trim()}`;

  return (
    <main className="min-h-screen bg-pearl pt-[112px] font-[var(--font-manrope)]">
      <SimDetailScrollNav tabs={SECTION_TABS} triggerId="sim-detail-title" topOffset={88} />

      {/* ─── FULL-WIDTH HERO IMAGE ─── */}
      <div className="mx-auto max-w-[1120px] px-4 md:px-6">
        <div className="relative overflow-hidden rounded-[16px] shadow-[0_18px_44px_rgba(11,27,43,0.12)]" style={{ aspectRatio: '16/7' }}>
          {/* Blurred background */}
          <div className="absolute inset-0">
            <Image
              src={`/images/sim/${product.imageKey}`}
              alt=""
              fill
              className="object-cover scale-[1.15] blur-[14px] brightness-[0.82] saturate-[1.15]"
              quality={30}
              unoptimized
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-navy/8" />
          </div>
          {/* Sharp center image */}
          <div className="absolute inset-y-0 left-1/2 w-[56%] -translate-x-1/2">
            <Image
              src={`/images/sim/${product.imageKey}`}
              alt={product.title}
              fill
              className="object-cover"
              quality={96}
              priority
              unoptimized
              sizes="(max-width: 768px) 100vw, 56vw"
            />
          </div>
        </div>
      </div>

      {/* ─── CONTENT + STICKY SIDEBAR ─── */}
      <div className="mx-auto max-w-[1120px] px-4 pb-24 md:px-6">
        <div className="grid items-start gap-10 md:grid-cols-[minmax(0,1fr)_280px] lg:gap-16">
          {/* Left content */}
          <div>
            <section id="overview" className="hlt-card-enter">
              <h1 id="sim-detail-title" className="mt-8 font-[var(--font-playfair)] text-[28px] font-bold leading-[1.25] tracking-[-0.02em] text-navy sm:text-[32px] md:text-[36px]">
                {product.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-[14px]">
                <Star className="h-4 w-4 fill-gold text-gold" />
                <span className="font-bold text-gold">{product.score.toFixed(1)}</span>
                <span className="cursor-pointer text-gold underline underline-offset-2">({formatScoreCompact(product.reviews)} reviews)</span>
                <span className="mx-1 text-navy/25">·</span>
                <span className="text-navy/60">{product.booked}</span>
                <span className="ml-auto inline-flex cursor-pointer items-center gap-1.5 text-[13px] text-navy/50 transition hover:text-gold">
                  <Heart className="h-4 w-4" /> Save to wishlist
                </span>
              </div>

              <div className="mt-8 space-y-4 text-[16px] font-medium leading-[1.75] text-navy">
                <div className="flex items-start gap-3">
                  <ChevronRight className="mt-[3px] h-5 w-5 shrink-0 text-gold" />
                  <span>Receive your eSIM immediately</span>
                </div>
                <div className="flex items-start gap-3">
                  <ChevronRight className="mt-[3px] h-5 w-5 shrink-0 text-gold" />
                  <span>24/7 customer service support</span>
                </div>
                <div className="flex items-start gap-3">
                  <ChevronRight className="mt-[3px] h-5 w-5 shrink-0 text-gold" />
                  <span>Fully refundable before use</span>
                </div>
              </div>

              <div className="mt-10">
                <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-navy/55">Offers for you</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex cursor-pointer items-center justify-between rounded-[14px] bg-gradient-to-br from-gold/20 to-gold/8 px-6 py-6 ring-1 ring-gold/30 transition hover:ring-gold/60">
                    <div>
                      <span className="block text-[24px] font-extrabold leading-none text-gold-dark">50% off</span>
                      <span className="mt-2 block text-[13px] font-medium text-navy/75">On selected eSIMs</span>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-gold/70" />
                  </div>
                  <div className="flex cursor-pointer items-center justify-between rounded-[14px] bg-white px-6 py-6 ring-1 ring-navy/12 transition hover:ring-gold/50">
                    <div>
                      <span className="block text-[24px] font-extrabold leading-none text-navy">15% off</span>
                      <span className="mt-2 block text-[13px] font-medium text-navy/75">Hotels &amp; stays</span>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-navy/40" />
                  </div>
                </div>
              </div>
            </section>

            {/* ─── PACKAGE OPTIONS ─── */}
            <section id="package-options" className="mt-16 hlt-card-enter">
              <h2 className="mb-6 font-[var(--font-playfair)] text-[26px] font-bold leading-tight text-navy md:text-[28px]">{product.title.split('|')[0].trim()} Package Options</h2>
              <SimPackageOptions
                packageTypeOptions={packageTypeOptions}
                validityOptions={validityOptions}
                dataOptions={dataOptions}
                serviceOptions={serviceOptions}
                rawPackages={detail?.packages || []}
                productSlug={slug}
              />
            </section>

            {/* ─── PRODUCT DETAILS ─── */}
            <section id="product-details" className="mt-16 hlt-card-enter">
              <h2 className="mb-8 font-[var(--font-playfair)] text-[28px] font-bold leading-tight text-navy md:text-[32px]">
                Product details
              </h2>
              <div className="overflow-hidden rounded-[16px] border border-navy/10 bg-white shadow-[0_4px_20px_rgba(11,27,43,0.07)]">
                <DetailRow label="Validity" value={product.validity} />
                <DetailRow label="Internet speed" value={product.speed} />
                <DetailRow label="Service type" value={product.serviceType} />
                <DetailRow label="Coverage area" value={product.coverage} />
                <DetailRow label="Data limit" value={isJapanEsim ? 'For Unlimited plans: 10GB/Day without a speed limit, 128 kbps after the limit' : 'Varies by package option'} />
                <DetailRow label="Hotspot Sharing" value={product.hotspot || 'Yes'} />
                <DetailRow label="Local telecom operator" value={product.operator || 'Leading local telecom network'} />
              </div>
            </section>

            {/* ─── WHAT TO EXPECT ─── */}
            <section id="what-to-expect" className="mt-16 hlt-card-enter">
              <h2 className="mb-8 font-[var(--font-playfair)] text-[28px] font-bold text-navy md:text-[32px]">
                {whatToExpectTitle}
              </h2>

              <h3 className="mb-3 text-[19px] font-bold text-navy">What is an eSIM for {product.country}?</h3>
              <p className="mb-4 text-[16px] font-medium leading-[1.9] text-navy/80">
                An eSIM {product.country} is a digital SIM card that lets you add a mobile data plan directly to your phone — no physical SIM card required. Stay connected across {product.country}&apos;s top cities and regions without visiting a store or paying expensive roaming charges. Simply scan the QR code, activate your plan via the Klook app, and you&apos;re ready to go from the moment you land.
              </p>
              <p className="mb-10 text-[16px] font-medium leading-[1.9] text-navy/80">
                With a {product.country} eSIM, you enjoy {product.speed} speeds through {product.operator || 'leading local carriers'}, giving you reliable connectivity for navigation, streaming, video calls, and everything in between — all at a fraction of standard roaming rates.
              </p>

              <h3 className="mb-4 text-[19px] font-bold text-navy">How to Get Your {product.country} eSIM?</h3>
              <ol className="mb-10 space-y-3 pl-0 text-[15px] leading-[1.8]">
                {[
                  'Download the Klook app on your iOS or Android device',
                  'Check that your device supports eSIM (Settings → General → About → Available SIM)',
                  'Select your destination, preferred data plan, and validity period',
                  'Complete payment and receive your eSIM QR code instantly via email or the app',
                  'Scan the QR code to install, then turn on Data Roaming to start browsing',
                ].map((step, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <span className="font-[var(--font-playfair)] text-[22px] font-bold leading-none text-gold">{i + 1}.</span>
                    <span className="font-medium text-navy/85">{step}</span>
                  </li>
                ))}
              </ol>

              <h3 className="mb-4 text-[19px] font-bold text-navy">Why Choose This eSIM for {product.country}?</h3>
              <ul className="mb-10 space-y-4">
                {[
                  ['High-Speed Data', `Connect to ${product.operator || 'top local networks'} with ${product.speed} speeds. Enjoy fast and stable internet throughout your trip — ideal for Google Maps navigation, streaming, video calls, and posting travel photos without interruption.`],
                  ['Instant Activation', `Your eSIM is delivered instantly after purchase. Activate in under 5 minutes via QR code or the Klook app — no waiting at airport counters, no SIM swapping, no queues. Your plan is ready to use the moment you land.`],
                  ['Affordable & Transparent', `Choose from flexible daily or total data plans at highly competitive prices. No surprise charges, no hidden roaming fees. You pay exactly what you see — making it the most cost-effective way to stay connected in ${product.country}.`],
                  ['Wide Device Compatibility', `Compatible with 100+ eSIM-enabled smartphones including iPhone XS and later, Samsung Galaxy S20+, Google Pixel 3 and beyond. Dual SIM support means your local number stays active while you browse on the ${product.country} eSIM plan.`],
                  ['Hotspot & Tethering', `Turn your phone into a personal Wi-Fi hotspot and share your data connection with travel companions, tablets, or laptops. Ideal for families, couples, or small groups travelling together in ${product.country}.`],
                ].map(([label, desc]) => (
                  <li key={label} className="flex items-start gap-4">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-gold" strokeWidth={2.5} />
                    <span className="text-[15px] leading-[1.8] text-navy/85"><span className="font-bold text-navy">{label}:</span> {desc}</span>
                  </li>
                ))}
              </ul>

              <h3 className="mb-6 text-[19px] font-bold text-navy">Things to Know About {product.country} eSIMs</h3>
              <div className="space-y-8">
                {[
                  {
                    q: `How does the ${product.country} eSIM work exactly?`,
                    a: `The ${product.country} eSIM works by digitally embedding a mobile plan onto your device — no physical SIM card needed. After purchasing, you receive a QR code. Simply scan it in your phone settings to install the eSIM profile and connect to ${product.operator || 'local networks'} immediately upon arrival. Hotspot and tethering are fully supported, and you can top up or add additional data through the Klook app if your data runs out mid-trip.`,
                  },
                  {
                    q: `Is a ${product.country} eSIM worth it compared to local SIM cards or roaming?`,
                    a: `Absolutely — a ${product.country} eSIM is one of the smartest choices for travellers. Unlike local SIM cards, there's no need to find a store upon arrival, and unlike roaming, there are no sky-high per-MB charges. With Klook's ${product.country} eSIM, you get transparent flat-rate pricing, immediate activation, and the freedom to keep your home SIM active for calls and texts. For solo travellers, couples, or families, it offers unbeatable value and convenience.`,
                  },
                  {
                    q: `Can I keep my primary phone number while using the ${product.country} eSIM?`,
                    a: `Yes — this is one of the greatest advantages of eSIM technology. Because modern smartphones support Dual SIM (physical + eSIM), your home SIM card stays active in your device the entire time. You continue to receive calls and texts on your home number, while using the ${product.country} eSIM plan for all mobile data. You can set the eSIM as the default for data while keeping your primary SIM for calls — all in one device, no swapping needed.`,
                  },
                  {
                    q: `What devices are compatible with this ${product.country} eSIM?`,
                    a: `eSIM is supported on a wide range of modern devices: iPhone XS / XS Max / XR and all newer models, Samsung Galaxy S20 series and above, Google Pixel 3 and above, as well as many recent models from Huawei, Motorola, and others. To check compatibility, go to Settings → General → About → look for "Available SIM" or "eSIM". Devices bought in mainland China or some carrier-locked phones may not support eSIM — always verify before purchase.`,
                  },
                  {
                    q: `What happens if I use all my data? Can I top up?`,
                    a: `If you exhaust your data allowance, you have two easy options: purchase a new eSIM plan through the Klook app and install it alongside your existing one, or switch to an Unlimited plan if available. For Unlimited plans, after reaching the daily high-speed threshold (${isJapanEsim ? '10GB/day' : 'the specified limit'}), speeds are reduced to ${product.validity?.includes('Unlimited') ? '128 kbps' : 'lower speeds'} but you remain connected. We recommend monitoring your usage through your phone's built-in data tracker.`,
                  },
                ].map((item, idx) => (
                  <div key={idx} className="rounded-[18px] border border-navy/8 bg-white px-10 pt-10 pb-10 shadow-[0_4px_18px_rgba(11,27,43,0.07)]">
                    <p className="mb-4 flex items-start gap-3 text-[16px] font-bold text-navy">
                      <span className="font-[var(--font-playfair)] text-[20px] font-bold leading-none text-gold shrink-0">{idx + 1}.</span>
                      {item.q}
                    </p>
                    <p className="text-[15px] font-medium leading-[1.9] text-navy/80">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ─── TERMS ─── */}
            <section id="terms" className="mt-16 hlt-card-enter">
              <h2 className="mb-8 font-[var(--font-playfair)] text-[28px] font-bold leading-tight text-navy md:text-[32px]">
                Terms &amp; Conditions
              </h2>
              <div className="overflow-hidden rounded-[16px] border border-navy/10 bg-white px-8 py-6 shadow-[0_4px_20px_rgba(11,27,43,0.07)]">
                <h3 className="mb-3 text-[17px] font-bold text-navy">Cancellation policy</h3>
                <p className="text-[15px] font-medium leading-[1.85] text-navy/80">Enjoy free cancellation within 180 days from booking confirmation date provided that data usage has not commenced.</p>
              </div>
            </section>

            {/* ─── HOW TO USE ─── */}
            <section id="how-to-use" className="mt-16 hlt-card-enter">
              <h2 className="mb-2 font-[var(--font-playfair)] text-[28px] font-bold leading-tight text-navy md:text-[32px]">How to use</h2>
              <p className="mb-10 text-[15px] font-medium text-navy/55">Complete setup guide — from purchase to browsing in {product.country}</p>

              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-[21px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-gold via-gold/40 to-gold/10" />

                <div className="space-y-10">
                  {[
                    {
                      title: 'Check Device Compatibility',
                      desc: `Before purchasing, confirm your device supports eSIM. On iPhone: Settings → General → About → scroll down to "Available SIM" or "eSIM". On Android: Settings → Connections → SIM Card Manager → look for "Add eSIM" or "Download SIM". Most iPhone XS (2018) and newer, Samsung Galaxy S20+, and Google Pixel 3+ support eSIM. Note: devices purchased in mainland China or carrier-locked phones may not support eSIM.`,
                      tip: 'You can run both your home SIM and the eSIM simultaneously — no need to remove your existing SIM card.',
                    },
                    {
                      title: 'Purchase & Receive Your eSIM',
                      desc: `Select your preferred data package (daily GB limit or total data), validity period, and complete payment. Your eSIM QR code will be delivered instantly to your email and also accessible via the Klook app under Account → Bookings. No need to wait — setup can begin immediately after purchase.`,
                      tip: 'We recommend purchasing at least 1–2 days before your trip to set up at home on a stable Wi-Fi connection.',
                    },
                    {
                      title: 'Install the eSIM via QR Code',
                      desc: `Open the Klook app → Account → Bookings → find your eSIM booking → tap "Activate". Alternatively, go to Settings → Cellular (iPhone) or SIM Card Manager (Android) → Add eSIM → Scan QR code. Stay on the same screen and do not close the app during installation. This process requires a stable Wi-Fi connection and takes 1–3 minutes.`,
                      tip: `If QR scan fails, tap "Enter details manually" and input the SM-DP+ address and activation code from your voucher.`,
                    },
                    {
                      title: 'Configure eSIM as Your Data Line',
                      desc: `After installation your phone will prompt you to configure the new eSIM. Label it "${product.country} eSIM" for easy identification. Set it as your Default Data Line while keeping your home SIM for calls and texts. On iPhone: Settings → Cellular → select the eSIM line → enable "Turn on this line". On Android: Settings → Connections → SIM Card Manager → set eSIM as Mobile Data.`,
                      tip: 'Keep your home SIM as default for calls and texts. Only switch data to the eSIM to avoid unexpected charges on your home plan.',
                    },
                    {
                      title: 'Activate Data Roaming Upon Arrival',
                      desc: `Once you land in ${product.country}, enable Data Roaming for the eSIM line. On iPhone: Settings → Cellular → select the ${product.country} eSIM line → turn on "Data Roaming". On Android: Settings → Connections → Mobile Networks → Data Roaming → enable. Your device will automatically connect to ${product.operator || 'local carriers'} within seconds — you'll see the carrier name in the status bar.`,
                      tip: `If you don't connect automatically, toggle Airplane Mode on and off, or manually select the network under Settings → Carrier.`,
                    },
                    {
                      title: 'Monitor Usage & Troubleshoot',
                      desc: `Track usage under Settings → Cellular → select the eSIM line → Current Period data (reset at trip start). If issues arise: (1) Confirm Data Roaming is ON for the eSIM line. (2) Ensure the eSIM — not your home SIM — is set as active data line. (3) Toggle Airplane Mode. (4) For persistent issues, contact support via Klook app: Account → Bookings → your booking → "Contact Merchant".`,
                      tip: 'For Unlimited plans, speed reduces to 128 kbps after the daily 10 GB threshold — still works for maps and messaging.',
                    },
                  ].map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-7">
                      {/* Gold badge */}
                      <div className="relative z-10 flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-dark shadow-[0_6px_18px_rgba(200,169,106,0.45)]">
                        <span className="font-[var(--font-playfair)] text-[15px] font-bold text-white">{idx + 1}</span>
                      </div>

                      {/* Card */}
                      <div className="flex-1 px-4 py-1">
                        <h3 className="mb-4 text-[17px] font-bold text-navy">{step.title}</h3>
                        <p className="mb-6 text-[15px] font-medium leading-[1.9] text-navy/80">{step.desc}</p>
                        <div className="flex items-start gap-3 rounded-[12px] bg-[linear-gradient(135deg,#fffaf1_0%,#f4ead8_100%)] px-5 py-4 ring-1 ring-gold/25">
                          <Lightbulb className="mt-0.5 h-[15px] w-[15px] shrink-0 text-gold" />
                          <p className="text-[13px] font-semibold leading-[1.7] text-gold-dark">{step.tip}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ─── ADDITIONAL INFO ─── */}
            <section id="additional-info" className="mt-16 hlt-card-enter">
              <h2 className="mb-5 font-[var(--font-playfair)] text-[28px] font-bold leading-tight text-navy md:text-[32px]">Additional information</h2>
              <p className="text-[16px] font-medium leading-[1.8] text-navy">For connection issues, please contact merchant via the following steps: Account &gt; Bookings &gt; eSIM booking &gt; Top right contact merchant.</p>
            </section>

            {/* ─── FAQS ─── */}
            <SimFaqAccordion faqs={DEFAULT_FAQS} title={`${product.title.split('|')[0].trim()} FAQs`} />
          </div>

          {/* ─── STICKY SIDEBAR ─── */}
          <aside className="hidden md:block md:sticky md:top-[108px] md:self-start md:pt-8">
            <div className="overflow-hidden rounded-[24px] border border-navy/10 bg-white shadow-[0_16px_48px_rgba(11,27,43,0.12)]">
              {/* Gold accent strip */}
              <div className="h-[5px] w-full bg-gradient-to-r from-gold/50 via-gold to-gold/50" />

              <div className="px-10 pb-10 pt-8">
                {/* From label */}
                <div className="text-[13px] font-semibold uppercase tracking-[0.12em] text-navy/60">Starting from</div>

                {/* Price */}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-[18px] font-semibold text-navy/70">US$</span>
                  <span className="font-[var(--font-playfair)] text-[52px] font-bold leading-none tracking-tight text-navy">{price.toFixed(2)}</span>
                </div>
                <div className="mt-2 text-[13px] font-medium text-navy/60">per person / per day</div>

                {/* Divider */}
                <div className="my-7 border-t border-navy/10" />

                {/* CTA Button */}
                <button type="button" className="block w-full rounded-[16px] bg-gradient-to-b from-gold to-gold-dark px-6 py-[18px] text-center text-[15px] font-bold uppercase tracking-[0.1em] text-white shadow-[0_6px_20px_rgba(157,122,61,0.35)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(157,122,61,0.45)]">
                  Select Options
                </button>

                {/* Trust text */}
                <p className="mt-5 text-center text-[13px] font-medium text-navy/55">Free cancellation · Instant confirmation</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function OptionGroup({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mb-5">
      <h4 className="mb-2 text-[13px] font-medium text-navy/50">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <button key={item} type="button" className="rounded-[8px] border border-navy/12 bg-white px-3.5 py-2 text-[13px] text-navy/80 transition duration-150 hover:-translate-y-0.5 hover:border-gold hover:text-gold-dark hover:shadow-[0_4px_12px_rgba(200,169,106,0.15)]">
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-2 border-b border-navy/7 px-10 py-6 last:border-b-0">
      <div className="text-[14px] font-semibold text-gold-dark/85">{label}</div>
      <div className="text-[15px] font-medium text-navy">{value}</div>
    </div>
  );
}

function ExploreBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 text-[18px] font-semibold text-navy">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span key={`${title}-${item}`} className="rounded-[8px] border border-gold/30 bg-white px-3 py-1.5 text-[12px] text-navy/70 transition duration-150 hover:-translate-y-0.5 hover:border-gold hover:text-gold-dark hover:shadow-[0_4px_12px_rgba(200,169,106,0.16)]">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
