// StatusSection.tsx
import { useState } from 'react';
import { Edit2, CheckCircle2 } from 'lucide-react';
import { getStatusConfig } from '../../../helper/status.helper';
import { STATUS_OPTIONS } from '../types/constants';
import type { AppointmentStatus } from '../../../shared/types';

interface StatusSectionProps {
  status: AppointmentStatus;
  onStatusChange: (status: AppointmentStatus) => void;
  isEditable: boolean;
}

export function StatusSection({ status, onStatusChange, isEditable }: StatusSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const config = getStatusConfig(status || 'scheduled');
  const Icon = config.icon;

  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3 text-purple-600" /> Status
      </label>

      {isEditing ? (
        <select
          value={status}
          onChange={(e) => {
            onStatusChange(e.target.value as AppointmentStatus);
            setIsEditing(false);
          }}
          onBlur={() => setIsEditing(false)}
          autoFocus
          className="bg-slate-50 border border-purple-300 rounded-xl px-2 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <button
          type="button"
          onClick={() => isEditable && setIsEditing(true)}
          disabled={!isEditable}
          className={`border rounded-xl px-2.5 py-1.5 text-xs font-semibold flex gap-1 items-center transition-all disabled:cursor-default ${config.text} ${config.border}`}
        >
          <span className="flex items-center gap-1">
            <Icon className="w-3 h-3" />
            {config.label}
          </span>
          {isEditable && (
            <Edit2 className="w-3 h-3 opacity-50 hover:opacity-100 transition-opacity" />
          )}
        </button>
      )}
    </div>
  );
}