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
  };
}