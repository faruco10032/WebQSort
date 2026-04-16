import { CompletedSession, PileConfig } from '../types';

/**
 * Export as RAP-compatible .txt
 * Format: "TARGET_RATER pile1 pile2 pile3 ..."
 */
export function exportRapTxt(session: CompletedSession): string {
  const sessionId = `${session.metadata.targetId}_${session.metadata.raterId}`;
  const vector = session.sortVector.join(' ');
  return `${sessionId} ${vector} \n`;
}

/**
 * Export as CSV
 */
export function exportCsv(session: CompletedSession): string {
  const m = session.metadata;
  const header = 'target_id,rater_id,deck_name,session_id,condition_avatar,condition_voice,trial,started_at,finished_at,duration_sec,item_id,item_text,pile';
  const durationSec = Math.round(
    (new Date(m.finishedAt).getTime() - new Date(m.startedAt).getTime()) / 1000
  );

  const rows = session.deck.items.map((item) => {
    const pile = session.sortVector[item.id - 1] ?? '';
    const text = `"${item.text.replace(/"/g, '""')}"`;
    return `${m.targetId},${m.raterId},${m.deckName},${m.trial},${m.conditionAvatar},${m.conditionVoice},${m.trial},${m.startedAt},${m.finishedAt},${durationSec},${item.id},${text},${pile}`;
  });

  return [header, ...rows].join('\n');
}

/**
 * Export as JSON
 */
export function exportJson(session: CompletedSession): string {
  const m = session.metadata;
  const durationSec = Math.round(
    (new Date(m.finishedAt).getTime() - new Date(m.startedAt).getTime()) / 1000
  );

  const piles = session.pileConfig.map((p: PileConfig) => {
    const itemIds = session.deck.items
      .filter((item) => session.sortVector[item.id - 1] === p.value)
      .map((item) => item.id);
    return {
      index: p.index + 1,
      label: p.label,
      capacity: p.capacity,
      items: itemIds,
    };
  });

  const obj = {
    session_metadata: {
      target_id: m.targetId,
      rater_id: m.raterId,
      deck_name: m.deckName,
      condition: { avatar: m.conditionAvatar, voice: m.conditionVoice },
      trial: m.trial,
      started_at: m.startedAt,
      finished_at: m.finishedAt,
      duration_sec: durationSec,
      rating_mode: m.ratingMode,
      procedure: 'two_stage',
    },
    piles,
    sort_vector: session.sortVector,
  };

  return JSON.stringify(obj, null, 2);
}

/**
 * Export operation log as CSV
 */
export function exportOperationLog(session: CompletedSession): string {
  const header = 'timestamp,action,item_id,from,to';
  const rows = session.operationLog.map((e) =>
    `${e.timestamp},${e.action},${e.itemId},${e.from ?? ''},${e.to}`
  );
  return [header, ...rows].join('\n');
}

/**
 * Generate suggested filename
 */
export function suggestFilename(session: CompletedSession, ext: string): string {
  const m = session.metadata;
  const date = m.finishedAt
    ? new Date(m.finishedAt).toISOString().slice(0, 10).replace(/-/g, '')
    : new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `${m.targetId}_${m.raterId}_${m.deckName}_T${m.trial}_${date}.${ext}`;
}
