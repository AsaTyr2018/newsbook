import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useContext, useEffect, useState } from 'react';
import { SiteContext } from '../lib/SiteContext';
import { ThemeContext } from '../lib/ThemeContext';
import { LocaleContext } from '../lib/LocaleContext';
import { t } from '../lib/i18n';

const NavBar = () => {
  const { data: session } = useSession();
  const { siteName } = useContext(SiteContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { locale } = useContext(LocaleContext);
  const [allowSignup, setAllowSignup] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setAllowSignup(data.allowSignup === 'true'));
  }, []);

  return (
    <nav className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <span className="font-bold text-xl">{siteName}</span>
      <div className="flex gap-4 items-center">
        <Link href="/">{t(locale, 'nav_home')}</Link>
        {session ? (
          <>
            <Link href="/profile">{t(locale, 'nav_profile')}</Link>
            {session.user?.role === 'ADMIN' && <Link href="/admin">{t(locale, 'nav_backend')}</Link>}
            {session.user?.role === 'AUTHOR' && (
              <Link href="/admin/posts">{t(locale, 'nav_posts')}</Link>
            )}
            {session.user?.role === 'MODERATOR' && (
              <Link href="/admin/comments">{t(locale, 'nav_moderation')}</Link>
            )}
            <button
              onClick={async () => {
                await signOut({ redirect: false });
                window.location.href = window.location.origin;
              }}
              className="text-blue-600 dark:text-blue-400"
            >
              {t(locale, 'nav_logout')}
            </button>
          </>
        ) : (
          <>
            <Link href="/admin/login" className="text-blue-600 dark:text-blue-400">
              {t(locale, 'nav_login')}
            </Link>
            {allowSignup && (
              <Link href="/signup" className="text-blue-600 dark:text-blue-400">
                {t(locale, 'nav_signup')}
              </Link>
            )}
          </>
        )}
        <button
          onClick={toggleTheme}
          className="px-3 py-1 border rounded-md bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        >
          {theme === 'light' ? t(locale, 'nav_theme_dark') : t(locale, 'nav_theme_light')}
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
