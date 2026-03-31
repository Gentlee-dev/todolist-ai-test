"use client";

import { Badge } from "@/components/ui/badge";
import { useTags } from "@/hooks/useTags";

interface TagSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function TagSelector({ selectedIds, onChange }: TagSelectorProps) {
  const { data: tags = [] } = useTags();

  const toggle = (tagId: string) => {
    onChange(
      selectedIds.includes(tagId)
        ? selectedIds.filter((id) => id !== tagId)
        : [...selectedIds, tagId],
    );
  };

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => {
        const isSelected = selectedIds.includes(tag.id);
        return (
          <Badge
            key={tag.id}
            variant={isSelected ? "default" : "outline"}
            className={`cursor-pointer transition-colors ${
              isSelected
                ? "bg-primary-main text-white hover:bg-primary-hover"
                : "hover:bg-warm-surface-hover"
            }`}
            onClick={() => toggle(tag.id)}
          >
            {tag.name}
          </Badge>
        );
      })}
    </div>
  );
}
