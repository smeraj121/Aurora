// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiService } from '../services/api';

interface User {
  id: number;
  fullName: string;
  phone: string;
  email?: string;
  systemRole: string;
  tenantId?: number;
  profileImageUrl?: string;
  preferredLanguage?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (verificationToken: string, tenantId?: number) => Promise<{ requiresTenantSelection: boolean; tenants?: any[] }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
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
          const userData = await apiService.getCurrentUser();
          setUser(userData);
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
    await apiService.logout();
    setUser(null);
  }

  // ============================================================
  // REFRESH USER
  // ============================================================

  async function refreshUser(): Promise<void> {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
    }
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