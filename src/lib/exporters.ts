import { SessionMetadata, Deck, PileConfig } from '../types';

interface ExportData {
  metadata: SessionMetadata;
  deck: Deck;
  sortVector: number[];
  pileConfig: PileConfig[];
}

/**
 * Export as CSV — 1 header row + 1 data row
 * Columns: target_id, condition, deck_name, trial, started_at, finished_at, duration_sec, Q1, Q2, ..., QN
 */
export function exportCsv(data: ExportData): string {
  const m = data.metadata;
  const durationSec = Math.round(
    (new Date(m.finishedAt).getTime() - new Date(m.startedAt).getTime()) / 1000
  );

  const itemCount = data.deck.items.length;
  const qHeaders = Array.from({ length: itemCount }, (_, i) => `Q${i + 1}`);

  const header = ['target_id', 'condition', 'deck_name', 'trial', 'started_at', 'finished_at', 'duration_sec', ...qHeaders].join(',');

  const qValues = data.sortVector.map((v) => String(v));

  const row = [
    m.targetId,
    m.condition,
    m.deckName,
    String(m.trial),
    m.startedAt,
    m.finishedAt,
    String(durationSec),
    ...qValues,
  ].join(',');

  return header + '\n' + row;
}

/**
 * Generate suggested filename
 */
export function suggestFilename(m: SessionMetadata): string {
  const date = m.finishedAt
    ? new Date(m.finishedAt).toISOString().slice(0, 10).replace(/-/g, '')
    : new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `${m.targetId}_${m.deckName}_T${m.trial}_${date}.csv`;
}

/**
 * Trigger file download with BOM for Excel UTF-8 compatibility
 */
export function downloadFile(content: string, filename: string) {
  const bom = '\uFEFF';
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
