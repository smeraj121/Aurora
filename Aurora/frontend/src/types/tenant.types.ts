
export interface Tenant {
  businessTypeId: number;
  id: number;
  name: string;
  slug: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  createdAt?: string;
  updatedAt?: string;
  customerCount?: number;
  staffCount?: number;
  isActive: any;
}

export interface TenantFormData {
  name: string;
  slug: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  businessTypeId: number;
}