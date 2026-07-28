/**
 * Converts a 24‑hour time string (HH:mm) to a 12‑hour display format (hh:mm AM/PM).
 * 
 * @param time24Hour - Time string in "HH:mm" format (e.g., "14:30")
 * @returns Formatted time string like "02:30 PM", or throws an error if invalid
 * 
 * @example
 * toDisplayTime("14:30") // returns "02:30 PM"
 * toDisplayTime("09:00") // returns "09:00 AM"
 * toDisplayTime("00:00") // returns "12:00 AM"
 */
export function toDisplayTime(time24Hour: string): string {
  // Validate input format
  if (!time24Hour || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(time24Hour)) {
    throw new Error(`Invalid time format. Expected HH:mm, got: ${time24Hour}`);
  }

  const [hours, minutes] = time24Hour.split(':').map(Number);
  
  // Determine AM/PM
  const period = hours >= 12 ? 'PM' : 'AM';
  
  // Convert to 12-hour format
  const hours12 = hours % 12 || 12; // 0 becomes 12
  
  // Pad minutes to 2 digits
  const minutesStr = minutes.toString().padStart(2, '0');
  
  return `${hours12}:${minutesStr} ${period}`;
}