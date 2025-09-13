import { getSession } from 'next-auth/react';
import { FormEvent, useEffect, useState, useContext } from 'react';
import AdminNav from '../../components/AdminNav';
import { LocaleContext } from '../../lib/LocaleContext';
import { t } from '../../lib/i18n';

interface Category {
  id: number;
  name: string;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const { locale } = useContext(LocaleContext);

  const load = async () => {
    const res = await fetch('/api/categories');
    setCategories(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setName('');
    load();
  };

  const del = async (id: number) => {
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="p-4">
      <AdminNav />
      <h1 className="text-2xl font-bold mb-4">{t(locale, 'admin_categories_title')}</h1>
      <form onSubmit={add} className="flex gap-2 mb-4">
        <input
          className="border p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t(locale, 'admin_category_name_placeholder')}
        />
        <button className="bg-blue-500 text-white p-2">{t(locale, 'admin_category_add')}</button>
      </form>
      <ul className="flex flex-col gap-2">
        {categories.map((cat) => (
          <li key={cat.id} className="border p-2 flex justify-between">
            {cat.name}
            <button onClick={() => del(cat.id)} className="text-red-600">
              {t(locale, 'admin_category_delete')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminCategories;

export async function getServerSideProps(context: any) {
  const session = await getSession(context);
  if (!session || session.user?.role !== 'ADMIN') {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    };
  }
  return { props: {} };
}
