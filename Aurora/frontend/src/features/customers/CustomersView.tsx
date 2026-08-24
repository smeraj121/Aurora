import { useState, useEffect } from 'react';
import {
  Search,
  Phone,
  Mail,
  Crown,
  Calendar,
  IndianRupee,
  History,
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

import { AssignPackageModal } from '../packages/components/AssignPackageModal';
import { EditCustomerPackageModal } from '../packages/components/EditCustomerPackageModal';
import { cn, formatCurrency } from '../../lib/utils';
import { api } from '../../services/api';
import { BookingModal } from '../bookingModal/BookingModal';
import type { CustomerPackage } from '../../types/customerpackage.types';
import { CustomerModal } from './components/CustomerModal';
import type { CustomerListItem, CustomerDetails, CustomerVisit } from '../../types/customer.types';
import { SEARCH_DEBOUNCE_MS } from '../../shared/constants/common';
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback';

export function CustomersView() {
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAssignPackageModalOpen, setIsAssignPackageModalOpen] = useState(false);
  const [isEditPackageModalOpen, setIsEditPackageModalOpen] = useState(false);
  const [editingCustomerPackage, setEditingCustomerPackage] = useState<CustomerPackage | null>(null);
  const [appointmentId, setAppointmentId] = useState<number | null>(null);
  const [pageLoading, setLoading] = useState(true);
  // Load initial customers
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async (search?: string) => {
    try {
      setLoading(true);
      const { data } = await api.getCustomers(search || '');
      setCustomers(data || []);

      if (data && data.length > 0 && !selectedCustomer) {
        loadCustomer(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load customers', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomer = async (id: number) => {
    try {
      const { data } = await api.getCustomerDetails(id);
      setSelectedCustomer(data || null);
    } catch (error) {
      console.error('Failed to load customer details', error);
    }
  };

  const runSearch = useDebouncedCallback((value: string) => {
  loadCustomers(value);
}, SEARCH_DEBOUNCE_MS);

const handleSearch = (value: string) => {
  setSearchTerm(value);
  runSearch(value);
};

  // Open modal for adding a new customer
  const openAddCustomer = () => {
    setEditingCustomer(null);
    setIsCustomerModalOpen(true);
  };

  // Open modal for editing an existing customer
  const openEditCustomer = (customer: any) => {
    setEditingCustomer(customer);
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = async (data: any) => {
    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.id, data);
      } else {
        await api.createCustomer(data);
      }
      //setSearchTerm('');
      //loadCustomers();
      handleSearch('');
    } catch (error) {
      throw error; // Let the modal handle the error
    }
  };
  const handleDeactivateCustomer = async (customerId: number) => {
    await api.deleteCustomer(customerId);
    // Refresh list
  };

  // ============================================================
  // BOOKING HANDLERS
  // ============================================================
  const handleOpenBookingModal = (id: number | null = null) => {
    if (!selectedCustomer) {
      alert('Please select a customer first');
      return;
    }
    setIsBookingModalOpen(true);
    setAppointmentId(id);
  };

  const handleSaveAppointment = async (bookingData: any) => {
  try {
    const dataToSave = {
      ...bookingData,
      customerId: selectedCustomer?.id || bookingData.customerId,
      customerName: selectedCustomer?.fullName || bookingData.customerName,
      phone: selectedCustomer?.phone || bookingData.phone,
    };

    const response = appointmentId
      ? await api.updateAppointment(appointmentId, dataToSave)
      : await api.createAppointment(dataToSave);

    if (!response.success) {
      throw new Error(
        response.message || 'Failed to save appointment.'
      );
    }

    setIsBookingModalOpen(false);
    setAppointmentId(null);

    if (selectedCustomer) {
      await loadCustomer(selectedCustomer.id);
    }

    alert('Appointment saved successfully!');
  } catch (error: any) {
    console.error('Failed to save appointment', error);
    alert(error.message || 'Failed to save appointment.');
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
      console.error('Failed to assign package', error);
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
      console.error('Failed to update package', error);
      throw error;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'NA';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return 'NA';
    try {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || '';
    switch (s) {
      case 'completed':
        return <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full capitalize">Completed</span>;
      case 'cancelled':
        return <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-full capitalize">Cancelled</span>;
      case 'scheduled':
        return <span className="text-[10px] font-semibold text-violet-700 bg-violet-50 border border-violet-200/60 px-2 py-0.5 rounded-full capitalize">Scheduled</span>;
      case 'confirmed':
        return <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full capitalize">Confirmed</span>;
      case 'in_progress':
        return <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200/60 px-2 py-0.5 rounded-full capitalize">In Progress</span>;
      default:
        return <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-full capitalize">{(status || '').replace('_', ' ')}</span>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'paid':
        return <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">Paid</span>;
      case 'partial':
        return <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/50">Partial</span>;
      case 'pending':
        return <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">Pending</span>;
      case 'refunded':
        return <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/50">Refunded</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-8">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Customer Directory & CRM
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage client profiles, lifetime spending & visit history
          </p>
        </div>

        <button
          onClick={() => openAddCustomer()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-xs font-semibold shadow-xs transition-all shrink-0 self-start sm:self-auto"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* 2-Column CRM Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Customer Directory List */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[720px]">
          {/* Search Box Header */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Customer Item List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100/80">
            {pageLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : customers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-xs text-slate-500 p-6">
                <User className="w-10 h-10 text-slate-300 mb-2" />
                <p className="font-semibold text-slate-600">No customers found</p>
                <p className="text-[11px] mt-0.5 text-slate-400">Try adjusting your search or add a new customer</p>
              </div>
            ) : (
              customers.map((customer) => {
                const isSelected = selectedCustomer?.id === customer.id;
                return (
                  <div
                    key={customer.id}
                    onClick={() => loadCustomer(customer.id)}
                    className={cn(
                      'p-3 cursor-pointer transition-all flex items-center justify-between group',
                      isSelected
                        ? 'bg-purple-50/70 border-l-2 border-purple-600'
                        : 'hover:bg-slate-50/80'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {customer.fullName
                          ?.split(' ')
                          .map(name => name[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-semibold text-slate-900 truncate group-hover:text-purple-900 transition-colors">
                            {customer.fullName}
                          </h5>
                          {customer.isVip && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1 py-0.2 rounded-full flex-shrink-0">
                              <Crown className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              VIP
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{customer.phone}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-xs font-bold text-slate-900">
                        {formatCurrency(customer.totalSpent)}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                        {customer.totalVisits} {customer.totalVisits === 1 ? 'visit' : 'visits'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Customer Profile & Details */}
        <div className="lg:col-span-8 space-y-4">
          {selectedCustomer ? (
            <>
              {/* Header Profile Summary */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                <div className="space-y-4">
                  {/* Customer Info */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-lg font-semibold ring-2 ring-purple-500/10 flex-shrink-0">
                        {selectedCustomer.fullName
                          ?.split(' ')
                          .map(name => name[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </div>

                      {/* Customer details */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 truncate">
                            {selectedCustomer.fullName}
                          </h3>

                          {selectedCustomer.isVip && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex-shrink-0">
                              <Crown className="w-3 h-3 fill-amber-500 text-amber-500" />
                              VIP
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {selectedCustomer.phone}
                          </span>

                          {selectedCustomer.email && (
                            <span className="flex items-center gap-1 truncate max-w-[220px]">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {selectedCustomer.email}
                            </span>
                          )}

                          {selectedCustomer.lastVisitDate && (
                            <span className="text-slate-400">
                              Last visit:{' '}
                              <span className="text-slate-600 font-medium">
                                {formatDate(selectedCustomer.lastVisitDate)}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Secondary actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditCustomer(selectedCustomer)}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                        title="Edit Customer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeactivateCustomer(selectedCustomer.id)}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                        title="Deactivate Customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Primary Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenBookingModal(null)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Book Appointment
                    </button>

                    <button
                      onClick={handleOpenAssignPackageModal}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      <Gift className="w-4 h-4" />
                      Assign Package
                    </button>
                  </div>
                </div>

                {/* Compact Metrics Row */}
                <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-100">
                  <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
                    <div className="flex items-center gap-1 text-slate-500 text-[10px] font-semibold">
                      <IndianRupee className="w-3 h-3 text-purple-600" />
                      <span>Lifetime Value</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {formatCurrency(selectedCustomer.totalSpent)}
                    </p>
                    {selectedCustomer.totalPaid !== undefined && selectedCustomer.totalPaid > 0 && (
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium truncate">
                        Paid {formatCurrency(selectedCustomer.totalPaid)}
                        {selectedCustomer.balanceDue !== undefined && selectedCustomer.balanceDue > 0 && (
                          <span className="text-amber-600 ml-1">
                            · Due {formatCurrency(selectedCustomer.balanceDue)}
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
                    <div className="flex items-center gap-1 text-slate-500 text-[10px] font-semibold">
                      <Calendar className="w-3 h-3 text-purple-600" />
                      <span>Total Visits</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {selectedCustomer.totalVisits}
                    </p>
                  </div>

                  <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
                    <div className="flex items-center gap-1 text-slate-500 text-[10px] font-semibold">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span>Avg. Visit</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {formatCurrency(selectedCustomer.averageTicket)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Packages Section */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Package className="w-4 h-4 text-purple-600" />
                    <span>Packages</span>
                  </div>
                  <button
                    onClick={handleOpenAssignPackageModal}
                    className="text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Assign Package
                  </button>
                </div>

                {selectedCustomer.packages && selectedCustomer.packages.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCustomer.packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/60 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{pkg.packageName}</span>
                            {pkg.customPrice && pkg.customPrice < pkg.totalPrice && (
                              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded-md">
                                Custom {formatCurrency(pkg.customPrice)}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {pkg.usedSessions} / {pkg.totalSessions} used
                          </p>
                        </div>

                        <div className="text-right space-y-1">
                          <p className="text-xs font-semibold text-purple-700">
                            {pkg.remainingSessions} {pkg.remainingSessions === 1 ? 'session' : 'sessions'} left
                          </p>
                          <div className="flex items-center justify-end gap-2 text-[11px] text-slate-500">
                            {pkg.expiryDate && (
                              <span>Expires {formatDate(pkg.expiryDate)}</span>
                            )}
                            <button
                              onClick={() => handleEditPackage(pkg)}
                              className="text-slate-400 hover:text-purple-600 transition-colors font-medium ml-1"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50/50 border border-slate-200/60 border-dashed text-center text-xs text-slate-400">
                    No active packages assigned
                  </div>
                )}
              </div>

              {/* Preferences / Notes Section if present */}
              {selectedCustomer.notes && (
                <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-purple-900">
                  <span className="font-bold block mb-0.5">Preferences & Notes</span>
                  {selectedCustomer.notes}
                </div>
              )}

              {/* Visit History Section */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-purple-600" />
                    <span>Visit History ({selectedCustomer.history?.length || 0})</span>
                  </h4>
                </div>

                {selectedCustomer.history && selectedCustomer.history.length > 0 ? (
                  <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-0.5">
                    {selectedCustomer.history.map((item: CustomerVisit) => {
                      const isCancelled = item.status?.toLowerCase() === 'cancelled';
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleOpenBookingModal(item.id)}
                          className={cn(
                            'p-3 rounded-xl border transition-all cursor-pointer',
                            isCancelled
                              ? 'bg-slate-50/40 border-slate-200/60 opacity-75 hover:bg-slate-50'
                              : 'bg-white border-slate-200/70 hover:border-purple-200 hover:bg-purple-50/20'
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h5 className={cn('text-xs font-bold truncate', isCancelled ? 'text-slate-500 line-through' : 'text-slate-900')}>
                                  {item.services && item.services.length > 0
                                    ? item.services.map((s: any) => s.serviceName).join(', ')
                                    : item.serviceName}
                                </h5>
                                {getStatusBadge(item.status)}
                                {item.isPackageAppointment && (
                                  <span className="text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/60 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                    <Package className="w-2.5 h-2.5" />
                                    Package
                                  </span>
                                )}
                                {getPaymentStatusBadge(item.paymentStatus || '')}
                              </div>

                              <p className="text-[11px] text-slate-500">
                                Served by <span className="font-medium text-slate-700">{item.staffName || 'NA'}</span>
                                {item.packageName && (
                                  <span className="ml-2 text-purple-600 font-medium">· {item.packageName}</span>
                                )}
                              </p>

                              <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  {formatDate(item.appointmentDate)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {formatTime(item.startTime)}
                                </span>
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0 ml-2 space-y-0.5">
                              <p className={cn('text-xs font-bold', isCancelled ? 'text-slate-400' : 'text-slate-900')}>
                                {formatCurrency(item.amount)}
                              </p>
                              {item.paidAmount !== undefined && item.paidAmount < item.amount && !isCancelled && (
                                <p className="text-[10px] font-semibold text-amber-600">
                                  Bal: {formatCurrency(item.amount - item.paidAmount)}
                                </p>
                              )}
                              {item.paidAmount !== undefined && item.paidAmount >= item.amount && item.amount > 0 && !isCancelled && (
                                <p className="text-[10px] font-semibold text-emerald-600">Paid</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-500">
                    <History className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium">No visit history available</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      <button
                        onClick={() => handleOpenBookingModal(null)}
                        className="text-purple-600 font-semibold hover:underline"
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
              <User className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-xs text-slate-600">Select a customer</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Choose a customer from the left list to view details</p>
            </div>
          )}
        </div>
      </div>

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customer={editingCustomer}
        onSave={handleSaveCustomer}
        onDeactivate={handleDeactivateCustomer}
      />

      {/* New Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSave={handleSaveAppointment}
        appointmentId={appointmentId}
        initialCustomer={selectedCustomer}
      />

      {/* Assign Package Modal */}
      {selectedCustomer && (
        <AssignPackageModal
          isOpen={isAssignPackageModalOpen}
          onClose={() => setIsAssignPackageModalOpen(false)}
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.fullName}
          onAssign={handleAssignPackage}
        />
      )}

      {/* Edit Package Modal */}
      {editingCustomerPackage && (
        <EditCustomerPackageModal
          isOpen={isEditPackageModalOpen}
          onClose={() => {
            setIsEditPackageModalOpen(false);
            setEditingCustomerPackage(null);
          }}
          customerPackageId={editingCustomerPackage.id}
          onUpdate={handleUpdateCustomerPackage}
        />
      )}
    </div>
  );
}