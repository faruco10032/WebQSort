import { useEffect, useState } from 'react';
import { useSortStore } from './hooks/useSortStore';
import { parseDeckFile } from './lib/rapParser';
import { t } from './lib/i18n';
import { SessionSetup } from './components/SessionSetup';
import { PreliminarySort } from './components/PreliminarySort';
import { FinalSort } from './components/FinalSort';
import { ExportDialog } from './components/ExportDialog';

const PRESET_DECKS = [
  { file: 'RSQ3-15_ja.txt', label: 'RSQ 3.15 (JA)', name: 'RSQ3-15_ja' },
  { file: 'RBQ3-11_ja.txt', label: 'RBQ 3.11 (JA)', name: 'RBQ3-11_ja' },
  { file: 'RSQ3-15.txt', label: 'RSQ 3.15 (EN)', name: 'RSQ3-15' },
  { file: 'RBQ3-11.txt', label: 'RBQ 3.11 (EN)', name: 'RBQ3-11' },
  { file: 'CAQ_Deck.txt', label: 'CAQ (EN)', name: 'CAQ' },
];

export default function App() {
  const { phase, lang, setLang, loadFromLocalStorage, deck, setDeck } = useSortStore();
  const [showResume, setShowResume] = useState(false);
  const [deckMenuOpen, setDeckMenuOpen] = useState(false);

  const isInSession = phase === 'preliminary' || phase === 'final';

  useEffect(() => {
    const hasSaved = loadFromLocalStorage();
    if (hasSaved && useSortStore.getState().phase !== 'setup') {
      setShowResume(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPreset = async (preset: (typeof PRESET_DECKS)[number]) => {
    try {
      const res = await fetch(`./decks/${preset.file}`);
      if (!res.ok) return;
      const text = await res.text();
      const parsed = parseDeckFile(text, preset.name);
      setDeck(parsed);
      setDeckMenuOpen(false);
    } catch { /* ignore */ }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseDeckFile(reader.result as string, file.name);
        setDeck(parsed);
        setDeckMenuOpen(false);
      } catch { /* ignore */ }
    };
    reader.readAsText(file);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold">{t(lang, 'appTitle')}</h1>
          {isInSession && (
            <span className="text-sm text-gray-500">
              {phase === 'preliminary' ? t(lang, 'presort') : t(lang, 'mainSort')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Deck selector - always visible in header */}
          {!isInSession && (
            <div className="relative">
              <button
                onClick={() => setDeckMenuOpen(!deckMenuOpen)}
                className="text-sm px-3 py-1 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-600"
              >
                {deck ? deck.name : t(lang, 'selectDeck')}
              </button>
              {deckMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDeckMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded shadow-lg z-20 min-w-[200px]">
                    {PRESET_DECKS.map((p) => (
                      <button
                        key={p.file}
                        onClick={() => loadPreset(p)}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          deck?.name === p.name ? 'bg-blue-50 dark:bg-blue-900/30 font-medium' : ''
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                    <div className="border-t dark:border-gray-600 px-4 py-2">
                      <label className="text-xs text-gray-500 cursor-pointer">
                        {t(lang, 'uploadDeck')}
                        <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Show deck name during session (read-only) */}
          {isInSession && deck && (
            <span className="text-xs text-gray-400 border border-gray-200 dark:border-gray-700 rounded px-2 py-1">
              {deck.name}
            </span>
          )}

          {/* Language toggle */}
          <div className="flex rounded border dark:border-gray-600 overflow-hidden text-sm">
            <button
              onClick={() => setLang('ja')}
              className={`px-2 py-1 transition ${
                lang === 'ja'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              JA
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 transition ${
                lang === 'en'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* Resume dialog */}
      {showResume && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <p className="font-medium mb-4">{t(lang, 'foundSavedSession')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResume(false)}
                className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t(lang, 'resume')}
              </button>
              <button
                onClick={() => {
                  setShowResume(false);
                  useSortStore.getState().clearCurrentSession();
                }}
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
      </main>
    </div>
  );
}
