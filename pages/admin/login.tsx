import { FormEvent, useEffect, useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [allowSignup, setAllowSignup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setAllowSignup(data.allowSignup === 'true'));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      redirect: false,
      username,
      password,
    });
    if (res && !res.error) {
      router.push('/');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-sm mt-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2"
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2">
          Login
        </button>
      </form>
      {allowSignup && (
        <p className="mt-4 text-sm">
          Noch kein Account?{' '}
          <Link href="/signup" className="text-blue-600 underline">
            Signup
          </Link>
        </p>
      )}
    </div>
  );
};

export default AdminLogin;

export async function getServerSideProps(context: any) {
  const session = await getSession(context);
  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  return { props: {} };
}
