// components/dashboard/ScheduleTimeline/ScheduleCard.tsx
import { Pencil } from 'lucide-react';
import { cn, formatCurrency } from '../../../lib/utils';
import type { Appointment, AppointmentStatus } from '../../../shared/types';
import { STATUS_CONFIG } from './constants';

interface ScheduleCardProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
}

export function ScheduleCard({ appointment, onEdit }: ScheduleCardProps) {
  const statusInfo = STATUS_CONFIG[appointment.status as AppointmentStatus] || STATUS_CONFIG.scheduled;

  return (
    <div
      onClick={() => onEdit(appointment)}
      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-purple-50/40 hover:border-purple-200 transition-all flex items-center justify-between group cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="text-center min-w-[65px] pr-3 border-r border-slate-200">
          <p className="text-xs font-bold text-slate-800">{appointment.startTime}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {appointment.durationMinutes || 30} min
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-900">{appointment.customerName}</h4>
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
            {appointment.serviceName || 'Service'} •{' '}
            <span className="text-slate-400">{appointment.staffName || 'Unassigned'}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-slate-800">
          {formatCurrency(Number(appointment.amount) || 0)}
        </span>
        <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-purple-600 group-hover:bg-purple-100 border border-transparent group-hover:border-purple-200 transition-all">
          <Pencil className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}