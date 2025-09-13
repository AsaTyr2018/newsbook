import { createContext } from 'react';

export type Locale = 'de-DE' | 'en-EN';

export const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
}>({
  locale: 'en-EN',
  setLocale: () => {},
});
