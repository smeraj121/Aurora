import type { Appointment, AppointmentStatus } from ".";

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded';

export interface BookingStaffMember {
  id: number | string;
  name: string;
}

export interface ServiceItem {
  id: number;
  name: string;
  price: number;
  durationMinutes?: number;
}

export interface CustomerSearchResult {
  id: number | string;
  fullName?: string;
  name?: string;
  phone?: string;
}

export interface BookingFormData {
  id: number;
  customerId: number;
  customerName: string;
  phone: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  startTime: string;
  durationMinutes: number;
  date: string;
  amount: string | number;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  paidAmount: string | number;
}

export interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: BookingFormData) => Promise<void> | void;
  initialData?: Appointment | null;
  appointmentId?: number | null;
  currentDate?: string;
}