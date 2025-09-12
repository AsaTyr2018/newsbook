import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import '../styles/globals.css';
import NavBar from '../components/NavBar';
import { SiteContext } from '../lib/SiteContext';
import { ThemeContext, Theme } from '../lib/ThemeContext';
import Maintenance from '../components/Maintenance';

export default function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();
  const [siteName, setSiteName] = useState('NewsBlogCMS');
  const [theme, setTheme] = useState<Theme>('light');
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setSiteName(data.siteName || 'NewsBlogCMS');
        setMaintenance(data.maintenance === 'true');
      })
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

  if (maintenance) {
    return <Maintenance currentPath={router.asPath} />;
  }

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
