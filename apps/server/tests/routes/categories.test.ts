import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/index";

describe("Categories API", () => {
  describe("POST /api/categories", () => {
    it("should return 201 with created category", async () => {
      const res = await request(app)
        .post("/api/categories")
        .send({ name: "업무", color: "#2563EB" });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe("업무");
      expect(res.body.data.color).toBe("#2563EB");
    });

    it("should return 400 when name is missing", async () => {
      const res = await request(app)
        .post("/api/categories")
        .send({ color: "#2563EB" });

      expect(res.status).toBe(400);
    });

    it("should return 400 for invalid color format", async () => {
      const res = await request(app)
        .post("/api/categories")
        .send({ name: "업무", color: "invalid" });

      expect(res.status).toBe(400);
    });

    it("should return 409 for duplicate name", async () => {
      await request(app)
        .post("/api/categories")
        .send({ name: "업무", color: "#2563EB" });

      const res = await request(app)
        .post("/api/categories")
        .send({ name: "업무", color: "#16A34A" });

      expect(res.status).toBe(409);
    });
  });

  describe("GET /api/categories", () => {
    it("should return all categories", async () => {
      await request(app)
        .post("/api/categories")
        .send({ name: "업무", color: "#2563EB" });
      await request(app)
        .post("/api/categories")
        .send({ name: "개인", color: "#16A34A" });

      const res = await request(app).get("/api/categories");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe("PATCH /api/categories/:id", () => {
    it("should update category", async () => {
      const created = await request(app)
        .post("/api/categories")
        .send({ name: "업무", color: "#2563EB" });

      const res = await request(app)
        .patch(`/api/categories/${created.body.data.id}`)
        .send({ name: "회사" });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("회사");
    });

    it("should return 404 for non-existent category", async () => {
      const res = await request(app)
        .patch("/api/categories/00000000-0000-0000-0000-000000000099")
        .send({ name: "X" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/categories/:id", () => {
    it("should delete a category", async () => {
      const created = await request(app)
        .post("/api/categories")
        .send({ name: "업무", color: "#2563EB" });

      const res = await request(app).delete(
        `/api/categories/${created.body.data.id}`,
      );

      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent category", async () => {
      const res = await request(app).delete(
        "/api/categories/00000000-0000-0000-0000-000000000099",
      );

      expect(res.status).toBe(404);
    });
  });
});
