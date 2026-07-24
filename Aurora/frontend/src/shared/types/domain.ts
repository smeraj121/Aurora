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

export interface CustomerListItem {
  id: number;
  fullName: string;
  phone: string;
  avatar?: string | null;
  isVip: boolean;
  totalVisits: number;
  totalSpent: number;
  totalPaid?: number;
  lastVisitDate?: string | null;
}

export interface Customer extends CustomerListItem {
  email?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerDetails extends Customer {
  averageTicket: number;
  totalPaid: number;
  balanceDue?: number;
  history: CustomerVisit[];
  packages: CustomerPackage1[];
  stats?: CustomerStats;
}

export interface CustomerVisit {
  id: number;
  appointmentDate: string;
  startTime: string;
  serviceName: string;
  staffName: string;
  amount: number;
  paidAmount?: number;
  paymentStatus?: PaymentStatus;
  status: AppointmentStatus;
  isPackageAppointment?: boolean;
  customerPackageId?: number | null;
  packageName?: string | null;
  services?: CustomerVisitService[];
  balanceDue?: number;
}

export interface CustomerVisitService {
  serviceId: number;
  serviceName: string;
  price: number;
  isPackage: boolean;
}

// shared/types/domain.ts

export interface CustomerPackage1 {
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
  services: CustomerPackageService[];
}

export interface CustomerPackageService {
  serviceId: number;
  serviceName: string;
  quantity: number;
  discount?: number;
}

export interface CustomerStats {
  totalAppointments: number;
  totalSpent: number;
  totalPaid: number;
  balanceDue: number;
  activePackages: number;
  lastVisitDate?: string | null;
  daysSinceLastVisit?: number;
}

export interface CustomerCreateInput {
  fullName: string;
  phone: string;
  email?: string | null;
  notes?: string | null;
  isVip?: boolean;
}

export interface CustomerUpdateInput {
  fullName?: string;
  phone?: string;
  email?: string | null;
  notes?: string | null;
  isVip?: boolean;
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CustomersListResponse {
  success: boolean;
  data: CustomerListItem[];
}

export interface CustomerDetailsResponse {
  success: boolean;
  data: CustomerDetails;
}

export interface CustomerHistoryResponse {
  success: boolean;
  data: CustomerVisit[];
}

export interface CustomerPackagesResponse {
  success: boolean;
  data: CustomerPackage1[];
}

// ============================================================
// Booking Types (extended with customer info)
// ============================================================

export interface BookingCustomerInfo {
  id: number;
  fullName: string;
  phone: string;
  email?: string | null;
  isVip: boolean;
  totalVisits: number;
  totalSpent: number;
  availablePackages?: CustomerPackage1[];
}

export interface BookingFormData {
  id?: string;
  customerId: string;
  customerName: string;
  phone: string;
  serviceId?: string;
  serviceName?: string;
  staffId: string;
  startTime: string;
  durationMinutes: number;
  date: string;
  amount: string;
  paidAmount?: string;
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  status: AppointmentStatus;
  notes?: string;
  services: BookingService[];
  customerPackageId?: string | null;
  isPackageAppointment: boolean;
}

export interface BookingService {
  serviceId: number;
  serviceName: string;
  price: number;
  isPackage?: boolean;
}


export interface ServiceItem {
  id: number;
  name: string;
  category: string;
  durationMinutes: number;
  price: number;
  description?: string;
  isActive: boolean;
}

export interface CustomerSearchResult {
  id: number;
  fullName: string;
  name?: string;
  phone: string;
  email?: string;
  avatar?: string;
  isVip?: boolean;
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
