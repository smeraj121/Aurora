export interface RevenueTrendData {
  month: string;
  revenue: number;
  appointments: number;
}

export interface CategoryBreakdownData {
  name: string;
  value: number;
  color: string;
}

export interface StaffPerformanceData {
  id: string;
  name: string;
  role: string;
  revenue: number;
  appointmentsCount: number;
  rating: number;
  avatar: string;
}

export const REVENUE_TRENDS: RevenueTrendData[] = [
  { month: 'Jan', revenue: 185000, appointments: 120 },
  { month: 'Feb', revenue: 210000, appointments: 142 },
  { month: 'Mar', revenue: 195000, appointments: 135 },
  { month: 'Apr', revenue: 240000, appointments: 168 },
  { month: 'May', revenue: 285000, appointments: 190 },
  { month: 'Jun', revenue: 310000, appointments: 210 },
];

export const CATEGORY_BREAKDOWN: CategoryBreakdownData[] = [
  { name: 'Hair Services', value: 45, color: '#9333EA' }, // Purple
  { name: 'Skin & Facial', value: 25, color: '#2563EB' }, // Blue
  { name: 'Nails & Spa', value: 18, color: '#D97706' }, // Amber
  { name: 'Beard & Grooming', value: 12, color: '#10B981' }, // Emerald
];

export const TOP_STAFF: StaffPerformanceData[] = [
  {
    id: 's1',
    name: 'Ananya Roy',
    role: 'Senior Hair Stylist',
    revenue: 128500,
    appointmentsCount: 64,
    rating: 4.9,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 's2',
    name: 'Rahul Kumar',
    role: 'Barber & Stylist',
    revenue: 84200,
    appointmentsCount: 52,
    rating: 4.8,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 's3',
    name: 'Meera Das',
    role: 'Nail & Skin Specialist',
    revenue: 72300,
    appointmentsCount: 48,
    rating: 4.9,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
  },
];