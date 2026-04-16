import { useSortStore } from '../hooks/useSortStore';
import { exportRapTxt, exportCsv, exportJson, exportOperationLog, suggestFilename } from '../lib/exporters';
import { t } from '../lib/i18n';

function downloadFile(content: string, filename: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportDialog() {
  const { completedSessions, setPhase, clearCurrentSession, lang } = useSortStore();

  const session = completedSessions[completedSessions.length - 1];
  if (!session) return null;

  const handleDownload = (format: 'txt' | 'csv' | 'json' | 'log') => {
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
      case 'log':
        downloadFile(exportOperationLog(session), suggestFilename(session, 'log.csv'), 'text/csv');
        break;
    }
  };

  const handleDownloadAll = () => {
    handleDownload('txt');
    setTimeout(() => handleDownload('csv'), 200);
    setTimeout(() => handleDownload('json'), 400);
    setTimeout(() => handleDownload('log'), 600);
  };

  const m = session.metadata;
  const duration = Math.round(
    (new Date(m.finishedAt).getTime() - new Date(m.startedAt).getTime()) / 1000
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">{t(lang, 'export')}</h2>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-4 mb-6">
        <p className="text-green-800 dark:text-green-200 font-medium">Session completed successfully</p>
        <div className="text-sm text-green-700 dark:text-green-300 mt-2 space-y-1">
          <p>Target: {m.targetId} | Rater: {m.raterId}</p>
          <p>Deck: {m.deckName} | Trial: {m.trial}</p>
          <p>Duration: {duration}s</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <button
          onClick={() => handleDownload('txt')}
          className="w-full py-2 px-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-left flex justify-between items-center"
        >
          <span>{t(lang, 'txt')}</span>
          <span className="text-xs text-gray-400">{suggestFilename(session, 'txt')}</span>
        </button>
        <button
          onClick={() => handleDownload('csv')}
          className="w-full py-2 px-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-left flex justify-between items-center"
        >
          <span>{t(lang, 'csv')}</span>
          <span className="text-xs text-gray-400">{suggestFilename(session, 'csv')}</span>
        </button>
        <button
          onClick={() => handleDownload('json')}
          className="w-full py-2 px-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-left flex justify-between items-center"
        >
          <span>{t(lang, 'json')}</span>
          <span className="text-xs text-gray-400">{suggestFilename(session, 'json')}</span>
        </button>
        <button
          onClick={() => handleDownload('log')}
          className="w-full py-2 px-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-left flex justify-between items-center"
        >
          <span>{t(lang, 'operationLog')}</span>
          <span className="text-xs text-gray-400">{suggestFilename(session, 'log.csv')}</span>
        </button>
      </div>

      <button
        onClick={handleDownloadAll}
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
      >
        {t(lang, 'downloadAll')}
      </button>

      <div className="flex gap-4">
        <button
          onClick={() => {
            clearCurrentSession();
            setPhase('setup');
          }}
          className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {t(lang, 'newSession')}
        </button>
        <button
          onClick={() => setPhase('history')}
          className="flex-1 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          {t(lang, 'history')}
        </button>
      </div>
    </div>
  );
}
