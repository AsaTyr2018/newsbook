import { getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import AdminNav from '../../components/AdminNav';
import PostForm from '../../components/PostForm';
import PostList from '../../components/PostList';

interface Post {
  id: number;
  title: string;
  category?: { name: string } | null;
  tags: { id: number; name: string }[];
}

const AdminPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);

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
      <PostForm onSuccess={load} />
      <PostList posts={posts} onDelete={del} />
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
