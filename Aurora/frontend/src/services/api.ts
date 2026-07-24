import type { Appointment } from "../shared/types";
import type { BookingStaffMember, ServiceItem } from "../shared/types/booking";
import type { CustomerListItem, CustomerDetails, CustomerVisit, CustomerPackage } from "../shared/types/domain";
import type { StaffMember, StaffSchedule, StaffStats, TopStaff } from "../shared/types/staff";
import type { Package, PackageFormData, PackageStats, PopularPackage } from "../shared/types/packages";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // ============================================================
  // HELPER METHODS
  // ============================================================
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data: T; message?: string }> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ============================================================
  // CALENDAR ENDPOINTS
  // ============================================================

  async getSchedule(date: string): Promise<{ success: boolean; data: Appointment[] }> {
    return this.request(`/calendar?date=${date}`);
  }

  async createAppointment(data: any): Promise<{ success: boolean; data: any; message?: string }> {
    return this.request('/calendar', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAppointment(id: number, data: any): Promise<{ success: boolean; data: any; message?: string }> {
    return this.request(`/calendar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async recordPayment(appointmentId: number, paidAmount: number, paymentMethod: string): Promise<{ success: boolean; data: any }> {
    return this.request('/calendar/payment', {
      method: 'POST',
      body: JSON.stringify({ appointmentId, paidAmount, paymentMethod }),
    });
  }

  async getPendingPayments(): Promise<{ success: boolean; data: any[] }> {
    return this.request('/calendar/pending-payments');
  }

  // ============================================================
  // CUSTOMER ENDPOINTS
  // ============================================================

  async getCustomers(search = ''): Promise<{ success: boolean; data: CustomerListItem[] }> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request(`/customers${query}`);
  }

  async getCustomerDetails(id: number): Promise<{ success: boolean; data: CustomerDetails }> {
    return this.request(`/customers/${id}`);
  }

  async getCustomerHistory(id: number): Promise<{ success: boolean; data: CustomerVisit[] }> {
    return this.request(`/customers/${id}/history`);
  }

  async createCustomer(data: any): Promise<{ success: boolean; data: any }> {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCustomer(id: number, data: any): Promise<{ success: boolean; data: any }> {
    return this.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCustomer(id: number): Promise<{ success: boolean; message?: string }> {
    return this.request(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  async getTopCustomers(limit = 10): Promise<{ success: boolean; data: any[] }> {
    return this.request(`/customers/top?limit=${limit}`);
  }

  async getRecentCustomers(limit = 10): Promise<{ success: boolean; data: any[] }> {
    return this.request(`/customers/recent?limit=${limit}`);
  }

  // ============================================================
  // CUSTOMER PACKAGE ENDPOINTS
  // ============================================================

  async getCustomerPackages(
    customerId: number,
    options?: {
      includeExpired?: boolean;
      includeInactive?: boolean;
      status?: string | null;
    }
  ): Promise<{ success: boolean; data: CustomerPackage[] }> {
    const params = new URLSearchParams();
    if (options?.includeExpired) params.append('includeExpired', 'true');
    if (options?.includeInactive) params.append('includeInactive', 'true');
    if (options?.status) params.append('status', options.status);
    
    const queryString = params.toString();
    return this.request(`/customers/${customerId}/packages${queryString ? `?${queryString}` : ''}`);
  }

  async getCustomerPackageById(id: number): Promise<{ success: boolean; data: CustomerPackage }> {
    return this.request(`/customers/packages/${id}`);
  }

  async assignPackageToCustomer(data: {
    customerId: number;
    packageId: number;
    customPrice?: number;
    paymentMethod?: string;
    notes?: string;
    expiryDate?: string;
  }): Promise<{ success: boolean; data: any; message?: string }> {
    return this.request('/customers/assign-package', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCustomerPackage(
    id: number,
    data: {
      customPrice?: number;
      expiryDate?: string;
      notes?: string;
      paymentStatus?: string;
      status?: string;
    }
  ): Promise<{ success: boolean; data: CustomerPackage }> {
    return this.request(`/customers/packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateCustomerPackageStatus(
    id: number,
    status: string
  ): Promise<{ success: boolean; data: any; message?: string }> {
    return this.request(`/customers/packages/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async extendPackageExpiry(
    id: number,
    expiryDate: string
  ): Promise<{ success: boolean; data: any; message?: string }> {
    return this.request(`/customers/packages/${id}/extend`, {
      method: 'POST',
      body: JSON.stringify({ expiryDate }),
    });
  }

  // ============================================================
  // PACKAGE ENDPOINTS
  // ============================================================

  async getPackages(includeInactive = false): Promise<{ success: boolean; data: Package[] }> {
    return this.request(`/packages?includeInactive=${includeInactive}`);
  }

  async getPackage(id: number): Promise<{ success: boolean; data: Package }> {
    return this.request(`/packages/${id}`);
  }

  async createPackage(data: PackageFormData): Promise<{ success: boolean; data: Package }> {
    return this.request('/packages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePackage(id: number, data: Partial<PackageFormData>): Promise<{ success: boolean; data: Package }> {
    return this.request(`/packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePackage(id: number): Promise<{ success: boolean; message?: string }> {
    return this.request(`/packages/${id}`, {
      method: 'DELETE',
    });
  }

  async getPackageStats(): Promise<{ success: boolean; data: PackageStats }> {
    return this.request('/packages/stats');
  }

  async getPopularPackages(limit = 5): Promise<{ success: boolean; data: PopularPackage[] }> {
    return this.request(`/packages/popular?limit=${limit}`);
  }

  // ============================================================
  // STAFF ENDPOINTS
  // ============================================================
// services/api.ts - Add these methods
async getStaff(onlyActive = false, withStats = false): Promise<{ success: boolean; data: StaffMember[] }> {
  const params = new URLSearchParams();
  if (onlyActive) params.append('active', 'true');
  if (withStats) params.append('stats', 'true');
  const queryString = params.toString();
  return this.request(`/staff${queryString ? `?${queryString}` : ''}`);
}

async getStaffStats(): Promise<{ success: boolean; data: StaffStats }> {
  return this.request('/staff/stats');
}

async getTopStaff(limit = 5): Promise<{ success: boolean; data: TopStaff[] }> {
  return this.request(`/staff/top?limit=${limit}`);
}

async getStaffSchedule(staffId: number): Promise<{ success: boolean; data: StaffSchedule[] }> {
  return this.request(`/staff/${staffId}/schedule`);
}
async getAppointment(id: number): Promise<{ success: boolean; data: any }> {
  return this.request(`/calendar/${id}`);
}

// Uses GET /staff/:id?stats=true
async getStaffDetails(id: number, withStats = true): Promise<{ success: boolean; data: StaffMember }> {
  const query = withStats ? '?stats=true' : '';
  return this.request(`/staff/${id}${query}`);
}

async createStaff(data: any): Promise<{ success: boolean; data: StaffMember }> {
  return this.request('/staff', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async updateStaff(id: number, data: any): Promise<{ success: boolean; data: StaffMember }> {
  return this.request(`/staff/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

async deleteStaff(id: number): Promise<{ success: boolean; message?: string }> {
  return this.request(`/staff/${id}`, {
    method: 'DELETE',
  });
}

  // ============================================================
  // SERVICE ENDPOINTS
  // ============================================================

  async getServices(includeInactive = false): Promise<{ success: boolean; data: ServiceItem[] }> {
    return this.request(`/services?includeInactive=${includeInactive}`);
  }

  async getService(id: number): Promise<{ success: boolean; data: ServiceItem }> {
    return this.request(`/services/${id}`);
  }

  async getServiceCategories(): Promise<{ success: boolean; data: string[] }> {
    return this.request('/services/categories');
  }

  async getServicesByCategory(category: string): Promise<{ success: boolean; data: ServiceItem[] }> {
    return this.request(`/services/category/${encodeURIComponent(category)}`);
  }

  async createService(data: any): Promise<{ success: boolean; data: ServiceItem }> {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateService(id: number, data: any): Promise<{ success: boolean; data: ServiceItem }> {
    return this.request(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteService(id: number): Promise<{ success: boolean; message?: string }> {
    return this.request(`/services/${id}`, {
      method: 'DELETE',
    });
  }

  
}


// Export a singleton instance
export const api = new ApiService(API_BASE_URL);