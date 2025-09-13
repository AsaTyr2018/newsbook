import { useRouter } from 'next/router';
import { useEffect, useContext } from 'react';
import { LocaleContext } from '../lib/LocaleContext';
import { t } from '../lib/i18n';

interface Props {
  currentPath: string;
}

const Maintenance = ({ currentPath }: Props) => {
  const router = useRouter();
  const { locale } = useContext(LocaleContext);
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.maintenance !== 'true') {
          clearInterval(interval);
          router.replace(currentPath);
        }
      } catch (e) {
        // ignore
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentPath, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-2xl">{t(locale, 'maintenance_message')}</h1>
    </div>
  );
};

export default Maintenance;
