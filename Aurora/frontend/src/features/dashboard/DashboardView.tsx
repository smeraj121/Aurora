import { METRICS_DATA } from './data/mockData';
import { MetricCard } from './components/MetricCard';
import { AIOpportunityFeed } from './components/AIOpportunityFeed';
import { ScheduleTimeline } from './components/ScheduleTimeline';
import { RevenueChart } from './components/RevenueChart';
import { useState } from 'react';
import { DatePickerDropdown } from '../../shared/components/DatePickerDropdown';

export function DashboardView() {

  // Modal State
  const [selectedDashboardDate, setSelectedDashboardDate] = useState(new Date());

  const handleDateChange = (newDate: Date) => {
    setSelectedDashboardDate(newDate);
    // Here we can trigger data updates for specific selected dates if needed!
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Good Morning, Saba 👋
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Here is what’s happening with your business today.
          </p>
        </div>

        {/* Interactive Working Calendar Date Picker */}
        <div className="flex items-center gap-3">
          <DatePickerDropdown
            selectedDate={selectedDashboardDate}
            onDateChange={handleDateChange}
            align="right"
          />
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS_DATA.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      {/* AI Opportunity Feed Banner */}
      <AIOpportunityFeed />

      {/* Main Grid: Today's Schedule + Revenue Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ScheduleTimeline />
        </div>
        <div className="lg:col-span-5">
          <RevenueChart />
        </div>
      </div>

    </div>
  );
}