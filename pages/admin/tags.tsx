import { getSession } from 'next-auth/react';
import { FormEvent, useEffect, useState } from 'react';
import AdminNav from '../../components/AdminNav';

interface Tag {
  id: number;
  name: string;
}

const AdminTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [name, setName] = useState('');

  const load = async () => {
    const res = await fetch('/api/tags');
    setTags(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setName('');
    load();
  };

  const del = async (id: number) => {
    await fetch(`/api/tags/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="p-4">
      <AdminNav />
      <h1 className="text-2xl font-bold mb-4">Tags</h1>
      <form onSubmit={add} className="flex gap-2 mb-4">
        <input
          className="border p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <button className="bg-blue-500 text-white p-2">Hinzufügen</button>
      </form>
      <ul className="flex flex-col gap-2">
        {tags.map((tag) => (
          <li key={tag.id} className="border p-2 flex justify-between">
            {tag.name}
            <button onClick={() => del(tag.id)} className="text-red-600">
              Löschen
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminTags;

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
