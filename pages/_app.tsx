import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import '../styles/globals.css';
import NavBar from '../components/NavBar';
import { SiteContext } from '../lib/SiteContext';
import { ThemeContext, Theme } from '../lib/ThemeContext';

export default function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const [siteName, setSiteName] = useState('NewsBlogCMS');
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSiteName(data.siteName || 'NewsBlogCMS'))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const stored = (typeof window !== 'undefined' && window.localStorage.getItem('theme')) as Theme | null;
    if (stored) {
      setTheme(stored);
      if (stored === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', newTheme);
    }
  };

  return (
    <SessionProvider session={session}>
      <SiteContext.Provider value={{ siteName }}>
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
          <Head>
            <title>{siteName}</title>
          </Head>
          <NavBar />
          <Component {...pageProps} />
        </ThemeContext.Provider>
      </SiteContext.Provider>
    </SessionProvider>
  );
}
