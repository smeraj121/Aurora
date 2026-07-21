import { format } from 'date-fns';

export interface DashboardDayData {
  metrics: {
    totalRevenue: number;
    revenueGrowth: string;
    totalBookings: number;
    bookingsGrowth: string;
    newClients: number;
    occupancyRate: number;
  };
  appointments: Array<{
    id: string;
    time: string;
    clientName: string;
    service: string;
    stylist: string;
    amount: number;
    status: 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  }>;
  chartData: Array<{ time: string; revenue: number; bookings: number }>;
}

// Keyed by 'yyyy-MM-dd'
export const MOCK_DAILY_DATA: Record<string, DashboardDayData> = {
  // Today's Data (Default)
  [format(new Date(), 'yyyy-MM-dd')]: {
    metrics: {
      totalRevenue: 28400,
      revenueGrowth: '+12.5%',
      totalBookings: 18,
      bookingsGrowth: '+4 today',
      newClients: 6,
      occupancyRate: 82,
    },
    appointments: [
      { id: '1', time: '10:00 AM', clientName: 'Priya Sharma', service: 'HydraFacial Glow', stylist: 'Aisha', amount: 3500, status: 'Completed' },
      { id: '2', time: '11:30 AM', clientName: 'Ananya Verma', service: 'Hair Spa & Cut', stylist: 'Rahul', amount: 2200, status: 'In Progress' },
      { id: '3', time: '02:00 PM', clientName: 'Rohan Mehta', service: 'Beard Trim & Facial', stylist: 'Rahul', amount: 1800, status: 'Confirmed' },
      { id: '4', time: '04:15 PM', clientName: 'Neha Kapoor', service: 'Nail Art & Gel Extensions', stylist: 'Meera', amount: 2800, status: 'Confirmed' },
    ],
    chartData: [
      { time: '10 AM', revenue: 3500, bookings: 2 },
      { time: '12 PM', revenue: 8200, bookings: 5 },
      { time: '2 PM', revenue: 14500, bookings: 9 },
      { time: '4 PM', revenue: 21000, bookings: 14 },
      { time: '6 PM', revenue: 28400, bookings: 18 },
    ],
  },

  // Yesterday's Data
  [format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')]: {
    metrics: {
      totalRevenue: 31200,
      revenueGrowth: '+18.1%',
      totalBookings: 22,
      bookingsGrowth: '+6 vs avg',
      newClients: 8,
      occupancyRate: 90,
    },
    appointments: [
      { id: '101', time: '10:15 AM', clientName: 'Sanya Malhotra', service: 'Keratin Treatment', stylist: 'Aisha', amount: 6500, status: 'Completed' },
      { id: '102', time: '01:00 PM', clientName: 'Vikram Singh', service: 'Executive Haircut', stylist: 'Rahul', amount: 1200, status: 'Completed' },
      { id: '103', time: '03:30 PM', clientName: 'Deepika Roy', service: 'Balayage & Styling', stylist: 'Aisha', amount: 8500, status: 'Completed' },
    ],
    chartData: [
      { time: '10 AM', revenue: 6500, bookings: 3 },
      { time: '12 PM', revenue: 12000, bookings: 8 },
      { time: '2 PM', revenue: 19500, bookings: 13 },
      { time: '4 PM', revenue: 26000, bookings: 18 },
      { time: '6 PM', revenue: 31200, bookings: 22 },
    ],
  },

  // Tomorrow's Data
  [format(new Date(Date.now() + 86400000), 'yyyy-MM-dd')]: {
    metrics: {
      totalRevenue: 16800,
      revenueGrowth: 'Projected',
      totalBookings: 11,
      bookingsGrowth: '5 slots open',
      newClients: 3,
      occupancyRate: 55,
    },
    appointments: [
      { id: '201', time: '11:00 AM', clientName: 'Kavita Joshi', service: 'Pedicure & Manicure', stylist: 'Meera', amount: 2400, status: 'Confirmed' },
      { id: '202', time: '02:30 PM', clientName: 'Arjun Das', service: 'Haircut & Head Massage', stylist: 'Rahul', amount: 1500, status: 'Confirmed' },
    ],
    chartData: [
      { time: '10 AM', revenue: 2400, bookings: 2 },
      { time: '12 PM', revenue: 6000, bookings: 4 },
      { time: '2 PM', revenue: 10500, bookings: 7 },
      { time: '4 PM', revenue: 14000, bookings: 9 },
      { time: '6 PM', revenue: 16800, bookings: 11 },
    ],
  },
};

// Fallback generator for unconfigured dates so UI never breaks
export const getDashboardDataForDate = (date: Date): DashboardDayData => {
  const dateKey = format(date, 'yyyy-MM-dd');
  if (MOCK_DAILY_DATA[dateKey]) {
    return MOCK_DAILY_DATA[dateKey];
  }

  // Generate deterministic mock numbers based on date
  const dayNum = date.getDate();
  const mockRev = 18000 + (dayNum % 7) * 2300;
  const mockBookings = 10 + (dayNum % 5) * 3;

  return {
    metrics: {
      totalRevenue: mockRev,
      revenueGrowth: '+8.0%',
      totalBookings: mockBookings,
      bookingsGrowth: 'Standard',
      newClients: 4,
      occupancyRate: 68,
    },
    appointments: [
      { id: 'f-1', time: '11:00 AM', clientName: 'Sample Client', service: 'Full Service Package', stylist: 'Aisha', amount: 3200, status: 'Confirmed' },
    ],
    chartData: [
      { time: '10 AM', revenue: mockRev * 0.2, bookings: 2 },
      { time: '2 PM', revenue: mockRev * 0.6, bookings: Math.floor(mockBookings * 0.6) },
      { time: '6 PM', revenue: mockRev, bookings: mockBookings },
    ],
  };
};