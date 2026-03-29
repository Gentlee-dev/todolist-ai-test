import { Router } from "express";
import { validate } from "../middlewares/validate";
import { createCategorySchema, updateCategorySchema } from "../validators/category.validator";
import * as categoryService from "../services/category.service";

export const categoriesRouter = Router();

categoriesRouter.get("/", async (_req, res, next) => {
  try {
    const data = await categoryService.getCategories();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

categoriesRouter.post("/", validate(createCategorySchema), async (req, res, next) => {
  try {
    const data = await categoryService.createCategory(req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

categoriesRouter.patch("/:id", validate(updateCategorySchema), async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const data = await categoryService.updateCategory(id, req.body);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

categoriesRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id as string;
    await categoryService.deleteCategory(id);
    res.json({ data: null });
  } catch (err) {
    next(err);
  }
});
