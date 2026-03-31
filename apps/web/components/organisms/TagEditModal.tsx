"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useTags, useCreateTag } from "@/hooks/useTags";
import { useUpdateTodoTags } from "@/hooks/useTodos";
import type { Todo } from "@todolist/shared";

interface TagEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todo: Todo | null;
}

export function TagEditModal({ open, onOpenChange, todo }: TagEditModalProps) {
  const { data: allTags = [] } = useTags();
  const createTag = useCreateTag();
  const updateTodoTags = useUpdateTodoTags();

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState("");

  useEffect(() => {
    if (todo) {
      setSelectedTagIds(todo.tags.map((t) => t.id));
    }
  }, [todo]);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  const handleAddNewTag = () => {
    const trimmed = newTagName.trim();
    if (!trimmed) return;
    createTag.mutate(
      { name: trimmed },
      {
        onSuccess: (tag) => {
          setSelectedTagIds((prev) => [...prev, tag.id]);
          setNewTagName("");
        },
      },
    );
  };

  const handleSave = () => {
    if (!todo) return;
    updateTodoTags.mutate(
      { todoId: todo.id, tagIds: selectedTagIds },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>태그 수정</DialogTitle>
          <DialogDescription>
            {todo ? `"${todo.text}"의 태그를 수정합니다.` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected tags */}
          <div>
            <p className="text-sm font-medium text-text-strong mb-2">선택된 태그</p>
            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
              {selectedTagIds.length === 0 ? (
                <span className="text-sm text-text-muted">태그가 없습니다</span>
              ) : (
                selectedTagIds.map((tagId) => {
                  const tag = allTags.find((t) => t.id === tagId);
                  return tag ? (
                    <Badge key={tagId} variant="outline" className="gap-1 pr-1">
                      {tag.name}
                      <button
                        type="button"
                        className="hover:text-error transition-colors"
                        onClick={() => toggleTag(tagId)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ) : null;
                })
              )}
            </div>
          </div>

          {/* Available tags */}
          <div>
            <p className="text-sm font-medium text-text-strong mb-2">전체 태그</p>
            <div className="flex flex-wrap gap-1.5">
              {allTags
                .filter((t) => !selectedTagIds.includes(t.id))
                .map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary-light"
                    onClick={() => toggleTag(tag.id)}
                  >
                    + {tag.name}
                  </Badge>
                ))}
            </div>
          </div>

          {/* New tag input */}
          <div className="flex gap-2">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddNewTag()}
              placeholder="새 태그 이름"
              className="h-8 text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddNewTag}
              disabled={createTag.isPending}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={updateTodoTags.isPending}>
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
