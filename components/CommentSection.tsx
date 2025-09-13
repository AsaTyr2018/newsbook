import { FormEvent, useEffect, useState, useCallback, useContext } from 'react';
import { useSession } from 'next-auth/react';
import { LocaleContext } from '../lib/LocaleContext';
import { t } from '../lib/i18n';

interface Comment {
  id: number;
  name: string;
  message: string;
  createdAt: string;
}

const CommentSection = ({ postId }: { postId: number }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const { data: session } = useSession();
  const { locale } = useContext(LocaleContext);

  const loadComments = useCallback(async () => {
    const res = await fetch(`/api/comments?postId=${postId}`);
    const data = await res.json();
    setComments(data);
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, name: session?.user ? undefined : name, message }),
    });
    setName('');
    setMessage('');
    loadComments();
  };

  return (
    <div id="comments" className="mt-8">
      <h3 className="text-lg font-semibold mb-2">{t(locale, 'comments_title')}</h3>
      {comments.length ? (
        <ul className="mb-4">
          {comments.map((c) => (
            <li key={c.id} className="mb-2">
              <p className="text-sm font-semibold">{c.name}</p>
              <p className="text-sm">{c.message}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-sm">{t(locale, 'comments_none')}</p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {!session && (
          <input
            className="border p-2"
            placeholder={t(locale, 'comment_placeholder_name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <textarea
          className="border p-2"
          placeholder={t(locale, 'comment_placeholder_message')}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white p-2">
          {t(locale, 'comment_submit')}
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
