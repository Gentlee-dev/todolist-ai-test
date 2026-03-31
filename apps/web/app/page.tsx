"use client";

import { useState } from "react";
import { TodoPageLayout } from "@/components/templates/TodoPageLayout";
import { CategoryManager } from "@/components/organisms/CategoryManager";
import { TagManager } from "@/components/organisms/TagManager";
import { TagEditModal } from "@/components/organisms/TagEditModal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useTodos } from "@/hooks/useTodos";
import type { Todo } from "@todolist/shared";

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"categories" | "tags">("categories");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [tagModalOpen, setTagModalOpen] = useState(false);

  const { data: todos = [] } = useTodos();

  const handleEditTags = (todoId: string) => {
    const todo = todos.find((t) => t.id === todoId);
    if (todo) {
      setEditingTodo(todo);
      setTagModalOpen(true);
    }
  };

  return (
    <>
      <TodoPageLayout
        onOpenSettings={() => setSettingsOpen(true)}
        onEditTags={handleEditTags}
      />

      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>설정</SheetTitle>
            <SheetDescription>카테고리와 태그를 관리합니다.</SheetDescription>
          </SheetHeader>

          <div className="mt-4">
            <div className="flex gap-1 rounded-lg bg-warm-bg p-1 mb-4">
              <button
                type="button"
                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "categories"
                    ? "bg-warm-surface text-text-strong shadow-sm"
                    : "text-text-muted hover:text-text-default"
                }`}
                onClick={() => setActiveTab("categories")}
              >
                카테고리
              </button>
              <button
                type="button"
                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "tags"
                    ? "bg-warm-surface text-text-strong shadow-sm"
                    : "text-text-muted hover:text-text-default"
                }`}
                onClick={() => setActiveTab("tags")}
              >
                태그
              </button>
            </div>

            {activeTab === "categories" ? <CategoryManager /> : <TagManager />}
          </div>
        </SheetContent>
      </Sheet>

      <TagEditModal
        open={tagModalOpen}
        onOpenChange={setTagModalOpen}
        todo={editingTodo}
      />
    </>
  );
}
