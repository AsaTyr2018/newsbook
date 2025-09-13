import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useContext } from 'react';
import { LocaleContext } from '../lib/LocaleContext';
import { t } from '../lib/i18n';

const AdminNav = () => {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const { locale } = useContext(LocaleContext);

  return (
    <nav className="flex gap-4 mb-4">
      {(role === 'ADMIN' || role === 'AUTHOR') && (
        <Link href="/admin/posts">{t(locale, 'admin_nav_posts')}</Link>
      )}
      {role === 'ADMIN' && <Link href="/admin/categories">{t(locale, 'admin_nav_categories')}</Link>}
      {role === 'ADMIN' && <Link href="/admin/tags">{t(locale, 'admin_nav_tags')}</Link>}
      {(role === 'ADMIN' || role === 'MODERATOR') && (
        <Link href="/admin/comments">{t(locale, 'admin_nav_comments')}</Link>
      )}
      {role === 'ADMIN' && <Link href="/admin/settings">{t(locale, 'admin_nav_settings')}</Link>}
      {role === 'ADMIN' && <Link href="/admin/users">{t(locale, 'admin_nav_users')}</Link>}
    </nav>
  );
};

export default AdminNav;
