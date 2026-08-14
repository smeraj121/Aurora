import { useState } from 'react';
import type { Appointment } from '../../../shared/types';
import type { BookingFormData } from '../../../types/booking.types';
import { BookingModal } from '../../bookingModal/BookingModal';
import { TimelineHeader } from './TimelineHeader';
import { ScheduleList } from './ScheduleList';
import { useAppointmentSchedule } from '../../../hooks/useAppointmentSchedule';
import { getLocalDateString } from '../../../lib/dateUtils';

interface ScheduleTimelineProps {
  date: Date;
}

export function ScheduleTimeline({ date }: ScheduleTimelineProps) {
  const {
    appointments,
    remainingCount,
    loading,
    refresh,
    saveAppointment
  } = useAppointmentSchedule(date);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);

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
  };

  const handleSave = async (bookingData: BookingFormData) => {
    await saveAppointment(
      bookingData,
      editingAppointment?.id
    );

    setIsModalOpen(false);
    setEditingAppointment(null);
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

      <BookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        appointmentId={editingAppointment?.id}
        currentDate={getLocalDateString(date)}
      />
    </div>
  );
}