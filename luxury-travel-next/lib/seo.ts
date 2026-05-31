import { CmsItem } from './types';
import { tourPath } from './routing';

export const site = {
  name: 'Ha Long Luxury Travel',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  // 55 chars title-safe, 158 chars description
  description: 'Luxury tailor-made tours in Vietnam, Laos, Cambodia & Thailand. Private Ha Long Bay cruises, 5-star hotels, seamless service — designed around you.',
  phone: '+84962819091',
  email: 'info@halongluxury.com',
  address: { street: '32 Hang Buom', city: 'Hanoi', country: 'VN' }
};

export function absoluteUrl(path = '/') {
  return new URL(path, site.url).toString();
}

export function pageMetadata(item?: CmsItem | null, fallbackTitle = site.name, fallbackDescription = site.description) {
  const seo = item?.meta?.seo;
  const title = seo?.title || item?.title || fallbackTitle;
  const description = seo?.description || item?.excerpt || fallbackDescription;
  const itemPath = item?.type === 'post'
    ? `/blog/${item.slug}/`
    : item?.type === 'hlt_cruise'
      ? `/cruise/${item.slug}/`
      : item?.type === 'hlt_travel_style'
        ? `/travel-styles/${item.slug}/`
        : item?.slug
          ? `/${item.slug}/`
          : '/';
  const canonical = seo?.canonical || absoluteUrl(itemPath);
  const ogImage = seo?.ogImage || item?.featuredImage || `${site.url}/images/og-default.jpg`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website' as const,
      title,
      description,
      url: canonical,
      siteName: site.name,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }]
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [ogImage]
    },
    robots: seo?.robots || 'index,follow'
  };
}

export function travelAgencySchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['TravelAgency', 'LocalBusiness'],
    name: site.name,
    url: site.url,
    logo: `${site.url}/images/logo.png`,
    image: `${site.url}/images/og-default.jpg`,
    description: site.description,
    telephone: site.phone,
    email: site.email,
    priceRange: '$$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressCountry: site.address.country
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: site.phone,
      contactType: 'customer service',
      availableLanguage: ['English', 'Vietnamese', 'French', 'Chinese'],
      hoursAvailable: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], opens: '08:00', closes: '22:00' }
    },
    areaServed: [
      { '@type': 'Country', name: 'Vietnam' },
      { '@type': 'Country', name: 'Laos' },
      { '@type': 'Country', name: 'Cambodia' },
      { '@type': 'Country', name: 'Thailand' },
      { '@type': 'Country', name: 'Myanmar' }
    ],
    knowsAbout: ['Luxury tours', 'Tailor-made travel', 'Honeymoon travel', 'Family travel', 'Ha Long Bay cruise', 'Private Vietnam itinerary'],
    sameAs: [
      'https://www.facebook.com/halongluxurytravel',
      'https://www.instagram.com/halongluxurytravel'
    ]
  };
}

export function tourSchema(tour: CmsItem) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.title,
    description: tour.excerpt,
    image: tour.featuredImage,
    url: absoluteUrl(tourPath(tour)),
    itinerary: tour.meta.itinerary?.map((step) => step.title || step.day) || []
  };
}

export function faqSchema(faq: Array<{ question: string; answer: string }> = []) {
  if (!faq.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer }
    }))
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}
