"use client";

import { FilterGroup } from "@/components/molecules/FilterGroup";
import { CategorySelect } from "@/components/molecules/CategorySelect";
import { TagSelector } from "@/components/molecules/TagSelector";
import type { TodoStatusFilter } from "@todolist/shared";

interface FilterBarProps {
  status: TodoStatusFilter;
  onStatusChange: (status: TodoStatusFilter) => void;
  categoryId: string | undefined;
  onCategoryChange: (id: string | undefined) => void;
  tagIds: string[];
  onTagIdsChange: (ids: string[]) => void;
}

export function FilterBar({
  status,
  onStatusChange,
  categoryId,
  onCategoryChange,
  tagIds,
  onTagIdsChange,
}: FilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <FilterGroup value={status} onChange={onStatusChange} />
        </div>
        <CategorySelect value={categoryId} onChange={onCategoryChange} />
      </div>
      <TagSelector selectedIds={tagIds} onChange={onTagIdsChange} />
    </div>
  );
}
