import { getSession } from 'next-auth/react';
import { useContext } from 'react';
import AdminNav from '../../components/AdminNav';
import { LocaleContext } from '../../lib/LocaleContext';
import { t } from '../../lib/i18n';

const AdminHome = () => {
  const { locale } = useContext(LocaleContext);
  return (
    <div className="p-4">
      <AdminNav />
      <h1 className="text-2xl font-bold">{t(locale, 'admin_dashboard_title')}</h1>
      <p className="mt-2">{t(locale, 'admin_dashboard_description')}</p>
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
