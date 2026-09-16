import { useState } from 'react';
import { Cake, CalendarClock, History, MessageCircleHeart, Heart, Phone, Copy, Check } from 'lucide-react';
import { Select } from '../../components/ui/Select';
import { api } from '../../services/api';
import type { CustomerEngagementItem, EngagementType } from '../../types/customerEngagement.types';

const TYPE_OPTIONS = [
  { value: 'birthday', label: 'Birthday' },
  { value: 'appointment', label: 'Upcoming Appointment' },
  { value: 'followup', label: 'Follow-up' },
];

const WITHIN_DAYS_OPTIONS: Record<'birthday' | 'appointment', { value: string; label: string }[]> = {
  birthday: [
    { value: '3', label: 'Within 3 days' },
    { value: '7', label: 'Within 7 days' },
    { value: '14', label: 'Within 14 days' },
    { value: '30', label: 'Within 30 days' },
  ],
  appointment: [
    { value: '1', label: 'Within 1 day' },
    { value: '2', label: 'Within 2 days' },
    { value: '3', label: 'Within 3 days' },
    { value: '7', label: 'Within 7 days' },
  ],
};

const TYPE_META: Record<EngagementType, { title: string; subtitle: (d: string) => string; icon: any }> = {
  birthday: {
    title: 'Upcoming Birthdays',
    subtitle: (d) => `Customers with birthdays in the next ${d} days`,
    icon: Cake,
  },
  appointment: {
    title: 'Upcoming Appointments',
    subtitle: (d) => `Customers with appointments in the next ${d} days`,
    icon: CalendarClock,
  },
  followup: {
    title: 'Customers Due for Follow-up',
    subtitle: () => `Customers who haven't visited in a while`,
    icon: History,
  },
};

export function CustomerEngagementView() {
  const [type, setType] = useState<EngagementType>('birthday');
  const [withinDays, setWithinDays] = useState('7');
  const [results, setResults] = useState<CustomerEngagementItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleTypeChange = (value: string) => {
    const next = value as EngagementType;
    setType(next);
    if (next === 'birthday') setWithinDays('7');
    if (next === 'appointment') setWithinDays('2');
  };

  const handleFindCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      const { data } = await api.getCustomerEngagement(
        type,
        type === 'followup' ? undefined : parseInt(withinDays, 10)
      );
      setResults(data || []);
    } catch (err) {
      console.error('Failed to load customer engagement data', err);
      setError('Unable to load customer engagement data.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWhatsApp = (item: CustomerEngagementItem) => {
    window.open(item.whatsappUrl, '_blank');
  };

  const handleCopyMessage = async (item: CustomerEngagementItem, index: number) => {
    try {
      await navigator.clipboard.writeText(item.message);
      setCopiedId(index);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Clipboard unavailable — Open WhatsApp still works
    }
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'NA';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'long' });
  };

  const meta = TYPE_META[type];
  const Icon = meta.icon;

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Customer Engagement</h2>
        <p className="text-xs text-slate-500 mt-0.5">Find and connect with customers at the right time</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <Select label="Interaction Type" value={type} onChange={handleTypeChange} options={TYPE_OPTIONS} className="sm:w-56" />

          {type !== 'followup' && (
            <Select label="Within" value={withinDays} onChange={setWithinDays} options={WITHIN_DAYS_OPTIONS[type]} className="sm:w-44" />
          )}

          <button
            onClick={handleFindCustomers}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:opacity-60 text-white text-xs font-semibold shadow-xs transition-all shrink-0"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Icon className="w-3.5 h-3.5" />
            )}
            Find Customers
          </button>
        </div>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-4">
          {!loading && !error && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{meta.title}</h3>
                  <p className="text-[11px] text-slate-500">{meta.subtitle(withinDays)}</p>
                </div>
              </div>
              <span className="text-xs text-slate-500">
                {results.length} {results.length === 1 ? 'customer' : 'customers'} found
              </span>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-500">Loading customers...</p>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200/60 text-center text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="p-10 rounded-2xl bg-white border border-slate-200/80 text-center">
              <Icon className="w-9 h-9 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">No customers found for this engagement type.</p>
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <div className="grid grid-cols-1 gap-3">
              {results.map((item, index) => (
                <div
  key={`${item.customer.id}-${index}`}
  className="
    bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs
    grid grid-cols-1 md:grid-cols-2
    lg:grid-cols-[minmax(190px,1.1fr)_minmax(140px,.8fr)_minmax(240px,1.4fr)_minmax(150px,.85fr)]
    gap-x-6 gap-y-4
    items-start
  "
>
  {/* Customer */}
  <div className="flex items-start gap-3 min-w-0">
    <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
      {item.customer.name
        ?.split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()}
    </div>

    <div className="min-w-0">
      <p className="text-xs font-bold text-slate-900 truncate">
        {item.customer.name}
      </p>

      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="truncate">{item.customer.phone}</span>
      </p>

      <span className="inline-block mt-1.5 text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200/60 px-2 py-0.5 rounded-full">
        {item.reason.label}
      </span>
    </div>
  </div>

  {/* Context */}
  <div className="min-w-0 text-[11px] text-slate-500 space-y-1">
    {item.context.lastVisitDate && (
      <p>
        Last visit
        <br />
        <span className="text-slate-700 font-medium">
          {formatDate(item.context.lastVisitDate)}
        </span>
      </p>
    )}

    {item.context.lastService && (
      <p>
        Last service
        <br />
        <span className="text-slate-700 font-medium">
          {item.context.lastService.name}
          {item.context.lastService.category
            ? ` · ${item.context.lastService.category}`
            : ''}
        </span>
      </p>
    )}

    {item.context.services?.length||0 > 0 && (
      <p>
        Service
        <br />
        <span className="text-slate-700 font-medium">
          {item.context.services?.map((s) => s.name).join(', ') || 'N/A'}
        </span>
      </p>
    )}

    {item.context.staffName && (
      <p className="text-slate-400">
        with {item.context.staffName}
      </p>
    )}
  </div>

  {/* Message / suggestion */}
  <div className="min-w-0 space-y-2">
    <div className="inline-flex max-w-full items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">
      <MessageCircleHeart className="w-3.5 h-3.5 shrink-0" />

      <span className="truncate">
        {item.suggestion.title} · {item.suggestion.description}
      </span>
    </div>

    <p className="text-[11px] text-slate-600 bg-slate-50/80 border border-slate-100 rounded-xl p-2.5 leading-relaxed">
      {item.message}
    </p>
  </div>

  {/* Actions */}
  <div className="flex flex-row lg:flex-col items-stretch gap-2 min-w-0">
    <button
      onClick={() => handleOpenWhatsApp(item)}
      className="
        inline-flex items-center justify-center gap-1.5
        px-3 py-2 rounded-xl
        bg-emerald-600 hover:bg-emerald-700
        text-white text-xs font-semibold
        shadow-xs transition-colors
        whitespace-nowrap
      "
    >
      Open WhatsApp
    </button>

    <button
      onClick={() => handleCopyMessage(item, index)}
      className="
        inline-flex items-center justify-center gap-1.5
        px-3 py-2 rounded-xl
        border border-slate-200 hover:bg-slate-50
        text-slate-600 text-xs font-semibold
        transition-colors
        whitespace-nowrap
      "
    >
      {copiedId === index ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          Copy Message
        </>
      )}
    </button>
  </div>
</div>
              ))}
            </div>
          )}
        </div>
      )}

      {!hasSearched && (
        <div className="p-10 rounded-2xl bg-white border border-slate-200/80 border-dashed text-center">
          <Heart className="w-9 h-9 mx-auto text-purple-200 mb-2" />
          <p className="text-xs font-semibold text-slate-600">Pick an interaction type and find customers to connect with</p>
        </div>
      )}
    </div>
  );
}