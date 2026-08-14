// shared/types/domain.ts
export type AppointmentStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show';

export type PaymentStatus = 
  | 'pending' 
  | 'partial' 
  | 'paid' 
  | 'refunded';

export type CalendarViewMode = 'day' | 'week' | 'month';



export interface ServiceItem {
  id: number;
  name: string;
  category: string;
  durationMinutes: number;
  price: number;
  description?: string;
  isActive: boolean;
}
// shared/types/domain.ts
export interface CustomerPackageAssignment {
  customerId: number;
  packageId: number;
  customPrice?: number; // Custom price override
  paymentMethod?: string;
  notes?: string;
  expiryDate?: string; // Custom expiry date
}

export interface PackageAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: number;
  customerName: string;
  onAssign: (data: CustomerPackageAssignment) => Promise<void>;
}

export interface AssignPackageData {
  customerId: number;
  packageId: number;
  customPrice?: number;
  paymentMethod?: string;
  notes?: string;
  expiryDate?: string;
}
