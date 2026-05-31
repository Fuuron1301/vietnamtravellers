'use client';

type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: string, params: EventParams = {}) {
  if (typeof window === 'undefined') return;
  const gtag = (window as unknown as { gtag?: (event: string, name: string, params: EventParams) => void }).gtag;
  if (gtag) gtag('event', name, params);
}
