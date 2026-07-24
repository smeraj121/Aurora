import { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import type { BookingFormState, CustomerPackage, NewBookingModalProps, PackageService } from './types/types';
import { api } from '../../services/api';
import type { ServiceItem } from '../../shared/types/booking';
import type { StaffMember } from '../../shared/types/staff';
import { calculateBookingTotals } from '../calendar/components/bookingCalculations';
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
export function NewBookingModal({
  isOpen,
  onClose,
  onSave,
  appointmentId,
  currentDate,
}: NewBookingModalProps) {
  const [formState, setFormState] = useState<BookingFormState>(DEFAULT_FORM_STATE);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [serviceList, setServiceList] = useState<ServiceItem[]>([]);
  const [customerPackages, setCustomerPackages] = useState<CustomerPackage[]>([]);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [showPackageSelector, setShowPackageSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const totalDurationFromServices = 0;

  // Data Loading Effects
  useEffect(() => {
    if (!isOpen) {
      setFormState(DEFAULT_FORM_STATE);
      setIsExistingCustomer(false);
      setCustomerPackages([]);
      setShowPackageSelector(false);
      setFormError(null);
      return;
	  }

    const loadReferenceData = async () => {
      const [staffRes, serviceRes] = await Promise.all([
        api.getStaff(true),
        api.getServices(true),
      ]);
      if (staffRes.success) setStaffList(staffRes.data);
      if (serviceRes.success) setServiceList(serviceRes.data);
      return { staff: staffRes.data || [] };
    };

    const loadAppointment = async (id: number) => {
      const response = await api.getAppointment(id);
      if (response.success) {
        const initialFormState = convertAppointmentToForm(response.data);
        setFormState((prev) => ({ ...prev, ...initialFormState }));
        setIsExistingCustomer(true);
      } else {
        setFormError('Failed to load appointment data.');
      }
    };

    const initialize = async () => {
      setIsLoading(true);
      setFormError(null);
	  try {
        const { staff } = await loadReferenceData();
        if (appointmentId) {
          await loadAppointment(appointmentId);
        } else {
          const defaultStaffId = staff.length > 0 ? String(staff[0].id) : '';
          setFormState(prev => ({
            ...prev,
            staffId: defaultStaffId,
            date: currentDate || DEFAULT_FORM_STATE.date,
          }));
        }
      } catch (err) {
        setFormError('An error occurred while loading modal data.');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [isOpen, appointmentId, currentDate]);

  useEffect(() => {
    if (formState.customerId) {
      const loadPackages = async () => {
        try {
		      const res = await api.getCustomerPackages(formState.customerId as number);
          if (res.success) setCustomerPackages(res.data);
        } catch (err) {
          console.error('Failed to load customer packages', err);
        }
      };
      loadPackages();
    } else {
      setCustomerPackages([]);
    }
  }, [formState.customerId]);

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

  const updateServicesAndTotals = (services: PackageService[], isPackage: boolean) => {
    const { amount, durationMinutes } = calculateBookingTotals(services, serviceList);
setFormState((prev) => ({
      ...prev,
      services,
      amount: isPackage ? 0 : amount,
      durationMinutes: durationMinutes > 0 ? durationMinutes : prev.durationMinutes,
    }));
  };

  // Submit handler
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

    const newService: PackageService = {
      serviceId: serviceToAdd.id,
      serviceName: serviceToAdd.name,
      price: serviceToAdd.price,
    };
    const updatedServices = [...formState.services, newService];
	updateServicesAndTotals(updatedServices, formState.isPackageAppointment);
  };

  const handleRemoveService = (serviceId: number) => {
    const updatedServices = formState.services.filter((s) => s.serviceId !== serviceId);
    updateServicesAndTotals(updatedServices, formState.isPackageAppointment);
  };

  const handlePackageSelect = (packageId: string) => {
    const selectedPackage = customerPackages.find(p => String(p.id) === packageId);
    if (!selectedPackage) return;

    const packageServices: PackageService[] = selectedPackage.services.map(s => ({
      serviceId: s.serviceId,
      serviceName: s.serviceName,
      price: 0,
    }));

    const { durationMinutes } = calculateBookingTotals(packageServices, serviceList);

    setFormState(prev => ({
      ...prev,
      customerPackageId: packageId,
      isPackageAppointment: true,
      services: packageServices,
      amount: 0,
	  durationMinutes: durationMinutes > 0 ? durationMinutes : prev.durationMinutes,
    }));
    setShowPackageSelector(false);
  };

  const handlePackageRemove = () => {
    setFormState(prev => ({
      ...prev,
      customerPackageId: null,
      isPackageAppointment: false,
      services: [],
    }));
    updateServicesAndTotals([], false);
  };

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
              onTogglePackageSelector={() => setShowPackageSelector(!showPackageSelector)}
              onSelectPackage={handlePackageSelect}
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
              onStaffChange={(staffId) =>setFormState(prev => ({ ...prev, staffId }))}
              date={formState.date}
              onDateChange={(date) => setFormState(prev => ({ ...prev, date }))}
              startTime={formState.startTime}
              onStartTimeChange={(time) => setFormState(prev => ({ ...prev, time }))}
              durationMinutes={formState.durationMinutes}
              onDurationChange={(d) => setFormState(prev => ({ ...prev, d }))}
              totalDurationFromServices={totalDurationFromServices}
              isServiceAdded={formState.services.length > 0}
            />

            <PaymentSection
              amount={formState.amount}
              onAmountChange={(a) => setFormState(prev => ({ ...prev, a }))}
              paymentStatus={formState.paymentStatus}
              onPaymentStatusChange={(s) => setFormState(prev => ({ ...prev, s }))}
              paidAmount={formState.paidAmount}
              onPaidAmountChange={(pa) => setFormState(prev => ({ ...prev, pa }))}
              isPackageAppointment={formState.isPackageAppointment}
            />

            <FooterSection onClose={onClose} isSubmitting={isSubmitting} isEditing={!!appointmentId} />
          </form>
        )}
      </div>
    </div>
	 );
}