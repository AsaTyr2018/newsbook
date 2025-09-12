import { FormEvent, useState } from 'react';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const Signup = ({ allowSignup }: { allowSignup: boolean }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    if (res.ok) {
      router.push('/admin/login');
    } else {
      const data = await res.json();
      setError(data.error || 'Fehler');
    }
  };

  if (!allowSignup) {
    return <p className="p-4">Registrierung deaktiviert.</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Signup</h1>
      <form onSubmit={submit} className="flex flex-col gap-2 max-w-sm">
        <input
          className="border p-2"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="Passwort"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-blue-500 text-white p-2" type="submit">
          Registrieren
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
