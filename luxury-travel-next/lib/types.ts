export type Locale = 'en' | 'fr' | 'vi' | 'zh' | 'ko' | 'ja' | 'de' | 'es' | 'th' | 'nl' | 'ar' | 'it';

export type SeoFields = {
  title?: string;
  description?: string;
  focusKeyword?: string;
  h1?: string;
  canonical?: string;
  ogImage?: string;
  robots?: string;
  schema?: Record<string, unknown> | Record<string, unknown>[];
};

export type CmsValidation = {
  status?: 'synced' | 'partial' | 'broken' | 'outdated';
  completion?: number;
  seo_score?: number;
  content_score?: number;
  content_score_band?: 'blocked' | 'warning' | 'publish_ready' | 'featured_eligible';
  missing?: string[];
  warnings?: string[];
};

export type CmsItem = {
  id: number | string;
  type: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  meta: {
    seo?: SeoFields;
    translations?: Record<string, unknown>;
    gallery?: string[];
    cabins?: Array<Record<string, string>>;
    itinerary?: Array<Record<string, string>>;
    faq?: Array<{ question: string; answer: string }>;
    pricing?: Array<Record<string, string>>;
    details?: Record<string, unknown>;
    blocks?: Array<Record<string, unknown>>;
    reusableBlocks?: Record<string, Array<Record<string, unknown>>>;
    blockTemplate?: string;
    validation?: CmsValidation;
  };
};

export type TourImageAttribution = {
  provider: string;
  sourceUrl: string;
  license: string;
  alt: string;
  width?: string;
  height?: string;
};

export type TourBlogSection = {
  heading: string;
  body: string;
};

export type HubKey =
  | 'vietnam'
  | 'thailand'
  | 'cambodia'
  | 'laos'
  | 'myanmar'
  | 'indonesia'
  | 'malaysia'
  | 'singapore'
  | 'philippines'
  | 'china'
  | 'hong-kong'
  | 'japan'
  | 'south-korea'
  | 'bhutan'
  | 'nepal'
  | 'india'
  | 'sri-lanka'
  | 'multi-country';

export type LeadPayload = {
  destinations: string[];
  routeFocus: string[];
  dates: string;
  startEnd: string;
  duration: string;
  adults: number;
  children: number;
  travelerType: string;
  pace: string;
  style: string;
  budget: string;
  hotel: string;
  interests: string[];
  support: string;
  notes: string;
  website?: string;
  recaptchaToken?: string;
  matchedTours?: Array<{
    title: string;
    slug: string;
    href: string;
    score: number;
    amountUsd: number;
    reasons: string[];
  }>;
  contact: {
    fullName: string;
    email: string;
    phone: string;
    country: string;
  };
};
