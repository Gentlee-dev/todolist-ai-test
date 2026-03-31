"use client";

import { TodoItem } from "@/components/molecules/TodoItem";
import type { Todo } from "@todolist/shared";

interface TodoListProps {
  todos: Todo[];
  onEditTags?: (todoId: string) => void;
}

export function TodoList({ todos, onEditTags }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p className="text-lg">할 일이 없습니다</p>
        <p className="text-sm mt-1">새로운 할 일을 추가해보세요</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onEditTags={onEditTags} />
      ))}
    </div>
  );
}
