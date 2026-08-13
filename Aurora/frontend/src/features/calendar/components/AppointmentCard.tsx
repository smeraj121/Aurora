import React, { useState } from 'react';
import { Package, AlertCircle, CheckCircle2, XCircle, Clock, Check, Loader2, X } from 'lucide-react';
import type { ExtendedAppointment } from '../types';
import { formatCurrency } from '../../../lib/utils';

interface AppointmentCardProps {
  appointment: ExtendedAppointment;
  isOverlapped?: boolean;
  topOffset: number;
  height: number;
  onClick: (apt: ExtendedAppointment) => void;
  onFinish: (id: number, e: React.MouseEvent) => Promise<void>;
  onCancel: (apt: ExtendedAppointment, e: React.MouseEvent) => void;
}

export function AppointmentCard({
  appointment,
  isOverlapped = false,
  topOffset,
  height,
  onClick,
  onFinish,
  onCancel,
}: AppointmentCardProps) {
  const [isFinishing, setIsFinishing] = useState(false);
  const [localStatus, setLocalStatus] = useState<string | null>(null);

  const currentStatus = localStatus || appointment.status || 'scheduled';
  const isCancelled = currentStatus === 'cancelled';
  const isCompleted = currentStatus === 'completed';
  const isScheduled = currentStatus === 'scheduled';
  const isLongAppointment = height >= 90; // Over 60 mins duration

  const totalAmount = Number(appointment.amount || 0);
  const paidAmount = Number(appointment.paidAmount || 0);
  const dueAmount = totalAmount - paidAmount;
  const paymentStatus = (appointment.paymentStatus || (paidAmount >= totalAmount ? 'paid' : paidAmount > 0 ? 'partial' : 'pending')).toLowerCase();

  // Status Styling Configuration
  const getStatusBadge = () => {
    switch (currentStatus) {
      case 'completed':
        return {
          label: 'Completed',
          chipBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          dot: '🟢',
          accentBorder: 'bg-emerald-500',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          chipBg: 'bg-rose-50 text-rose-700 border-rose-200/80',
          dot: '🔴',
          accentBorder: 'bg-rose-500',
        };
      case 'scheduled':
      default:
        return {
          label: 'Scheduled',
          chipBg: 'bg-purple-50 text-purple-700 border-purple-200/80',
          dot: '🟣',
          accentBorder: 'bg-purple-500',
        };
    }
  };

  // Payment Status Styling
  const getPaymentBadge = () => {
    switch (paymentStatus) {
      case 'paid':
        return { label: 'Paid', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '🟢' };
      case 'partial':
        return { label: 'Partial', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200', icon: '🔵' };
      case 'refund':
        return { label: 'Refund', badgeClass: 'bg-amber-100 text-amber-800 border-amber-200', icon: '🟠' };
      case 'pending':
      default:
        return { label: 'Pending', badgeClass: 'bg-rose-100 text-rose-800 border-rose-200', icon: '🔴' };
    }
  };

  const statusConfig = getStatusBadge();
  const paymentConfig = getPaymentBadge();

  const handleFinishClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFinishing) return;
    setIsFinishing(true);
    try {
      await onFinish(appointment.id || 0, e);
      setLocalStatus('completed');
    } catch {
      // Handled by parent
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <div
      onClick={() => onClick(appointment)}
      style={{
        top: `${topOffset}px`,
        height: `${Math.max(height, 48)}px`,
      }}
      className={`group absolute left-1 right-1 rounded-xl bg-white border border-slate-200/90 transition-all duration-200 ease-in-out cursor-pointer overflow-hidden z-10 hover:z-30 hover:shadow-xl hover:scale-[1.015] ${
        isCancelled ? 'opacity-60 bg-slate-50/50' : 'shadow-sm'
      }`}
    >
      {/* Accent Color Strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${statusConfig.accentBorder}`} />

      <div className="pl-3.5 pr-2.5 py-1.5 h-full flex flex-col justify-between text-xs relative">
        {/* Top Header Row: Status Chip, Overlap & Payment/Package Badges */}
        <div className="flex items-center justify-between gap-1 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-bold ${statusConfig.chipBg}`}>
              <span className="text-[8px]" title={statusConfig.label} >
                {statusConfig.dot}
              </span>
            </span>

            {isOverlapped && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-extrabold animate-pulse">
                <AlertCircle className="w-2.5 h-2.5" />
                Overlap
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {appointment.isPackageAppointment && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9px] font-bold tracking-wider">
                PKG
              </span>
            )}

            {!isCancelled && (
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[9px] font-bold ${paymentConfig.badgeClass}`}>
                <span title={paymentConfig.label}> {paymentConfig.icon}</span>
              </span>
            )}
          </div>
        </div>

        {/* Center Section: Customer Name & Services */}
        <div className="my-1">
          <h4 className={`font-bold text-slate-900 truncate text-xs ${isCancelled ? 'line-through text-slate-500' : ''}`}>
            {appointment.customerName || 'Walk-in Customer'}
          </h4>

          <p className="text-[11px] text-slate-600 truncate font-medium">
            {appointment.services && appointment.services.length > 0
              ? appointment.services.map((s) => s.serviceName).join(', ')
              : appointment.serviceName || 'General Service'}
          </p>

          {/* Long Appointment Details Expansion */}
          {isLongAppointment && (
            <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {appointment.startTime} ({appointment.durationMinutes}m)
              </span>
              {appointment.customerPhone && <span className="truncate max-w-[110px]">{appointment.customerPhone}</span>}
            </div>
          )}
        </div>

        {/* Bottom Section: Simplified Financials & Duration */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 border-t border-slate-100/80 pt-1 mt-auto">
          {isCancelled ? (
            <span className="text-rose-600 font-bold text-[10px] truncate">
              {appointment.cancellationReason ? `Reason: ${appointment.cancellationReason}` : 'Booking Cancelled'}
            </span>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900">{formatCurrency(totalAmount)}</span>
                {paymentStatus === 'partial' && (
                  <span className="text-blue-600 text-[10px] font-semibold">(Paid {formatCurrency(paidAmount)})</span>
                )}
                {paymentStatus === 'pending' && (
                  <span className="text-rose-600 text-[10px] font-semibold">(Due {formatCurrency(dueAmount)})</span>
                )}
              </div>

              <span className="text-[10px] text-slate-400 font-semibold group-hover:opacity-40 transition-opacity">
                {appointment.durationMinutes}m
              </span>
            </>
          )}
        </div>

        {/* Hover Slide-up Quick Action Bar */}
        {isScheduled && (
          <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 px-2 py-1.5 flex items-center justify-end gap-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancel(appointment, e);
              }}
              aria-label='Cancel'
              title='Cancel'
              className="px-2 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[10px] font-bold transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
            </button>

            <button
              onClick={handleFinishClick}
              disabled={isFinishing}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] font-bold shadow-sm transition-colors flex items-center gap-1 disabled:opacity-50"
              aria-label='Finish'
              title='Finish'
            >
              {isFinishing ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <Check className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}