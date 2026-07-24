// views/customers/components/EditCustomerPackageModal.tsx
import { useState, useEffect } from 'react';
import {
  X,
  Package,
  IndianRupee,
  Calendar,
  AlertCircle,
  Check,
  Edit2,
  CreditCard,
} from 'lucide-react';
import { cn, formatCurrency } from '../../../lib/utils';
import type { CustomerPackage } from '../../../shared/types/domain';

interface EditCustomerPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerPackage: CustomerPackage | null;
  onUpdate: (data: {
    customPrice?: number;
    expiryDate?: string;
    notes?: string;
    paymentStatus?: string;
  }) => Promise<void>;
}

export function EditCustomerPackageModal({
  isOpen,
  onClose,
  customerPackage,
  onUpdate,
}: EditCustomerPackageModalProps) {
  const [customPrice, setCustomPrice] = useState<number | ''>('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && customerPackage) {
      setCustomPrice(customerPackage.customPrice || customerPackage.totalPrice || '');
      setExpiryDate(customerPackage.expiryDate || '');
      setNotes(customerPackage.notes || '');
      setPaymentStatus(customerPackage.paymentStatus || 'paid');
      setError('');
      setSuccess(false);
    }
  }, [isOpen, customerPackage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerPackage) return;

    try {
      setSubmitting(true);
      setError('');

      const updateData = {
        customPrice: customPrice ? Number(customPrice) : undefined,
        expiryDate: expiryDate || undefined,
        notes: notes || undefined,
        paymentStatus: paymentStatus || undefined,
      };

      await onUpdate(updateData);
      setSuccess(true);
      
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || 'Failed to update package');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !customerPackage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-base">Edit Package</h3>
              <p className="text-xs text-purple-200 opacity-80">
                {customerPackage.packageName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 px-6 flex items-center gap-2.5 text-xs text-emerald-600">
            <Check className="w-4 h-4 shrink-0" />
            <p>Package updated successfully!</p>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-3 px-6 flex items-center gap-2.5 text-xs text-rose-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Package Details
            </label>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <p className="text-sm font-semibold text-slate-900">{customerPackage.packageName}</p>
              <div className="flex items-center gap-4 mt-1 text-xs text-slate-600">
                <span>{customerPackage.usedSessions}/{customerPackage.totalSessions} sessions used</span>
                <span className="font-bold text-emerald-600">
                  {customerPackage.remainingSessions} remaining
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className="text-slate-500">Original: {formatCurrency(customerPackage.totalPrice)}</span>
                {customerPackage.customPrice && (
                  <span className="text-purple-600 font-medium">
                    Custom: {formatCurrency(customerPackage.customPrice)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              <IndianRupee className="w-3.5 h-3.5 inline mr-1 text-purple-600" />
              Custom Price (₹)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value ? parseFloat(e.target.value) : '')}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              placeholder="Enter custom price"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              <Calendar className="w-3.5 h-3.5 inline mr-1 text-purple-600" />
              Expiry Date
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              <CreditCard className="w-3.5 h-3.5 inline mr-1 text-purple-600" />
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            >
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 resize-none"
              placeholder="Add notes about this package..."
            />
          </div>

          <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Update Package
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}