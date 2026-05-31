'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';
import { defaultLocale, stripLocaleFromPathname } from '@/lib/i18n';
import { shouldAutoTranslatePath } from '@/lib/public-auto-translate';
import type { Locale } from '@/lib/types';

type TranslationState = {
  locale: Locale;
  source: string;
  value: string;
  originalValue: string;
};

const translationCache = new Map<string, string>();
const translatedTextValues = new Map<Locale, Set<string>>();
const inFlightTranslations = new Map<string, Promise<string>>();
const translatedNodeState = new WeakMap<Text, TranslationState>();
const translatedAttributeState = new WeakMap<Element, Map<string, TranslationState>>();
const translatedTextNodeSet = new Set<Text>();
const translatedAttributeNodeSet = new Set<Element>();
// Guards against the MutationObserver re-triggering translations while
// revertAllTranslations() is running and during React's subsequent reconciliation.
let isReverting = false;
// Module-level reference to the active scan timer so revertAllTranslations()
// can cancel it even from outside the useEffect closure.
let moduleCurrentScanTimer: number | null = null;

function revertAllTranslations(): void {
  // Cancel any pending re-scan to prevent re-translation while React reconciles.
  if (moduleCurrentScanTimer !== null) {
    window.clearTimeout(moduleCurrentScanTimer);
    moduleCurrentScanTimer = null;
  }
  isReverting = true;

  for (const node of translatedTextNodeSet) {
    const state = translatedNodeState.get(node);
    if (state && node.isConnected) {
      node.data = state.originalValue;
    }
    translatedNodeState.delete(node);
  }
  translatedTextNodeSet.clear();

  for (const element of translatedAttributeNodeSet) {
    const attrMap = translatedAttributeState.get(element);
    if (attrMap && element.isConnected) {
      for (const [attribute, state] of attrMap) {
        element.setAttribute(attribute, state.originalValue);
      }
    }
    translatedAttributeState.delete(element);
  }
  translatedAttributeNodeSet.clear();

  // Reset on next macrotask — MutationObserver callbacks fire synchronously
  // during the assignments above, so by the time setTimeout runs they have
  // already been suppressed.  React begins its reconciliation on the next tick.
  setTimeout(() => { isReverting = false; }, 0);
}

const ignoredElementSelector =
  [
    'script',
    'style',
    'noscript',
    'iframe',
    'textarea',
    'input',
    'code',
    'pre',
    'svg',
    '[translate="no"]',
    '[data-translate-no]',
    '.notranslate',
    '.hlt-wp-admin-clone',
    '.hlt-admin-login',
    '[data-admin-panel]',
    '[data-cms-theme-region="admin"]',
    '[contenteditable="true"]'
  ].join(', ');
const bodyAttributeSelector = '[title], [aria-label], [placeholder], img[alt]';
const bodyAttributeNames = ['title', 'aria-label', 'placeholder', 'alt'] as const;
const headContentSelector =
  'meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]';
const clientBatchSize = 42;
const clientBatchConcurrency = 4;

const nonTranslatableTexts = new Set([
  'IATA',
  'PATA',
  'VISA',
  'NAPAS',
  'MoMo',
  'VNPAY',
  'VietQR',
  'OnePay',
  'PayPal',
  'QR',
  'VN',
  'PAY',
  'Facebook',
  'Instagram',
  'YouTube',
  'LinkedIn'
]);

function getLocaleFromPathname(pathname: string) {
  return stripLocaleFromPathname(pathname).locale || defaultLocale;
}

function cacheKey(locale: Locale, text: string) {
  return `${locale}\0${text}`;
}

function splitText(text: string) {
  const leading = text.match(/^\s*/)?.[0] || '';
  const trailing = text.match(/\s*$/)?.[0] || '';
  const core = text.trim();
  return { leading, trailing, core };
}

function shouldTranslateCoreText(core: string) {
  if (!core || core.length < 2) return false;
  if (nonTranslatableTexts.has(core)) return false;
  if (/^(https?:|mailto:|tel:)/i.test(core)) return false;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(core)) return false;
  if (/^\+?\d[\d\s().-]+$/.test(core)) return false;
  return /[A-Za-z\u00C0-\u024F\u1E00-\u1EFF]/.test(core);
}

function isIgnoredNode(node: Text) {
  const parent = node.parentElement;
  if (!parent) return true;
  const ignoredElement = parent.closest(ignoredElementSelector);
  return Boolean(
    ignoredElement &&
      ignoredElement !== document.documentElement &&
      ignoredElement !== document.body
  );
}

function isIgnoredElement(element: Element) {
  const ignoredElement = element.closest(ignoredElementSelector);
  return Boolean(
    ignoredElement &&
      ignoredElement !== document.documentElement &&
      ignoredElement !== document.body
  );
}

function rememberTranslation(locale: Locale, source: string, translated: string) {
  translationCache.set(cacheKey(locale, source), translated);
  if (translated && translated !== source) {
    const values = translatedTextValues.get(locale) || new Set<string>();
    values.add(translated.trim());
    translatedTextValues.set(locale, values);
  }
}

function isKnownTranslatedValue(locale: Locale, core: string) {
  return translatedTextValues.get(locale)?.has(core) || false;
}

function readAttributeState(element: Element, attribute: string) {
  return translatedAttributeState.get(element)?.get(attribute);
}

function writeAttributeState(element: Element, attribute: string, state: TranslationState) {
  const attributes = translatedAttributeState.get(element) || new Map<string, TranslationState>();
  attributes.set(attribute, state);
  translatedAttributeState.set(element, attributes);
  translatedAttributeNodeSet.add(element);
}

function applyTextNodeTranslation(node: Text, locale: Locale, source: string, translated: string, leading: string, trailing: string) {
  const originalValue = `${leading}${source}${trailing}`;
  const value = `${leading}${translated || source}${trailing}`;
  if (node.data !== value) node.data = value;
  translatedNodeState.set(node, { locale, source, value, originalValue });
  translatedTextNodeSet.add(node);
}

function applyAttributeTranslation(element: Element, attribute: string, locale: Locale, source: string, translated: string, leading: string, trailing: string) {
  const originalValue = `${leading}${source}${trailing}`;
  const value = `${leading}${translated || source}${trailing}`;
  if (element.getAttribute(attribute) !== value) element.setAttribute(attribute, value);
  writeAttributeState(element, attribute, { locale, source, value, originalValue });
}

function collectTextNodes(root: ParentNode, locale: Locale, texts: Set<string>) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  let current = walker.nextNode();
  while (current) {
    const textNode = current as Text;
    if (!isIgnoredNode(textNode)) {
      const raw = textNode.data;
      const { core, leading, trailing } = splitText(raw);

      if (shouldTranslateCoreText(core)) {
        const translatedNode = translatedNodeState.get(textNode);
        if (translatedNode?.locale === locale && translatedNode.value === raw) {
          current = walker.nextNode();
          continue;
        }

        if (translatedNode && translatedNode.value !== raw) {
          translatedNodeState.delete(textNode);
        }

        if (isKnownTranslatedValue(locale, core)) {
          current = walker.nextNode();
          continue;
        }

        const key = cacheKey(locale, core);
        const cached = translationCache.get(key);
        if (cached !== undefined) {
          applyTextNodeTranslation(textNode, locale, core, cached, leading, trailing);
          current = walker.nextNode();
          continue;
        }

        if (!inFlightTranslations.has(key)) texts.add(core);
      }
    }

    current = walker.nextNode();
  }
}

function collectAttributeValue(element: Element, attribute: string, locale: Locale, texts: Set<string>) {
  const raw = element.getAttribute(attribute);
  if (!raw) return;
  const { core, leading, trailing } = splitText(raw);
  if (!shouldTranslateCoreText(core)) return;

  const state = readAttributeState(element, attribute);
  if (state?.locale === locale && state.value === raw) return;
  if (isKnownTranslatedValue(locale, core)) return;

  const key = cacheKey(locale, core);
  const cached = translationCache.get(key);
  if (cached !== undefined) {
    applyAttributeTranslation(element, attribute, locale, core, cached, leading, trailing);
    return;
  }

  if (!inFlightTranslations.has(key)) texts.add(core);
}

function collectBodyAttributes(locale: Locale, texts: Set<string>) {
  document.querySelectorAll(bodyAttributeSelector).forEach((element) => {
    if (isIgnoredElement(element)) return;
    bodyAttributeNames.forEach((attribute) => collectAttributeValue(element, attribute, locale, texts));
  });
}

function collectHeadContentAttributes(locale: Locale, texts: Set<string>) {
  document.querySelectorAll(headContentSelector).forEach((element) => {
    collectAttributeValue(element, 'content', locale, texts);
  });
}

function collectDocumentTitle(locale: Locale, texts: Set<string>) {
  const { core } = splitText(document.title);
  if (!shouldTranslateCoreText(core) || isKnownTranslatedValue(locale, core)) return;
  const key = cacheKey(locale, core);
  const cached = translationCache.get(key);
  if (cached !== undefined) {
    document.title = cached;
    return;
  }
  if (!inFlightTranslations.has(key)) texts.add(core);
}

function collectTranslatableTexts(locale: Locale) {
  const texts = new Set<string>();
  if (document.body) {
    collectTextNodes(document.body, locale, texts);
    collectBodyAttributes(locale, texts);
  }
  collectHeadContentAttributes(locale, texts);
  collectDocumentTitle(locale, texts);
  return Array.from(texts);
}

function applyTranslationsToCurrentDom(locale: Locale, translations: Map<string, string>) {
  if (!translations.size) return;

  if (document.body) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let current = walker.nextNode();
    while (current) {
      const textNode = current as Text;
      if (!isIgnoredNode(textNode)) {
        const { core, leading, trailing } = splitText(textNode.data);
        const translated = translations.get(core);
        if (translated !== undefined) {
          applyTextNodeTranslation(textNode, locale, core, translated, leading, trailing);
        }
      }
      current = walker.nextNode();
    }

    document.querySelectorAll(bodyAttributeSelector).forEach((element) => {
      if (isIgnoredElement(element)) return;
      bodyAttributeNames.forEach((attribute) => {
        const raw = element.getAttribute(attribute);
        if (!raw) return;
        const { core, leading, trailing } = splitText(raw);
        const translated = translations.get(core);
        if (translated !== undefined) {
          applyAttributeTranslation(element, attribute, locale, core, translated, leading, trailing);
        }
      });
    });
  }

  document.querySelectorAll(headContentSelector).forEach((element) => {
    const raw = element.getAttribute('content');
    if (!raw) return;
    const { core, leading, trailing } = splitText(raw);
    const translated = translations.get(core);
    if (translated !== undefined) {
      applyAttributeTranslation(element, 'content', locale, core, translated, leading, trailing);
    }
  });

  const { core } = splitText(document.title);
  const translatedTitle = translations.get(core);
  if (translatedTitle !== undefined) document.title = translatedTitle;
}

async function translateTexts(locale: Locale, texts: string[]) {
  const response = await fetch('/api/public-translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ locale, texts })
  });

  if (!response.ok) {
    throw new Error(`Translation API failed with ${response.status}`);
  }

  const payload = (await response.json()) as { translations?: unknown };
  if (!Array.isArray(payload.translations)) {
    throw new Error('Invalid translation API payload');
  }

  return payload.translations.map((item) => (typeof item === 'string' ? item : ''));
}

function chunkClientTexts(texts: string[]) {
  const chunks: string[][] = [];
  for (let index = 0; index < texts.length; index += clientBatchSize) {
    chunks.push(texts.slice(index, index + clientBatchSize));
  }
  return chunks;
}

async function runWithConcurrency(tasks: Array<() => Promise<void>>, concurrency: number) {
  let index = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, tasks.length) }, async () => {
      while (index < tasks.length) {
        const task = tasks[index];
        index += 1;
        await task();
      }
    })
  );
}

async function translateBatch(locale: Locale, texts: string[], isCancelled: () => boolean) {
  const sourceTexts = texts.filter((text) => {
    const key = cacheKey(locale, text);
    return translationCache.get(key) === undefined && !inFlightTranslations.has(key);
  });
  if (!sourceTexts.length || isCancelled()) return;

  const batchPromise = translateTexts(locale, sourceTexts);
  const perTextPromises = sourceTexts.map((text, index) => batchPromise.then((translations) => translations[index] || text));
  sourceTexts.forEach((text, index) => {
    inFlightTranslations.set(cacheKey(locale, text), perTextPromises[index]);
  });

  try {
    const translatedTexts = await batchPromise;
    const translatedMap = new Map<string, string>();
    sourceTexts.forEach((text, index) => {
      const translated = translatedTexts[index] || text;
      rememberTranslation(locale, text, translated);
      translatedMap.set(text, translated);
    });

    if (!isCancelled()) applyTranslationsToCurrentDom(locale, translatedMap);
  } catch {
    sourceTexts.forEach((text) => rememberTranslation(locale, text, text));
  } finally {
    sourceTexts.forEach((text, index) => {
      const key = cacheKey(locale, text);
      if (inFlightTranslations.get(key) === perTextPromises[index]) {
        inFlightTranslations.delete(key);
      }
    });
  }
}

export function PublicAutoTranslator() {
  const pathname = usePathname() || '/';
  const locale = useMemo(() => getLocaleFromPathname(pathname), [pathname]);
  const shouldTranslate = shouldAutoTranslatePath(pathname) && locale !== defaultLocale;
  const scanTimerRef = useRef<number | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const scanRunningRef = useRef(false);
  const scanQueuedRef = useRef(false);

  // Revert all translated DOM nodes before React starts reconciling during navigation.
  // This prevents "Hydration failed" errors caused by translated text mismatching the vDOM.
  useEffect(() => {
    const handleNavigate = () => revertAllTranslations();

    // Modern Navigation API (Chrome 102+, Edge 105+) — fires BEFORE React processes navigation
    const nav = (window as unknown as { navigation?: EventTarget }).navigation;
    if (nav) {
      nav.addEventListener('navigate', handleNavigate);
    }

    // Fallback: intercept link clicks in capture phase (fires before React's synthetic events)
    const handleLinkClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest('a[href]')) {
        handleNavigate();
      }
    };
    document.addEventListener('click', handleLinkClick, true);

    // Browser back/forward
    window.addEventListener('popstate', handleNavigate);

    return () => {
      if (nav) nav.removeEventListener('navigate', handleNavigate);
      document.removeEventListener('click', handleLinkClick, true);
      window.removeEventListener('popstate', handleNavigate);
    };
  }, []);

  useEffect(() => {
    if (!shouldTranslate) {
      if (scanTimerRef.current) {
        window.clearTimeout(scanTimerRef.current);
        scanTimerRef.current = null;
      }

      observerRef.current?.disconnect();
      observerRef.current = null;
      return;
    }

    let cancelled = false;
    const isCancelled = () => cancelled;

    const scheduleScan = (delay = 120) => {
      if (scanTimerRef.current !== null) {
        window.clearTimeout(scanTimerRef.current);
      }

      const timerId = window.setTimeout(() => {
        moduleCurrentScanTimer = null;
        scanTimerRef.current = null;
        void runScan();
      }, delay);
      scanTimerRef.current = timerId;
      moduleCurrentScanTimer = timerId;
    };

    const runScan = async () => {
      if (scanRunningRef.current) {
        scanQueuedRef.current = true;
        return;
      }

      scanRunningRef.current = true;
      try {
        const texts = collectTranslatableTexts(locale);
        if (texts.length > 0) {
          const tasks = chunkClientTexts(texts).map((chunk) => () => translateBatch(locale, chunk, isCancelled));
          await runWithConcurrency(tasks, clientBatchConcurrency);
        }
      } finally {
        scanRunningRef.current = false;
        if (!cancelled && scanQueuedRef.current) {
          scanQueuedRef.current = false;
          scheduleScan(180);
        }
      }
    };

    // Module-level observer rIC id (debounces structural-mutation retranslation)
    let observerRicId: number | null = null;

    const observer = new MutationObserver((mutations) => {
      if (!shouldTranslate || isReverting) return;
      // For character-data-only mutations React overwrote previously translated text.
      // Re-translate immediately from cache (delay=0) to avoid a visible English flash.
      const hasOnlyCharData = mutations.every((m) => m.type === 'characterData');
      if (hasOnlyCharData) {
        scheduleScan(0);
      } else if ('requestIdleCallback' in window) {
        // Structural DOM changes (RSC streaming / React commit) — wait for browser idle
        // so React finishes hydrating all new nodes before we translate them.
        if (observerRicId !== null) {
          window.cancelIdleCallback(observerRicId);
        }
        observerRicId = window.requestIdleCallback(
          () => { observerRicId = null; if (!isCancelled() && !isReverting) scheduleScan(0); },
          { timeout: 1500 }
        );
      } else {
        scheduleScan(800);
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
    observerRef.current = observer;

    // Schedule the initial scan. Use requestIdleCallback so we only start
    // translating after React has finished ALL hydration work (including
    // streaming Suspense boundaries). Falls back to a long delay for Safari.
    let pendingRicId: number | null = null;
    if ('requestIdleCallback' in window) {
      pendingRicId = window.requestIdleCallback(
        () => { pendingRicId = null; if (!cancelled) scheduleScan(0); },
        { timeout: 2000 }
      );
    } else {
      scheduleScan(800);
    }

    return () => {
      cancelled = true;
      if (pendingRicId !== null) {
        window.cancelIdleCallback(pendingRicId);
        pendingRicId = null;
      }
      if (observerRicId !== null) {
        window.cancelIdleCallback(observerRicId);
        observerRicId = null;
      }
      if (scanTimerRef.current !== null) {
        window.clearTimeout(scanTimerRef.current);
        if (moduleCurrentScanTimer === scanTimerRef.current) {
          moduleCurrentScanTimer = null;
        }
        scanTimerRef.current = null;
      }

      observer.disconnect();
      if (observerRef.current === observer) {
        observerRef.current = null;
      }
    };
  }, [locale, shouldTranslate]);

  return null;
}
