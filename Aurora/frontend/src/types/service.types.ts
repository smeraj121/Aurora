import type { BookingServiceItem } from "./booking.types";

export interface Service extends BookingServiceItem {
  //id: number;
  //name: string;
  description?: string;
  category?: string;
  //durationMinutes: number;
  //price: number;
  color?: string;
  isOnlineBookable?: boolean;
  isActive?: boolean;
}