import { useState, useEffect, useMemo, useCallback } from 'react';
import { UserCheck, Edit2, Check, Clock, CheckCircle2, IndianRupee } from 'lucide-react';
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
import { getStatusConfig } from '../../helper/status.helper';
import { useAuth } from '../../context/AuthContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookingData: any) => Promise<void>;
  onFinishAppointment?: (appointmentId: number) => Promise<void>;
  onCancelAppointment?: (appointmentId: number, reason?: string) => Promise<void>;
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
  onFinishAppointment,
  onCancelAppointment,
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
  const [originalPackageServiceIds, setOriginalPackageServiceIds] = useState<number[]>([]);
  const [originalPackageId, setOriginalPackageId] = useState<string | null>(null);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [showPackageSelector, setShowPackageSelector] = useState(false);

  // Overrides toggles
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [isDurationOverridden, setIsDurationOverridden] = useState(false);
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isTotalOverridden, setIsTotalOverridden] = useState(false);

  // Modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { user } = useAuth();
  const isCustomerActive = user?.systemRole.toLocaleLowerCase()==='customer';
  const currentStatusConfig = getStatusConfig(formState.status || 'scheduled');
  const StatusIcon = currentStatusConfig.icon;

  // Derived Payment Status
  const computedPaymentStatus = useMemo(() => {
    if (formState.isPackageAppointment) return 'paid';
    const total = formState.amount || 0;
    const paid = formState.paidAmount || 0;
    if (paid <= 0) return total == 0 ? 'paid':'pending';
    if (paid < total) return 'partial';
    return 'paid';
  }, [formState.amount, formState.paidAmount, formState.isPackageAppointment]);

  // Keep formState.paymentStatus updated automatically
  useEffect(() => {
    setFormState((prev) => {
      if (prev.paymentStatus === computedPaymentStatus) return prev;
      return { ...prev, paymentStatus: computedPaymentStatus };
    });
  }, [computedPaymentStatus]);

  // Initial reference load
  useEffect(() => {
    if (!isOpen) {
      setFormState(DEFAULT_FORM_STATE);
      setIsExistingCustomer(false);
      setCustomerPackages([]);
      setOriginalPackageServiceIds([]);
      setOriginalPackageId(null);
      setShowPackageSelector(false);
      setIsEditingDuration(false);
      setIsDurationOverridden(false);
      setIsEditingTotal(false);
      setIsTotalOverridden(false);
      setFormError(null);
      return;
    }

    if (initialError) setFormError(initialError);

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
            setOriginalPackageId(initialFormState.customerPackageId ?? null);
            setOriginalPackageServiceIds(
              (response.data.services || [])
                .filter((service: CustomerPackageServiceItem) => service.isPackage)
                .map((service: CustomerPackageServiceItem) => service.serviceId)
            );
            setIsExistingCustomer(true);
            // A persisted duration represents the appointment's current value, not
            // a manual override in this edit session.
            setIsDurationOverridden(false);
          }
        } else {
          const defaultStaff =
            staffId || (staffRes.success && staffRes.data.length > 0 ? staffRes.data[0].id : null);

          setFormState((prev) => ({
            ...prev,
            customerId: initialCustomer?.id ?? (isCustomerActive?user.id:0),
            customerName: initialCustomer?.fullName ?? (isCustomerActive?user.fullName:''),
            phone: initialCustomer?.phone ?? (isCustomerActive?user.phone:''),
            staffId: defaultStaff,
            date: currentDate || DEFAULT_FORM_STATE.date,
            startTime: slot || DEFAULT_FORM_STATE.startTime,
            status: isCustomerActive ? 'scheduled' : 'confirmed',
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
  }, [isOpen, appointmentId, currentDate, staffId, slot, userRole, initialError]);

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
  const handleSelectCustomer = useCallback(
    (customer: { id: number; fullName: string; phone: string }) => {
      setFormState((prev) => ({
        ...prev,
        customerId: customer.id,
        customerName: customer.fullName,
        phone: customer.phone,
      }));
      setIsExistingCustomer(true);
      setFormError(null);
    },
    []
  );

  const handleFinish = async () => {
    if (!appointmentId || !onFinishAppointment) return;

    try {
      setIsSubmitting(true);
      setFormError(null);
      await onFinishAppointment(appointmentId);
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to finish appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      amount: prev.isPackageAppointment ? 0 : isTotalOverridden ? prev.amount : amount,
      durationMinutes: isDurationOverridden ? prev.durationMinutes : durationMinutes,
    }));
  };

  const handleRemoveService = (serviceId: number) => {
    const updatedServices = formState.services.filter((s) => s.serviceId !== serviceId);
    const { amount, durationMinutes } = calculateBookingTotals(updatedServices, serviceList);

    setFormState((prev) => ({
      ...prev,
      services: updatedServices,
      amount: prev.isPackageAppointment ? 0 : isTotalOverridden ? prev.amount : amount,
      durationMinutes: isDurationOverridden ? prev.durationMinutes : durationMinutes,
    }));
  };

  const handleCancelSubmit = async (reason: string, cancelType: string) => {
    if (!appointmentId || !onCancelAppointment) return;

    try {
      setIsSubmitting(true);
      setFormError(null);
      await onCancelAppointment(appointmentId, reason || cancelType);
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to cancel appointment');
    } finally {
      setIsSubmitting(false);
      setShowCancelModal(false);
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
      const finalDuration = formState.durationMinutes;

      const payload = {
        ...(appointmentId ? { id: appointmentId } : {}),
        ...buildBookingPayload(formState),
        durationMinutes: finalDuration,
        paymentStatus: computedPaymentStatus,
      };
      const customerEditPayload = {
        date: payload.date,
        startTime: payload.startTime,
        durationMinutes: payload.durationMinutes,
        services: payload.services,
        ...(payload.notes !== undefined && { notes: payload.notes }),
      };
      await onSave(isCustomerActive && appointmentId ? customerEditPayload : payload);
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayDuration = formState.durationMinutes;

  const footerActions = (
    <>
      {/* Left Action: Cancel / Close */}
      {appointmentId ? (
        !!onCancelAppointment &&
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

      {/* Right Actions: Update / Save and Finish */}
      {(() => {
        const hasFinishButton =
          !!appointmentId &&
          formState.status !== 'completed' &&
          formState.status !== 'cancelled' && !!onFinishAppointment;

        return (
          <div className="flex items-center gap-2">
            <button
              type="submit"
              form="booking-form"
              disabled={isSubmitting}
              className={
                hasFinishButton
                  ? "px-2 py-1.5 rounded-xl border border-purple-600 text-purple-600 hover:bg-purple-50 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  : "btn-modal-primary"
              }
            >
              {isSubmitting
                ? 'Saving...'
                : appointmentId
                  ? 'Update Booking'
                  : 'Book Appointment'}
            </button>

            {hasFinishButton && (
              <button
                type="button"
                onClick={handleFinish}
                disabled={isSubmitting}
                className="btn-modal-primary flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                {isSubmitting ? 'Finishing...' : 'Finish'}
              </button>
            )}
          </div>
        );
      })()}
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
              customerName={ formState.customerName }
              phone={ formState.phone}
              isExistingCustomer={isExistingCustomer}
              onCustomerNameChange={(customerName) =>
                setFormState((prev) => ({ ...prev, customerName }))
              }
              onPhoneChange={(phone) => setFormState((prev) => ({ ...prev, phone }))}
              onSelectCustomer={handleSelectCustomer}
              onClearCustomer={handleClearCustomer}
              isDisabled={isCustomerActive}
            />

            {/* 2. Staff Selection */}
            <StaffSection
              staffId={formState.staffId}
              staffList={staffList}
              onStaffChange={(selectedId) =>
                setFormState((prev) => ({ ...prev, staffId: selectedId }))
              }
              date={formState.date}
              onDateChange={(date) => setFormState((prev) => ({ ...prev, date }))}
              startTime={formState.startTime}
              onStartTimeChange={(startTime) =>
                setFormState((prev) => ({ ...prev, startTime }))
              }
            />

            {/* 3. Service Packages */}
            <PackageSection
              isExistingCustomer={isExistingCustomer}
              customerPackages={customerPackages}
              isPackageAppointment={formState.isPackageAppointment}
              showPackageSelector={showPackageSelector}
              selectedPackageId={
                formState.customerPackageId ? String(formState.customerPackageId) : null
              }
              selectedServices={formState.services.map((s) => s.serviceId)}
              isEditing={Boolean(appointmentId)}
              originalPackageId={originalPackageId}
              originalPackageServiceIds={originalPackageServiceIds}
              onOpenPackageSelector={() => setShowPackageSelector(!showPackageSelector)}
              onSelectPackage={(packageId) => {
                setFormState((prev) => ({
                  ...prev,
                  customerPackageId: packageId,
                  isPackageAppointment: true,
                  services: [],
                  amount: 0,
                  durationMinutes: isDurationOverridden ? prev.durationMinutes : 0,
                }));
                setShowPackageSelector(false);
              }}
              onTogglePackageService={(svc) => {
                const isSelected = formState.services.some((s) => s.serviceId === svc.serviceId);
                const updated = isSelected
                  ? formState.services.filter((s) => s.serviceId !== svc.serviceId)
                  : [...formState.services, { ...svc, price: 0 }];
                const { durationMinutes } = calculateBookingTotals(updated, serviceList);
                setFormState((prev) => ({
                  ...prev,
                  services: updated,
                  durationMinutes: isDurationOverridden ? prev.durationMinutes : durationMinutes,
                }));
              }}
              onRemovePackage={() => {
                setFormState((prev) => ({
                  ...prev,
                  customerPackageId: null,
                  isPackageAppointment: false,
                  services: [],
                  amount: 0,
                  durationMinutes: isDurationOverridden ? prev.durationMinutes : 0,
                }));
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


            <div className="grid grid-cols-3 gap-2 text-xs">
              {/* Duration */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-purple-600" /> Duration
                </label>
                {isEditingDuration ? (
                  <input
                    type="text"
                    value={formState.durationMinutes}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      setFormState((prev) => ({ ...prev, durationMinutes: val }));
                      setIsDurationOverridden(true);
                    }}
                    onBlur={() => setIsEditingDuration(false)}
                    autoFocus
                    className="bg-slate-50 border border-purple-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if(isCustomerActive) return;
                      setIsEditingDuration(true);
                    }}
                    className="px-2.5 py-1.5 text-xs font-bold text-slate-900 flex gap-1 items-center group hover:border-purple-300 transition-colors"
                  >
                    <span>{displayDuration} min</span>
                    <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-purple-600 transition-colors" />
                  </button>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-purple-600" /> Status
                </label>
                {isEditingStatus ? (
                  <select
                    value={formState.status || 'scheduled'}
                    onChange={(e) => {
                      setFormState((prev) => ({ ...prev, status: e.target.value as BookingFormState['status'] }));
                      setIsEditingStatus(false);
                    }}
                    onBlur={() => setIsEditingStatus(false)}
                    autoFocus
                    className="bg-slate-50 border border-purple-300 rounded-xl px-2 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                ) : (
                  <button
                    type="button"
                    onClick={() => !isCustomerActive && setIsEditingStatus(true)}
                    className={`border rounded-xl px-2.5 py-1.5 text-xs font-semibold flex gap-1 items-center transition-all ${currentStatusConfig.text} ${currentStatusConfig.border}`}
                  >
                    <span className="flex items-center gap-1">
                      <StatusIcon className="w-3 h-3" />
                      {currentStatusConfig.label}
                    </span>
                    <Edit2 className="w-3 h-3 opacity-50 hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>

              {/* 2 Rows x 2 Cols Grid Layout: Total & Received */}
              <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1">
                {/* ROW 1, COL 1: Total Label */}
                <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 whitespace-nowrap">
                  <IndianRupee className="w-3 h-3 text-purple-600" /> Total
                </label>

                {/* ROW 1, COL 2: Total Input / Button */}
                <div>
                  {isEditingTotal && !formState.isPackageAppointment ? (
                    <input
                      type="text"
                      value={formState.amount}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setFormState((prev) => ({ ...prev, amount: val }));
                        setIsTotalOverridden(true);
                      }}
                      onBlur={() => setIsEditingTotal(false)}
                      autoFocus
                      className="w-full bg-slate-50 border border-purple-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => !isCustomerActive && !formState.isPackageAppointment && setIsEditingTotal(true)}
                      disabled={formState.isPackageAppointment}
                      className="w-full rounded-xl px-1.5 py-0.5 text-xs font-bold text-slate-900 flex items-center justify-between group disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-300 transition-colors"
                    >
                      <span>₹{formState.amount}</span>
                      {!formState.isPackageAppointment && (
                        <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-purple-600 transition-colors" />
                      )}
                    </button>
                  )}
                </div>

                {/* ROW 2: Received (Label + Input) */}
                {!isCustomerActive && !formState.isPackageAppointment && (
                  <>
                    {/* ROW 2, COL 1: Received Label */}
                    <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1 whitespace-nowrap">
                      <IndianRupee className="w-3 h-3 text-purple-600" /> Received
                    </label>

                    {/* ROW 2, COL 2: Received Input */}
                    <div>
                      <input
                        type="text"
                        value={formState.paidAmount || ''}
                        onChange={(e) =>
                          setFormState((prev) => ({
                            ...prev,
                            paidAmount: parseFloat(e.target.value) || 0,
                          }))
                        }
                        placeholder="0"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600 [appearance:textfield]"
                      />
                    </div>
                  </>
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
