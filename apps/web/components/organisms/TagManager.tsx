"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TagItem } from "@/components/molecules/TagItem";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import {
  useTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
} from "@/hooks/useTags";

export function TagManager() {
  const { data: tags = [] } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const [newName, setNewName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    createTag.mutate(
      { name: trimmed },
      { onSuccess: () => setNewName("") },
    );
  };

  return (
    <div className="space-y-3">
      {/* Add form */}
      <div className="flex gap-2 p-3 rounded-md border border-warm-border bg-warm-bg">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="태그 이름"
          className="h-8 text-sm flex-1"
        />
        <Button size="sm" onClick={handleCreate} disabled={createTag.isPending}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* List */}
      <div className="space-y-1.5">
        {tags.map((tag) => (
          <TagItem
            key={tag.id}
            tag={tag}
            onUpdate={(id, data) => updateTag.mutate({ id, data })}
            onDelete={(id) => setDeleteId(id)}
          />
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="태그 삭제"
        description="이 태그를 삭제하면 관련된 할 일에서 자동으로 제거됩니다."
        confirmLabel="삭제"
        onConfirm={() => deleteId && deleteTag.mutate(deleteId)}
      />
    </div>
  );
}
