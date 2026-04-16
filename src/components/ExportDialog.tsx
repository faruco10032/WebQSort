import { useSortStore } from '../hooks/useSortStore';
import { t } from '../lib/i18n';

export function ExportDialog() {
  const { clearCurrentSession, setPhase, lang } = useSortStore();

  return (
    <div className="max-w-md mx-auto p-6 pt-16 text-center">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8 mb-8">
        <div className="text-4xl mb-4">&#10003;</div>
        <h2 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
          {t(lang, 'sessionComplete')}
        </h2>
        <p className="text-sm text-green-700 dark:text-green-300">
          {t(lang, 'downloadComplete')}
        </p>
      </div>

      <button
        onClick={() => {
          clearCurrentSession();
          setPhase('setup');
        }}
        className="w-full py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
      >
        {t(lang, 'newSession')}
      </button>
    </div>
  );
}
