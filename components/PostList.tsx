import type { OutputData } from '@editorjs/editorjs';
import { useContext } from 'react';
import { LocaleContext } from '../lib/LocaleContext';
import { t } from '../lib/i18n';

interface Post {
  id: number;
  title: string;
  content: OutputData;
  category?: { name: string } | null;
  tags: { id: number; name: string }[];
  authorId: number;
}

interface User {
  id: number;
  role: string;
}

const PostList = ({
  posts,
  onDelete,
  onEdit,
  currentUser,
}: {
  posts: Post[];
  onDelete: (id: number) => void;
  onEdit: (post: Post) => void;
  currentUser: User;
}) => {
  const { locale } = useContext(LocaleContext);
  if (!posts.length) return <p>{t(locale, 'post_list_empty')}</p>;
  return (
    <ul className="flex flex-col gap-2">
      {posts.map((post) => (
        <li key={post.id} className="border p-2 flex justify-between items-center">
          <div>
            <h3 className="font-semibold">{post.title}</h3>
            {post.category && (
              <p className="text-sm">
                {t(locale, 'post_list_category')} {post.category.name}
              </p>
            )}
            {post.tags.length > 0 && (
              <p className="text-sm">
                {t(locale, 'post_list_tags')} {post.tags.map((t) => t.name).join(', ')}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {(currentUser.role === 'ADMIN' || currentUser.id === post.authorId) && (
              <button
                onClick={() => onEdit(post)}
                className="text-blue-600"
              >
                {t(locale, 'post_list_edit')}
              </button>
            )}
            {(currentUser.role === 'ADMIN' || currentUser.id === post.authorId) && (
              <button
                onClick={() => onDelete(post.id)}
                className="text-red-600"
              >
                {t(locale, 'post_list_delete')}
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default PostList;
