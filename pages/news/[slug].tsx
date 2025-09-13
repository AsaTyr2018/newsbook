import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useContext } from 'react';
import { prisma } from '../../lib/prisma';
import CommentSection from '../../components/CommentSection';
import edjsHTML from 'editorjs-html';
import { LocaleContext } from '../../lib/LocaleContext';
import { t } from '../../lib/i18n';

interface PostPageProps {
  post: {
    id: number;
    title: string;
    content: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    author?: { username: string; name: string | null } | null;
    category?: { name: string } | null;
    tags: { id: number; name: string }[];
  } | null;
}

const NewsPost = ({ post }: PostPageProps) => {
  const { locale } = useContext(LocaleContext);
  if (!post) return <div className="p-4">{t(locale, 'post_not_found')}</div>;
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
      <p className="text-sm text-gray-500 mb-4">
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
        <p className="text-sm mb-4">
          {t(locale, 'post_tags')} {post.tags.map((t) => t.name).join(', ')}
        </p>
      )}
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
      <CommentSection postId={post.id} />
      <Link href="/" className="text-blue-600">
        {t(locale, 'post_back_home')}
      </Link>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<PostPageProps> = async (context) => {
  const slug = context.params?.slug as string;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: { select: { username: true, name: true } },
      category: true,
      tags: true,
    },
  });
  const parser = edjsHTML();
  const parsedContent = post
    ? parser.parse(
        typeof post.content === 'string'
          ? JSON.parse(post.content)
          : (post.content as any)
      )
    : '';
  const htmlContent = Array.isArray(parsedContent)
    ? parsedContent.join('')
    : parsedContent;
  return {
    props: {
      post: post
        ? {
            ...post,
            content: htmlContent,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
          }
        : null,
    },
  };
};

export default NewsPost;
