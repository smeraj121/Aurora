import { useState, useEffect } from 'react';
import { X, UserPlus, UserCheck, Clock, Calendar, Sparkles } from 'lucide-react';

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  specialization: string;
  phone: string;
  commissionRate: number;
  workDays: string[];
  workingHours: string;
  status: 'Active' | 'On Leave';
  avatarColor: string;
}

interface StaffFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveStaff: (staff: StaffMember) => void;
  initialData?: StaffMember | null; // Pass staff object when editing
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function StaffFormDrawer({
  isOpen,
  onClose,
  onSaveStaff,
  initialData,
}: StaffFormDrawerProps) {
  const isEditing = Boolean(initialData);

  const [name, setName] = useState('');
  const [role, setRole] = useState('Senior Stylist');
  const [specialization, setSpecialization] = useState('');
  const [phone, setPhone] = useState('');
  const [commissionRate, setCommissionRate] = useState('15');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('07:00 PM');
  const [status, setStatus] = useState<'Active' | 'On Leave'>('Active');

  // Populate form if editing existing staff member
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setRole(initialData.role);
      setSpecialization(initialData.specialization);
      setPhone(initialData.phone);
      setCommissionRate(initialData.commissionRate.toString());
      setSelectedDays(initialData.workDays);
      setStatus(initialData.status);

      // Extract shift times
      const times = initialData.workingHours.split(' - ');
      if (times.length === 2) {
        setStartTime(times[0]);
        setEndTime(times[1]);
      }
    } else {
      // Reset defaults for creation
      setName('');
      setRole('Senior Stylist');
      setSpecialization('');
      setPhone('');
      setCommissionRate('15');
      setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
      setStartTime('10:00 AM');
      setEndTime('07:00 PM');
      setStatus('Active');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const staffPayload: StaffMember = {
      id: initialData ? initialData.id : `staff-${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      specialization: specialization.trim() || 'General Services',
      phone: phone.trim(),
      commissionRate: parseFloat(commissionRate) || 10,
      workDays: selectedDays,
      workingHours: `${startTime} - ${endTime}`,
      status: status,
      avatarColor: initialData ? initialData.avatarColor : 'bg-purple-600',
    };

    onSaveStaff(staffPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div>
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
                {isEditing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              </div>
              <h3 className="text-base font-bold">
                {isEditing ? 'Edit Staff Member' : 'Add Staff Member'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form id="staff-form" onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Staff Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vikram Malhotra"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            {/* Role & Specialization */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
                >
                  <option value="Senior Master Stylist">Senior Master Stylist</option>
                  <option value="Senior Stylist">Senior Stylist</option>
                  <option value="Skin & Facial Specialist">Skin Specialist</option>
                  <option value="Nail Artist & Esthetician">Nail Artist</option>
                  <option value="Barber & Hair Styling Lead">Barber Lead</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  Specialization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Keratin & Coloring"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>
            </div>

            {/* Mobile, Commission Rate & Status */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Comm (%)</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Active' | 'On Leave')}
                  className="w-full px-2 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white font-medium"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>

            {/* Work Days Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Working Days
              </label>
              <div className="flex gap-1.5">
                {WEEKDAYS.map((day) => {
                  const isSelected = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`flex-1 py-2 text-[11px] font-bold rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Working Hours */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Shift Timings
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Start (10:00 AM)"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
                <input
                  type="text"
                  placeholder="End (07:00 PM)"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="staff-form"
            className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-md shadow-purple-900/20"
          >
            {isEditing ? 'Save Changes' : 'Add Staff Member'}
          </button>
        </div>
      </div>
    </div>
  );
}