import type { EntityId, IsoDateString } from './common';

export type AppointmentStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show';

export interface Customer {
  id: EntityId;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  vipTag?: boolean;
  totalVisits: number;
  totalSpent: number;
  lastVisitAt: IsoDateString;
}