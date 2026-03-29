import type { Category } from "./category";
import type { Tag } from "./tag";

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  sortOrder: number;
  categoryId: string | null;
  category: Pick<Category, "id" | "name" | "color"> | null;
  tags: Pick<Tag, "id" | "name">[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoRequest {
  text: string;
  categoryId?: string | null;
}

export interface UpdateTodoRequest {
  text?: string;
  completed?: boolean;
  categoryId?: string | null;
}

export interface ReorderTodosRequest {
  orderedIds: string[];
}

export interface UpdateTodoTagsRequest {
  tagIds: string[];
}
