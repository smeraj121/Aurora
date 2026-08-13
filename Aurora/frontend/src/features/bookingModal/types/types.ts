
import type { LucideIcon } from 'lucide-react';
import type { AppointmentStatus } from '../../../shared/types';
import type { PaymentStatus } from '../../../shared/types/domain';
import type { CustomerPackageServiceItem } from '../../../types/customerpackage.types';


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