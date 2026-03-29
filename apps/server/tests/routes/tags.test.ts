import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/index";

describe("Tags API", () => {
  describe("POST /api/tags", () => {
    it("should return 201 with created tag", async () => {
      const res = await request(app)
        .post("/api/tags")
        .send({ name: "급한" });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe("급한");
    });

    it("should return 400 when name is missing", async () => {
      const res = await request(app).post("/api/tags").send({});

      expect(res.status).toBe(400);
    });

    it("should return 409 for duplicate name", async () => {
      await request(app).post("/api/tags").send({ name: "급한" });

      const res = await request(app).post("/api/tags").send({ name: "급한" });

      expect(res.status).toBe(409);
    });
  });

  describe("GET /api/tags", () => {
    it("should return all tags", async () => {
      await request(app).post("/api/tags").send({ name: "급한" });
      await request(app).post("/api/tags").send({ name: "중요" });

      const res = await request(app).get("/api/tags");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe("PATCH /api/tags/:id", () => {
    it("should update tag name", async () => {
      const created = await request(app)
        .post("/api/tags")
        .send({ name: "급한" });

      const res = await request(app)
        .patch(`/api/tags/${created.body.data.id}`)
        .send({ name: "긴급" });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("긴급");
    });

    it("should return 404 for non-existent tag", async () => {
      const res = await request(app)
        .patch("/api/tags/00000000-0000-0000-0000-000000000099")
        .send({ name: "X" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/tags/:id", () => {
    it("should delete a tag", async () => {
      const created = await request(app)
        .post("/api/tags")
        .send({ name: "급한" });

      const res = await request(app).delete(
        `/api/tags/${created.body.data.id}`,
      );

      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent tag", async () => {
      const res = await request(app).delete(
        "/api/tags/00000000-0000-0000-0000-000000000099",
      );

      expect(res.status).toBe(404);
    });
  });
});
