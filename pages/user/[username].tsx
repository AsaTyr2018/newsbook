import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '../../lib/prisma';

interface UserProfileProps {
  user:
    | {
        username: string;
        name: string | null;
        bio: string | null;
        image: string | null;
        role: string;
        createdAt: string;
        posts: { id: number; title: string; slug: string }[];
      }
    | null;
}

const UserProfile = ({ user }: UserProfileProps) => {
  if (!user) return <div className="p-4">Benutzer nicht gefunden.</div>;
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || user.username}
            width={96}
            height={96}
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-2xl">
            {user.name?.[0] || user.username[0]}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">{user.name || user.username}</h1>
          <p className="text-gray-500">
            Registriert seit {new Date(user.createdAt).toLocaleDateString()}
          </p>
          <p className="text-gray-500">Gruppe: {user.role}</p>
        </div>
      </div>
      {user.bio && <p className="mb-6">{user.bio}</p>}
      <h2 className="text-xl font-semibold mb-2">Beiträge</h2>
      {user.posts.length ? (
        <ul className="list-disc pl-5 space-y-1">
          {user.posts.map((post) => (
            <li key={post.id}>
              <Link href={`/news/${post.slug}`} className="text-blue-600">
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Keine Beiträge vorhanden.</p>
      )}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<UserProfileProps> = async (
  context
) => {
  const username = context.params?.username as string;
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      posts: {
        select: { id: true, title: true, slug: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  return {
    props: {
      user: user
        ? {
            ...user,
            createdAt: user.createdAt.toISOString(),
            posts: user.posts.map((p) => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
            })),
          }
        : null,
    },
  };
};

export default UserProfile;

