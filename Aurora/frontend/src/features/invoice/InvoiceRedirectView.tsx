import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { downloadBlob } from '../../lib/downloadBlob';

export function InvoiceRedirectView() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appointmentId) return;
    let cancelled = false;
    (async () => {
      try {
        const blob = await api.downloadInvoice(parseInt(appointmentId, 10));
        if (cancelled) return;
        downloadBlob(blob, `invoice-${appointmentId}.pdf`);
        setStatus('done');
      } catch (err: any) {
        if (cancelled) return;
        setError(err.message || 'Unable to load this invoice.');
        setStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, [appointmentId]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-sm w-full text-center bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs">
        {status === 'loading' && (
          <>
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Preparing your invoice...</p>
          </>
        )}
        {status === 'done' && (
          <>
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Your invoice has downloaded.</p>
            <button onClick={() => navigate('/my-appointments')} className="mt-4 text-xs font-semibold text-purple-600 hover:underline">
              Go to My Appointments
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">{error}</p>
            <button onClick={() => navigate('/my-appointments')} className="mt-4 text-xs font-semibold text-purple-600 hover:underline">
              Go to My Appointments
            </button>
          </>
        )}
      </div>
    </div>
  );
}