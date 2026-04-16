import { useEffect, useState } from 'react';
import { useSortStore } from './hooks/useSortStore';
import { SessionSetup } from './components/SessionSetup';
import { PreliminarySort } from './components/PreliminarySort';
import { FinalSort } from './components/FinalSort';
import { ExportDialog } from './components/ExportDialog';
import { SessionHistory } from './components/SessionHistory';
import { t } from './lib/i18n';

export default function App() {
  const { phase, setPhase, lang, setLang, loadFromLocalStorage, loadCompletedSessions } = useSortStore();
  const [showResume, setShowResume] = useState(false);

  useEffect(() => {
    loadCompletedSessions();
    const hasSaved = loadFromLocalStorage();
    if (hasSaved && phase !== 'setup') {
      setShowResume(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResume = () => {
    setShowResume(false);
  };

  const handleAbandon = () => {
    setShowResume(false);
    useSortStore.getState().clearCurrentSession();
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
        <div className="flex items-center gap-4">
          <h1
            className="text-lg font-bold cursor-pointer"
            onClick={() => {
              if (phase === 'history' || phase === 'export') setPhase('setup');
            }}
          >
            {t(lang, 'appTitle')}
          </h1>
          {phase !== 'setup' && (
            <span className="text-sm text-gray-500">
              {phase === 'preliminary'
                ? t(lang, 'preliminary')
                : phase === 'final'
                ? t(lang, 'finalSort')
                : phase === 'export'
                ? t(lang, 'export')
                : phase === 'history'
                ? t(lang, 'history')
                : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPhase('history')}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {t(lang, 'history')}
          </button>
          <button
            onClick={() => setLang(lang === 'ja' ? 'en' : 'ja')}
            className="text-sm px-2 py-1 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {lang === 'ja' ? 'EN' : 'JA'}
          </button>
        </div>
      </header>

      {/* Resume dialog */}
      {showResume && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <p className="font-medium mb-4">{t(lang, 'foundSavedSession')}</p>
            <div className="flex gap-3">
              <button
                onClick={handleResume}
                className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t(lang, 'resume')}
              </button>
              <button
                onClick={handleAbandon}
                className="flex-1 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t(lang, 'abandon')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {phase === 'setup' && <SessionSetup />}
        {phase === 'preliminary' && <PreliminarySort />}
        {phase === 'final' && <FinalSort />}
        {phase === 'export' && <ExportDialog />}
        {phase === 'history' && <SessionHistory />}
      </main>
    </div>
  );
}
