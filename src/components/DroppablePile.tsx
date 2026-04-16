import { useDroppable } from '@dnd-kit/core';
import { ReactNode } from 'react';

interface Props {
  id: string;
  label: string;
  capacity: number;
  count: number;
  maxCapacity: number;
  children: ReactNode;
}

export function DroppablePile({ id, label, capacity, count, maxCapacity, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const isOverCapacity = count > capacity;
  const isFull = count === capacity;

  // Height proportional to capacity relative to max
  const heightPercent = Math.max((capacity / maxCapacity) * 100, 30);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col flex-1 min-w-[100px] border rounded transition-colors ${
        isOverCapacity
          ? 'border-red-500 bg-red-100 dark:bg-red-900/40'
          : isOver
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
          : isFull
          ? 'border-green-400 bg-green-50/50 dark:bg-green-900/10'
          : 'border-gray-300 dark:border-gray-600'
      }`}
      style={{ height: `${heightPercent}%`, minHeight: '80px' }}
    >
      {/* Header */}
      <div className="text-center py-1 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 rounded-t shrink-0">
        <div className="text-[10px] text-gray-600 dark:text-gray-400 leading-tight px-1 font-medium" title={label}>
          {label}
        </div>
        <div className={`text-xs font-bold ${isOverCapacity ? 'text-red-600' : isFull ? 'text-green-600' : 'text-gray-500'}`}>
          {count} / {capacity}
        </div>
      </div>
      {/* Items - overflow hidden, no wrap */}
      <div className="flex-1 flex flex-col gap-0.5 p-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
