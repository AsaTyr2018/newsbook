import { getSession } from 'next-auth/react';
import { FormEvent, useEffect, useState } from 'react';
import AdminNav from '../../components/AdminNav';

const AdminSettings = () => {
  const [siteName, setSiteName] = useState('');
  const [locale, setLocale] = useState('');
  const [timezone, setTimezone] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setSiteName(data.siteName || '');
        setLocale(data.locale || '');
        setTimezone(data.timezone || '');
      });
  }, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteName, locale, timezone }),
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
        <input
          className="border p-2"
          placeholder="Locale (z.B. de-DE)"
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="Zeitzone (z.B. Europe/Berlin)"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
        />
        <button className="bg-blue-500 text-white p-2">Speichern</button>
        {saved && <p className="text-green-600">Gespeichert!</p>}
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
