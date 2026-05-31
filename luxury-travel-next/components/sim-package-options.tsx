'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Check, Tag, ChevronDown, ChevronUp } from 'lucide-react';

interface RawPackage {
  id: number;
  name: string;
  sellPrice: string;
  marketPrice?: string;
  hasDiscount?: boolean;
}

interface SimPackageOptionsProps {
  packageTypeOptions?: string[];
  validityOptions?: string[];
  dataOptions?: string[];
  serviceOptions?: string[];
  rawPackages?: RawPackage[];
  productSlug?: string;
}

// Sort validity strings by day count
function sortValidity(v: string[]): string[] {
  return [...v].sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0));
}

// Sort data size: 500MB < 1GB < 3GB < ... < Unlimited last
function sortData(d: string[]): string[] {
  const mbVal = (s: string) => {
    if (s === 'Unlimited') return 999_999;
    if (s.endsWith('GB')) return parseFloat(s) * 1024;
    if (s.endsWith('MB')) return parseFloat(s);
    return 0;
  };
  return [...d].sort((a, b) => mbVal(a) - mbVal(b));
}

function OptionGroup({
  title,
  allItems,
  availableItems,
  selected,
  onSelect,
}: {
  title: string;
  allItems: string[];
  availableItems: Set<string>;
  selected: string | null;
  onSelect: (item: string) => void;
}) {
  if (!allItems.length) return null;

  const cols =
    allItems.length <= 2 ? 'grid-cols-2' :
    allItems.length <= 4 ? 'grid-cols-2 sm:grid-cols-4' :
    'grid-cols-3 sm:grid-cols-4';

  return (
    <div className="mb-10 last:mb-0">
      <h4 className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-gold-dark">{title}</h4>
      <div className={`grid gap-3 ${cols}`}>
        {allItems.map((item, index) => {
          const isSelected = selected === item;
          const isAvailable = availableItems.has(item);
          return (
            <button
              key={item}
              type="button"
              disabled={!isAvailable}
              onClick={() => isAvailable && onSelect(isSelected ? '' : item)}
              className={[
                'group relative min-h-[58px] overflow-hidden rounded-[18px] border px-4 py-3 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/65',
                isSelected
                  ? 'border-gold/70 bg-[linear-gradient(135deg,#0b1b2b_0%,#132b40_100%)] shadow-[0_12px_32px_rgba(11,27,43,0.20)]'
                  : isAvailable
                    ? 'border-navy/10 bg-[linear-gradient(180deg,#fffaf1_0%,#f4ead8_100%)] shadow-[0_4px_12px_rgba(11,27,43,0.05)] hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-[0_10px_24px_rgba(11,27,43,0.09)] active:scale-[0.992]'
                    : 'cursor-not-allowed border-navy/6 bg-navy/[0.025] opacity-40',
              ].join(' ')}
            >
              {/* decorative circle */}
              {(isSelected || isAvailable) && (
                <span className={['pointer-events-none absolute -right-5 -top-7 h-16 w-16 rounded-full border transition duration-500', isSelected ? 'border-gold/25 bg-gold/[0.08]' : 'border-gold/0 group-hover:border-gold/15'].join(' ')} />
              )}
              <span className="relative flex items-center gap-2.5">
                <span className={[
                  'grid h-[24px] w-[24px] shrink-0 place-items-center rounded-full border text-[9px] font-black leading-none tracking-[0.06em] transition duration-200',
                  isSelected
                    ? 'border-gold/35 bg-gold text-navy shadow-[0_4px_10px_rgba(200,169,106,0.3)]'
                    : isAvailable
                      ? 'border-gold/28 bg-gold/[0.10] text-gold-dark group-hover:border-gold/55'
                      : 'border-navy/15 bg-transparent text-navy/30',
                ].join(' ')}>
                  {isSelected ? <Check className="h-[11px] w-[11px] stroke-[3]" /> : String(index + 1).padStart(2, '0')}
                </span>
                <span className={['text-[13px] font-semibold leading-tight', isSelected ? 'text-pearl' : isAvailable ? 'text-navy' : 'text-navy/35'].join(' ')}>
                  {item}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function SimPackageOptions({ rawPackages = [], productSlug = '' }: SimPackageOptionsProps) {
  // Parse all packages into structured dimensions
  const parsed = useMemo(() => rawPackages.map(pkg => {
    const parts = pkg.name.split(' · ');
    return { ...pkg, type: parts[0] ?? '', validity: parts[1] ?? '', data: parts[2] ?? '', service: parts[3] ?? '' };
  }), [rawPackages]);

  // All unique sorted options
  const allTypes = useMemo(() => [...new Set(parsed.map(p => p.type))].sort(), [parsed]);
  const allValidities = useMemo(() => sortValidity([...new Set(parsed.map(p => p.validity))]), [parsed]);
  const allData = useMemo(() => sortData([...new Set(parsed.map(p => p.data))]), [parsed]);
  const allServices = useMemo(() => [...new Set(parsed.map(p => p.service))].sort(), [parsed]);

  const [type, setType] = useState<string | null>(null);
  const [validity, setValidity] = useState<string | null>(null);
  const [data, setData] = useState<string | null>(null);
  const [service, setService] = useState<string | null>('Data only');
  const [showPackages, setShowPackages] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);

  // Compute available options per dimension, given other current selections
  const getAvailable = (dim: 'type' | 'validity' | 'data' | 'service', others: { type: string | null; validity: string | null; data: string | null; service: string | null }) => {
    return new Set(parsed.filter(p =>
      (!others.type || p.type === others.type) &&
      (!others.validity || p.validity === others.validity) &&
      (!others.data || p.data === others.data) &&
      (!others.service || p.service === others.service)
    ).map(p => p[dim]));
  };

  const availableTypes = getAvailable('type', { type: null, validity, data, service });
  const availableValidities = getAvailable('validity', { type, validity: null, data, service });
  const availableData = getAvailable('data', { type, validity, data: null, service });
  const availableServices = getAvailable('service', { type, validity, data, service: null });

  // Cascading reset: when type changes, clear validity/data if they no longer match
  const handleTypeSelect = (v: string) => {
    const newType = v || null;
    setType(newType);
    const stillValid = parsed.filter(p => (!newType || p.type === newType) && (!service || p.service === service));
    if (validity && !stillValid.some(p => p.validity === validity)) setValidity(null);
    if (data && !stillValid.some(p => p.data === data)) setData(null);
  };
  const handleValiditySelect = (v: string) => {
    const newValidity = v || null;
    setValidity(newValidity);
    const stillValid = parsed.filter(p => (!type || p.type === type) && (!newValidity || p.validity === newValidity) && (!service || p.service === service));
    if (data && !stillValid.some(p => p.data === data)) setData(null);
  };
  const handleDataSelect = (v: string) => setData(v || null);
  const handleServiceSelect = (v: string) => setService(v || null);

  // Find exact matched package
  const matchedPackage = useMemo(() => {
    if (!type || !validity || !data || !service) return null;
    return parsed.find(p => p.type === type && p.validity === validity && p.data === data && p.service === service) || null;
  }, [parsed, type, validity, data, service]);

  // Apply a full package from the discounts list → update all filter buttons
  const applyPackage = (pkg: typeof parsed[0] | undefined) => {
    if (!pkg) return;
    setType(pkg.type);
    setValidity(pkg.validity);
    setData(pkg.data);
    setService(pkg.service);
    setSelectedPackageId(pkg.id);
  };

  const handleOK = () => {
    setShowPackages(false);
  };

  const clearAll = () => { setType(null); setValidity(null); setData(null); setService('Data only'); setShowPackages(false); setSelectedPackageId(null); };
  const hasSelection = type || validity || data || showPackages;

  // Sorted packages for the list view
  const sortedPackages = [...rawPackages].sort((a, b) => parseFloat(a.sellPrice) - parseFloat(b.sellPrice));

  return (
    <div className="overflow-hidden rounded-[20px] border border-navy/8 bg-white shadow-[0_8px_32px_rgba(11,27,43,0.08)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-navy/8 px-8 py-6">
        <h3 className="text-[18px] font-bold text-navy">Select options</h3>
        {hasSelection && (
          <button type="button" onClick={clearAll} className="rounded-[8px] border border-gold/40 px-4 py-1.5 text-[13px] font-semibold text-gold-dark transition hover:bg-gold/10">
            Clear all
          </button>
        )}
      </div>

      <div className="px-8 pb-10 pt-8">
        {/* Packages list toggle */}
        <button
          type="button"
          onClick={() => setShowPackages(v => !v)}
          className={['mb-10 flex w-full items-center justify-between rounded-[18px] border px-7 py-5 transition-all duration-200', showPackages ? 'border-gold/60 bg-gold/8 shadow-[0_6px_20px_rgba(200,169,106,0.18)]' : 'border-navy/12 bg-[linear-gradient(180deg,#fffaf1_0%,#f4ead8_100%)] shadow-[0_4px_14px_rgba(11,27,43,0.05)] hover:border-gold/45 hover:shadow-[0_8px_24px_rgba(11,27,43,0.08)]'].join(' ')}
        >
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 rounded-[8px] bg-gold px-4 py-2 text-[13px] font-black text-navy shadow-[0_4px_12px_rgba(200,169,106,0.25)]">
              <Tag className="h-4 w-4" />
              Discounts
            </span>
            <span className="text-[15px] font-semibold text-navy/80">
              {showPackages ? 'Hide all packages' : `See all ${sortedPackages.length} packages with prices`}
            </span>
          </div>
          {showPackages ? <ChevronUp className="h-5 w-5 text-gold" /> : <ChevronDown className="h-5 w-5 text-navy/30" />}
        </button>

        {/* Full package list */}
        {showPackages && sortedPackages.length > 0 && (
          <div className="mb-8 overflow-hidden rounded-[16px] border border-navy/8 bg-white shadow-[0_4px_16px_rgba(11,27,43,0.06)]">
            <div className="border-b border-navy/8 px-6 py-4">
              <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-navy/40">{sortedPackages.length} packages — sorted by price</p>
            </div>
            <div className="max-h-[448px] divide-y divide-navy/6 overflow-y-auto [scrollbar-color:theme(colors.gold/0.4)_transparent] [scrollbar-width:thin]">
              {sortedPackages.map(pkg => {
                const sell = parseFloat(pkg.sellPrice);
                const market = pkg.marketPrice ? parseFloat(pkg.marketPrice) : null;
                const discountPct = market && market > sell ? Math.round(((market - sell) / market) * 100) : null;
                const isSelected = selectedPackageId === pkg.id;
                return (
                  <button key={pkg.id} type="button" onClick={() => { const p = parsed.find(x => x.id === pkg.id); isSelected ? (setType(null), setValidity(null), setData(null), setSelectedPackageId(null)) : applyPackage(p); }} className={['flex w-full items-center gap-4 px-6 py-4 text-left transition-all duration-150', isSelected ? 'bg-gradient-to-r from-gold/[0.06] to-transparent' : 'hover:bg-pearl/60'].join(' ')}>
                    <div className={['flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition', isSelected ? 'border-gold bg-gold' : 'border-navy/25 bg-white'].join(' ')}>
                      {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                    <div className="flex flex-1 items-center justify-between gap-4">
                      <div>
                        <p className={`text-[14px] font-medium leading-snug ${isSelected ? 'text-navy' : 'text-navy/80'}`}>{pkg.name}</p>
                        {market && market > sell && <p className="mt-0.5 text-[12px] text-navy/35 line-through">US${market.toFixed(2)}</p>}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className={`text-[16px] font-bold ${isSelected ? 'text-gold-dark' : 'text-navy'}`}>US${sell.toFixed(2)}</span>
                        {discountPct !== null && discountPct > 5 && <span className="rounded-[5px] bg-gold/15 px-2 py-0.5 text-[11px] font-bold text-gold-dark">{discountPct}% off</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="sticky bottom-0 flex items-center justify-between gap-4 border-t border-navy/8 bg-white px-6 py-4">
              <p className="text-[13px] font-medium text-navy/50">
                {selectedPackageId ? `Selected: US$${parseFloat(sortedPackages.find(p => p.id === selectedPackageId)?.sellPrice ?? '0').toFixed(2)}` : 'Choose a package above'}
              </p>
              <button
                type="button"
                disabled={!selectedPackageId}
                onClick={handleOK}
                className={['rounded-[12px] px-8 py-3 text-[14px] font-bold uppercase tracking-[0.08em] transition-all duration-200', selectedPackageId ? 'bg-gradient-to-b from-gold to-gold-dark text-white shadow-[0_4px_16px_rgba(157,122,61,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(157,122,61,0.45)]' : 'cursor-not-allowed bg-navy/8 text-navy/30'].join(' ')}
              >
                OK
              </button>
            </div>
          </div>
        )}

        <OptionGroup title="Package type" allItems={allTypes} availableItems={availableTypes} selected={type} onSelect={handleTypeSelect} />
        <OptionGroup title="SIM card validity" allItems={allValidities} availableItems={availableValidities} selected={validity} onSelect={handleValiditySelect} />
        <OptionGroup title="Data package" allItems={allData} availableItems={availableData} selected={data} onSelect={handleDataSelect} />
        <OptionGroup title="Service type" allItems={allServices} availableItems={availableServices} selected={service} onSelect={handleServiceSelect} />

        {/* Matched package price display */}
        {matchedPackage && (
          <div className="mt-8 overflow-hidden rounded-[18px] border-2 border-gold/50 bg-gradient-to-br from-[#fffdf8] to-white shadow-[0_8px_28px_rgba(200,169,106,0.22)]">
            <div className="px-8 py-6">
              <p className="mb-1 text-[12px] font-black uppercase tracking-[0.14em] text-gold-dark/70">Selected package</p>
              <p className="text-[14px] font-medium text-navy/70">{matchedPackage.name}</p>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-[13px] font-semibold text-navy/55">US$</span>
                <span className="font-[var(--font-playfair)] text-[42px] font-bold leading-none tracking-tight text-navy">{parseFloat(matchedPackage.sellPrice).toFixed(2)}</span>
                {matchedPackage.marketPrice && parseFloat(matchedPackage.marketPrice) > parseFloat(matchedPackage.sellPrice) && (
                  <div className="flex flex-col">
                    <span className="text-[13px] text-navy/35 line-through">US${parseFloat(matchedPackage.marketPrice).toFixed(2)}</span>
                    <span className="rounded-[5px] bg-gold/20 px-2 py-0.5 text-[11px] font-bold text-gold-dark">
                      {Math.round(((parseFloat(matchedPackage.marketPrice) - parseFloat(matchedPackage.sellPrice)) / parseFloat(matchedPackage.marketPrice)) * 100)}% off
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-gold/20 px-8 pb-7">
              <Link
                href={`/sim-card/${productSlug}/book?pkgId=${matchedPackage.id}&price=${matchedPackage.sellPrice}&pkg=${encodeURIComponent(matchedPackage.name)}`}
                className="mt-5 block w-full rounded-[14px] bg-gradient-to-b from-gold to-gold-dark py-4 text-center text-[15px] font-bold uppercase tracking-[0.08em] text-white shadow-[0_6px_20px_rgba(157,122,61,0.38)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(157,122,61,0.50)]"
              >
                Book now \u2014 US${parseFloat(matchedPackage.sellPrice).toFixed(2)}
              </Link>
            </div>
          </div>
        )}

        {/* CTA when partial selection but no match */}
        {!matchedPackage && (type || validity || data) && (
          <div className="mt-8 border-t border-navy/8 pt-6">
            <p className="mb-4 text-center text-[13px] font-medium text-navy/50">
              {!type ? 'Select a package type to continue' : !validity ? 'Select validity to continue' : 'Select a data package to see price'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


