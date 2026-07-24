// components/dashboard/ScheduleTimeline/hooks/useTodaySchedule.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { getLocalDateString } from '../utils/dateUtils';
import type { Appointment } from '../shared/types';
import { api } from '../services/api';

export function useTodaySchedule() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const todayDateStr = useMemo(() => getLocalDateString(new Date()), []);

  const fetchTodaySchedule = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getSchedule(todayDateStr);
      if (response.success && Array.isArray(response.data)) {
        setAppointments(response.data);
      }
    } catch (err) {
      console.error('Failed to load today schedule:', err);
    } finally {
      setLoading(false);
    }
  }, [todayDateStr]);

  useEffect(() => {
    fetchTodaySchedule();
  }, [fetchTodaySchedule]);

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

  const remainingCount = useMemo(() => {
    return appointments.filter(
      (a) => a.status !== 'completed' && a.status !== 'cancelled'
    ).length;
  }, [appointments]);

  return {
    appointments,
    loading,
    remainingCount,
    todayDateStr,
    refresh: fetchTodaySchedule,
    saveAppointment,
  };
}