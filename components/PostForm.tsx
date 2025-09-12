import { FormEvent, useEffect, useState } from 'react';

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

const PostForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then(setCategories);
    fetch('/api/tags')
      .then((res) => res.json())
      .then(setTags);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, categoryId, tagIds }),
    });
    setTitle('');
    setContent('');
    setCategoryId(undefined);
    setTagIds([]);
    onSuccess();
  };

  const toggleTag = (id: number) => {
    setTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
      <input
        className="border p-2"
        placeholder="Titel"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="border p-2"
        placeholder="Inhalt"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <select
        className="border p-2"
        value={categoryId ?? ''}
        onChange={(e) =>
          setCategoryId(e.target.value ? Number(e.target.value) : undefined)
        }
      >
        <option value="">Kategorie wählen</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <label key={tag.id} className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={tagIds.includes(tag.id)}
              onChange={() => toggleTag(tag.id)}
            />
            {tag.name}
          </label>
        ))}
      </div>
      <button type="submit" className="bg-blue-500 text-white p-2">
        Speichern
      </button>
    </form>
  );
};

export default PostForm;
