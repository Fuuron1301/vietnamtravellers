'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  Award,
  BadgeCheck,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Plane,
  Phone,
  ShieldCheck,
  Youtube
} from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { defaultLocale, localizeHref } from '@/lib/i18n';
import type { CmsMenuItem, CmsMenuTree } from '@/lib/menus-types';
import { defaultSiteContent, type SiteContent } from '@/lib/site-content-schema';
import type { Locale } from '@/lib/types';

const defaultMapLink =
  'https://www.google.com/maps?ll=21.035974,105.851913&z=16&t=m&hl=vi&gl=US&mapclient=embed&cid=2990637696405975621';

const partnerMarks = [
  {
    name: 'Vietnam Travelers',
    note: 'Local journey team',
    src: '/images/trusted-by/vietnamtravelers-logo-transparent.png',
    width: 132,
    height: 70
  },
  {
    name: 'Trustpilot',
    note: 'Excellent rated',
    src: '/images/trusted-by/trustpilot-logo-transparent.png',
    width: 132,
    height: 54
  },
  {
    name: 'GetYourGuide',
    note: 'Partner network',
    src: '/images/trusted-by/getyourguide-logo.svg',
    width: 118,
    height: 72
  },
  {
    name: 'Klook',
    note: 'Experience partner',
    src: '/images/trusted-by/klook-logo-transparent.png',
    width: 132,
    height: 42
  }
];

const awardMarks = [
  {
    title: 'Travelers Choice',
    note: 'Best of the Best',
    icon: Award
  },
  {
    title: 'IATA',
    note: 'Air travel standard',
    icon: Plane
  },
  {
    title: 'PATA',
    note: 'Pacific Asia network',
    icon: BadgeCheck
  }
];

const socialLinks = [
  { label: 'Facebook', href: 'https://www.facebook.com/', icon: Facebook },
  { label: 'Instagram', href: 'https://www.instagram.com/', icon: Instagram },
  { label: 'YouTube', href: 'https://www.youtube.com/', icon: Youtube },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/', icon: Linkedin }
];

const paymentBadges = ['VietQR', 'NAPAS', 'MoMo', 'VNPAY', 'Visa', 'Mastercard', 'OnePay', 'PayPal'] as const;

function isExternalHref(href: string) {
  return /^(https?:|mailto:|tel:)/i.test(href);
}

function FooterLink({ href, locale, target, children }: { href: string; locale: Locale; target?: string; children: React.ReactNode }) {
  const safeTarget = target === '_blank' ? '_blank' : undefined;
  const rel = safeTarget ? 'noreferrer' : undefined;
  const className = 'group/footer-link flex min-h-[42px] items-center justify-between gap-4 rounded-full border border-transparent px-4 text-[15px] font-bold tracking-[-0.018em] text-pearl/64 transition duration-300 ease-luxe hover:translate-x-1 hover:border-pearl/12 hover:bg-pearl/[0.07] hover:text-gold';
  const localizedHref = localizeHref(href, locale);
  const content = (
    <>
      <span className="whitespace-nowrap">{children}</span>
      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition duration-300 ease-luxe group-hover/footer-link:translate-x-0.5 group-hover/footer-link:-translate-y-0.5 group-hover/footer-link:opacity-100" />
    </>
  );

  if (isExternalHref(href)) {
    return (
      <a href={href} target={safeTarget} rel={rel} className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link
      href={localizedHref}
      target={safeTarget}
      rel={rel}
      className={className}
    >
      {content}
    </Link>
  );
}

function footerColumnId(title: string) {
  return `footer-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function normalizeTitle(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function navLinkToMenuItem(link: SiteContent['footer']['columns'][number]['links'][number], index: number): CmsMenuItem {
  return {
    id: `fallback-footer-destination-${index}-${link.href}`,
    label: link.label,
    href: link.href,
    target: '',
    cssClasses: [],
    linkedPost: null,
    children: []
  };
}

function footerColumnsFromMenu(menu: CmsMenuTree | null, fallback: SiteContent['footer']['columns']) {
  if (!menu?.items.length) return fallback;
  const standaloneLinks: CmsMenuItem[] = [];
  const columns = menu.items.flatMap((item) => {
    if (!item.children.length) {
      standaloneLinks.push(item);
      return [];
    }
    return [{ title: item.label, links: item.children }];
  });

  const destinationFallbackLinks = fallback.find((column) => normalizeTitle(column.title).includes('destination'))?.links || [];
  const destinationFallbackItems = destinationFallbackLinks.map((link, index) => navLinkToMenuItem(link, index));
  if (destinationFallbackItems.length) {
    const destinationColumn = columns.find((column) => normalizeTitle(column.title).includes('destination'));
    if (destinationColumn) {
      const seen = new Set(destinationColumn.links.map((item) => item.href));
      destinationColumn.links = [...destinationColumn.links, ...destinationFallbackItems.filter((item) => !seen.has(item.href))];
    } else {
      columns.unshift({ title: 'Destinations', links: destinationFallbackItems });
    }
  }

  if (standaloneLinks.length) columns.unshift({ title: menu.name || 'Footer', links: standaloneLinks });
  return columns.length ? columns : fallback;
}

function PaymentBadge({ label }: { label: (typeof paymentBadges)[number] }) {
  return (
    <span
      data-footer-payment-badge
      aria-label={`${label} accepted`}
      className="group/pay inline-flex h-[34px] min-w-[60px] items-center justify-center rounded-[8px] border border-pearl/50 bg-[#eef6ff] px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_10px_18px_rgba(0,0,0,0.12)] transition duration-300 ease-luxe hover:-translate-y-0.5 hover:border-gold/70 hover:bg-pearl hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_14px_26px_rgba(200,169,106,0.18)]"
    >
      {label === 'VietQR' && (
        <span className="inline-flex items-center gap-2 leading-none">
          <span className="grid h-[17px] w-[17px] place-items-center rounded-[3px] bg-[#0b7bd3] shadow-[inset_0_0_0_2px_rgba(255,255,255,0.35)]">
            <span className="h-[7px] w-[7px] rounded-[1px] border-[1.5px] border-white" />
          </span>
          <span className="text-[10px] font-black tracking-[-0.05em]">
            <span className="text-[#1167b1]">Viet</span>
            <span className="text-[#18a058]">QR</span>
          </span>
        </span>
      )}
      {label === 'NAPAS' && (
        <span className="relative inline-flex min-w-[52px] items-center justify-center overflow-hidden rounded-[4px] bg-white px-1.5 py-[0.45rem] text-[10px] font-black uppercase italic tracking-[-0.08em] text-[#0a4c98] ring-1 ring-[#dbe8f7]">
          NAPAS
          <span className="absolute bottom-0 right-0 h-[3px] w-[18px] rounded-tl-full bg-[#f37021]" />
        </span>
      )}
      {label === 'MoMo' && (
        <span className="grid h-[22px] min-w-[46px] place-items-center rounded-[5px] bg-[#a50064] px-2 text-[10px] font-black leading-none tracking-[-0.06em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.24)]">
          MoMo
        </span>
      )}
      {label === 'VNPAY' && (
        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase leading-none tracking-[-0.08em]">
          <span className="rounded-[3px] bg-[#005baa] px-1.5 py-[0.34rem] text-white">VN</span>
          <span className="rounded-[3px] bg-[#e31b23] px-1.5 py-[0.34rem] text-white">PAY</span>
        </span>
      )}
      {label === 'Visa' && (
        <span className="text-[12px] font-black italic leading-none tracking-[-0.12em] text-[#1d4fa3]">
          VISA
        </span>
      )}
      {label === 'Mastercard' && (
        <span className="relative h-[18px] w-[32px]" aria-hidden="true">
          <span className="absolute left-0 top-0 h-[18px] w-[18px] rounded-full bg-[#eb001b]" />
          <span className="absolute right-0 top-0 h-[18px] w-[18px] rounded-full bg-[#f79e1b] mix-blend-multiply" />
        </span>
      )}
      {label === 'OnePay' && (
        <span className="grid h-[20px] w-[34px] place-items-center rounded-[3px] bg-[#2a6a75] text-[7px] font-black uppercase leading-none text-white ring-1 ring-white/45">
          OnePay
        </span>
      )}
      {label === 'PayPal' && (
        <span className="text-[10px] font-black leading-none tracking-[-0.05em]">
          <span className="text-[#003087]">Pay</span>
          <span className="text-[#009cde]">Pal</span>
        </span>
      )}
    </span>
  );
}

export function Footer({
  siteContent = defaultSiteContent,
  footerMenu = null,
  locale = defaultLocale
}: {
  siteContent?: SiteContent;
  footerMenu?: CmsMenuTree | null;
  locale?: Locale;
}) {
  const footer = siteContent.footer;
  const mapLink = footer.mapLink || defaultMapLink;
  const footerColumns = footerColumnsFromMenu(footerMenu, footer.columns);

  return (
    <footer className="relative w-full overflow-hidden bg-[linear-gradient(145deg,#061521_0%,#082f38_48%,#0f4a42_100%)] text-pearl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(200,169,106,0.2),transparent_30%),radial-gradient(circle_at_88%_78%,rgba(248,245,239,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.18))]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(248,245,239,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(248,245,239,0.12)_1px,transparent_1px)] [background-size:52px_52px]" />
      <div className="pointer-events-none absolute right-[-0.06em] top-[-0.14em] hidden font-serif text-[clamp(96px,13vw,240px)] font-black uppercase leading-none tracking-[-0.1em] text-pearl/[0.045] lg:block">
            VOYAGE
      </div>

      <div className="relative mx-auto max-w-[1680px] px-[clamp(26px,5vw,96px)] py-[clamp(48px,5.8vw,86px)]">
        <section aria-label="Travel partners and accreditations" className="relative grid justify-items-center gap-x-[clamp(28px,4.4vw,66px)] gap-y-9 border-b border-pearl/18 pb-[clamp(36px,4.4vw,64px)] sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-[repeat(7,minmax(108px,1fr))]">
          {awardMarks.slice(0, 1).map((mark) => {
            const Icon = mark.icon;

            return (
              <div key={mark.title} className="group/award flex min-h-[96px] w-full flex-col items-center justify-center text-center opacity-72 transition duration-500 ease-luxe hover:-translate-y-1 hover:opacity-100">
                <Icon className="h-10 w-10 stroke-[1.4] text-gold transition duration-500 ease-luxe group-hover/award:scale-110 group-hover/award:drop-shadow-[0_10px_22px_rgba(200,169,106,0.34)]" />
                <p className="mt-3 text-[12px] font-black uppercase leading-4 tracking-[0.1em] text-pearl/78 transition duration-300 group-hover/award:text-gold">{mark.title}</p>
                <p className="mt-1.5 text-[11px] font-bold text-pearl/42 transition duration-300 group-hover/award:text-pearl/68">{mark.note}</p>
              </div>
            );
          })}

          {partnerMarks.map((mark) => (
            <div data-footer-partner-mark key={mark.name} className="group/logo flex min-h-[96px] w-full flex-col items-center justify-center text-center opacity-62 transition duration-500 ease-luxe hover:-translate-y-1 hover:opacity-100">
              <Image
                src={mark.src}
                alt={`${mark.name} logo`}
                width={mark.width}
                height={mark.height}
                className="max-h-[58px] w-auto object-contain grayscale brightness-150 contrast-75 transition duration-500 ease-luxe group-hover/logo:scale-[1.08] group-hover/logo:grayscale-0 group-hover/logo:brightness-110 group-hover/logo:contrast-100 group-hover/logo:drop-shadow-[0_12px_24px_rgba(200,169,106,0.22)]"
              />
              <p className="mt-3 text-[11px] font-bold text-pearl/42 transition duration-300 group-hover/logo:text-pearl/72">{mark.note}</p>
            </div>
          ))}

          {awardMarks.slice(1).map((mark) => {
            const Icon = mark.icon;

            return (
              <div key={mark.title} className="group/award flex min-h-[96px] w-full flex-col items-center justify-center text-center opacity-72 transition duration-500 ease-luxe hover:-translate-y-1 hover:opacity-100">
                <Icon className="h-10 w-10 stroke-[1.4] text-pearl/50 transition duration-500 ease-luxe group-hover/award:scale-110 group-hover/award:text-gold group-hover/award:drop-shadow-[0_10px_22px_rgba(200,169,106,0.34)]" />
                <p className="mt-3 text-[20px] font-black uppercase leading-none tracking-[-0.04em] text-pearl/62 transition duration-300 group-hover/award:text-gold">{mark.title}</p>
                <p className="mt-1.5 text-[11px] font-bold text-pearl/42 transition duration-300 group-hover/award:text-pearl/68">{mark.note}</p>
              </div>
            );
          })}
        </section>

        <div className="relative grid gap-x-[clamp(44px,6vw,112px)] gap-y-14 border-b border-pearl/18 py-[clamp(40px,5vw,72px)] md:grid-cols-2 xl:grid-cols-[1.18fr_0.86fr_0.86fr_0.86fr]">
          <section aria-labelledby="footer-contact" className="p-[clamp(10px,2vw,22px)]">
            <p id="footer-contact" className="text-[clamp(21px,1.45vw,26px)] font-black tracking-[-0.045em] text-white">{footer.contactHeading}</p>
            <p className="mt-3 text-[14px] font-bold leading-7 text-pearl/54">{footer.openHours}</p>
            <div className="mt-8 grid gap-6 text-[clamp(15px,1vw,17px)] font-bold leading-8 text-pearl/72">
              <a href={footer.phoneHref} className="group/contact flex items-start gap-3 transition duration-300 ease-luxe hover:-translate-y-0.5 hover:text-gold">
                <Phone className="mt-1.5 h-4 w-4 shrink-0 text-gold transition duration-300 group-hover/contact:scale-110" />
                <span>{footer.phoneLabel}<br />{footer.phoneDisplay}</span>
              </a>
              <a href={`mailto:${footer.email}`} className="group/contact flex items-center gap-3 transition duration-300 ease-luxe hover:-translate-y-0.5 hover:text-gold">
                <Mail className="h-4 w-4 shrink-0 text-gold transition duration-300 group-hover/contact:scale-110" />
                <span>{footer.email}</span>
              </a>
              <a href={mapLink} target="_blank" rel="noreferrer" className="group/contact flex items-start gap-3 transition duration-300 ease-luxe hover:-translate-y-0.5 hover:text-gold">
                <MapPin className="mt-1.5 h-4 w-4 shrink-0 text-gold transition duration-300 group-hover/contact:scale-110" />
                <span>{footer.address}</span>
              </a>
            </div>
            <div className="mt-12 flex flex-wrap items-center gap-[18px] md:gap-[22px]">
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    className="group/social grid h-12 w-12 shrink-0 place-items-center rounded-full border border-pearl/24 bg-pearl/[0.055] text-pearl/68 shadow-[0_0_0_rgba(0,0,0,0)] transition duration-300 ease-luxe hover:-translate-y-1 hover:scale-105 hover:border-gold/70 hover:bg-gold hover:text-navy hover:shadow-[0_14px_30px_rgba(200,169,106,0.24)]"
                  >
                    <Icon className="h-[18px] w-[18px] transition duration-300 group-hover/social:scale-110" />
                  </a>
                );
              })}
            </div>
          </section>

          {footerColumns.map((column) => {
            const isDestinationColumn = normalizeTitle(column.title).includes('destination');
            const columnId = footerColumnId(column.title);
            const navLayout = isDestinationColumn
              ? 'mt-6 grid gap-x-3 gap-y-1.5 sm:grid-cols-2 xl:gap-x-4'
              : 'mt-6 grid gap-1.5';

            return (
              <section key={column.title} aria-labelledby={columnId} className="min-w-0">
                <p id={columnId} className="text-[clamp(19px,1.25vw,23px)] font-black tracking-[-0.04em] text-white">{column.title}</p>
                <nav className={navLayout} aria-label={`Footer ${column.title} links`}>
                  {column.links.map((item) => (
                    <FooterLink key={`${column.title}-${item.href}-${item.label}`} href={item.href} locale={locale} target={'target' in item ? item.target : undefined}>
                      {item.label}
                    </FooterLink>
                  ))}
                </nav>
              </section>
            );
          })}

        </div>

        <div className="relative grid gap-[clamp(28px,4vw,56px)] pt-[clamp(44px,5vw,74px)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <BrandLogo variant="footer" identity={siteContent.identity} />
            <p className="mt-10 max-w-[62rem] text-[14px] font-bold leading-8 text-pearl/50">
              {footer.copyright}
            </p>
          </div>

          <div className="grid gap-8 lg:min-w-[min(760px,54vw)]">
            <div className="grid gap-4 lg:justify-items-end">
              <span className="inline-flex items-center gap-2 text-[14px] font-black tracking-[-0.02em] text-white">
                <ShieldCheck className="h-4 w-4 fill-[#4fd5c8]/20 text-[#4fd5c8]" />
                Secured Payment:
              </span>
              <span className="flex flex-wrap items-center gap-x-4 gap-y-4 lg:justify-end">
                {paymentBadges.map((label) => (
                  <PaymentBadge key={label} label={label} />
                ))}
              </span>
            </div>
            <a
              href={mapLink}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex min-h-[56px] w-fit items-center gap-3 rounded-full border border-pearl/14 bg-pearl/[0.06] px-6 text-[12px] font-black uppercase tracking-[0.18em] text-pearl transition duration-300 ease-luxe hover:border-gold hover:bg-gold hover:text-navy lg:ml-auto"
            >
              Hanoi office <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <div className="flex flex-wrap gap-x-12 gap-y-3 lg:justify-end">
              {footer.legalLinks.map((item) => (
                <Link
                  key={item.label}
                  href={localizeHref(item.href, locale)}
                  className="inline-flex items-center px-2 py-1.5 text-[12px] font-black uppercase tracking-[0.12em] text-pearl/62 transition duration-300 ease-luxe hover:text-gold"
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
