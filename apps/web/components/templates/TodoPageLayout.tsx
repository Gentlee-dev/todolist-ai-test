"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TodoInput } from "@/components/molecules/TodoInput";
import { TodoList } from "@/components/organisms/TodoList";
import { FilterBar } from "@/components/organisms/FilterBar";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { useTodos, useDeleteCompletedTodos } from "@/hooks/useTodos";
import type { TodoStatusFilter } from "@todolist/shared";

interface TodoPageLayoutProps {
  onOpenSettings?: () => void;
  onEditTags?: (todoId: string) => void;
}

export function TodoPageLayout({ onOpenSettings, onEditTags }: TodoPageLayoutProps) {
  const [statusFilter, setStatusFilter] = useState<TodoStatusFilter>("all");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: todos = [], isLoading } = useTodos({
    status: statusFilter,
    categoryId,
    tagIds,
  });
  const deleteCompleted = useDeleteCompletedTodos();

  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-warm-bg">
      {/* Header */}
      <header
        className="bg-warm-surface border-b border-warm-border shadow-sm"
        style={{ height: "var(--header-height)" }}
      >
        <div
          className="mx-auto h-full flex items-center justify-between px-4"
          style={{ maxWidth: "var(--max-width-content)" }}
        >
          <h1 className="text-xl font-bold text-text-strong">Todo</h1>
          <Button variant="ghost" size="icon" onClick={onOpenSettings}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main
        className="mx-auto px-4 py-6 flex flex-col gap-5"
        style={{ maxWidth: "var(--max-width-content)" }}
      >
        {/* TodoInput */}
        <TodoInput />

        {/* FilterBar */}
        <FilterBar
          status={statusFilter}
          onStatusChange={setStatusFilter}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          tagIds={tagIds}
          onTagIdsChange={setTagIds}
        />

        {/* TodoList */}
        {isLoading ? (
          <div className="text-center py-12 text-text-muted">
            로딩 중...
          </div>
        ) : (
          <TodoList todos={todos} onEditTags={onEditTags} />
        )}

        <Separator />

        {/* Footer */}
        <footer className="flex items-center justify-between text-sm text-text-muted">
          <span>
            {totalCount}개 중 {completedCount}개 완료
          </span>
          {completedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-error hover:text-error"
              onClick={() => setShowDeleteConfirm(true)}
            >
              완료 항목 삭제
            </Button>
          )}
        </footer>
      </main>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="완료 항목 삭제"
        description="완료된 모든 할 일을 삭제합니다. 이 작업은 되돌릴 수 없습니다."
        confirmLabel="삭제"
        onConfirm={() => deleteCompleted.mutate()}
      />
    </div>
  );
}
