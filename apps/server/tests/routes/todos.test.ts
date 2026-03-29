import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { app } from "../../src/index";

const prisma = new PrismaClient();
const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

describe("Todos API", () => {
  let categoryId: string;

  beforeEach(async () => {
    const category = await prisma.category.create({
      data: { name: "업무", color: "#2563EB", userId: DEFAULT_USER_ID },
    });
    categoryId = category.id;
  });

  describe("POST /api/todos", () => {
    it("should return 201 with created todo", async () => {
      const res = await request(app)
        .post("/api/todos")
        .send({ text: "New todo" });

      expect(res.status).toBe(201);
      expect(res.body.data.text).toBe("New todo");
      expect(res.body.data.completed).toBe(false);
      expect(res.body.data.tags).toEqual([]);
    });

    it("should return 201 with category", async () => {
      const res = await request(app)
        .post("/api/todos")
        .send({ text: "With category", categoryId });

      expect(res.status).toBe(201);
      expect(res.body.data.category.name).toBe("업무");
    });

    it("should return 400 when text is missing", async () => {
      const res = await request(app).post("/api/todos").send({});

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("GET /api/todos", () => {
    beforeEach(async () => {
      await request(app).post("/api/todos").send({ text: "Todo 1" });
      await request(app).post("/api/todos").send({ text: "Todo 2" });
    });

    it("should return all todos", async () => {
      const res = await request(app).get("/api/todos");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });

    it("should filter by status=active", async () => {
      // Complete one todo
      const all = await request(app).get("/api/todos");
      await request(app)
        .patch(`/api/todos/${all.body.data[0].id}`)
        .send({ completed: true });

      const res = await request(app).get("/api/todos?status=active");

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].completed).toBe(false);
    });

    it("should filter by status=completed", async () => {
      const all = await request(app).get("/api/todos");
      await request(app)
        .patch(`/api/todos/${all.body.data[0].id}`)
        .send({ completed: true });

      const res = await request(app).get("/api/todos?status=completed");

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].completed).toBe(true);
    });
  });

  describe("PATCH /api/todos/:id", () => {
    it("should update todo text", async () => {
      const created = await request(app)
        .post("/api/todos")
        .send({ text: "Original" });

      const res = await request(app)
        .patch(`/api/todos/${created.body.data.id}`)
        .send({ text: "Updated" });

      expect(res.status).toBe(200);
      expect(res.body.data.text).toBe("Updated");
    });

    it("should return 404 for non-existent todo", async () => {
      const res = await request(app)
        .patch("/api/todos/00000000-0000-0000-0000-000000000099")
        .send({ text: "Updated" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/todos/:id", () => {
    it("should delete a todo", async () => {
      const created = await request(app)
        .post("/api/todos")
        .send({ text: "Delete me" });

      const res = await request(app).delete(
        `/api/todos/${created.body.data.id}`,
      );

      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent todo", async () => {
      const res = await request(app).delete(
        "/api/todos/00000000-0000-0000-0000-000000000099",
      );

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/todos/completed", () => {
    it("should delete completed todos", async () => {
      await request(app).post("/api/todos").send({ text: "Active" });
      const completed = await request(app)
        .post("/api/todos")
        .send({ text: "Completed" });
      await request(app)
        .patch(`/api/todos/${completed.body.data.id}`)
        .send({ completed: true });

      const res = await request(app).delete("/api/todos/completed");
      expect(res.status).toBe(200);

      const remaining = await request(app).get("/api/todos");
      expect(remaining.body.data).toHaveLength(1);
      expect(remaining.body.data[0].text).toBe("Active");
    });
  });

  describe("PATCH /api/todos/reorder", () => {
    it("should reorder todos", async () => {
      const t1 = await request(app)
        .post("/api/todos")
        .send({ text: "First" });
      const t2 = await request(app)
        .post("/api/todos")
        .send({ text: "Second" });

      const res = await request(app)
        .patch("/api/todos/reorder")
        .send({ orderedIds: [t2.body.data.id, t1.body.data.id] });

      expect(res.status).toBe(200);

      const todos = await request(app).get("/api/todos");
      expect(todos.body.data[0].text).toBe("Second");
      expect(todos.body.data[1].text).toBe("First");
    });
  });

  describe("PUT /api/todos/:id/tags", () => {
    it("should set tags on a todo", async () => {
      const todo = await request(app)
        .post("/api/todos")
        .send({ text: "Test" });
      const tag = await prisma.tag.create({ data: { name: "급한" } });

      const res = await request(app)
        .put(`/api/todos/${todo.body.data.id}/tags`)
        .send({ tagIds: [tag.id] });

      expect(res.status).toBe(200);
      expect(res.body.data.tags).toHaveLength(1);
      expect(res.body.data.tags[0].name).toBe("급한");
    });
  });
});
