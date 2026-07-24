import { Package } from 'lucide-react';
import type { CustomerPackage } from '../types/types';

interface PackageSectionProps {
  isExistingCustomer: boolean;
  customerPackages: CustomerPackage[];
  isPackageAppointment: boolean;
  showPackageSelector: boolean;
  onTogglePackageSelector: () => void;
  onSelectPackage: (packageId: string) => void;
  onRemovePackage: () => void;
}

export function PackageSection({
  isExistingCustomer,
  customerPackages,
  isPackageAppointment,
  showPackageSelector,
  onTogglePackageSelector,
  onSelectPackage,
  onRemovePackage,
}: PackageSectionProps) {
  if (!isExistingCustomer || customerPackages.length === 0) {
    return null;
  }

  const handleToggle = () => {
    if (isPackageAppointment) {
      onRemovePackage();
    } else {
      onTogglePackageSelector();
    }
  };

  return (
    <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-semibold text-purple-900">Use Package</span>
          {isPackageAppointment && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Active</span>}
        </div>
        <button type="button" onClick={handleToggle} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${isPackageAppointment ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
          {isPackageAppointment ? 'Remove Package' : 'Apply Package'}
        </button>
      </div>

      {showPackageSelector && !isPackageAppointment && (
        <div className="mt-3 space-y-2">
          {customerPackages.map((pkg) => (
            <button key={pkg.id} type="button" onClick={() => onSelectPackage(String(pkg.id))} className="w-full text-left bg-white p-3 rounded-lg border border-slate-200 hover:border-purple-300 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-800">{pkg.packageName}</p>
                  <p className="text-[10px] text-slate-500">{pkg.remainingSessions} of {pkg.totalSessions} sessions remaining {pkg.expiryDate && `• Expires: ${new Date(pkg.expiryDate).toLocaleDateString()}`}</p>
                </div>
                <span className="text-[10px] font-medium bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Select</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}