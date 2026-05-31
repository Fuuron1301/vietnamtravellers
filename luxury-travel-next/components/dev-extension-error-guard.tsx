"use client";

import { useEffect } from 'react';

export function DevExtensionErrorGuard() {
  const isProduction = process.env.NODE_ENV === 'production';

  useEffect(() => {
    if (isProduction) return;
    const METAMASK_EXTENSION_ID = 'nkbihfbeogaeaoehlefnkodbefgpgknn';
    const extensionPattern = new RegExp('chrome-extension://' + METAMASK_EXTENSION_ID + '/', 'i');
    const messagePattern = /failed to connect to metamask|metamask extension not found|metamask/i;

    function readErrorText(value: any) {
      if (!value) return '';
      if (typeof value === 'string') return value;
      const parts: string[] = [];
      if (typeof value.message === 'string') parts.push(value.message);
      if (typeof value.stack === 'string') parts.push(value.stack);
      if (typeof value.filename === 'string') parts.push(value.filename);
      if (value.reason) parts.push(readErrorText(value.reason));
      if (value.error) parts.push(readErrorText(value.error));
      return parts.join(' ');
    }

    function isInjectedMetaMaskNoise(eventOrMessage: any, source: any, error: any) {
      const text = [readErrorText(eventOrMessage), readErrorText(source), readErrorText(error)].join(' ');
      return extensionPattern.test(text) || (messagePattern.test(text) && /chrome-extension:\/\//i.test(text));
    }

    function suppressEvent(event: Event | PromiseRejectionEvent & ErrorEvent) {
      if (!isInjectedMetaMaskNoise(event, (event as any).filename, (event as any).error || (event as any).reason)) return;
      try {
        event.preventDefault();
      } catch (e) {}
      try {
        event.stopPropagation();
      } catch (e) {}
      try {
        if (typeof (event as any).stopImmediatePropagation === 'function') (event as any).stopImmediatePropagation();
      } catch (e) {}
    }

    async function unregisterServiceWorkers() {
      if (!('serviceWorker' in navigator)) return;
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      } catch (e) {
        // ignore cleanup failures
      }
    }

    unregisterServiceWorkers();

    window.addEventListener('error', suppressEvent as EventListener, true);
    window.addEventListener('unhandledrejection', suppressEvent as EventListener, true);

    const previousOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      if (isInjectedMetaMaskNoise(message, source, error)) return true;
      if (typeof previousOnError === 'function') {
        return previousOnError.call(window, message, source, lineno, colno, error as any);
      }
      return false;
    };

    const previousUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = function(event) {
      if (isInjectedMetaMaskNoise(event, '', (event as any).reason)) {
        try { event.preventDefault(); } catch (e) {}
        return true;
      }
      if (typeof previousUnhandledRejection === 'function') {
        return previousUnhandledRejection.call(window, event as any);
      }
      return undefined;
    };

    return () => {
      window.removeEventListener('error', suppressEvent as EventListener, true);
      window.removeEventListener('unhandledrejection', suppressEvent as EventListener, true);
      window.onerror = previousOnError;
      window.onunhandledrejection = previousUnhandledRejection;
    };
  }, [isProduction]);

  return null;
}
