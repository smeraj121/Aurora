// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiService } from '../services/api';
import type { User } from '../shared/types/common';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (verificationToken: string, tenantId?: number) => Promise<{ requiresTenantSelection: boolean; tenants?: any[] }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  superAdminLogin: (
  phone: string,
  pin: string
) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = apiService.getAuthToken();
      if (token) {
        try {
          const response = await apiService.getCurrentUser();
          if (response.success) {
            setUser(response.data);
          }
        } catch (error) {
          apiService.clearAuthToken();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // ============================================================
  // LOGIN
  // ============================================================

  async function login(verificationToken: string, tenantId?: number): Promise<{ requiresTenantSelection: boolean; tenants?: any[] }> {
    const result = await apiService.login(verificationToken, tenantId);

    if (result.requiresTenantSelection) {
      // User has multiple tenants - wait for selection
      return {
        requiresTenantSelection: true,
        tenants: result.tenants,
      };
    }

    // Single tenant - user is fully logged in
    setUser(result.user);
    return { requiresTenantSelection: false };
  }

  // ============================================================
  // LOGOUT
  // ============================================================

  async function logout(): Promise<void> {
    try {
      await apiService.logout();
    } finally {
      setUser(null);
    }
  }

  // ============================================================
  // REFRESH USER
  // ============================================================

  async function refreshUser(): Promise<void> {
    try {
      const response = await apiService.getCurrentUser();
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      setUser(null);
    }
  }
  
  async function superAdminLogin(
  phone: string,
  pin: string
): Promise<void> {
  const result = await apiService.superAdminLogin(
    phone,
    pin
  );

  if (!result.success) {
    throw new Error(
      result.message || 'Invalid credentials.'
    );
  }
    apiService.setAuthToken(result.data.accessToken);

  setUser(result.data.user);
}

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
        superAdminLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}