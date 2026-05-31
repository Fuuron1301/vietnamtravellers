import type { Locale } from './types';
import { defaultLocale } from './i18n';

type MessageBundle = Record<string, unknown>;

const loaders: Record<Locale, () => Promise<{ default: MessageBundle }>> = {
  en: () => import('@/messages/en.json'),
  fr: () => import('@/messages/fr.json'),
  vi: () => import('@/messages/vi.json'),
  zh: () => import('@/messages/zh.json'),
  ko: () => import('@/messages/ko.json'),
  ja: () => import('@/messages/ja.json'),
  de: () => import('@/messages/de.json'),
  es: () => import('@/messages/es.json'),
  th: () => import('@/messages/th.json'),
  nl: () => import('@/messages/nl.json'),
  ar: () => import('@/messages/ar.json'),
  it: () => import('@/messages/it.json')
};

export async function loadLocaleMessages(locale: Locale): Promise<MessageBundle> {
  try {
    return (await loaders[locale]()).default;
  } catch {
    return (await loaders[defaultLocale]()).default;
  }
}
