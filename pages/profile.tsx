import { getSession, useSession } from 'next-auth/react';
import { useContext, useEffect, useState, FormEvent } from 'react';
import { ThemeContext } from '../lib/ThemeContext';
import { LocaleContext, Locale } from '../lib/LocaleContext';
import { t } from '../lib/i18n';

const Profile = () => {
  useSession();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { locale, setLocale } = useContext(LocaleContext);
  const [tab, setTab] = useState<'profile' | 'option' | 'password'>('profile');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [image, setImage] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [saved, setSaved] = useState(false);
  const [challenge, setChallenge] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [userLocale, setUserLocale] = useState<Locale>(locale);

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        setName(data?.name || '');
        setBio(data?.bio || '');
        setImage(data?.image || '');
        if (data?.locale) {
          setUserLocale(data.locale);
          setLocale(data.locale);
        }
      });
  }, [setLocale]);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const formData = new FormData();
    formData.append('name', name);
    formData.append('bio', bio);
    if (avatar) {
      formData.append('image', avatar);
    }
    const res = await fetch('/api/profile', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.error) {
      setError(data.error);
    } else {
      if (data.image) setImage(data.image);
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

  const saveLocale = async () => {
    setError('');
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: userLocale }),
    });
    const data = await res.json();
    if (data.error) {
      setError(data.error);
    } else {
      setLocale(userLocale);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">{t(locale, 'profile_title')}</h1>
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setTab('profile')}
          className={`pb-2 ${tab === 'profile' ? 'border-b-2 border-blue-500' : ''}`}
        >
          {t(locale, 'profile_tab_profile')}
        </button>
        <button
          onClick={() => setTab('option')}
          className={`pb-2 ${tab === 'option' ? 'border-b-2 border-blue-500' : ''}`}
        >
          {t(locale, 'profile_tab_option')}
        </button>
        <button
          onClick={() => setTab('password')}
          className={`pb-2 ${tab === 'password' ? 'border-b-2 border-blue-500' : ''}`}
        >
          {t(locale, 'profile_tab_password')}
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
          {image && (
            <img src={image} alt="avatar" className="w-24 h-24 rounded-full" />
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            onChange={(e) => setAvatar(e.target.files?.[0] || null)}
          />
          <button className="bg-blue-500 text-white p-2">{t(locale, 'profile_save')}</button>
          {saved && <p className="text-green-600">{t(locale, 'profile_saved')}</p>}
          {error && <p className="text-red-600">{error}</p>}
        </form>
      )}

      {tab === 'option' && (
        <div className="space-y-2">
          <div>
            <p className="mb-2">{t(locale, 'profile_language')}</p>
            <select
              className="border p-2"
              value={userLocale}
              onChange={(e) => setUserLocale(e.target.value as Locale)}
            >
              <option value="de-DE">Deutsch</option>
              <option value="en-EN">English</option>
            </select>
            <button
              onClick={saveLocale}
              className="px-3 py-1 border rounded bg-gray-100 dark:bg-gray-800 dark:border-gray-700 mt-2"
            >
              {t(locale, 'profile_language_save')}
            </button>
          </div>
          <div>
            <p className="mb-2">{t(locale, 'profile_theme')}</p>
            <button
              onClick={toggleTheme}
              className="px-3 py-1 border rounded bg-gray-100 dark:bg-gray-800 dark:border-gray-700"
            >
              {theme === 'light' ? t(locale, 'profile_dark_mode') : t(locale, 'profile_light_mode')}
            </button>
          </div>
          {saved && <p className="text-green-600">{t(locale, 'profile_saved')}</p>}
          {error && <p className="text-red-600">{error}</p>}
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
          <button className="bg-blue-500 text-white p-2">{t(locale, 'profile_save')}</button>
          {saved && <p className="text-green-600">{t(locale, 'profile_saved')}</p>}
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
