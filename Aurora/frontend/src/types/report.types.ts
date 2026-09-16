export interface ReportSummary {
  grossRevenue: number;
  totalBookings: number;
  avgTicketSize: number;
  repeatClientRate: number;
}

export interface ReportComparison {
  revenueChangePercent: number | null;
  bookingsChangePercent: number | null;
  avgTicketChangePercent: number | null;
  repeatRateChangePercent: number | null;
}

export interface ReportTrendPoint {
  label: string;
  periodStart: string;
  revenue: number;
  bookings: number;
}

export interface ReportDayOfWeek {
  day: string;
  avgBookings: number;
  totalBookings: number;
}

export interface ReportCategoryServiceBreakdown {
  name: string;
  bookings: number;
  revenue: number;
}

export interface ReportServiceCategory {
  category: string;
  revenue: number;
  bookings: number;
  services: ReportCategoryServiceBreakdown[];
}

export interface ReportTopService {
  id: number;
  name: string;
  bookings: number;
  revenue: number;
}

export interface ReportTopPackage {
  id: number;
  name: string;
  sales: number;
  revenue: number;
}

export interface ReportPackagePerformance {
  revenue: number;
  sales: number;
  customers: number;
  topPackages: ReportTopPackage[];
}

export interface ReportCustomers {
  identifiable: number;
  new: number;
  returning: number;
  repeatRate: number;
  anonymousWalkIns: number;
  anonymousWalkInPercentage: number;
}

export interface ReportStaffMember {
  id: number;
  name: string;
  role: string | null;
  avatar: string | null;
  completedAppointments: number;
  revenue: number;
  avgTicketSize: number;
  rating: number | null;
}

export interface ReportData {
  dateRange: { startDate: string; endDate: string };
  summary: ReportSummary;
  comparison: ReportComparison;
  trend: ReportTrendPoint[];
  dayOfWeek: ReportDayOfWeek[];
  serviceCategories: ReportServiceCategory[];
  topServices: ReportTopService[];
  packagePerformance: ReportPackagePerformance;
  customers: ReportCustomers;
  staff: ReportStaffMember[];
  insights: string[];
}

export type ReportPresetRange = '1m' | '3m' | '6m' | '1y' | 'custom';