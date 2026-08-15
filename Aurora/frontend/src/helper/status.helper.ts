import { Check, X, Clock, CreditCard } from "lucide-react";

{/* Helper function for Status styling */ }
  export const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completed',
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          icon: Check,
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          border: 'border-rose-200',
          icon: X,
        };
      case 'inprogress':
        return {
          label: 'In Progress',
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          icon: Clock,
        };
      case 'scheduled':
      default:
        return {
          label: 'Scheduled',
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-200',
          icon: Clock,
        };
    }
  };

export const getPaymentConfig = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid':
        return {
          label: 'Paid',
          className:
            'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: Check,
          iconColor: 'text-emerald-600',
        };
      case 'partial':
        return {
          label: 'Partial',
          className:
            'bg-amber-50 text-amber-700 border-amber-200',
          icon: CreditCard,
          iconColor: 'text-amber-600',
        };
      case 'refunded':
      case 'refund':
        return {
          label: 'Refunded',
          className:
            'bg-slate-50 text-slate-600 border-slate-200',
          icon: CreditCard,
          iconColor: 'text-slate-500',
        };
      default:
        return {
          label: 'Pending',
          className:
            'bg-rose-50 text-rose-700 border-rose-200',
          icon: CreditCard,
          iconColor: 'text-rose-600',
        };
    }
  };