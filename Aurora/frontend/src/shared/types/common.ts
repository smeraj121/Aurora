// Shared across all modules
export type EntityId = string;
export type IsoDateString = string;

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
}