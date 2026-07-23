import type { Appointment, AppointmentStatus } from ".";

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded';

export interface StaffMember {
  id: number | string;
  name: string;
}

export interface ServiceItem {
  id: number | string;
  name: string;
  price?: number;
  durationMinutes?: number;
}

export interface CustomerSearchResult {
  id: number | string;
  fullName?: string;
  name?: string;
  phone?: string;
}

export interface BookingFormData {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  startTime: string;
  durationMinutes: string;
  date: string;
  amount: string;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  paymentAmount: string;
}

export interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: BookingFormData) => Promise<void> | void;
  initialData?: Appointment | null;
}