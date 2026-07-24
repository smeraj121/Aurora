import { formatDateForInput } from '../../lib/dateUtils';
import type { BookingFormState } from './types/types';

/**
 * Converts the raw appointment data from the API into the structure needed for the form.
 * @param apt - The raw appointment data.
 * @returns A BookingFormState object.
 */
export function convertAppointmentToForm(apt: any): Partial<BookingFormState> {
  return {
    id: apt.id,
    customerId: apt.customerId,
    customerName: apt.customerName,
    phone: apt.customerPhone || '',
    staffId: String(apt.staffId || ''),
    startTime: apt.startTime || '11:00 AM',
    durationMinutes: apt.durationMinutes || 30,
    date: formatDateForInput(apt.date),
    amount: apt.amount || 0,
    status: apt.status || 'scheduled',
    paymentStatus: apt.paymentStatus || 'pending',
    paidAmount: apt.paidAmount || 0,
    services: apt.services || [],
    customerPackageId: apt.customerPackageId ? String(apt.customerPackageId) : null,
    isPackageAppointment: apt.isPackageAppointment || false,
  };
}

/**
 * Builds the payload to be sent to the API from the form state.
 * @param formState - The current state of the booking form.
 * @returns The payload object for the API.
 */
export function buildBookingPayload(formState: BookingFormState): any {
  return {
    ...formState,
    amount: formState.isPackageAppointment ? 0 : formState.amount,
    paidAmount: formState.isPackageAppointment ? 0 : formState.paidAmount,
  };
}