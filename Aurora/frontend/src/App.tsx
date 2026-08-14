import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AppLayout } from './components/layout/AppLayout';

import { DashboardView } from './features/dashboard/DashboardView';
import { CalendarView } from './features/calendar/CalendarView';
import { CustomersView } from './features/customers/CustomersView';
import { ReportsView } from './features/reports/ReportsView';
import { AIAssistantView } from './features/ai-assistant/AIAssistantView';
import { StaffView } from './features/staff/StaffView';
import { PackagesView } from './features/packages/PackagesView';
import { ProfileView } from './features/profile/ProfileView';
import { SettingsView } from './features/settings/SettingsView';

import { LoginPage } from './features/login/LoginPage';
import { TenantSelectionPage } from './features/login/TenantSelectionPage';
import { SuperAdminLoginPage } from './features/login/SuperAdminLoginPage';
import { TenantManagement } from './features/tenant/TenantManagement';

import { AuthProvider, useAuth } from './context/AuthContext';

function PlaceholderView({ title }: { title: string }) {
  return (
    <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
      <h3 className="text-xl font-bold text-slate-800">
        {title} Module
      </h3>

      <p className="text-sm text-slate-500 mt-1">
        This module will be built in upcoming steps.
      </p>
    </div>
  );
}

// ============================================================
// CUSTOMER ONLY
// ============================================================

function CustomerRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  if (user?.systemRole !== 'Customer') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// ============================================================
// STAFF / TENANT USER
//
// Everything except Customer and SuperAdmin is treated as a
// tenant/staff user for now.
// ============================================================

function StaffRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  if (
    !user ||
    user.systemRole === 'Customer' ||
    user.systemRole === 'SuperAdmin'
  ) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// ============================================================
// SUPER ADMIN
// ============================================================

function SuperAdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  if (user?.systemRole !== 'SuperAdmin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// ============================================================
// PROFILE
//
// Both Customer and Staff can access their own profile.
// ============================================================

function ProfileRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  if (!user || user.systemRole === 'SuperAdmin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// ============================================================
// APP ROUTES
// ============================================================

function AppRoutes() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>

      {/* ============================================================
          PUBLIC
          ============================================================ */}

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/super-admin-login"
        element={<SuperAdminLoginPage />}
      />

      <Route
        path="/select-tenant"
        element={<TenantSelectionPage />}
      />


      {/* ============================================================
          AUTHENTICATED
          ============================================================ */}

      {isAuthenticated ? (
        <Route path="/" element={<AppLayout />}>

          {/* ========================================================
              DEFAULT ROUTE
              ======================================================== */}

          <Route
            index
            element={
              user?.systemRole === 'Customer' ? (
                <Navigate to="/calendar" replace />
              ) : user?.systemRole === 'SuperAdmin' ? (
                <Navigate to="/tenants" replace />
              ) : (
                <DashboardView />
              )
            }
          />


          {/* ========================================================
              CUSTOMER
              ======================================================== */}

          <Route
            path="calendar"
            element={<CalendarView />}
          />

          <Route
            path="profile"
            element={
              <ProfileRoute>
                <ProfileView />
              </ProfileRoute>
            }
          />


          {/* ========================================================
              STAFF / TENANT USERS
              ======================================================== */}

          <Route
            path="customers"
            element={
              <StaffRoute>
                <CustomersView />
              </StaffRoute>
            }
          />

          <Route
            path="staff"
            element={
              <StaffRoute>
                <StaffView />
              </StaffRoute>
            }
          />

          <Route
            path="packages"
            element={
              <StaffRoute>
                <PackagesView />
              </StaffRoute>
            }
          />

          <Route
            path="settings"
            element={
              <StaffRoute>
                <SettingsView />
              </StaffRoute>
            }
          />

          <Route
            path="reports"
            element={
              <StaffRoute>
                <ReportsView />
              </StaffRoute>
            }
          />

          <Route
            path="ai-assistant"
            element={
              <StaffRoute>
                <AIAssistantView />
              </StaffRoute>
            }
          />

          <Route
            path="appointments"
            element={
              <StaffRoute>
                <PlaceholderView title="Appointments" />
              </StaffRoute>
            }
          />

          <Route
            path="billing"
            element={
              <StaffRoute>
                <PlaceholderView title="Billing & Sales" />
              </StaffRoute>
            }
          />

          <Route
            path="inventory"
            element={
              <StaffRoute>
                <PlaceholderView title="Inventory" />
              </StaffRoute>
            }
          />

          <Route
            path="marketing"
            element={
              <StaffRoute>
                <PlaceholderView title="Marketing" />
              </StaffRoute>
            }
          />


          {/* ========================================================
              SUPER ADMIN
              ======================================================== */}

          <Route
            path="tenants"
            element={
              <SuperAdminRoute>
                <TenantManagement />
              </SuperAdminRoute>
            }
          />


          {/* ========================================================
              FALLBACK
              ======================================================== */}

          <Route
            path="*"
            element={
              <Navigate
                to={
                  user?.systemRole === 'Customer'
                    ? '/calendar'
                    : user?.systemRole === 'SuperAdmin'
                      ? '/tenants'
                      : '/'
                }
                replace
              />
            }
          />

        </Route>
      ) : (

        /* ============================================================
           NOT AUTHENTICATED
           ============================================================ */

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      )}

    </Routes>
  );
}


// ============================================================
// ROOT APP
// ============================================================

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;