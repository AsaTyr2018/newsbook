import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useContext } from 'react';
import { SiteContext } from '../lib/SiteContext';
import { ThemeContext } from '../lib/ThemeContext';

const NavBar = () => {
  const { data: session } = useSession();
  const { siteName } = useContext(SiteContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <nav className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <span className="font-bold text-xl">{siteName}</span>
      <div className="flex gap-4 items-center">
        <Link href="/">Startseite</Link>
        {session ? (
          <>
            <Link href="/profile">Profil</Link>
            {session.user?.role === 'ADMIN' && <Link href="/admin">Backend</Link>}
            <button onClick={() => signOut()} className="text-blue-600 dark:text-blue-400">Logout</button>
          </>
        ) : (
          <Link href="/admin/login" className="text-blue-600 dark:text-blue-400">Login</Link>
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
