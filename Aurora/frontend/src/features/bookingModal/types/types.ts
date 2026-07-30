
import type { LucideIcon } from 'lucide-react';
import type { AppointmentStatus } from '../../../shared/types';
import type { PaymentStatus } from '../../../types/booking.types';

export interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookingData: any) => Promise<void>;
  initialData?: any | null;
  appointmentId?: number | null;
  currentDate?: string;
  staffId?:number | null;
  slot?:string;
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

export interface CustomerPackageServiceItem {
  serviceId: number;
  serviceName: string;
  price: number;
  totalQuantity?: number;
  usedQuantity: number;
}

export interface CustomerPackage {
  id: number;
  packageName: string;
  remainingSessions: number;
  totalSessions: number;
  expiryDate: string;
  services: CustomerPackageServiceItem[];
}

export interface BookingFormState {
  id: number | null;
  customerId: number | null;
  customerName: string;
  phone: string;
  staffId: number | null;
  startTime: string;
  durationMinutes: number;
  date: string;
  amount: number;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  services: CustomerPackageServiceItem[];
  customerPackageId: string | null;
  isPackageAppointment: boolean;
}