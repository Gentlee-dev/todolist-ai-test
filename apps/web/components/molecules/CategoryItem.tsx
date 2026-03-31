"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORY_COLORS } from "@todolist/shared";
import type { Category, CategoryColorKey } from "@todolist/shared";

interface CategoryItemProps {
  category: Category;
  onUpdate: (id: string, data: { name?: string; color?: string }) => void;
  onDelete: (id: string) => void;
}

export function CategoryItem({ category, onUpdate, onDelete }: CategoryItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [editColor, setEditColor] = useState(category.color);

  const handleSave = () => {
    const trimmed = editName.trim();
    if (!trimmed) {
      setEditName(category.name);
      setIsEditing(false);
      return;
    }
    onUpdate(category.id, { name: trimmed, color: editColor });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(category.name);
    setEditColor(category.color);
    setIsEditing(false);
  };

  const colorKeys = Object.keys(CATEGORY_COLORS) as CategoryColorKey[];

  if (isEditing) {
    return (
      <div className="p-3 rounded-md border border-warm-border space-y-2">
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
          className="h-8 text-sm"
        />
        <div className="flex gap-1.5 flex-wrap">
          {colorKeys.map((key) => (
            <button
              key={key}
              type="button"
              className={`w-6 h-6 rounded-full border-2 transition-transform ${
                editColor === key ? "border-text-strong scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: key }}
              onClick={() => setEditColor(key)}
            />
          ))}
        </div>
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <X className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSave}>
            <Check className="h-3.5 w-3.5 text-success" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2 p-2 rounded-md border border-warm-border">
      <span
        className="w-3 h-3 rounded-full shrink-0"
        style={{ backgroundColor: category.color }}
      />
      <span className="text-sm text-text-default flex-1">{category.name}</span>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(true)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-error" onClick={() => onDelete(category.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
