// ---- Types ----
export interface AppointmentCardData {
  id: number;
  customerName: string;
  status?: string;
  amount?: number;
  paidAmount?: number;
  balanceDue?: number;
  durationMinutes?: number;
  serviceName?: string;
  services?: Array<{
    serviceId: number;
    serviceName: string;
    price: number;
    isPackage: boolean;
  }>;
  isPackageAppointment?: boolean;
  packageName?: string;
  paymentStatus?: string;
}

export interface AppointmentCardProps {
  appointment: AppointmentCardData;
  cardHeight: number;
  onClick: () => void;
}