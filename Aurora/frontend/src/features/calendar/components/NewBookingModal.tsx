import { useState, useEffect, useRef } from 'react';
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
  Save
} from 'lucide-react';
import type { Appointment, AppointmentStatus } from '../../../shared/types';

interface StaffMember {
  id: number | string;
  name: string;
}

interface ServiceItem {
  id: number | string;
  name: string;
  price?: number;
  durationMinutes?: number;
}

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: any) => Promise<void> | void;
  initialData?: Appointment | null;
}

const STATUS_OPTIONS = [
  { id: 'scheduled' as AppointmentStatus, label: 'Scheduled', icon: CalendarIcon },
  { id: 'confirmed' as AppointmentStatus, label: 'Confirmed', icon: CheckCircle2, color: 'text-blue-500' },
  { id: 'in_progress' as AppointmentStatus, label: 'In Progress', icon: Clock3, color: 'text-purple-500' },
  { id: 'completed' as AppointmentStatus, label: 'Completed', icon: CheckCircle2, color: 'text-emerald-500' },
  { id: 'cancelled' as AppointmentStatus, label: 'Cancelled', icon: XCircle, color: 'text-rose-500' }
];

export function NewBookingModal({ isOpen, onClose, onSave, initialData }: NewBookingModalProps) {
  const [formData, setFormData] = useState({
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
    status: 'scheduled'
  });

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [serviceList, setServiceList] = useState<ServiceItem[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch staff and services on open
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      fetchStaffMembers();
      fetchServices();
    }
  }, [isOpen]);

  const fetchStaffMembers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/staff');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setStaffList(json.data);
      }
    } catch (err) {
      console.error('Failed to load staff list:', err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/services');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setServiceList(json.data);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    }
  };

  // Populate data when editing
  useEffect(() => {
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
        status: initialData.status || 'scheduled'
      });
      setIsExistingCustomer(Boolean(initialData.customerId));
    } else {
      setFormData({
        id: '',
        customerId: '',
        customerName: '',
        phone: '',
        serviceId: '',
        serviceName: '',
        staffId: staffList[0] ? String(staffList[0].id) : '',
        startTime: '11:00 AM',
        durationMinutes: '30',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        status: 'scheduled'
      });
      setIsExistingCustomer(false);
    }
  }, [initialData, isOpen]);

  // Handle click outside dropdown
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
    setErrorMessage(null);
    setFormData((prev) => ({ ...prev, customerName: value, customerId: '' }));
    setIsExistingCustomer(false);

    if (value.trim().length > 1) {
      setIsSearching(true);
      setShowDropdown(true);

      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/customers?search=${encodeURIComponent(value)}`);
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

  const handleSelectCustomer = (customer: any) => {
    setFormData((prev) => ({
      ...prev,
      customerId: String(customer.id),
      customerName: customer.fullName || customer.name || '',
      phone: customer.phone || ''
    }));
    setIsExistingCustomer(true);
    setShowDropdown(false);
    setSearchResults([]);
    setErrorMessage(null);
  };

  // Handle Service Selection
  const handleServiceChange = (serviceId: string) => {
    const selectedService = serviceList.find((s) => String(s.id) === String(serviceId));

    setFormData((prev) => ({
      ...prev,
      serviceId,
      serviceName: selectedService ? selectedService.name : '',
      amount: selectedService?.price ? String(selectedService.price) : prev.amount,
      durationMinutes: selectedService?.durationMinutes
        ? String(selectedService.durationMinutes)
        : prev.durationMinutes
    }));
  };

  // Format Display Date for Banner
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return dateStr;

    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('en-US', { month: 'long' });
    const year = dateObj.getFullYear();
    const weekday = dateObj.toLocaleString('en-US', { weekday: 'long' });

    return `${day} ${month} ${year} (${weekday})`;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = formData.customerName ? formData.customerName.trim() : '';

    if (!trimmedName) {
      setErrorMessage('Customer name is required.');
      return;
    }

    if (!isExistingCustomer && !formData.phone.trim()) {
      setErrorMessage('Phone number is required for new customers.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({ ...formData, customerName: trimmedName });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 transition-all">
        
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {initialData ? 'Edit Appointment' : 'New Appointment'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-50 border-b border-red-100 p-3 px-6 flex items-start gap-2.5 text-xs text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Appointment Status Section */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
              <Tag className="w-3.5 h-3.5 text-purple-600" />
              <span>Appointment Status</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">Set the current status of this appointment</p>

            <div className="flex items-center gap-1 pb-1 overflow-x-auto">
              {STATUS_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = formData.status === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: opt.id })}
                    className={`relative flex items-center gap-1 px-2.5 py-2 rounded-xl border text-xs transition-all whitespace-nowrap ${
                      isSelected
                        ? 'border-2 border-purple-600 bg-purple-50/50 text-purple-700 font-bold shadow-md shadow-purple-600/20'
                        : 'border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-3 h-3 ${isSelected ? 'text-purple-600' : opt.color || 'text-slate-400'}`} />
                    <span className='text-[12px]'>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer Name & Phone */}
          <div className="grid grid-cols-2 gap-4">
            {/* Customer Name */}
            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-600" />
                  Customer Name <span className="text-rose-500">*</span>
                </label>
                {isExistingCustomer && (
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    Registered User
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Saba"
                  className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-purple-600 transition-all"
                />
                {isSearching && (
                  <div className="absolute right-3 top-3">
                    <div className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Suggestions Popup */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {searchResults.map((cust) => (
                    <div
                      key={cust.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectCustomer(cust);
                      }}
                      className="p-2.5 hover:bg-purple-50 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 font-bold flex items-center justify-center text-xs">
                          {(cust.fullName || cust.name || 'C').charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            {cust.fullName || cust.name}
                          </p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5" />
                            {cust.phone || 'No phone'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                        Select
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-purple-600" />
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9910821180"
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-purple-600 transition-all"
              />
            </div>
          </div>

          {/* Service & Duration */}
          <div className="grid grid-cols-2 gap-4">
            {/* Service Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-purple-600" />
                Service Name
                <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.serviceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-purple-600 cursor-pointer"
                required
              >
                
                <option value="">-- Select Service --</option>
                {serviceList.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                Duration (Mins)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                placeholder="30"
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-purple-600 transition-all"
              />
            </div>
          </div>

          {/* Assigned Staff & Time Slot */}
          <div className="grid grid-cols-2 gap-4">
            {/* Staff */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                Assigned Staff
              </label>
              <select
                value={formData.staffId}
                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-purple-600 cursor-pointer"
              >
                <option value="">Select Staff</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Slot */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                Time Slot
              </label>
              <select
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-purple-600 cursor-pointer"
              >
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="01:00 PM">01:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:00 PM">03:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="05:00 PM">05:00 PM</option>
              </select>
            </div>
          </div>

          {/* Estimated Price */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-purple-600" />
              Estimated Price (₹)
            </label>
            <input
              type="text"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="850.00"
              className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-purple-600 transition-all"
            />
          </div>

          {/* Appointment Date Display Card */}
          <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-purple-900">Appointment Date</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {formatDisplayDate(formData.date)}
              </p>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : initialData ? 'Update Booking' : 'Book Appointment'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}