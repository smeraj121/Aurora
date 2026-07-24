export interface PackageService {
  serviceId: number;
  serviceName: string;
  servicePrice: number;
  quantity: number;
  discount: number;
  totalPrice?: number;
}

export interface Package {
  id: number;
  name: string;
  description?: string | null;
  totalPrice: number;
  discountPercentage: number;
  totalSessions: number;
  isActive: boolean;
  services: PackageService[];
  createdAt: string;
  updatedAt: string;
}

export interface PackageStats {
  totalPackages: number;
  activePackages: number;
  totalPurchases: number;
  totalRevenue: number;
  uniqueCustomers: number;
}

export interface PopularPackage {
  id: number;
  name: string;
  totalPrice: number;
  purchases: number;
  revenue: number;
  isActive: boolean;
}

export interface PackageFormData {
  name: string;
  description?: string;
  totalPrice: number;
  discountPercentage: number;
  isActive: boolean;
  services: Array<{
    serviceId: number;
    quantity: number;
    discount: number;
  }>;
}