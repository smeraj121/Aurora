import { useState } from 'react';
import { IndianRupee, Edit2 } from 'lucide-react';

interface PaymentSectionProps {
  amount: number;
  onAmountChange: (amount: number) => void;
  paidAmount: number;
  onPaidAmountChange: (amount: number) => void;
  isPackageAppointment: boolean;
  isEditable: boolean;
}

export function PaymentSection({
  amount,
  onAmountChange,
  paidAmount,
  onPaidAmountChange,
  isPackageAppointment,
  isEditable,
}: PaymentSectionProps) {
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const canEditTotal = isEditable && !isPackageAppointment;

  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1">
      <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 whitespace-nowrap">
        <IndianRupee className="w-3 h-3 text-purple-600" /> Total
      </label>
      <div>
        {isEditingTotal && canEditTotal ? (
          <input
            type="text"
            value={amount}
            onChange={(e) => onAmountChange(parseFloat(e.target.value) || 0)}
            onBlur={() => setIsEditingTotal(false)}
            autoFocus
            className="w-full bg-slate-50 border border-purple-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-600"
          />
        ) : (
          <button
            type="button"
            onClick={() => canEditTotal && setIsEditingTotal(true)}
            disabled={!canEditTotal}
            className="w-full rounded-xl px-1.5 py-0.5 text-xs font-bold text-slate-900 flex items-center justify-between group disabled:cursor-default hover:border-purple-300 transition-colors"
          >
            <span>₹{amount}</span>
            {canEditTotal && (
              <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-purple-600 transition-colors" />
            )}
          </button>
        )}
      </div>

      {/* Received: staff-only, non-package only — never rendered for customers */}
      {isEditable && !isPackageAppointment && (
        <>
          <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 whitespace-nowrap">
            <IndianRupee className="w-3 h-3 text-purple-600" /> Received
          </label>
          <div>
            <input
              type="text"
              value={paidAmount || ''}
              onChange={(e) => onPaidAmountChange(parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600 [appearance:textfield]"
            />
          </div>
        </>
      )}
    </div>
  );
}