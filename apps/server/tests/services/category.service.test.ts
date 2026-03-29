import { describe, it, expect } from "vitest";
import * as categoryService from "../../src/services/category.service";

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

describe("CategoryService", () => {
  describe("createCategory", () => {
    it("should create a category", async () => {
      const category = await categoryService.createCategory({
        name: "업무",
        color: "#2563EB",
      });

      expect(category.name).toBe("업무");
      expect(category.color).toBe("#2563EB");
      expect(category.userId).toBe(DEFAULT_USER_ID);
    });

    it("should throw on duplicate name", async () => {
      await categoryService.createCategory({ name: "업무", color: "#2563EB" });

      await expect(
        categoryService.createCategory({ name: "업무", color: "#16A34A" }),
      ).rejects.toThrow("Category with this name already exists");
    });

    it("should throw when max categories reached", async () => {
      for (let i = 0; i < 10; i++) {
        await categoryService.createCategory({
          name: `Cat ${i}`,
          color: "#2563EB",
        });
      }

      await expect(
        categoryService.createCategory({ name: "Cat 10", color: "#2563EB" }),
      ).rejects.toThrow("Maximum 10 categories allowed");
    });
  });

  describe("getCategories", () => {
    it("should return all categories", async () => {
      await categoryService.createCategory({ name: "업무", color: "#2563EB" });
      await categoryService.createCategory({ name: "개인", color: "#16A34A" });

      const categories = await categoryService.getCategories();
      expect(categories).toHaveLength(2);
    });

    it("should return empty array when no categories", async () => {
      const categories = await categoryService.getCategories();
      expect(categories).toEqual([]);
    });
  });

  describe("updateCategory", () => {
    it("should update name", async () => {
      const category = await categoryService.createCategory({
        name: "업무",
        color: "#2563EB",
      });
      const updated = await categoryService.updateCategory(category.id, {
        name: "회사",
      });

      expect(updated.name).toBe("회사");
      expect(updated.color).toBe("#2563EB");
    });

    it("should update color", async () => {
      const category = await categoryService.createCategory({
        name: "업무",
        color: "#2563EB",
      });
      const updated = await categoryService.updateCategory(category.id, {
        color: "#DC2626",
      });

      expect(updated.color).toBe("#DC2626");
    });

    it("should throw on duplicate name", async () => {
      const cat1 = await categoryService.createCategory({
        name: "업무",
        color: "#2563EB",
      });
      await categoryService.createCategory({ name: "개인", color: "#16A34A" });

      await expect(
        categoryService.updateCategory(cat1.id, { name: "개인" }),
      ).rejects.toThrow("Category with this name already exists");
    });

    it("should throw when category not found", async () => {
      await expect(
        categoryService.updateCategory(
          "00000000-0000-0000-0000-000000000099",
          { name: "X" },
        ),
      ).rejects.toThrow("Category not found");
    });
  });

  describe("deleteCategory", () => {
    it("should delete a category", async () => {
      const category = await categoryService.createCategory({
        name: "업무",
        color: "#2563EB",
      });
      await categoryService.deleteCategory(category.id);

      const categories = await categoryService.getCategories();
      expect(categories).toHaveLength(0);
    });

    it("should throw when category not found", async () => {
      await expect(
        categoryService.deleteCategory(
          "00000000-0000-0000-0000-000000000099",
        ),
      ).rejects.toThrow("Category not found");
    });
  });
});
