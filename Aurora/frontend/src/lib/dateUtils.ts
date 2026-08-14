import { format } from "date-fns";

export const getLocalDateString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd'); 
};

export const formatTimeDisplay = (timeStr?: string): string => {
  if (!timeStr) return '';
  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch {
    return timeStr;
  }
};

export const normalizeTime = (time: string): string => {
  if (!time) return '';
  const parts = time.trim().split(' ');
  if (parts.length !== 2) return time;
  const timePart = parts[0];
  const period = parts[1];
  const [hours, minutes] = timePart.split(':').map(Number);
  const hourStr = hours < 10 ? `0${hours}` : `${hours}`;
  const minuteStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hourStr}:${minuteStr} ${period}`;
};

export const formatDateDisplay = (dateStr?: string | null): string => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const formatDateForInput = (dateStr?: string | null): string => {
  if (!dateStr) return getLocalDateString(new Date());
  // If it's a full ISO string, extract just the date part
  if (typeof dateStr === 'string' && dateStr.includes('T')) {
    return dateStr.split('T')[0];
  }
  return dateStr;
};

export const formatTimeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.match(/(\d+):(\d+)\s?(AM|PM)?/i);
  if (!parts) throw new Error(`Invalid time format: ${timeStr}`);
  let hours = parseInt(parts[1], 10);
  const minutes = parseInt(parts[2], 10);
  const ampm = parts[3]?.toUpperCase();
  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export const minutesToTimeString = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
}