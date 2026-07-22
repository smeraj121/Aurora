import type { AIOpportunity, Appointment } from "../../../shared/types";


export interface DashboardMetric {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  subtext: string;
}

export const METRICS_DATA: DashboardMetric[] = [
  {
    title: 'Total Revenue',
    value: '₹1,24,500',
    change: '+14.2%',
    isPositive: true,
    subtext: 'vs. last month',
  },
  {
    title: 'Appointments',
    value: '184',
    change: '+8.5%',
    isPositive: true,
    subtext: 'vs. last month',
  },
  {
    title: 'Active Clients',
    value: '312',
    change: '+12.0%',
    isPositive: true,
    subtext: '28 new this month',
  },
  {
    title: 'Slot Utilization',
    value: '78%',
    change: '-2.1%',
    isPositive: false,
    subtext: 'Target: 85%',
  },
];

export const AI_OPPORTUNITIES: AIOpportunity[] = [
  {
    id: 'opp-1',
    type: 'empty_slot',
    title: '4 Unfilled Slots Tomorrow',
    description: 'Gap detected between 2:00 PM - 5:00 PM for Senior Stylist Ananya.',
    lostRevenueOrPotential: 4800,
    actionLabel: 'Send Smart Discount SMS',
    badgeText: 'High ROI Impact',
    promoTitle: 'Limited Time Offer: 15% OFF Hair Spa & HydraFacial',
    promoDescription: '✨ Special Offer! Get 15% OFF on all morning Hair Spa & HydraFacial services (Tue-Thu, 10 AM - 1 PM). Book your slot today',//: glowlogic.app/book/spa15
  },
  {
    id: 'opp-2',
    type: 'inactive_customers',
    title: '18 High-Value VIP Clients Due for Re-booking',
    description: 'Haven\'t visited in 45+ days. Average spending: ₹3,500/visit.',
    lostRevenueOrPotential: 22500,
    actionLabel: 'Launch Retention Campaign',
    badgeText: 'Retention',
    promoTitle: 'We Miss You! Exclusive Offer Inside',
    promoDescription: 'Threading available for our valued clients. Book your next appointment and enjoy a special discount!',
  },
];

export const TODAY_SCHEDULE: Appointment[] = [
  {
    id: 'apt-101',
    customerId: 'c1',
    customerName: 'Priya Sharma',
    serviceName: 'Balayage & Hair Spa',
    staffId: 's1',
    staffName: 'Ananya Roy',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    durationMinutes: 120,
    status: 'completed',
    amount: 4500,
    date: '2026-05-24',
  },
  {
    id: 'apt-102',
    customerId: 'c2',
    customerName: 'Rohan Verma',
    serviceName: 'Beard Trim & Facial',
    staffId: 's2',
    staffName: 'Rahul Kumar',
    startTime: '12:30 PM',
    endTime: '01:30 PM',
    durationMinutes: 60,
    status: 'in_progress',
    amount: 1800,
    date: '2026-05-20',
  },
  {
    id: 'apt-103',
    customerId: 'c3',
    customerName: 'Sneha Patel',
    serviceName: 'Gel Nails & Pedicure',
    staffId: 's3',
    staffName: 'Meera Das',
    startTime: '02:00 PM',
    endTime: '03:15 PM',
    durationMinutes: 75,
    status: 'confirmed',
    amount: 2200,
    date: '2026-05-20',
  },
  {
    id: 'apt-104',
    customerId: 'c4',
    customerName: 'Kavita Iyer',
    serviceName: 'HydraFacial',
    staffId: 's1',
    staffName: 'Ananya Roy',
    startTime: '04:00 PM',
    endTime: '05:00 PM',
    durationMinutes: 60,
    status: 'scheduled',
    amount: 3500,
    date: '2026-05-24',
  },
];

export const REVENUE_CHART_DATA = [
  { day: 'Mon', revenue: 14200, target: 12000 },
  { day: 'Tue', revenue: 18500, target: 15000 },
  { day: 'Wed', revenue: 12100, target: 15000 },
  { day: 'Thu', revenue: 22400, target: 18000 },
  { day: 'Fri', revenue: 28900, target: 22000 },
  { day: 'Sat', revenue: 34500, target: 30000 },
  { day: 'Sun', revenue: 31000, target: 28000 },
];