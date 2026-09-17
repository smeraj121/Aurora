import type { AppointmentStatus, PaymentStatus } from '../shared/types/domain';

export interface MyAppointmentService {
  serviceId: number;
  serviceName: string;
}

export interface MyAppointmentReview {
  id: number;
  rating: number;
}

export interface MyAppointmentItem {
  id: number;
  staffId: number | null;
  staffName: string | null;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  amount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  isPackageAppointment: boolean;
  updatedAt: string | null;
  updatedByName: string | null;
  services: MyAppointmentService[];
  review: MyAppointmentReview | null;
}
