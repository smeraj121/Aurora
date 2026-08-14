import { 
  Package,
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Settings, 
  CalendarRange
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}
const STAFF_NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Calendar',
    path: '/calendar',
    icon: CalendarRange,
  },
  {
    label: 'Customers',
    path: '/customers',
    icon: Users,
  },
  {
    label: 'Staff',
    path: '/staff',
    icon: UserCheck,
  },
  {
    label: 'Packages',
    path: '/packages',
    icon: Package,
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
  },

  // Enable later
  // {
  //   label: 'Reports',
  //   path: '/reports',
  //   icon: BarChart3,
  // },
  // {
  //   label: 'AI Assistant',
  //   path: '/ai-assistant',
  //   icon: Sparkles,
  //   badge: 'New',
  // },
];

const CUSTOMER_NAV_ITEMS: NavItem[] = [
  {
    label: 'Calendar',
    path: '/calendar',
    icon: CalendarRange,
  },
];

const SUPER_ADMIN_NAV_ITEMS: NavItem[] = [
  {
    label: 'Tenants',
    path: '/tenants',
    icon: Users,
  },
];

export function getNavItems(systemRole?: string): NavItem[] {
  if (systemRole === 'Customer') {
    return CUSTOMER_NAV_ITEMS;
  }

  if (systemRole === 'SuperAdmin') {
    return SUPER_ADMIN_NAV_ITEMS;
  }

  return STAFF_NAV_ITEMS;
}

// export const NAV_ITEMS: NavItem[] = [
//   { label: 'Dashboard', path: '/', icon: LayoutDashboard },
//   //{ label: 'Appointments', path: '/appointments', icon: CalendarDays },
//   { label: 'Calendar', path: '/calendar', icon: CalendarRange },
//   { label: 'Customers', path: '/customers', icon: Users },
//   { label: 'Staff', path: '/staff', icon: UserCheck },
//   //{ label: 'Billing & Sales', path: '/billing', icon: CreditCard },
//   //{ label: 'Inventory', path: '/inventory', icon: Package },
//   //{ label: 'Marketing', path: '/marketing', icon: Megaphone },
//   //{ label: 'Reports', path: '/reports', icon: BarChart3 },
//   //{ label: 'AI Assistant', path: '/ai-assistant', icon: Sparkles, badge: 'New' },
//   { label: 'Settings', path: '/settings', icon: Settings },
//   { label: 'Packages', path: '/packages', icon: Package },
// ];