import { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useSortStore } from '../hooks/useSortStore';
import { t } from '../lib/i18n';
import { validateSortComplete } from '../lib/validation';
import { PILE_LABELS_JA } from '../types';
import { DroppablePile } from './DroppablePile';
import { DraggableItem } from './DraggableItem';

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
    completeSession,
    lang,
  } = useSortStore();

  const [activeId, setActiveId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [popup, setPopup] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
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
  const truncate = (text: string, len = 23) => (text.length > len ? text.slice(0, len) + '...' : text);

  // Search filter
  const matchesSearch = (id: number) => {
    if (!search) return true;
    const text = getItemText(id);
    return (
      String(id).includes(search) ||
      text.toLowerCase().includes(search.toLowerCase())
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const itemId = Number(active.id);
    const targetStr = String(over.id);

    // Target is a pile
    if (targetStr.startsWith('pile-')) {
      const targetPile = parseInt(targetStr.replace('pile-', ''));
      const currentPile = finalAssignments[itemId];
      if (currentPile !== undefined) {
        moveFinal(itemId, currentPile, targetPile);
      } else {
        assignFinal(itemId, targetPile);
      }
    }
    // Target is "unassigned" area - remove from pile
    else if (targetStr === 'unassigned') {
      if (finalAssignments[itemId] !== undefined) {
        removeFinal(itemId);
      }
    }
  };

  const handleComplete = () => {
    if (!deck) return;
    const errors = validateSortComplete(finalAssignments, deck, pileConfig);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    completeSession();
    setPhase('export');
  };

  const allPlaced = Object.keys(finalAssignments).length === items.length;
  const pileLabels = lang === 'ja' ? PILE_LABELS_JA : pileConfig.map((p) => p.label);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex flex-col p-2 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 px-2">
          <h2 className="text-lg font-bold">{t(lang, 'finalSort')}</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={t(lang, 'searchItems')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm border rounded px-2 py-1 w-48 dark:bg-gray-800 dark:border-gray-600"
            />
            <span className="text-sm text-gray-500">
              {Object.keys(finalAssignments).length}/{items.length}
            </span>
          </div>
        </div>

        {/* Pile grid */}
        <div className="flex-1 flex gap-1 overflow-x-auto min-h-0">
          {pileConfig.map((pile, idx) => {
            const count = pileItems[idx]?.length ?? 0;
            const isOver = count > pile.capacity;
            const isUnder = count < pile.capacity && allPlaced;
            return (
              <DroppablePile
                key={idx}
                id={`pile-${idx}`}
                label={`${idx + 1}`}
                sublabel={pileLabels[idx] ?? ''}
                capacity={pile.capacity}
                count={count}
                isOver={isOver}
                isUnder={isUnder}
              >
                {(pileItems[idx] ?? [])
                  .filter(matchesSearch)
                  .map((itemId) => (
                    <DraggableItem
                      key={itemId}
                      id={itemId}
                      label={truncate(getItemText(itemId))}
                      itemNumber={itemId}
                      onClick={() => setPopup(itemId)}
                    />
                  ))}
              </DroppablePile>
            );
          })}
        </div>

        {/* Unassigned items */}
        <div className="mt-2 border-t pt-2">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {(['uncharacteristic', 'neutral', 'characteristic'] as const).map((pile) => (
              <div key={pile} className="flex-1 min-w-[200px]">
                <div className="text-xs font-medium text-gray-500 mb-1">
                  {pile === 'uncharacteristic'
                    ? t(lang, 'uncharacteristic')
                    : pile === 'neutral'
                    ? t(lang, 'neutral')
                    : t(lang, 'characteristic')}{' '}
                  ({unassigned[pile].length})
                </div>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  {unassigned[pile].filter(matchesSearch).map((itemId) => (
                    <DraggableItem
                      key={itemId}
                      id={itemId}
                      label={truncate(getItemText(itemId))}
                      itemNumber={itemId}
                      onClick={() => setPopup(itemId)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Complete button */}
        <div className="flex items-center justify-between mt-2 px-2">
          <button
            onClick={() => setPhase('preliminary')}
            className="px-4 py-2 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {t(lang, 'backToPrevious')}
          </button>
          <div>
            {validationErrors.length > 0 && (
              <div className="text-red-600 text-xs mb-1">
                {validationErrors.map((e, i) => (
                  <div key={i}>{e}</div>
                ))}
              </div>
            )}
            <button
              onClick={handleComplete}
              className={`px-6 py-2 rounded font-medium transition ${
                allPlaced
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {t(lang, 'complete')}
            </button>
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeId !== null ? (
          <div className="card-item shadow-lg">
            {truncate(getItemText(activeId))}
            <span className="text-xs text-gray-400 ml-1">#{activeId}</span>
          </div>
        ) : null}
      </DragOverlay>

      {/* Popup */}
      {popup !== null && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setPopup(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg leading-relaxed">{getItemText(popup)}</p>
            <p className="text-sm text-gray-400 mt-3">#{popup}</p>
            <button
              onClick={() => setPopup(null)}
              className="mt-4 px-4 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </DndContext>
  );
}
