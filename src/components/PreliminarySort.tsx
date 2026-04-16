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
    setPhase,
    saveToLocalStorage,
    lang,
  } = useSortStore();

  const items = deck?.items ?? [];
  const total = items.length;
  const currentItem = items[currentPrelimIndex];
  const isComplete = currentPrelimIndex >= total;

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(saveToLocalStorage, 30000);
    return () => clearInterval(interval);
  }, [saveToLocalStorage]);

  // Keyboard shortcuts
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (isComplete || !currentItem) return;
      const map: Record<string, PrelimPile> = {
        ArrowLeft: 'uncharacteristic',
        '1': 'uncharacteristic',
        ArrowDown: 'neutral',
        '2': 'neutral',
        ArrowRight: 'characteristic',
        '3': 'characteristic',
        Backspace: undefined as unknown as PrelimPile,
      };
      if (e.key === 'Backspace') {
        e.preventDefault();
        undoPrelim();
        return;
      }
      const pile = map[e.key];
      if (pile) {
        e.preventDefault();
        assignPrelim(currentItem.id, pile);
      }
    },
    [isComplete, currentItem, assignPrelim, undoPrelim]
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

  if (isComplete) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h2 className="text-xl font-bold mb-4">{t(lang, 'preliminary')}</h2>
        <p className="mb-2">
          {t(lang, 'uncharacteristic')}: {pileCount('uncharacteristic')} |{' '}
          {t(lang, 'neutral')}: {pileCount('neutral')} |{' '}
          {t(lang, 'characteristic')}: {pileCount('characteristic')}
        </p>
        <div className="flex gap-4 justify-center mt-6">
          <button
            onClick={() => undoPrelim()}
            className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {t(lang, 'backToPrevious')}
          </button>
          <button
            onClick={() => {
              saveToLocalStorage();
              setPhase('final');
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {t(lang, 'proceedToFinal')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col h-full">
      <h2 className="text-xl font-bold mb-2">{t(lang, 'preliminary')}</h2>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>
            {currentPrelimIndex + 1} {t(lang, 'itemOf', { total })}
          </span>
          <span>{Math.round((currentPrelimIndex / total) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(currentPrelimIndex / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Current item display */}
      {currentItem && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-8 max-w-lg w-full text-center shadow-lg mb-8">
            <p className="text-lg leading-relaxed">{currentItem.text}</p>
            <p className="text-xs text-gray-400 mt-4">#{currentItem.id}</p>
          </div>

          {/* Three pile buttons */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
            <button
              onClick={() => handlePileClick('uncharacteristic')}
              className="pile-drop-area flex flex-col items-center justify-center p-4 border-2 border-red-300 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition"
            >
              <span className="text-sm font-medium">{t(lang, 'uncharacteristic')}</span>
              <span className="text-xs text-gray-500 mt-1">← / 1</span>
              <span className="text-lg font-bold mt-2">{pileCount('uncharacteristic')}</span>
            </button>
            <button
              onClick={() => handlePileClick('neutral')}
              className="pile-drop-area flex flex-col items-center justify-center p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <span className="text-sm font-medium">{t(lang, 'neutral')}</span>
              <span className="text-xs text-gray-500 mt-1">↓ / 2</span>
              <span className="text-lg font-bold mt-2">{pileCount('neutral')}</span>
            </button>
            <button
              onClick={() => handlePileClick('characteristic')}
              className="pile-drop-area flex flex-col items-center justify-center p-4 border-2 border-green-300 dark:border-green-700 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition"
            >
              <span className="text-sm font-medium">{t(lang, 'characteristic')}</span>
              <span className="text-xs text-gray-500 mt-1">→ / 3</span>
              <span className="text-lg font-bold mt-2">{pileCount('characteristic')}</span>
            </button>
          </div>

          {/* Back button */}
          {currentPrelimIndex > 0 && (
            <button
              onClick={undoPrelim}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {t(lang, 'backToPrevious')} (Backspace)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
