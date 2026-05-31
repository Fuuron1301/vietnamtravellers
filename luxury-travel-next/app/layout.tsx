import '@/app/globals.css';
import type { Metadata, Viewport } from 'next';
import type { CSSProperties } from 'react';
import { Manrope, Playfair_Display, Cormorant_Garamond, Jost } from 'next/font/google';

const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
  preload: true
});

const playfair = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-playfair',
  display: 'swap',
  preload: true
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
  preload: false
});

const jost = Jost({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-jost',
  display: 'swap',
  preload: false
});
import { NextIntlClientProvider } from 'next-intl';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { StickyCta } from '@/components/sticky-cta';
import { JsonLd } from '@/components/seo/json-ld';
import { travelAgencySchema, site } from '@/lib/seo';
import { Analytics } from '@/components/analytics';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { ScrollToTopButton } from '@/components/scroll-to-top-button';
import { HomeAfterContent } from '@/components/home/home-after-content';
import { DevExtensionErrorGuard } from '@/components/dev-extension-error-guard';
import { CmsBlockRuntime } from '@/components/blocks/cms-block-runtime';
import { getSiteContent } from '@/lib/site-content';
import { convertDesignTokensToCssVariables, getActiveDesignTokens } from '@/lib/design-runtime';
import { getMenuByLocation, isDbMenuRuntimeEnabled } from '@/lib/menus-runtime';
import { getActiveThemeTemplateBlocks, isDbThemeRuntimeEnabled } from '@/lib/theme-runtime';
import { getRequestLocale } from '@/lib/request-locale';
import { loadLocaleMessages } from '@/lib/i18n-messages';
import { localeOption } from '@/lib/i18n';
import { LocaleDocumentSync } from '@/components/locale-document';
import { PublicAutoTranslator } from '@/components/public-auto-translator';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  keywords: ['luxury tours Vietnam', 'tailor-made Southeast Asia travel', 'private Ha Long cruise', 'luxury travel Asia', 'custom Vietnam itinerary'],
  authors: [{ name: 'Ha Long Luxury Travel', url: site.url }],
  creator: 'Ha Long Luxury Travel',
  publisher: 'Ha Long Luxury Travel',
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: site.name,
    description: site.description,
    url: site.url,
    locale: 'en_US',
    images: [{ url: `${site.url}/images/og-default.jpg`, width: 1200, height: 630, alt: 'Ha Long Luxury Travel — Private Southeast Asia Journeys' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: site.name,
    description: site.description,
    images: [`${site.url}/images/og-default.jpg`]
  },
  alternates: { canonical: site.url },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 } }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [{ color: '#0B1B2B', media: '(prefers-color-scheme: dark)' }, { color: '#0B1B2B' }]
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getRequestLocale();
  const localeConfig = localeOption(locale);
  const useDbMenus = isDbMenuRuntimeEnabled();
  const useDbTheme = isDbThemeRuntimeEnabled();
  const [siteContent, designTokens, primaryMenu, footerMenu, headerBlocks, footerBlocks] = await Promise.all([
    getSiteContent(locale),
    getActiveDesignTokens(),
    useDbMenus ? getMenuByLocation('primary') : Promise.resolve(null),
    useDbMenus ? getMenuByLocation('footer') : Promise.resolve(null),
    useDbTheme ? getActiveThemeTemplateBlocks('HEADER') : Promise.resolve([]),
    useDbTheme ? getActiveThemeTemplateBlocks('FOOTER') : Promise.resolve([])
  ]);
  const messages = await loadLocaleMessages(locale);
  const designStyle = convertDesignTokensToCssVariables(designTokens) as CSSProperties;
  const hasDbHeaderTemplate = useDbTheme && headerBlocks.length > 0;
  const hasDbFooterTemplate = useDbTheme && footerBlocks.length > 0;

  return (
    <html lang={localeConfig.htmlLang} dir={localeConfig.dir} translate="no" className={`notranslate ${manrope.variable} ${playfair.variable} ${cormorant.variable} ${jost.variable}`}>
      <head>
        <meta name="google" content="notranslate" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="preconnect" href="https://images.pexels.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body style={designStyle} suppressHydrationWarning>
        <DevExtensionErrorGuard />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LocaleDocumentSync />
          <PublicAutoTranslator />
          {hasDbHeaderTemplate ? (
            <div data-cms-theme-region="header">
              <CmsBlockRuntime
                blocks={headerBlocks}
                className="relative z-[80] bg-[color:var(--cms-color-background)] px-4 py-4"
              />
            </div>
          ) : (
            <Header siteContent={siteContent} primaryMenu={primaryMenu} />
          )}
          {children}
          <HomeAfterContent />
          {hasDbFooterTemplate ? (
            <div data-cms-theme-region="footer">
              <CmsBlockRuntime
                blocks={footerBlocks}
                className="bg-[color:var(--cms-color-primary)] px-4 py-[var(--cms-space-section-y)] text-[color:var(--cms-color-background)]"
              />
            </div>
          ) : (
            <Footer siteContent={siteContent} footerMenu={footerMenu} locale={locale} />
          )}
          <StickyCta />
          <ScrollToTopButton />
          <WhatsAppButton />
          <Analytics />
          <JsonLd data={travelAgencySchema()} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
