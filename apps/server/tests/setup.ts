import { PrismaClient } from "@prisma/client";
import { beforeEach, afterAll } from "vitest";

const prisma = new PrismaClient();

beforeEach(async () => {
  // Clean all data in correct order (respecting foreign keys)
  await prisma.todoTag.deleteMany();
  await prisma.todo.deleteMany();
  await prisma.category.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  // Create default user for tests
  await prisma.user.create({
    data: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Test User",
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
