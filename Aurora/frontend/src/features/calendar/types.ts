// Specific to Calendar view
export interface TimeSlot {
  time: string;
  available: boolean;
  staffId: string;
}
import type { Appointment } from '../../shared/types';
import type { PaymentStatus } from '../../shared/types/domain';

export interface AppointmentServiceItem {
  serviceId: number;
  serviceName: string;
  price: number;
  isPackage?: boolean;
}

export interface ExtendedAppointment extends Appointment {
  customerPhone?: string| null;
  services?: AppointmentServiceItem[];
  //paidAmount: number | null;
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  isPackageAppointment?: boolean;
  customerPackageId?: number;
  packageName?: string;
  balanceDue?: number;
  cancellationReason?: string;
  completedAt?: string;
}
