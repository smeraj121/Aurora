import { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, User, Scissors, CheckCircle2, DollarSign, Phone, UserCheck, AlertCircle } from 'lucide-react';
import { CALENDAR_STAFF } from '../data/calendarData';
import type { Appointment, AppointmentStatus } from '../../../shared/types';

//import { useState, useEffect, useRef } from 'react';
//import { X, User, Scissors, Clock, UserCheck, DollarSign, Phone, AlertCircle } from 'lucide-react';
//import type { Appointment } from '../../shared/types';

interface StaffMember {
  id: number | string;
  name: string;
}

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: any) => Promise<void> | void;
  initialData?: Appointment | null;
}

interface ServiceItem {
  id: number | string;
  name: string;
  price?: number;
}

export function NewBookingModal({ isOpen, onClose, onSave, initialData }: NewBookingModalProps) {
  const [formData, setFormData] = useState({
    id: '',
    customerId: '',
    customerName: '',
    phone: '',
    serviceName: '',
    staffId: '',
    startTime: '11:00 AM',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    status: 'scheduled'
  });

  const [serviceList, setServiceList] = useState<ServiceItem[]>([]);
const [selectedServiceId, setSelectedServiceId] = useState<string>('');

// 2. Fetch Services when modal opens
useEffect(() => {
  if (isOpen) {
    fetchServices();
  }
}, [isOpen]);

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

// 3. Handle Service Selection (Auto-populates amount if price exists)
const handleServiceChange = (serviceId: string) => {
  setSelectedServiceId(serviceId);
  const foundService = serviceList.find((s) => String(s.id) === String(serviceId));

  setFormData((prev) => ({
    ...prev,
    serviceId: serviceId,
    serviceName: foundService ? foundService.name : '',
    // Auto-fill price from service if amount is empty or default
    amount: foundService?.price ? String(foundService.price) : prev.amount
  }));
};

  // Staff and Search States
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Staff Members on Open
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      fetchStaffMembers();
    }
  }, [isOpen]);

  const fetchStaffMembers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/staff');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setStaffList(json.data);
        if (json.data.length > 0 && !formData.staffId) {
          setFormData((prev) => ({ ...prev, staffId: String(json.data[0].id) }));
        }
      }
    } catch (err) {
      console.error('Failed to load staff list:', err);
    }
  };

  // 2. Load Initial Data or Reset Form
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: String(initialData.id || ''),
        customerId: String(initialData.customerId || ''),
        customerName: initialData.customerName || '',
        phone: (initialData as any).phone || (initialData as any).customerPhone || '',
        serviceName: initialData.serviceName || '',
        staffId: String(initialData.staffId || ''),
        startTime: initialData.startTime || '11:00 AM',
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
        serviceName: '',
        staffId: staffList[0] ? String(staffList[0].id) : '',
        startTime: '11:00 AM',
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

  // 3. Customer Name Search as user types
  const handleNameChange = (value: string) => {
    setErrorMessage(null);
    setFormData((prev) => ({
      ...prev,
      customerName: value,
      customerId: ''
    }));
    setIsExistingCustomer(false);

    if (value.trim().length > 1) {
      setIsSearching(true);
      setShowDropdown(true);

      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/customers?search=${encodeURIComponent(value)}`);
          const json = await res.json();
          if (json.success) {
            setSearchResults(json.data || []);
          }
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

  // Select customer from search suggestions dropdown
  const handleSelectCustomer = (customer: any) => {
    const selectedName = customer.fullName || customer.name || '';
    const selectedPhone = customer.phone || '';

    setFormData((prev) => ({
      ...prev,
      customerId: String(customer.id),
      customerName: selectedName,
      phone: selectedPhone
    }));

    setIsExistingCustomer(true);
    setShowDropdown(false);
    setSearchResults([]);
    setErrorMessage(null);
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
      setErrorMessage('Phone number is required for new customers to register.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        ...formData,
        customerName: trimmedName
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-800 transition-all">

        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base">
              {initialData ? 'Edit Appointment' : 'New Appointment'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-950/50 border-b border-red-100 dark:border-red-900/50 p-3 px-6 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Customer Name Field with Suggestions */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Customer Name *
              </label>
              {isExistingCustomer && (
                <span className="text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 px-2 py-0.5 rounded-full">
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
                placeholder="e.g. Aditi Sharma"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 transition-all"
              />
              {isSearching && (
                <div className="absolute right-3 top-3">
                  <div className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Suggestions Popup */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                {searchResults.map((cust) => (
                  <div
                    key={cust.id}
                    // Change onClick to onMouseDown to prevent blur/click race conditions
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevents input blur before selection
                      handleSelectCustomer(cust);
                    }}
                    className="p-2.5 hover:bg-purple-50 dark:hover:bg-slate-700/60 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 font-bold flex items-center justify-center text-xs">
                        {(cust.full_name || cust.name || 'C').charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {cust.full_name || cust.name}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-2.5 h-2.5" />
                          {cust.phone || 'No phone number'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">
                      Select
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Phone Number {!isExistingCustomer && <span className="text-red-500">* (Required)</span>}
            </label>
            <input
              type="text"
              required={!isExistingCustomer}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. +91 98765 43210"
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 transition-all"
            />
          </div>

          {/* Available Services Dropdown */}
<div>
  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
    <Scissors className="w-3.5 h-3.5 text-slate-400" />
    Select Service
  </label>
  <select
    value={selectedServiceId}
    onChange={(e) => handleServiceChange(e.target.value)}
    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 cursor-pointer"
  >
    <option value="">-- Choose a Service --</option>
    {serviceList.map((srv) => (
      <option key={srv.id} value={srv.id}>
        {srv.name} {srv.price ? `(₹${srv.price})` : ''}
      </option>
    ))}
  </select>
</div>

          {/* Dynamic Staff Dropdown & Time Slot */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                Assigned Staff
              </label>
              <select
                value={formData.staffId}
                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 cursor-pointer"
              >
                <option value="">Select Staff</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Time Slot
              </label>
              <select
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 cursor-pointer"
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

          {/* Price Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              Estimated Price (₹)
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="2500"
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 transition-all"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Booking' : 'Book Appointment'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}