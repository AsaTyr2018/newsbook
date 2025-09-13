import { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import { useContext } from 'react';
import edjsHTML from 'editorjs-html';
import { LocaleContext } from '../lib/LocaleContext';
import { t } from '../lib/i18n';
import { prisma } from '../lib/prisma';

interface Post {
  id: number;
  title: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  author?: { username: string; name: string | null } | null;
  category?: { name: string } | null;
  tags: { id: number; name: string }[];
  preview: string;
}

interface HomeProps {
  posts: Post[];
}

const Home: NextPage<HomeProps> = ({ posts }) => {
  const { locale } = useContext(LocaleContext);
  return (
    <div className="p-4">
      {posts.map((post) => (
        <div key={post.id} className="mb-6 border-b pb-4">
          <h2 className="text-xl font-semibold">
            <Link href={`/news/${post.slug}`}>{post.title}</Link>
          </h2>
          <p className="text-sm text-gray-500">
            {new Date(post.createdAt).toLocaleDateString()} | {t(locale, 'post_author')}{' '}
            {post.author ? (
              <Link href={`/user/${post.author.username}`} className="text-blue-600">
                {post.author.name || post.author.username}
              </Link>
            ) : (
              t(locale, 'post_unknown_author')
          )}{' '}
          | {t(locale, 'post_category')} {post.category?.name || t(locale, 'post_no_category')}
          </p>
          {post.tags.length > 0 && (
            <p className="text-sm">
              {t(locale, 'post_tags')} {post.tags.map((t) => t.name).join(', ')}
            </p>
          )}
          <div className="mt-2 text-sm">
            <div className="prose max-w-none">{post.preview}</div>
            <Link href={`/news/${post.slug}`} className="text-blue-600">
              {t(locale, 'post_view_all')}
            </Link>
          </div>
          <Link href={`/news/${post.slug}#comments`} className="text-blue-600 text-sm">
            {t(locale, 'post_view_comments')}
          </Link>
        </div>
      ))}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  const parser = edjsHTML();
  const posts = await prisma.post.findMany({
    include: {
      author: { select: { username: true, name: true } },
      category: true,
      tags: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    props: {
      posts: posts.map((p) => {
        const parsed = parser.parse(
          typeof p.content === 'string' ? JSON.parse(p.content) : (p.content as any)
        );
        const html = Array.isArray(parsed) ? parsed : [parsed];
        const text = html
          .join(' ')
          .replace(/<[^>]+>/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        const previewText =
          text.length > 300 ? text.slice(0, 300).trimEnd() + '...' : text;
        return {
          ...p,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
          preview: previewText,
        };
      }),
    },
  };
};

export default Home;
