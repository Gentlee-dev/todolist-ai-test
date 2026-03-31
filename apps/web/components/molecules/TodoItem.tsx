"use client";

import { useState, useRef, useEffect } from "react";
import { Check, X, MoreVertical, GripVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useUpdateTodo, useDeleteTodo } from "@/hooks/useTodos";
import { CATEGORY_COLORS } from "@todolist/shared";
import type { Todo } from "@todolist/shared";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

interface TodoItemProps {
  todo: Todo;
  onEditTags?: (todoId: string) => void;
  dragListeners?: SyntheticListenerMap;
  isDragging?: boolean;
}

export function TodoItem({ todo, onEditTags, dragListeners, isDragging }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const editInputRef = useRef<HTMLInputElement>(null);
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [isEditing]);

  const handleToggle = () => {
    updateTodo.mutate({
      id: todo.id,
      data: { completed: !todo.completed },
    });
  };

  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (!trimmed) {
      setEditText(todo.text);
      setIsEditing(false);
      return;
    }
    if (trimmed !== todo.text) {
      updateTodo.mutate({ id: todo.id, data: { text: trimmed } });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveEdit();
    if (e.key === "Escape") handleCancelEdit();
  };

  const handleDelete = () => {
    deleteTodo.mutate(todo.id);
  };

  const categoryColor = todo.category?.color
    ? CATEGORY_COLORS[todo.category.color as keyof typeof CATEGORY_COLORS]
    : null;

  return (
    <div
      className={`group flex items-center gap-3 rounded-lg border border-warm-border bg-warm-surface p-3 transition-all hover:shadow-md ${
        todo.completed ? "opacity-50" : ""
      } ${isDragging ? "shadow-lg" : "shadow-sm"}`}
    >
      <div
        className="flex items-center text-text-disabled cursor-grab active:cursor-grabbing touch-none"
        {...dragListeners}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <Checkbox
        checked={todo.completed}
        onCheckedChange={handleToggle}
      />

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <Input
              ref={editInputRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleEditKeyDown}
              className="h-7 text-sm"
            />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSaveEdit}>
              <Check className="h-3.5 w-3.5 text-success" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCancelEdit}>
              <X className="h-3.5 w-3.5 text-error" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm cursor-pointer ${
                todo.completed
                  ? "line-through text-text-disabled"
                  : "text-text-default"
              }`}
              onClick={() => !todo.completed && setIsEditing(true)}
            >
              {todo.text}
            </span>

            {todo.category && categoryColor && (
              <Badge
                className="text-xs"
                style={{
                  backgroundColor: categoryColor.bg,
                  color: categoryColor.text,
                }}
              >
                {todo.category.name}
              </Badge>
            )}

            {todo.tags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditing(true)}>
            편집
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEditTags?.(todo.id)}>
            태그 수정
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-error focus:text-error"
            onClick={handleDelete}
          >
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
