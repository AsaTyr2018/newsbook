import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useContext } from 'react';
import { SiteContext } from '../lib/SiteContext';

const NavBar = () => {
  const { data: session } = useSession();
  const { siteName } = useContext(SiteContext);

  return (
    <nav className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <span className="font-bold text-xl">{siteName}</span>
      <div className="flex gap-4">
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
      </div>
    </nav>
  );
};

export default NavBar;
