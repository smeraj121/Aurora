import { useState, useEffect, useCallback } from 'react';
import type { Appointment } from '../shared/types';
import { api } from '../services/api';
import { fetchSchedule } from '../features/dashboard/data/dashboardService';

export function useAppointmentSchedule(date: Date) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetchSchedule(date);
      setAppointments(response);
    } catch (err) {
      console.error('Failed to load schedule:', err);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ============================================================
  // Create / Update
  // ============================================================

  const saveAppointment = async (
    bookingData: any,
    appointmentId?: number | null
  ) => {
    try {
      const response = appointmentId
        ? await api.updateAppointment(appointmentId, bookingData)
        : await api.createAppointment(bookingData);

      if (!response.success) {
        throw new Error(
          response.message || 'Failed to save appointment.'
        );
      }

      await refresh();

      return response;
    } catch (err) {
      console.error('Error saving appointment:', err);
      throw err;
    }
  };

  // ============================================================
  // Finish Appointment
  // ============================================================

  const finishAppointment = async (
    appointmentId: number,
    options?: {
      paidAmount?: number;
      paymentStatus?: string;
    }
  ) => {
    try {
      const response = await api.finishAppointment(appointmentId, {
        status: 'completed',
        ...(options?.paidAmount !== undefined && { paidAmount: options.paidAmount }),
        ...(options?.paymentStatus && { paymentStatus: options.paymentStatus }),
      });

      if (!response.success) {
        throw new Error(
          response.message || 'Failed to finish appointment.'
        );
      }

      await refresh();

      return response;
    } catch (err) {
      console.error('Error finishing appointment:', err);
      throw err;
    }
  };

  // ============================================================
  // Cancel Appointment
  // ============================================================

  const cancelAppointment = async (
    appointmentId: number,
    reason?: string
  ) => {
    try {
      const response = await api.cancelAppointment(
        appointmentId, reason
      );

      if (!response.success) {
        throw new Error(
          response.message || 'Failed to cancel appointment.'
        );
      }

      await refresh();

      return response;
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      throw err;
    }
  };

  const remainingCount = appointments.filter(
    (appointment) =>
      appointment.status !== 'completed' &&
      appointment.status !== 'cancelled'
  ).length;

  return {
    appointments,
    loading,
    remainingCount,
    refresh,
    saveAppointment,
    finishAppointment,
    cancelAppointment,
  };
}