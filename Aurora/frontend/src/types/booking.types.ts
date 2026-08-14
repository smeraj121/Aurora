import type { AppointmentStatus } from "../shared/types";
import type { PaymentStatus } from "../shared/types/domain";

export interface CustomerSearchResult {
  id: number | string;
  fullName?: string;
  name?: string;
  phone?: string;
}
// ============================================================
// Booking Types (extended with customer info)
// ============================================================

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

export interface BookingFormData {
  id?: string;

  customerId: string;
  customerName: string;
  phone: string;

  staffId: string;

  date: string;
  startTime: string;
  durationMinutes: number;

  amount: string;
  paidAmount?: string;
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;

  status: AppointmentStatus;
  notes?: string;

  services: BookingServiceItem[];

  customerPackageId?: string | null;
  isPackageAppointment: boolean;
}