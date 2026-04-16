import { SessionMetadata, Deck, PileConfig } from '../types';

interface ExportData {
  metadata: SessionMetadata;
  deck: Deck;
  sortVector: number[];
  pileConfig: PileConfig[];
}

/**
 * Export as CSV
 */
export function exportCsv(data: ExportData): string {
  const m = data.metadata;
  const durationSec = Math.round(
    (new Date(m.finishedAt).getTime() - new Date(m.startedAt).getTime()) / 1000
  );

  const header = 'target_id,condition,deck_name,trial,started_at,finished_at,duration_sec,item_id,item_text,pile';

  const rows = data.deck.items.map((item) => {
    const pile = data.sortVector[item.id - 1] ?? '';
    const text = `"${item.text.replace(/"/g, '""')}"`;
    return `${m.targetId},${m.condition},${m.deckName},${m.trial},${m.startedAt},${m.finishedAt},${durationSec},${item.id},${text},${pile}`;
  });

  return [header, ...rows].join('\n');
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
 * Trigger file download
 */
export function downloadFile(content: string, filename: string, mime = 'text/csv') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
