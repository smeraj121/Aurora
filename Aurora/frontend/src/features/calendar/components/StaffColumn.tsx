import React, { useMemo } from 'react';
import { AppointmentCard } from './AppointmentCard';
import { TIME_SLOTS } from '../../bookingModal/types/constants';
import type { ExtendedAppointment } from '../types';

interface StaffColumnProps {
  staff: { id: number; name: string; role?: string };
  appointments: ExtendedAppointment[];
  onAppointmentClick: (apt: ExtendedAppointment) => void;
  onNewBooking: (staffId: number, slot: string) => void;
  onFinish: (id: number, e: React.MouseEvent) => Promise<boolean>;
  onCancel: (apt: ExtendedAppointment, e: React.MouseEvent) => Promise<void>;
  isCustomerActive: boolean;
}

// Converts time slot string "11:00 AM" into minutes from midnight
function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

const START_DAY_MINUTES = timeToMinutes(TIME_SLOTS[0]); // First slot offset

export function StaffColumn({
  staff,
  appointments,
  onAppointmentClick,
  onNewBooking,
  onFinish,
  onCancel,
  isCustomerActive,
}: StaffColumnProps) {
  // Filter appointments for this staff member
  const staffAppointments = useMemo(() => {
    return appointments.filter((apt) => String(apt.staffId) === String(staff.id));
  }, [appointments, staff.id]);

  // Process overlapping windows
  const processedAppointments = useMemo(() => {
    return staffAppointments.map((apt) => {
      const startMin = timeToMinutes(apt.startTime);
      const duration = Number(apt.durationMinutes || 15);
      const endMin = startMin + duration;

      // Check if another appointment overlaps
      const hasOverlap = staffAppointments.some((other) => {
        if (other.id === apt.id || other.status === 'cancelled') return false;
        const otherStart = timeToMinutes(other.startTime);
        const otherEnd = otherStart + Number(other.durationMinutes || 15);
        return Math.max(startMin, otherStart) < Math.min(endMin, otherEnd);
      });

      // 36px per 15-minute slot = 2.4px per minute
      const topOffset = ((startMin - START_DAY_MINUTES) / 15) * 36;
      const height = (duration / 15) * 36;

      return {
        ...apt,
        topOffset,
        height,
        isOverlapped: hasOverlap,
      };
    });
  }, [staffAppointments]);

  return (
    <div className="relative border-r border-slate-200/80 last:border-r-0 min-h-full bg-white">
      {/* Time Slot Cell Backdrops */}
      {TIME_SLOTS.map((slot) => {
        const isHour = slot.endsWith(':00 AM') || slot.endsWith(':00 PM');
        return (
          <div
            key={slot}
            style={{ height: '36px' }}
            onClick={() => onNewBooking(staff.id, slot)}
            className={`group border-t ${
              isHour ? 'border-slate-300' : 'border-slate-100'
            } hover:bg-purple-50/30 transition-colors cursor-pointer relative`}
          />
        );
      })}

      {/* Render Cards Positioned Absolute */}
      {processedAppointments.map((apt) => (
        <AppointmentCard
          key={apt.id}
          appointment={apt}
          isOverlapped={apt.isOverlapped}
          topOffset={apt.topOffset}
          height={apt.height}
          onClick={onAppointmentClick}
          onFinish={onFinish}
          onCancel={onCancel}
          isCustomerActive={isCustomerActive}
        />
      ))}
    </div>
  );
}
