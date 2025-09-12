import { getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import AdminNav from '../../components/AdminNav';

interface Comment {
  id: number;
  name: string;
  message: string;
  post: { title: string };
}

const AdminComments = () => {
  const [comments, setComments] = useState<Comment[]>([]);

  const load = async () => {
    const res = await fetch('/api/comments');
    setComments(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  const del = async (id: number) => {
    await fetch(`/api/comments/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="p-4">
      <AdminNav />
      <h1 className="text-2xl font-bold mb-4">Kommentare</h1>
      <ul className="flex flex-col gap-2">
        {comments.map((c) => (
          <li key={c.id} className="border p-2 flex justify-between">
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm">{c.message}</p>
              <p className="text-xs text-gray-600">Zu: {c.post.title}</p>
            </div>
            <button onClick={() => del(c.id)} className="text-red-600">
              Löschen
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminComments;

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
