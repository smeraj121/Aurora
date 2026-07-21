// Specific to Calendar view
export type CalendarViewMode = 'day' | 'week' | 'month';

export interface TimeSlot {
  time: string;
  available: boolean;
  staffId: string;
}