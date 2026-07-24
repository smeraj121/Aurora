// components/dashboard/ScheduleTimeline/constants.ts
import type { AppointmentStatus } from '../../../shared/types';

export const STATUS_CONFIG: Record<AppointmentStatus, { label: string; className: string }> = {
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  in_progress: { label: 'In Service', className: 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  scheduled: { label: 'Scheduled', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-500 border-slate-200' },
  no_show: { label: 'No Show', className: 'bg-rose-50 text-rose-700 border-rose-200' },
};