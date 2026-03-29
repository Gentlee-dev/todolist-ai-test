export interface ApiSuccessResponse<T> {
  data: T;
}

export interface ApiErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
  };
}

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "LIMIT_EXCEEDED"
  | "INTERNAL_ERROR";

export type TodoStatusFilter = "all" | "active" | "completed";

export interface GetTodosParams {
  status?: TodoStatusFilter;
  categoryId?: string;
  tagIds?: string;
}
