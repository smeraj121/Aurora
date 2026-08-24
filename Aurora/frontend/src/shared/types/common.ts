// Shared across all modules
export type EntityId = string;
export type IsoDateString = string;

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface KeyValuePair{
  id: number;
  name: string;
}

export interface User {
  id: number;
  fullName: string;
  phone: string;
  email?: string;
  systemRole: string;
  tenantId?: number;
  customerId?: number;
}
