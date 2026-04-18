"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  type AnimateLayoutChanges,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TodoItem } from "@/components/molecules/TodoItem";
import { useReorderTodos } from "@/hooks/useTodos";
import type { Todo } from "@todolist/shared";

interface TodoListProps {
  todos: Todo[];
  onEditTags?: (todoId: string) => void;
}

const animateLayoutChanges: AnimateLayoutChanges = () => false;

function SortableTodoItem({
  todo,
  onEditTags,
}: {
  todo: Todo;
  onEditTags?: (todoId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id, animateLayoutChanges });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TodoItem
        todo={todo}
        onEditTags={onEditTags}
        dragListeners={listeners}
        isDragging={isDragging}
      />
    </div>
  );
}

export function TodoList({ todos, onEditTags }: TodoListProps) {
  const [items, setItems] = useState(todos);
  const [activeId, setActiveId] = useState<string | null>(null);
  const reorderTodos = useReorderTodos();

  useEffect(() => {
    setItems(todos);
  }, [todos]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p className="text-lg">할 일이 없습니다</p>
        <p className="text-sm mt-1">새로운 할 일을 추가해보세요</p>
      </div>
    );
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((t) => t.id === active.id);
      const newIndex = items.findIndex((t) => t.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex);
      setItems(reordered);
      reorderTodos.mutate(reordered.map((t) => t.id));
    }
  };

  const activeTodo = activeId ? items.find((t) => t.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2">
          {items.map((todo) => (
            <SortableTodoItem
              key={todo.id}
              todo={todo}
              onEditTags={onEditTags}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeTodo ? (
          <div style={{ transform: "scale(1.02)" }}>
            <TodoItem todo={activeTodo} onEditTags={onEditTags} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
