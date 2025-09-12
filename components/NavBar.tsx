import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useContext } from 'react';
import { SiteContext } from '../lib/SiteContext';

const NavBar = () => {
  const { data: session } = useSession();
  const { siteName } = useContext(SiteContext);

  return (
    <nav className="flex gap-4 p-4 border-b">
      <Link href="/">{siteName}</Link>
      {session ? (
        <>
          <Link href="/profile">Profil</Link>
          {session.user?.role === 'ADMIN' && <Link href="/admin">Backend</Link>}
          <button onClick={() => signOut()} className="text-blue-600">Logout</button>
        </>
      ) : (
        <Link href="/admin/login">Login</Link>
      )}
    </nav>
  );
};

export default NavBar;
