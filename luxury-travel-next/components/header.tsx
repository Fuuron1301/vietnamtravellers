'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronRight, Globe2, Menu, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BrandLogo } from '@/components/brand-logo';
import { CTAButton } from '@/components/ui/cta-button';
import { hubOrder } from '@/lib/routing';
import { tripKinds, tripStylePath } from '@/lib/trip-styles';
import { defaultLocale, localeCookieName, localeOptions, localizeHref, localizePathname, stripLocaleFromPathname } from '@/lib/i18n';
import type { Locale } from '@/lib/types';
import type { CmsMenuItem, CmsMenuTree } from '@/lib/menus-types';
import { defaultSiteContent, type SiteContent, type TourNavItem } from '@/lib/site-content-schema';

const defaultTourChoices: TourNavItem[] = defaultSiteContent.navigation.tourChoices;

const tourMenuLabel = (item: TourNavItem, suffix: string) => {
  return `${item.label} ${suffix}`;
};

const defaultAboutChoices = [
  { label: 'Why Travel With Us', href: '/why-travel-with-us/', description: 'Private planning, trusted local hosts and quieter luxury pacing.' },
  { label: 'Our Planning Flow', href: '/planning-flow/', description: 'See how a travel idea becomes a polished tailor-made itinerary.' },
  { label: 'FAQs', href: '/faqs/', description: 'Clear answers on planning, payments, hotels, visas and private support.' },
  { label: 'Travel Journal', href: '/travel-journal/', description: 'Destination notes, route inspiration and seasonal travel ideas.' },
  { label: 'Contact Our Team', href: '/contact/', description: 'Start a conversation with a specialist for your journey.' }
];

type HeaderServiceItem = {
  label: string;
  href: string;
  description: string;
  meta?: string;
  image?: string;
  external?: boolean;
};

type HeaderStyleGroup = {
  number: string;
  tag: string;
  title: string;
  subtitle: string;
  defaultImage: string;
  items: { label: string; note: string; image: string; href: string; }[];
};

const styleByTitle = (title: string) => {
  const kind = tripKinds.find((item) => item.title === title);
  if (!kind) throw new Error(`Missing trip style: ${title}`);
  return {
    label: kind.title,
    note: kind.duration,
    image: kind.image,
    href: tripStylePath(kind)
  };
};

const STYLE_GROUPS: HeaderStyleGroup[] = [
  {
    number: "01",
    tag: "2 – 24 hrs",
    title: "Stopover Tours",
    subtitle: "City layovers & transit escapes",
    defaultImage: styleByTitle("City Breaks").image,
    items: [
      styleByTitle("City Breaks"),
      styleByTitle("Culture & Heritage"),
      styleByTitle("Culinary Journeys"),
      styleByTitle("Photography Trips"),
      styleByTitle("Celebration Trips"),
      styleByTitle("Rail Journeys"),
      styleByTitle("Multi Country"),
    ],
  },
  {
    number: "02",
    tag: "Full day",
    title: "Day Trips",
    subtitle: "One perfect day on the water",
    defaultImage: styleByTitle("Cruise Voyages").image,
    items: [
      styleByTitle("Cruise Voyages"),
      styleByTitle("Waterfall Retreats"),
      styleByTitle("Adventure Vacations"),
      styleByTitle("Wildlife & Safari"),
      styleByTitle("Diving & Marine"),
      styleByTitle("Mountain Retreats"),
      styleByTitle("Family Holidays"),
    ],
  },
  {
    number: "03",
    tag: "Multi-day",
    title: "Golf Tours",
    subtitle: "Finest courses across Asia",
    defaultImage: styleByTitle("Golf Holidays").image,
    items: [
      styleByTitle("Golf Holidays"),
      styleByTitle("Luxury Stays"),
      styleByTitle("Island Villas"),
      styleByTitle("Beach Escapes"),
      styleByTitle("Honeymoon"),
      styleByTitle("Wellness & Spa"),
    ],
  },
];



const otherServiceItems: HeaderServiceItem[] = [
  { label: 'Car Rental', href: '/contact/?service=car-rental', description: 'Private car rental request, website in progress.' },
  { label: 'Bus & Train Ticket', href: '/contact/?service=bus-train-ticket', description: 'Ticket support request, website in progress.' },
  { label: 'Sim Card 5G', href: '/sim-card/', description: 'Buy eSIM or physical SIM card for Vietnam and Asia travel.' },
  { label: 'Asia Visa', href: '/visa/', description: 'Open the visa registration form inspired by the Visa2Asia order flow.' },
  { label: 'Bike & Motorbike Rental', href: '/contact/?service=bike-motorbike-rental', description: 'Rental request, partner site in progress.' }
];

function StyleGroupColumn({
  group,
  index,
  localizedHref,
  onClose
}: {
  group: HeaderStyleGroup;
  index: number;
  localizedHref: (href: string) => string;
  onClose: () => void;
}) {
  const [activeImg, setActiveImg] = useState(group.defaultImage);
  const [activeKey, setActiveKey] = useState("default");

  const handleEnter = (img: string, key: string) => {
    if (typeof window !== 'undefined') {
      const preload = new window.Image();
      preload.src = img;
    }
    setActiveImg(img);
    setActiveKey(key);
  };
  
  const handleLeave = () => {
    setActiveImg(group.defaultImage);
    setActiveKey("default");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-0 flex-col justify-start"
    >
      {/* ── Thumbnail với hover effect ── */}
      <div
        className="relative mb-[clamp(12px,1.5vh,22px)] w-full overflow-hidden rounded-[clamp(12px,1vw,18px)] shadow-[0_24px_58px_rgba(0,0,0,0.24)]"
        style={{ height: 'clamp(180px, 25vh, 330px)' }}
      >
        <AnimatePresence mode="sync">
          <motion.img
            key={activeKey}
            src={activeImg}
            alt={group.title}
            initial={{ opacity: 0, scale: 1.015 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/68 via-[#0a1628]/10 to-transparent" />
        
        {/* Tag badge */}
        <span
          className="absolute bottom-[clamp(12px,1.4vw,20px)] left-[clamp(12px,1.4vw,20px)] rounded-full border border-[#c9a961]/60 px-[clamp(12px,1vw,16px)] py-[clamp(5px,0.55vw,8px)] text-[clamp(8px,0.58vw,11px)] uppercase tracking-[0.24em] text-[#f3d488]"
          style={{ fontFamily: "var(--font-jost), 'Jost', system-ui, sans-serif", background: "rgba(10,22,40,0.75)" }}
        >
          {group.tag}
        </span>
      </div>

      {/* ── Group header với numbering ── */}
      <div className="mb-[clamp(16px,1.8vh,26px)] flex items-start gap-[clamp(16px,1.6vw,28px)]">
        <span
          className="mt-1 select-none text-[clamp(2.7rem,3.15vw,4.4rem)] font-normal leading-none tracking-[-0.04em] text-[#b88735]/55"
          style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif" }}
        >
          {group.number}
        </span>
        <div>
          <h3
            className="text-[clamp(1.9rem,2.25vw,3rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-[#081522]"
            style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif" }}
          >
            {group.title}
          </h3>
          <p
            className="mt-[clamp(7px,0.7vw,11px)] text-[clamp(0.72rem,0.72vw,0.95rem)] font-bold uppercase tracking-[0.24em] text-[#9b762a]"
            style={{ fontFamily: "var(--font-jost), 'Jost', system-ui, sans-serif" }}
          >
            {group.subtitle}
          </p>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mb-[clamp(14px,1.6vh,22px)] h-px bg-gradient-to-r from-[#b88735]/38 via-[#0a1628]/10 to-transparent" />

      {/* ── Items list với hover effects ── */}
      <ul
        className="flex flex-col gap-[clamp(9px,0.95vh,14px)] overflow-y-auto pr-2 [scrollbar-color:#c9a961_transparent] [scrollbar-width:thin]"
        style={{ maxHeight: 'clamp(210px, 25vh, 360px)' }}
      >
        {group.items.map((item, i) => (
          <li key={i}>
            <Link
              href={localizedHref(item.href)}
              onClick={onClose}
              onMouseEnter={() => handleEnter(item.image, `${index}-${i}`)}
              onMouseLeave={handleLeave}
              className="group/item relative flex w-full items-center justify-between overflow-hidden rounded-[12px] px-[clamp(8px,0.8vw,16px)] py-[clamp(10px,0.95vh,16px)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/48 hover:shadow-[0_16px_36px_rgba(11,27,43,0.08)]"
            >
              <span className="pointer-events-none absolute inset-y-2 left-0 w-[3px] origin-top scale-y-0 rounded-full bg-[#c9a961] transition-transform duration-200 group-hover/item:scale-y-100" />
              <div className="flex items-center gap-4">
                <span className="h-[clamp(4px,0.35vw,6px)] w-[clamp(4px,0.35vw,6px)] shrink-0 rounded-full bg-[#b88735]/70 transition-all duration-200 group-hover/item:scale-[1.65] group-hover/item:bg-[#0a1628] group-hover/item:shadow-[0_0_0_5px_rgba(200,169,106,0.16)]" />
                <span
                  className="text-left text-[clamp(1rem,1.04vw,1.3rem)] font-bold leading-none tracking-[-0.015em] transition-all duration-200 group-hover/item:translate-x-1"
                  style={{ fontFamily: "var(--font-jost), 'Jost', system-ui, sans-serif", color: '#0a1628' }}
                >
                  {item.label}
                </span>
              </div>
              <span
                className="ml-[clamp(14px,1.3vw,24px)] shrink-0 text-[clamp(0.64rem,0.64vw,0.86rem)] font-black uppercase tracking-[0.18em] transition-all duration-200 group-hover/item:-translate-x-1 group-hover/item:text-[#081522]"
                style={{ fontFamily: "var(--font-jost), 'Jost', system-ui, sans-serif", color: '#8a6420' }}
              >
                {item.note}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function isExternalHref(href: string) {
  return /^(https?:|mailto:|tel:)/i.test(href);
}

function normalizedMenuLabel(label: string) {
  return label.trim().toLowerCase().replace(/\s+/g, ' ');
}

function isToursMenuLabel(label: string) {
  const normalized = normalizedMenuLabel(label);
  return normalized === 'our tours' || normalized === 'tours';
}

function isAboutMenuLabel(label: string) {
  const normalized = normalizedMenuLabel(label);
  return normalized === 'about us' || normalized === 'about';
}

function isStylesMenuLabel(label: string) {
  const normalized = normalizedMenuLabel(label);
  return normalized === 'all styles' || normalized === 'styles';
}

function isServicesMenuLabel(label: string) {
  const normalized = normalizedMenuLabel(label);
  return normalized === 'other service' || normalized === 'other services' || normalized === 'services';
}

function HeaderMenuLink({
  item,
  locale,
  className,
  children,
  onNavigate
}: {
  item: CmsMenuItem;
  locale: Locale;
  className?: string;
  children?: React.ReactNode;
  onNavigate?: () => void;
}) {
  const target = item.target === '_blank' ? '_blank' : undefined;
  const rel = target ? 'noreferrer' : undefined;
  const content = children ?? item.label;
  const href = localizeHref(item.href || '#', locale);

  if (isExternalHref(item.href)) {
    return (
      <a href={item.href} target={target} rel={rel} className={className} onClick={onNavigate}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} target={target} rel={rel} className={className} onClick={onNavigate}>
      {content}
    </Link>
  );
}

const languageChoices = localeOptions;

type LanguageChoice = (typeof languageChoices)[number];

function LanguageOptionButton({
  language,
  selected,
  onSelect,
  compact = false
}: {
  language: LanguageChoice;
  selected: boolean;
  onSelect: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-selected={selected}
      role="option"
      className={cn(
        'group/language-card relative flex w-full items-center overflow-hidden rounded-[22px] border text-left transition-all duration-300 ease-luxe focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/55',
        compact ? 'min-h-[68px] gap-3 px-[12px] py-[12px]' : 'min-h-[82px] gap-4 px-4 py-[14px]',
        selected
          ? 'border-gold/55 bg-[linear-gradient(135deg,rgba(248,245,239,1),rgba(239,229,209,0.96))] text-navy shadow-[0_18px_34px_rgba(11,27,43,0.10)]'
          : 'border-navy/8 bg-ivory/72 text-navy/76 hover:-translate-y-0.5 hover:border-gold/42 hover:bg-ivory hover:shadow-[0_16px_30px_rgba(11,27,43,0.08)]'
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(200,169,106,0.18),transparent_38%)] transition-opacity',
          selected ? 'opacity-100' : 'opacity-0 group-hover/language-card:opacity-70'
        )}
      />
      <span aria-hidden="true" className={cn('absolute inset-x-[20px] top-0 h-px bg-gold/45 transition-opacity', selected ? 'opacity-100' : 'opacity-0 group-hover/language-card:opacity-75')} />
      <span
        className={cn(
          'relative z-10 grid shrink-0 place-items-center rounded-full border font-black uppercase transition-all duration-300',
          compact ? 'h-[44px] w-[44px] text-[12px] tracking-[0.08em]' : 'h-[54px] w-[54px] text-[13px] tracking-[0.1em]',
          selected
            ? 'border-gold bg-gold text-navy shadow-[inset_0_1px_0_rgba(248,245,239,0.45),0_10px_22px_rgba(200,169,106,0.18)]'
            : 'border-navy/10 bg-pearl text-navy/58 group-hover/language-card:border-gold/45 group-hover/language-card:bg-champagne/70 group-hover/language-card:text-gold-dark'
        )}
      >
        {language.code}
      </span>

      <span className="relative z-10 min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-[10px]">
          <span className={cn('block truncate font-black uppercase tracking-[0.035em] text-navy', compact ? 'text-[12px]' : 'text-[13px]')}>
            {language.label}
          </span>
          {!compact && (
            <span className={cn('shrink-0 rounded-full px-[10px] py-1 text-[9px] font-black uppercase tracking-[0.16em]', selected ? 'bg-gold/16 text-gold-dark' : 'bg-navy/[0.045] text-navy/40')}>
              {language.region}
            </span>
          )}
        </span>
        <span className={cn('mt-[6px] block truncate font-bold leading-4', compact ? 'text-[11px]' : 'text-[12px]', selected ? 'text-navy/62' : 'text-navy/48')}>
          {compact ? language.region : language.note}
        </span>
      </span>

      <span
        className={cn(
          'relative z-10 mt-0.5 grid h-[28px] w-[28px] shrink-0 place-items-center rounded-full transition',
          selected
            ? 'bg-gold text-navy opacity-100 shadow-[0_8px_18px_rgba(200,169,106,0.18)]'
            : 'bg-transparent text-transparent opacity-0 group-hover/language-card:bg-gold/18 group-hover/language-card:text-gold-dark group-hover/language-card:opacity-100'
        )}
      >
        <Check className="h-4 w-4" strokeWidth={2.4} />
      </span>
    </button>
  );
}

export function Header({
  siteContent = defaultSiteContent,
  primaryMenu = null
}: {
  siteContent?: SiteContent;
  primaryMenu?: CmsMenuTree | null;
}) {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('header');
  const parsedPath = stripLocaleFromPathname(pathname);
  const currentLocale = parsedPath.locale || defaultLocale;
  const routePathname = parsedPath.pathname;
  const activeLanguage = languageChoices.find((language) => language.locale === currentLocale) || languageChoices[0];
  const localizedHref = (href: string) => localizeHref(href, currentLocale);
  const dbPrimaryItems = primaryMenu?.items ?? [];
  const usesDbPrimaryMenu = dbPrimaryItems.length > 0;
  const hasDbAllStylesItem = dbPrimaryItems.some((item) => isStylesMenuLabel(item.label));
  const hasDbServicesItem = dbPrimaryItems.some((item) => isServicesMenuLabel(item.label));
  const virtualAllStylesItem: CmsMenuItem = {
    id: 'virtual-all-styles',
    label: t('allStyles'),
    href: '/travel-styles/',
    target: '',
    cssClasses: [],
    linkedPost: null,
    children: []
  };
  const virtualServicesItem: CmsMenuItem = {
    id: 'virtual-other-services',
    label: t('otherServices.title'),
    href: '/contact/?service=other-services',
    target: '',
    cssClasses: [],
    linkedPost: null,
    children: []
  };
  const dbPrimaryItemsForRender = usesDbPrimaryMenu
    ? dbPrimaryItems.reduce<CmsMenuItem[]>((items, item, index) => {
        items.push(item);
        const hasToursItem = dbPrimaryItems.some((entry) => isToursMenuLabel(entry.label));
        const shouldInjectStyles = !hasDbAllStylesItem && (isToursMenuLabel(item.label) || (index === 0 && !hasToursItem));
        if (shouldInjectStyles && !items.some((entry) => isStylesMenuLabel(entry.label))) items.push(virtualAllStylesItem);
        const shouldInjectServices = !hasDbServicesItem && (isStylesMenuLabel(item.label) || (shouldInjectStyles && !hasDbAllStylesItem));
        if (shouldInjectServices && !items.some((entry) => isServicesMenuLabel(entry.label))) items.push(virtualServicesItem);
        return items;
      }, [])
    : dbPrimaryItems;
  const tourChoices = siteContent.navigation.tourChoices.length ? siteContent.navigation.tourChoices : defaultTourChoices;
  const aboutChoices = siteContent.navigation.aboutChoices.length ? siteContent.navigation.aboutChoices : defaultAboutChoices;
  const serviceChoices: HeaderServiceItem[] = [
    { label: t('otherServices.items.carRental.label'), href: '/contact/?service=car-rental', description: t('otherServices.items.carRental.description') },
    { label: t('otherServices.items.busTrain.label'), href: '/contact/?service=bus-train-ticket', description: t('otherServices.items.busTrain.description') },
    { label: t('otherServices.items.simCard.label'), href: '/sim-card/', description: t('otherServices.items.simCard.description') },
    { label: t('otherServices.items.asiaVisa.label'), href: '/visa', description: t('otherServices.items.asiaVisa.description') },
    { label: t('otherServices.items.bikeMotorbike.label'), href: '/contact/?service=bike-motorbike-rental', description: t('otherServices.items.bikeMotorbike.description') }
  ];
  const primaryCta = siteContent.navigation.primaryCta;
  const mobileBlogLink = siteContent.navigation.mobileBlogLink;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileToursOpen, setMobileToursOpen] = useState(false);
  const [mobileStylesOpen, setMobileStylesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [toursOpen, setToursOpen] = useState(false);
  const [stylesOpen, setStylesOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [openDbMenuId, setOpenDbMenuId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [activeTour, setActiveTour] = useState<TourNavItem>(tourChoices[0]);
  const [destination, setDestination] = useState(tourChoices[0]?.href || '/vietnam-tours/');
  const [keyword, setKeyword] = useState('');
  const topNavItemClass =
    'inline-flex h-[54px] items-center gap-2.5 whitespace-nowrap rounded-full px-4 text-[19px] font-extrabold uppercase leading-none tracking-[0.05em] text-pearl transition-colors duration-150 hover:text-gold xl:h-[56px] xl:px-5 xl:text-[20px] 2xl:px-6 2xl:text-[21px]';

  const topNavCompactClass =
    'inline-flex h-[54px] items-center gap-2.5 whitespace-nowrap rounded-full px-4 text-[19px] font-extrabold uppercase leading-none tracking-[0.05em] text-pearl transition-colors duration-150 hover:text-gold xl:h-[56px] xl:px-5 xl:text-[20px] 2xl:px-6 2xl:text-[21px]';

  const isActive = (href: string) => routePathname === href || (href !== '/' && routePathname.startsWith(href.replace(/\/$/, '')));
  const toursActive = tourChoices.some((item) => isActive(item.href));
  const stylesActive = routePathname.startsWith('/travel-styles');
  const isTourDetail = /^\/[a-z-]+-tours\/[^/]+\/?$/.test(routePathname);
  const transparentHeader = routePathname === '/' && !scrolled;
  const flyoutOpen = open || toursOpen || stylesOpen || servicesOpen || aboutOpen || searchOpen || langOpen || openDbMenuId !== null;
  const solidHeader = isTourDetail || flyoutOpen || !transparentHeader;

  useEffect(() => {
    if (!open) {
      setMobileToursOpen(false);
      setMobileStylesOpen(false);
      setMobileServicesOpen(false);
      setMobileAboutOpen(false);
    }
  }, [open]);

  const selectLanguage = (language: LanguageChoice) => {
    document.cookie = `${localeCookieName}=${language.locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    if (language.locale !== currentLocale) {
      window.location.assign(localizePathname(pathname, language.locale, searchParams.toString(), window.location.hash));
      return;
    }
    setLangOpen(false);
    setOpen(false);
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = keyword.trim();
    router.push(localizedHref(query ? `${destination}?q=${encodeURIComponent(query)}` : destination));
    setToursOpen(false);
    setStylesOpen(false);
    setServicesOpen(false);
    setAboutOpen(false);
    setSearchOpen(false);
    setLangOpen(false);
  };

  const closeFlyouts = () => {
    setToursOpen(false);
    setStylesOpen(false);
    setServicesOpen(false);
    setAboutOpen(false);
    setOpenDbMenuId(null);
    setSearchOpen(false);
    setLangOpen(false);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
    <header className={cn('fixed inset-x-0 top-0 z-[90] h-[88px] border-b text-pearl transition-[background-color,border-color,box-shadow] duration-300 ease-luxe', solidHeader ? 'border-gold/15 bg-[rgba(11,27,43,0.94)] shadow-[0_18px_50px_rgba(11,27,43,0.22)] backdrop-blur-xl' : 'border-transparent bg-transparent shadow-none backdrop-blur-0')}>
      <div className="relative grid h-full w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-6 px-[clamp(26px,3.1vw,56px)]">
        <BrandLogo identity={siteContent.identity} className="justify-self-start" />

        <nav
          className={cn(
            'hidden items-center justify-self-center lg:flex',
            usesDbPrimaryMenu
              ? 'max-w-full gap-6 overflow-visible px-1 xl:gap-7 2xl:gap-8'
              : 'max-w-full gap-4 overflow-visible px-3 xl:gap-5 2xl:gap-6'
          )}
          aria-label="Primary navigation"
        >
          {usesDbPrimaryMenu ? (
            dbPrimaryItemsForRender.map((item) => {
              const isAllStylesItem = isStylesMenuLabel(item.label);
              const isToursItem = isToursMenuLabel(item.label);
              const isAboutItem = isAboutMenuLabel(item.label);
              const isServicesItem = isServicesMenuLabel(item.label);
              const hasChildren = item.children.length > 0 && !isToursItem && !isAboutItem && !isServicesItem;
              const active = isActive(item.href) || item.children.some((child) => isActive(child.href)) || (isAllStylesItem && stylesOpen) || (isToursItem && toursOpen) || (isServicesItem && servicesOpen) || (isAboutItem && aboutOpen);
              const openDbItem = openDbMenuId === item.id;

              if (isToursItem) {
                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => {
                      setToursOpen(true);
                      setStylesOpen(false);
                      setAboutOpen(false);
                      setOpenDbMenuId(null);
                      setSearchOpen(false);
                      setLangOpen(false);
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setToursOpen((value) => !value);
                        setStylesOpen(false);
                        setAboutOpen(false);
                        setOpenDbMenuId(null);
                        setSearchOpen(false);
                        setLangOpen(false);
                      }}
                      className={cn(topNavItemClass, (active || openDbItem || toursOpen) && 'text-gold')}
                      aria-expanded={toursOpen}
                    >
                      <span className="whitespace-nowrap">{t('ourTours')}</span>
                      <ChevronDown className={cn('h-[18px] w-[18px] shrink-0 transition xl:h-[19px] xl:w-[19px]', toursOpen && 'rotate-180')} />
                    </button>
                  </div>
                );
              }

              if (isAllStylesItem) {
                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => {
                      setStylesOpen(true);
                      setToursOpen(false);
                      setServicesOpen(false);
                      setAboutOpen(false);
                      setOpenDbMenuId(null);
                      setSearchOpen(false);
                      setLangOpen(false);
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setStylesOpen((value) => !value);
                        setToursOpen(false);
                        setServicesOpen(false);
                        setAboutOpen(false);
                        setOpenDbMenuId(null);
                        setSearchOpen(false);
                        setLangOpen(false);
                      }}
                      className={cn(topNavItemClass, (active || openDbItem || stylesOpen) && 'text-gold')}
                      aria-expanded={stylesOpen}
                    >
                      <span className="whitespace-nowrap">{t('allStyles')}</span>
                      <ChevronDown className={cn('h-[18px] w-[18px] shrink-0 transition xl:h-[19px] xl:w-[19px]', stylesOpen && 'rotate-180')} />
                    </button>
                  </div>
                );
              }

              if (isServicesItem) {
                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => {
                      setServicesOpen(true);
                      setToursOpen(false);
                      setStylesOpen(false);
                      setAboutOpen(false);
                      setOpenDbMenuId(null);
                      setSearchOpen(false);
                      setLangOpen(false);
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setServicesOpen((value) => !value);
                        setToursOpen(false);
                        setStylesOpen(false);
                        setAboutOpen(false);
                        setOpenDbMenuId(null);
                        setSearchOpen(false);
                        setLangOpen(false);
                      }}
                      className={cn(topNavCompactClass, (active || openDbItem || servicesOpen) && 'text-gold')}
                      aria-expanded={servicesOpen}
                    >
                      <span className="whitespace-nowrap">{t('otherServices.title')}</span>
                      <ChevronDown className={cn('h-[18px] w-[18px] shrink-0 transition xl:h-[19px] xl:w-[19px]', servicesOpen && 'rotate-180')} />
                    </button>
                  </div>
                );
              }

              if (isAboutItem) {
                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => {
                      setAboutOpen(true);
                      setToursOpen(false);
                      setStylesOpen(false);
                      setOpenDbMenuId(null);
                      setSearchOpen(false);
                      setLangOpen(false);
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setAboutOpen((value) => !value);
                        setToursOpen(false);
                        setStylesOpen(false);
                        setOpenDbMenuId(null);
                        setSearchOpen(false);
                        setLangOpen(false);
                      }}
                      className={cn(topNavCompactClass, (active || openDbItem || aboutOpen) && 'text-gold')}
                      aria-expanded={aboutOpen}
                    >
                      <span className="whitespace-nowrap">{t('aboutUs')}</span>
                      <ChevronDown className={cn('h-[18px] w-[18px] shrink-0 transition xl:h-[19px] xl:w-[19px]', aboutOpen && 'rotate-180')} />
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => {
                    setOpenDbMenuId(hasChildren ? item.id : null);
                    setToursOpen(false);
                    setStylesOpen(false);
                    setAboutOpen(false);
                    setSearchOpen(false);
                    setLangOpen(false);
                  }}
                >
                  <HeaderMenuLink
                    item={item}
                    locale={currentLocale}
                  className={cn('inline-flex h-[54px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 text-[15px] font-extrabold uppercase leading-none tracking-[0.035em] text-pearl transition-colors duration-150 hover:text-gold xl:h-[56px] xl:px-4 xl:text-[16px] 2xl:text-[17px]', (active || openDbItem) && 'text-gold')}
                  onNavigate={() => {
                    closeFlyouts();
                  }}
                >
                    <span className="whitespace-nowrap">{item.label}</span>
                    {hasChildren && <ChevronDown className={cn('h-[18px] w-[18px] shrink-0 transition xl:h-[19px] xl:w-[19px]', openDbItem && 'rotate-180')} />}
                  </HeaderMenuLink>
                  {hasChildren && openDbItem && (
                    <div className="absolute left-1/2 top-[66px] z-50 w-[340px] -translate-x-1/2 overflow-hidden rounded-[28px] border border-gold/20 bg-ivory p-2 text-navy shadow-[0_30px_80px_rgba(11,27,43,0.28)]">
                      {item.children.map((child) => (
                        <HeaderMenuLink
                          key={child.id}
                          item={child}
                          locale={currentLocale}
                          className="group flex min-h-[56px] items-center justify-between gap-4 rounded-[22px] px-5 text-[14px] font-black uppercase tracking-[0.12em] text-navy/76 transition hover:bg-champagne hover:text-navy"
                          onNavigate={closeFlyouts}
                        >
                          <span>{child.label}</span>
                          <ArrowUpRight className="h-4 w-4 opacity-35 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                        </HeaderMenuLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <>
              <div
                onMouseEnter={() => {
                  setToursOpen(true);
                  setStylesOpen(false);
                  setAboutOpen(false);
                  setSearchOpen(false);
                  setLangOpen(false);
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setToursOpen((value) => !value);
                    setStylesOpen(false);
                    setAboutOpen(false);
                    setSearchOpen(false);
                    setLangOpen(false);
                  }}
                  onFocus={() => {
                    setToursOpen(true);
                    setStylesOpen(false);
                    setAboutOpen(false);
                    setSearchOpen(false);
                    setLangOpen(false);
                  }}
                  className={cn(topNavItemClass, (toursActive || toursOpen) && 'text-gold')}
                  aria-expanded={toursOpen}
                >
                  <span className="whitespace-nowrap">{t('ourTours')}</span>
                  <ChevronDown className={cn('h-[18px] w-[18px] shrink-0 transition xl:h-[19px] xl:w-[19px]', toursOpen && 'rotate-180')} />
                </button>
              </div>

              <div
                onMouseEnter={() => {
                  setStylesOpen(true);
                  setToursOpen(false);
                  setServicesOpen(false);
                  setAboutOpen(false);
                  setSearchOpen(false);
                  setLangOpen(false);
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setStylesOpen((value) => !value);
                    setToursOpen(false);
                    setServicesOpen(false);
                    setAboutOpen(false);
                    setSearchOpen(false);
                    setLangOpen(false);
                  }}
                  onFocus={() => {
                    setStylesOpen(true);
                    setToursOpen(false);
                    setServicesOpen(false);
                    setAboutOpen(false);
                    setSearchOpen(false);
                    setLangOpen(false);
                  }}
                  className={cn(topNavItemClass, (stylesActive || stylesOpen) && 'text-gold')}
                  aria-expanded={stylesOpen}
                >
                  <span className="whitespace-nowrap">{t('allStyles')}</span>
                  <ChevronDown className={cn('h-[18px] w-[18px] shrink-0 transition xl:h-[19px] xl:w-[19px]', stylesOpen && 'rotate-180')} />
                </button>
              </div>

              <div
                className="relative"
                onMouseEnter={() => {
                  setServicesOpen(true);
                  setToursOpen(false);
                  setStylesOpen(false);
                  setAboutOpen(false);
                  setSearchOpen(false);
                  setLangOpen(false);
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setServicesOpen((value) => !value);
                    setToursOpen(false);
                    setStylesOpen(false);
                    setAboutOpen(false);
                    setSearchOpen(false);
                    setLangOpen(false);
                  }}
                  className={cn(topNavCompactClass, servicesOpen && 'text-gold')}
                  aria-expanded={servicesOpen}
                >
                  <span className="whitespace-nowrap">{t('otherServices.title')}</span>
                  <ChevronDown className={cn('h-[18px] w-[18px] shrink-0 transition xl:h-[19px] xl:w-[19px]', servicesOpen && 'rotate-180')} />
                </button>
              </div>

              <Link
                href={localizedHref(mobileBlogLink.href)}
                onMouseEnter={() => {
                  setToursOpen(false);
                  setStylesOpen(false);
                  setServicesOpen(false);
                  setAboutOpen(false);
                }}
                className={cn('inline-flex h-[54px] items-center whitespace-nowrap rounded-full px-4 text-[19px] font-extrabold uppercase leading-none tracking-[0.05em] text-pearl transition-colors duration-150 hover:text-gold xl:h-[56px] xl:px-5 xl:text-[20px] 2xl:px-6 2xl:text-[21px]', isActive(mobileBlogLink.href) && 'text-gold')}
              >
                {mobileBlogLink.label}
              </Link>

              <div
                onMouseEnter={() => {
                  setAboutOpen(true);
                  setToursOpen(false);
                  setStylesOpen(false);
                  setServicesOpen(false);
                  setSearchOpen(false);
                  setLangOpen(false);
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setAboutOpen((value) => !value);
                    setToursOpen(false);
                    setStylesOpen(false);
                    setServicesOpen(false);
                    setSearchOpen(false);
                    setLangOpen(false);
                  }}
                  onFocus={() => {
                    setAboutOpen(true);
                    setToursOpen(false);
                    setStylesOpen(false);
                    setServicesOpen(false);
                    setSearchOpen(false);
                    setLangOpen(false);
                  }}
                  className={cn(topNavCompactClass, aboutOpen && 'text-gold')}
                  aria-expanded={aboutOpen}
                >
                  <span className="whitespace-nowrap">{t('aboutUs')}</span>
                  <ChevronDown className={cn('h-[18px] w-[18px] shrink-0 transition xl:h-[19px] xl:w-[19px]', aboutOpen && 'rotate-180')} />
                </button>
              </div>

              <Link
                href={localizedHref('/contact/')}
                onMouseEnter={() => {
                  setToursOpen(false);
                  setStylesOpen(false);
                  setServicesOpen(false);
                  setAboutOpen(false);
                }}
                className={cn('inline-flex h-[54px] items-center whitespace-nowrap rounded-full px-4 text-[19px] font-extrabold uppercase leading-none tracking-[0.05em] text-pearl transition-colors duration-150 hover:text-gold xl:h-[56px] xl:px-5 xl:text-[20px] 2xl:px-6 2xl:text-[21px]', isActive('/contact/') && 'text-gold')}
              >
                {t('contact')}
              </Link>
            </>
          )}

          <div className="relative hidden">
            <button
              type="button"
              onClick={() => {
                setSearchOpen((value) => !value);
                setLangOpen(false);
                setToursOpen(false);
                setStylesOpen(false);
                setAboutOpen(false);
              }}
              className={cn(
                'group/search grid h-[46px] w-[46px] place-items-center rounded-full text-pearl transition duration-200 ease-luxe hover:-translate-y-0.5 hover:bg-pearl/10 hover:text-gold hover:shadow-[0_12px_28px_rgba(248,245,239,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 xl:h-[48px] xl:w-[48px]',
                searchOpen && 'text-gold'
              )}
                aria-label={t('search.aria')}
              aria-expanded={searchOpen}
            >
              <Search className="h-[23px] w-[23px] stroke-[2.25] transition duration-200 group-hover/search:scale-110 xl:h-[25px] xl:w-[25px]" />
            </button>
            {searchOpen && (
              <form onSubmit={submitSearch} className="absolute left-1/2 top-[58px] z-50 w-[420px] -translate-x-1/2 rounded-[28px] border border-gold/24 bg-ivory p-6 text-navy shadow-[0_32px_90px_rgba(11,27,43,0.32)]">
                <p className="px-2 text-[12px] font-extrabold uppercase tracking-[0.24em] text-gold-dark">{t('search.title')}</p>
                <div className="mt-6 grid gap-4">
                  <select value={destination} onChange={(event) => setDestination(event.target.value)} className="h-[52px] rounded-[18px] border border-navy/12 bg-pearl px-6 text-[15px] font-bold text-navy outline-none transition duration-200 focus:border-gold focus:shadow-[0_0_0_4px_rgba(200,169,106,0.08)]">
                    {hubOrder.map((hub) => <option key={hub.path} value={hub.path}>{hub.label}</option>)}
                  </select>
                  <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder={t('search.placeholder')} className="h-[52px] rounded-[18px] border border-navy/12 bg-pearl px-6 text-[15px] font-bold text-navy outline-none placeholder:text-navy/36 transition duration-200 focus:border-gold focus:shadow-[0_0_0_4px_rgba(200,169,106,0.08)]" />
                  <button type="submit" className="inline-flex h-[52px] items-center justify-center gap-3 rounded-[20px] bg-navy px-6 text-sm font-extrabold uppercase tracking-[0.14em] text-pearl shadow-[0_16px_44px_rgba(11,27,43,0.18)] transition duration-300 ease-luxe hover:-translate-y-0.5 hover:bg-gold hover:text-navy">
                    {t('search.submit')} <Search className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </nav>

        <div className="hidden items-center justify-self-end gap-5 lg:flex">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setSearchOpen((value) => !value);
                setLangOpen(false);
                setToursOpen(false);
                setStylesOpen(false);
                setAboutOpen(false);
              }}
              className={cn(
                'group/search grid h-[46px] w-[46px] place-items-center rounded-full text-pearl transition duration-200 ease-luxe hover:-translate-y-0.5 hover:bg-pearl/10 hover:text-gold hover:shadow-[0_12px_28px_rgba(248,245,239,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 xl:h-[48px] xl:w-[48px]',
                searchOpen && 'text-gold'
              )}
              aria-label={t('search.aria')}
              aria-expanded={searchOpen}
            >
              <Search className="h-[23px] w-[23px] stroke-[2.25] transition duration-200 group-hover/search:scale-110 xl:h-[25px] xl:w-[25px]" />
            </button>
            {searchOpen && (
              <form onSubmit={submitSearch} className="absolute right-0 top-[58px] z-50 w-[420px] rounded-[28px] border border-gold/24 bg-ivory p-6 text-navy shadow-[0_32px_90px_rgba(11,27,43,0.32)]">
                <p className="px-2 text-[12px] font-extrabold uppercase tracking-[0.24em] text-gold-dark">{t('search.title')}</p>
                <div className="mt-6 grid gap-4">
                  <select value={destination} onChange={(event) => setDestination(event.target.value)} className="h-[52px] rounded-[18px] border border-navy/12 bg-pearl px-6 text-[15px] font-bold text-navy outline-none transition duration-200 focus:border-gold focus:shadow-[0_0_0_4px_rgba(200,169,106,0.08)]">
                    {hubOrder.map((hub) => <option key={hub.path} value={hub.path}>{hub.label}</option>)}
                  </select>
                  <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder={t('search.placeholder')} className="h-[52px] rounded-[18px] border border-navy/12 bg-pearl px-6 text-[15px] font-bold text-navy outline-none placeholder:text-navy/36 transition duration-200 focus:border-gold focus:shadow-[0_0_0_4px_rgba(200,169,106,0.08)]" />
                  <button type="submit" className="inline-flex h-[52px] items-center justify-center gap-3 rounded-[20px] bg-navy px-6 text-sm font-extrabold uppercase tracking-[0.14em] text-pearl shadow-[0_16px_44px_rgba(11,27,43,0.18)] transition duration-300 ease-luxe hover:-translate-y-0.5 hover:bg-gold hover:text-navy">
                    {t('search.submit')} <Search className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setLangOpen((value) => !value);
                setSearchOpen(false);
                setToursOpen(false);
                setStylesOpen(false);
                setAboutOpen(false);
              }}
              className={cn(
                'group/lang relative inline-flex h-[46px] min-w-[56px] items-center justify-center gap-1.5 px-2 text-pearl transition duration-200 ease-luxe hover:-translate-y-0.5 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70',
                langOpen && 'text-gold'
              )}
              aria-label={`${t('language.current')}: ${activeLanguage.label}`}
              aria-expanded={langOpen}
            >
              <span className="text-[18px] font-extrabold uppercase leading-none tracking-[0.02em] transition duration-200 group-hover/lang:scale-[1.03] xl:text-[18px]">
                {activeLanguage.code}
              </span>
              <ChevronDown className={cn('mt-0.5 h-[15px] w-[15px] stroke-[2.4] text-pearl/72 transition duration-200 group-hover/lang:text-gold', langOpen && 'rotate-180 text-gold')} />
              <span aria-hidden="true" className={cn('absolute -bottom-1 left-1/2 h-px w-7 -translate-x-1/2 bg-gold transition duration-200', langOpen ? 'opacity-100' : 'opacity-0 group-hover/lang:opacity-75')} />
            </button>

            {langOpen && (
              <div
                className="absolute right-0 top-[58px] z-50 w-[360px] overflow-hidden rounded-[34px] border border-gold/20 bg-[linear-gradient(180deg,rgba(248,245,239,0.99),rgba(240,231,216,0.98))] p-[10px] text-navy shadow-[0_34px_90px_rgba(11,27,43,0.28)]"
                role="listbox"
                aria-label={t('language.aria')}
              >
                <div className="mb-[10px] flex items-center justify-between gap-4 rounded-[28px] border border-gold/16 bg-[linear-gradient(135deg,rgba(11,27,43,0.98),rgba(19,47,60,0.96))] px-[20px] py-4 text-pearl shadow-[inset_0_1px_0_rgba(248,245,239,0.08)]">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.36em] text-gold">{t('language.title')}</p>
                    <p className="mt-[6px] text-[13px] font-bold leading-[1.55] text-pearl/72">
                      {t('language.description')}
                    </p>
                  </div>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold/28 bg-gold/12 text-gold shadow-[0_12px_24px_rgba(0,0,0,0.14)]">
                    <Globe2 className="h-5 w-5" strokeWidth={2} />
                  </span>
                </div>
                <div className="grid max-h-[calc(100vh-220px)] gap-[10px] overflow-y-auto pr-1">
                  {languageChoices.map((language) => {
                    const selected = activeLanguage.locale === language.locale;

                    return (
                      <LanguageOptionButton
                        key={language.locale}
                        language={language}
                        selected={selected}
                        onSelect={() => selectLanguage(language)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <Link
              href={localizedHref(primaryCta.href)}
            className={cn(
              'inline-flex min-h-[50px] min-w-[214px] items-center justify-center rounded-full px-8 text-[15px] font-extrabold uppercase tracking-[-0.02em] transition-colors duration-150 xl:min-h-[54px] xl:min-w-[236px] xl:px-9 xl:text-[16px] 2xl:text-[17px]',
              transparentHeader
                ? 'border border-pearl/88 bg-transparent text-pearl shadow-[inset_0_1px_0_rgba(248,245,239,0.18)] hover:border-gold hover:bg-gold hover:text-navy'
                : 'bg-gold text-navy shadow-[0_14px_34px_rgba(11,27,43,0.18)] hover:bg-pearl'
            )}
          >
            {primaryCta.label}
          </Link>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="grid h-[44px] w-[44px] place-items-center justify-self-end rounded-full text-pearl transition hover:text-gold lg:hidden"
          aria-label={t('menu.open')}
          aria-expanded={open}
        >
          <Menu className="h-[22px] w-[22px]" strokeWidth={1.6} />
        </button>
      </div>

      {toursOpen && (
        <div
          onMouseEnter={() => setToursOpen(true)}
          className="fixed inset-x-0 top-[88px] z-[80] hidden h-[calc(100vh-88px)] overflow-hidden bg-navy text-pearl shadow-[0_30px_90px_rgba(11,27,43,0.32)] lg:block"
        >
          <Image
            key={`backdrop-${activeTour.image}`}
            src={activeTour.image}
            alt=""
            fill
            sizes="100vw"
            className="pointer-events-none scale-105 object-cover opacity-24 transition duration-700 ease-luxe"
            priority={false}
            unoptimized
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(11,27,43,0.98)_0%,rgba(11,27,43,0.9)_38%,rgba(11,27,43,0.7)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,rgba(200,169,106,0.28),transparent_28%),radial-gradient(circle_at_14%_88%,rgba(248,245,239,0.12),transparent_30%)]" />
          <button
            type="button"
            onClick={() => setToursOpen(false)}
            className="absolute right-8 top-8 z-30 grid h-[44px] w-[44px] place-items-center rounded-full border border-pearl/30 bg-navy/70 text-pearl backdrop-blur-md transition hover:border-gold hover:bg-gold hover:text-navy"
            aria-label={t('closeToursMenu')}
          >
            <X className="h-7 w-7 stroke-[1.6]" />
          </button>

          <div className="relative z-10 flex h-full">
            {/* Left panel follows the same navy/gold system as the image preview. */}
            <aside className="relative flex h-full w-[50%] flex-col border-r border-gold/15 bg-[linear-gradient(180deg,rgba(11,27,43,0.98),rgba(15,31,47,0.96))] text-pearl">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_0%,rgba(200,169,106,0.16),transparent_60%),radial-gradient(ellipse_70%_46%_at_0%_100%,rgba(248,245,239,0.08),transparent_62%)]" />

              <div className="relative flex shrink-0 items-center px-12 pb-4 pt-7 xl:px-14 xl:pt-8">
                <div>
                  <p className="text-[13px] font-extrabold uppercase tracking-[0.36em] text-gold">{t('selectDestination')}</p>
                </div>
              </div>

              <nav className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-7 xl:px-10" aria-label={t('destinationCategories')}>
                {tourChoices.map((item, index) => {
                  const selected = activeTour.href === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={localizedHref(item.href)}
                      onMouseEnter={() => activeTour.href !== item.href && setActiveTour(item)}
                      onFocus={() => activeTour.href !== item.href && setActiveTour(item)}
                      onClick={() => setToursOpen(false)}
                      className={cn(
                        'group relative flex items-center gap-8 border-b border-pearl/[0.08] py-[clamp(16px,1.65vh,24px)] pl-8 pr-6 text-left outline-none transition-all duration-250 ease-luxe focus-visible:ring-2 focus-visible:ring-gold/45 xl:gap-10 xl:pl-11 xl:pr-8',
                        selected
                          ? 'bg-pearl/10 shadow-[inset_0_0_0_1px_rgba(200,169,106,0.24)]'
                          : 'hover:bg-pearl/[0.055]'
                      )}
                    >
                      <span className={cn('absolute left-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-gold transition-all duration-300', selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-55')} />

                      <span className={cn('shrink-0 font-serif text-[17px] font-semibold leading-none tracking-wide xl:text-[19px]', selected ? 'text-gold' : 'text-pearl/35 group-hover:text-gold/70')}>
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className={cn('tour-route-title block font-serif text-[clamp(30px,2.25vw,46px)] font-semibold leading-[1] tracking-[-0.048em]', selected ? 'text-pearl' : 'text-pearl/65 group-hover:text-pearl')}>
                        {tourMenuLabel(item, t('tourSuffix'))}
                        </span>
                      </span>

                      <span className={cn('grid h-[44px] w-[44px] shrink-0 place-items-center rounded-full transition-all duration-200 xl:h-[50px] xl:w-[50px]', selected ? 'bg-gold text-navy' : 'bg-pearl/5 text-pearl/30 group-hover:bg-pearl/10 group-hover:text-gold')}>
                        <ArrowUpRight className="h-6 w-6 xl:h-[25px] xl:w-[25px]" />
                      </span>
                    </Link>
                  );
                })}
              </nav>

              <div className="relative shrink-0 px-8 pb-8 pt-4 xl:px-12 xl:pb-10">
                <Link href={localizedHref(primaryCta.href)} onClick={() => setToursOpen(false)} className="flex min-h-[54px] w-full items-center justify-center gap-3 rounded-full bg-gold text-[14px] font-extrabold uppercase tracking-[0.2em] text-navy shadow-[0_16px_44px_rgba(0,0,0,0.22)] transition-colors duration-200 hover:bg-pearl xl:min-h-[58px] xl:text-[13px]">
                  {t('discoverAllDestinations')} <ArrowUpRight className="h-5 w-5" />
                </Link>
              </div>
            </aside>

            {/* Right panel keeps the photo but tints it back into the same palette. */}
            <section className="relative h-full w-[50%] overflow-hidden bg-navy" aria-live="polite">
              <Image
                src={activeTour.image}
                alt={activeTour.imageAlt}
                fill
                sizes="50vw"
                className="object-cover transition-all duration-700 ease-luxe"
                priority={false}
                quality={100}
                unoptimized
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,27,43,0.02)_0%,rgba(11,27,43,0.08)_42%,rgba(11,27,43,0.74)_100%)]" />
              <div className="absolute inset-y-0 left-0 w-[42%] bg-[linear-gradient(90deg,rgba(11,27,43,0.34),transparent)]" />
              <div className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0" aria-hidden="true">
                {tourChoices.map((item) => (
                  <Image key={`preload-${item.href}`} src={item.image} alt="" width={1} height={1} unoptimized />
                ))}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 xl:p-10">
                <p className="text-[12px] font-extrabold uppercase tracking-[0.3em] text-gold">{activeTour.landmark}</p>
                <h2 className="mt-4 max-w-[10ch] font-serif text-[clamp(54px,5vw,96px)] font-semibold leading-[0.88] tracking-[-0.06em] text-pearl drop-shadow-[0_12px_36px_rgba(0,0,0,0.5)]">
                  {tourMenuLabel(activeTour, t('tourSuffix'))}
                </h2>
                <p className="mt-6 max-w-[52ch] text-[16px] font-bold leading-7 text-pearl/88 xl:text-[18px]">
                  {activeTour.description}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-10">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.26em] text-gold/80">{t('signatureStops')}</p>
                    <p className="mt-1.5 text-[15px] font-bold leading-6 text-pearl/80">{activeTour.note}</p>
                  </div>
                  <Link href={localizedHref(activeTour.href)} onClick={() => setToursOpen(false)} className="inline-flex min-h-[54px] min-w-[176px] items-center justify-center gap-2.5 rounded-full bg-pearl px-10 text-[13px] font-extrabold uppercase tracking-[0.18em] text-navy shadow-[0_14px_40px_rgba(0,0,0,0.2)] transition-colors duration-200 hover:bg-gold xl:min-h-[58px]">
                    {t('exploreRoute')} <ArrowUpRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      <AnimatePresence>
        {stylesOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => setStylesOpen(true)}
            onMouseLeave={() => setStylesOpen(false)}
            className="fixed inset-x-0 top-[88px] z-[140] hidden h-[calc(100vh-88px)] overflow-y-auto lg:block"
            style={{
              backgroundColor: "#f3eadb",
              backgroundImage:
                "radial-gradient(circle at 10% 0%, rgba(200,169,106,0.18), rgba(243,234,219,0) 32%), radial-gradient(circle at 86% 18%, rgba(11,27,43,0.08), rgba(243,234,219,0) 30%), linear-gradient(180deg, rgb(248,245,239) 0%, rgb(240,231,216) 100%)",
              borderTop: "1.5px solid #c9a961",
              boxShadow: "0 34px 110px rgba(11,27,43,0.30)",
            }}
          >
            <div className="mx-auto grid h-full max-w-[min(1680px,calc(100vw-64px))] grid-rows-[auto_auto_minmax(0,1fr)_auto] px-[clamp(28px,4vw,64px)] py-[clamp(18px,2.5vh,36px)]">
              
              {/* ── Dropdown header ── */}
              <div className="mb-[clamp(14px,2vh,28px)] flex items-end justify-between">
                <div className="flex items-center gap-7">
                  <div className="h-[clamp(42px,4vw,58px)] w-px bg-[#c9a961]" />
                  <div>
                    <p
                      className="mb-2 text-[clamp(0.54rem,0.55vw,0.7rem)] font-bold uppercase tracking-[0.48em] text-[#9b762a]"
                      style={{ fontFamily: "var(--font-jost), 'Jost', system-ui, sans-serif" }}
                    >
                      Choose your format
                    </p>
                    <h2
                      className="text-[clamp(1.7rem,2.25vw,2.8rem)] font-semibold leading-none tracking-tight text-[#081522]"
                      style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif" }}
                    >
                      Tour <em className="italic font-normal text-[#b88735]">Formats</em>
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setStylesOpen(false)}
                    className="group/close grid h-[44px] w-[44px] place-items-center rounded-full border border-[#0a1628]/10 bg-white text-[#0a1628]/50 shadow-[0_16px_34px_rgba(11,27,43,0.11)] transition-all duration-200 hover:-translate-y-0.5 hover:rotate-90 hover:border-[#c9a961]/55 hover:bg-[#0a1628] hover:text-[#f8f5ef] hover:shadow-[0_20px_42px_rgba(11,27,43,0.18)]"
                  >
                    <X size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* ── Gold hairline ── */}
              <div className="mb-[clamp(14px,2vh,28px)] h-px bg-gradient-to-r from-[#c9a961]/45 via-[#0a1628]/10 to-transparent" />

              {/* ── 3-column grid ── */}
              <div className="grid min-h-0 grid-cols-3 gap-[clamp(22px,2.7vw,40px)] overflow-y-auto pr-1">
                {STYLE_GROUPS.map((group, i) => (
                  <StyleGroupColumn key={group.number} group={group} index={i} localizedHref={localizedHref} onClose={() => setStylesOpen(false)} />
                ))}
              </div>

              {/* ── Footer ── */}
              <div className="mt-[clamp(12px,1.8vh,24px)] flex items-center justify-between rounded-[18px] border border-[#c9a961]/35 bg-[#eadcc4] px-[clamp(18px,2vw,32px)] py-[clamp(12px,1.5vh,18px)] shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_18px_44px_rgba(11,27,43,0.10)]">
                <p
                  className="flex items-center gap-3 text-[0.72rem] font-black uppercase tracking-[0.26em] text-[#59411b]"
                  style={{ fontFamily: "var(--font-jost), 'Jost', system-ui, sans-serif" }}
                >
                  <span className="h-px w-12 bg-[#9b762a]" />
                  Ha Long Luxury · Private Asia Journeys
                </p>
                <Link
                  href={localizedHref('/customize-your-trip/')}
                  onClick={() => setStylesOpen(false)}
                  className="group/custom relative flex min-h-[58px] items-center gap-4 overflow-hidden rounded-[14px] border border-[#8f6823]/35 bg-[linear-gradient(135deg,#d8ad4b_0%,#c9a961_48%,#9e6e20_100%)] pl-8 pr-4 text-[0.82rem] font-black uppercase tracking-[0.26em] text-[#081522] shadow-[0_16px_34px_rgba(117,78,22,0.26),inset_0_1px_0_rgba(255,255,255,0.36)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_54px_rgba(117,78,22,0.34)]"
                  style={{ fontFamily: "var(--font-jost), 'Jost', system-ui, sans-serif" }}
                >
                  <span className="pointer-events-none absolute inset-y-0 -left-12 w-10 rotate-12 bg-white/24 blur-sm transition-transform duration-500 group-hover/custom:translate-x-[360px]" />
                  <span className="relative">Design a custom trip</span>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-[#081522] text-[#f8f5ef] transition-transform duration-200 group-hover/custom:translate-x-0.5">
                    <ArrowRight size={17} strokeWidth={2.2} />
                  </span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {servicesOpen && (
        <div
          onMouseEnter={() => setServicesOpen(true)}
          className="fixed inset-x-0 top-[88px] z-[140] hidden h-[calc(100vh-88px)] isolate overflow-hidden text-navy shadow-[0_34px_110px_rgba(11,27,43,0.30)] lg:block"
          style={{
            zIndex: 1000,
            backgroundColor: '#f3eadb',
            backgroundImage:
              'radial-gradient(circle at 10% 0%, rgba(200,169,106,0.18), rgba(243,234,219,0) 32%), radial-gradient(circle at 86% 18%, rgba(11,27,43,0.08), rgba(243,234,219,0) 30%), linear-gradient(180deg, rgb(248,245,239) 0%, rgb(240,231,216) 100%)'
          }}
        >
          <button
            type="button"
            onClick={() => setServicesOpen(false)}
            className="absolute right-8 top-8 z-30 grid h-[46px] w-[46px] place-items-center rounded-full border border-navy/12 bg-pearl text-navy shadow-[0_16px_38px_rgba(11,27,43,0.12)] transition hover:border-gold hover:bg-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            aria-label={t('otherServices.closeMenu')}
          >
            <X className="h-7 w-7 stroke-[1.6]" />
          </button>

          <div
            className="relative mx-auto h-full max-w-[1380px] overflow-y-auto"
            style={{
              display: 'grid',
              gridTemplateColumns: '420px minmax(620px, 1fr)',
              gap: '64px',
              alignItems: 'start',
              padding: '48px 56px'
            }}
          >
            <section
              className="relative overflow-hidden text-pearl shadow-[0_28px_80px_rgba(11,27,43,0.24)]"
              style={{
                minHeight: '520px',
                borderRadius: '42px',
                padding: '54px 58px',
                background:
                  'radial-gradient(circle at 18% 10%, rgba(200,169,106,0.24), transparent 32%), radial-gradient(circle at 90% 92%, rgba(248,245,239,0.09), transparent 30%), linear-gradient(155deg, #071724 0%, #0a2630 58%, #143a36 100%)'
              }}
            >
              <div style={{ position: 'relative' }}>
                <p
                  className="font-extrabold uppercase text-gold"
                  style={{ fontSize: '12px', letterSpacing: '0.34em', margin: 0 }}
                >
                  {t('otherServices.eyebrow')}
                </p>
                <h2
                  className="font-serif font-semibold text-pearl"
                  style={{ fontSize: '72px', lineHeight: 0.9, letterSpacing: '-0.058em', maxWidth: '8ch', margin: '28px 0 0' }}
                >
                  {t('otherServices.heading')}
                </h2>
                <p
                  className="font-bold text-pearl/74"
                  style={{ fontSize: '16px', lineHeight: '28px', maxWidth: '40ch', margin: '26px 0 0' }}
                >
                  {t('otherServices.intro')}
                </p>
                <Link
                  href={localizedHref('/contact/?service=other-services')}
                  onClick={() => setServicesOpen(false)}
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-gold font-extrabold uppercase text-navy shadow-[0_18px_44px_rgba(0,0,0,0.18)] transition hover:bg-pearl"
                  style={{ minHeight: '54px', padding: '0 32px', fontSize: '12px', letterSpacing: '0.2em', marginTop: '32px' }}
                >
                  {t('otherServices.cta')} <ArrowUpRight className="h-5 w-5" />
                </Link>
                <div
                  className="grid border-t border-pearl/12 font-extrabold uppercase text-pearl/52"
                  style={{ gap: '12px', paddingTop: '32px', marginTop: '40px', fontSize: '12px', letterSpacing: '0.18em' }}
                >
                  <span>{t('otherServices.countNote')}</span>
                  <span>{t('otherServices.safeLinks')}</span>
                </div>
              </div>
            </section>

            <nav
              className="pt-1"
              aria-label={t('otherServices.aria')}
              style={{ display: 'grid', gap: '16px' }}
            >
              {serviceChoices.map((item, index) => {
                const external = item.external || isExternalHref(item.href);
                return (
                  <Link
                    key={item.href}
                    href={external ? item.href : localizedHref(item.href)}
                    target={external ? '_blank' : undefined}
                  rel={external ? 'noreferrer' : undefined}
                  onClick={() => setServicesOpen(false)}
                  className="group min-h-[116px] rounded-[32px] border border-navy/10 bg-pearl px-6 py-5 text-left shadow-[0_20px_54px_rgba(11,27,43,0.10)] ring-1 ring-pearl/70 transition duration-300 ease-luxe hover:-translate-y-1 hover:border-gold/45 hover:bg-ivory hover:shadow-[0_28px_78px_rgba(11,27,43,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '68px minmax(0, 1fr) 48px',
                    alignItems: 'center',
                    gap: '20px'
                  }}
                  >
                    <span className="grid h-[68px] w-[68px] place-items-center rounded-full border border-gold/32 bg-gold/12 font-serif text-[21px] font-semibold text-gold-dark shadow-[inset_0_1px_0_rgba(248,245,239,0.7)] transition group-hover:bg-gold group-hover:text-navy">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[21px] font-extrabold uppercase leading-6 tracking-[-0.03em] text-navy transition group-hover:text-gold-dark xl:text-[24px]">{item.label}</span>
                      <span className="mt-3 block max-w-[62ch] text-[14px] font-bold leading-6 text-navy/58">{item.description}</span>
                    </span>
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-navy/6 text-navy/42 transition group-hover:bg-gold group-hover:text-navy">
                      <ArrowUpRight className="h-5 w-5" />
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {aboutOpen && (
        <div
          onMouseEnter={() => setAboutOpen(true)}
          className="fixed inset-x-0 top-[88px] z-[80] hidden h-[calc(100vh-88px)] overflow-hidden bg-ivory text-navy shadow-[0_30px_90px_rgba(11,27,43,0.22)] lg:block"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(200,169,106,0.18),transparent_28%),radial-gradient(circle_at_88%_80%,rgba(11,27,43,0.08),transparent_32%)]" />
          <button
            type="button"
            onClick={() => setAboutOpen(false)}
            className="absolute right-8 top-8 z-30 grid h-[44px] w-[44px] place-items-center rounded-full border border-navy/12 bg-pearl text-navy shadow-[0_16px_38px_rgba(11,27,43,0.12)] transition hover:border-gold hover:bg-gold"
            aria-label={t('closeAboutMenu')}
          >
            <X className="h-7 w-7 stroke-[1.6]" />
          </button>

          <div className="relative mx-auto grid h-full w-[min(calc(100%_-_120px),1240px)] grid-cols-[minmax(460px,1fr)_minmax(360px,440px)] items-start gap-14 pt-16 xl:gap-20 xl:pt-20">
            <section>
              <p className="text-[12px] font-extrabold uppercase tracking-[0.34em] text-gold-dark">{t('aboutBrand')}</p>
              <h2 className="mt-6 max-w-[10ch] font-serif text-[clamp(44px,4.2vw,82px)] font-semibold leading-[0.92] tracking-[-0.06em] text-navy">
                {t('aboutTitle')}
              </h2>
              <p className="mt-8 max-w-[62ch] text-[17px] font-bold leading-8 text-navy/72">
                {t('aboutIntro')}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href={localizedHref(primaryCta.href)} onClick={() => setAboutOpen(false)} className="inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full bg-navy px-7 text-[13px] font-extrabold uppercase tracking-[0.2em] text-pearl shadow-[0_18px_44px_rgba(11,27,43,0.16)] transition hover:bg-gold hover:text-navy">
                  {primaryCta.label} <ArrowUpRight className="h-5 w-5" />
                </Link>
                <Link href={localizedHref('/contact/')} onClick={() => setAboutOpen(false)} className="inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full border border-navy/12 px-7 text-[13px] font-extrabold uppercase tracking-[0.2em] text-navy transition hover:border-gold hover:bg-champagne">
                  {t('contactTeam')} <ArrowUpRight className="h-5 w-5" />
                </Link>
              </div>
            </section>

            <nav className="border-l border-navy/12 pl-9 xl:pl-12" aria-label="About menu">
              <p className="mb-7 text-[11px] font-extrabold uppercase tracking-[0.28em] text-gold-dark">{t('explore')}</p>
              <div className="grid gap-3">
                {aboutChoices.map((item, index) => (
                  <Link
                    key={item.href}
                    href={localizedHref(item.href)}
                    onClick={() => setAboutOpen(false)}
                    className="group flex min-h-[78px] items-center gap-5 rounded-[24px] border border-transparent px-5 py-4 transition hover:border-gold/35 hover:bg-pearl hover:shadow-[0_18px_44px_rgba(11,27,43,0.08)]"
                  >
                    <span className="w-8 shrink-0 font-serif text-[18px] font-semibold text-gold-dark/72">{String(index + 1).padStart(2, '0')}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[18px] font-extrabold uppercase leading-6 tracking-[-0.02em] text-navy transition group-hover:text-gold-dark xl:text-[20px]">{item.label}</span>
                      <span className="mt-2 block text-[14px] font-bold leading-6 text-navy/54">{item.description}</span>
                    </span>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy/5 text-navy/42 transition group-hover:bg-gold group-hover:text-navy">
                      <ArrowUpRight className="h-5 w-5" />
                    </span>
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </div>
      )}

    </header>

    {/* ── MOBILE BACKDROP ── */}
    <div
      className={cn('fixed inset-0 z-[94] bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden', open ? 'opacity-100' : 'pointer-events-none opacity-0')}
      onClick={() => setOpen(false)}
      aria-hidden="true"
    />

    {/* ── MOBILE LEFT DRAWER ── */}
    <div
      className={cn('fixed inset-y-0 left-0 z-[95] flex w-[280px] flex-col bg-[#0a1628] shadow-2xl transition-transform duration-300 ease-in-out lg:hidden', open ? 'translate-x-0' : '-translate-x-full')}
      aria-hidden={!open}
      aria-modal="true"
      role="dialog"
    >
      {/* Drawer header */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
        <BrandLogo identity={siteContent.identity} variant="header" />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="grid h-9 w-9 place-items-center rounded-full text-pearl/55 transition hover:bg-white/[0.06] hover:text-pearl"
          aria-label={t('menu.close')}
        >
          <X className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </button>
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <div className="flex-1 overflow-y-auto overscroll-contain py-2">

        {usesDbPrimaryMenu ? (
          <nav aria-label={t('mobilePrimaryNav')}>
            {dbPrimaryItemsForRender.map((item) => {
              const isToursMobile = isToursMenuLabel(item.label);
              const isAboutMobile = isAboutMenuLabel(item.label);
              const isStylesMobile = isStylesMenuLabel(item.label);
              const isServicesMobile = isServicesMenuLabel(item.label);

              if (isToursMobile) return (
                <div key={item.id} className="border-b border-white/[0.05]">
                  <button type="button" className="flex w-full items-center justify-between px-5 py-4 text-pearl/85 transition-colors hover:bg-white/[0.04]" onClick={() => setMobileToursOpen((v) => !v)} aria-expanded={mobileToursOpen}>
                    <span className="text-[11.5px] font-bold leading-tight tracking-[0.10em] uppercase">{t('ourTours')}</span>
                    <ChevronDown className={cn('h-4 w-4 text-white/40 transition-transform duration-200', mobileToursOpen && '-rotate-180')} />
                  </button>
                  <div className={cn('grid transition-[grid-template-rows] duration-200 ease-out', mobileToursOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                    <div className="overflow-hidden">
                      {tourChoices.map((tc) => (
                        <Link key={tc.href} href={localizedHref(tc.href)} onClick={() => setOpen(false)}
                          className="flex items-center justify-between py-3 pl-8 pr-5 text-[12px] font-light text-white/55 transition-colors hover:bg-white/[0.04] hover:text-pearl">
                          <span>{tc.label}</span>
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/25" />
                        </Link>
                      ))}
                      <div className="h-2" />
                    </div>
                  </div>
                </div>
              );

              if (isStylesMobile) return (
                <div key={item.id} className="border-b border-white/[0.05]">
                  <button type="button" className="flex w-full items-center justify-between px-5 py-4 text-pearl/85 transition-colors hover:bg-white/[0.04]" onClick={() => setMobileStylesOpen((v) => !v)} aria-expanded={mobileStylesOpen}>
                    <span className="text-[11.5px] font-bold leading-tight tracking-[0.10em] uppercase">{t('allStyles')}</span>
                    <ChevronDown className={cn('h-4 w-4 text-white/40 transition-transform duration-200', mobileStylesOpen && '-rotate-180')} />
                  </button>
                  <div className={cn('grid transition-[grid-template-rows] duration-200 ease-out', mobileStylesOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                    <div className="overflow-hidden">
                      {tripKinds.map((style) => (
                        <Link key={style.title} href={localizedHref(tripStylePath(style))} onClick={() => setOpen(false)}
                          className="flex items-center justify-between py-3 pl-8 pr-5 text-[12px] font-light text-white/55 transition-colors hover:bg-white/[0.04] hover:text-pearl">
                          <span>{style.title}</span>
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/25" />
                        </Link>
                      ))}
                      <div className="h-2" />
                    </div>
                  </div>
                </div>
              );

              if (isServicesMobile) return (
                <div key={item.id} className="border-b border-white/[0.05]">
                  <button type="button" className="flex w-full items-center justify-between px-5 py-4 text-pearl/85 transition-colors hover:bg-white/[0.04]" onClick={() => setMobileServicesOpen((v) => !v)} aria-expanded={mobileServicesOpen}>
                    <span className="text-[11.5px] font-bold leading-tight tracking-[0.10em] uppercase">{t('otherServices.title')}</span>
                    <ChevronDown className={cn('h-4 w-4 text-white/40 transition-transform duration-200', mobileServicesOpen && '-rotate-180')} />
                  </button>
                  <div className={cn('grid transition-[grid-template-rows] duration-200 ease-out', mobileServicesOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                    <div className="overflow-hidden">
                      {serviceChoices.map((service) => {
                        const external = service.external || isExternalHref(service.href);
                        return (
                          <Link key={service.href} href={external ? service.href : localizedHref(service.href)} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} onClick={() => setOpen(false)}
                            className="flex items-center justify-between gap-4 py-3 pl-8 pr-5 text-[12px] font-light text-white/55 transition-colors hover:bg-white/[0.04] hover:text-pearl">
                            <span>{service.label}</span>
                            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/25" />
                          </Link>
                        );
                      })}
                      <div className="h-2" />
                    </div>
                  </div>
                </div>
              );

              if (isAboutMobile) return (
                <div key={item.id} className="border-b border-white/[0.05]">
                  <button type="button" className="flex w-full items-center justify-between px-5 py-4 text-pearl/85 transition-colors hover:bg-white/[0.04]" onClick={() => setMobileAboutOpen((v) => !v)} aria-expanded={mobileAboutOpen}>
                    <span className="text-[11.5px] font-bold leading-tight tracking-[0.10em] uppercase">{t('aboutUs')}</span>
                    <ChevronDown className={cn('h-4 w-4 text-white/40 transition-transform duration-200', mobileAboutOpen && '-rotate-180')} />
                  </button>
                  <div className={cn('grid transition-[grid-template-rows] duration-200 ease-out', mobileAboutOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                    <div className="overflow-hidden">
                      {aboutChoices.map((ac) => (
                        <Link key={ac.href} href={localizedHref(ac.href)} onClick={() => setOpen(false)}
                          className="flex items-center justify-between py-3 pl-8 pr-5 text-[12px] font-light text-white/55 transition-colors hover:bg-white/[0.04] hover:text-pearl">
                          <span>{ac.label}</span>
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/25" />
                        </Link>
                      ))}
                      <div className="h-2" />
                    </div>
                  </div>
                </div>
              );

              return (
                <HeaderMenuLink key={item.id} item={item} locale={currentLocale}
                  className="flex items-center justify-between border-b border-white/[0.05] px-5 py-4 text-[11.5px] font-bold leading-tight tracking-[0.10em] uppercase text-pearl/85 transition-colors hover:bg-white/[0.04]"
                  onNavigate={() => setOpen(false)}>
                  <span>{item.label}</span>
                </HeaderMenuLink>
              );
            })}
          </nav>
        ) : (
          <nav>
            {/* Tours */}
            <div className="border-b border-white/[0.05]">
              <button type="button" className="flex w-full items-center justify-between px-5 py-4 text-pearl/85 transition-colors hover:bg-white/[0.04]" onClick={() => setMobileToursOpen((v) => !v)} aria-expanded={mobileToursOpen}>
                <span className="text-[11.5px] font-bold leading-tight tracking-[0.10em] uppercase">{t('ourTours')}</span>
                <ChevronDown className={cn('h-4 w-4 text-white/40 transition-transform duration-200', mobileToursOpen && '-rotate-180')} />
              </button>
              <div className={cn('grid transition-[grid-template-rows] duration-200 ease-out', mobileToursOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                <div className="overflow-hidden">
                  {tourChoices.map((item) => (
                    <Link key={item.href} href={localizedHref(item.href)} onClick={() => setOpen(false)}
                      className="flex items-center justify-between py-3 pl-8 pr-5 text-[12px] font-light text-white/55 transition-colors hover:bg-white/[0.04] hover:text-pearl">
                      <span>{item.label}</span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/25" />
                    </Link>
                  ))}
                  <div className="h-2" />
                </div>
              </div>
            </div>

            {/* Styles */}
            <div className="border-b border-white/[0.05]">
              <button type="button" className="flex w-full items-center justify-between px-5 py-4 text-pearl/85 transition-colors hover:bg-white/[0.04]" onClick={() => setMobileStylesOpen((v) => !v)} aria-expanded={mobileStylesOpen}>
                <span className="text-[11.5px] font-bold leading-tight tracking-[0.10em] uppercase">{t('allStyles')}</span>
                <ChevronDown className={cn('h-4 w-4 text-white/40 transition-transform duration-200', mobileStylesOpen && '-rotate-180')} />
              </button>
              <div className={cn('grid transition-[grid-template-rows] duration-200 ease-out', mobileStylesOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                <div className="overflow-hidden">
                  {tripKinds.map((style) => (
                    <Link key={style.title} href={localizedHref(tripStylePath(style))} onClick={() => setOpen(false)}
                      className="flex items-center justify-between py-3 pl-8 pr-5 text-[12px] font-light text-white/55 transition-colors hover:bg-white/[0.04] hover:text-pearl">
                      <span>{style.title}</span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/25" />
                    </Link>
                  ))}
                  <div className="h-2" />
                </div>
              </div>
            </div>

            {/* Other Services */}
            <div className="border-b border-white/[0.05]">
              <button type="button" className="flex w-full items-center justify-between px-5 py-4 text-pearl/85 transition-colors hover:bg-white/[0.04]" onClick={() => setMobileServicesOpen((v) => !v)} aria-expanded={mobileServicesOpen}>
                <span className="text-[11.5px] font-bold leading-tight tracking-[0.10em] uppercase">{t('otherServices.title')}</span>
                <ChevronDown className={cn('h-4 w-4 text-white/40 transition-transform duration-200', mobileServicesOpen && '-rotate-180')} />
              </button>
              <div className={cn('grid transition-[grid-template-rows] duration-200 ease-out', mobileServicesOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                <div className="overflow-hidden">
                  {serviceChoices.map((service) => {
                    const external = service.external || isExternalHref(service.href);
                    return (
                      <Link key={service.href} href={external ? service.href : localizedHref(service.href)} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} onClick={() => setOpen(false)}
                        className="flex items-center justify-between gap-4 py-3 pl-8 pr-5 text-[12px] font-light text-white/55 transition-colors hover:bg-white/[0.04] hover:text-pearl">
                        <span>{service.label}</span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/25" />
                      </Link>
                    );
                  })}
                  <div className="h-2" />
                </div>
              </div>
            </div>

            {/* Blog */}
            <Link href={localizedHref(mobileBlogLink.href)} onClick={() => setOpen(false)}
              className="flex items-center justify-between border-b border-white/[0.05] px-5 py-4 text-[11.5px] font-bold leading-tight tracking-[0.10em] uppercase text-pearl/85 transition-colors hover:bg-white/[0.04]">
              {mobileBlogLink.label}
            </Link>

            {/* About Us accordion */}
            <div className="border-b border-white/[0.05]">
              <button type="button" className="flex w-full items-center justify-between px-5 py-4 text-pearl/85 transition-colors hover:bg-white/[0.04]" onClick={() => setMobileAboutOpen((v) => !v)} aria-expanded={mobileAboutOpen}>
                <span className="text-[11.5px] font-bold leading-tight tracking-[0.10em] uppercase">{t('aboutUs')}</span>
                <ChevronDown className={cn('h-4 w-4 text-white/40 transition-transform duration-200', mobileAboutOpen && '-rotate-180')} />
              </button>
              <div className={cn('grid transition-[grid-template-rows] duration-200 ease-out', mobileAboutOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                <div className="overflow-hidden">
                  {aboutChoices.map((item) => (
                    <Link key={item.href} href={localizedHref(item.href)} onClick={() => setOpen(false)}
                      className="flex items-center justify-between py-3 pl-8 pr-5 text-[12px] font-light text-white/55 transition-colors hover:bg-white/[0.04] hover:text-pearl">
                      <span>{item.label}</span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/25" />
                    </Link>
                  ))}
                  <div className="h-2" />
                </div>
              </div>
            </div>
          </nav>
        )}
      </div>

      {/* ── STICKY FOOTER: CTA + LANGUAGE ── */}
      <div className="shrink-0 space-y-3 border-t border-white/10 px-5 py-5">
        <CTAButton href={localizedHref(primaryCta.href)} className="w-full">{primaryCta.label}</CTAButton>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5" role="listbox" aria-label={t('language.mobileAria')}>
          {languageChoices.map((language) => {
            const selected = activeLanguage.locale === language.locale;
            return (
              <button
                key={language.locale}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => selectLanguage(language)}
                className={cn('text-[11px] font-semibold uppercase tracking-wide transition-colors', selected ? 'text-gold' : 'text-white/40 hover:text-white/75')}
              >
                {language.locale.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
}



