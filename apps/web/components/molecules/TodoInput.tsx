"use client";

import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateTodo } from "@/hooks/useTodos";
import { useCategories } from "@/hooks/useCategories";
import type { Category } from "@todolist/shared";
import { CATEGORY_COLORS } from "@todolist/shared";

export function TodoInput() {
  const [text, setText] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const createTodo = useCreateTodo();
  const { data: categories } = useCategories();

  const handleSubmit = () => {
    if (!text.trim()) return;

    createTodo.mutate(
      { text: text.trim(), categoryId: selectedCategoryId },
      {
        onSuccess: () => {
          setText("");
          inputRef.current?.focus();
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const selectedCategory = categories?.find((c) => c.id === selectedCategoryId);

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1 flex gap-2">
        <Input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="할 일을 입력하세요"
          aria-label="할 일 입력"
          className="flex-1"
        />
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            aria-label="카테고리 선택"
            className="min-w-[100px] justify-start text-sm"
          >
            {selectedCategory ? (
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: selectedCategory.color }}
                />
                {selectedCategory.name}
              </span>
            ) : (
              <span className="text-text-muted">카테고리</span>
            )}
          </Button>
          {showCategoryDropdown && (
            <div className="absolute top-full mt-1 right-0 z-10 w-48 rounded-md border border-warm-border bg-warm-surface p-1 shadow-md">
              <button
                type="button"
                className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-warm-surface-hover text-text-muted"
                onClick={() => {
                  setSelectedCategoryId(null);
                  setShowCategoryDropdown(false);
                }}
              >
                없음
              </button>
              {categories?.map((cat: Category) => {
                const colorInfo = CATEGORY_COLORS[cat.color as keyof typeof CATEGORY_COLORS];
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-warm-surface-hover flex items-center gap-2"
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: colorInfo?.text ?? cat.color }}
                    />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Button onClick={handleSubmit} disabled={createTodo.isPending} size="default">
        <Plus className="h-4 w-4" />
        추가
      </Button>
    </div>
  );
}
