import { getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import AdminNav from '../../components/AdminNav';

interface Comment {
  id: number;
  name: string;
  message: string;
  status: string;
  post: { title: string };
}

const AdminComments = () => {
  const [comments, setComments] = useState<Comment[]>([]);

  const load = async () => {
    const res = await fetch('/api/comments?status=PENDING');
    setComments(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  const del = async (id: number) => {
    await fetch(`/api/comments/${id}`, { method: 'DELETE' });
    load();
  };

  const setStatus = async (id: number, status: string) => {
    await fetch(`/api/comments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  };

  return (
    <div className="p-4">
      <AdminNav />
      <h1 className="text-2xl font-bold mb-4">Kommentare</h1>
      <ul className="flex flex-col gap-2">
        {comments.map((c) => (
          <li key={c.id} className="border p-2 flex justify-between items-center">
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm">{c.message}</p>
              <p className="text-xs text-gray-600">Zu: {c.post.title}</p>
              <p className="text-xs">Status: {c.status}</p>
            </div>
            <div className="flex gap-2">
              {c.status !== 'APPROVED' && (
                <button
                  onClick={() => setStatus(c.id, 'APPROVED')}
                  className="text-green-600"
                >
                  Freigeben
                </button>
              )}
              {c.status !== 'REJECTED' && (
                <button
                  onClick={() => setStatus(c.id, 'REJECTED')}
                  className="text-yellow-600"
                >
                  Ablehnen
                </button>
              )}
              <button onClick={() => del(c.id)} className="text-red-600">
                Löschen
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminComments;

export async function getServerSideProps(context: any) {
  const session = await getSession(context);
  if (
    !session ||
    !['ADMIN', 'MODERATOR'].includes((session.user as any).role)
  ) {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    };
  }
  return { props: {} };
}
