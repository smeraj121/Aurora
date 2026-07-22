import { Plus, Pencil } from 'lucide-react';
import { TODAY_SCHEDULE } from '../data/mockData';
import { cn, formatCurrency } from '../../../lib/utils';
import type { Appointment, AppointmentStatus } from '../../../shared/types';
import { NewBookingModal } from '../../calendar/components/NewBookingModal';
import { useState } from 'react';
//import { CALENDAR_APPOINTMENTS } from '../../calendar/data/calendarData';

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; className: string }> = {
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  in_progress: { label: 'In Service', className: 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  scheduled: { label: 'Scheduled', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-500 border-slate-200' },
  no_show: { label: 'No Show', className: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export function ScheduleTimeline() {
  const [appointments, setAppointments] = useState<Appointment[]>(TODAY_SCHEDULE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const handleSaveAppointment = (savedApt: Appointment) => {
    setAppointments((prev) => {
      const exists = prev.some((item) => item.id === savedApt.id);
      if (exists) {
        return prev.map((item) => (item.id === savedApt.id ? savedApt : item));
      }
      return [savedApt, ...prev];
    });
  };

  const handleOpenAddModal = () => {
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (apt: Appointment) => {
    setEditingAppointment(apt);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">Today's Schedule</h3>
          <p className="text-xs text-slate-500">4 appointments remaining</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors shadow-sm"
          onClick={handleOpenAddModal}>
          <Plus className="w-3.5 h-3.5" />
          <span>New Booking</span>
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {appointments.map((item) => {
          const statusInfo = STATUS_CONFIG[item.status];
          return (
            <div
              key={item.id}
              onClick={() => handleOpenEditModal(item)}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-purple-50/40 hover:border-purple-200 transition-all flex items-center justify-between group cursor-pointer"
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
                <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-purple-600 group-hover:bg-purple-100 border border-transparent group-hover:border-purple-200 transition-all">
                  <Pencil className="w-3 h-3" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Booking Form Modal */}
      <NewBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAppointment}
        initialData={editingAppointment}
      />
    </div>
  );
}
