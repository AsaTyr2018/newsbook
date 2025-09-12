import { createContext } from 'react';

export interface SiteContextValue {
  siteName: string;
}

export const SiteContext = createContext<SiteContextValue>({ siteName: 'NewsBlogCMS' });

