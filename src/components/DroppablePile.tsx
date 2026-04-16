import { useDroppable } from '@dnd-kit/core';
import { ReactNode } from 'react';

interface Props {
  id: string;
  label: string;
  sublabel: string;
  capacity: number;
  count: number;
  isOver: boolean;
  isUnder: boolean;
  children: ReactNode;
}

export function DroppablePile({ id, label, sublabel, capacity, count, isOver, isUnder, children }: Props) {
  const { setNodeRef, isOver: isDragOver } = useDroppable({ id });

  const capacityClass = isOver ? 'capacity-over' : isUnder ? 'capacity-under' : count === capacity ? 'capacity-ok' : '';
  const bgClass = isDragOver ? 'bg-blue-50 dark:bg-blue-900/20' : '';

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[110px] max-w-[140px] flex-1 border rounded ${bgClass} ${
        isOver ? 'border-red-400' : isUnder ? 'border-yellow-400' : 'border-gray-300 dark:border-gray-600'
      }`}
    >
      {/* Header */}
      <div className="text-center py-1 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t">
        <div className="text-sm font-bold">{label}</div>
        <div className="text-[10px] text-gray-500 leading-tight truncate px-1" title={sublabel}>
          {sublabel}
        </div>
        <div className={`text-xs ${capacityClass}`}>
          {count} / {capacity}
        </div>
      </div>
      {/* Items */}
      <div className="flex-1 flex flex-col gap-1 p-1 overflow-y-auto min-h-[60px]">{children}</div>
    </div>
  );
}
