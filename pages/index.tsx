import { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import { prisma } from '../lib/prisma';

interface Post {
  id: number;
  title: string;
  slug: string;
  createdAt: string;
  author?: { username: string } | null;
  category?: { name: string } | null;
  tags: { id: number; name: string }[];
}

interface HomeProps {
  posts: Post[];
}

const Home: NextPage<HomeProps> = ({ posts }) => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">NewsBlogCMS</h1>
      {posts.map((post) => (
        <div key={post.id} className="mb-6 border-b pb-4">
          <h2 className="text-xl font-semibold">
            <Link href={`/news/${post.slug}`}>{post.title}</Link>
          </h2>
          <p className="text-sm text-gray-500">
            {new Date(post.createdAt).toLocaleDateString()} | Autor: {post.author?.username || 'Unbekannt'} |
            Kategorie: {post.category?.name || 'Keine'}
          </p>
          {post.tags.length > 0 && (
            <p className="text-sm">Tags: {post.tags.map((t) => t.name).join(', ')}</p>
          )}
          <Link href={`/news/${post.slug}#comments`} className="text-blue-600 text-sm">
            Kommentare ansehen
          </Link>
        </div>
      ))}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  const posts = await prisma.post.findMany({
    include: {
      author: { select: { username: true } },
      category: true,
      tags: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return {
    props: {
      posts: posts.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() })),
    },
  };
};

export default Home;
