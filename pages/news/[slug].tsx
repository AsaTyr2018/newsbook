import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { prisma } from '../../lib/prisma';
import CommentSection from '../../components/CommentSection';
import edjsHTML from 'editorjs-html';

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
  if (!post) return <div className="p-4">Beitrag nicht gefunden.</div>;
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
      <p className="text-sm text-gray-500 mb-4">
        {new Date(post.createdAt).toLocaleDateString()} | Autor: {post.author ? (
          <Link href={`/user/${post.author.username}`} className="text-blue-600">
            {post.author.name || post.author.username}
          </Link>
        ) : (
          'Unbekannt'
        )} | Kategorie: {post.category?.name || 'Keine'}
      </p>
      {post.tags.length > 0 && (
        <p className="text-sm mb-4">Tags: {post.tags.map((t) => t.name).join(', ')}</p>
      )}
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
      <CommentSection postId={post.id} />
      <Link href="/" className="text-blue-600">
        Zurück zur Startseite
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
  return {
    props: {
      post: post
        ? {
            ...post,
            content: parser.parse(post.content as any).join(''),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
          }
        : null,
    },
  };
};

export default NewsPost;
