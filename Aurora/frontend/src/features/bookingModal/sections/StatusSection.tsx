import { Tag } from 'lucide-react';
import { STATUS_OPTIONS } from '../types/constants';
import type { AppointmentStatus } from '../../../shared/types';

interface StatusSectionProps {
  status: AppointmentStatus;
  onStatusChange: (status: AppointmentStatus) => void;
}

export function StatusSection({ status, onStatusChange }: StatusSectionProps) {
  return (
    <div>
      <div className="text-xs font-bold text-slate-700 flex items-center gap-1 mr-1">
        <Tag className="w-3.5 h-3.5 text-purple-600" />
        Status:
      </div>
      <div className="flex flex-wrap items-center gap-1.5 pb-1">
        {STATUS_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = status === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onStatusChange(opt.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs transition-all ${isSelected ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              <Icon className={`w-3 h-3 ${isSelected ? 'text-purple-600' : opt.color || 'text-slate-400'}`} />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}