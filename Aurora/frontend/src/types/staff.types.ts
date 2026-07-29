// shared/types/staff.ts

export interface StaffFormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
}
// shared/types/staff.ts
export interface StaffMember {
  totalAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  id: number;
  name: string;
  email: string;
  phone: string;
  roleId: number;
  role:string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Extended fields (optional, saved as JSON or additional columns)
  employmentType?: string;
  employeeId?: string;
  joiningDate?: string;
  workingHours?: string;
  weeklyOff?: string;
  services?: number[];
  notes?: string;
  commissionPercentage?: number;
}
export interface StaffSchedule {
  id: number;
  time: string;
  customer: string;
  service: string;
  status: string;
}

export interface StaffStats {
  total: number;      // Total staff count
  active: number;     // Active staff count
  roles: number;      // Number of unique roles
}

export interface TopStaff {
  id: number;
  name: string;
  role: string;
  appointment_count: number;
  revenue: number;
}

// For the staff dashboard stats (aggregated)
export interface StaffDashboardStats {
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;
  totalAppointments: number;
  totalRevenue: number;
  averageRating: number;
  topPerformer?: TopStaff;
}

export interface Designation {
  id: number;
  name: string;
}

export interface EmploymentDetails {
  type: string;               // e.g., 'Full-time', 'Part-time'
  employeeId: string;         // employee_id from staff
  employeeCode: string;       // employeecode from staff
  joiningDate: string | Date; // staff.created_at
  status: 'Active' | 'Inactive';
  commissionRate?: number;    // optional if not provided
}

export interface WorkingSchedule {
  workingHoursStart: string;
  workingHoursEnd: string; 
  weeklyOff: string;
}

export interface ServiceSummary {
  id: number;
  name: string;
  category: string;
}

// ========== Main Staff Details Model ==========

export interface StaffDetails {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  profileImage: string | null;
  designation: Designation;
  employmentDetails: EmploymentDetails;
  schedule: WorkingSchedule;
  services: ServiceSummary[];
  createdAt: string | Date;
  updatedAt: string | Date;
}