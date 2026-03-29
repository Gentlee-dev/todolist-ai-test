import { prisma } from "../prisma";
import { AppError } from "../middlewares/error-handler";
import type { CreateTagRequest, UpdateTagRequest } from "@todolist/shared";

export async function getTags() {
  return prisma.tag.findMany({
    orderBy: { createdAt: "asc" },
  });
}

export async function createTag(data: CreateTagRequest) {
  const existing = await prisma.tag.findUnique({
    where: { name: data.name },
  });

  if (existing) {
    throw new AppError(409, "CONFLICT", "Tag with this name already exists");
  }

  return prisma.tag.create({
    data: { name: data.name },
  });
}

export async function updateTag(id: string, data: UpdateTagRequest) {
  const existing = await prisma.tag.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, "NOT_FOUND", "Tag not found");
  }

  if (data.name !== existing.name) {
    const duplicate = await prisma.tag.findUnique({
      where: { name: data.name },
    });
    if (duplicate) {
      throw new AppError(409, "CONFLICT", "Tag with this name already exists");
    }
  }

  return prisma.tag.update({
    where: { id },
    data: { name: data.name },
  });
}

export async function deleteTag(id: string) {
  const existing = await prisma.tag.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, "NOT_FOUND", "Tag not found");
  }

  await prisma.tag.delete({ where: { id } });
}
