import { useState } from 'react';
import { Scissors, Check, X } from 'lucide-react';
import type { BookingServiceItem } from '../../../types/booking.types';
import type { CustomerPackageServiceItem } from '../../../types/customerpackage.types';

interface ServiceSectionProps {
  staffId: number | null;
  services: CustomerPackageServiceItem[];
  serviceList: BookingServiceItem[];
  isPackageAppointment: boolean;
  onAddService: (serviceId: number) => void;
  onRemoveService: (serviceId: number) => void;
}

export function ServiceSection({
  services,
  serviceList,
  isPackageAppointment,
  onAddService,
  onRemoveService,
}: ServiceSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Instant 1-click select filtering
  const filteredServices = serviceList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !services.some((added) => added.serviceId === s.id)
  );

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
        <Scissors className="w-3.5 h-3.5 text-purple-600" /> Services
      </label>

      {!isPackageAppointment && (
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            placeholder="Search service (e.g., Haircut)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
          />

          {isOpen && filteredServices.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-40 max-h-40 overflow-y-auto divide-y divide-slate-100">
              {filteredServices.map((srv) => (
                <div
                  key={srv.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onAddService(srv.id);
                    setSearchTerm('');
                    setIsOpen(false);
                  }}
                  className="p-2 hover:bg-purple-50 cursor-pointer flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-slate-800">{srv.name}</span>
                  <span className="text-slate-500 font-semibold">
                    ₹{srv.price} • {srv.durationMinutes}m
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chips */}
      {services.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {services.map((service) => (
            <span
              key={service.serviceId}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200"
            >
              <Check className="w-3 h-3 text-purple-600" />
              {service.serviceName} (₹{service.price})
              {!isPackageAppointment && (
                <button
                  type="button"
                  onClick={() => onRemoveService(service.serviceId)}
                  className="hover:text-rose-600 transition-colors ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}