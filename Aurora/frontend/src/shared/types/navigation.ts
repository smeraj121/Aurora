import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  BarChart3, 
  Sparkles, 
  Settings, 
  CalendarRange
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  //{ label: 'Appointments', path: '/appointments', icon: CalendarDays },
  { label: 'Calendar', path: '/calendar', icon: CalendarRange },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Staff', path: '/staff', icon: UserCheck },
  //{ label: 'Billing & Sales', path: '/billing', icon: CreditCard },
  //{ label: 'Inventory', path: '/inventory', icon: Package },
  //{ label: 'Marketing', path: '/marketing', icon: Megaphone },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'AI Assistant', path: '/ai-assistant', icon: Sparkles, badge: 'New' },
  { label: 'Settings', path: '/settings', icon: Settings },
];