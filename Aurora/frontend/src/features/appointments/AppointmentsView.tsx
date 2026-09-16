import { useState, useEffect, useCallback } from 'react';
import {
    CalendarClock, CreditCard, Clock, Phone, Loader2,
    CheckCircle2, XCircle, ChevronRight, ChevronDown, Lock
} from 'lucide-react';
import { api } from '../../services/api';
import { BookingModal } from '../bookingModal/BookingModal';
import { formatCurrency } from '../../lib/utils';
import type { StaffAppointmentItem, PendingActionsResponse } from '../../types/staffAppointments.types';

type Tab = 'today' | 'upcoming' | 'pending';
type QuickActionType = 'finish' | 'cancel';
type QuickAction = { type: QuickActionType; appointment: StaffAppointmentItem };

const STATUS_BADGE: Record<string, string> = {
    scheduled: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

function parseDateParts(dateStr: string) {
    // dateStr is 'YYYY-MM-DD' from the API
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return {
        month: date.toLocaleString('en-US', { month: 'short' }),
        day: d,
        weekday: date.toLocaleString('en-US', { weekday: 'short' }),
    };
}

function parse12hTime(timeStr?: string): { hours: number; minutes: number } | null {
    if (!timeStr) return null;
    const m = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return null;
    let h = parseInt(m[1], 10) % 12;
    if (m[3].toUpperCase() === 'PM') h += 12;
    return { hours: h, minutes: parseInt(m[2], 10) };
}

function formatOverdue(dateStr: string, endTime?: string): string | null {
    const [y, mo, d] = dateStr.split('-').map(Number);
    const parsed = parse12hTime(endTime) ?? { hours: 23, minutes: 59 };
    const endsAt = new Date(y, mo - 1, d, parsed.hours, parsed.minutes);
    const diffMs = Date.now() - endsAt.getTime();
    if (diffMs <= 0) return null;

    const mins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    if (days >= 1) {
        return `${days} day${days === 1 ? '' : 's'} overdue`;
    }
    if (hrs >= 1) {
        return `${hrs} hour${hrs === 1 ? '' : 's'} overdue`;
    }
    return `${mins} min overdue`;
}

export function AppointmentsView() {
    const [tab, setTab] = useState<Tab>('today');
    const [today, setToday] = useState<StaffAppointmentItem[]>([]);
    const [upcoming, setUpcoming] = useState<StaffAppointmentItem[]>([]);
    const [pending, setPending] = useState<PendingActionsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ---- Quick actions ----
    const [quickAction, setQuickAction] = useState<QuickAction | null>(null);
    const [actionBusy, setActionBusy] = useState(false);

    // ---- Collapsible pending sections ----
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
    const toggleSection = (key: string) =>
        setCollapsed((c) => ({ ...c, [key]: !c[key] }));

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const [t, u, p] = await Promise.all([
                api.getTodayAppointments(),
                api.getUpcomingStaffAppointments(),
                api.getPendingActions(),
            ]);
            if (t.success) setToday(t.data);
            if (u.success) setUpcoming(u.data);
            if (p.success) setPending(p.data);
        } catch (err) {
            console.error('Failed to load appointments workspace', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openAppointment = (id: number) => {
        setEditingId(id);
        setIsModalOpen(true);
    };

    const handleConfirm = async (id: number) => {
        await api.updateAppointment(id, { status: 'confirmed' });
        //await load();
    };

    const runQuickAction = async (payload?: { reason?: string }) => {
        if (!quickAction) return;
        const { type, appointment } = quickAction;
        try {
            setActionBusy(true);
            if (type === 'finish') {
                await api.finishAppointment(appointment.id, {});
            } else {
                await api.cancelAppointment(appointment.id, payload?.reason);
            }
            setQuickAction(null);
            //await load();
        } catch (err) {
            console.error('Quick action failed', err);
        } finally {
            setActionBusy(false);
        }
    };

    const pendingCount = pending
        ? pending.confirmationRequired.length + pending.pendingPayments.length + pending.stuckInProgress.length
        : 0;

    const rowMeta = (a: StaffAppointmentItem) => (
        <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{a.customerName}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3" /> {a.customerPhone}
            </p>
        </div>
    );

    return (
        <div className="space-y-5 max-w-6xl mx-auto pb-8">
            <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Appointments</h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage appointments and take action on items that need your attention.</p>
            </div>

            <div className="flex items-center gap-1 border-b border-slate-200">
                {([
                    ['today', `Today (${today.length})`],
                    ['upcoming', `Upcoming (${upcoming.length})`],
                    ['pending', `Pending Actions (${pendingCount})`],
                ] as [Tab, string][]).map(([id, label]) => (
                    <button
                        key={id}
                        onClick={() => setTab(id)}
                        className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === id ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-purple-600" /></div>
            ) : (
                <>
                    {tab === 'today' && (
                        <ListSection items={today} onOpen={openAppointment} rowMeta={rowMeta} />
                    )}
                    {tab === 'upcoming' && (
                        <ListSection items={upcoming} onOpen={openAppointment} rowMeta={rowMeta} />
                    )}
                    {tab === 'pending' && pending && (
                        <div className="space-y-5">
                            <div className="mb-4 flex items-start gap-3 rounded-lg border border-purple-100 bg-purple-50/50 px-4 py-3">
                                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
                                <div>
                                    <p className="font-medium mt-0.5 text-xs text-slate-500">
                                        Only the <b>Owner</b> can <b>modify past </b>appointment information.
                                    </p>
                                </div>
                            </div>
                            <PendingSection
                                icon={CalendarClock}
                                title={`Needs Confirmation (${pending.confirmationRequired.length})`}
                                description="Appointments that are scheduled and waiting for confirmation."
                                empty="No appointments need confirmation."
                                collapsed={!!collapsed.confirm}
                                onToggle={() => toggleSection('confirm')}
                            >
                                {pending.confirmationRequired.map((a) => (
                                    <div key={a.id} className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
                                        {rowMeta(a)}
                                        <div className="text-xs text-slate-500 shrink-0">{a.date} · {a.startTime}</div>
                                        <span className={`text-[11px] font-semibold px-2 py-1 rounded-lg border shrink-0 ${STATUS_BADGE[a.status]}`}>{a.status}</span>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button onClick={() => handleConfirm(a.id)} className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors">Confirm</button>
                                            <button onClick={() => openAppointment(a.id)} className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors">View</button>
                                        </div>
                                    </div>
                                ))}
                            </PendingSection>

                            <PendingSection
                                icon={CreditCard}
                                title={`Payment Pending (${pending.pendingPayments.length})`}
                                description="Completed appointments with an outstanding balance."
                                empty="No pending payments."
                                collapsed={!!collapsed.payments}
                                onToggle={() => toggleSection('payments')}
                            >
                                {pending.pendingPayments.map((a) => (
                                    <div key={a.id} className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
                                        {rowMeta(a)}
                                        <div className="text-xs text-slate-500 shrink-0">{a.date} · {a.startTime}</div>
                                        <div className="text-xs shrink-0 text-right">
                                            <p className="text-slate-500">Due</p>
                                            <p className="font-bold text-rose-600">{formatCurrency(a.dueAmount)}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button onClick={() => openAppointment(a.id)} className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors">Collect Payment</button>
                                        </div>
                                    </div>
                                ))}
                            </PendingSection>

                            {/* ============================================================ */}
                            {/* NEEDS REVIEW                                                  */}
                            {/* ============================================================ */}
                            <PendingSection
                                icon={Clock}
                                title={`Needs Review (${pending.stuckInProgress.length})`}
                                description="Appointments past their scheduled end time that are still scheduled, confirmed, or in progress."
                                empty="Nothing needs review."
                                collapsed={!!collapsed.review}
                                onToggle={() => toggleSection('review')}
                            >
                                {pending.stuckInProgress.map((a) => {
                                    const { month, day, weekday } = parseDateParts(a.date);
                                    const overdue = formatOverdue(a.date, a.endTime);
                                    const statusCls = STATUS_BADGE[a.status] || 'bg-slate-50 text-slate-600 border-slate-200';
                                    return (
                                        <div
                                            key={a.id}
                                            className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0"
                                        >
                                            {/* Date block */}
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center shrink-0">
                                                <span className="text-[10px] font-semibold text-slate-500 uppercase leading-none">
                                                    {month}
                                                </span>
                                                <span className="text-base font-bold text-slate-900 leading-tight">
                                                    {day}
                                                </span>
                                            </div>

                                            {/* Time */}
                                            <div className="text-xs shrink-0 w-20">
                                                <p className="font-semibold text-slate-700">{a.startTime}</p>
                                                <p className="text-slate-400">{weekday}</p>
                                            </div>

                                            {/* Customer */}
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold text-slate-900 text-left truncate">{a.customerName}</p>
                                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <Phone className="w-3 h-3" /> {a.customerPhone}
                                                </p>
                                            </div>

                                            {/* Overdue */}
                                            <div className="w-32 shrink-0 text-left">
                                                {overdue ? (
                                                    <span className="inline-block text-[11px] font-semibold px-2 py-1 rounded-lg border bg-rose-50 text-rose-700 border-rose-200">
                                                        {overdue}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">—</span>
                                                )}
                                            </div>

                                            {/* Staff */}
                                            <div className="text-xs text-slate-500 shrink-0 w-28 truncate">
                                                {a.staffName || 'Unassigned'}
                                            </div>

                                            {/* Status */}
                                            <span
                                                className={`text-[11px] font-semibold px-2 py-1 rounded-lg border shrink-0 capitalize ${statusCls}`}
                                            >
                                                {a.status.replace('_', ' ')}
                                            </span>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    title="Quick finish"
                                                    onClick={() => setQuickAction({ type: 'finish', appointment: a })}
                                                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    title="Quick cancel"
                                                    onClick={() => setQuickAction({ type: 'cancel', appointment: a })}
                                                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openAppointment(a.id)}
                                                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                                                >
                                                    Review
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </PendingSection>
                        </div>
                    )}
                </>
            )}

            <BookingModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingId(null); }}
                onSave={async (data) => { await api.updateAppointment(editingId!, data); await load(); }}
                onFinishAppointment={async (id, data) => { await api.finishAppointment(id, data); await load(); }}
                onCancelAppointment={async (id, reason) => { await api.cancelAppointment(id, reason); await load(); }}
                appointmentId={editingId}
            />

            <QuickActionModal
                action={quickAction}
                busy={actionBusy}
                onClose={() => !actionBusy && setQuickAction(null)}
                onConfirm={runQuickAction}
            />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                        ListSection — new row layout                        */
/* -------------------------------------------------------------------------- */

function ListSection({ items, onOpen, rowMeta }: { items: StaffAppointmentItem[]; onOpen: (id: number) => void; rowMeta: (a: StaffAppointmentItem) => React.ReactNode }) {
    if (items.length === 0) {
        return <div className="p-10 rounded-2xl bg-white border border-slate-200/80 border-dashed text-center text-xs text-slate-500">No appointments.</div>;
    }
    return (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            {items.map((a) => {
                const { month, day, weekday } = parseDateParts(a.date);
                const statusCls = STATUS_BADGE[a.status] || 'bg-slate-50 text-slate-600 border-slate-200';
                return (
                    <div
                        key={a.id}
                        onClick={() => onOpen(a.id)}
                        className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0 cursor-pointer hover:bg-slate-50/60 -mx-4 px-4 transition-colors"
                    >
                        {/* Date block */}
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center shrink-0">
                            <span className="text-[10px] font-semibold text-slate-500 uppercase leading-none">
                                {month}
                            </span>
                            <span className="text-base font-bold text-slate-900 leading-tight">
                                {day}
                            </span>
                        </div>

                        {/* Time */}
                        <div className="text-xs shrink-0 w-20">
                            <p className="font-semibold text-slate-700">{a.startTime}</p>
                            <p className="text-slate-400">{weekday}</p>
                        </div>

                        {/* Customer */}
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-900 text-left truncate">{a.customerName}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3" /> {a.customerPhone}
                            </p>
                        </div>

                        {/* Staff */}
                        <div className="text-xs text-slate-500 shrink-0 w-28 truncate">
                            {a.staffName || 'Unassigned'}
                        </div>

                        {/* Status */}
                        <span
                            className={`text-[11px] font-semibold px-2 py-1 rounded-lg border shrink-0 capitalize ${statusCls}`}
                        >
                            {a.status.replace('_', ' ')}
                        </span>

                        {/* Chevron — signals the row is clickable */}
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                );
            })}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                        PendingSection — now collapsible                    */
/* -------------------------------------------------------------------------- */

function PendingSection({
    icon: Icon,
    title,
    description,
    empty,
    collapsed,
    onToggle,
    children,
}: {
    icon: any;
    title: string;
    description: string;
    empty: string;
    collapsed: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) {
    const hasChildren = Array.isArray(children) ? children.length > 0 : !!children;
    return (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center gap-2 p-4 text-left hover:bg-slate-50/60 transition-colors"
            >
                {collapsed ? (
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <Icon className="w-4 h-4 text-purple-600 shrink-0" />
                <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            </button>

            {!collapsed && (
                <div className="px-4 pb-4">
                    <p className="text-xs text-slate-500 mb-2">{description}</p>
                    {hasChildren ? children : <p className="text-xs text-slate-400 py-4 text-center">{empty}</p>}
                </div>
            )}
        </div>
    );
}

function QuickActionModal({
    action,
    busy,
    onClose,
    onConfirm,
}: {
    action: QuickAction | null;
    busy: boolean;
    onClose: () => void;
    onConfirm: (payload?: { reason?: string }) => void;
}) {
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (action) setReason('');
    }, [action]);

    if (!action) return null;

    const { type, appointment } = action;

    const config = {
        finish: {
            title: 'Finish appointment?',
            body: `Mark ${appointment.customerName}'s appointment as completed.`,
            cta: 'Finish',
            ctaClass: 'bg-emerald-600 hover:bg-emerald-700',
        },
        cancel: {
            title: 'Cancel appointment?',
            body: `Cancel ${appointment.customerName}'s appointment. This cannot be undone.`,
            cta: 'Cancel appointment',
            ctaClass: 'bg-rose-600 hover:bg-rose-700',
        },
    }[type];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200 p-5 space-y-4">
                <div>
                    <h3 className="text-base font-bold text-slate-900">{config.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{config.body}</p>
                </div>

                {type === 'cancel' && (
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Reason (optional)"
                        rows={3}
                        className="w-full text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                    />
                )}

                <div className="flex justify-end gap-2 pt-1">
                    <button
                        onClick={onClose}
                        disabled={busy}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
                    >
                        Back
                    </button>
                    <button
                        onClick={() => onConfirm({ reason })}
                        disabled={busy}
                        className={`px-3 py-2 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center gap-2 ${config.ctaClass}`}
                    >
                        {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                        {config.cta}
                    </button>
                </div>
            </div>
        </div>
    );
}