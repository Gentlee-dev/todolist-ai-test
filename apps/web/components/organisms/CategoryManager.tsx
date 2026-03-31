"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryItem } from "@/components/molecules/CategoryItem";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/useCategories";
import { CATEGORY_COLORS, MAX_CATEGORIES } from "@todolist/shared";
import type { CategoryColorKey } from "@todolist/shared";

export function CategoryManager() {
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<CategoryColorKey>("#2563EB");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const colorKeys = Object.keys(CATEGORY_COLORS) as CategoryColorKey[];

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    createCategory.mutate(
      { name: trimmed, color: newColor },
      { onSuccess: () => setNewName("") },
    );
  };

  return (
    <div className="space-y-3">
      {/* Add form */}
      {categories.length < MAX_CATEGORIES && (
        <div className="space-y-2 p-3 rounded-md border border-warm-border bg-warm-bg">
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="카테고리 이름"
              className="h-8 text-sm flex-1"
            />
            <Button size="sm" onClick={handleCreate} disabled={createCategory.isPending}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {colorKeys.map((key) => (
              <button
                key={key}
                type="button"
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  newColor === key ? "border-text-strong scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: key }}
                onClick={() => setNewColor(key)}
              />
            ))}
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-1.5">
        {categories.map((cat) => (
          <CategoryItem
            key={cat.id}
            category={cat}
            onUpdate={(id, data) => updateCategory.mutate({ id, data })}
            onDelete={(id) => setDeleteId(id)}
          />
        ))}
      </div>

      {categories.length >= MAX_CATEGORIES && (
        <p className="text-xs text-text-muted text-center">
          최대 {MAX_CATEGORIES}개까지 생성할 수 있습니다
        </p>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="카테고리 삭제"
        description="이 카테고리를 삭제하면 관련된 할 일은 미분류로 전환됩니다."
        confirmLabel="삭제"
        onConfirm={() => deleteId && deleteCategory.mutate(deleteId)}
      />
    </div>
  );
}
