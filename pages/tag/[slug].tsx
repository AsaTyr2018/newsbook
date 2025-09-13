import { useRouter } from 'next/router';
import { useContext } from 'react';
import { LocaleContext } from '../../lib/LocaleContext';
import { t } from '../../lib/i18n';

const TagPage = () => {
  const { slug } = useRouter().query;
  const { locale } = useContext(LocaleContext);
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{t(locale, 'tag_page_title')} {slug}</h1>
    </div>
  );
};

export default TagPage;
