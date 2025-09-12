import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useContext, useEffect, useState } from 'react';
import { SiteContext } from '../lib/SiteContext';
import { ThemeContext } from '../lib/ThemeContext';

const NavBar = () => {
  const { data: session } = useSession();
  const { siteName } = useContext(SiteContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
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
        <Link href="/">Startseite</Link>
        {session ? (
          <>
            <Link href="/profile">Profil</Link>
            {session.user?.role === 'ADMIN' && <Link href="/admin">Backend</Link>}
            {session.user?.role === 'AUTHOR' && (
              <Link href="/admin/posts">Beiträge</Link>
            )}
            {session.user?.role === 'MODERATOR' && (
              <Link href="/admin/comments">Moderation</Link>
            )}
            <button
              onClick={async () => {
                await signOut({ redirect: false });
                window.location.href = window.location.origin;
              }}
              className="text-blue-600 dark:text-blue-400"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/admin/login" className="text-blue-600 dark:text-blue-400">Login</Link>
            {allowSignup && (
              <Link href="/signup" className="text-blue-600 dark:text-blue-400">
                Signup
              </Link>
            )}
          </>
        )}
        <button
          onClick={toggleTheme}
          className="px-3 py-1 border rounded-md bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        >
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
