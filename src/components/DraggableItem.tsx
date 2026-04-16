import { useDraggable } from '@dnd-kit/core';

interface Props {
  id: number;
  label: string;
  itemNumber: number;
  onClick?: () => void;
}

export function DraggableItem({ id, label, itemNumber, onClick }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: String(id),
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`card-item text-xs ${isDragging ? 'dragging' : ''}`}
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
      title={`#${itemNumber}`}
    >
      <span className="text-gray-400 mr-1 text-[10px]">{itemNumber}</span>
      {label}
    </div>
  );
}
