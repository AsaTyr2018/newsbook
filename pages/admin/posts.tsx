import { getSession, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import AdminNav from '../../components/AdminNav';
import PostForm from '../../components/PostForm';
import PostList from '../../components/PostList';
import type { OutputData } from '@editorjs/editorjs';

interface Post {
  id: number;
  title: string;
  content: OutputData;
  category?: { name: string } | null;
  tags: { id: number; name: string }[];
  authorId: number;
  categoryId?: number | null;
}

const AdminPosts = () => {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);

  const load = async () => {
    const res = await fetch('/api/posts');
    setPosts(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  const del = async (id: number) => {
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="p-4">
      <AdminNav />
      <h1 className="text-2xl font-bold mb-4">Beiträge verwalten</h1>
      <PostForm
        onSuccess={() => {
          setEditing(null);
          load();
        }}
        post={editing}
        onCancel={() => setEditing(null)}
      />
      {session && (
        <PostList
          posts={posts}
          onDelete={del}
          onEdit={(p) => setEditing(p)}
          currentUser={{
            id: Number((session.user as any).id),
            role: (session.user as any).role,
          }}
        />
      )}
    </div>
  );
};

export default AdminPosts;

export async function getServerSideProps(context: any) {
  const session = await getSession(context);
  if (
    !session ||
    !['ADMIN', 'AUTHOR'].includes((session.user as any).role)
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
