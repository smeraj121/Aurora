export type AppointmentStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show';

export interface CustomerListItem {
  id: number;
  fullName: string;
  phone: string;
  avatar?: string | null;

  isVip: boolean;

  totalVisits: number;
  totalSpent: number;
}

export interface Customer  {
  id: number;
  fullName: string;
  phone: string;
  email?: string | null;

  avatar?: string | null;
  isVip: boolean;

  totalVisits: number;
  totalSpent: number;
  lastVisitDate?: string | null;
}
export interface CustomerDetails extends CustomerListItem {
  email?: string | null;
  notes?: string | null;

  lastVisitDate?: string | null;

  averageTicket: number;

  history: CustomerVisit[];
}
export interface CustomerVisit {
  id: number;
  appointmentDate: string;
  startTime: string;
  serviceName: string;
  staffName: string;
  amount: number;
  status: AppointmentStatus;
}