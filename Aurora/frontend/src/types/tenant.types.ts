
export interface Tenant {
  businessTypeId: number;
  id: number;
  name: string;
  slug: string;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  customerCount?: number;
  staffCount?: number;
}

export interface TenantFormData {
  name: string;
  slug: string;
  phone: string;
  email: string;
  businessTypeId: number;
}