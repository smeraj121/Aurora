import { Plus, ChevronRight } from 'lucide-react';
import { TODAY_SCHEDULE } from '../data/mockData';
import { cn, formatCurrency } from '../../../lib/utils';
import type { AppointmentStatus } from '../../../shared/types/domain';
import { NewBookingModal } from '../../calendar/components/NewBookingModal';
import { useState } from 'react';
import type { Appointment } from '../../../shared/types';
import { CALENDAR_APPOINTMENTS } from '../../calendar/data/calendarData';

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; className: string }> = {
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  in_progress: { label: 'In Service', className: 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  scheduled: { label: 'Scheduled', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-500 border-slate-200' },
  no_show: { label: 'No Show', className: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export function ScheduleTimeline() {
  const [_, setAppointments] = useState<Appointment[]>(CALENDAR_APPOINTMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleAddAppointment = (newApt: Appointment) => {
    setAppointments((prev) => [...prev, newApt]);
  };
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">Today's Schedule</h3>
          <p className="text-xs text-slate-500">4 appointments remaining</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors shadow-sm"
          onClick={() => setIsModalOpen(true)}>
          <Plus className="w-3.5 h-3.5" />
          <span>New Booking</span>
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {TODAY_SCHEDULE.map((item) => {
          const statusInfo = STATUS_CONFIG[item.status];
          return (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-purple-50/40 hover:border-purple-200 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="text-center min-w-[65px] pr-3 border-r border-slate-200">
                  <p className="text-xs font-bold text-slate-800">{item.startTime}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.durationMinutes} min</p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{item.customerName}</h4>
                    <span
                      className={cn(
                        'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                        statusInfo.className
                      )}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {item.serviceName} • <span className="text-slate-400">{item.staffName}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-800">{formatCurrency(item.amount)}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* New Booking Form Modal */}
      <NewBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddAppointment}
      />
    </div>
  );
}
