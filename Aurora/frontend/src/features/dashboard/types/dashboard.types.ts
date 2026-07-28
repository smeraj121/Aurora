export interface DashboardMetric {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  subtext: string;
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

export type WeekDay =
  | 'Mon'
  | 'Tue'
  | 'Wed'
  | 'Thu'
  | 'Fri'
  | 'Sat'
  | 'Sun';

export interface Revenue {
  day: WeekDay;
  revenue: number;
  target: number;
}