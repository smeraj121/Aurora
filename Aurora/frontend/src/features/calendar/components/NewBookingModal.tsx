import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Scissors, CheckCircle2 } from 'lucide-react';
import { CALENDAR_STAFF } from '../data/calendarData';
import type { Appointment, AppointmentStatus } from '../../../shared/types';

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Appointment) => void;
  initialData?: Appointment | null;
}

export function NewBookingModal({ isOpen, onClose, onSave, initialData }: NewBookingModalProps) {
  const isEditing = Boolean(initialData);
  const [customerName, setCustomerName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [staffId, setStaffId] = useState(CALENDAR_STAFF[0].id);
  const [startTime, setStartTime] = useState('11:00 AM');
  const [amount, setAmount] = useState('2500');
  const [status, setStatus] = useState<AppointmentStatus>('scheduled');

  useEffect(() => {
    if (initialData && isOpen) {
      setCustomerName(initialData.customerName);
      setServiceName(initialData.serviceName);
      setStaffId(initialData.staffId);
      setStartTime(initialData.startTime);
      setAmount(String(initialData.amount));
      setStatus(initialData.status);
    } else {
      // Reset for new booking
      setCustomerName('');
      setServiceName('');
      setStaffId(CALENDAR_STAFF[0].id);
      setStartTime('11:00 AM');
      setAmount('2500');
      setStatus('scheduled');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = CALENDAR_STAFF.find((s) => s.id === staffId);

    const newApt: Appointment = {
      id: initialData ? initialData.id : `apt-${Date.now()}`,
      customerId: initialData ? initialData.customerId : `c-${Date.now()}`,
      customerName: customerName || 'Walk-in Customer',
      serviceName: serviceName || 'Standard Service',
      staffId: staffId,
      staffName: staff?.name || 'Staff Member',
      startTime: startTime,
      endTime: '12:00 PM',
      durationMinutes: 60,
      status: status,
      amount: Number(amount) || 2000,
    };

    onSave(newApt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0F0B1E] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold">{isEditing ? 'Edit Appointment' : 'New Appointment'}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Customer Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Aditi Sharma"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-slate-400" />
              Service Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Haircut & Keratin Treatment"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Assigned Staff</label>
              <select
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
              >
                {CALENDAR_STAFF.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Time Slot
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
              >
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:00 PM">03:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
              </select>
            </div>
          </div>

          {isEditing && (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
              >
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Estimated Price (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-md shadow-purple-900/20"
            >
              {isEditing ? 'Save Changes' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}