import { getSession, useSession } from 'next-auth/react';
import { useContext } from 'react';
import { ThemeContext } from '../lib/ThemeContext';

const Profile = () => {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Profil</h1>
      {session && <p>Angemeldet als {session.user?.name}</p>}
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
