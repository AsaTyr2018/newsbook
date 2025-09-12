import { FormEvent, useEffect, useState } from 'react';
import type { OutputData } from '@editorjs/editorjs';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('./Editor'), { ssr: false });

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

interface Post {
  id: number;
  title: string;
  content: OutputData;
  categoryId?: number;
  tags: Tag[];
}

const PostForm = ({
  onSuccess,
  post,
  onCancel,
}: {
  onSuccess: () => void;
  post?: Post | null;
  onCancel?: () => void;
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<OutputData | undefined>();
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

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setCategoryId(post.categoryId);
      setTagIds(post.tags.map((t) => t.id));
    }
  }, [post]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const body = JSON.stringify({ title, content, categoryId, tagIds });
    if (post) {
      await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
    } else {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
    }
    setTitle('');
    setContent(undefined);
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
      <Editor data={content} onChange={(data) => setContent(data)} />
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
      <div className="flex gap-2">
        <button type="submit" className="bg-blue-500 text-white p-2">
          Speichern
        </button>
        {post && onCancel && (
          <button
            type="button"
            onClick={() => {
              setTitle('');
              setContent(undefined);
              setCategoryId(undefined);
              setTagIds([]);
              onCancel();
            }}
            className="bg-gray-500 text-white p-2"
          >
            Abbrechen
          </button>
        )}
      </div>
    </form>
  );
};

export default PostForm;
