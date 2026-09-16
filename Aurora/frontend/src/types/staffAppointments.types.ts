import type { AppointmentStatus } from '../shared/types/domain';

export interface StaffAppointmentService {
  serviceId: number;
  serviceName: string;
}

export interface StaffAppointmentItem {
  id: number;
  customerName: string;
  customerPhone: string;
  staffId: number | null;
  staffName: string | null;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  amount: number;
  paidAmount: number;
  paymentStatus: string;
  services: StaffAppointmentService[];
}

export interface PendingPaymentItem extends StaffAppointmentItem {
  dueAmount: number;
}

export interface StuckInProgressItem extends StaffAppointmentItem {
  elapsedMinutes: number;
}

export interface PendingActionsResponse {
  confirmationRequired: StaffAppointmentItem[];
  pendingPayments: PendingPaymentItem[];
  stuckInProgress: StuckInProgressItem[];
}