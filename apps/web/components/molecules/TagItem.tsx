"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Tag } from "@todolist/shared";

interface TagItemProps {
  tag: Tag;
  onUpdate: (id: string, data: { name: string }) => void;
  onDelete: (id: string) => void;
}

export function TagItem({ tag, onUpdate, onDelete }: TagItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(tag.name);

  const handleSave = () => {
    const trimmed = editName.trim();
    if (!trimmed) {
      setEditName(tag.name);
      setIsEditing(false);
      return;
    }
    onUpdate(tag.id, { name: trimmed });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(tag.name);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 p-2 rounded-md border border-warm-border">
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
          className="h-7 text-sm flex-1"
          autoFocus
        />
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCancel}>
          <X className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSave}>
          <Check className="h-3.5 w-3.5 text-success" />
        </Button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2 p-2 rounded-md border border-warm-border">
      <span className="text-sm text-text-default flex-1">{tag.name}</span>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(true)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-error" onClick={() => onDelete(tag.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
