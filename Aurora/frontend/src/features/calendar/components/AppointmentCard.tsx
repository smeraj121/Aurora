import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  Clock,
  Check,
  Loader2,
  X,
  User,
  Phone,
  Package,
} from 'lucide-react';
import type { ExtendedAppointment } from '../types';
import { formatCurrency } from '../../../lib/utils';
import { computePaymentStatus, getPaymentConfig } from '../../../helper/status.helper';

interface AppointmentCardProps {
  appointment: ExtendedAppointment;
  isOverlapped?: boolean;
  topOffset: number;
  height: number;
  onClick: (apt: ExtendedAppointment) => void;
  onFinish: (id: number, e: React.MouseEvent) => Promise<boolean>;
  onCancel: (apt: ExtendedAppointment, e: React.MouseEvent) => Promise<void>;
  isCustomerActive: boolean;
}

export function AppointmentCard({
  appointment,
  isOverlapped = false,
  topOffset,
  height,
  onClick,
  onFinish,
  onCancel,
  isCustomerActive,
}: AppointmentCardProps) {
  const [isFinishing, setIsFinishing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const [popoverPosition, setPopoverPosition] = useState({
    top: 0,
    left: 0,
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStatus =
    localStatus || appointment.status || 'scheduled';

  const isCancelled = currentStatus === 'cancelled';
  //const isCompleted = currentStatus === 'completed';
  //const isScheduled = currentStatus === 'scheduled' || currentStatus === 'in_progress';

  const totalAmount = Number(appointment.amount || 0);
  const paidAmount = Number(appointment.paidAmount || 0);
  const dueAmount = Math.max(totalAmount - paidAmount, 0);

  const paymentStatus = computePaymentStatus(totalAmount,paidAmount,false).toLowerCase();

  // ============================================================
  // STATUS CONFIG
  // ============================================================

  const getStatusConfig = () => {
    switch (currentStatus) {
      case 'completed':
        return {
          label: 'Completed',
          bar: 'bg-emerald-500',
          iconBg: 'bg-emerald-50',
          iconColor: 'text-emerald-600',
          border: 'border-emerald-200',
          icon: Check,
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          bar: 'bg-rose-500',
          iconBg: 'bg-rose-50',
          iconColor: 'text-rose-600',
          border: 'border-rose-200',
          icon: X,
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          bar: 'bg-amber-500',
          iconBg: 'bg-amber-50',
          iconColor: 'text-amber-600',
          border: 'border-amber-200',
          icon: Clock,
        };
      case 'scheduled':
      default:
        return {
          label: 'Scheduled',
          bar: 'bg-amber-500',
          iconBg: 'bg-amber-50',
          iconColor: 'text-amber-600',
          border: 'border-amber-200',
          icon: Clock,
        };
    }
  };

  const statusConfig = getStatusConfig();
  const paymentConfig = getPaymentConfig(paymentStatus);

  const StatusIcon = statusConfig.icon;
  const PaymentIcon = paymentConfig.icon;

  const serviceName =
    appointment.services && appointment.services.length > 0
      ? appointment.services.map((s) => s.serviceName).join(', ')
      : appointment.serviceName || 'General Service';

  // ============================================================
  // HOVER HANDLERS
  // ============================================================

  const handleMouseEnter = () => {
    if(isCustomerActive) return;

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();

    const popoverWidth = 288;
    const gap = 8;
    const padding = 12;

    const spaceRight = window.innerWidth - rect.right;

    let left: number;

    if (spaceRight >= popoverWidth + gap) {
      left = rect.right + gap;
    } else {
      left = rect.left - popoverWidth - gap;
    }

    left = Math.max(
      padding,
      Math.min(
        left,
        window.innerWidth - popoverWidth - padding
      )
    );

    let top = rect.top;
    const popoverHeight = 350;

    if (top + popoverHeight > window.innerHeight - padding) {
      top = window.innerHeight - popoverHeight - padding;
    }

    top = Math.max(padding, top);

    setPopoverPosition({ top, left });
    setShowDetails(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowDetails(false);
    }, 120);
  };

  // ============================================================
  // CLOSE ON SCROLL
  // ============================================================

  useEffect(() => {
    if (!showDetails) return;

    const handleScroll = () => {
      setShowDetails(false);
    };

    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [showDetails]);

  // ============================================================
  // ACTIONS
  // ============================================================

  const handleFinishClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isFinishing) return;

    setIsFinishing(true);

    try {
      const completed = await onFinish(appointment.id || 0, e);
      if (completed) {
        setLocalStatus('completed');
        setShowDetails(false);
      }
    } finally {
      setIsFinishing(false);
    }
  };

  const handleCancelClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCancelling) return;

    setIsCancelling(true);
    try {
      await onCancel(appointment, e);
      setShowDetails(false);
    } catch {
      // The parent presents the backend error in the appointment modal.
    } finally {
      setIsCancelling(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      <div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => onClick(appointment)}
        style={{
          top: `${topOffset}px`,
          height: `${Math.max(height, 48)}px`,
        }}
        className={`
          group absolute left-1 right-1
          rounded-xl
          bg-white
          border border-slate-200
          cursor-pointer
          overflow-visible
          transition-all duration-150
          z-10
          hover:z-40
          hover:shadow-md
          ${isCancelled ? 'opacity-65' : ''}
        `}
      >
        <div
          className={`
            absolute left-0 top-0 bottom-0
            w-1.5 rounded-l-xl
            ${statusConfig.bar}
          `}
        />

        <div className="h-full pl-3.5 pr-2.5 flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h4
              className={`
                text-xs font-bold text-slate-900
                truncate
                ${isCancelled ? 'line-through text-slate-500' : ''}
              `}
            >
              {appointment.customerName || 'Walk-in Customer'}
            </h4>

            {/* Payment status icon */}
            <PaymentIcon
              className={`
                w-3.5 h-3.5 flex-shrink-0
                ${paymentConfig.iconColor}
              `}
            />

            <StatusIcon
              className={`
                w-3.5 h-3.5 flex-shrink-0
                ${statusConfig.iconColor}
              `}
            />
          </div>

          <p className="text-[10px] text-slate-500 truncate mt-0.5">
            {serviceName}
          </p>

          {height >= 80 && (
            <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {appointment.startTime}
              </span>

              <span>
                {appointment.durationMinutes}m
              </span>
            </div>
          )}
        </div>
      </div>

      {showDetails &&
        createPortal(
          <div
            onMouseEnter={() => {
              if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
              }
            }}
            onMouseLeave={handleMouseLeave}
            style={{
              position: 'fixed',
              top: `${popoverPosition.top}px`,
              left: `${popoverPosition.left}px`,
              width: '288px',
              zIndex: 9999,
            }}
          >
            <AppointmentHoverCard
              appointment={appointment}
              serviceName={serviceName}
              currentStatus={currentStatus}
              statusConfig={statusConfig}
              paymentConfig={paymentConfig}
              totalAmount={totalAmount}
              paidAmount={paidAmount}
              dueAmount={dueAmount}
              isOverlapped={isOverlapped}
              isFinishing={isFinishing}
              isCancelling={isCancelling}
              onFinish={handleFinishClick}
              onCancel={handleCancelClick}
            />
          </div>,
          document.body
        )}
    </>
  );
}

// ============================================================
// HOVER DETAILS CARD
// ============================================================

interface AppointmentHoverCardProps {
  appointment: ExtendedAppointment;
  serviceName: string;
  currentStatus: string;
  statusConfig: any;
  paymentConfig: any;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  isOverlapped: boolean;
  isFinishing: boolean;
  isCancelling: boolean;
  onFinish: (e: React.MouseEvent) => void;
  onCancel: (e: React.MouseEvent) => void;
}

function AppointmentHoverCard({
  appointment,
  serviceName,
  currentStatus,
  statusConfig,
  paymentConfig,
  totalAmount,
  paidAmount,
  dueAmount,
  isOverlapped,
  isFinishing,
  isCancelling,
  onFinish,
  onCancel,
}: AppointmentHoverCardProps) {
  const StatusIcon = statusConfig.icon;
  const PaymentIcon = paymentConfig.icon;

  const canFinish = currentStatus === 'scheduled' || currentStatus === 'in_progress' || currentStatus === 'confirmed';
  
  return (
    <div
      className="
        w-full
        rounded-xl
        bg-white
        border border-slate-200
        shadow-2xl
        overflow-hidden
      "
    >
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-slate-900 truncate">
              {appointment.customerName || 'Walk-in Customer'}
            </h4>

            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {serviceName}
            </p>
          </div>

          <span
            className={`
              flex items-center gap-1
              px-2 py-1
              rounded-lg
              border
              text-[10px]
              font-semibold
              whitespace-nowrap
              ${statusConfig.iconBg}
              ${statusConfig.iconColor}
              ${statusConfig.border}
            `}
          >
            <StatusIcon className="w-3 h-3" />
            {statusConfig.label}
          </span>
        </div>
      </div>

      <div className="px-4 py-3 space-y-2.5">
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-slate-400" />

          <div>
            <p className="text-[10px] text-slate-400">
              Appointment
            </p>

            <p className="text-xs font-semibold text-slate-700">
              {appointment.startTime}
              {' • '}
              {appointment.durationMinutes} min
            </p>
          </div>
        </div>

        {appointment.staffName && (
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 text-slate-400" />

            <div>
              <p className="text-[10px] text-slate-400">
                Staff
              </p>

              <p className="text-xs font-semibold text-slate-700">
                {appointment.staffName}
              </p>
            </div>
          </div>
        )}

        {appointment.customerPhone && (
          <div className="flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-slate-400" />

            <div>
              <p className="text-[10px] text-slate-400">
                Customer
              </p>

              <p className="text-xs font-semibold text-slate-700">
                {appointment.customerPhone}
              </p>
            </div>
          </div>
        )}

        {appointment.isPackageAppointment && (
          <div className="flex items-center gap-2.5">
            <Package className="w-4 h-4 text-indigo-500" />

            <span className="text-xs font-semibold text-indigo-700">
              Package Appointment
            </span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400">
                Payment
              </p>

              <p className="text-sm font-bold text-slate-900">
                {formatCurrency(totalAmount)}
              </p>
            </div>

            <span
              className={`
                inline-flex items-center gap-1
                px-2 py-1
                rounded-lg
                border
                text-[10px]
                font-semibold
                ${paymentConfig.className}
              `}
            >
              <PaymentIcon className="w-3 h-3" />

              {paymentConfig.label}
            </span>
          </div>

          {paymentStatusText(
            paidAmount,
            dueAmount,
            totalAmount
          )}
        </div>

        {isOverlapped && (
          <div className="
            flex items-center gap-2
            px-2.5 py-2
            rounded-lg
            bg-amber-50
            border border-amber-200
            text-amber-700
          ">
            <AlertCircle className="w-3.5 h-3.5" />

            <span className="text-[10px] font-semibold">
              Overlapping appointment
            </span>
          </div>
        )}
      </div>

      {canFinish && (
        <div className="
    px-3 py-2.5
    border-t border-slate-100
    bg-slate-50
    flex items-center gap-2
  ">
          {/* Cancel */}
          <button
            type="button"
            onClick={onCancel}
            disabled={isCancelling || isFinishing}
            className="
        flex-1
        h-9
        rounded-lg
        border border-rose-200
        bg-white
        text-rose-600
        hover:bg-rose-50
        text-xs
        font-semibold
        transition-colors
        flex items-center justify-center gap-1.5
      "
          >
            <X className="w-3.5 h-3.5" />
            {isCancelling ? 'Cancelling...' : 'Cancel'}
          </button>

          {/* Finish */}
          <button
            type="button"
            onClick={onFinish}
            disabled={isFinishing}
            className="
        flex-1
        h-9
        rounded-lg
        bg-emerald-600
        text-white
        hover:bg-emerald-700
        text-xs
        font-semibold
        transition-colors
        flex items-center justify-center gap-1.5
        disabled:opacity-50
        disabled:cursor-not-allowed
      "
          >
            {isFinishing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Finishing...
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                Finish
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PAYMENT SUMMARY
// ============================================================

function paymentStatusText(
  paidAmount: number,
  dueAmount: number,
  totalAmount: number
) {
  if (paidAmount >= totalAmount && totalAmount > 0) {
    return (
      <p className="text-[10px] text-emerald-600 mt-1">
        Paid {formatCurrency(paidAmount)}
      </p>
    );
  }

  if (paidAmount > 0) {
    return (
      <p className="text-[10px] text-amber-600 mt-1">
        Paid {formatCurrency(paidAmount)}
        {' • '}
        Due {formatCurrency(dueAmount)}
      </p>
    );
  }

  return (
    <p className="text-[10px] text-rose-600 mt-1">
      Due {formatCurrency(dueAmount)}
    </p>
  );
}
