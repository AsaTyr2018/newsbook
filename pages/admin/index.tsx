import { getSession } from 'next-auth/react';
import AdminNav from '../../components/AdminNav';

const AdminHome = () => {
  return (
    <div className="p-4">
      <AdminNav />
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="mt-2">Wähle eine Aktion aus der Navigation.</p>
    </div>
  );
};

export default AdminHome;

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
