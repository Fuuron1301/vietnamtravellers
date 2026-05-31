'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, ChevronLeft, ChevronRight, Search, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import rawProducts from '@/data/klook-raw-products.json';

type RawProduct = {
  id: number;
  title: string;
  score: number;
  reviews: number;
  country: string;
  countryCode: string;
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
  category: number;
};

type ProductCategory = 'esim' | 'sim-card';

type CatalogProduct = {
  id: string;
  title: string;
  category: ProductCategory;
  country: string;
  image: string;
  rating: number;
  reviews: number;
  booked: string;
  validity: string;
  speed: string;
  serviceType: string;
  coverage: string;
  operator?: string;
  priceFrom: number;
  priceUnit: string;
  detailUrl: string;
  sellingPoints: string[];
};

const ITEMS_PER_PAGE = 10;
const rawList = rawProducts as RawProduct[];

function toCategory(category: number): ProductCategory {
  return category === 206 ? 'sim-card' : 'esim';
}

function normalizeCountry(country: string, title: string, coverage: string): string {
  if (country && country !== 'Unpublish') return country;
  const source = `${title} ${coverage}`.toLowerCase();
  if (source.includes('japan')) return 'Japan';
  if (source.includes('korea')) return 'South Korea';
  if (source.includes('hong kong')) return 'Hong Kong';
  if (source.includes('taiwan')) return 'Taiwan';
  if (source.includes('thailand')) return 'Thailand';
  if (source.includes('vietnam')) return 'Vietnam';
  if (source.includes('singapore')) return 'Singapore';
  if (source.includes('malaysia')) return 'Malaysia';
  if (source.includes('indonesia') || source.includes('bali')) return 'Indonesia';
  if (source.includes('europe')) return 'Europe';
  if (source.includes('global') || source.includes('worldwide')) return 'Global';
  return 'Multi-Country';
}

function buildSellingPoints(product: RawProduct): string[] {
  const points = ['Instant confirmation'];
  if (product.category === 206) {
    points.push('Book now for today');
    return points;
  }

  if (/data only/i.test(product.serviceType) || /esim/i.test(product.title)) {
    points.push('Book now for today');
  } else {
    points.push('Easy confirmation');
  }

  return points;
}

const SIM_PRODUCTS: CatalogProduct[] = rawList
  .map(product => {
    const id = String(product.id);
    const country = normalizeCountry(product.country, product.title, product.coverage);
    return {
      id,
      title: product.title.replace(/\s+/g, ' ').trim(),
      category: toCategory(product.category),
      country,
      image: `/images/sim/${product.imageKey}`,
      rating: product.score || 0,
      reviews: product.reviews || 0,
      booked: product.booked || '',
      validity: product.validity || 'Flexible validity',
      speed: product.speed || '4G LTE',
      serviceType: product.serviceType || 'Data only',
      coverage: product.coverage || country,
      operator: product.operator,
      priceFrom: Number.parseFloat(product.price) || 0,
      priceUnit: product.priceUnit || 'per SIM card',
      detailUrl: `/sim-card/${id}-${product.urlSeo}`,
      sellingPoints: buildSellingPoints(product),
    };
  });

function getVisiblePageNumbers(currentPage: number, totalPages: number) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (currentPage <= 4) return [1, 2, 3, 4, 5, 'ellipsis', totalPages] as const;
  if (currentPage >= totalPages - 3) return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as const;
  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages] as const;
}

function formatReviews(value: number) {
  return value.toLocaleString();
}

function formatBooked(value: string) {
  return value.replace(/\s*booked/i, '').trim();
}

function ProductCard({ product }: { product: CatalogProduct }) {
  return (
    <article className="border-b border-navy/8 py-8 last:border-b-0 md:py-10">
      <div className="grid gap-x-6 gap-y-6 sm:grid-cols-[178px_minmax(0,1fr)] md:grid-cols-[268px_minmax(0,1fr)_188px] md:items-start md:gap-x-10 md:gap-y-7">
        <Link href={product.detailUrl} className="block">
          <div className="relative overflow-hidden rounded-[14px] bg-[#eef2f5] ring-1 ring-gold/12">
            <Image
              src={product.image}
              alt={product.title}
              width={440}
              height={250}
              quality={96}
              sizes="(max-width: 479px) 100vw, (max-width: 767px) 178px, 268px"
              loading={product.id === SIM_PRODUCTS[0]?.id ? 'eager' : undefined}
              className="h-[208px] w-full object-cover sm:h-[138px] md:h-[152px]"
            />
          </div>
        </Link>

        <div className="min-w-0 sm:pt-0.5 md:pt-[4px]">
          <h2 className="text-[20px] font-extrabold leading-[1.28] tracking-[-0.02em] text-navy sm:text-[17px] md:text-[22px]">{product.title}</h2>

          <div className="mt-4 flex flex-wrap items-center gap-x-7 gap-y-2.5 text-[13px] text-[#188b68] md:text-[13px]">
            {product.sellingPoints.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 whitespace-nowrap">
                <Check className="h-3.5 w-3.5 stroke-[2.2]" />
                <span>{tag}</span>
              </span>
            ))}
          </div>

          <div className="mt-5 space-y-2 text-[14px] leading-7 text-navy/62 sm:text-[13px] md:text-[14px]">
            <p><span className="text-navy/78">Validity:</span> {product.validity}</p>
            <p><span className="text-navy/78">Internet speed:</span> {product.speed}</p>
            <p><span className="text-navy/78">Service type:</span> {product.serviceType}</p>
            <p>
              <span className="text-navy/78">Coverage area:</span>{' '}
              <span>{product.coverage}</span>{' '}
              <Link href={`${product.detailUrl}#product-details`} className="font-semibold text-gold hover:underline">
                See more
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-end justify-between gap-7 sm:col-span-2 sm:items-center md:col-span-1 md:flex-col md:items-end md:justify-start md:gap-3 md:pt-2">
          <div className="order-2 flex flex-col items-start sm:order-1 md:order-none md:items-end">
            <div className="mb-5 flex flex-wrap items-center gap-1.5 text-[14px] text-navy/56 md:mb-8 md:justify-end">
              <Star className="h-4 w-4 fill-gold text-gold" />
              <span className="font-semibold text-gold">{product.rating.toFixed(1)}</span>
              <span>({formatReviews(product.reviews)} reviews)</span>
              <span className="mx-1 text-navy/24">|</span>
              <span>{formatBooked(product.booked)} booked</span>
            </div>

            <div className="text-left md:text-right">
              <div className="inline-flex items-center gap-1.5 text-[30px] font-extrabold leading-none text-navy sm:text-[24px] md:text-[28px]">
                <Zap className="h-4 w-4 fill-gold text-gold md:h-4 md:w-4" />
                <span>US${product.priceFrom.toFixed(2)}</span>
              </div>
              <div className="mt-2.5 text-[13px] text-navy/56 md:text-[13px]">{product.priceUnit}</div>
            </div>
          </div>

          <Link
            href={product.detailUrl}
            className="order-1 inline-flex h-[46px] min-w-[162px] items-center justify-center rounded-[8px] bg-gold px-6 text-[13px] font-extrabold uppercase tracking-[0.05em] text-navy transition hover:-translate-y-0.5 hover:bg-pearl sm:order-2 sm:h-[44px] sm:min-w-[152px] sm:text-[12px] md:mt-6 md:h-[46px] md:min-w-[168px] md:text-[13px]"
          >
            See details
          </Link>
        </div>
      </div>
    </article>
  );
}

export function SimCardCatalog() {
  const [category, setCategory] = useState<'all' | ProductCategory>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SIM_PRODUCTS.filter(product => {
      if (category !== 'all' && product.category !== category) return false;
      if (!q) return true;
      return (
        product.title.toLowerCase().includes(q) ||
        product.country.toLowerCase().includes(q) ||
        product.coverage.toLowerCase().includes(q) ||
        (product.operator || '').toLowerCase().includes(q)
      );
    });
  }, [category, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const visiblePageNumbers = getVisiblePageNumbers(currentPage, totalPages);

  function resetAndSet(next: () => void) {
    next();
    setPage(1);
  }

  return (
    <div className="space-y-0 font-[var(--font-manrope)] text-navy">
      <div
        className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(115deg,rgba(11,27,43,0.76),rgba(11,27,43,0.34)),url('/images/hubs/vietnam-trang-an-river-4k.jpg')] bg-cover bg-center shadow-[0_24px_60px_rgba(11,27,43,0.18)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_24%,rgba(200,169,106,0.24),transparent_26%)]" />
        <div className="mx-auto max-w-[1360px] px-6 py-10 md:px-10 md:py-14">
          <div className="relative mx-auto max-w-[640px] text-pearl md:ml-[280px] md:mr-auto">
            <h1 className="text-[34px] font-extrabold leading-none tracking-[-0.04em] md:text-[48px]">Wifi & SIM cards</h1>
            <p className="mt-3 text-[14px] text-pearl/82 md:text-[15px]">Compare plans and find a reliable connection for your destination</p>
            <div className="mt-5">
              <input
                type="text"
                value={query}
                onChange={event => resetAndSet(() => setQuery(event.target.value))}
                placeholder="Where to?"
                className="h-[50px] w-full rounded-[14px] border border-pearl/15 bg-pearl px-4 text-[14px] text-navy outline-none shadow-[0_16px_34px_rgba(6,21,33,0.18)] placeholder:text-navy/38"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1120px] px-4 py-5 sm:px-5 md:px-0 md:py-6">
        <div className="mb-4 text-[12px] text-navy/44">
          <span className="font-semibold text-gold">Home</span>
          <span className="mx-1.5 text-navy/24">&gt;</span>
          <span>All</span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="relative w-full sm:w-[316px]">
            <select
              value={category}
              onChange={event => resetAndSet(() => setCategory(event.target.value as 'all' | ProductCategory))}
              className="h-[42px] w-full appearance-none rounded-[14px] border border-gold/20 bg-white px-4 pr-10 text-[13px] text-navy outline-none shadow-[0_10px_24px_rgba(11,27,43,0.05)]"
            >
              <option value="all">All</option>
              <option value="esim">eSIM</option>
              <option value="sim-card">SIM card</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-navy/38">⌄</span>
          </div>

          <div className="text-right text-[13px] text-navy/44 sm:text-right">
            <span className="font-semibold text-navy">{filtered.length}</span> results
          </div>
        </div>

        <div className="overflow-hidden bg-transparent">
          {visible.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}

          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-[14px] text-navy/44">No SIM products matched the current filters.</div>
          ) : null}
        </div>

        {filtered.length > ITEMS_PER_PAGE ? (
          <div className="flex justify-center pb-4 pt-10 sm:pt-12">
            <div className="inline-flex flex-wrap items-center justify-center gap-2.5 rounded-[32px] border border-gold/18 bg-white px-6 py-[18px] shadow-[0_24px_64px_rgba(11,27,43,0.11)]">
            <button
              type="button"
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="flex h-[50px] w-[50px] items-center justify-center rounded-[14px] border border-gold/16 bg-[#faf7f1] text-navy/48 transition hover:border-gold/36 hover:bg-[#f5f0e6] hover:text-navy disabled:opacity-28"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {visiblePageNumbers.map((entry, index) =>
              entry === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="flex h-[50px] w-[40px] items-center justify-center text-[15px] font-bold tracking-[0.06em] text-navy/30">
                  ···
                </span>
              ) : (
                <button
                  key={entry}
                  type="button"
                  onClick={() => setPage(entry)}
                  aria-label={`Page ${entry}`}
                  aria-current={currentPage === entry ? 'page' : undefined}
                  className={cn(
                    'flex h-[50px] min-w-[50px] items-center justify-center rounded-[14px] border px-4 text-[16px] font-bold transition',
                    currentPage === entry
                      ? 'border-gold bg-gold text-navy shadow-[0_12px_28px_rgba(200,169,106,0.32)]'
                      : 'border-[#ede6d9] bg-white text-navy/55 hover:border-gold/30 hover:bg-[#faf7f1] hover:text-navy'
                  )}
                >
                  {entry}
                </button>
              )
            )}
            <button
              type="button"
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className="flex h-[50px] w-[50px] items-center justify-center rounded-[14px] border border-gold/16 bg-[#faf7f1] text-navy/48 transition hover:border-gold/36 hover:bg-[#f5f0e6] hover:text-navy disabled:opacity-28"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
