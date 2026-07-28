// DashboardView.jsx
import { useState, useEffect } from 'react';
import { MetricCard } from './components/MetricCard';
import { AIOpportunityFeed } from './components/AIOpportunityFeed';
import { RevenueChart } from './components/RevenueChart';
import { DatePickerDropdown } from '../../shared/components/DatePickerDropdown';
import { ScheduleTimeline } from './ScheduleTimeline/ScheduleTimeline';
import { fetchDashboardData, fetchDashboardRevenue } from './data/dashboardService';
import type { DashboardMetric, Revenue } from './types/dashboard.types';

export function DashboardView() {
  const [selectedDashboardDate, setSelectedDashboardDate] = useState(new Date());
  const [metricsData, setMetricsData] = useState<DashboardMetric[]>([]);
  const [revenueData, setRevenueData] = useState<Revenue[]>([]);


  const handleDateChange = (newDate: Date) => {
    setSelectedDashboardDate(newDate);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchDashboardData(selectedDashboardDate);
        const revenue = await fetchDashboardRevenue(selectedDashboardDate);
        setMetricsData(data);
        setRevenueData(revenue);
      } catch (error) {
        // Silently fail - keep showing mock data
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    loadData();
  }, [selectedDashboardDate]);

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
        {metricsData.map((metric) => (
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
          <RevenueChart key={1} data={revenueData} />
        </div>
      </div>

    </div>
  );
}

