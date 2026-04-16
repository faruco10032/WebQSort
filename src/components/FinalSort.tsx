import { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  pointerWithin,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import { useSortStore } from '../hooks/useSortStore';
import { t } from '../lib/i18n';
import { PILE_LABELS_JA } from '../types';
import { DroppablePile } from './DroppablePile';
import { DraggableItem } from './DraggableItem';
import { exportCsv, suggestFilename, downloadFile } from '../lib/exporters';

export function FinalSort() {
  const {
    deck,
    pileConfig,
    prelimAssignments,
    finalAssignments,
    assignFinal,
    moveFinal,
    removeFinal,
    setPhase,
    saveToLocalStorage,
    metadata,
    setMetadata,
    getSortVector,
    clearCurrentSession,
    setLastExport,
    lang,
  } = useSortStore();

  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor)
  );

  const items = deck?.items ?? [];

  // Auto-save
  useEffect(() => {
    const interval = setInterval(saveToLocalStorage, 30000);
    return () => clearInterval(interval);
  }, [saveToLocalStorage]);

  // Group unassigned items by preliminary pile
  const unassigned = useMemo(() => {
    const assigned = new Set(Object.keys(finalAssignments).map(Number));
    const groups = { uncharacteristic: [] as number[], neutral: [] as number[], characteristic: [] as number[] };
    for (const item of items) {
      if (!assigned.has(item.id)) {
        const prelim = prelimAssignments[item.id] ?? 'neutral';
        groups[prelim].push(item.id);
      }
    }
    return groups;
  }, [items, finalAssignments, prelimAssignments]);

  // Pile contents
  const pileItems = useMemo(() => {
    const result: Record<number, number[]> = {};
    for (let i = 0; i < pileConfig.length; i++) result[i] = [];
    for (const [idStr, pileIdx] of Object.entries(finalAssignments)) {
      if (result[pileIdx]) result[pileIdx].push(Number(idStr));
    }
    return result;
  }, [finalAssignments, pileConfig]);

  const getItemText = (id: number) => items.find((i) => i.id === id)?.text ?? '';

  // Check if any pile is over capacity
  const hasOverCapacity = pileConfig.some((pile) => {
    const count = pileItems[pile.index]?.length ?? 0;
    return count > pile.capacity;
  });

  const allPlaced = Object.keys(finalAssignments).length === items.length;
  const canComplete = allPlaced && !hasOverCapacity;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const itemId = Number(active.id);
    const targetStr = String(over.id);

    if (targetStr.startsWith('pile-')) {
      const targetPile = parseInt(targetStr.replace('pile-', ''));
      const currentPile = finalAssignments[itemId];
      if (currentPile !== undefined) {
        moveFinal(itemId, currentPile, targetPile);
      } else {
        assignFinal(itemId, targetPile);
      }
    } else if (targetStr === 'unassigned') {
      if (finalAssignments[itemId] !== undefined) {
        removeFinal(itemId);
      }
    }
  };

  const handleComplete = () => {
    if (!canComplete || !deck) return;
    const now = new Date().toISOString();
    setMetadata({ finishedAt: now });

    // Build export data with finishedAt set
    const sortVector = getSortVector();
    const finalMetadata = { ...metadata, finishedAt: now };
    const csv = exportCsv({ metadata: finalMetadata, deck, sortVector, pileConfig });
    const filename = suggestFilename(finalMetadata);
    downloadFile(csv, filename);

    // Store export data for re-download on export screen
    setLastExport(csv, filename);

    // Clear session from localStorage (don't persist completed data)
    clearCurrentSession();
    setPhase('export');
  };

  const pileLabels = lang === 'ja' ? PILE_LABELS_JA : pileConfig.map((p) => p.label);
  const activeItemText = activeId !== null ? getItemText(activeId) : '';
  const activePrelimPile = activeId !== null ? prelimAssignments[activeId] : undefined;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex flex-col p-2 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-1 px-2">
          <h2 className="text-lg font-bold">{t(lang, 'mainSort')}</h2>
          <span className="text-sm text-gray-500">
            {Object.keys(finalAssignments).length}/{items.length}
          </span>
        </div>

        {/* Pile grid */}
        <div className="flex gap-1 overflow-x-auto items-end pb-1 shrink-0">
          {pileConfig.map((pile, idx) => {
            const count = pileItems[idx]?.length ?? 0;
            return (
              <DroppablePile
                key={idx}
                id={`pile-${idx}`}
                label={pileLabels[idx] ?? ''}
                capacity={pile.capacity}
                count={count}
              >
                {(pileItems[idx] ?? []).map((itemId) => (
                  <DraggableItem
                    key={itemId}
                    id={itemId}
                    label={getItemText(itemId)}
                    prelimPile={prelimAssignments[itemId]}
                  />
                ))}
              </DroppablePile>
            );
          })}
        </div>

        {/* Unassigned items */}
        <UnassignedArea
          unassigned={unassigned}
          getItemText={getItemText}
          prelimAssignments={prelimAssignments}
          lang={lang}
        />

        {/* Complete button */}
        <div className="flex items-center justify-end mt-1 px-2">
          <button
            onClick={handleComplete}
            disabled={!canComplete}
            className={`px-6 py-2 rounded font-medium transition ${
              canComplete
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {t(lang, 'complete')}
          </button>
        </div>
      </div>

      {/* Drag overlay - enlarged to show full text */}
      <DragOverlay>
        {activeId !== null ? (
          <div
            className={`px-4 py-3 border-2 rounded shadow-xl text-sm max-w-xs z-50 ${
              activePrelimPile === 'uncharacteristic'
                ? 'bg-red-50 border-red-300'
                : activePrelimPile === 'characteristic'
                ? 'bg-green-50 border-green-300'
                : 'bg-white border-gray-300'
            }`}
            style={{ minWidth: '200px' }}
          >
            {activeItemText}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function UnassignedArea({
  unassigned,
  getItemText,
  prelimAssignments,
  lang,
}: {
  unassigned: Record<string, number[]>;
  getItemText: (id: number) => string;
  prelimAssignments: Record<number, string>;
  lang: 'ja' | 'en';
}) {
  const { setNodeRef } = useDroppable({ id: 'unassigned' });

  return (
    <div ref={setNodeRef} className="flex-1 mt-1 border-t pt-1 min-h-0">
      <div className="flex gap-3 h-full overflow-x-auto pb-1">
        {(['uncharacteristic', 'neutral', 'characteristic'] as const).map((pile) => (
          <div key={pile} className="flex-1 min-w-[180px] flex flex-col">
            <div className="text-xs font-medium text-gray-500 mb-1 shrink-0">
              {pile === 'uncharacteristic'
                ? t(lang, 'uncharacteristic')
                : pile === 'neutral'
                ? t(lang, 'neutral')
                : t(lang, 'characteristic')}{' '}
              ({unassigned[pile]?.length ?? 0})
            </div>
            <div className="flex flex-wrap gap-1 flex-1 overflow-y-auto content-start">
              {(unassigned[pile] ?? []).map((itemId) => (
                <DraggableItem
                  key={itemId}
                  id={itemId}
                  label={getItemText(itemId)}
                  prelimPile={prelimAssignments[itemId] as 'uncharacteristic' | 'neutral' | 'characteristic'}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
