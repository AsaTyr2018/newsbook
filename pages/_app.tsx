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
  const [authBaseUrl, setAuthBaseUrl] = useState('');

  useEffect(() => {
    const fetchSettings = () => {
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          setSiteName(data.siteName || 'NewsBlogCMS');
          setMaintenance(data.maintenance === 'true');
        })
        .catch(() => {});
    };
    fetchSettings();
    const interval = setInterval(fetchSettings, 5000);
    return () => clearInterval(interval);
  }, [router.asPath]);

  useEffect(() => {
    const stored = (typeof window !== 'undefined' && window.localStorage.getItem('theme')) as Theme | null;
    if (stored) {
      setTheme(stored);
      if (stored === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAuthBaseUrl(window.location.origin);
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
    <SessionProvider session={session} baseUrl={authBaseUrl}>
      <SiteContext.Provider value={{ siteName }}>
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
          <Head>
            <title>{siteName}</title>
          </Head>
          <div className="min-h-screen p-4 bg-gray-100 dark:bg-gray-950">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
              <NavBar />
              <main className="p-4">
                <Component {...pageProps} />
              </main>
            </div>
          </div>
        </ThemeContext.Provider>
      </SiteContext.Provider>
    </SessionProvider>
  );
}
