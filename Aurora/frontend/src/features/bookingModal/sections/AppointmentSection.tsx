import { Users, CalendarDays, Clock } from 'lucide-react';
import { TIME_SLOTS } from '../types/constants';
import type { StaffMember } from '../../../shared/types/staff';

interface AppointmentSectionProps {
  staffId: string;
  staffList: StaffMember[];
  onStaffChange: (staffId: string) => void;
  date: string;
  onDateChange: (date: string) => void;
  startTime: string;
  onStartTimeChange: (time: string) => void;
  durationMinutes: number;
  onDurationChange: (duration: number) => void;
  totalDurationFromServices: number;
  isServiceAdded: boolean;
}

export function AppointmentSection({
  staffId,
  staffList,
  onStaffChange,
  date,
  onDateChange,
  startTime,
  onStartTimeChange,
  durationMinutes,
  onDurationChange,
  totalDurationFromServices,
  isServiceAdded,
}: AppointmentSectionProps) {
  return (
    <>
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-purple-600" /> Staff <span className="text-rose-500">*</span>
        </label>
        <select value={staffId} onChange={(e) => onStaffChange(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600 cursor-pointer" required>
          <option value="">-- Select Staff --</option>
          {staffList.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-purple-600" /> Date <span className="text-rose-500">*</span>
          </label>
          <input type="date" value={date || ''} onChange={(e) => onDateChange(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-600" /> Time <span className="text-rose-500">*</span>
          </label>
          <select value={startTime} onChange={(e) => onStartTimeChange(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600 cursor-pointer" required>
            {TIME_SLOTS.map((slot) => (<option key={slot} value={slot}>{slot}</option>))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-600" /> Duration (min)
          </label>
          <input
            type="number" min="5" step="5"
            value={durationMinutes}
            onChange={(e) => onDurationChange(parseInt(e.target.value, 10) || 0)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
            placeholder="30"
          />
          {isServiceAdded && totalDurationFromServices > 0 && <p className="text-[9px] text-slate-400 mt-0.5">Auto: {totalDurationFromServices} min from services</p>}
        </div>
      </div>
    </>
  );
}
