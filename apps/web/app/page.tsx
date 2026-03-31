"use client";

import { useState } from "react";
import { TodoPageLayout } from "@/components/templates/TodoPageLayout";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useCategories } from "@/hooks/useCategories";
import { useTags } from "@/hooks/useTags";

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"categories" | "tags">("categories");
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();

  return (
    <>
      <TodoPageLayout onOpenSettings={() => setSettingsOpen(true)} />

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
                카테고리 ({categories.length})
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
                태그 ({tags.length})
              </button>
            </div>

            {activeTab === "categories" ? (
              <div className="space-y-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-text-muted text-center py-4">
                    카테고리가 없습니다
                  </p>
                ) : (
                  categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center gap-2 p-2 rounded-md border border-warm-border"
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-sm text-text-default flex-1">
                        {cat.name}
                      </span>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {tags.length === 0 ? (
                  <p className="text-sm text-text-muted text-center py-4">
                    태그가 없습니다
                  </p>
                ) : (
                  tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center gap-2 p-2 rounded-md border border-warm-border"
                    >
                      <span className="text-sm text-text-default flex-1">
                        {tag.name}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
