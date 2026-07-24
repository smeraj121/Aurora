// components/dashboard/ScheduleTimeline/ScheduleTimeline.tsx
import { useState } from 'react';
import type { Appointment } from '../../../shared/types';
import { NewBookingModal } from '../../bookingModal/NewBookingModal';
import { TimelineHeader } from './TimelineHeader';
import { ScheduleList } from './ScheduleList';
import { useTodaySchedule } from '../../../hooks/useTodaySchedule';

export function ScheduleTimeline() {
  const {
    appointments,
    remainingCount,
    loading,
    refresh,
    saveAppointment,
    todayDateStr,
  } = useTodaySchedule();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const handleOpenAddModal = () => {
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (apt: Appointment) => {
    setEditingAppointment(apt);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAppointment(null);
    refresh(); // Refresh on close
  };

  const handleSave = async (bookingData: any) => {
    await saveAppointment(bookingData);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col h-full">
      <TimelineHeader
        remaining={remainingCount}
        loading={loading}
        onNewBooking={handleOpenAddModal}
      />

      <ScheduleList
        appointments={appointments}
        loading={loading}
        onEdit={handleOpenEditModal}
      />

      <NewBookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        initialData={editingAppointment}
        currentDate={todayDateStr}
      />
    </div>
  );
}