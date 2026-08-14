import { Check, Package } from 'lucide-react';
import type { CustomerPackage, CustomerPackageServiceItem } from '../../../types/customerpackage.types';


interface PackageSectionProps {
  isExistingCustomer: boolean;
  customerPackages: CustomerPackage[];
  isPackageAppointment: boolean;
  showPackageSelector: boolean;
  selectedPackageId: string | null;
  selectedServices: number[];
  onOpenPackageSelector: () => void;
  onSelectPackage: (packageId: string) => void;
  onTogglePackageService: (service: CustomerPackageServiceItem) => void;
  onRemovePackage: () => void;
}

export function PackageSection({
  isExistingCustomer,
  customerPackages,
  isPackageAppointment,
  showPackageSelector,
  selectedPackageId,
  selectedServices,
  onOpenPackageSelector,
  onSelectPackage,
  onTogglePackageService,
  onRemovePackage,
}: PackageSectionProps) {
  if (!isExistingCustomer || customerPackages.length === 0) {
    return null;
  }

  const activePackage = customerPackages.find((pkg) => String(pkg.id) === selectedPackageId);

  const handleToggle = () => {
    if (isPackageAppointment) {
      onRemovePackage();
    } else {
      onOpenPackageSelector();
    }
  };

  return (
    <div className="bg-purple-50/70 rounded-xl p-3.5 border border-purple-200 space-y-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-semibold text-purple-900">Use Package</span>
          {isPackageAppointment && (
            <span className="text-[10px] bg-emerald-100 text-emerald-700 font-medium px-2 py-0.5 rounded-full">
              Active
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleToggle}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            isPackageAppointment
              ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {isPackageAppointment ? 'Remove Package' : 'Apply Package'}
        </button>
      </div>

      {/* Package Selector Cards (When applying) */}
      {showPackageSelector && !isPackageAppointment && (
        <div className="space-y-2">
          {customerPackages.map((pkg) => (
            <button
              key={pkg.id}
              type="button"
              onClick={() => onSelectPackage(String(pkg.id))}
              className="w-full text-left bg-white p-3 rounded-xl border border-slate-200 hover:border-purple-400 hover:shadow-xs transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">{pkg.packageName}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {pkg.remainingSessions} of {pkg.totalSessions} sessions remaining
                    {pkg.expiryDate && ` • Expires: ${new Date(pkg.expiryDate).toLocaleDateString()}`}
                  </p>
                </div>
                <span className="text-[10px] font-semibold bg-purple-100 text-purple-700 px-2.5 py-1 rounded-lg">
                  Select
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Active Package Service Selector */}
      {isPackageAppointment && activePackage && (
        <div className="bg-white rounded-xl p-3 border border-purple-200 space-y-2">
          <p className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
            <span>Select Included Services for Today:</span>
            <span className="text-[10px] font-normal text-purple-700">{activePackage.packageName}</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {activePackage.services.map((svc) => {
              const isSelected = selectedServices.includes(svc.serviceId);
              const isExhausted = svc.usedQuantity >= (svc.totalQuantity||0);

              return (
                <button
                  key={svc.serviceId}
                  type="button"
                  disabled={isExhausted}
                  onClick={() => onTogglePackageService(svc)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs text-left transition-all ${
                    isExhausted
                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500/20 cursor-pointer'
                      : 'bg-white border-slate-200 hover:border-purple-300 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <span className="font-medium text-slate-800 truncate">{svc.serviceName}</span>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                      isExhausted
                        ? 'bg-rose-100 text-rose-700'
                        : isSelected
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {svc.usedQuantity}/{svc.totalQuantity} Used
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}