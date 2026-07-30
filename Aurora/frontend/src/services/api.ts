// src/services/api.ts

import type { Appointment } from '../shared/types';
import type { BookingServiceItem } from '../types/booking.types';
import type { CustomerListItem, CustomerDetails, CustomerVisit } from '../shared/types/domain';
import type { StaffDetails, StaffMember, StaffSchedule, StaffStats, TopStaff } from '../types/staff.types';
import type { PackageModel, PackageFormData, PackageStats, PopularPackage } from '../shared/types/packages';
import type { CustomerPackage } from '../features/bookingModal/types/types';
import type { DashboardMetric, Revenue } from '../features/dashboard/types/dashboard.types';
import type { KeyValuePair } from '../shared/types/common';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly data?: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

export class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api') {
    this.baseUrl = baseUrl;
  }

  // ============================================================
  // TOKEN MANAGEMENT
  // ============================================================

  setAuthToken(token: string | null) {
    this.authToken = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  getAuthToken(): string | null {
    return this.authToken || localStorage.getItem('accessToken');
  }

  clearAuthToken() {
    this.authToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // ============================================================
  // REQUEST HELPERS
  // ============================================================

  private buildUrl(endpoint: string, query?: Record<string, any>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (query) {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      const queryString = params.toString();
      if (queryString) {
        url.search = queryString;
      }
    }
    return url.toString();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    query?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, query);

    const headers: Record<string, string> = {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers as Record<string, string> || {}),
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    let data: any;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      // Handle 401 - token expired
      if (response.status === 401 && endpoint !== '/auth/refresh-token') {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const refreshed = await this.refreshToken(refreshToken);
            if (refreshed) {
              return this.request<T>(endpoint, options, query);
            }
          } catch {
            this.clearAuthToken();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        } else {
          this.clearAuthToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      }

      throw new ApiError(
        data?.message || `Request failed with status ${response.status}`,
        response.status,
        data
      );
    }

    return data as ApiResponse<T>;
  }

  // ============================================================
  // HTTP METHODS
  // ============================================================

  async get<T>(endpoint: string, query?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, query);
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'POST',
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ============================================================
  // AUTH METHODS
  // ============================================================

  async requestOtp(phone: string, purpose: 'login' | 'signup' = 'login'): Promise<void> {
    await this.post('/auth/request-otp', { phone, purpose });
  }

  async verifyOtp(phone: string, otp: string, purpose: 'login' | 'signup' = 'login'): Promise<{ verificationToken: string }> {
    const response = await this.post<{ verificationToken: string }>('/auth/verify-otp', {
      phone,
      otp,
      purpose,
    });
    return response.data;
  }

  async login(verificationToken: string, tenantId?: number): Promise<{
    accessToken: string;
    refreshToken: string;
    user: any;
    requiresTenantSelection: boolean;
    tenants?: any[];
  }> {
    const response = await this.post<{
      accessToken: string;
      refreshToken: string;
      user: any;
      requiresTenantSelection: boolean;
      tenants?: any[];
    }>('/auth/login', {
      verificationToken,
      tenantId: tenantId || null,
    });

    const data = response.data;

    if (!data.requiresTenantSelection && data.accessToken) {
      this.setAuthToken(data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
    }

    return data;
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const response = await this.post<{ accessToken: string; refreshToken: string }>('/auth/refresh-token', {
        refreshToken,
      });

      const data = response.data;
      this.setAuthToken(data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data;
    } catch {
      this.clearAuthToken();
      return null;
    }
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await this.post('/auth/logout', { refreshToken });
      } catch {
        // Ignore logout errors
      }
    }
    this.clearAuthToken();
  }

  async getCurrentUser(): Promise<any> {
    const response = await this.get<{ user: any }>('/auth/me');
    return response.data.user;
  }

  // ============================================================
  // CALENDAR ENDPOINTS
  // ============================================================

  async getSchedule(date: string): Promise<ApiResponse<Appointment[]>> {
    return this.get<Appointment[]>('/calendar', { date });
  }

  async getAppointment(id: number): Promise<ApiResponse<any>> {
    return this.get(`/calendar/${id}`);
  }

  async createAppointment(data: any): Promise<ApiResponse<any>> {
    return this.post('/calendar', data);
  }

  async updateAppointment(id: number, data: any): Promise<ApiResponse<any>> {
    return this.put(`/calendar/${id}`, data);
  }

  async recordPayment(appointmentId: number, paidAmount: number, paymentMethod: string): Promise<ApiResponse<any>> {
    return this.post('/calendar/payment', { appointmentId, paidAmount, paymentMethod });
  }

  async getPendingPayments(): Promise<ApiResponse<any[]>> {
    return this.get('/calendar/pending-payments');
  }

  // ============================================================
  // CUSTOMER ENDPOINTS
  // ============================================================

  async getCustomers(search = ''): Promise<ApiResponse<CustomerListItem[]>> {
    return this.get<CustomerListItem[]>('/customers', search ? { search } : undefined);
  }

  async getCustomerDetails(id: number): Promise<ApiResponse<CustomerDetails>> {
    return this.get<CustomerDetails>(`/customers/${id}`);
  }

  async getCustomerHistory(id: number): Promise<ApiResponse<CustomerVisit[]>> {
    return this.get<CustomerVisit[]>(`/customers/${id}/history`);
  }

  async createCustomer(data: any): Promise<ApiResponse<any>> {
    return this.post('/customers', data);
  }

  async updateCustomer(id: number, data: any): Promise<ApiResponse<any>> {
    return this.put(`/customers/${id}`, data);
  }

  async deleteCustomer(id: number): Promise<ApiResponse<void>> {
    return this.delete(`/customers/${id}`);
  }

  async getTopCustomers(limit = 10): Promise<ApiResponse<any[]>> {
    return this.get('/customers/top', { limit });
  }

  async getRecentCustomers(limit = 10): Promise<ApiResponse<any[]>> {
    return this.get('/customers/recent', { limit });
  }

  async uploadImage(profileImage: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', profileImage);
    return this.post<{ url: string }>('/upload', formData);
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
  ): Promise<ApiResponse<CustomerPackage[]>> {
    return this.get<CustomerPackage[]>(`/customers/${customerId}/packages`, options);
  }

  async getCustomerPackageById(id: number): Promise<ApiResponse<CustomerPackage>> {
    return this.get<CustomerPackage>(`/customers/packages/${id}`);
  }

  async assignPackageToCustomer(data: {
    customerId: number;
    packageId: number;
    customPrice?: number;
    paymentMethod?: string;
    notes?: string;
    expiryDate?: string;
  }): Promise<ApiResponse<any>> {
    return this.post('/customers/packages/assign', data);
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
  ): Promise<ApiResponse<CustomerPackage>> {
    return this.put<CustomerPackage>(`/customers/packages/${id}`, data);
  }

  // ============================================================
  // PACKAGE ENDPOINTS
  // ============================================================

  async getPackages(includeInactive = false): Promise<ApiResponse<PackageModel[]>> {
    return this.get<PackageModel[]>('/packages', { includeInactive });
  }

  async getPackage(id: number): Promise<ApiResponse<PackageModel>> {
    return this.get<PackageModel>(`/packages/${id}`);
  }

  async createPackage(data: PackageFormData): Promise<ApiResponse<PackageModel>> {
    return this.post<PackageModel>('/packages', data);
  }

  async updatePackage(id: number, data: Partial<PackageFormData>): Promise<ApiResponse<PackageModel>> {
    return this.put<PackageModel>(`/packages/${id}`, data);
  }

  async deletePackage(id: number): Promise<ApiResponse<void>> {
    return this.delete(`/packages/${id}`);
  }

  async getPackageStats(): Promise<ApiResponse<PackageStats>> {
    return this.get<PackageStats>('/packages/stats');
  }

  async getPopularPackages(limit = 5): Promise<ApiResponse<PopularPackage[]>> {
    return this.get<PopularPackage[]>('/packages/popular', { limit });
  }

  // ============================================================
  // STAFF ENDPOINTS
  // ============================================================

  async getStaff(onlyActive = false, withStats = false): Promise<ApiResponse<StaffMember[]>> {
    return this.get<StaffMember[]>('/staff', {
      active: onlyActive ? 'true' : undefined,
      stats: withStats ? 'true' : undefined,
    });
  }

  async getStaffDetailsWithStats(id: number): Promise<ApiResponse<StaffMember>> {
    return this.get<StaffMember>(`/staff/${id}`, { stats: 'true' })
  }
  async getStaffDetails(id: number): Promise<ApiResponse<StaffDetails>> {
    return this.get<StaffDetails>(`/staff/${id}`);
  }
  

  async getStaffStats(): Promise<ApiResponse<StaffStats>> {
    return this.get<StaffStats>('/staff/stats');
  }

  async getTopStaff(limit = 5): Promise<ApiResponse<TopStaff[]>> {
    return this.get<TopStaff[]>('/staff/top', { limit });
  }

  async getStaffSchedule(staffId: number): Promise<ApiResponse<StaffSchedule[]>> {
    return this.get<StaffSchedule[]>(`/staff/${staffId}/schedule`);
  }

  async createStaff(data: any): Promise<ApiResponse<StaffMember>> {
    return this.post<StaffMember>('/staff', data);
  }

  async updateStaff(id: number, data: any): Promise<ApiResponse<StaffMember>> {
    return this.put<StaffMember>(`/staff/${id}`, data);
  }

  async deleteStaff(id: number): Promise<ApiResponse<void>> {
    return this.delete(`/staff/${id}`);
  }

  // ============================================================
  // SERVICE ENDPOINTS
  // ============================================================

  async getBookingServices(includeInactive = false): Promise<ApiResponse<BookingServiceItem[]>> {
    return this.get<BookingServiceItem[]>('/services', { includeInactive });
  }

  async getAllServices(): Promise<ApiResponse<KeyValuePair[]>> {
    return this.get<KeyValuePair[]>('/staff/services');
  }

  async getService(id: number): Promise<ApiResponse<BookingServiceItem>> {
    return this.get<BookingServiceItem>(`/services/${id}`);
  }

  async getServiceCategories(): Promise<ApiResponse<string[]>> {
    return this.get<string[]>('/services/categories');
  }

  async getServicesByCategory(category: string): Promise<ApiResponse<BookingServiceItem[]>> {
    return this.get<BookingServiceItem[]>(`/services/category/${encodeURIComponent(category)}`);
  }

  async getAllDesignations(): Promise<ApiResponse<KeyValuePair[]>> {
    return this.get<KeyValuePair[]>('/staff/designations');
  }

  async createService(data: any): Promise<ApiResponse<BookingServiceItem>> {
    return this.post<BookingServiceItem>('/services', data);
  }

  async updateService(id: number, data: any): Promise<ApiResponse<BookingServiceItem>> {
    return this.put<BookingServiceItem>(`/services/${id}`, data);
  }

  async deleteService(id: number): Promise<ApiResponse<void>> {
    return this.delete(`/services/${id}`);
  }

  // ============================================================
  // DASHBOARD ENDPOINTS
  // ============================================================

  async getDashboardStats(date: string): Promise<ApiResponse<DashboardMetric[]>> {
    return this.get<DashboardMetric[]>('/dashboard/stats', { date });
  }

  async getDashboardRevenue(date: string): Promise<ApiResponse<Revenue[]>> {
    return this.get<Revenue[]>('/dashboard/revenue', { date });
  }
}

export const apiService = new ApiService();
export const api = apiService;