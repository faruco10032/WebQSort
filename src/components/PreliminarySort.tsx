import { useEffect, useCallback } from 'react';
import { useSortStore } from '../hooks/useSortStore';
import { t } from '../lib/i18n';
import { PrelimPile } from '../types';

export function PreliminarySort() {
  const {
    deck,
    prelimAssignments,
    currentPrelimIndex,
    assignPrelim,
    undoPrelim,
    saveToLocalStorage,
    lang,
  } = useSortStore();

  const items = deck?.items ?? [];
  const total = items.length;
  const currentItem = items[currentPrelimIndex];

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(saveToLocalStorage, 30000);
    return () => clearInterval(interval);
  }, [saveToLocalStorage]);

  // Keyboard shortcuts
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!currentItem) return;
      if (e.key === 'Backspace') {
        e.preventDefault();
        undoPrelim();
        return;
      }
      const map: Record<string, PrelimPile> = {
        ArrowLeft: 'uncharacteristic',
        '1': 'uncharacteristic',
        ArrowDown: 'neutral',
        '2': 'neutral',
        ArrowRight: 'characteristic',
        '3': 'characteristic',
      };
      const pile = map[e.key];
      if (pile) {
        e.preventDefault();
        assignPrelim(currentItem.id, pile);
      }
    },
    [currentItem, assignPrelim, undoPrelim]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const handlePileClick = (pile: PrelimPile) => {
    if (!currentItem) return;
    assignPrelim(currentItem.id, pile);
  };

  const pileCount = (pile: PrelimPile) =>
    Object.values(prelimAssignments).filter((p) => p === pile).length;

  // If no current item (shouldn't happen since auto-advance handles completion)
  if (!currentItem) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col" style={{ height: 'calc(100vh - 48px)' }}>
      <h2 className="text-xl font-bold mb-2">{t(lang, 'presort')}</h2>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>{currentPrelimIndex + 1} {t(lang, 'itemOf', { total })}</span>
          <span>{Math.round((currentPrelimIndex / total) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(currentPrelimIndex / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Current item display - fixed height area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-xl" style={{ minHeight: '180px' }}>
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-8 w-full text-center shadow-lg" style={{ minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p className="text-lg leading-relaxed">{currentItem.text}</p>
          </div>
        </div>

        {/* Three pile buttons - fixed position */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-xl mt-6">
          <button
            onClick={() => handlePileClick('uncharacteristic')}
            className="flex flex-col items-center justify-center p-4 border-2 border-red-300 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition"
          >
            <span className="text-sm font-medium">{t(lang, 'uncharacteristic')}</span>
            <span className="text-xs text-gray-500 mt-1">← / 1</span>
            <span className="text-lg font-bold mt-2">{pileCount('uncharacteristic')}</span>
          </button>
          <button
            onClick={() => handlePileClick('neutral')}
            className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <span className="text-sm font-medium">{t(lang, 'neutral')}</span>
            <span className="text-xs text-gray-500 mt-1">↓ / 2</span>
            <span className="text-lg font-bold mt-2">{pileCount('neutral')}</span>
          </button>
          <button
            onClick={() => handlePileClick('characteristic')}
            className="flex flex-col items-center justify-center p-4 border-2 border-green-300 dark:border-green-700 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition"
          >
            <span className="text-sm font-medium">{t(lang, 'characteristic')}</span>
            <span className="text-xs text-gray-500 mt-1">→ / 3</span>
            <span className="text-lg font-bold mt-2">{pileCount('characteristic')}</span>
          </button>
        </div>

        {/* Back button - always takes space to prevent layout shift */}
        <div className="mt-4 h-8">
          {currentPrelimIndex > 0 ? (
            <button
              onClick={undoPrelim}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {t(lang, 'backToPrevious')} (Backspace)
            </button>
          ) : (
            <span>&nbsp;</span>
          )}
        </div>
      </div>
    </div>
  );
}
