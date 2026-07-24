import type { BookingFormState } from './types/types';

export function validateBooking(
  formState: BookingFormState,
): string | null {
  if (!formState.customerName.trim()) {
    return 'Customer name is required';
  }
  if (!formState.phone.trim()) {
    return 'Phone number is required';
  }
  if (formState.services.length === 0) {
    return 'Please select at least one service';
  }
  if (!formState.staffId) {
    return 'Please select a staff member';
  }
  if (!formState.durationMinutes || formState.durationMinutes <= 0) {
    return 'Please enter a valid duration';
  }

  // Payment validation
  if (formState.status === 'completed') {
    if (formState.paymentStatus !== 'paid' && !formState.isPackageAppointment) {
      return 'Cannot set to "Completed" without "Paid" payment status.';
    }
  }

  return null;
}