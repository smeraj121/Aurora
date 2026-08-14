import { useState, useEffect, useMemo, useCallback } from 'react';
import { UserCheck, Edit2 } from 'lucide-react';
import { api } from '../../services/api';
import type { BookingFormState } from './types/types';
import type { BookingServiceItem } from '../../types/booking.types';
import type { StaffMember } from '../../types/staff.types';
import { buildBookingPayload, convertAppointmentToForm } from './bookingMapper';
import { CustomerSection } from './sections/CustomerSection';
import { ServiceSection } from './sections/ServiceSection';
import { PackageSection } from './sections/PackageSection';
import { DEFAULT_FORM_STATE } from './types/constants';
import { validateBooking } from './validation';
import { calculateBookingTotals } from './functions/bookingCalculations';
import { StaffSection } from './sections/StaffSection';
import { CancelAppointmentModal } from '../cancelModal/CancelAppointmentModal';
import type { CustomerPackage, CustomerPackageServiceItem } from '../../types/customerpackage.types';
import { BaseModal } from '../modal/BaseModal';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookingData: any) => Promise<void>;
  appointmentId?: number | null;
  currentDate?: string;
  staffId?: number | null;
  slot?: string;
  initialCustomer?: {
    id: number;
    fullName: string;
    phone: string;
  } | null;
  initialError?: string | null;
}

export function BookingModal({
  isOpen,
  onClose,
  onSave,
  appointmentId,
  currentDate,
  staffId,
  slot,
  initialCustomer,
  userRole = 'staff',
  initialError,
}: BookingModalProps & { userRole?: string }) {
  const [formState, setFormState] = useState<BookingFormState>(DEFAULT_FORM_STATE);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [serviceList, setServiceList] = useState<BookingServiceItem[]>([]);
  const [customerPackages, setCustomerPackages] = useState<CustomerPackage[]>([]);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [showPackageSelector, setShowPackageSelector] = useState(false);

  // Overrides toggles
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [isDurationOverridden, setIsDurationOverridden] = useState(false);
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [isTotalOverridden, setIsTotalOverridden] = useState(false);

  // Modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Compute total duration automatically from services
  const computedDuration = useMemo(() => {
    return formState.services.reduce((total, svc) => {
      const serviceItem = serviceList.find(s => s.id === svc.serviceId);
      return total + (serviceItem?.durationMinutes || 0);
    }, 0);
  }, [formState.services, serviceList]);

  // Derived Payment Status
  const computedPaymentStatus = useMemo(() => {
    if (formState.isPackageAppointment) return 'paid';
    const total = formState.amount || 0;
    const paid = formState.paidAmount || 0;
    if (paid <= 0) return 'pending';
    if (paid < total) return 'partial';
    return 'paid';
  }, [formState.amount, formState.paidAmount, formState.isPackageAppointment]);

  // Initial reference load
  useEffect(() => {
    if (!isOpen) {
      setFormState(DEFAULT_FORM_STATE);
      setIsExistingCustomer(false);
      setCustomerPackages([]);
      setShowPackageSelector(false);
      setIsEditingDuration(false);
      setIsDurationOverridden(false);
      setIsEditingTotal(false);
      setIsTotalOverridden(false);
      setFormError(null);
      return;
    }

    let isSubscribed = true;

    const initializeModal = async () => {
      setIsLoading(true);
      setFormError(null);

      try {
        const [staffRes, serviceRes] = await Promise.all([
          api.getStaff(true),
          api.getBookingServices(true),
        ]);

        if (!isSubscribed) return;

        if (staffRes.success) setStaffList(staffRes.data);
        if (serviceRes.success) setServiceList(serviceRes.data);

        if (appointmentId) {
          const response = await api.getAppointment(appointmentId);
          if (isSubscribed && response.success) {
            const initialFormState = convertAppointmentToForm(response.data);
            setFormState((prev) => ({ ...prev, ...initialFormState }));
            setIsExistingCustomer(true);
            if (initialFormState.durationMinutes) {
              setIsDurationOverridden(true);
            }
          }
        } else {
          const defaultStaff =
            staffId || (staffRes.success && staffRes.data.length > 0 ? staffRes.data[0].id : null);

          setFormState((prev) => ({
            ...prev,
            customerId: initialCustomer?.id ?? null,
            customerName: initialCustomer?.fullName ?? '',
            phone: initialCustomer?.phone ?? '',
            staffId: defaultStaff,
            date: currentDate || DEFAULT_FORM_STATE.date,
            startTime: slot || DEFAULT_FORM_STATE.startTime,
            status: userRole === 'customer' ? 'scheduled' : 'confirmed',
          }));

          setIsExistingCustomer(!!initialCustomer);
        }
      } catch (err) {
        if (isSubscribed) {
          setFormError(err instanceof Error ? err.message : 'Failed to initialize booking modal.');
        }
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    };

    initializeModal();

    return () => {
      isSubscribed = false;
    };
  }, [isOpen, appointmentId, currentDate, staffId, slot, userRole]);

  // Fetch customer packages
  useEffect(() => {
    if (!formState.customerId) {
      setCustomerPackages([]);
      return;
    }

    let isSubscribed = true;

    const fetchPackages = async () => {
      try {
        const response = await api.getCustomerPackages(formState.customerId!);
        if (isSubscribed) {
          setCustomerPackages(response.success ? response.data : []);
        }
      } catch (err) {
        if (isSubscribed) {
          console.error('Failed to fetch customer packages', err);
          setCustomerPackages([]);
        }
      }
    };

    fetchPackages();

    return () => {
      isSubscribed = false;
    };
  }, [formState.customerId]);

  // Handlers
  const handleSelectCustomer = useCallback((customer: { id: number; fullName: string; phone: string }) => {
    setFormState((prev) => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.fullName,
      phone: customer.phone,
    }));
    setIsExistingCustomer(true);
    setFormError(null);
  }, []);

  const handleClearCustomer = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      customerId: null,
      customerPackageId: null,
      isPackageAppointment: false,
      phone: '',
    }));
    setIsExistingCustomer(false);
  }, []);

  const handleAddService = (serviceId: number) => {
    const serviceToAdd = serviceList.find((s) => s.id === serviceId);
    if (!serviceToAdd) return;

    if (formState.services.some((s) => s.serviceId === serviceToAdd.id)) {
      setFormError('Service already added.');
      return;
    }

    const newService: CustomerPackageServiceItem = {
      serviceId: serviceToAdd.id,
      serviceName: serviceToAdd.name,
      price: serviceToAdd.price,
      usedQuantity: 0,
      totalQuantity: 0,
      isPackage: false,
    };

    const updatedServices = [...formState.services, newService];
    const { amount, durationMinutes } = calculateBookingTotals(updatedServices, serviceList);

    setFormState((prev) => ({
      ...prev,
      services: updatedServices,
      amount: prev.isPackageAppointment ? 0 : (isTotalOverridden ? prev.amount : amount),
      durationMinutes: isDurationOverridden ? prev.durationMinutes : durationMinutes,
    }));
  };

  const handleRemoveService = (serviceId: number) => {
    const updatedServices = formState.services.filter((s) => s.serviceId !== serviceId);
    const { amount, durationMinutes } = calculateBookingTotals(updatedServices, serviceList);

    setFormState((prev) => ({
      ...prev,
      services: updatedServices,
      amount: prev.isPackageAppointment ? 0 : (isTotalOverridden ? prev.amount : amount),
      durationMinutes: isDurationOverridden ? prev.durationMinutes : durationMinutes,
    }));
  };

  const handleCancelSubmit = async (reason: string, cancelType: string) => {
    try {
      setIsSubmitting(true);
      const cancelPayload = {
        ...(appointmentId ? { id: appointmentId } : {}),
        ...buildBookingPayload(formState),
        status: 'cancelled',
        amount: 0,
        paidAmount: 0,
        paymentStatus: 'refunded',
        cancelReason: reason || cancelType
      };
      await onSave(cancelPayload);
      setShowCancelModal(false);
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to cancel appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validationError = validateBooking(formState);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      const finalDuration = isDurationOverridden ? formState.durationMinutes : computedDuration;

      const payload = {
        ...(appointmentId ? { id: appointmentId } : {}),
        ...buildBookingPayload(formState),
        durationMinutes: finalDuration,
        paymentStatus: computedPaymentStatus,
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayDuration = isDurationOverridden ? formState.durationMinutes : computedDuration;

  const footerActions = (
    <>
      {appointmentId ? (
        <button
          type="button"
          onClick={() => setShowCancelModal(true)}
          className="btn-modal-danger"
        >
          Cancel Booking
        </button>
      ) : (
        <button
          type="button"
          onClick={onClose}
          className="btn-modal-secondary"
        >
          Close
        </button>
      )}
      <button
        type="submit"
        form="booking-form"
        disabled={isSubmitting}
        className="btn-modal-primary"
      >
        {isSubmitting ? 'Saving...' : appointmentId ? 'Update Booking' : 'Book Appointment'}
      </button>
    </>
  );

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={appointmentId ? 'Edit Appointment' : 'Book Appointment'}
        icon={UserCheck}
        error={formError}
        footer={footerActions}
        maxWidth="max-w-lg"
      >
        {isLoading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <form id="booking-form" onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Customer Section */}
            <CustomerSection
              customerName={formState.customerName}
              phone={formState.phone}
              isExistingCustomer={isExistingCustomer}
              onCustomerNameChange={(customerName) => setFormState(prev => ({ ...prev, customerName }))}
              onPhoneChange={(phone) => setFormState(prev => ({ ...prev, phone }))}
              onSelectCustomer={handleSelectCustomer}
              onClearCustomer={handleClearCustomer}
            />

            {/* 2. Staff Selection */}
            <StaffSection
              staffId={formState.staffId}
              staffList={staffList}
              onStaffChange={(selectedId) => setFormState(prev => ({ ...prev, staffId: selectedId }))}
              date={formState.date}
              onDateChange={(date) => setFormState(prev => ({ ...prev, date }))}
              startTime={formState.startTime}
              onStartTimeChange={(startTime) => setFormState(prev => ({ ...prev, startTime }))}
            />

            {/* 3. Service Packages */}
            <PackageSection
              isExistingCustomer={isExistingCustomer}
              customerPackages={customerPackages}
              isPackageAppointment={formState.isPackageAppointment}
              showPackageSelector={showPackageSelector}
              selectedPackageId={formState.customerPackageId ? String(formState.customerPackageId) : null}
              selectedServices={formState.services.map((s) => s.serviceId)}
              onOpenPackageSelector={() => setShowPackageSelector(!showPackageSelector)}
              onSelectPackage={(packageId) => {
                setFormState(prev => ({ ...prev, customerPackageId: packageId, isPackageAppointment: true, services: [], amount: 0 }));
                setShowPackageSelector(false);
              }}
              onTogglePackageService={(svc) => {
                const isSelected = formState.services.some(s => s.serviceId === svc.serviceId);
                const updated = isSelected
                  ? formState.services.filter(s => s.serviceId !== svc.serviceId)
                  : [...formState.services, { ...svc, price: 0 }];
                setFormState(prev => ({ ...prev, services: updated }));
              }}
              onRemovePackage={() => {
                setFormState(prev => ({ ...prev, customerPackageId: null, isPackageAppointment: false, services: [], amount: 0 }));
              }}
            />

            {/* 4. Instant Service Search & Selected Items */}
            <ServiceSection
              staffId={formState.staffId}
              services={formState.services}
              serviceList={serviceList}
              isPackageAppointment={formState.isPackageAppointment}
              onAddService={handleAddService}
              onRemoveService={handleRemoveService}
            />

            {/* 5. Summary / Quick Inline Adjustments */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              {/* Duration */}
              <div className="flex items-center gap-1.5 text-slate-600">
                <span>Duration:</span>
                {isEditingDuration ? (
                  <input
                    type="number"
                    step="5"
                    value={formState.durationMinutes}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      setFormState(prev => ({ ...prev, durationMinutes: val }));
                      setIsDurationOverridden(true);
                    }}
                    className="w-16 px-1.5 py-0.5 border border-purple-300 rounded text-xs font-semibold"
                    onBlur={() => setIsEditingDuration(false)}
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!isDurationOverridden) {
                        setFormState(prev => ({ ...prev, durationMinutes: computedDuration }));
                      }
                      setIsEditingDuration(true);
                    }}
                    className="font-semibold text-slate-800 hover:text-purple-600 flex items-center gap-1 group"
                  >
                    {displayDuration} min
                    <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-purple-600" />
                  </button>
                )}
              </div>

              {/* Total & Received */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">Total:</span>
                  {isEditingTotal && !formState.isPackageAppointment ? (
                    <input
                      type="number"
                      value={formState.amount}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setFormState(prev => ({ ...prev, amount: val }));
                        setIsTotalOverridden(true);
                      }}
                      className="w-20 px-1.5 py-0.5 border border-purple-300 rounded text-xs font-bold"
                      onBlur={() => setIsEditingTotal(false)}
                      autoFocus
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => !formState.isPackageAppointment && setIsEditingTotal(true)}
                      className="font-bold text-slate-900 hover:text-purple-600 flex items-center gap-1 group"
                    >
                      ₹{formState.amount}
                      {!formState.isPackageAppointment && <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-purple-600" />}
                    </button>
                  )}
                </div>

                {/* Payment Received Input */}
                {!formState.isPackageAppointment && (
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                    <span className="text-[10px] text-slate-500 font-medium">Recv:</span>
                    <input
                      type="number"
                      value={formState.paidAmount || ''}
                      onChange={(e) => setFormState(prev => ({ ...prev, paidAmount: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                      className="w-14 bg-transparent text-xs font-semibold focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </form>
        )}
      </BaseModal>

      {showCancelModal && (
        <CancelAppointmentModal
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelSubmit}
        />
      )}
    </>
  );
}