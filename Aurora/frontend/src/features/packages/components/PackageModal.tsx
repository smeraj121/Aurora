import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Percent,
  Check,
  Minus,
  Clock,
} from 'lucide-react';
import { api } from '../../../services/api';
import { cn, formatCurrency } from '../../../lib/utils';
import type { PackageModel, PackageFormData } from '../../../shared/types/packages';
import { BaseModal } from '../../modal/BaseModal';

interface PackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: PackageModel | null;
}

export function PackageModal({ isOpen, onClose, onSave, initialData }: PackageModalProps) {
  const [formData, setFormData] = useState<PackageFormData>({
    name: '',
    description: '',
    totalPrice: 0,
    discountPercentage: 0,
    isActive: true,
    services: [],
  });
  const [services, setServices] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadServices();
      if (initialData) {
        setFormData({
          name: initialData.name,
          description: initialData.description || '',
          totalPrice: initialData.totalPrice,
          discountPercentage: initialData.discountPercentage || 0,
          isActive: initialData.isActive,
          services: initialData.services.map(s => ({
            serviceId: s.serviceId,
            quantity: s.quantity || 1,
            discount: s.discount || 0,
          })),
        });
        setServices(initialData.services.map(s => ({
          ...s,
          servicePrice: s.servicePrice || 0,
          totalPrice: s.totalPrice || 0,
        })));
      } else {
        resetForm();
      }
    }
  }, [isOpen, initialData]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const { data } = await api.getBookingServices();
      setAvailableServices(data || []);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      totalPrice: 0,
      discountPercentage: 0,
      isActive: true,
      services: [],
    });
    setServices([]);
    setSelectedServiceId('');
    setError('');
  };

  const handleAddService = () => {
    if (!selectedServiceId) {
      setError('Please select a service');
      return;
    }

    const service = availableServices.find(s => String(s.id) === String(selectedServiceId));
    if (!service) return;

    if (services.some(s => String(s.serviceId) === String(selectedServiceId))) {
      setError('Service already added to this package');
      return;
    }

    const newService = {
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      durationMinutes: service.durationMinutes || 30,
      quantity: 1,
      discount: 0,
      totalPrice: service.price,
    };

    setServices([...services, newService]);
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, {
        serviceId: service.id,
        quantity: 1,
        discount: 0,
      }],
    }));
    setSelectedServiceId('');
    setError('');
    calculateTotal([...services, newService]);
  };

  const handleRemoveService = (serviceId: number) => {
    const updatedServices = services.filter(s => s.serviceId !== serviceId);
    setServices(updatedServices);
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s.serviceId !== serviceId),
    }));
    calculateTotal(updatedServices);
  };

  const handleServiceQuantityChange = (serviceId: number, quantity: number) => {
    if (quantity < 1) return;
    
    const updatedServices = services.map(s => {
      if (s.serviceId === serviceId) {
        const basePrice = s.servicePrice || 0;
        const discount = s.discount || 0;
        const discountedPrice = basePrice - (basePrice * discount / 100);
        return { 
          ...s, 
          quantity,
          totalPrice: (discountedPrice * quantity).toFixed(2),
        };
      }
      return s;
    });
    setServices(updatedServices);
    
    setFormData(prev => ({
      ...prev,
      services: prev.services.map(s => {
        if (s.serviceId === serviceId) {
          return { ...s, quantity };
        }
        return s;
      }),
    }));
    calculateTotal(updatedServices);
  };

  const handleServiceDiscountChange = (serviceId: number, discount: number) => {
    if (discount < 0 || discount > 100) return;
    
    const updatedServices = services.map(s => {
      if (s.serviceId === serviceId) {
        const basePrice = s.servicePrice || 0;
        const quantity = s.quantity || 1;
        const discountedPrice = basePrice - (basePrice * discount / 100);
        return { 
          ...s, 
          discount,
          totalPrice: parseFloat((discountedPrice * quantity).toFixed(2)),
        };
      }
      return s;
    });
    setServices(updatedServices);
    
    setFormData(prev => ({
      ...prev,
      services: prev.services.map(s => {
        if (s.serviceId === serviceId) {
          return { ...s, discount };
        }
        return s;
      }),
    }));
    calculateTotal(updatedServices);
  };

  const calculateTotal = (serviceList: any[]) => {
    const total = serviceList.reduce((sum, s) => {
      return parseFloat(sum) + (parseFloat(s.totalPrice || 0));
    }, 0);
    
    const packageDiscount = formData.discountPercentage || 0;
    const discountedTotal = parseFloat(total) - (parseFloat(total) * packageDiscount / 100);
    
    setFormData(prev => ({
      ...prev,
      totalPrice: Math.round(discountedTotal * 100) / 100,
    }));
  };

  useEffect(() => {
    if (services.length > 0) {
      calculateTotal(services);
    }
  }, [formData.discountPercentage]);

  const getTotalOriginalPrice = () => {
    return services.reduce((sum, s) => sum + ((s.servicePrice || 0) * (s.quantity || 1)), 0);
  };

  const getTotalSavings = () => {
    const original = getTotalOriginalPrice();
    const discounted = formData.totalPrice;
    return original - discounted;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Package name is required');
      return;
    }
    if (services.length === 0) {
      setError('At least one service is required');
      return;
    }
    if (formData.totalPrice <= 0) {
      setError('Package price must be greater than 0');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      const submitData = {
        ...formData,
        services: formData.services.map(s => ({
          serviceId: s.serviceId,
          quantity: s.quantity || 1,
          discount: s.discount || 0,
        })),
      };
      
      await onSave(submitData);
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save package');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const footerActions = (
    <>
      <button
        type="button"
        onClick={handleClose}
        disabled={saving}
        className="btn-modal-secondary"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="package-form"
        disabled={saving}
        className="btn-modal-primary flex items-center gap-2"
      >
        {saving ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Check className="w-4 h-4" />
            {initialData ? 'Update Package' : 'Create Package'}
          </>
        )}
      </button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={initialData ? 'Edit Package' : 'Create New Package'}
      icon={Plus}
      error={error}
      footer={footerActions}
      maxWidth="max-w-3xl"
    >
      <form id="package-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="modal-label">
              Package Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="modal-input"
              placeholder="e.g., Laser Hair Removal Package"
              required
            />
          </div>
          <div>
            <label className="modal-label">
              <Percent className="w-3.5 h-3.5 text-purple-600 inline mr-1" />
              Package Discount
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={formData.discountPercentage}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  discountPercentage: parseFloat(e.target.value) || 0 
                })}
                className="modal-input pr-10"
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                %
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="modal-label">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="modal-input resize-none"
            placeholder="Describe what's included in this package and its benefits..."
          />
        </div>

        {/* Services Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="modal-label flex items-center gap-1.5">
              <span>Included Services <span className="text-rose-500">*</span></span>
              {services.length > 0 && (
                <span className="ml-1 text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  {services.length} services
                </span>
              )}
            </label>
            {services.length > 0 && (
              <span className="text-[10px] text-slate-400">
                Total: {services.reduce((sum, s) => sum + (s.quantity || 1), 0)} sessions
              </span>
            )}
          </div>
          
          {/* Add Service */}
          <div className="flex gap-2">
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="modal-input flex-1 cursor-pointer"
            >
              <option value="">-- Select Service to Add --</option>
              {availableServices
                .filter(s => !services.some(added => String(added.serviceId) === String(s.id)))
                .map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} (₹{service.price} • {service.durationMinutes}min)
                  </option>
                ))}
            </select>
            <button
              type="button"
              onClick={handleAddService}
              disabled={!selectedServiceId}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-xl transition-all shadow-sm disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Services List */}
          {services.length > 0 && (
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
              {services.map((service) => (
                <div
                  key={service.serviceId}
                  className="bg-slate-50 rounded-xl p-3 border border-slate-200 hover:border-purple-200 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900">
                          {service.serviceName}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          ₹{service.servicePrice}/session
                        </span>
                        {service.durationMinutes && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {service.durationMinutes}min
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(service.serviceId)}
                      className="text-slate-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-medium text-slate-600">Qty:</label>
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleServiceQuantityChange(
                            service.serviceId,
                            (service.quantity || 1) - 1
                          )}
                          className="p-1 rounded-l-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 transition-colors"
                          disabled={(service.quantity || 1) <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={service.quantity}
                          onChange={(e) => handleServiceQuantityChange(
                            service.serviceId,
                            parseInt(e.target.value) || 1
                          )}
                          className="w-10 bg-white border-y border-slate-200 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleServiceQuantityChange(
                            service.serviceId,
                            (service.quantity || 1) + 1
                          )}
                          className="p-1 rounded-r-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <label className="text-[10px] font-medium text-slate-600">Discount:</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={service.discount}
                        onChange={(e) => handleServiceDiscountChange(
                          service.serviceId,
                          parseFloat(e.target.value) || 0
                        )}
                        className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <span className="text-[10px] text-slate-500">%</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-900">
                        ₹{Math.round(service.totalPrice || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-purple-900">Package Total</span>
              <p className="text-[10px] text-purple-700 mt-0.5">
                {services.length} services • {services.reduce((sum, s) => sum + (s.quantity || 1), 0)} sessions
              </p>
            </div>
            <div className="text-right">
              {formData.discountPercentage > 0 && (
                <div className="text-[10px] text-purple-600 line-through">
                  {formatCurrency(getTotalOriginalPrice())}
                </div>
              )}
              <div className="text-xl font-extrabold text-purple-900">
                {formatCurrency(formData.totalPrice)}
              </div>
            </div>
          </div>
          
          {formData.discountPercentage > 0 && (
            <div className="mt-2 pt-2 border-t border-purple-200 flex items-center justify-between">
              <span className="text-[10px] font-medium text-purple-700">
                Total Savings: {formData.discountPercentage}%
              </span>
              <span className="text-[10px] font-bold text-emerald-600">
                Save {formatCurrency(getTotalSavings())}
              </span>
            </div>
          )}
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-3 pt-1">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
          />
          <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
            <span className={cn(
              'w-1.5 h-1.5 rounded-full',
              formData.isActive ? 'bg-emerald-500' : 'bg-rose-500'
            )} />
            {formData.isActive ? 'Active' : 'Inactive'} - 
            <span className="font-normal text-slate-500">
              {formData.isActive ? 'Available for customers' : 'Hidden from customers'}
            </span>
          </label>
        </div>
      </form>
    </BaseModal>
  );
}