export interface PackageService {
  discount: number;
  quantity: number;
  totalPrice: number;
  servicePrice: number;
  serviceId: number;
  serviceName: string;
  price: number;
}

export interface PackageModel {
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
  avgPackagePrice:number;
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