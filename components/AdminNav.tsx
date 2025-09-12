import Link from 'next/link';

const AdminNav = () => {
  return (
    <nav className="flex gap-4 mb-4">
      <Link href="/admin/posts">Posts</Link>
      <Link href="/admin/categories">Kategorien</Link>
      <Link href="/admin/tags">Tags</Link>
      <Link href="/admin/comments">Kommentare</Link>
      <Link href="/admin/settings">Einstellungen</Link>
      <Link href="/admin/users">Benutzer</Link>
    </nav>
  );
};

export default AdminNav;
