import { ChevronDown, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  icon?: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
}

export function Select({ label, icon: Icon, value, onChange, options, className }: SelectProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <label className="text-xs font-semibold text-slate-600">{label}</label>}
      <div className="relative">
        {Icon && (
          <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'appearance-none w-full py-2.5 pr-9 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700',
            'focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all cursor-pointer',
            Icon ? 'pl-9' : 'pl-3.5'
          )}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}