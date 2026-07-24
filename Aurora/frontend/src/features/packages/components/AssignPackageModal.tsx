// views/customers/components/AssignPackageModal.tsx
import { useState, useEffect } from 'react';
import {
  X,
  Circle,
  IndianRupee,
  Calendar,
  AlertCircle,
  Check,
  Edit2,
  Percent,
  Users,
  CreditCard,
} from 'lucide-react';
import { api } from '../../../services/api';
import { cn, formatCurrency } from '../../../lib/utils';
import type { Package } from '../../../shared/types/packages';


interface AssignPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: number;
  customerName: string;
  onAssign: (data: {
    packageId: number;
    customPrice?: number;
    paymentMethod?: string;
    notes?: string;
    expiryDate?: string;
  }) => Promise<void>;
}

export function AssignPackageModal({
  isOpen,
  onClose,
  customerId,
  customerName,
  onAssign,
}: AssignPackageModalProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [customPrice, setCustomPrice] = useState<number | ''>('');
  const [useCustomPrice, setUseCustomPrice] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load available packages
  useEffect(() => {
    if (isOpen) {
      loadPackages();
      // Set default expiry date to 1 year from now
      const defaultExpiry = new Date();
      defaultExpiry.setFullYear(defaultExpiry.getFullYear() + 1);
      setExpiryDate(defaultExpiry.toISOString().split('T')[0]);
      resetForm();
    }
  }, [isOpen]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const { data } = await api.getPackages(true); // Include inactive to show all
      setPackages(data || []);
    } catch (error) {
      console.error('Failed to load packages:', error);
      setError('Failed to load packages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedPackage(null);
    setCustomPrice('');
    setUseCustomPrice(false);
    setPaymentMethod('cash');
    setNotes('');
    setError('');
    setSuccess(false);
    setSubmitting(false);
  };

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
    setCustomPrice(pkg.totalPrice);
    setUseCustomPrice(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!selectedPackage) {
    setError('Please select a package');
    return;
  }

  const finalPrice = useCustomPrice && customPrice ? Number(customPrice) : selectedPackage.totalPrice;
  
  if (finalPrice <= 0) {
    setError('Price must be greater than 0');
    return;
  }

  try {
    setSubmitting(true);
    setError('');

    const assignmentData = {
      packageId: selectedPackage.id,
      customPrice: useCustomPrice ? finalPrice : undefined,
      paymentMethod: paymentMethod || undefined,
      notes: notes || undefined,
      expiryDate: expiryDate || undefined,
    };

    await onAssign(assignmentData);
    setSuccess(true);
    
    setTimeout(() => {
      resetForm();
      onClose();
    }, 1500);
    
  } catch (err: any) {
    // If error is about duplicate package, show friendly message
    if (err.message?.includes('already has an active instance')) {
      setError('This customer already has an active instance of this package. You can assign it again or update the existing one.');
    } else {
      setError(err.message || 'Failed to assign package');
    }
  } finally {
    setSubmitting(false);
  }
};
  const handleClose = () => {
    if (!submitting) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Circle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Assign Package to Customer</h3>
              <p className="text-xs text-purple-200 opacity-80">
                {customerName} • Package assignment with custom pricing
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 px-6 flex items-center gap-2.5 text-xs text-emerald-600">
            <Check className="w-4 h-4 shrink-0" />
            <p>Package assigned successfully!</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-3 px-6 flex items-center gap-2.5 text-xs text-rose-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-160px)] space-y-5">
          {/* Customer Info */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-semibold text-slate-700">Customer:</span>
                <span className="text-xs font-bold text-slate-900">{customerName}</span>
              </div>
              <span className="text-[10px] text-slate-500">ID: #{customerId}</span>
            </div>
          </div>

          {/* Package Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select Package <span className="text-rose-500">*</span>
            </label>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : packages.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-500">
                <Circle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p>No packages available</p>
                <p className="text-xs mt-1">Create a package first in the Packages section</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {packages.map((pkg) => {
                  const isSelected = selectedPackage?.id === pkg.id;
                  const isInactive = !pkg.isActive;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => handlePackageSelect(pkg)}
                      disabled={isInactive}
                      className={cn(
                        'p-3 rounded-xl border text-left transition-all hover:shadow-sm',
                        isSelected
                          ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-500/20'
                          : 'border-slate-200 hover:border-purple-200 hover:bg-slate-50',
                        isInactive && 'opacity-50 cursor-not-allowed bg-slate-50'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {pkg.name}
                            {isInactive && (
                              <span className="ml-2 text-[10px] font-medium text-rose-500">(Inactive)</span>
                            )}
                          </p>
                          {pkg.description && (
                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                              {pkg.description}
                            </p>
                          )}
                        </div>
                        {isSelected && !isInactive && (
                          <Check className="w-4 h-4 text-purple-600 shrink-0 ml-2" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-[10px]">
                        <span className="font-bold text-emerald-600">
                          {formatCurrency(pkg.totalPrice)}
                        </span>
                        <span className="text-slate-400">
                          {pkg.totalSessions} sessions
                        </span>
                        {pkg.discountPercentage > 0 && (
                          <span className="text-amber-600 font-medium">
                            {pkg.discountPercentage}% off
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Custom Price Section */}
          {selectedPackage && selectedPackage.isActive && (
            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center gap-3 mb-3">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={useCustomPrice}
                    onChange={(e) => {
                      setUseCustomPrice(e.target.checked);
                      if (!e.target.checked) {
                        setCustomPrice(selectedPackage.totalPrice);
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                  <Edit2 className="w-3.5 h-3.5 text-purple-600" />
                  Use Custom Price
                </label>
                <span className="text-[10px] text-slate-400">
                  (Original: {formatCurrency(selectedPackage.totalPrice)})
                </span>
              </div>

              {useCustomPrice && (
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] font-medium text-slate-600 mb-1">
                      Custom Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value ? parseFloat(e.target.value) : '')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                      placeholder="Enter custom price"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-medium text-slate-600 mb-1">
                      Discount Applied
                    </label>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-600">
                      {customPrice && typeof customPrice === 'number' 
                        ? formatCurrency(selectedPackage.totalPrice - customPrice)
                        : formatCurrency(0)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment & Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                <CreditCard className="w-3.5 h-3.5 inline mr-1 text-purple-600" />
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                <Calendar className="w-3.5 h-3.5 inline mr-1 text-purple-600" />
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 resize-none"
              placeholder="Add any notes about this package assignment..."
            />
          </div>

          {/* Summary */}
          {selectedPackage && selectedPackage.isActive && (
            <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-900">Package Summary</span>
                  <p className="text-[10px] text-purple-700 mt-0.5">
                    {selectedPackage.name} • {selectedPackage.totalSessions} sessions
                  </p>
                </div>
                <div className="text-right">
                  {useCustomPrice && customPrice && Number(customPrice) < selectedPackage.totalPrice && (
                    <div className="text-xs text-purple-600 line-through">
                      {formatCurrency(selectedPackage.totalPrice)}
                    </div>
                  )}
                  <div className="text-lg font-extrabold text-purple-900">
                    {formatCurrency(
                      useCustomPrice && customPrice && typeof customPrice === 'number'
                        ? customPrice
                        : selectedPackage.totalPrice
                    )}
                  </div>
                </div>
              </div>
              {useCustomPrice && customPrice && typeof customPrice === 'number' && customPrice < selectedPackage.totalPrice && (
                <div className="mt-2 pt-2 border-t border-purple-200 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-emerald-600">
                    Customer Savings
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600">
                    {formatCurrency(selectedPackage.totalPrice - customPrice)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedPackage || (selectedPackage && !selectedPackage.isActive)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4" />
                  Assign Package
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}