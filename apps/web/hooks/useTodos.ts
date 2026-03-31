"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoStatusFilter,
} from "@todolist/shared";

interface TodoFilters {
  status?: TodoStatusFilter;
  categoryId?: string;
  tagIds?: string[];
}

function buildQueryString(filters: TodoFilters): string {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }
  if (filters.categoryId) {
    params.set("categoryId", filters.categoryId);
  }
  if (filters.tagIds?.length) {
    params.set("tagIds", filters.tagIds.join(","));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useTodos(filters: TodoFilters = {}) {
  return useQuery<Todo[]>({
    queryKey: ["todos", filters],
    queryFn: () => apiFetch<Todo[]>(`/todos${buildQueryString(filters)}`),
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTodoRequest) =>
      apiFetch<Todo>("/todos", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoRequest }) =>
      apiFetch<Todo>(`/todos/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const previousQueries = queryClient.getQueriesData<Todo[]>({
        queryKey: ["todos"],
      });

      queryClient.setQueriesData<Todo[]>({ queryKey: ["todos"] }, (old) =>
        old?.map((todo) => (todo.id === id ? { ...todo, ...data } : todo)),
      );

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      context?.previousQueries.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/todos/${id}`, { method: "DELETE" }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const previousQueries = queryClient.getQueriesData<Todo[]>({
        queryKey: ["todos"],
      });

      queryClient.setQueriesData<Todo[]>({ queryKey: ["todos"] }, (old) =>
        old?.filter((todo) => todo.id !== id),
      );

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      context?.previousQueries.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

export function useDeleteCompletedTodos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch("/todos/completed", { method: "DELETE" }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const previousQueries = queryClient.getQueriesData<Todo[]>({
        queryKey: ["todos"],
      });

      queryClient.setQueriesData<Todo[]>({ queryKey: ["todos"] }, (old) =>
        old?.filter((todo) => !todo.completed),
      );

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      context?.previousQueries.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

export function useReorderTodos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedIds: string[]) =>
      apiFetch("/todos/reorder", {
        method: "PATCH",
        body: JSON.stringify({ orderedIds }),
      }),
    onMutate: async (orderedIds) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const previousQueries = queryClient.getQueriesData<Todo[]>({
        queryKey: ["todos"],
      });

      queryClient.setQueriesData<Todo[]>({ queryKey: ["todos"] }, (old) => {
        if (!old) return old;
        const todoMap = new Map(old.map((t) => [t.id, t]));
        return orderedIds
          .map((id, index) => {
            const todo = todoMap.get(id);
            return todo ? { ...todo, sortOrder: index } : undefined;
          })
          .filter((t): t is Todo => t !== undefined);
      });

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      context?.previousQueries.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

export function useUpdateTodoTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ todoId, tagIds }: { todoId: string; tagIds: string[] }) =>
      apiFetch<Todo>(`/todos/${todoId}/tags`, {
        method: "PUT",
        body: JSON.stringify({ tagIds }),
      }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}
