// Specific to Calendar view
export interface TimeSlot {
  time: string;
  available: boolean;
  staffId: string;
}
import type { Appointment } from '../../shared/types';
import type { PaymentStatus } from '../../types/booking.types';

export interface AppointmentServiceItem {
  serviceId: number;
  serviceName: string;
  price: number;
  isPackage?: boolean;
}

export interface ExtendedAppointment extends Appointment {
  customerPhone: import("react").JSX.Element;
  services?: AppointmentServiceItem[];
  paidAmount?: number;
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  isPackageAppointment?: boolean;
  customerPackageId?: number;
  packageName?: string;
  balanceDue?: number;
  cancellationReason?: string;
  completedAt?: string;
}
