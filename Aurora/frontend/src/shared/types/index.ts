export type AppointmentStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  vipTag?: boolean;
  totalVisits: number;
  totalSpent: number;
  lastVisitAt: string;
  birthDate?: string;
  notes?: string;
  preferredStaffId?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  color: string;
  rating?: number;
  revenueThisMonth?: number;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  startTime: string; // ISO string or "10:00 AM"
  endTime: string;
  durationMinutes: number;
  status: AppointmentStatus;
  amount: number;
}

export interface AIOpportunity {
  id: string;
  type: 'empty_slot' | 'inactive_customers' | 'birthday' | 'renewal';
  title: string;
  description: string;
  lostRevenueOrPotential: number;
  actionLabel: string;
  badgeText?: string;
  expectedBookings?: string;
  promoTitle: string;
  promoDescription: string;
}