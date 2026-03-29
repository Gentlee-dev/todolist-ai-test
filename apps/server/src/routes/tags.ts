import { Router } from "express";
import { validate } from "../middlewares/validate";
import { createTagSchema, updateTagSchema } from "../validators/tag.validator";
import * as tagService from "../services/tag.service";

export const tagsRouter = Router();

tagsRouter.get("/", async (_req, res, next) => {
  try {
    const data = await tagService.getTags();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

tagsRouter.post("/", validate(createTagSchema), async (req, res, next) => {
  try {
    const data = await tagService.createTag(req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

tagsRouter.patch("/:id", validate(updateTagSchema), async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const data = await tagService.updateTag(id, req.body);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

tagsRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id as string;
    await tagService.deleteTag(id);
    res.json({ data: null });
  } catch (err) {
    next(err);
  }
});
