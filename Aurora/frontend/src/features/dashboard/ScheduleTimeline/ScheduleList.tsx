// components/dashboard/ScheduleTimeline/ScheduleList.tsx
import { Loader2 } from 'lucide-react';
import type { Appointment } from '../../../shared/types';
import { ScheduleCard } from './ScheduleCard';

interface ScheduleListProps {
  appointments: Appointment[];
  loading: boolean;
  onEdit: (appointment: Appointment) => void;
}

export function ScheduleList({ appointments, loading, onEdit }: ScheduleListProps) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 gap-2 text-xs py-10 min-h-[300px]">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Fetching schedule...</span>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-xs py-10 min-h-[300px]">
        No appointments scheduled for today.
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-3 overflow-y-auto min-h-[300px]">
      {appointments.map((appointment) => (
        <ScheduleCard
          key={appointment.id}
          appointment={appointment}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}