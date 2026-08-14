import { useState, useEffect } from 'react';
import {
  Package,
  IndianRupee,
  Calendar,
  Check,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';
import type { CustomerPackage } from '../../../types/customerpackage.types';
import { BaseModal } from '../../modal/BaseModal';
import { api } from '../../../services/api';

interface EditCustomerPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerPackageId: number | null;
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
  customerPackageId,
  onUpdate,
}: EditCustomerPackageModalProps) {
  const [customerPackage, setCustomerPackage] = useState<CustomerPackage | null>(null);
  const [loadingPackage, setLoadingPackage] = useState(false);
  
  const [customPrice, setCustomPrice] = useState<number | ''>('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPackageData() {
      if (!isOpen || !customerPackageId) {
        setCustomerPackage(null);
        return;
      }

      try {
        setLoadingPackage(true);
        setError('');

        // Fetch package details by ID
        const response = await api.getCustomerPackageById(customerPackageId);
        if(!response.success) {
          throw new Error(response.message || 'Failed to fetch package details');
        }
        var data = response.data;
        setCustomerPackage(data);

        // Pre-fill form state
        setCustomPrice(data.customPrice || data.totalPrice || '');
        setExpiryDate(data.expiryDate || '');
        setNotes(data.notes || '');
        setPaymentStatus(data.paymentStatus || 'paid');
      } catch (err: any) {
        setError(err.message || 'Failed to load package details');
      } finally {
        setLoadingPackage(false);
      }
    }

    loadPackageData();
  }, [isOpen, customerPackageId]);

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
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update package');
    } finally {
      setSubmitting(false);
    }
  };

  const footerActions = (
    <>
      <button
        type="button"
        onClick={onClose}
        disabled={submitting || loadingPackage}
        className="btn-modal-secondary"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="edit-package-form"
        disabled={submitting || loadingPackage || !customerPackage}
        className="btn-modal-primary flex items-center gap-2"
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
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Package"
      icon={Package}
      error={error}
      footer={footerActions}
      maxWidth="max-w-md"
    >
      {loadingPackage ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-3 text-slate-500">
          <Loader2 className="w-7 h-7 animate-spin text-purple-600" />
          <p className="text-xs font-medium">Loading package details...</p>
        </div>
      ) : (
        <form id="edit-package-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="modal-label">Package Details</label>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <p className="text-sm font-semibold text-slate-900">
                {customerPackage?.packageName}
              </p>
              <div className="flex items-center gap-4 mt-1 text-xs text-slate-600">
                <span>
                  {customerPackage?.usedSessions}/{customerPackage?.totalSessions} sessions used
                </span>
                <span className="font-bold text-emerald-600">
                  {customerPackage?.remainingSessions} remaining
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className="text-slate-500">
                  Original: {formatCurrency(customerPackage?.totalPrice || 0)}
                </span>
                {customerPackage?.customPrice && (
                  <span className="text-purple-600 font-medium">
                    Custom: {formatCurrency(customerPackage.customPrice)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="modal-label">
              <IndianRupee className="w-3.5 h-3.5 text-purple-600 inline mr-1" />
              Custom Price (₹)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={customPrice}
              onChange={(e) =>
                setCustomPrice(e.target.value ? parseFloat(e.target.value) : '')
              }
              className="modal-input"
              placeholder="Enter custom price"
            />
          </div>

          <div>
            <label className="modal-label">
              <Calendar className="w-3.5 h-3.5 text-purple-600 inline mr-1" />
              Expiry Date
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="modal-input"
            />
          </div>

          <div>
            <label className="modal-label">
              <CreditCard className="w-3.5 h-3.5 text-purple-600 inline mr-1" />
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="modal-input"
            >
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="modal-label">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="modal-input resize-none"
              placeholder="Add notes about this package..."
            />
          </div>
        </form>
      )}
    </BaseModal>
  );
}