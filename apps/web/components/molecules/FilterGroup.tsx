"use client";

import type { TodoStatusFilter } from "@todolist/shared";

interface FilterGroupProps {
  value: TodoStatusFilter;
  onChange: (value: TodoStatusFilter) => void;
}

const options: { label: string; value: TodoStatusFilter }[] = [
  { label: "전체", value: "all" },
  { label: "미완료", value: "active" },
  { label: "완료", value: "completed" },
];

export function FilterGroup({ value, onChange }: FilterGroupProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-warm-surface border border-warm-border p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            value === opt.value
              ? "bg-primary-main text-white"
              : "text-text-muted hover:text-text-default hover:bg-warm-surface-hover"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
