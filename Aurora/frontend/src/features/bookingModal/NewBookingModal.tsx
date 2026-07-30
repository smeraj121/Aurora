import { useState, useEffect } from 'react';
import { X, UserCheck, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import type { BookingFormState, CustomerPackage, NewBookingModalProps, CustomerPackageServiceItem } from './types/types';
import type { BookingServiceItem } from '../../types/booking.types';
import type { StaffMember } from '../../types/staff.types';
import { buildBookingPayload, convertAppointmentToForm } from './bookingMapper';
import { AppointmentSection } from './sections/AppointmentSection';
import { CustomerSection } from './sections/CustomerSection';
import { FooterSection } from './sections/FooterSection';
import { PackageSection } from './sections/PackageSection';
import { PaymentSection } from './sections/PaymentSection';
import { ServiceSection } from './sections/ServiceSection';
import { StatusSection } from './sections/StatusSection';
import { DEFAULT_FORM_STATE } from './types/constants';
import { validateBooking } from './validation';
import { calculateBookingTotals } from './functions/bookingCalculations';
import type { PackageService } from '../../shared/types/packages';

export function NewBookingModal({ isOpen, onClose, onSave, appointmentId, currentDate, staffId, slot }: NewBookingModalProps) {
  const [formState, setFormState] = useState<BookingFormState>(DEFAULT_FORM_STATE);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [serviceList, setServiceList] = useState<BookingServiceItem[]>([]);
  const [customerPackages, setCustomerPackages] = useState<CustomerPackage[]>([]);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [showPackageSelector, setShowPackageSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Compute total duration from services (pure derived value)
  const totalDurationFromServices = formState.services.reduce((total, svc) => {
    const serviceItem = serviceList.find(s => s.id === svc.serviceId);
    return total + (serviceItem?.durationMinutes || 0);
  }, 0);

  // Helper: Load staff and service data
  const loadReferenceData = async () => {
    const [staffRes, serviceRes] = await Promise.all([
      api.getStaff(true),
      api.getBookingServices(true),
    ]);
    if (staffRes.success) setStaffList(staffRes.data);
    if (serviceRes.success) setServiceList(serviceRes.data);
    return { staff: staffRes.success ? staffRes.data : [] };
  };

  // Helper: Load appointment data for editing
  const loadAppointmentData = async (id: number) => {
    const response = await api.getAppointment(id);
    if (!response.success) {
      throw new Error('Failed to load appointment data.');
    }
    const initialFormState = convertAppointmentToForm(response.data);
    setFormState((prev) => ({ ...prev, ...initialFormState }));
    setIsExistingCustomer(true);
  };

  // Data Loading Effect
  useEffect(() => {
    if (!isOpen) {
      // Reset all state when modal closes (inlined)
      setFormState(DEFAULT_FORM_STATE);
      setIsExistingCustomer(false);
      setCustomerPackages([]);
      setShowPackageSelector(false);
      setFormError(null);
      return;
    }

    const initializeModal = async () => {
      setIsLoading(true);
      setFormError(null);

      try {
        const { staff } = await loadReferenceData();

        if (appointmentId) {
          await loadAppointmentData(appointmentId);
        } else {
          const defaultStaffId = staff.length > 0 ? staff[0].id : 0;
          console.log(staffId);
          console.log(slot);
          setFormState((prev) => ({
            ...prev,
            staffId: staffId || defaultStaffId,
            date: currentDate || DEFAULT_FORM_STATE.date,
            startTime: slot || DEFAULT_FORM_STATE.startTime,
          }));
        }
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'An error occurred while loading modal data.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeModal();
  }, [isOpen, appointmentId, currentDate]);

  // Load customer packages when customer is selected
  useEffect(() => {
    if (!formState.customerId) {
      setCustomerPackages([]);
      return;
    }

    const loadPackages = async () => {
      try {
        const res = await api.getCustomerPackages(formState.customerId as number);
        if (res.success) setCustomerPackages(res.data);
      } catch (err) {
        console.error('Failed to load customer packages', err);
      }
    };

    loadPackages();
  }, [formState.customerId]);

  // ---- Handlers ----
  const handleSelectCustomer = (customer: { id: number; fullName: string; phone: string; }) => {
    setFormState((prev) => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.fullName,
      phone: customer.phone,
    }));
    setIsExistingCustomer(true);
    setFormError(null);
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
      const submitData = buildBookingPayload(formState);
      await onSave(submitData);
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const handleAddService = (serviceId: string) => {
    if (!serviceId) return;
    const serviceToAdd = serviceList.find((s) => String(s.id) === serviceId);
    if (!serviceToAdd) return;
    if (formState.services.some((s) => s.serviceId === serviceToAdd.id)) {
      setFormError('Service already added.');
      return;
    }

    const newService: CustomerPackageServiceItem = {
      serviceId: serviceToAdd.id,
      serviceName: serviceToAdd.name,
      price: serviceToAdd.price,
      usedQuantity:0,
      totalQuantity: 0
    };
    const updatedServices = [...formState.services, newService];
    const { amount, durationMinutes } = calculateBookingTotals(updatedServices, serviceList);

    setFormState((prev) => ({
      ...prev,
      services: updatedServices,
      amount: prev.isPackageAppointment ? 0 : amount,
      durationMinutes: durationMinutes > 0 ? durationMinutes : prev.durationMinutes,
    }));
  };

  const handleRemoveService = (serviceId: number) => {
    const updatedServices = formState.services.filter((s) => s.serviceId !== serviceId);
    const { amount, durationMinutes } = calculateBookingTotals(updatedServices, serviceList);
    setFormState((prev) => ({
      ...prev,
      services: updatedServices,
      amount: prev.isPackageAppointment ? 0 : amount,
      durationMinutes: durationMinutes > 0 ? durationMinutes : prev.durationMinutes,
    }));
  };

  const handlePackageSelect = (packageId: string) => {
    const selectedPackage = customerPackages.find(p => String(p.id) === packageId);
    if (!selectedPackage) return;

    const packageServices: CustomerPackageServiceItem[] = selectedPackage.services.map(s => ({
      serviceId: s.serviceId,
      serviceName: s.serviceName,
      price: 0,
      totalQuantity: 0,
      usedQuantity: 0
    }));

    const { durationMinutes } = calculateBookingTotals(packageServices, serviceList);
    setFormState((prev) => ({
      ...prev,
      customerPackageId: packageId,
      isPackageAppointment: true,
      services: [], //packageServices,
      amount: 0,
      durationMinutes: 0 //durationMinutes > 0 ? durationMinutes : prev.durationMinutes,
    }));
    setShowPackageSelector(false);
  };

  const handlePackageRemove = () => {
    // Reset to no services and no package
    const { amount, durationMinutes } = calculateBookingTotals([], serviceList);
    setFormState((prev) => ({
      ...prev,
      customerPackageId: null,
      isPackageAppointment: false,
      services: [],
      amount: amount, // will be 0
      durationMinutes: durationMinutes, // will be 0
    }));
  };

  const handleTogglePackageService = (pkgService: CustomerPackageServiceItem) => {
    const isAlreadySelected = formState.services.some((s) => s.serviceId === pkgService.serviceId);

    let updatedServices: CustomerPackageServiceItem[];

    if (isAlreadySelected) {
      updatedServices = formState.services.filter((s) => s.serviceId !== pkgService.serviceId);
    } else {
      updatedServices = [
        ...formState.services,
        {
          serviceId: pkgService.serviceId,
          serviceName: pkgService.serviceName,
          price: 0,
          totalQuantity: 0,
          usedQuantity: 0
        },
      ];
    }

    const { durationMinutes } = calculateBookingTotals(updatedServices, serviceList);

    setFormState((prev) => ({
      ...prev,
      services: updatedServices,
      amount: 0,
      durationMinutes: durationMinutes > 0 ? durationMinutes : prev.durationMinutes,
    }));
  };

  // ---- Render ----
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl my-4 border border-slate-100 transition-all overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-4 sm:px-6 py-4 flex items-center justify-between text-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-400 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm sm:text-base">
              {appointmentId ? 'Edit Appointment' : 'New Booking'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 px-6 flex items-center gap-2.5 text-xs text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{formError}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto">
            <StatusSection
              status={formState.status}
              onStatusChange={(status) => setFormState(prev => ({ ...prev, status }))}
            />

            <CustomerSection
              customerName={formState.customerName}
              phone={formState.phone}
              isExistingCustomer={isExistingCustomer}
              onCustomerNameChange={(customerName) => setFormState(prev => ({ ...prev, customerName }))}
              onPhoneChange={(phone) => setFormState(prev => ({ ...prev, phone }))}
              onSelectCustomer={handleSelectCustomer}
              onClearCustomer={() => {
                setFormState(prev => ({ ...prev, customerId: null }));
                setIsExistingCustomer(false);
              }}
            />

            <PackageSection
  isExistingCustomer={isExistingCustomer}
  customerPackages={customerPackages}
  isPackageAppointment={formState.isPackageAppointment}
  showPackageSelector={showPackageSelector}
  selectedPackageId={formState.customerPackageId ? String(formState.customerPackageId) : null}
  selectedServices={formState.services.map((s) => s.serviceId)}
  onOpenPackageSelector={() => setShowPackageSelector(!showPackageSelector)}
  onSelectPackage={handlePackageSelect}
  onTogglePackageService={handleTogglePackageService}
  onRemovePackage={handlePackageRemove}
/>

            <ServiceSection
              services={formState.services}
              serviceList={serviceList}
              isPackageAppointment={formState.isPackageAppointment}
              onAddService={handleAddService}
              onRemoveService={handleRemoveService}
            />

            <AppointmentSection
              staffId={formState.staffId}
              staffList={staffList}
              onStaffChange={(staffId: number | null) => setFormState(prev => ({ ...prev, staffId }))}
              date={formState.date}
              onDateChange={(date) => setFormState(prev => ({ ...prev, date }))}
              startTime={formState.startTime}
              onStartTimeChange={(startTime) => setFormState(prev => ({ ...prev, startTime }))}
              durationMinutes={formState.durationMinutes}
              onDurationChange={(durationMinutes) => setFormState(prev => ({ ...prev, durationMinutes }))}
              totalDurationFromServices={totalDurationFromServices}
              isServiceAdded={formState.services.length > 0}
            />

            <PaymentSection
              amount={formState.amount}
              onAmountChange={(amount) => setFormState(prev => ({ ...prev, amount }))}
              paymentStatus={formState.paymentStatus}
              onPaymentStatusChange={(paymentStatus) => setFormState(prev => ({ ...prev, paymentStatus }))}
              paidAmount={formState.paidAmount}
              onPaidAmountChange={(paidAmount) => setFormState(prev => ({ ...prev, paidAmount }))}
              isPackageAppointment={formState.isPackageAppointment}
            />

            <FooterSection onClose={onClose} isSubmitting={isSubmitting} isEditing={!!appointmentId} />
          </form>
        )}
      </div>
    </div>
  );
}