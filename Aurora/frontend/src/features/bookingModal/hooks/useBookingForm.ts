import { useState, useEffect, useCallback, useMemo } from 'react';
import { DEFAULT_FORM_STATE } from '../types/constants';
import { convertAppointmentToForm } from '../bookingMapper';
import { api } from '../../../services/api';
import type { ServiceItem } from '../../../shared/types/booking';
import type { StaffMember } from '../../../shared/types/staff';
import type { BookingFormState, CustomerPackage, PackageService } from '../types/types';

interface UseBookingFormProps {
  isOpen: boolean;
  appointmentId?: number | null;
  currentDate?: string;
}

export function useBookingForm({
  isOpen,
  appointmentId,
  currentDate,
}: UseBookingFormProps) {
  const [formState, setFormState] =
    useState<BookingFormState>(DEFAULT_FORM_STATE);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [serviceList, setServiceList] = useState<ServiceItem[]>([]);
  const [customerPackages, setCustomerPackages] = useState<CustomerPackage[]>([]);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [showPackageSelector, setShowPackageSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    const defaultStaffId = staffList.length > 0 ? String(staffList[0].id) : '';
    setFormState({
      ...DEFAULT_FORM_STATE,
      staffId: defaultStaffId,
      date: currentDate || DEFAULT_FORM_STATE.date,
    });
    setIsExistingCustomer(false);
    setCustomerPackages([]);
    setShowPackageSelector(false);
    setError(null);
  }, [staffList, currentDate]);

  const loadAppointmentData = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getAppointment(id);
      if (response.success) {
        const initialFormState = convertAppointmentToForm(response.data);
        setFormState((prev) => ({ ...prev, ...initialFormState }));
        setIsExistingCustomer(true);
      } else {
        setError('Failed to load appointment data.');
      }
    } catch (err) {
      setError('An error occurred while loading appointment data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      return;
    }

    const loadReferenceData = async () => {
      try {
        const [staffRes, serviceRes] = await Promise.all([
          api.getStaff(true),
          api.getServices(true),
        ]);
        if (staffRes.success) setStaffList(staffRes.data);
        if (serviceRes.success) setServiceList(serviceRes.data);
      } catch (err) {
        setError('Failed to load staff or service data.');
      }
    };

    loadReferenceData().then(() => {
      if (appointmentId) {
        loadAppointmentData(appointmentId);
      } else {
        resetForm();
      }
    });
  }, [isOpen, appointmentId, loadAppointmentData, resetForm]);

  useEffect(() => {
    if (formState.customerId) {
      const loadPackages = async () => {
        try {
          const res = await api.getCustomerPackages(formState.customerId as number);
          if (res.success) {
            setCustomerPackages(res.data);
          }
        } catch (err) {
          console.error('Failed to load customer packages', err);
        }
      };
      loadPackages();
    } else {
      setCustomerPackages([]);
    }
  }, [formState.customerId]);

  const updateField = <K extends keyof BookingFormState>(
    field: K,
    value: BookingFormState[K],
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectCustomer = (customer: {
    id: number;
    fullName: string;
    phone: string;
  }) => {
    setFormState((prev) => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.fullName,
      phone: customer.phone,
    }));
    setIsExistingCustomer(true);
    setError(null);
  };

  const recalculateTotals = (
    services: PackageService[],
    isPackage: boolean,
  ) => {
    const totalAmount = services.reduce((sum, s) => sum + (s.price || 0), 0);
    const totalDuration = services.reduce((sum, s) => {
      const serviceDetails = serviceList.find((sv) => sv.id === s.serviceId);
      return sum + (serviceDetails?.durationMinutes || 0);
    }, 0);

    setFormState((prev) => ({
      ...prev,
      services,
      amount: isPackage ? 0 : totalAmount,
      durationMinutes: totalDuration > 0 ? totalDuration : prev.durationMinutes,
    }));
  };

  const handleAddService = (serviceId: string) => {
    if (!serviceId) return;

    const serviceToAdd = serviceList.find((s) => String(s.id) === serviceId);
    if (!serviceToAdd) return;
    if (formState.services.some((s) => s.serviceId === serviceToAdd.id)) {
      setError('Service already added.');
      return;
    }

    const newService: PackageService = {
      serviceId: serviceToAdd.id,
      serviceName: serviceToAdd.name,
      price: serviceToAdd.price,
    };
    const updatedServices = [...formState.services, newService];
    recalculateTotals(updatedServices, formState.isPackageAppointment);
  };

  const handleRemoveService = (serviceId: number) => {
    const updatedServices = formState.services.filter(
      (s) => s.serviceId !== serviceId,
    );
    recalculateTotals(updatedServices, formState.isPackageAppointment);
  };

  const derivedState = useMemo(() => {
    const totalDurationFromServices = formState.services.reduce((sum, s) => {
      const serviceDetails = serviceList.find((sv) => sv.id === s.serviceId);
      return sum + (serviceDetails?.durationMinutes || 0);
    }, 0);

    return { totalDurationFromServices };
  }, [formState.services, serviceList]);

  return {
    formState,
    setFormState,
    updateField,
    staffList,
    serviceList,
    customerPackages,
    isExistingCustomer,
    setIsExistingCustomer,
    showPackageSelector,
    setShowPackageSelector,
    isLoading,
    error,
    setError,
    handleSelectCustomer,
    handleAddService,
    handleRemoveService,
    recalculateTotals,
    derivedState,
  };
}