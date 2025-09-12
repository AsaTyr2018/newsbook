interface Post {
  id: number;
  title: string;
  category?: { name: string } | null;
  tags: { id: number; name: string }[];
}

const PostList = ({ posts, onDelete }: { posts: Post[]; onDelete: (id: number) => void }) => {
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
          <button
            onClick={() => onDelete(post.id)}
            className="text-red-600"
          >
            Löschen
          </button>
        </li>
      ))}
    </ul>
  );
};

export default PostList;
