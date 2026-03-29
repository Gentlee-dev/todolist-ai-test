import { Router } from "express";
import { validate, parseQuery } from "../middlewares/validate";
import {
  createTodoSchema,
  updateTodoSchema,
  reorderTodosSchema,
  updateTodoTagsSchema,
  getTodosQuerySchema,
} from "../validators/todo.validator";
import * as todoService from "../services/todo.service";

export const todosRouter = Router();

todosRouter.get("/", async (req, res, next) => {
  try {
    const { status, categoryId, tagIds } = parseQuery(getTodosQuerySchema, req.query);
    const tagIdArray = tagIds ? tagIds.split(",") : undefined;
    const data = await todoService.getTodos(status, categoryId, tagIdArray);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

todosRouter.post("/", validate(createTodoSchema), async (req, res, next) => {
  try {
    const data = await todoService.createTodo(req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

todosRouter.delete("/completed", async (_req, res, next) => {
  try {
    await todoService.deleteCompletedTodos();
    res.json({ data: null });
  } catch (err) {
    next(err);
  }
});

todosRouter.patch("/reorder", validate(reorderTodosSchema), async (req, res, next) => {
  try {
    await todoService.reorderTodos(req.body.orderedIds);
    res.json({ data: null });
  } catch (err) {
    next(err);
  }
});

todosRouter.patch("/:id", validate(updateTodoSchema), async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const data = await todoService.updateTodo(id, req.body);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

todosRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id as string;
    await todoService.deleteTodo(id);
    res.json({ data: null });
  } catch (err) {
    next(err);
  }
});

todosRouter.put("/:id/tags", validate(updateTodoTagsSchema), async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const data = await todoService.updateTodoTags(id, req.body.tagIds);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});
