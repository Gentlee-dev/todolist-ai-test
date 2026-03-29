import { describe, it, expect, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import * as todoService from "../../src/services/todo.service";

const prisma = new PrismaClient();
const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

describe("TodoService", () => {
  let categoryId: string;

  beforeEach(async () => {
    const category = await prisma.category.create({
      data: { name: "업무", color: "#2563EB", userId: DEFAULT_USER_ID },
    });
    categoryId = category.id;
  });

  describe("createTodo", () => {
    it("should create a todo with text only", async () => {
      const todo = await todoService.createTodo({ text: "Test todo" });

      expect(todo.text).toBe("Test todo");
      expect(todo.completed).toBe(false);
      expect(todo.sortOrder).toBe(0);
      expect(todo.categoryId).toBeNull();
      expect(todo.tags).toEqual([]);
    });

    it("should create a todo with category", async () => {
      const todo = await todoService.createTodo({
        text: "Test todo",
        categoryId,
      });

      expect(todo.categoryId).toBe(categoryId);
      expect(todo.category).toBeDefined();
      expect(todo.category?.name).toBe("업무");
    });

    it("should set sortOrder to max + 1", async () => {
      await todoService.createTodo({ text: "First" });
      const second = await todoService.createTodo({ text: "Second" });

      expect(second.sortOrder).toBe(1);
    });

    it("should throw error when text is empty", async () => {
      await expect(todoService.createTodo({ text: "" })).rejects.toThrow(
        "Text is required",
      );
    });

    it("should throw error when text is only whitespace", async () => {
      await expect(todoService.createTodo({ text: "   " })).rejects.toThrow(
        "Text is required",
      );
    });

    it("should throw error when categoryId does not exist", async () => {
      await expect(
        todoService.createTodo({
          text: "Test",
          categoryId: "00000000-0000-0000-0000-000000000099",
        }),
      ).rejects.toThrow("Category not found");
    });

    it("should trim text", async () => {
      const todo = await todoService.createTodo({ text: "  hello  " });
      expect(todo.text).toBe("hello");
    });
  });

  describe("getTodos", () => {
    beforeEach(async () => {
      await todoService.createTodo({ text: "Active 1" });
      const completed = await todoService.createTodo({ text: "Completed 1" });
      await todoService.updateTodo(completed.id, { completed: true });
      await todoService.createTodo({ text: "Active 2", categoryId });
    });

    it("should return all todos", async () => {
      const todos = await todoService.getTodos("all");
      expect(todos).toHaveLength(3);
    });

    it("should filter active todos", async () => {
      const todos = await todoService.getTodos("active");
      expect(todos).toHaveLength(2);
      expect(todos.every((t) => !t.completed)).toBe(true);
    });

    it("should filter completed todos", async () => {
      const todos = await todoService.getTodos("completed");
      expect(todos).toHaveLength(1);
      expect(todos[0].completed).toBe(true);
    });

    it("should filter by categoryId", async () => {
      const todos = await todoService.getTodos("all", categoryId);
      expect(todos).toHaveLength(1);
      expect(todos[0].text).toBe("Active 2");
    });

    it("should return todos ordered by sortOrder", async () => {
      const todos = await todoService.getTodos("all");
      for (let i = 1; i < todos.length; i++) {
        expect(todos[i].sortOrder).toBeGreaterThan(todos[i - 1].sortOrder);
      }
    });
  });

  describe("updateTodo", () => {
    it("should update text", async () => {
      const todo = await todoService.createTodo({ text: "Original" });
      const updated = await todoService.updateTodo(todo.id, {
        text: "Updated",
      });

      expect(updated.text).toBe("Updated");
    });

    it("should toggle completed", async () => {
      const todo = await todoService.createTodo({ text: "Test" });
      const updated = await todoService.updateTodo(todo.id, {
        completed: true,
      });

      expect(updated.completed).toBe(true);
    });

    it("should update categoryId", async () => {
      const todo = await todoService.createTodo({ text: "Test" });
      const updated = await todoService.updateTodo(todo.id, { categoryId });

      expect(updated.categoryId).toBe(categoryId);
    });

    it("should set categoryId to null", async () => {
      const todo = await todoService.createTodo({ text: "Test", categoryId });
      const updated = await todoService.updateTodo(todo.id, {
        categoryId: null,
      });

      expect(updated.categoryId).toBeNull();
    });

    it("should throw when todo not found", async () => {
      await expect(
        todoService.updateTodo("00000000-0000-0000-0000-000000000099", {
          text: "X",
        }),
      ).rejects.toThrow("Todo not found");
    });

    it("should throw when categoryId does not exist", async () => {
      const todo = await todoService.createTodo({ text: "Test" });
      await expect(
        todoService.updateTodo(todo.id, {
          categoryId: "00000000-0000-0000-0000-000000000099",
        }),
      ).rejects.toThrow("Category not found");
    });
  });

  describe("deleteTodo", () => {
    it("should delete a todo", async () => {
      const todo = await todoService.createTodo({ text: "Delete me" });
      await todoService.deleteTodo(todo.id);

      const todos = await todoService.getTodos("all");
      expect(todos).toHaveLength(0);
    });

    it("should throw when todo not found", async () => {
      await expect(
        todoService.deleteTodo("00000000-0000-0000-0000-000000000099"),
      ).rejects.toThrow("Todo not found");
    });
  });

  describe("deleteCompletedTodos", () => {
    it("should delete only completed todos", async () => {
      await todoService.createTodo({ text: "Active" });
      const completed = await todoService.createTodo({ text: "Completed" });
      await todoService.updateTodo(completed.id, { completed: true });

      await todoService.deleteCompletedTodos();

      const todos = await todoService.getTodos("all");
      expect(todos).toHaveLength(1);
      expect(todos[0].text).toBe("Active");
    });

    it("should do nothing when no completed todos", async () => {
      await todoService.createTodo({ text: "Active" });
      await todoService.deleteCompletedTodos();

      const todos = await todoService.getTodos("all");
      expect(todos).toHaveLength(1);
    });
  });

  describe("reorderTodos", () => {
    it("should update sortOrder per provided order", async () => {
      const t1 = await todoService.createTodo({ text: "First" });
      const t2 = await todoService.createTodo({ text: "Second" });
      const t3 = await todoService.createTodo({ text: "Third" });

      await todoService.reorderTodos([t3.id, t1.id, t2.id]);

      const todos = await todoService.getTodos("all");
      expect(todos[0].text).toBe("Third");
      expect(todos[1].text).toBe("First");
      expect(todos[2].text).toBe("Second");
    });

    it("should do nothing for empty array", async () => {
      await todoService.createTodo({ text: "First" });
      await todoService.reorderTodos([]);

      const todos = await todoService.getTodos("all");
      expect(todos).toHaveLength(1);
    });
  });

  describe("updateTodoTags", () => {
    it("should replace tags on a todo", async () => {
      const todo = await todoService.createTodo({ text: "Test" });
      const tag1 = await prisma.tag.create({ data: { name: "급한" } });
      const tag2 = await prisma.tag.create({ data: { name: "중요" } });

      const updated = await todoService.updateTodoTags(todo.id, [
        tag1.id,
        tag2.id,
      ]);

      expect(updated.tags).toHaveLength(2);
      expect(updated.tags.map((t) => t.name).sort()).toEqual(["급한", "중요"]);
    });

    it("should clear all tags when empty array", async () => {
      const todo = await todoService.createTodo({ text: "Test" });
      const tag = await prisma.tag.create({ data: { name: "급한" } });
      await todoService.updateTodoTags(todo.id, [tag.id]);

      const updated = await todoService.updateTodoTags(todo.id, []);
      expect(updated.tags).toHaveLength(0);
    });

    it("should throw when todo not found", async () => {
      await expect(
        todoService.updateTodoTags(
          "00000000-0000-0000-0000-000000000099",
          [],
        ),
      ).rejects.toThrow("Todo not found");
    });
  });
});
