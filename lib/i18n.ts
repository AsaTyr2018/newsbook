import de from '../locales/de.json';
import en from '../locales/en.json';
import { Locale } from './LocaleContext';

const dictionaries: Record<Locale, Record<string, string>> = {
  'de-DE': de,
  'en-EN': en,
};

export function t(locale: Locale, key: string): string {
  return dictionaries[locale][key] || key;
}
