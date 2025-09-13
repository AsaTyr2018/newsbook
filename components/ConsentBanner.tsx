import { useContext } from 'react';
import { LocaleContext } from '../lib/LocaleContext';
import { t } from '../lib/i18n';

interface Props {
  onAccept: () => void;
  onDecline: () => void;
}

const ConsentBanner = ({ onAccept, onDecline }: Props) => {
  const { locale } = useContext(LocaleContext);
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-md max-w-md text-center">
        <p className="mb-4">{t(locale, 'consent_message')}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onAccept}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {t(locale, 'consent_accept')}
          </button>
          <button
            onClick={onDecline}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded"
          >
            {t(locale, 'consent_decline')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
