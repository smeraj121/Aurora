import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock3,
  XCircle,
} from 'lucide-react';
import type {
  StatusOption,
  PaymentStatusOption,
  BookingFormState,
} from './types';
import { getLocalDateString } from '../../../utils/dateUtils';

export const STATUS_OPTIONS: StatusOption[] = [
  { id: 'scheduled', label: 'Scheduled', icon: CalendarIcon },
  {
    id: 'confirmed',
    label: 'Confirmed',
    icon: CheckCircle2,
    color: 'text-blue-500',
  },
  {
    id: 'in_progress',
    label: 'In Progress',
    icon: Clock3,
    color: 'text-purple-500',
  },
  {
    id: 'completed',
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-emerald-500',
  },
  {
    id: 'cancelled',
    label: 'Cancelled',
    icon: XCircle,
    color: 'text-rose-500',
  },
];

export const PAYMENT_STATUS_OPTIONS: PaymentStatusOption[] = [
  { id: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-800' },
  { id: 'partial', label: 'Partial', color: 'bg-blue-100 text-blue-800' },
  { id: 'paid', label: 'Paid', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'refunded', label: 'Refunded', color: 'bg-rose-100 text-rose-800' },
];

export const DEFAULT_FORM_STATE: BookingFormState = {
  id: null,
  customerId: null,
  customerName: '',
  phone: '',
  staffId: '',
  startTime: '11:00 AM',
  durationMinutes: 30,
  date: getLocalDateString(new Date()),
  amount: 0,
  status: 'scheduled',
  paymentStatus: 'pending',
  paidAmount: 0,
  services: [],
  customerPackageId: null,
  isPackageAppointment: false,
};

export const TIME_SLOTS = [
  '09:00 AM', '09:15 AM', '09:30 AM', '09:45 AM',
  '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM',
  '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM',
  '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM',
  '01:00 PM', '01:15 PM', '01:30 PM', '01:45 PM',
  '02:00 PM', '02:15 PM', '02:30 PM', '02:45 PM',
  '03:00 PM', '03:15 PM', '03:30 PM', '03:45 PM',
  '04:00 PM', '04:15 PM', '04:30 PM', '04:45 PM',
  '05:00 PM', '05:15 PM', '05:30 PM', '05:45 PM',
  '06:00 PM', '06:15 PM', '06:30 PM', '06:45 PM',
  '07:00 PM', '07:15 PM', '07:30 PM', '07:45 PM',
  '08:00 PM', '08:15 PM', '08:30 PM', '08:45 PM',
];