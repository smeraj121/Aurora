import { Plus, Scissors, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { PackageService } from '../types/types';
import type { ServiceItem } from '../../../shared/types/booking';

interface ServiceSectionProps {
  services: PackageService[];
  serviceList: ServiceItem[];
  isPackageAppointment: boolean;
  onAddService: (serviceId: string) => void;
  onRemoveService: (serviceId: number) => void;
}

export function ServiceSection({
  services,
  serviceList,
  isPackageAppointment,
  onAddService,
  onRemoveService,
}: ServiceSectionProps) {
  const [selectedServiceId, setSelectedServiceId] = useState('');

  const handleAddClick = () => {
    onAddService(selectedServiceId);
    setSelectedServiceId(''); // Reset after adding
  };

  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
        <Scissors className="w-3.5 h-3.5 text-purple-600" /> Services <span className="text-rose-500">*</span>
        {services.length > 0 && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full ml-1">{services.length} selected</span>}
      </label>

      {!isPackageAppointment && (
        <div className="flex gap-2">
          <select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600 cursor-pointer"
          >
            <option value="">-- Add Service --</option>
            {serviceList
              .filter((s) => !services.some((added) => added.serviceId === s.id))
              .map((srv) => (
                <option key={srv.id} value={srv.id}>
                  {srv.name} (₹{srv.price} • {srv.durationMinutes}min)
                </option>
              ))}
          </select>
          <button type="button" onClick={handleAddClick} disabled={!selectedServiceId} className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-xl transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {services.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {services.map((service) => (
            <div key={service.serviceId} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-700">{service.serviceName}</span>
                {isPackageAppointment && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Package</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-800">₹{service.price}</span>
                {!isPackageAppointment && <button type="button" onClick={() => onRemoveService(service.serviceId)} className="text-rose-500 hover:text-rose-700 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}