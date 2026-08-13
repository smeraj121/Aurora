import type { AppointmentStatus } from "../shared/types";
import type { PaymentStatus } from "../shared/types/domain";

export interface BookingStaffMember {
  id: number | string;
  name: string;
}

export interface BookingServiceItem {
  id: number;
  name: string;
  price: number;
  durationMinutes: number;
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
