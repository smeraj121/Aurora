import { useState, useEffect } from 'react';
import type { Appointment } from '../shared/types';
import { api } from '../services/api';
import { fetchSchedule } from '../features/dashboard/data/dashboardService';

export function useTodaySchedule(date: Date) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodaySchedule = async () => {
    try {
      setLoading(true);
      const response = await fetchSchedule(date);
      setAppointments(response);
    } catch (err) {
      console.error('Failed to load schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaySchedule();
  }, [date]);

  const saveAppointment = async (bookingData: any) => {
    try {
      const response = await api.createAppointment(bookingData);

      if (!response.success) {
        throw new Error(response.message || 'Failed to save booking.');
      }

      await fetchTodaySchedule();
    } catch (err) {
      console.error('Error saving appointment:', err);
      throw err;
    }
  };

  const remainingCount = appointments.filter(
    (a) => a.status !== 'completed' && a.status !== 'cancelled'
  ).length;

  return {
    appointments,
    loading,
    remainingCount,
    refresh: fetchTodaySchedule,
    saveAppointment,
  };
}