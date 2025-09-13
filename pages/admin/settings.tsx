import { getSession } from 'next-auth/react';
import { FormEvent, useEffect, useState, useContext } from 'react';
import AdminNav from '../../components/AdminNav';
import { LocaleContext } from '../../lib/LocaleContext';
import { t } from '../../lib/i18n';

const AdminSettings = () => {
  const [siteName, setSiteName] = useState('');
  const [siteLocale, setSiteLocale] = useState('');
  const [timezone, setTimezone] = useState('');
  const [allowSignup, setAllowSignup] = useState(false);
  const [avatarMaxSize, setAvatarMaxSize] = useState('');
  const [avatarAllowedFormats, setAvatarAllowedFormats] = useState('');
  const [avatarMaxDimension, setAvatarMaxDimension] = useState('');
  const [avatarMinDimension, setAvatarMinDimension] = useState('');
  const [saved, setSaved] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { locale } = useContext(LocaleContext);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setSiteName(data.siteName || '');
        setSiteLocale(data.locale || '');
        setTimezone(data.timezone || '');
        setAllowSignup(data.allowSignup === 'true');
        setAvatarMaxSize(data.avatarMaxSize || '2');
        setAvatarAllowedFormats(
          data.avatarAllowedFormats || 'image/png,image/jpeg,image/jpg,image/gif,image/webp'
        );
        setAvatarMaxDimension(data.avatarMaxDimension || '1024');
        setAvatarMinDimension(data.avatarMinDimension || '64');
      });
  }, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteName,
        locale: siteLocale,
        timezone,
        allowSignup,
        avatarMaxSize,
        avatarAllowedFormats,
        avatarMaxDimension,
        avatarMinDimension,
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4">
      <AdminNav />
      <h1 className="text-2xl font-bold mb-4">{t(locale, 'admin_settings_title')}</h1>
      <form onSubmit={save} className="flex flex-col gap-2 max-w-md">
        <input
          className="border p-2"
          placeholder={t(locale, 'admin_settings_site_title_placeholder')}
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
        />
        <select
          className="border p-2"
          value={siteLocale}
          onChange={(e) => setSiteLocale(e.target.value)}
        >
          <option value="de-DE">Deutsch (de-DE)</option>
          <option value="en-EN">English (en-EN)</option>
        </select>
        <input
          className="border p-2"
          placeholder={t(locale, 'admin_settings_timezone_placeholder')}
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={allowSignup}
            onChange={(e) => setAllowSignup(e.target.checked)}
          />
          <span>{t(locale, 'admin_settings_allow_signup')}</span>
        </label>
        <input
          className="border p-2"
          type="number"
          placeholder={t(locale, 'admin_settings_avatar_max_size_placeholder')}
          value={avatarMaxSize}
          onChange={(e) => setAvatarMaxSize(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder={t(locale, 'admin_settings_avatar_allowed_formats_placeholder')}
          value={avatarAllowedFormats}
          onChange={(e) => setAvatarAllowedFormats(e.target.value)}
        />
        <input
          className="border p-2"
          type="number"
          placeholder={t(locale, 'admin_settings_avatar_max_dimension_placeholder')}
          value={avatarMaxDimension}
          onChange={(e) => setAvatarMaxDimension(e.target.value)}
        />
        <input
          className="border p-2"
          type="number"
          placeholder={t(locale, 'admin_settings_avatar_min_dimension_placeholder')}
          value={avatarMinDimension}
          onChange={(e) => setAvatarMinDimension(e.target.value)}
        />
        <button className="bg-blue-500 text-white p-2">{t(locale, 'admin_settings_save')}</button>
        {saved && <p className="text-green-600">{t(locale, 'admin_settings_saved')}</p>}
        <button
          type="button"
          onClick={async () => {
            setUpdating(true);
            await fetch('/api/update', { method: 'POST' });
            setUpdating(false);
          }}
          className="bg-gray-500 text-white p-2"
        >
          {t(locale, 'admin_settings_update')}
        </button>
        {updating && <p className="text-blue-600">{t(locale, 'admin_settings_updating')}</p>}
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
