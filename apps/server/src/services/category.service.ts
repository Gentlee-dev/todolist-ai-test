import { prisma } from "../prisma";
import { DEFAULT_USER_ID } from "../constants";
import { MAX_CATEGORIES } from "@todolist/shared";
import { AppError } from "../middlewares/error-handler";
import type { CreateCategoryRequest, UpdateCategoryRequest } from "@todolist/shared";

export async function getCategories() {
  return prisma.category.findMany({
    where: { userId: DEFAULT_USER_ID },
    orderBy: { createdAt: "asc" },
  });
}

export async function createCategory(data: CreateCategoryRequest) {
  const count = await prisma.category.count({
    where: { userId: DEFAULT_USER_ID },
  });

  if (count >= MAX_CATEGORIES) {
    throw new AppError(400, "LIMIT_EXCEEDED", `Maximum ${MAX_CATEGORIES} categories allowed`);
  }

  const existing = await prisma.category.findUnique({
    where: { userId_name: { userId: DEFAULT_USER_ID, name: data.name } },
  });

  if (existing) {
    throw new AppError(409, "CONFLICT", "Category with this name already exists");
  }

  return prisma.category.create({
    data: {
      name: data.name,
      color: data.color,
      userId: DEFAULT_USER_ID,
    },
  });
}

export async function updateCategory(id: string, data: UpdateCategoryRequest) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing || existing.userId !== DEFAULT_USER_ID) {
    throw new AppError(404, "NOT_FOUND", "Category not found");
  }

  if (data.name && data.name !== existing.name) {
    const duplicate = await prisma.category.findUnique({
      where: { userId_name: { userId: DEFAULT_USER_ID, name: data.name } },
    });
    if (duplicate) {
      throw new AppError(409, "CONFLICT", "Category with this name already exists");
    }
  }

  return prisma.category.update({
    where: { id },
    data,
  });
}

export async function deleteCategory(id: string) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing || existing.userId !== DEFAULT_USER_ID) {
    throw new AppError(404, "NOT_FOUND", "Category not found");
  }

  await prisma.category.delete({ where: { id } });
}
