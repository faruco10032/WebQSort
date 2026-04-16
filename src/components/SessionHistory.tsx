import { useSortStore } from '../hooks/useSortStore';
import { exportRapTxt, exportCsv, exportJson, exportOperationLog, suggestFilename } from '../lib/exporters';
import { t } from '../lib/i18n';
import { CompletedSession } from '../types';
import JSZip from 'jszip';

function downloadFile(content: string, filename: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function SessionHistory() {
  const { completedSessions, deleteSession, clearCurrentSession, setPhase, lang } = useSortStore();

  const handleDownload = (session: CompletedSession, format: 'txt' | 'csv' | 'json') => {
    switch (format) {
      case 'txt':
        downloadFile(exportRapTxt(session), suggestFilename(session, 'txt'));
        break;
      case 'csv':
        downloadFile(exportCsv(session), suggestFilename(session, 'csv'), 'text/csv');
        break;
      case 'json':
        downloadFile(exportJson(session), suggestFilename(session, 'json'), 'application/json');
        break;
    }
  };

  const handleBulkExport = async () => {
    const zip = new JSZip();
    for (const session of completedSessions) {
      const base = suggestFilename(session, '').replace(/\.$/, '');
      zip.file(`${base}.txt`, exportRapTxt(session));
      zip.file(`${base}.csv`, exportCsv(session));
      zip.file(`${base}.json`, exportJson(session));
      zip.file(`${base}_log.csv`, exportOperationLog(session));
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qsort_sessions_${new Date().toISOString().slice(0, 10)}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{t(lang, 'history')}</h2>
        <button
          onClick={() => {
            clearCurrentSession();
            setPhase('setup');
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {t(lang, 'newSession')}
        </button>
      </div>

      {completedSessions.length === 0 ? (
        <p className="text-gray-500">{t(lang, 'noSessions')}</p>
      ) : (
        <>
          <button
            onClick={handleBulkExport}
            className="mb-4 px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
          >
            ZIP {t(lang, 'downloadAll')} ({completedSessions.length} sessions)
          </button>

          <div className="space-y-3">
            {completedSessions.map((session) => {
              const m = session.metadata;
              const duration = Math.round(
                (new Date(m.finishedAt).getTime() - new Date(m.startedAt).getTime()) / 1000
              );
              return (
                <div
                  key={session.id}
                  className="border rounded p-4 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {m.targetId} / {m.raterId} — {m.deckName} T{m.trial}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(session.completedAt).toLocaleString()} | {duration}s
                        {m.conditionAvatar && ' | Avatar'}
                        {m.conditionVoice && ' | Voice'}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDownload(session, 'txt')}
                        className="px-2 py-1 text-xs border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        TXT
                      </button>
                      <button
                        onClick={() => handleDownload(session, 'csv')}
                        className="px-2 py-1 text-xs border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        CSV
                      </button>
                      <button
                        onClick={() => handleDownload(session, 'json')}
                        className="px-2 py-1 text-xs border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        JSON
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(t(lang, 'delete') + '?')) deleteSession(session.id);
                        }}
                        className="px-2 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        {t(lang, 'delete')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
