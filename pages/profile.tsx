import { getSession, useSession } from 'next-auth/react';
import { useContext, useEffect, useState, FormEvent } from 'react';
import { ThemeContext } from '../lib/ThemeContext';

const Profile = () => {
  useSession();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [tab, setTab] = useState<'profile' | 'option' | 'password'>('profile');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [image, setImage] = useState('');
  const [saved, setSaved] = useState(false);
  const [challenge, setChallenge] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        setName(data?.name || '');
        setBio(data?.bio || '');
        setImage(data?.image || '');
      });
  }, []);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, bio, image }),
    });
    const data = await res.json();
    if (data.error) {
      setError(data.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        challengePhrase: challenge,
        oldPassword,
        newPassword,
        confirmPassword: confirm,
      }),
    });
    const data = await res.json();
    if (data.error) {
      setError(data.error);
    } else {
      setSaved(true);
      setChallenge('');
      setOldPassword('');
      setNewPassword('');
      setConfirm('');
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Profil</h1>
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setTab('profile')}
          className={`pb-2 ${tab === 'profile' ? 'border-b-2 border-blue-500' : ''}`}
        >
          Profil
        </button>
        <button
          onClick={() => setTab('option')}
          className={`pb-2 ${tab === 'option' ? 'border-b-2 border-blue-500' : ''}`}
        >
          Option
        </button>
        <button
          onClick={() => setTab('password')}
          className={`pb-2 ${tab === 'password' ? 'border-b-2 border-blue-500' : ''}`}
        >
          Passwort
        </button>
      </div>

      {tab === 'profile' && (
        <form onSubmit={saveProfile} className="flex flex-col gap-2 max-w-sm">
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
            placeholder="Avatar-URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
          <button className="bg-blue-500 text-white p-2">Speichern</button>
          {saved && <p className="text-green-600">Gespeichert!</p>}
          {error && <p className="text-red-600">{error}</p>}
        </form>
      )}

      {tab === 'option' && (
        <div className="space-y-2">
          <p className="mb-2">Light/Dark Mode</p>
          <button
            onClick={toggleTheme}
            className="px-3 py-1 border rounded bg-gray-100 dark:bg-gray-800 dark:border-gray-700"
          >
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      )}

      {tab === 'password' && (
        <form onSubmit={savePassword} className="flex flex-col gap-2 max-w-sm">
          <div>
            <label className="font-semibold">Challenge Phrase</label>
            <p className="text-sm text-gray-600 mb-1">
              Eine geheime Phrase, um deine Identität z. B. beim Zurücksetzen des Passworts zu bestätigen.
            </p>
            <input
              className="border p-2 w-full"
              placeholder="Challenge Phrase"
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold">Passwort ändern</label>
            <p className="text-sm text-gray-600 mb-1">
              Ändere hier dein aktuelles Passwort.
            </p>
          </div>
          <input
            type="password"
            className="border p-2"
            placeholder="Altes Passwort"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <input
            type="password"
            className="border p-2"
            placeholder="Neues Passwort"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            className="border p-2"
            placeholder="Passwort bestätigen"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <button className="bg-blue-500 text-white p-2">Speichern</button>
          {saved && <p className="text-green-600">Gespeichert!</p>}
          {error && <p className="text-red-600">{error}</p>}
        </form>
      )}
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
