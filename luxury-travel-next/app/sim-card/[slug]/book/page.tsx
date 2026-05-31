import { notFound } from 'next/navigation';
import rawProducts from '@/data/klook-raw-products.json';
import detailProducts from '@/data/klook-detail-data.json';
import SimBookForm from '@/components/sim-book-form';
import { Section } from '@/components/layout/container';
import { Eyebrow, Heading, Lead } from '@/components/ui/typography';

type RawProduct = {
  id: number;
  title: string;
  score: number;
  reviews: number;
  country: string;
  price: string;
  speed: string;
  operator?: string;
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
  packages: DetailPackage[];
};

const PRODUCT_LIST = rawProducts as RawProduct[];
const DETAIL_LIST = detailProducts as DetailProduct[];
const DETAIL_BY_ID = new Map(DETAIL_LIST.map(item => [item.id, item]));

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ pkgId?: string; price?: string; pkg?: string }>;
};

export default async function SimBookPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { pkgId, price, pkg: pkgName } = await searchParams;

  const productId = parseInt(slug.split('-')[0]);
  const product = PRODUCT_LIST.find(p => p.id === productId);
  if (!product) notFound();

  const detail = DETAIL_BY_ID.get(productId);
  const selectedPackage = pkgId && detail
    ? detail.packages.find(p => p.id === parseInt(pkgId))
    : null;

  const packageName = selectedPackage?.name ?? pkgName ?? '';
  const packagePrice = selectedPackage?.sellPrice ?? price ?? '';

  // Parse package dimensions from name (e.g. "Data in total · 7 days · 5GB · Data only")
  const parts = packageName.split(' · ');
  const packageData = parts[2] ?? '';
  const packageValidity = parts[1] ?? '';

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,rgba(200,169,106,0.16),transparent_30%),linear-gradient(180deg,#07121e_0px,#0b1b2b_88px,#f8f5ef_88px,#f3e8d7_100%)] pt-[88px]">
      <Section width="page" className="no-safe-top pb-[96px] !pt-6 md:!pt-8">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="mx-auto max-w-[820px] text-center">
            <Eyebrow>eSIM Service</Eyebrow>
            <Heading level={1} className="mt-3 !text-[clamp(38px,4.7vw,60px)] text-navy">Japan eSIM Booking</Heading>
            <Lead className="mx-auto mt-5 max-w-[680px]">
              Fast eSIM delivery with no physical SIM required. Complete your order and receive your QR code via email within minutes.
            </Lead>
          </div>
          <div className="mx-auto mt-10 w-full max-w-[1060px]">
        <SimBookForm
          productId={productId}
          productTitle={product.title}
          productSlug={slug}
          productOperator={product.operator ?? product.speed}
          productScore={product.score}
          productReviews={product.reviews}
          packageName={packageName}
          packagePrice={packagePrice}
          packageData={packageData}
          packageValidity={packageValidity}
        />
          </div>
        </div>
      </Section>
    </main>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const productId = parseInt(slug.split('-')[0]);
  const product = PRODUCT_LIST.find(p => p.id === productId);
  return {
    title: product ? `Book ${product.title.split('|')[0].trim()} | Ha Long Luxury Travel` : 'Book SIM Card',
  };
}
