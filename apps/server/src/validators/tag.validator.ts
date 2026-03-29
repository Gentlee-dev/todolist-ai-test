import { z } from "zod";

export const createTagSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const updateTagSchema = z.object({
  name: z.string().min(1, "Name is required"),
});
