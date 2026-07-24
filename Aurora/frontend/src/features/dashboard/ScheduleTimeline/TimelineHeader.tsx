// components/dashboard/ScheduleTimeline/TimelineHeader.tsx
import { Plus } from 'lucide-react';

interface TimelineHeaderProps {
  remaining: number;
  loading: boolean;
  onNewBooking: () => void;
}

export function TimelineHeader({ remaining, loading, onNewBooking }: TimelineHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h3 className="text-base font-bold text-slate-900">Today's Schedule</h3>
        <p className="text-xs text-slate-500">
          {loading
            ? 'Loading...'
            : `${remaining} appointment${remaining === 1 ? '' : 's'} remaining`}
        </p>
      </div>
      <button
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors shadow-sm cursor-pointer"
        onClick={onNewBooking}
      >
        <Plus className="w-3.5 h-3.5" />
        <span>New Booking</span>
      </button>
    </div>
  );
}