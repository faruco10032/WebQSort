import { useState } from 'react';
import { useSortStore } from '../hooks/useSortStore';
import { validateTargetId } from '../lib/validation';
import { t } from '../lib/i18n';

export function SessionSetup() {
  const { metadata, setMetadata, deck, pileConfig, setPhase, lang } = useSortStore();
  const [errors, setErrors] = useState<string[]>([]);

  const handleStart = () => {
    const errs: string[] = [];
    if (!metadata.targetId) errs.push(t(lang, 'idRequired'));
    if (metadata.targetId && !validateTargetId(metadata.targetId)) errs.push(t(lang, 'idFormat'));
    if (!deck) errs.push(t(lang, 'deckRequired'));
    if (deck && pileConfig.length > 0) {
      const totalCap = pileConfig.reduce((a, p) => a + p.capacity, 0);
      if (totalCap !== deck.items.length) errs.push(t(lang, 'capacityMismatch'));
    }
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setMetadata({ startedAt: new Date().toISOString() });
    setPhase('preliminary');
  };

  return (
    <div className="max-w-md mx-auto p-6 pt-12">
      <h1 className="text-2xl font-bold mb-8">{t(lang, 'setup')}</h1>

      <div className="space-y-5">
        {/* Target ID */}
        <div>
          <label className="block text-sm font-medium mb-1">{t(lang, 'targetId')} *</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
            value={metadata.targetId}
            onChange={(e) => setMetadata({ targetId: e.target.value })}
            placeholder="S01"
          />
        </div>

        {/* Condition */}
        <div>
          <label className="block text-sm font-medium mb-1">{t(lang, 'condition')}</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
            value={metadata.condition}
            onChange={(e) => setMetadata({ condition: e.target.value })}
            placeholder="e.g. avatar_voice"
          />
        </div>

        {/* Trial Number */}
        <div>
          <label className="block text-sm font-medium mb-1">{t(lang, 'trial')}</label>
          <input
            type="number"
            min={1}
            max={99}
            className="w-32 border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
            value={metadata.trial}
            onChange={(e) => setMetadata({ trial: parseInt(e.target.value) || 1 })}
          />
        </div>

        {/* Deck info */}
        {deck && (
          <div className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 rounded p-3">
            {t(lang, 'deckName')}: <span className="font-medium">{deck.name}</span>
            {' — '}
            {t(lang, 'deckItemCount', { count: deck.items.length })}
            {pileConfig.length > 0 && (
              <span className="ml-1">
                ({t(lang, 'totalCapacity', { total: pileConfig.reduce((a, p) => a + p.capacity, 0) })})
              </span>
            )}
          </div>
        )}
        {!deck && (
          <div className="text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 rounded p-3">
            {t(lang, 'deckRequired')} — ヘッダーからデッキを選択してください
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-3">
            {errors.map((err, i) => (
              <p key={i} className="text-sm text-red-700 dark:text-red-300">{err}</p>
            ))}
          </div>
        )}

        {/* Start button */}
        <button
          onClick={handleStart}
          className="w-full py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
        >
          {t(lang, 'startSession')}
        </button>
      </div>
    </div>
  );
}
