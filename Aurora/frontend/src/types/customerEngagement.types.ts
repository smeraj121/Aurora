export type EngagementType = 'birthday' | 'appointment' | 'followup';

export interface EngagementCustomer {
  id: number;
  name: string;
  phone: string;
}

export interface EngagementEvent {
  date: string | null;
  daysUntil?: number;
  daysSinceLastVisit?: number;
  startTime?: string;
  endTime?: string;
}

export interface EngagementReason {
  code: string;
  label: string;
}

export interface EngagementService {
  id: number;
  name: string;
  category: string | null;
}

export interface EngagementContext {
  lastVisitDate?: string | null;
  lastService?: EngagementService | null;
  services?: EngagementService[];
  staffName?: string | null;
}

export interface EngagementSuggestion {
  title: string;
  description: string;
}

export interface CustomerEngagementItem {
  type: EngagementType;
  customer: EngagementCustomer;
  event: EngagementEvent;
  reason: EngagementReason;
  context: EngagementContext;
  suggestion: EngagementSuggestion;
  message: string;
  whatsappUrl: string;
}