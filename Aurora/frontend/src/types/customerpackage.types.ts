import type { PaymentStatus } from "../shared/types/domain";

export interface CustomerPackageServiceItem {
  serviceId: number;
  serviceName: string;
  price: number;
  totalQuantity: number;
  usedQuantity: number;
  isPackage: boolean;
  discount?: number;
}

export interface CustomerPackage {
  id: number;
  customerId: number;
  packageId: number;
  packageName: string;
  packageDescription?: string;
  purchaseDate: string;
  expiryDate?: string | null;
  totalSessions: number;
  usedSessions: number;
  remainingSessions: number;
  totalPrice: number;
  customPrice?: number | null;  // Added
  effectivePrice?: number;  // Added - calculated field
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  notes?: string;
  services: CustomerPackageServiceItem[];
}