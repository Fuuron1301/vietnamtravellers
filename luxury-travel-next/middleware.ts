import { NextRequest, NextResponse } from 'next/server';
import {
  defaultLocale,
  localeCookieName,
  localeHeaderName,
  localizePathname,
  normalizeLocale,
  pathIsLocalizable,
  stripLocaleFromPathname
} from './lib/i18n';
import type { Locale } from './lib/types';

const ADMIN_SESSION_COOKIE = process.env.ADMIN_SESSION_COOKIE || 'hlt_admin_session';
const ONE_YEAR = 60 * 60 * 24 * 365;

function setLocaleCookie(response: NextResponse, locale: Locale) {
  response.cookies.set({
    name: localeCookieName,
    value: locale,
    maxAge: ONE_YEAR,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });
  return response;
}

function redirectWithLocale(request: NextRequest, href: string, locale: Locale) {
  return setLocaleCookie(NextResponse.redirect(new URL(href, request.url)), locale);
}

function requestHeadersWithLocale(request: NextRequest, locale: Locale) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(localeHeaderName, locale);
  requestHeaders.set('x-next-intl-locale', locale);
  return requestHeaders;
}

function isAdminPath(pathname: string) {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

function isAdminLoginPath(pathname: string) {
  return pathname === '/admin/login' || pathname.startsWith('/admin/login/');
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (!pathIsLocalizable(pathname)) return NextResponse.next();

  const parsedPath = stripLocaleFromPathname(pathname);
  const cookieLocale = normalizeLocale(request.cookies.get(localeCookieName)?.value, defaultLocale);
  const locale = parsedPath.locale || cookieLocale;
  const internalPath = parsedPath.pathname;
  const localizedPath = localizePathname(internalPath, locale, search);
  const adminNextPath = `${internalPath}${search}`;
  const requestHeaders = requestHeadersWithLocale(request, defaultLocale);

  if (isAdminPath(internalPath)) {
    if (parsedPath.locale) {
      const url = request.nextUrl.clone();
      url.pathname = internalPath;
      url.search = search;
      return NextResponse.redirect(url);
    }

    if (!isAdminLoginPath(internalPath) && !request.cookies.get(ADMIN_SESSION_COOKIE)?.value) {
      // In development, defer auth to the page-level handler so the dev DB-unreachable bypass can take effect.
      if (process.env.NODE_ENV === 'production') {
        const loginUrl = new URL(`/admin/login?next=${encodeURIComponent(adminNextPath)}`, request.url);
        return NextResponse.redirect(loginUrl);
      }
    }

    return NextResponse.next({
      request: { headers: requestHeaders }
    });
  }

  if (parsedPath.locale === defaultLocale) {
    return redirectWithLocale(request, localizePathname(internalPath, defaultLocale, search), defaultLocale);
  }

  if (!parsedPath.locale && locale !== defaultLocale) {
    return redirectWithLocale(request, localizedPath, locale);
  }

  if (parsedPath.locale && parsedPath.locale !== defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = internalPath;
    const response = NextResponse.rewrite(url, {
      request: { headers: requestHeadersWithLocale(request, locale) }
    });
    return setLocaleCookie(response, locale);
  }

  return setLocaleCookie(
    NextResponse.next({
      request: { headers: requestHeadersWithLocale(request, locale) }
    }),
    locale
  );
}

export const config = {
  matcher: ['/((?!api|_next|images|uploads|favicon.ico|robots.txt|sitemap.xml|manifest.json).*)']
};
