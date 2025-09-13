import { FormEvent, useEffect, useState, useContext } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { LocaleContext } from '../../lib/LocaleContext';
import { t } from '../../lib/i18n';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [allowSignup, setAllowSignup] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [challenge, setChallenge] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { locale } = useContext(LocaleContext);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setAllowSignup(data.allowSignup === 'true'));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (resetMode) {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, challengePhrase: challenge, newPassword, confirmPassword: confirm }),
      });
      const data = await res.json();
      setMessage(data.error || t(locale, 'admin_login_password_set'));
      if (!data.error) {
        setResetMode(false);
      }
    } else {
      const res = await signIn('credentials', {
        redirect: false,
        username,
        password,
      });
      if (res && !res.error) {
        router.push('/');
      } else {
        setMessage(t(locale, 'admin_login_failed'));
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{
        resetMode ? t(locale, 'admin_login_reset_title') : t(locale, 'admin_login_title')
      }</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-sm mt-4">
        <input
          type="text"
          placeholder={t(locale, 'admin_login_username')}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2"
        />
        {!resetMode && (
          <input
            type="password"
            placeholder={t(locale, 'admin_login_password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2"
          />
        )}
        {resetMode && (
          <>
            <input
              type="text"
              placeholder={t(locale, 'admin_login_challenge')}
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              className="border p-2"
            />
            <input
              type="password"
              placeholder={t(locale, 'admin_login_new_password')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border p-2"
            />
            <input
              type="password"
              placeholder={t(locale, 'admin_login_confirm_password')}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="border p-2"
            />
          </>
        )}
        <button type="submit" className="bg-blue-500 text-white p-2">
          {resetMode
            ? t(locale, 'admin_login_reset_submit')
            : t(locale, 'admin_login_submit')}
        </button>
        {message && <p className="text-sm mt-2">{message}</p>}
      </form>
      <button onClick={() => setResetMode(!resetMode)} className="mt-4 underline text-sm">
        {resetMode
          ? t(locale, 'admin_login_switch_login')
          : t(locale, 'admin_login_forgot_password')}
      </button>
      {allowSignup && !resetMode && (
        <p className="mt-4 text-sm">
          {t(locale, 'admin_login_signup_prompt')}{' '}
          <Link href="/signup" className="text-blue-600 underline">
            {t(locale, 'signup_title')}
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
