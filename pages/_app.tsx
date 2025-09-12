import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import '../styles/globals.css';
import NavBar from '../components/NavBar';
import { SiteContext } from '../lib/SiteContext';

export default function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const [siteName, setSiteName] = useState('NewsBlogCMS');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSiteName(data.siteName || 'NewsBlogCMS'))
      .catch(() => {});
  }, []);

  return (
    <SessionProvider session={session}>
      <SiteContext.Provider value={{ siteName }}>
        <Head>
          <title>{siteName}</title>
        </Head>
        <NavBar />
        <Component {...pageProps} />
      </SiteContext.Provider>
    </SessionProvider>
  );
}
