"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
import { CATEGORY_COLORS } from "@todolist/shared";

interface CategorySelectProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

export function CategorySelect({ value, onChange }: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: categories = [] } = useCategories();

  const selected = categories.find((c) => c.id === value);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="min-w-[110px] justify-between text-sm"
      >
        {selected ? (
          <span className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: selected.color }}
            />
            {selected.name}
          </span>
        ) : (
          <span className="text-text-muted">카테고리</span>
        )}
        <ChevronDown className="h-3.5 w-3.5 ml-1 text-text-muted" />
      </Button>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-10 w-48 rounded-md border border-warm-border bg-warm-surface p-1 shadow-md">
          <button
            type="button"
            className={`w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-warm-surface-hover ${
              !value ? "text-primary-main font-medium" : "text-text-muted"
            }`}
            onClick={() => { onChange(undefined); setOpen(false); }}
          >
            전체
          </button>
          {categories.map((cat) => {
            const colorInfo = CATEGORY_COLORS[cat.color as keyof typeof CATEGORY_COLORS];
            return (
              <button
                key={cat.id}
                type="button"
                className={`w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-warm-surface-hover flex items-center gap-2 ${
                  value === cat.id ? "text-primary-main font-medium" : ""
                }`}
                onClick={() => { onChange(cat.id); setOpen(false); }}
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
  );
}
