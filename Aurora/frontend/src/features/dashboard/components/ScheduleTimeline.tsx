import { useState, useEffect } from 'react';
import { Plus, Pencil, Loader2 } from 'lucide-react';
import { cn, formatCurrency } from '../../../lib/utils';
import type { Appointment, AppointmentStatus } from '../../../shared/types';
import { NewBookingModal } from '../../calendar/components/NewBookingModal';

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; className: string }> = {
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  in_progress: { label: 'In Service', className: 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  scheduled: { label: 'Scheduled', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-500 border-slate-200' },
  no_show: { label: 'No Show', className: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export function ScheduleTimeline() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const todayDateStr = new Date().toISOString().split('T')[0];

  // Fetch today's schedule from backend API
  const fetchTodaySchedule = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:5000/api/calendar?date=${todayDateStr}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAppointments(json.data);
      }
    } catch (err) {
      console.error('Failed to load today schedule:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaySchedule();
  }, []);

  // Save/Update Handler -> POSTs to API then refreshes list
  const handleSaveAppointment = async (bookingData: any) => {
    try {
      const res = await fetch('http://localhost:5000/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to save booking.');
      }

      // Refresh schedule
      await fetchTodaySchedule();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving appointment:', err);
      throw err; // Passed to modal to display error alert
    }
  };

  const handleOpenAddModal = () => {
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (apt: Appointment) => {
    setEditingAppointment(apt);
    setIsModalOpen(true);
  };

  // Count remaining non-completed / non-cancelled appointments
  const remainingCount = appointments.filter(
    (a) => a.status !== 'completed' && a.status !== 'cancelled'
  ).length;

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">Today's Schedule</h3>
          <p className="text-xs text-slate-500">
            {isLoading
              ? 'Loading...'
              : `${remainingCount} appointment${remainingCount === 1 ? '' : 's'} remaining`}
          </p>
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors shadow-sm cursor-pointer"
          onClick={handleOpenAddModal}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Booking</span>
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto min-h-[300px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-slate-400 gap-2 text-xs py-10">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Fetching schedule...</span>
          </div>
        ) : appointments.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs py-10">
            No appointments scheduled for today.
          </div>
        ) : (
          appointments.map((item) => {
            const statusInfo =
              STATUS_CONFIG[item.status as AppointmentStatus] || STATUS_CONFIG.scheduled;
            return (
              <div
                key={item.id}
                onClick={() => handleOpenEditModal(item)}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-purple-50/40 hover:border-purple-200 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="text-center min-w-[65px] pr-3 border-r border-slate-200">
                    <p className="text-xs font-bold text-slate-800">{item.startTime}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {item.durationMinutes || 30} min
                    </p>
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
                      {item.serviceName || 'Service'} •{' '}
                      <span className="text-slate-400">{item.staffName || 'Unassigned'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-800">
                    {formatCurrency(Number(item.amount) || 0)}
                  </span>
                  <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-purple-600 group-hover:bg-purple-100 border border-transparent group-hover:border-purple-200 transition-all">
                    <Pencil className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Booking / Edit Modal */}
      <NewBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAppointment}
        initialData={editingAppointment}
      />
    </div>
  );
}