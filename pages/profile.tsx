import { getSession, useSession } from 'next-auth/react';

const Profile = () => {
  const { data: session } = useSession();
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Profil</h1>
      {session && <p>Angemeldet als {session.user?.name}</p>}
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
