import React, { useMemo } from 'react';
import { AppointmentCard } from './AppointmentCard';
import { TIME_SLOTS } from '../../bookingModal/types/constants';
import type { ExtendedAppointment } from '../types';
import { useAuth } from '../../../context/AuthContext';
import { BookedBlock } from './BookedBlock';

interface StaffColumnProps {
  staff: { id: number; name: string; role?: string };
  appointments: ExtendedAppointment[];
  onAppointmentClick: (apt: ExtendedAppointment) => void;
  onNewBooking: (staffId: number, slot: string) => void;
  onFinish: (id: number, e: React.MouseEvent) => Promise<boolean>;
  onCancel: (apt: ExtendedAppointment, e: React.MouseEvent) => Promise<void>;
  isCustomerActive: boolean;
  onShareInvoice: (apt: ExtendedAppointment) => void;
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
  onShareInvoice
}: StaffColumnProps) {
  // Filter appointments for this staff member
  const staffAppointments = useMemo(() => {
    return appointments.filter((apt) => String(apt.staffId) === String(staff.id));
  }, [appointments, staff.id]);
  const { user } = useAuth();

  // Process overlapping windows into side-by-side columns
  const processedAppointments = useMemo(() => {
    type Item = {
      apt: ExtendedAppointment;
      startMin: number;
      endMin: number;
      duration: number;
      colIdx: number;
    };

    const items: Item[] = staffAppointments.map((apt) => {
      const startMin = timeToMinutes(apt.startTime);
      const duration = Number(apt.durationMinutes || 15);
      const endMin = startMin + duration;
      return { apt, startMin, endMin, duration, colIdx: 0 };
    });

    // Sort by start time ascending, then by end time descending
    items.sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);

    // Group into clusters of transitively-overlapping appointments
    const clusters: Item[][] = [];
    let current: Item[] = [];
    let clusterEnd = -1;

    for (const item of items) {
      if (current.length === 0 || item.startMin < clusterEnd) {
        current.push(item);
        clusterEnd = Math.max(clusterEnd, item.endMin);
      } else {
        clusters.push(current);
        current = [item];
        clusterEnd = item.endMin;
      }
    }
    if (current.length > 0) clusters.push(current);

    const result: (ExtendedAppointment & {
      topOffset: number;
      height: number;
      isOverlapped: boolean;
      colIdx: number;
      totalCols: number;
    })[] = [];

    for (const cluster of clusters) {
      // Greedy column assignment: place each item in the first column
      // whose last appointment ends at or before this item's start.
      const columnEnds: number[] = [];
      for (const item of cluster) {
        let colIdx = columnEnds.findIndex((end) => end <= item.startMin);
        if (colIdx === -1) {
          colIdx = columnEnds.length;
          columnEnds.push(item.endMin);
        } else {
          columnEnds[colIdx] = item.endMin;
        }
        item.colIdx = colIdx;
      }
      const totalCols = columnEnds.length;

      for (const item of cluster) {
        // Overlap detection (kept for hover-card warning; ignores cancelled)
        const hasOverlap = staffAppointments.some((other) => {
          if (other.id === item.apt.id || other.status === 'cancelled') return false;
          const otherStart = timeToMinutes(other.startTime);
          const otherEnd = otherStart + Number(other.durationMinutes || 15);
          return Math.max(item.startMin, otherStart) < Math.min(item.endMin, otherEnd);
        });

        // 36px per 15-minute slot = 2.4px per minute
        const topOffset = ((item.startMin - START_DAY_MINUTES) / 15) * 36;
        const height = (item.duration / 15) * 36;

        result.push({
          ...item.apt,
          topOffset,
          height,
          isOverlapped: hasOverlap,
          colIdx: item.colIdx,
          totalCols,
        });
      }
    }

    return result;
  }, [staffAppointments]);

  return (
    <div className="relative border-r border-slate-200/80 last:border-r-0 min-h-full bg-white border-l border-slate-200/80">
      {/* Time Slot Cell Backdrops */}
      {TIME_SLOTS.map((slot) => {
        const isHour = slot.endsWith(':00 AM') || slot.endsWith(':00 PM');
        return (
          <div
            key={slot}
            style={{ height: '36px' }}
            onClick={() => onNewBooking(staff.id, slot)}
            className={`group border-t ${isHour ? 'border-slate-300' : 'border-slate-100'
              } hover:bg-purple-50/30 transition-colors cursor-pointer relative`}
          />
        );
      })}

      {/* Render Cards Positioned Absolute */}
      {processedAppointments.map((apt) => {
        const isStaffOrOwnAppointment = user?.systemRole?.toLocaleLowerCase() === 'staff' || String(apt.customerId) === String(user?.customerId);

        if (!isStaffOrOwnAppointment) {
          return (
            <BookedBlock
              key={apt.id}
              topOffset={apt.topOffset}
              height={apt.height}
              colIdx={apt.colIdx}
              totalCols={apt.totalCols}
            />
          );
        }

        return (
          <AppointmentCard
            key={apt.id}
            appointment={apt}
            isOverlapped={apt.isOverlapped}
            topOffset={apt.topOffset}
            height={apt.height}
            colIdx={apt.colIdx}
            totalCols={apt.totalCols}
            onClick={onAppointmentClick}
            onFinish={onFinish}
            onCancel={onCancel}
            isCustomerActive={isCustomerActive}
            onShareInvoice={onShareInvoice}
          />
        );
      })}
    </div>
  );
}