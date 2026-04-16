import { useState, useEffect } from 'react';
import { useSortStore } from '../hooks/useSortStore';
import { parseDeckFile } from '../lib/rapParser';
import { validateTargetId, validateRaterId, validateDeckCapacity } from '../lib/validation';
import { t } from '../lib/i18n';

const PRESET_DECKS = [
  { file: 'RSQ3-15_ja.txt', label: 'RSQ 3.15 (日本語)', name: 'RSQ3-15_ja' },
  { file: 'RBQ3-11_ja.txt', label: 'RBQ 3.11 (日本語)', name: 'RBQ3-11_ja' },
  { file: 'RSQ3-15.txt', label: 'RSQ 3.15 (English)', name: 'RSQ3-15' },
  { file: 'RBQ3-11.txt', label: 'RBQ 3.11 (English)', name: 'RBQ3-11' },
  { file: 'CAQ_Deck.txt', label: 'CAQ (English)', name: 'CAQ' },
];

export function SessionSetup() {
  const { metadata, setMetadata, setDeck, deck, pileConfig, setPhase, lang } = useSortStore();
  const [errors, setErrors] = useState<string[]>([]);
  const [deckError, setDeckError] = useState<string | null>(null);

  useEffect(() => {
    setMetadata({ startedAt: new Date().toISOString() });
  }, [setMetadata]);

  const loadPreset = async (preset: (typeof PRESET_DECKS)[number]) => {
    try {
      const res = await fetch(`./decks/${preset.file}`);
      if (!res.ok) throw new Error(`Failed to load ${preset.file}`);
      const text = await res.text();
      const parsed = parseDeckFile(text, preset.name);
      setDeck(parsed);
      setMetadata({ deckName: parsed.name });
      setDeckError(null);
    } catch (e) {
      setDeckError(String(e));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseDeckFile(reader.result as string, file.name);
        setDeck(parsed);
        setMetadata({ deckName: parsed.name });
        setDeckError(null);
      } catch (err) {
        setDeckError(String(err));
      }
    };
    reader.readAsText(file);
  };

  const handleStart = () => {
    const errs: string[] = [];
    if (!metadata.targetId || !metadata.raterId) errs.push(t(lang, 'idRequired'));
    if (metadata.targetId && !validateTargetId(metadata.targetId)) errs.push(t(lang, 'idFormat'));
    if (metadata.raterId && !validateRaterId(metadata.raterId)) errs.push(t(lang, 'idFormat'));
    if (!deck) errs.push(t(lang, 'deckRequired'));
    if (deck && pileConfig.length > 0) {
      const capErr = validateDeckCapacity(deck, pileConfig.map((p) => p.capacity));
      if (capErr) errs.push(capErr);
    }
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setMetadata({ startedAt: new Date().toISOString() });
    setPhase('preliminary');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{t(lang, 'setup')}</h1>

      <div className="space-y-4">
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

        {/* Rater ID */}
        <div>
          <label className="block text-sm font-medium mb-1">{t(lang, 'raterId')} *</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
            value={metadata.raterId}
            onChange={(e) => setMetadata({ raterId: e.target.value })}
            placeholder="R01 or self"
          />
        </div>

        {/* Participant Name */}
        <div>
          <label className="block text-sm font-medium mb-1">{t(lang, 'participantName')}</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
            value={metadata.participantName}
            onChange={(e) => setMetadata({ participantName: e.target.value })}
          />
        </div>

        {/* Conditions */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t(lang, 'conditionAvatar')}</label>
            <button
              className={`px-4 py-2 rounded border w-full ${
                metadata.conditionAvatar
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
              }`}
              onClick={() => setMetadata({ conditionAvatar: !metadata.conditionAvatar })}
            >
              {metadata.conditionAvatar ? t(lang, 'on') : t(lang, 'off')}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t(lang, 'conditionVoice')}</label>
            <button
              className={`px-4 py-2 rounded border w-full ${
                metadata.conditionVoice
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
              }`}
              onClick={() => setMetadata({ conditionVoice: !metadata.conditionVoice })}
            >
              {metadata.conditionVoice ? t(lang, 'on') : t(lang, 'off')}
            </button>
          </div>
        </div>

        {/* Trial */}
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

        {/* Rating Mode */}
        <div>
          <label className="block text-sm font-medium mb-1">{t(lang, 'ratingMode')}</label>
          <select
            className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
            value={metadata.ratingMode}
            onChange={(e) => setMetadata({ ratingMode: e.target.value as 'self' | 'other' })}
          >
            <option value="self">{t(lang, 'ratingModeSelf')}</option>
            <option value="other">{t(lang, 'ratingModeOther')}</option>
          </select>
        </div>

        {/* Deck Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">{t(lang, 'deckName')} *</label>
          <div className="space-y-2">
            <p className="text-xs text-gray-500">{t(lang, 'presetDecks')}</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_DECKS.map((p) => (
                <button
                  key={p.file}
                  onClick={() => loadPreset(p)}
                  className={`px-3 py-1.5 text-sm border rounded ${
                    deck?.name === p.name
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="mt-2">
              <label className="text-xs text-gray-500 block mb-1">{t(lang, 'uploadDeck')}</label>
              <input type="file" accept=".txt" onChange={handleFileUpload} className="text-sm" />
            </div>
          </div>
          {deck && (
            <p className="text-sm text-green-600 mt-2">
              {deck.name} — {t(lang, 'deckItemCount', { count: deck.items.length })}
              {pileConfig.length > 0 && (
                <span className="ml-2">
                  ({t(lang, 'totalCapacity', { total: pileConfig.reduce((a, p) => a + p.capacity, 0) })})
                </span>
              )}
            </p>
          )}
          {deck && pileConfig.length === 0 && (
            <p className="text-sm text-yellow-600 mt-1">
              Unknown deck configuration. Please set pile capacities manually or use a known preset.
            </p>
          )}
          {deckError && <p className="text-sm text-red-600 mt-1">{deckError}</p>}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">{t(lang, 'notes')}</label>
          <textarea
            className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
            rows={3}
            value={metadata.notes}
            onChange={(e) => setMetadata({ notes: e.target.value })}
          />
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-3">
            {errors.map((err, i) => (
              <p key={i} className="text-sm text-red-700 dark:text-red-300">
                {err}
              </p>
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
