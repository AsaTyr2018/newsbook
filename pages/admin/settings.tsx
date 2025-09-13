import { getSession } from 'next-auth/react';
import { FormEvent, useEffect, useState } from 'react';
import AdminNav from '../../components/AdminNav';

const AdminSettings = () => {
  const [siteName, setSiteName] = useState('');
  const [locale, setLocale] = useState('');
  const [timezone, setTimezone] = useState('');
  const [allowSignup, setAllowSignup] = useState(false);
  const [saved, setSaved] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setSiteName(data.siteName || '');
        setLocale(data.locale || '');
        setTimezone(data.timezone || '');
        setAllowSignup(data.allowSignup === 'true');
      });
  }, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteName, locale, timezone, allowSignup }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4">
      <AdminNav />
      <h1 className="text-2xl font-bold mb-4">Einstellungen</h1>
      <form onSubmit={save} className="flex flex-col gap-2 max-w-md">
        <input
          className="border p-2"
          placeholder="Seitentitel"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
        />
        <select
          className="border p-2"
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
        >
          <option value="de-DE">Deutsch (de-DE)</option>
          <option value="en-EN">English (en-EN)</option>
        </select>
        <input
          className="border p-2"
          placeholder="Zeitzone (z.B. Europe/Berlin)"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={allowSignup}
            onChange={(e) => setAllowSignup(e.target.checked)}
          />
          <span>Signup erlauben</span>
        </label>
        <button className="bg-blue-500 text-white p-2">Speichern</button>
        {saved && <p className="text-green-600">Gespeichert!</p>}
        <button
          type="button"
          onClick={async () => {
            setUpdating(true);
            await fetch('/api/update', { method: 'POST' });
            setUpdating(false);
          }}
          className="bg-gray-500 text-white p-2"
        >
          Update
        </button>
        {updating && <p className="text-blue-600">Aktualisiere...</p>}
      </form>
    </div>
  );
};

export default AdminSettings;

export async function getServerSideProps(context: any) {
  const session = await getSession(context);
  if (!session || session.user?.role !== 'ADMIN') {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    };
  }
  return { props: {} };
}
