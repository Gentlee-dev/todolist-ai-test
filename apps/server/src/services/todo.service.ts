import { prisma } from "../prisma";
import { DEFAULT_USER_ID } from "../constants";
import { AppError } from "../middlewares/error-handler";
import type {
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoStatusFilter,
} from "@todolist/shared";

const todoInclude = {
  category: { select: { id: true, name: true, color: true } },
  tags: { include: { tag: { select: { id: true, name: true } } } },
} as const;

function formatTodo(todo: Awaited<ReturnType<typeof prisma.todo.findFirst>> & { tags: Array<{ tag: { id: string; name: string } }> }) {
  return {
    ...todo,
    tags: todo.tags.map((tt) => tt.tag),
  };
}

export async function getTodos(
  status: TodoStatusFilter = "all",
  categoryId?: string,
  tagIds?: string[],
) {
  const where: Record<string, unknown> = { userId: DEFAULT_USER_ID };

  if (status === "active") where.completed = false;
  if (status === "completed") where.completed = true;
  if (categoryId) where.categoryId = categoryId;
  if (tagIds?.length) {
    where.tags = { some: { tagId: { in: tagIds } } };
  }

  const todos = await prisma.todo.findMany({
    where,
    include: todoInclude,
    orderBy: { sortOrder: "asc" },
  });

  return todos.map(formatTodo);
}

export async function createTodo(data: CreateTodoRequest) {
  if (!data.text.trim()) {
    throw new AppError(400, "VALIDATION_ERROR", "Text is required");
  }

  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new AppError(404, "NOT_FOUND", "Category not found");
    }
  }

  const maxOrder = await prisma.todo.aggregate({
    where: { userId: DEFAULT_USER_ID },
    _max: { sortOrder: true },
  });

  const todo = await prisma.todo.create({
    data: {
      text: data.text.trim(),
      userId: DEFAULT_USER_ID,
      categoryId: data.categoryId ?? null,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
    include: todoInclude,
  });

  return formatTodo(todo);
}

export async function updateTodo(id: string, data: UpdateTodoRequest) {
  const existing = await prisma.todo.findUnique({ where: { id } });
  if (!existing || existing.userId !== DEFAULT_USER_ID) {
    throw new AppError(404, "NOT_FOUND", "Todo not found");
  }

  if (data.categoryId !== undefined && data.categoryId !== null) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new AppError(404, "NOT_FOUND", "Category not found");
    }
  }

  const updateData: Record<string, unknown> = {};
  if (data.text !== undefined) updateData.text = data.text.trim();
  if (data.completed !== undefined) updateData.completed = data.completed;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;

  const todo = await prisma.todo.update({
    where: { id },
    data: updateData,
    include: todoInclude,
  });

  return formatTodo(todo);
}

export async function deleteTodo(id: string) {
  const existing = await prisma.todo.findUnique({ where: { id } });
  if (!existing || existing.userId !== DEFAULT_USER_ID) {
    throw new AppError(404, "NOT_FOUND", "Todo not found");
  }

  await prisma.todo.delete({ where: { id } });
}

export async function deleteCompletedTodos() {
  await prisma.todo.deleteMany({
    where: { userId: DEFAULT_USER_ID, completed: true },
  });
}

export async function reorderTodos(orderedIds: string[]) {
  if (orderedIds.length === 0) return;

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.todo.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );
}

export async function updateTodoTags(todoId: string, tagIds: string[]) {
  const existing = await prisma.todo.findUnique({ where: { id: todoId } });
  if (!existing || existing.userId !== DEFAULT_USER_ID) {
    throw new AppError(404, "NOT_FOUND", "Todo not found");
  }

  await prisma.$transaction([
    prisma.todoTag.deleteMany({ where: { todoId } }),
    ...tagIds.map((tagId) =>
      prisma.todoTag.create({ data: { todoId, tagId } }),
    ),
  ]);

  const todo = await prisma.todo.findUnique({
    where: { id: todoId },
    include: todoInclude,
  });

  return formatTodo(todo!);
}
