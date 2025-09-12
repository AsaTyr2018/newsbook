import Link from 'next/link';
import { useSession } from 'next-auth/react';

const AdminNav = () => {
  const { data: session } = useSession();
  const role = session?.user?.role;

  return (
    <nav className="flex gap-4 mb-4">
      {(role === 'ADMIN' || role === 'AUTHOR') && (
        <Link href="/admin/posts">Posts</Link>
      )}
      {role === 'ADMIN' && <Link href="/admin/categories">Kategorien</Link>}
      {role === 'ADMIN' && <Link href="/admin/tags">Tags</Link>}
      {(role === 'ADMIN' || role === 'MODERATOR') && (
        <Link href="/admin/comments">Kommentare</Link>
      )}
      {role === 'ADMIN' && <Link href="/admin/settings">Einstellungen</Link>}
      {role === 'ADMIN' && <Link href="/admin/users">Benutzer</Link>}
    </nav>
  );
};

export default AdminNav;
