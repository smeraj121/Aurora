import { useState, useEffect, useCallback } from 'react';
import { Package, Calendar, Hourglass, CreditCard, Download, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import type { CustomerPackage } from '../../types/customerpackage.types';
import { downloadBlob } from '../../lib/downloadBlob';

function formatDate(dateStr?: string | null) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_BADGE: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    expired: 'bg-rose-50 text-rose-700 border-rose-200',
    exhausted: 'bg-slate-100 text-slate-600 border-slate-200',
};

function ServiceProgress({ svc }: { svc: CustomerPackage['services'][number] }) {
    const total = svc.totalQuantity || 0;
    const used = svc.usedQuantity || 0;
    const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
    const isDone = used >= total && total > 0;

    return (
        <div className="grid grid-cols-[1fr_auto_2fr_auto] items-center gap-3 py-1.5 text-xs">
            <span className="font-semibold text-slate-800 truncate">{svc.serviceName}</span>
            <span className="text-slate-500 tabular-nums">{used} / {total} used</span>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className={`font-semibold whitespace-nowrap ${isDone ? 'text-purple-600' : 'text-slate-600'}`}>
                {isDone ? 'Completed' : `${total - used} remaining`}
            </span>
        </div>
    );
}

function PackageCard({
    pkg,
    isHistory,
    downloading,
    onDownloadInvoice,
}: {
    pkg: CustomerPackage;
    isHistory: boolean;
    downloading: boolean;
    onDownloadInvoice: () => void;
}) {
    const status = pkg.packageStatus || (isHistory ? 'expired' : 'active');
    const badgeLabel = status === 'active' ? 'Active' : status === 'expired' ? 'Expired' : 'Exhausted';

    return (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">{pkg.packageName}</h3>
                    {pkg.packageDescription && (
                        <p className="text-xs text-slate-500 mt-0.5">{pkg.packageDescription}</p>
                    )}
                </div>
                <div className="text-right shrink-0">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${STATUS_BADGE[status]}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" /> {badgeLabel}
                    </span>
                    {status === 'expired' && pkg.expiryDate && (
                        <p className="text-[10px] text-slate-400 mt-1">Expired on {formatDate(pkg.expiryDate)}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 text-xs">
                <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div>
                        <p className="text-slate-400">Purchased on</p>
                        <p className="font-semibold text-slate-700">{formatDate(pkg.purchaseDate)}</p>
                    </div>
                </div>
                {pkg.expiryDate && (
                    <div className="flex items-center gap-2">
                        <Hourglass className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div>
                            <p className="text-slate-400">Valid until</p>
                            <p className="font-semibold text-slate-700">{formatDate(pkg.expiryDate)}</p>
                        </div>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div>
                        <p className="text-slate-400">Amount</p>
                        <p className="font-semibold text-slate-700">
                            ₹{(pkg.effectivePrice ?? 0).toLocaleString('en-IN')}
                            <span className={`ml-1.5 text-[10px] font-medium ${pkg.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {pkg.paymentStatus === 'paid' ? 'Paid in full' : pkg.paymentStatus}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {pkg.services.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Services included</p>
                    <div className="divide-y divide-slate-50">
                        {pkg.services.map((svc) => (
                            <ServiceProgress key={svc.serviceId} svc={svc} />
                        ))}
                    </div>
                </div>
            )}
            <div className="pt-3 mt-1 flex justify-end">
                <button
                    onClick={onDownloadInvoice}
                    disabled={downloading}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                    {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    {downloading ? 'Preparing...' : 'Download Invoice'}
                </button>
            </div>
        </div>
    );
}

export function MyPackagesView() {
    const [tab, setTab] = useState<'active' | 'history'>('active');
    const [items, setItems] = useState<CustomerPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    const handleDownloadInvoice = async (id: number) => {
        try {
            setDownloadingId(id);
            const blob = await api.downloadPackageInvoice(id);
            downloadBlob(blob, `package-invoice-${id}.pdf`);
        } catch (err) {
            console.error('Failed to download package invoice', err);
        } finally {
            setDownloadingId(null);
        }
    };

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await api.getMyPackages(tab);
            setItems(data || []);
        } catch (err) {
            console.error('Failed to load packages', err);
            setError('Unable to load your packages.');
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [tab]);

    useEffect(() => { load(); }, [load]);

    return (
        <div className="space-y-5 max-w-4xl mx-auto pb-8">
            <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Packages</h2>
                <p className="text-xs text-slate-500 mt-0.5">View your purchased packages and keep track of your sessions.</p>
            </div>

            <div className="flex items-center gap-1 border-b border-slate-200">
                {(['active', 'history'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2.5 text-sm font-semibold capitalize border-b-2 -mb-px transition-colors ${tab === t ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'
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
                    <Package className="w-9 h-9 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-semibold text-slate-600">
                        {tab === 'active' ? 'No active packages' : 'No package history'}
                    </p>
                </div>
            )}

            {!loading && !error && items.length > 0 && (
                <div className="space-y-3">
                    {items.map((pkg) => (
                        <PackageCard
                            key={pkg.id}
                            pkg={pkg}
                            isHistory={tab === 'history'}
                            downloading={downloadingId === pkg.id}
                            onDownloadInvoice={() => handleDownloadInvoice(pkg.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}