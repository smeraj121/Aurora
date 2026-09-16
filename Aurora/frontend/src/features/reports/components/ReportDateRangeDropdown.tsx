import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { useClickOutside } from '../../../hooks/useClickOutside';
import type { ReportPresetRange } from '../../../types/report.types';

interface ReportDateRangeDropdownProps {
  preset: ReportPresetRange;
  startDate: string;
  endDate: string;
  onChange: (preset: ReportPresetRange, startDate: string, endDate: string) => void;
}

const PRESET_LABELS: Record<ReportPresetRange, string> = {
  '1m': 'This Month',
  '3m': 'Last 3 Months',
  '6m': 'Last 6 Months',
  '1y': 'This Year',
  custom: 'Custom Range',
};

export function ReportDateRangeDropdown({ preset, startDate, endDate, onChange }: ReportDateRangeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState(startDate);
  const [customEnd, setCustomEnd] = useState(endDate);
  const dropdownRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));

  const handlePreset = (value: ReportPresetRange) => {
    if (value === 'custom') return;
    const today = new Date();
    let start: Date;
    const end = today;

    if (value === '1m') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (value === '3m') {
      start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    } else if (value === '6m') {
      start = new Date(today.getFullYear(), today.getMonth() - 5, 1);
    } else {
      start = new Date(today.getFullYear(), 0, 1);
    }

    onChange(value, format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const handleApplyCustom = () => {
    if (!customStart || !customEnd) return;
    onChange('custom', customStart, customEnd);
    setIsOpen(false);
  };

  const displayLabel = preset === 'custom'
    ? `${format(new Date(startDate), 'MMM d')} – ${format(new Date(endDate), 'MMM d, yyyy')}`
    : PRESET_LABELS[preset];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all shadow-xs"
      >
        <CalendarIcon className="w-4 h-4 text-purple-600" />
        <span>{displayLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200/90 shadow-xl z-50 p-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="space-y-1">
            {(['1m', '3m', '6m', '1y'] as ReportPresetRange[]).map((value) => (
              <button
                key={value}
                onClick={() => handlePreset(value)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  preset === value ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {PRESET_LABELS[value]}
              </button>
            ))}
          </div>

          <div className="border-t border-slate-100 mt-2 pt-3 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase px-1">Custom Range</p>
            <div className="flex items-center gap-2 px-1">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
              <span className="text-slate-400 text-xs">–</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <button
              onClick={handleApplyCustom}
              className="w-full px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}