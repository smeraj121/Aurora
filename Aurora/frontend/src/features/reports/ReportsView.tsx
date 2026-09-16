import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Users,
  CalendarCheck,
  Star,
  Download,
  UserX,
} from 'lucide-react';
import {
  ComposedChart,
  AreaChart,
  BarChart,
  Bar,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../../services/api';
import { formatCurrency } from '../../lib/utils';
import { downloadCsv } from '../../lib/csvExport';
import { ReportDateRangeDropdown } from './components/ReportDateRangeDropdown';
import type { ReportData, ReportPresetRange } from '../../types/report.types';
import { format } from 'date-fns';

const CATEGORY_COLORS = ['#9333EA', '#2563EB', '#D97706', '#10B981', '#EC4899', '#0EA5E9'];

function getDefaultRange(): { startDate: string; endDate: string } {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  return { startDate: format(start, 'yyyy-MM-dd'), endDate: format(today, 'yyyy-MM-dd') };
}

function CategoryTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const category: ReportData['serviceCategories'][number] = payload[0].payload;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-3 max-w-[220px]">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-bold text-slate-900">{category.category}</span>
        <span className="text-xs font-bold text-purple-600">{formatCurrency(category.revenue)}</span>
      </div>
      <div className="space-y-1 border-t border-slate-100 pt-2">
        {category.services.slice(0, 6).map((s) => (
          <div key={s.name} className="flex items-center justify-between text-[11px]">
            <span className="text-slate-600 truncate pr-2">{s.name}</span>
            <span className="text-slate-500 shrink-0">{s.bookings} · {formatCurrency(s.revenue)}</span>
          </div>
        ))}
        {category.services.length > 6 && (
          <p className="text-[10px] text-slate-400 pt-0.5">+{category.services.length - 6} more</p>
        )}
      </div>
    </div>
  );
}

function ChangeBadge({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-[11px] font-bold text-slate-400">No prior data</span>;
  }
  const isPositive = value >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  return (
    <div className={`flex items-center gap-1 text-[11px] font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{isPositive ? '+' : ''}{value}% vs previous period</span>
    </div>
  );
}

export function ReportsView() {
  const [preset, setPreset] = useState<ReportPresetRange>('6m');
  const [{ startDate, endDate }, setRange] = useState(getDefaultRange());
  const [trendMode, setTrendMode] = useState<'revenue' | 'bookings' | 'all'>('all');
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.getReport(startDate, endDate);
      setReport(data);
    } catch (err) {
      console.error('Failed to load report', err);
      setError('Unable to load report data.');
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleRangeChange = (nextPreset: ReportPresetRange, nextStart: string, nextEnd: string) => {
    setPreset(nextPreset);
    setRange({ startDate: nextStart, endDate: nextEnd });
  };

  const handleExport = () => {
    if (!report) return;
    const rows: (string | number)[][] = [
      ['Aurora Reports & Analytics'],
      [`Period: ${report.dateRange.startDate} to ${report.dateRange.endDate}`],
      [],
      ['Summary'],
      ['Metric', 'Value'],
      ['Gross Revenue', report.summary.grossRevenue],
      ['Total Bookings', report.summary.totalBookings],
      ['Avg Ticket Size', report.summary.avgTicketSize],
      ['Repeat Client Rate (%)', report.summary.repeatClientRate],
      [],
      ['Top Services'],
      ['Service', 'Bookings', 'Revenue'],
      ...report.topServices.map(s => [s.name, s.bookings, s.revenue]),
      [],
      ['Package Performance'],
      ['Package Revenue', report.packagePerformance.revenue],
      ['Packages Sold', report.packagePerformance.sales],
      ['Customers', report.packagePerformance.customers],
      [],
      ['Top Packages'],
      ['Package', 'Sales', 'Revenue'],
      ...report.packagePerformance.topPackages.map(p => [p.name, p.sales, p.revenue]),
      [],
      ['Staff Performance'],
      ['Staff', 'Role', 'Completed', 'Revenue', 'Avg Ticket', 'Rating'],
      ...report.staff.map(s => [s.name, s.role || '', s.completedAppointments, s.revenue, s.avgTicketSize, s.rating ?? '']),
      [],
      ['Customer Overview'],
      ['Identifiable Customers', report.customers.identifiable],
      ['New Customers', report.customers.new],
      ['Returning Customers', report.customers.returning],
      ['Anonymous Walk-ins', report.customers.anonymousWalkIns],
    ];
    downloadCsv(`aurora-report-${startDate}-to-${endDate}.csv`, rows);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Reports & Analytics</h2>
          <p className="text-xs text-slate-500 mt-1">Understand your business performance and make smarter decisions.</p>
        </div>

        <div className="flex items-center gap-3">
          <ReportDateRangeDropdown preset={preset} startDate={startDate} endDate={endDate} onChange={handleRangeChange} />
          <button
            onClick={handleExport}
            disabled={!report}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-md shadow-purple-900/20"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Loading report...</p>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="p-8 rounded-2xl bg-rose-50 border border-rose-200/60 text-center text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {!loading && !error && report && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Gross Revenue</span>
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600"><IndianRupee className="w-4 h-4" /></div>
              </div>
              <p className="text-xl font-extrabold text-slate-900 mt-2">{formatCurrency(report.summary.grossRevenue)}</p>
              <div className="mt-2"><ChangeBadge value={report.comparison.revenueChangePercent} /></div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Bookings</span>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><CalendarCheck className="w-4 h-4" /></div>
              </div>
              <p className="text-xl font-extrabold text-slate-900 mt-2">{report.summary.totalBookings}</p>
              <div className="mt-2"><ChangeBadge value={report.comparison.bookingsChangePercent} /></div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Avg Ticket Size</span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600"><TrendingUp className="w-4 h-4" /></div>
              </div>
              <p className="text-xl font-extrabold text-slate-900 mt-2">{formatCurrency(report.summary.avgTicketSize)}</p>
              <div className="mt-2"><ChangeBadge value={report.comparison.avgTicketChangePercent} /></div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Repeat Client Rate</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><Users className="w-4 h-4" /></div>
              </div>
              <p className="text-xl font-extrabold text-slate-900 mt-2">{report.summary.repeatClientRate}%</p>
              <div className="mt-2"><ChangeBadge value={report.comparison.repeatRateChangePercent} /></div>
            </div>
          </div>

          {/* Business Observations */}
          {report.insights.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {report.insights.map((insight, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900 leading-relaxed">
                  {insight}
                </div>
              ))}
            </div>
          )}

          {/* Trend + Category Share */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Revenue & Bookings Trend</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Trend over the selected period</p>
                </div>
                <div className="flex items-center bg-slate-100 rounded-xl p-1">
                  {(['revenue', 'bookings', 'all'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setTrendMode(mode)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${trendMode === mode ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                      {mode === 'all' ? 'All' : mode}
                    </button>
                  ))}
                </div>
              </div>

              {report.trend.length === 0 ? (
                <div className="h-72 flex items-center justify-center text-xs text-slate-400">No bookings in this period.</div>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    {trendMode === 'bookings' ? (
                      <BarChart data={report.trend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                        <Tooltip contentStyle={{ borderRadius: '12px', borderColor: '#E2E8F0', fontSize: '12px' }} />
                        <Bar dataKey="bookings" fill="#2563EB" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    ) : trendMode === 'revenue' ? (
                      <AreaChart data={report.trend}>
                        <defs>
                          <linearGradient id="colorReportRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#9333EA" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#9333EA" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `₹${v / 1000}k`} />
                        <Tooltip formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Revenue']} contentStyle={{ borderRadius: '12px', borderColor: '#E2E8F0', fontSize: '12px' }} />
                        <Area type="monotone" dataKey="revenue" stroke="#9333EA" strokeWidth={3} fillOpacity={1} fill="url(#colorReportRev)" />
                      </AreaChart>
                    ) : (
                      <ComposedChart data={report.trend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                        <YAxis
                          yAxisId="left"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#64748B' }}
                          tickFormatter={(v) => `₹${v / 1000}k`}
                        />
                        <YAxis
                          yAxisId="left"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#64748B' }}
                          tickFormatter={(v) => `₹${v / 1000}k`}
                        />
                        <Tooltip contentStyle={{ borderRadius: '12px', borderColor: '#E2E8F0', fontSize: '12px' }} />
                        <Bar
                          yAxisId="right"
                          dataKey="bookings"
                          fill="#2564ebc9"
                          radius={[6, 6, 0, 0]}
                          name="Bookings"
                        />

                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="revenue"
                          stroke="#7c2bc8"
                          strokeWidth={2.5}
                          dot={{ r: 3 }}
                          name="Revenue (₹)"
                        />
                      </ComposedChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Service Category Share</h4>
                <p className="text-xs text-slate-500 mt-0.5">Revenue breakdown by service category</p>

                {report.serviceCategories.length === 0 ? (
                  <div className="h-52 flex items-center justify-center text-xs text-slate-400">No service revenue in this period.</div>
                ) : (
                  <div className="h-52 my-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={report.serviceCategories} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="revenue" nameKey="category">
                          {report.serviceCategories.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CategoryTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                {report.serviceCategories.map((item, index) => (
                  <div key={item.category} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }} />
                      <span className="font-medium text-slate-700">{item.category}</span>
                    </div>
                    <span className="font-bold text-slate-900">{formatCurrency(item.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Services / Package Performance / Customer Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900">Top Services</h4>
              <p className="text-xs text-slate-500 mt-0.5 mb-3">
                Most booked services in the selected period
              </p>

              {report.topServices.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No bookings in this period.
                </p>
              ) : (
                <div className="space-y-2">
                  {report.topServices.map((s, i) => (
                    <div
                      key={s.id}
                      className="grid grid-cols-[1fr_auto_auto] items-center gap-4 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-4 shrink-0 text-slate-400 font-semibold">
                          {i + 1}
                        </span>

                        <span className="font-semibold text-slate-800 truncate">
                          {s.name}
                        </span>
                      </div>

                      <span className="text-slate-500 whitespace-nowrap text-right">
                        {s.bookings} bookings
                      </span>

                      <span className="font-bold text-slate-900 whitespace-nowrap text-right min-w-[72px]">
                        {formatCurrency(s.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900">Package Performance</h4>
              <p className="text-xs text-slate-500 mt-0.5 mb-3">Package sales and revenue in the selected period</p>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 text-center">
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(report.packagePerformance.revenue)}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Revenue</p>
                </div>
                <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 text-center">
                  <p className="text-sm font-bold text-slate-900">{report.packagePerformance.sales}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Sold</p>
                </div>
                <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 text-center">
                  <p className="text-sm font-bold text-slate-900">{report.packagePerformance.customers}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Customers</p>
                </div>
              </div>

              {report.packagePerformance.topPackages.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No package sales in this period.</p>
              ) : (
                <div className="space-y-1.5">
                  {report.packagePerformance.topPackages.map((p, i) => (
                    <div key={p.id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 truncate">{i + 1}. {p.name}</span>
                      <span className="font-semibold text-slate-900 shrink-0 ml-2">{formatCurrency(p.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900">Customer Overview</h4>
              <p className="text-xs text-slate-500 mt-0.5 mb-3">Identifiable customers vs walk-ins</p>

              <div className="text-center py-3">
                <p className="text-2xl font-extrabold text-slate-900">{report.customers.identifiable}</p>
                <p className="text-[11px] text-slate-500">Identifiable Customers</p>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-t border-slate-100">
                <span className="text-slate-600">New Customers</span>
                <span className="font-bold text-slate-900">{report.customers.new}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-t border-slate-100">
                <span className="text-slate-600">Returning Customers</span>
                <span className="font-bold text-slate-900">{report.customers.returning}</span>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500"><UserX className="w-3.5 h-3.5" /></div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-900">
                    {report.customers.anonymousWalkIns} visits
                    <span className="text-slate-400 font-medium ml-1">({report.customers.anonymousWalkInPercentage}%)</span>
                  </p>
                  <p className="text-[10px] text-slate-500">Anonymous walk-ins — not included above</p>
                </div>
              </div>
            </div>
          </div>

          {/* Day of Week + Staff */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900">Bookings by Day of Week</h4>
              <p className="text-xs text-slate-500 mt-0.5 mb-4">Average bookings per day, selected period</p>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.dayOfWeek}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', borderColor: '#E2E8F0', fontSize: '12px' }} />
                    <Bar dataKey="avgBookings" fill="#9333EA" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900 mb-4">Top Performing Staff Members</h4>

              {report.staff.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No completed appointments in this period.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4 rounded-l-xl">Staff Member</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Completed</th>
                        <th className="py-3 px-4">Avg Ticket</th>
                        <th className="py-3 px-4">Rating</th>
                        <th className="py-3 px-4 text-right rounded-r-xl">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {report.staff.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-semibold">
                                {s.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                              </div>
                              <span>{s.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium">{s.role || 'NA'}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">{s.completedAppointments}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">{formatCurrency(s.avgTicketSize)}</td>
                          <td className="py-3.5 px-4">
                            {s.rating !== null ? (
                              <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                                {s.rating}
                              </span>
                            ) : (
                              <span className="text-slate-400">NA</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">{formatCurrency(s.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}