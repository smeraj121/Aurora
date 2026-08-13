import { useState } from 'react';

interface CancelModalProps {
  onClose: () => void;
  onConfirm: (reason: string, cancelType: string) => void;
}

export function CancelAppointmentModal({ onClose, onConfirm }: CancelModalProps) {
  const [cancelType, setCancelType] = useState('Customer');
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl p-5 w-full max-w-xs space-y-4 shadow-xl border border-slate-100">
        <h5 className="font-bold text-sm text-slate-800">Cancel Appointment</h5>

        <div className="space-y-1.5">
          <label className="text-xs text-slate-500 font-medium">Reason (optional)</label>
          <div className="space-y-1 text-xs text-slate-700">
            {['Customer', 'Salon', 'No show'].map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="cancelType"
                  value={type}
                  checked={cancelType === type}
                  onChange={(e) => setCancelType(e.target.value)}
                  className="text-purple-600 focus:ring-purple-500"
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        <textarea
          placeholder="Additional notes..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-purple-600"
          rows={2}
        />

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason, cancelType)}
            className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
          >
            Confirm Cancel
          </button>
        </div>
      </div>
    </div>
  );
}