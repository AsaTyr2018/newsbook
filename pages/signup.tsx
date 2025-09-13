import { FormEvent, useState, useContext } from 'react';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { LocaleContext } from '../lib/LocaleContext';
import { t } from '../lib/i18n';

const Signup = ({ allowSignup }: { allowSignup: boolean }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { locale } = useContext(LocaleContext);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      if (res.ok) {
        router.push('/admin/login');
      } else {
        let message = t(locale, 'signup_error');
        try {
          const data = await res.json();
          message = data.error || message;
        } catch {
          // Antwort ist kein JSON
        }
        setError(message);
      }
    } catch {
      setError(t(locale, 'signup_network_error'));
    }
  };

  if (!allowSignup) {
    return <p className="p-4">{t(locale, 'signup_disabled')}</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{t(locale, 'signup_title')}</h1>
      <form onSubmit={submit} className="flex flex-col gap-2 max-w-sm">
        <input
          className="border p-2"
          placeholder={t(locale, 'signup_username')}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder={t(locale, 'signup_email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder={t(locale, 'signup_password')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-blue-500 text-white p-2" type="submit">
          {t(locale, 'signup_register')}
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>
    </div>
  );
};

export default Signup;

export async function getServerSideProps(ctx: any) {
  const session = await getSession(ctx);
  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  const { prisma } = await import('../lib/prisma');
  const setting = await prisma.setting.findUnique({ where: { key: 'allowSignup' } });
  return { props: { allowSignup: setting?.value === 'true' } };
}
