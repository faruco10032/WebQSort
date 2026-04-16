import { useDraggable } from '@dnd-kit/core';
import { PrelimPile } from '../types';

interface Props {
  id: number;
  label: string;
  prelimPile?: PrelimPile;
}

const pileBgColors: Record<PrelimPile, string> = {
  uncharacteristic: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800',
  neutral: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
  characteristic: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800',
};

export function DraggableItem({ id, label, prelimPile }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: String(id),
  });

  const bgClass = prelimPile ? pileBgColors[prelimPile] : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600';

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`px-2 py-1 border rounded text-xs cursor-grab active:cursor-grabbing touch-none truncate ${bgClass} ${isDragging ? 'opacity-30' : ''}`}
    >
      {label}
    </div>
  );
}
