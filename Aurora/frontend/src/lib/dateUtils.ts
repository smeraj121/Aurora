// lib/dateUtils.ts
export const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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