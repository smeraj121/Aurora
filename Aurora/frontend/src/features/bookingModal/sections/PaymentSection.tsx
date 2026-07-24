import { DollarSign, CreditCard, ChevronDown } from 'lucide-react';
import { PAYMENT_STATUS_OPTIONS } from '../types/constants';
import type { PaymentStatus } from '../../../shared/types/booking';

interface PaymentSectionProps {
  amount: number;
  onAmountChange: (amount: number) => void;
  paymentStatus: PaymentStatus;
  onPaymentStatusChange: (status: PaymentStatus) => void;
  paidAmount: number;
  onPaidAmountChange: (amount: number) => void;
  isPackageAppointment: boolean;
}

export function PaymentSection({
  amount,
  onAmountChange,
  paymentStatus,
  onPaymentStatusChange,
  paidAmount,
  onPaidAmountChange,
  isPackageAppointment,
}: PaymentSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-purple-600" /> Total (₹)
        </label>
        <input type="number" step="0.01" value={amount} onChange={(e) => onAmountChange(parseFloat(e.target.value) || 0)} placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600" disabled={isPackageAppointment} />
        {isPackageAppointment && <p className="text-[10px] text-emerald-600 mt-1">Covered by package</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-purple-600" /> Payment Status
        </label>
        <div className="relative">
          <select value={paymentStatus} onChange={(e) => onPaymentStatusChange(e.target.value as PaymentStatus)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600 appearance-none cursor-pointer">
            {PAYMENT_STATUS_OPTIONS.map((status) => (
              <option key={status.id} value={status.id}>{status.label}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-purple-600" /> Received (₹)
        </label>
        <input type="number" step="0.01" value={paidAmount} onChange={(e) => onPaidAmountChange(parseFloat(e.target.value) || 0)} placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600" disabled={isPackageAppointment} />
        {isPackageAppointment && <p className="text-[10px] text-emerald-600 mt-1">Already paid via package</p>}
      </div>
    </div>
  );
}