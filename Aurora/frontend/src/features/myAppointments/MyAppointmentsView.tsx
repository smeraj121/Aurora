import { useState, useEffect, useCallback } from 'react';
import { CalendarClock, MapPin, Edit2, X, FileText, Lock, Plus, Download, Loader2, Package } from 'lucide-react';
import { api } from '../../services/api';
import { BookingModal } from '../bookingModal/BookingModal';
import type { MyAppointmentItem } from '../../types/myAppointments.types';
import { RatingStars } from '../../components/RatingStars';
import { downloadBlob } from '../../lib/downloadBlob';

function formatCardDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    weekday: d.toLocaleDateString('en-IN', { weekday: 'short' }),
    day: d.getDate(),
    month: d.toLocaleDateString('en-IN', { month: 'short' }),
    year: d.getFullYear(),
  };
}

function formatUpdatedAt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_BADGE: Record<string, string> = {
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-purple-50 text-purple-700 border-purple-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
};

export function MyAppointmentsView() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [items, setItems] = useState<MyAppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

const handleDownloadInvoice = async (id: number) => {
  try {
    setDownloadingId(id);
    const blob = await api.downloadInvoice(id);
    downloadBlob(blob, `invoice-${id}.pdf`);
  } catch (err) {
    console.error('Failed to download invoice', err);
  } finally {
    setDownloadingId(null);
  }
};

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.getMyAppointments(tab);
      setItems(data || []);
    } catch (err) {
      console.error('Failed to load appointments', err);
      setError('Unable to load your appointments.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const handleOpen = (id: number | null) => {
    setModalError(null);
    setEditingId(id);
    setIsModalOpen(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (editingId) 
        await api.updateAppointment(editingId, data);
      else
        await api.createAppointment(data);
      setIsModalOpen(false);
      setEditingId(null);
      await load();
    } catch (err: any) {
      setModalError(err.message || 'Failed to save changes.');
      throw err;
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      setCancellingId(id);
      await api.cancelAppointment(id, undefined);
      await load();
    } catch (err) {
      console.error('Failed to cancel appointment', err);
    } finally {
      setCancellingId(null);
    }
  };

  const serviceNames = (item: MyAppointmentItem) =>
    item.services.length > 0 ? item.services.map(s => s.serviceName).join(', ') : 'Service';

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Appointments</h2>
          <p className="text-xs text-slate-500 mt-0.5">View, manage and keep track of your salon visits.</p>
        </div>
        <button
          onClick={() => handleOpen(null)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Book New Appointment
        </button>
      </div>

      <div className="flex items-center gap-1 border-b border-slate-200">
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold capitalize border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200/60 text-center text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="p-10 rounded-2xl bg-white border border-slate-200/80 border-dashed text-center">
          <CalendarClock className="w-9 h-9 mx-auto text-slate-300 mb-2" />
          <p className="text-xs font-semibold text-slate-600">
            {tab === 'upcoming' ? 'No upcoming appointments.' : 'No past appointments yet.'}
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => {
            const d = formatCardDate(item.date);
            const isEditable = item.status === 'scheduled';
            const isPast = item.status === 'completed' || item.status === 'cancelled';

            return (
              <div key={item.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 sm:w-32 shrink-0">
                  <div className="text-center bg-slate-50 rounded-xl border border-slate-100 px-3 py-2 w-16">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">{d.weekday}</p>
                    <p className="text-lg font-extrabold text-slate-900 leading-tight">{d.day}</p>
                    <p className="text-[10px] text-slate-500">{d.month} {d.year}</p>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{serviceNames(item)}</p>
                    {item.isPackageAppointment && (
                      <span className="inline-flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-[10px] font-semibold text-purple-700">
                        <Package className="w-3 h-3" />
                        Package
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.staffName ? `with ${item.staffName}` : ''}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <CalendarClock className="w-3 h-3" /> {item.startTime}
                    <MapPin className="w-3 h-3 ml-2" /> Aurora
                  </p>
                  {isPast && item.updatedByName && item.updatedAt && (
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      Last updated by {item.updatedByName} · {formatUpdatedAt(item.updatedAt)}
                    </p>
                  )}
                  {item.status === 'completed' && (
  <div className="mt-2">
    {item.review ? (
      <RatingStars value={item.review.rating} readOnly />
    ) : (
      <RatingStars
        onSubmit={async (rating) => {
          await api.createReview(item.id, rating);
          await load();
        }}
      />
    )}
  </div>
)}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border capitalize ${STATUS_BADGE[item.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                    {item.status.replace('_', ' ')}
                  </span>

                  {isEditable && (
                    <>
                      <button
                        onClick={() => handleOpen(item.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleCancel(item.id)}
                        disabled={cancellingId === item.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50 disabled:opacity-50 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> {cancellingId === item.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    </>
                  )}

                  {item.status === 'confirmed' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-[11px] font-medium">
                      <Lock className="w-3 h-3" /> Contact salon to change
                    </span>
                  )}

                  {isPast && (
                    <button
                      onClick={() => handleOpen(item.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" /> View Details
                    </button>
                  )}
                  {item.status === 'completed' && (
                    <button
                      onClick={() => handleDownloadInvoice(item.id)}
                      disabled={downloadingId === item.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      {downloadingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                      {downloadingId === item.id ? 'Preparing...' : 'Download Invoice'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingId(null); setModalError(null); }}
        onSave={handleSave}
        appointmentId={editingId}
        initialError={modalError}
      />
    </div>
  );
}
