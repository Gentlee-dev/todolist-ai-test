import { describe, it, expect } from "vitest";
import * as tagService from "../../src/services/tag.service";

describe("TagService", () => {
  describe("createTag", () => {
    it("should create a tag", async () => {
      const tag = await tagService.createTag({ name: "급한" });

      expect(tag.name).toBe("급한");
      expect(tag.id).toBeDefined();
    });

    it("should throw on duplicate name", async () => {
      await tagService.createTag({ name: "급한" });

      await expect(tagService.createTag({ name: "급한" })).rejects.toThrow(
        "Tag with this name already exists",
      );
    });
  });

  describe("getTags", () => {
    it("should return all tags", async () => {
      await tagService.createTag({ name: "급한" });
      await tagService.createTag({ name: "중요" });

      const tags = await tagService.getTags();
      expect(tags).toHaveLength(2);
    });

    it("should return empty array when no tags", async () => {
      const tags = await tagService.getTags();
      expect(tags).toEqual([]);
    });
  });

  describe("updateTag", () => {
    it("should update tag name", async () => {
      const tag = await tagService.createTag({ name: "급한" });
      const updated = await tagService.updateTag(tag.id, { name: "긴급" });

      expect(updated.name).toBe("긴급");
    });

    it("should throw on duplicate name", async () => {
      const tag = await tagService.createTag({ name: "급한" });
      await tagService.createTag({ name: "중요" });

      await expect(
        tagService.updateTag(tag.id, { name: "중요" }),
      ).rejects.toThrow("Tag with this name already exists");
    });

    it("should throw when tag not found", async () => {
      await expect(
        tagService.updateTag("00000000-0000-0000-0000-000000000099", {
          name: "X",
        }),
      ).rejects.toThrow("Tag not found");
    });
  });

  describe("deleteTag", () => {
    it("should delete a tag", async () => {
      const tag = await tagService.createTag({ name: "급한" });
      await tagService.deleteTag(tag.id);

      const tags = await tagService.getTags();
      expect(tags).toHaveLength(0);
    });

    it("should throw when tag not found", async () => {
      await expect(
        tagService.deleteTag("00000000-0000-0000-0000-000000000099"),
      ).rejects.toThrow("Tag not found");
    });
  });
});
