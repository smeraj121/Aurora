import { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  User,
  Scissors,
  Clock,
  UserCheck,
  DollarSign,
  Phone,
  AlertCircle,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock3,
  XCircle,
  Tag,
  Save,
  Check,
  CreditCard,
  Users,
  CalendarDays,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';

import type { AppointmentStatus } from '../../../shared/types';
import type {
  StaffMember,
  ServiceItem,
  CustomerSearchResult,
  BookingFormData,
  NewBookingModalProps,
  PaymentStatus,
} from '../../../shared/types/booking';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Config Options
const STATUS_OPTIONS: { id: AppointmentStatus; label: string; icon: LucideIcon; color?: string }[] = [
  { id: 'scheduled', label: 'Scheduled', icon: CalendarIcon },
  { id: 'confirmed', label: 'Confirmed', icon: CheckCircle2, color: 'text-blue-500' },
  { id: 'in_progress', label: 'In Progress', icon: Clock3, color: 'text-purple-500' },
  { id: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-emerald-500' },
  { id: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'text-rose-500' },
];

const PAYMENT_STATUS_OPTIONS: { id: PaymentStatus; label: string; color: string }[] = [
  { id: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-800' },
  { id: 'partial', label: 'Partial', color: 'bg-blue-100 text-blue-800' },
  { id: 'paid', label: 'Paid', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'refunded', label: 'Refunded', color: 'bg-rose-100 text-rose-800' },
];

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM',
];

const DEFAULT_FORM_STATE: BookingFormData = {
  id: '',
  customerId: '',
  customerName: '',
  phone: '',
  serviceId: '',
  serviceName: '',
  staffId: '',
  startTime: '11:00 AM',
  durationMinutes: '30',
  date: new Date().toISOString().split('T')[0],
  amount: '',
  status: 'scheduled',
  paymentStatus: 'pending',
  paymentAmount: '',
};

export function NewBookingModal({ isOpen, onClose, onSave, initialData }: NewBookingModalProps) {
  const [formData, setFormData] = useState<BookingFormData>(DEFAULT_FORM_STATE);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [serviceList, setServiceList] = useState<ServiceItem[]>([]);
  const [searchResults, setSearchResults] = useState<CustomerSearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load staff & service options on mount/open
  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage(null);
    const fetchData = async () => {
      try {
        const [staffRes, serviceRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/staff`),
          fetch(`${API_BASE_URL}/api/services`),
        ]);

        const [staffJson, serviceJson] = await Promise.all([
          staffRes.json(),
          serviceRes.json(),
        ]);

        if (staffJson.success && Array.isArray(staffJson.data)) {
          setStaffList(staffJson.data);
          if (staffJson.data.length > 0 && !formData.staffId) {
            setFormData((prev: any) => ({ ...prev, staffId: String(staffJson.data[0].id) }));
          }
        }

        if (serviceJson.success && Array.isArray(serviceJson.data)) {
          setServiceList(serviceJson.data);
        }
      } catch (err) {
        console.error('Error fetching modal reference data:', err);
      }
    };

    fetchData();
  }, [isOpen]);

  // Sync Form State with initialData or reset
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setFormData({
        id: String(initialData.id || ''),
        customerId: String(initialData.customerId || ''),
        customerName: initialData.customerName || '',
        phone: (initialData as any).phone || (initialData as any).customerPhone || '',
        serviceId: String((initialData as any).serviceId || ''),
        serviceName: initialData.serviceName || '',
        staffId: String(initialData.staffId || ''),
        startTime: initialData.startTime || '11:00 AM',
        durationMinutes: String((initialData as any).durationMinutes || '30'),
        date: initialData.date || new Date().toISOString().split('T')[0],
        amount: String(initialData.amount || ''),
        status: initialData.status || 'scheduled',
        paymentStatus: ((initialData as any).paymentStatus as PaymentStatus) || 'pending',
        paymentAmount: String((initialData as any).paymentAmount || ''),
      });
      setIsExistingCustomer(Boolean(initialData.customerId));
    } else {
      setFormData({
        ...DEFAULT_FORM_STATE,
        staffId: staffList[0] ? String(staffList[0].id) : '',
        date: new Date().toISOString().split('T')[0],
      });
      setIsExistingCustomer(false);
    }
  }, [initialData, isOpen, staffList]);

  // Outside Click Listener for Dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Customer Name Search
  const handleNameChange = (value: string) => {
    setFormData((prev: any) => ({ ...prev, customerName: value, customerId: '' }));
    setIsExistingCustomer(false);

    if (value.trim().length > 1) {
      setIsSearching(true);
      setShowDropdown(true);

      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/customers?search=${encodeURIComponent(value)}`);
          const json = await res.json();
          if (json.success) setSearchResults(json.data || []);
        } catch (err) {
          console.error('Customer search error:', err);
        } finally {
          setIsSearching(false);
        }
      }, 200);

      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelectCustomer = (customer: CustomerSearchResult) => {
    setFormData((prev: any) => ({
      ...prev,
      customerId: String(customer.id),
      customerName: customer.fullName || customer.name || '',
      phone: customer.phone || '',
    }));
    setIsExistingCustomer(true);
    setShowDropdown(false);
    setSearchResults([]);
    setErrorMessage(null);
  };

  const handleServiceChange = (serviceId: string) => {
    const selectedService = serviceList.find((s) => String(s.id) === String(serviceId));

    setFormData((prev) => ({
      ...prev,
      serviceId,
      serviceName: selectedService ? selectedService.name : '',
      amount: selectedService?.price ? String(selectedService.price) : prev.amount,
      durationMinutes: selectedService?.durationMinutes
        ? String(selectedService.durationMinutes)
        : prev.durationMinutes,
    }));
  };

  // Payment Completion Validation
  const paymentValidationError = useMemo(() => {
    if (formData.status === 'completed') {
      if (formData.paymentStatus !== 'paid') {
        return 'Cannot set to "Completed" without "Paid" payment status.';
      }
      const total = parseFloat(formData.amount) || 0;
      const paid = parseFloat(formData.paymentAmount) || 0;
      if (paid < total) {
        return `Received amount (₹${paid}) is less than total price (₹${total}).`;
      }
    }
    return null;
  }, [formData.status, formData.paymentStatus, formData.paymentAmount, formData.amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.customerName.trim()) return setErrorMessage('Customer name is required');
    if (!formData.phone.trim()) return setErrorMessage('Phone number is required');
    if (!formData.serviceId) return setErrorMessage('Please select a service');
    if (!formData.staffId) return setErrorMessage('Please select staff member');

    if (paymentValidationError) {
      setErrorMessage(paymentValidationError);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xl my-4 border border-slate-100 transition-all overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 px-4 sm:px-6 py-4 flex items-center justify-between text-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-400 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm sm:text-base">
              {initialData ? 'Edit Appointment' : 'New Booking'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 px-6 flex items-center gap-2.5 text-xs text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto">
          
          {/* Appointment Status Options */}
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1 mr-1">
              <Tag className="w-3.5 h-3.5 text-purple-600" />
              Status:
            </div>
          <div className="flex flex-wrap items-center gap-1.5 pb-1">
            {STATUS_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = formData.status === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormData((prev: any) => ({ ...prev, status: opt.id }))}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs transition-all ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3 h-3 ${isSelected ? 'text-purple-600' : opt.color || 'text-slate-400'}`} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Customer & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-600" />
                Customer <span className="text-rose-500">*</span>
                {isExistingCustomer && (
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ml-1">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Search customer..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                />
                {isSearching && (
                  <div className="absolute right-3 top-3">
                    <div className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-40 overflow-y-auto divide-y divide-slate-100">
                  {searchResults.map((cust) => (
                    <div
                      key={cust.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectCustomer(cust);
                      }}
                      className="p-2 hover:bg-purple-50 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                          {(cust.fullName || cust.name || 'C').charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {cust.fullName || cust.name}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">{cust.phone || 'No phone'}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md shrink-0 ml-2">
                        Select
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-purple-600" />
                Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Phone number"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          {/* Service & Staff */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-purple-600" />
                Service <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.serviceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600 cursor-pointer"
                required
              >
                <option value="">-- Select Service --</option>
                {serviceList.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name} {srv.price ? `(₹${srv.price})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                Staff <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.staffId}
                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600 cursor-pointer"
                required
              >
                <option value="">-- Select Staff --</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date, Time Slot, Duration */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-purple-600" />
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                Time <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600 cursor-pointer"
                required
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                Duration
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                />
                <span className="absolute right-2.5 top-3 text-[10px] text-slate-400">min</span>
              </div>
            </div>
          </div>

          {/* Price, Payment Status & Amount Received */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-purple-600" />
                Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                Payment Status
              </label>
              <div className="relative">
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as PaymentStatus })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600 appearance-none cursor-pointer"
                >
                  {PAYMENT_STATUS_OPTIONS.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                Received (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.paymentAmount}
                onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
                placeholder="0.00"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sticky bottom-0 bg-white pb-1 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : initialData ? 'Update Appointment' : 'Confirm Booking'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}