// sections/CustomerSummaryCard.tsx
import type { LucideIcon } from 'lucide-react';

interface CustomerSummaryCardProps {
  icon: LucideIcon;
  iconColor: string; // e.g. 'text-purple-600'
  iconBg: string;     // e.g. 'bg-purple-50'
  label: string;
  value: string;
}

export function CustomerSummaryCard({ icon: Icon, iconColor, iconBg, label, value }: CustomerSummaryCardProps) {
  return (
    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 flex items-center gap-2.5">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-slate-500 truncate">{label}</p>
        <p className="text-xs font-bold text-slate-900 truncate">{value}</p>
      </div>
    </div>
  );
}