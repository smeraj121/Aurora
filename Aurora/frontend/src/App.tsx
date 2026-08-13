import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardView } from './features/dashboard/DashboardView';
import { CalendarView } from './features/calendar/CalendarView';
import { CustomersView } from './features/customers/CustomersView';
import { ReportsView } from './features/reports/ReportsView';
import { AIAssistantView } from './features/ai-assistant/AIAssistantView';
import { StaffView } from './features/staff/StaffView';
import { PackagesView } from './features/packages/PackagesView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './features/login/LoginPage';
import { TenantSelectionPage } from './features/login/TenantSelectionPage';
import { ProfileView } from './features/profile/ProfileView';

function PlaceholderView({ title }: { title: string }) {
  return (
    <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
      <h3 className="text-xl font-bold text-slate-800">{title} Module</h3>
      <p className="text-sm text-slate-500 mt-1">This module will be built in upcoming steps.</p>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* ============================================================
          PUBLIC ROUTES
          ============================================================ */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/select-tenant" element={<TenantSelectionPage />} />

      {/* ============================================================
          PROTECTED ROUTES
          ============================================================ */}
      {isAuthenticated ? (
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardView />} />
          <Route path="appointments" element={<PlaceholderView title="Appointments" />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="customers" element={<CustomersView />} />
          <Route path="staff" element={<StaffView />} />
          <Route path="billing" element={<PlaceholderView title="Billing & Sales" />} />
          <Route path="inventory" element={<PlaceholderView title="Inventory" />} />
          <Route path="marketing" element={<PlaceholderView title="Marketing" />} />
          <Route path="reports" element={<ReportsView />} />
          <Route path="ai-assistant" element={<AIAssistantView />} />
          <Route path="packages" element={<PackagesView />} />
          <Route path="settings" element={<PlaceholderView title="Settings" />} />
          <Route path="profile" element={<ProfileView />} />
        </Route>
      ) : (
        /* If not authenticated and not on a public route, redirect to login */
        <Route path="*" element={<Navigate to="/login" replace />} />
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
