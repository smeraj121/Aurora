import { TrendingUp, TrendingDown } from 'lucide-react';
import type { DashboardMetric } from '../data/mockData';
import { cn } from '../../../lib/utils';


export function MetricCard({ title, value, change, isPositive, subtext }: DashboardMetric) {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
      <div className="mt-2 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        <span
          className={cn(
            'inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full',
            isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          )}
        >
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-slate-400">{subtext}</p>
    </div>
  );
}