interface Post {
  id: number;
  title: string;
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
  if (!posts.length) return <p>Keine Beiträge vorhanden.</p>;
  return (
    <ul className="flex flex-col gap-2">
      {posts.map((post) => (
        <li key={post.id} className="border p-2 flex justify-between items-center">
          <div>
            <h3 className="font-semibold">{post.title}</h3>
            {post.category && <p className="text-sm">Kategorie: {post.category.name}</p>}
            {post.tags.length > 0 && (
              <p className="text-sm">
                Tags: {post.tags.map((t) => t.name).join(', ')}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {(currentUser.role === 'ADMIN' || currentUser.id === post.authorId) && (
              <button
                onClick={() => onEdit(post)}
                className="text-blue-600"
              >
                Bearbeiten
              </button>
            )}
            {(currentUser.role === 'ADMIN' || currentUser.id === post.authorId) && (
              <button
                onClick={() => onDelete(post.id)}
                className="text-red-600"
              >
                Löschen
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default PostList;
