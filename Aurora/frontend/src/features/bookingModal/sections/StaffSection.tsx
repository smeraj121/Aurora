import { Users, CalendarDays, Clock } from 'lucide-react';
import type { StaffMember } from '../../../types/staff.types';
import { TIME_SLOTS } from '../types/constants';

interface StaffSectionProps {
  staffId: number | null;
  staffList: StaffMember[];
  onStaffChange: (staffId: number | null) => void;
  date: string;
  onDateChange: (date: string) => void;
  startTime: string;
  onStartTimeChange: (time: string) => void;
}

export function StaffSection({
  staffId,
  staffList,
  onStaffChange,
  date,
  onDateChange,
  startTime,
  onStartTimeChange,
}: StaffSectionProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div>
        <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
          <Users className="w-3 h-3 text-purple-600" /> Staff
        </label>
        <select
          value={staffId || ''}
          onChange={(e) => onStaffChange(parseInt(e.target.value, 10) || null)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
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
        <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
          <CalendarDays className="w-3 h-3 text-purple-600" /> Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
        />
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
          <Clock className="w-3 h-3 text-purple-600" /> Time
        </label>
        <select
          value={startTime}
          onChange={(e) => onStartTimeChange(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
        >
          {TIME_SLOTS.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}