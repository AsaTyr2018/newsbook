import { getSession, useSession } from 'next-auth/react';
import { useContext, useEffect, useState, FormEvent } from 'react';
import { ThemeContext } from '../lib/ThemeContext';

const Profile = () => {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [image, setImage] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        setName(data?.name || '');
        setBio(data?.bio || '');
        setImage(data?.image || '');
      });
  }, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, bio, image }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Profil</h1>
      <form onSubmit={save} className="flex flex-col gap-2 max-w-sm">
        <input
          className="border p-2"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="border p-2"
          placeholder="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="Bild-URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />
        <button className="bg-blue-500 text-white p-2">Speichern</button>
        {saved && <p className="text-green-600">Gespeichert!</p>}
      </form>
      <div>
        <span className="mr-2">Modus:</span>
        <button
          onClick={toggleTheme}
          className="px-3 py-1 border rounded bg-gray-100 dark:bg-gray-800 dark:border-gray-700"
        >
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
      </div>
    </div>
  );
};

export default Profile;

export async function getServerSideProps(context: any) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    };
  }
  return { props: {} };
}
