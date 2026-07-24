import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardView } from './features/dashboard/DashboardView';
import { CalendarView } from './features/calendar/CalendarView';
import { CustomersView } from './features/customers/CustomersView';
import { ReportsView } from './features/reports/ReportsView';
import { AIAssistantView } from './features/ai-assistant/AIAssistantView';
import { StaffView } from './features/staff/StaffView';
import { PackagesView } from './features/packages/PackagesView';

function PlaceholderView({ title }: { title: string }) {
  return (
    <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
      <h2 className="text-xl font-bold text-slate-800">{title} Module</h2>
      <p className="text-sm text-slate-500 mt-1">This module will be built in upcoming steps.</p>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
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
          <Route path="ai-assistant" element={ <AIAssistantView /> } />
          <Route path="packages" element={<PackagesView />} />
          <Route path="settings" element={<PlaceholderView title="Settings" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;