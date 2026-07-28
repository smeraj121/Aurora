import { Package } from 'lucide-react';
import { cn, formatCurrency } from '../../../lib/utils';
import type { AppointmentCardData, AppointmentCardProps } from '../types/calender.types';

// ---- Helpers ----
function getStatusColor(status: string): string {
  switch (status) {
    case 'scheduled':
      return 'bg-violet-50 border-violet-200 text-violet-950';
    case 'confirmed':
      return 'bg-blue-50/80 border-blue-200 text-blue-950';
    case 'in_progress':
      return 'bg-purple-50 border-purple-300 text-purple-950 ring-2 ring-purple-500/20';
    case 'completed':
      return 'bg-emerald-50/80 border-emerald-200 text-emerald-950';
    case 'cancelled':
      return 'bg-rose-50/80 border-rose-200 text-rose-950';
    default:
      return 'bg-slate-50 border-slate-200 text-slate-950';
  }
}

function getPaymentBadge(paymentStatus?: string) {
  switch (paymentStatus) {
    case 'paid':
      return <span className="text-[10px] font-medium bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Paid</span>;
    case 'partial':
      return <span className="text-[10px] font-medium bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Partial</span>;
    case 'pending':
      return <span className="text-[10px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Pending</span>;
    default:
      return null;
  }
}

function getServiceNames(appointment: AppointmentCardData): string {
  if (appointment.services && appointment.services.length > 0) {
    return appointment.services.map((s) => s.serviceName).join(', ');
  }
  return appointment.serviceName || 'Service';
}

function getServiceCount(appointment: AppointmentCardData): number {
  if (appointment.services && appointment.services.length > 0) {
    return appointment.services.length;
  }
  return appointment.serviceName ? 1 : 0;
}

// ---- Component ----
export function AppointmentCard({ appointment, cardHeight, onClick }: AppointmentCardProps) {
  const serviceNames = getServiceNames(appointment);
  const serviceCount = getServiceCount(appointment);

  return (
    <div
      onClick={onClick}
      style={{ height: `${cardHeight}px` }}
      className={cn(
        'absolute top-0.5 left-0.5 right-0.5 p-2 rounded-xl border text-xs flex flex-col justify-between shadow-sm transition-all hover:scale-[1.01] hover:z-20 cursor-pointer overflow-hidden',
        getStatusColor(appointment.status || 'scheduled')
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-1">
          <span className="font-bold text-slate-900 text-xs truncate">
            {appointment.customerName}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {appointment.isPackageAppointment && (
              <Package className="w-3 h-3 text-purple-600" />
            )}
            {getPaymentBadge(appointment.paymentStatus)}
          </div>
        </div>

        <p className="text-[10px] font-medium text-slate-600 mt-0.5 truncate">
          {serviceNames}
          {serviceCount > 1 && (
            <span className="ml-1 text-[10px] font-bold text-purple-600">
              (+{serviceCount - 1})
            </span>
          )}
        </p>

        {appointment.isPackageAppointment && appointment.packageName && (
          <p className="text-[9px] font-medium text-purple-600 mt-0.5 truncate">
            📦 {appointment.packageName}
          </p>
        )}
      </div>

      <div className="mt-1 flex items-center justify-between text-[10px] font-semibold border-t border-slate-200/40 pt-1">
        <div className="flex items-center gap-1 flex-wrap">
          <span>{formatCurrency(appointment.amount || 0)}</span>
          {appointment.paidAmount !== undefined && appointment.paidAmount > 0 && (
            <span className="text-[9px] text-slate-400">
              (₹{appointment.paidAmount})
            </span>
          )}
          {appointment.balanceDue !== undefined && appointment.balanceDue > 0 && (
            <span className="text-[9px] text-amber-600 font-bold">
              Bal: ₹{appointment.balanceDue}
            </span>
          )}
        </div>
        <span className="capitalize text-[9px] opacity-75">
          {appointment.durationMinutes}m
        </span>
      </div>
    </div>
  );
}