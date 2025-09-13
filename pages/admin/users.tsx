import { getSession } from 'next-auth/react';
import { useEffect, useState, useContext } from 'react';
import { LocaleContext } from '../../lib/LocaleContext';
import { t } from '../../lib/i18n';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  name?: string | null;
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { locale } = useContext(LocaleContext);

  const load = () => {
    fetch('/api/users')
      .then((res) => res.json())
      .then(setUsers);
  };

  useEffect(() => {
    load();
  }, []);

  const updateRole = async (id: number, role: string) => {
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id, role }),
    });
    load();
  };

  const del = async (id: number) => {
    await fetch('/api/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id }),
    });
    load();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{t(locale, 'admin_users_title')}</h1>
      <table className="w-full border">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">{t(locale, 'admin_users_username')}</th>
            <th className="p-2 text-left">{t(locale, 'admin_users_name')}</th>
            <th className="p-2 text-left">{t(locale, 'admin_users_email')}</th>
            <th className="p-2 text-left">{t(locale, 'admin_users_role')}</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="p-2">{u.username}</td>
              <td className="p-2">{u.name || ''}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">
                <select
                  value={u.role}
                  onChange={(e) => updateRole(u.id, e.target.value)}
                  className="border p-1"
                >
                  <option value="GUEST">GUEST</option>
                  <option value="USER">USER</option>
                  <option value="AUTHOR">AUTHOR</option>
                  <option value="MODERATOR">MODERATOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </td>
              <td className="p-2 text-right">
              <button
                onClick={() => del(u.id)}
                className="text-red-600"
              >
                {t(locale, 'admin_users_delete')}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
};

export default UsersPage;

export async function getServerSideProps(context: any) {
  const session = await getSession(context);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    };
  }
  return { props: {} };
}
