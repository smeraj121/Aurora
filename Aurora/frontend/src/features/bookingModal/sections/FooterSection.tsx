import { Save } from 'lucide-react';

interface FooterSectionProps {
  onClose: () => void;
  isSubmitting: boolean;
  isEditing: boolean;
}

export function FooterSection({
  onClose,
  isSubmitting,
  isEditing,
}: FooterSectionProps) {
  return (
    <div className="pt-3 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sticky bottom-0 bg-white pb-1 border-t border-slate-100">
      <button type="button" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
        Cancel
      </button>
      <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 cursor-pointer">
        <Save className="w-4 h-4" />
        <span>{isSubmitting ? 'Saving...' : isEditing ? 'Update Appointment' : 'Confirm Booking'}</span>
      </button>
    </div>
  );
}