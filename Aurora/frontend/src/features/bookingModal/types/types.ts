
import type { LucideIcon } from 'lucide-react';
import type { AppointmentStatus } from '../../../shared/types';
import type { PaymentStatus } from '../../../shared/types/booking';

export interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookingData: any) => Promise<void>;
  initialData?: any | null;
  appointmentId?: number | null;
  currentDate?: string;
}

export interface StatusOption {
  id: AppointmentStatus;
  label: string;
  icon: LucideIcon;
  color?: string;
}

export interface PaymentStatusOption {
  id: PaymentStatus;
  label: string;
  color: string;
}

export interface PackageService {
  serviceId: number;
  serviceName: string;
  price: number;
  quantity?: number;
}

export interface CustomerPackage {
  id: number;
  packageName: string;
  remainingSessions: number;
  totalSessions: number;
  expiryDate: string;
  services: PackageService[];
}

export interface BookingFormState {
  id: number | null;
  customerId: number | null;
  customerName: string;
  phone: string;
  staffId: string;
  startTime: string;
  durationMinutes: number;
  date: string;
  amount: number;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  services: PackageService[];
  customerPackageId: string | null;
  isPackageAppointment: boolean;
}