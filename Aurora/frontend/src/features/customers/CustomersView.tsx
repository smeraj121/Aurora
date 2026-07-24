import { useState, useEffect } from 'react';
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
  UserPlus,
  Package,
  Clock,
  User,
  Edit2,
  Trash2,
  Plus,
  Gift,
} from 'lucide-react';
import type {
  CustomerDetails,
  CustomerVisit,
  CustomerPackage,
  CustomerListItem
} from '../../shared/types/domain';
import { api } from '../../services/api';
import { cn, formatCurrency } from '../../lib/utils';
import { AddCustomerDrawer } from './components/AddCustomerDrawer';
import { EditCustomerDrawer } from './components/EditCustomerDrawer';
import { NewBookingModal } from '../bookingModal/NewBookingModal';
import { AssignPackageModal } from '../packages/components/AssignPackageModal';
import { EditCustomerPackageModal } from '../packages/components/EditCustomerPackageModal';
import type { BookingFormData } from '../../shared/types/booking';

export function CustomersView() {
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAssignPackageModalOpen, setIsAssignPackageModalOpen] = useState(false);
  const [isEditPackageModalOpen, setIsEditPackageModalOpen] = useState(false);
  const [editingCustomerPackage, setEditingCustomerPackage] = useState<CustomerPackage | null>(null);
  const [packageFilter, setPackageFilter] = useState<'all' | 'active' | 'expired' | 'inactive'>('active');
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
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      loadCustomers(value);
    }, 300);
    
    setSearchTimeout(timeout);
  };

  const handleAddCustomer = async (customer: any) => {
    try {
      const { data } = await api.createCustomer(customer);
      await loadCustomers(searchTerm);
      
      if (data?.id) {
        await loadCustomer(data.id);
      }
      
      setIsAddDrawerOpen(false);
    } catch (error) {
      console.error('Failed to add customer:', error);
    }
  };

  const handleEditCustomer = async (customer: Partial<CustomerDetails>) => {
    try {
      const { data } = await api.updateCustomer(selectedCustomer!.id, customer);
      await loadCustomers(searchTerm);
      
      if (data?.id) {
        await loadCustomer(data.id);
      }
      
      setIsEditDrawerOpen(false);
    } catch (error) {
      console.error('Failed to update customer:', error);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedCustomer.fullName}?`)) {
      try {
        await api.deleteCustomer(selectedCustomer.id);
        await loadCustomers(searchTerm);
        setSelectedCustomer(null);
      } catch (error) {
        console.error('Failed to delete customer:', error);
        alert('Failed to delete customer. They may have existing appointments.');
      }
    }
  };

  // ============================================================
  // BOOKING HANDLERS
  // ============================================================
  const handleOpenBookingModal = () => {
    if (!selectedCustomer) {
      alert('Please select a customer first');
      return;
    }
    setIsBookingModalOpen(true);
  };

  const handleSaveAppointment = async (bookingData: any) => {
    try {
      const dataToSave = {
        ...bookingData,
        customerId: selectedCustomer?.id || bookingData.customerId,
        customerName: selectedCustomer?.fullName || bookingData.customerName,
        phone: selectedCustomer?.phone || bookingData.phone,
      };
      
      await api.createAppointment(dataToSave);
      setIsBookingModalOpen(false);
      
      if (selectedCustomer) {
        await loadCustomer(selectedCustomer.id);
      }
      
      alert('Appointment booked successfully!');
    } catch (error) {
      console.error('Failed to book appointment:', error);
      alert('Failed to book appointment. Please try again.');
    }
  };

  // ============================================================
  // PACKAGE ASSIGNMENT HANDLERS
  // ============================================================
  const handleOpenAssignPackageModal = () => {
    if (!selectedCustomer) {
      alert('Please select a customer first');
      return;
    }
    setIsAssignPackageModalOpen(true);
  };

  const handleAssignPackage = async (data: any) => {
    try {
      await api.assignPackageToCustomer({
        customerId: selectedCustomer!.id,
        packageId: data.packageId,
        customPrice: data.customPrice,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        expiryDate: data.expiryDate,
      });
      
      if (selectedCustomer) {
        await loadCustomer(selectedCustomer.id);
      }
      
      setIsAssignPackageModalOpen(false);
    } catch (error) {
      console.error('Failed to assign package:', error);
      throw error;
    }
  };

  // ============================================================
  // PACKAGE EDIT/STATUS HANDLERS
  // ============================================================
  const handleEditPackage = (pkg: CustomerPackage) => {
    setEditingCustomerPackage(pkg);
    setIsEditPackageModalOpen(true);
  };

  const handleUpdateCustomerPackage = async (data: any) => {
    try {
      await api.updateCustomerPackage(editingCustomerPackage!.id, data);
      if (selectedCustomer) {
        await loadCustomer(selectedCustomer.id);
      }
      setIsEditPackageModalOpen(false);
      setEditingCustomerPackage(null);
    } catch (error) {
      console.error('Failed to update package:', error);
      throw error;
    }
  };

  const handleUpdatePackageStatus = async (packageId: number, status: string) => {
    const action = status === 'active' ? 'reactivate' : 'deactivate';
    if (!confirm(`Are you sure you want to ${action} this package?`)) return;
    
    try {
      await api.updateCustomerPackageStatus(packageId, status);
      if (selectedCustomer) {
        await loadCustomer(selectedCustomer.id);
      }
      alert(`Package ${action}d successfully`);
    } catch (error) {
      console.error('Failed to update package status:', error);
      alert('Failed to update package status');
    }
  };

  const handleExtendPackage = async (pkg: CustomerPackage) => {
    const currentExpiry = pkg.expiryDate ? new Date(pkg.expiryDate) : new Date();
    const defaultDate = currentExpiry > new Date() 
      ? currentExpiry.toISOString().split('T')[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const newExpiry = prompt('Enter new expiry date (YYYY-MM-DD):', defaultDate);
    if (!newExpiry) return;
    
    if (new Date(newExpiry) < new Date()) {
      alert('Expiry date must be in the future');
      return;
    }
    
    try {
      await api.extendPackageExpiry(pkg.id, newExpiry);
      if (selectedCustomer) {
        await loadCustomer(selectedCustomer.id);
      }
      alert('Package expiry extended successfully');
    } catch (error) {
      console.error('Failed to extend package:', error);
      alert('Failed to extend package expiry');
    }
  };
    const getAvatarUrl = (customer: { fullName: string; avatar?: string | null }) => {
    if (customer.avatar) return customer.avatar;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-violet-100 text-violet-700';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'in_progress':
        return 'bg-purple-100 text-purple-700';
      case 'completed':
        return 'bg-emerald-100 text-emerald-700';
      case 'cancelled':
        return 'bg-rose-100 text-rose-700';
      case 'no_show':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getPaymentStatusBadge = (status?: string) => {
    switch (status) {
      case 'paid':
        return <span className="text-[10px] font-medium bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Paid</span>;
      case 'partial':
        return <span className="text-[10px] font-medium bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Partial</span>;
      case 'pending':
        return <span className="text-[10px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Pending</span>;
      case 'refunded':
        return <span className="text-[10px] font-medium bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">Refunded</span>;
      default:
        return null;
    }
  };

  // ============================================================
  // GET BOOKING INITIAL DATA - NEW
  // ============================================================
  const getBookingInitialData = (): any => {
    if (!selectedCustomer) return undefined;
    
    return {
      id: '',
      date: new Date().toISOString().split('T')[0],
      customerId: String(selectedCustomer.id),
      customerName: selectedCustomer.fullName,
      phone: selectedCustomer.phone,
      serviceName: '',
      staffId: '',
      staffName: '',
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      durationMinutes: 30,
      status: 'scheduled',
      amount: 0,
      availablePackages: selectedCustomer.packages || [],
    };
  };
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-900/20 transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Customer</span>
          </button>
        </div>
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
            ) : customers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-sm text-slate-500 p-8">
                <User className="w-12 h-12 text-slate-300 mb-3" />
                <p className="font-semibold text-slate-600">No customers found</p>
                <p className="text-xs mt-1">Try adjusting your search or add a new customer</p>
              </div>
            ) : (
              customers.map((customer) => {
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
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </p>
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

                  {/* Action Buttons - UPDATED with Assign Package */}
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    <button
                      onClick={handleOpenBookingModal}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Book</span>
                    </button>
                    <button
                      onClick={handleOpenAssignPackageModal}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Assign Package</span>
                    </button>
                    <button
                      onClick={() => setIsEditDrawerOpen(true)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                      title="Edit Customer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleDeleteCustomer}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
                      <MessageSquare className="w-4 h-4" />
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
                    {selectedCustomer.totalPaid !== undefined && selectedCustomer.totalPaid > 0 && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Paid: {formatCurrency(selectedCustomer.totalPaid)}
                        {selectedCustomer.balanceDue !== undefined && selectedCustomer.balanceDue > 0 && (
                          <span className="text-amber-600 ml-1">
                            Balance: {formatCurrency(selectedCustomer.balanceDue)}
                          </span>
                        )}
                      </p>
                    )}
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

                {/* Active Packages - UPDATED with Add Package button */}
                {selectedCustomer.packages && selectedCustomer.packages.length > 0 ? (
                  <div className="mb-4 p-3.5 rounded-xl bg-purple-50/50 border border-purple-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-purple-900">
                        <Package className="w-4 h-4 text-purple-600" />
                        <span>Active Packages ({selectedCustomer.packages.length})</span>
                      </div>
                      <button
                        onClick={handleOpenAssignPackageModal}
                        className="text-[10px] font-medium text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add Package
                      </button>
                    </div>
                    <div className="space-y-2 mt-2">
                      {selectedCustomer.packages.map((pkg) => (
                        <div key={pkg.id} className="flex items-center justify-between text-xs bg-white/60 rounded-lg px-3 py-2">
                          <div>
                            <span className="font-medium text-purple-800">{pkg.packageName}</span>
                            {pkg.customPrice && pkg.customPrice < pkg.totalPrice && (
                              <span className="ml-2 text-[10px] text-emerald-600 font-medium">
                                (Custom: {formatCurrency(pkg.customPrice)})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-purple-600">
                              {pkg.usedSessions}/{pkg.totalSessions} used
                              {pkg.remainingSessions > 0 && (
                                <span className="ml-2 text-emerald-600 font-bold">
                                  {pkg.remainingSessions} left
                                </span>
                              )}
                            </span>
                            <button
                              onClick={() => handleEditPackage(pkg)}
                              className="text-slate-400 hover:text-purple-600 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Show empty state with Add Package button */
                  <div className="mb-4 p-3.5 rounded-xl bg-slate-50/50 border border-slate-200 border-dashed">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>No active packages</span>
                      </div>
                      <button
                        onClick={handleOpenAssignPackageModal}
                        className="text-[10px] font-medium text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Assign Package
                      </button>
                    </div>
                  </div>
                )}

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
                    {selectedCustomer.history.map((item: CustomerVisit) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {item.services && item.services.length > 0
                                  ? item.services.map((s: any) => s.serviceName).join(', ')
                                  : item.serviceName}
                              </h4>
                              <span className={cn(
                                'text-[10px] font-medium px-1.5 py-0.5 rounded',
                                getStatusColor(item.status)
                              )}>
                                {item.status}
                              </span>
                              {item.isPackageAppointment && (
                                <span className="text-[10px] font-medium bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <Package className="w-3 h-3" />
                                  Package
                                </span>
                              )}
                              {getPaymentStatusBadge(item.paymentStatus)}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1 truncate">
                              Served by <span className="font-semibold text-slate-700">{item.staffName || 'N/A'}</span>
                              {item.packageName && (
                                <span className="ml-2 text-purple-600">📦 {item.packageName}</span>
                              )}
                            </p>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(item.appointmentDate)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(item.startTime)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-3">
                            <p className="text-xs font-bold text-slate-900">
                              {formatCurrency(item.amount)}
                            </p>
                            {item.paidAmount !== undefined && item.paidAmount < item.amount && (
                              <p className="text-[10px] text-amber-600">
                                Balance: {formatCurrency(item.amount - item.paidAmount)}
                              </p>
                            )}
                            {item.paidAmount !== undefined && item.paidAmount >= item.amount && (
                              <p className="text-[10px] text-emerald-600 font-medium">Paid in full</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm text-slate-500">
                    <History className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p>No visit history available</p>
                    <p className="text-xs mt-1">
                      <button
                        onClick={handleOpenBookingModal}
                        className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
                      >
                        Book an appointment
                      </button>
                      {' '}to get started
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center">
              <div className="text-slate-400 text-sm">
                <User className="w-12 h-12 mx-auto text-slate-300 mb-3" />
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

      {/* Edit Customer Drawer */}
      {selectedCustomer && (
        <EditCustomerDrawer
          isOpen={isEditDrawerOpen}
          onClose={() => setIsEditDrawerOpen(false)}
          customer={selectedCustomer}
          onUpdateCustomer={handleEditCustomer}
        />
      )}

      {/* New Booking Modal */}
      <NewBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSave={handleSaveAppointment}
        initialData={getBookingInitialData()}
      />

      {/* Assign Package Modal - NEW */}
      {selectedCustomer && (
        <AssignPackageModal
          isOpen={isAssignPackageModalOpen}
          onClose={() => setIsAssignPackageModalOpen(false)}
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.fullName}
          onAssign={handleAssignPackage}
        />
      )}

      {editingCustomerPackage && (
        <EditCustomerPackageModal
          isOpen={isEditPackageModalOpen}
          onClose={() => {
            setIsEditPackageModalOpen(false);
            setEditingCustomerPackage(null);
          }}
          customerPackage={editingCustomerPackage}
          onUpdate={handleUpdateCustomerPackage}
        />
      )}
    </div>
  );
}