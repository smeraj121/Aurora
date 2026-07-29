// src/services/api.service.ts

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
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers as Record<string, string> || {}),
      },
    });

    let data: any;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      // Handle 401 - token expired
      if (response.status === 401) {
        // Try to refresh token if we have a refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const refreshed = await this.refreshToken(refreshToken);
            if (refreshed) {
              // Retry the original request with new token
              return this.request<T>(endpoint, options, query);
            }
          } catch {
            // Refresh failed - logout
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
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ============================================================
  // AUTH METHODS (calls backend directly)
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
}

export const apiService = new ApiService();