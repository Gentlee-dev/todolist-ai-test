"use client";

import { useState } from "react";
import {
  DndContext,
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
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TodoItem } from "@/components/molecules/TodoItem";
import { useReorderTodos } from "@/hooks/useTodos";
import type { Todo } from "@todolist/shared";

interface TodoListProps {
  todos: Todo[];
  onEditTags?: (todoId: string) => void;
}

function SortableTodoItem({
  todo,
  onEditTags,
  isDragging,
}: {
  todo: Todo;
  onEditTags?: (todoId: string) => void;
  isDragging: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging
      ? { scale: "1.02", zIndex: 50, position: "relative" as const }
      : {}),
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const reorderTodos = useReorderTodos();

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

  if (todos.length === 0) {
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
      const oldIndex = todos.findIndex((t) => t.id === active.id);
      const newIndex = todos.findIndex((t) => t.id === over.id);
      const reordered = arrayMove(todos, oldIndex, newIndex);
      reorderTodos.mutate(reordered.map((t) => t.id));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={todos.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2">
          {todos.map((todo) => (
            <SortableTodoItem
              key={todo.id}
              todo={todo}
              onEditTags={onEditTags}
              isDragging={activeId === todo.id}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
