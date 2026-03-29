import { z } from "zod";

export const createTodoSchema = z.object({
  text: z.string().min(1, "Text is required"),
  categoryId: z.string().uuid().nullable().optional(),
});

export const updateTodoSchema = z.object({
  text: z.string().min(1, "Text is required").optional(),
  completed: z.boolean().optional(),
  categoryId: z.string().uuid().nullable().optional(),
});

export const reorderTodosSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1, "orderedIds is required"),
});

export const updateTodoTagsSchema = z.object({
  tagIds: z.array(z.string().uuid()),
});

export const getTodosQuerySchema = z.object({
  status: z.enum(["all", "active", "completed"]).default("all"),
  categoryId: z.string().uuid().optional(),
  tagIds: z.string().optional(),
});
