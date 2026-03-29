import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

async function main() {
  // Create default user
  const user = await prisma.user.upsert({
    where: { id: DEFAULT_USER_ID },
    update: {},
    create: {
      id: DEFAULT_USER_ID,
      name: "Default User",
    },
  });

  console.log("Created user:", user.name);

  // Create sample categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { userId_name: { userId: DEFAULT_USER_ID, name: "업무" } },
      update: {},
      create: { name: "업무", color: "#2563EB", userId: DEFAULT_USER_ID },
    }),
    prisma.category.upsert({
      where: { userId_name: { userId: DEFAULT_USER_ID, name: "개인" } },
      update: {},
      create: { name: "개인", color: "#16A34A", userId: DEFAULT_USER_ID },
    }),
    prisma.category.upsert({
      where: { userId_name: { userId: DEFAULT_USER_ID, name: "공부" } },
      update: {},
      create: { name: "공부", color: "#D97706", userId: DEFAULT_USER_ID },
    }),
  ]);

  console.log("Created categories:", categories.map((c) => c.name).join(", "));

  // Create sample tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: "급한" },
      update: {},
      create: { name: "급한" },
    }),
    prisma.tag.upsert({
      where: { name: "중요" },
      update: {},
      create: { name: "중요" },
    }),
    prisma.tag.upsert({
      where: { name: "나중에" },
      update: {},
      create: { name: "나중에" },
    }),
  ]);

  console.log("Created tags:", tags.map((t) => t.name).join(", "));

  // Create sample todos
  const existingTodos = await prisma.todo.count({
    where: { userId: DEFAULT_USER_ID },
  });

  if (existingTodos === 0) {
    const todo1 = await prisma.todo.create({
      data: {
        text: "프로젝트 기획서 작성하기",
        userId: DEFAULT_USER_ID,
        categoryId: categories[0].id,
        sortOrder: 0,
      },
    });

    const todo2 = await prisma.todo.create({
      data: {
        text: "장보기 목록 정리",
        userId: DEFAULT_USER_ID,
        categoryId: categories[1].id,
        sortOrder: 1,
        completed: true,
      },
    });

    const todo3 = await prisma.todo.create({
      data: {
        text: "TypeScript 공부하기",
        userId: DEFAULT_USER_ID,
        categoryId: categories[2].id,
        sortOrder: 2,
      },
    });

    // Assign tags
    await prisma.todoTag.createMany({
      data: [
        { todoId: todo1.id, tagId: tags[0].id },
        { todoId: todo1.id, tagId: tags[1].id },
        { todoId: todo3.id, tagId: tags[1].id },
        { todoId: todo3.id, tagId: tags[2].id },
      ],
    });

    console.log("Created sample todos with tags");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
