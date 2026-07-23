import { useState, useEffect, type JSXElementConstructor, type Key, type ReactElement, type ReactNode, type ReactPortal } from 'react';
import {
  Search,
  Phone,
  Mail,
  Crown,
  Calendar,
  IndianRupee,
  History,
  MessageSquare,
  Sparkles,
  ChevronRight,
  UserPlus,
} from 'lucide-react';
import type { CustomerDetails } from '../../shared/types/domain';
import { api } from '../../services/api';
import { cn, formatCurrency } from '../../lib/utils';
import { AddCustomerDrawer } from './components/AddCustomerDrawer';

export function CustomersView() {
  const [customers, setCustomers] = useState<CustomerDetails[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Load initial customers
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async (search?: string) => {
    try {
      setLoading(true);
      const { data } = await api.getCustomers(search || '');
      setCustomers(data || []);
      
      // Select first customer if available and no customer is selected
      if (data.length > 0 && !selectedCustomer) {
        loadCustomer(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomer = async (id: number) => {
    try {
      const { data } = await api.getCustomerDetails(id);
      setSelectedCustomer(data || null);
    } catch (error) {
      console.error('Failed to load customer details:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    
    // Debounce search
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      loadCustomers(value);
    }, 300);
    
    setSearchTimeout(timeout);
  };

  const handleAddCustomer = async (
    customer: Omit<CustomerDetails, 'id' | 'totalVisits' | 'totalSpent' | 'averageTicket' | 'history' | 'vipTag'>
  ) => {
    try {
      const { data } = await api.createCustomer(customer);
      await loadCustomers(searchTerm);
      
      // Select the newly created customer
      if (data?.data?.id) {
        await loadCustomer(data.data.id);
      }
      
      setIsAddDrawerOpen(false);
    } catch (error) {
      console.error('Failed to add customer:', error);
    }
  };

  const getAvatarUrl = (customer: CustomerDetails) => {
    if (customer.avatar) return customer.avatar;
    // Generate avatar from initials if no avatar provided
    const initials = customer.fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=8B5CF6&color=fff&size=64`;
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return 'N/A';
    try {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Customer Directory & CRM
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage client profiles, lifetime spending & visit history
          </p>
        </div>

        <button
          onClick={() => setIsAddDrawerOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-900/20 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* 2-Column CRM Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customer Directory List */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[680px]">
          {/* Search Box Header */}
          <div className="p-4 border-b border-slate-200/80 bg-slate-50/50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 shadow-xs"
              />
            </div>
          </div>

          {/* Customer Item List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-slate-500">
                No customers found
              </div>
            ) : (
              filteredCustomers.map((customer) => {
                const isSelected = customer.id === selectedCustomer?.id;
                return (
                  <div
                    key={customer.id}
                    onClick={() => loadCustomer(customer.id)}
                    className={cn(
                      'p-4 cursor-pointer transition-all flex items-center justify-between group',
                      isSelected
                        ? 'bg-purple-50/60 border-l-4 border-purple-600'
                        : 'hover:bg-slate-50/80'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={getAvatarUrl(customer)}
                        alt={customer.fullName}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/20 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-purple-900 transition-colors">
                            {customer.fullName}
                          </h4>
                          {customer.isVip && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full flex-shrink-0">
                              <Crown className="w-2.5 h-2.5 fill-amber-500" />
                              VIP
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{customer.phone}</p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-xs font-bold text-slate-900">
                        {formatCurrency(customer.totalSpent)}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {customer.totalVisits} visits
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Customer Profile Details */}
        <div className="lg:col-span-7 space-y-6">
          {selectedCustomer ? (
            <>
              {/* Main Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                {/* Header Profile Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={getAvatarUrl(selectedCustomer)}
                      alt={selectedCustomer.fullName}
                      className="w-16 h-16 rounded-2xl object-cover ring-4 ring-purple-500/10 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-bold text-slate-900 truncate">
                          {selectedCustomer.fullName}
                        </h2>
                        {selectedCustomer.isVip && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex-shrink-0">
                            <Crown className="w-3 h-3 fill-amber-500" />
                            VIP Client
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {selectedCustomer.phone}
                        </span>
                        {selectedCustomer.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {selectedCustomer.email}
                          </span>
                        )}
                        {selectedCustomer.lastVisitDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            Last visit: {formatDate(selectedCustomer.lastVisitDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button className="px-3 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors shadow-xs whitespace-nowrap">
                      Book Service
                    </button>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-4 my-6">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
                      <IndianRupee className="w-3.5 h-3.5 text-purple-600" />
                      <span>Lifetime Value</span>
                    </div>
                    <p className="text-lg font-extrabold text-slate-900 mt-1">
                      {formatCurrency(selectedCustomer.totalSpent)}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-purple-600" />
                      <span>Total Visits</span>
                    </div>
                    <p className="text-lg font-extrabold text-slate-900 mt-1">
                      {selectedCustomer.totalVisits} Times
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Avg. Ticket Size</span>
                    </div>
                    <p className="text-lg font-extrabold text-slate-900 mt-1">
                      {formatCurrency(selectedCustomer.averageTicket)}
                    </p>
                  </div>
                </div>

                {/* Notes Section */}
                {selectedCustomer.notes && (
                  <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-purple-900">
                    <span className="font-bold block mb-0.5">Preferences & Notes:</span>
                    {selectedCustomer.notes}
                  </div>
                )}
              </div>

              {/* Visit History Timeline */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <History className="w-4 h-4 text-purple-600" />
                  Visit History ({selectedCustomer.history?.length || 0})
                </h3>

                {selectedCustomer.history && selectedCustomer.history.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {selectedCustomer.history.map((item: { id: Key | null | undefined; serviceName: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; staffName: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; appointmentDate: string | null | undefined; startTime: string | undefined; amount: number; }) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                            ✓
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {item.serviceName}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                              Served by <span className="font-semibold text-slate-700">{item.staffName}</span> • {formatDate(item.appointmentDate)} at {formatTime(item.startTime)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                          <span className="text-xs font-bold text-slate-900">
                            {formatCurrency(item.amount)}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm text-slate-500">
                    No visit history available
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center">
              <div className="text-slate-400 text-sm">
                <UserPlus className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="font-semibold text-slate-600">Select a customer</p>
                <p className="text-xs mt-1">Choose a customer from the list to view their details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Drawer */}
      <AddCustomerDrawer
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        onAddCustomer={handleAddCustomer}
      />
    </div>
  );
}