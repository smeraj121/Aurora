const reportRepository = require('../repositories/reportRepository');
const config = require('../config/reportConfig');
const { WALK_IN_PHONE } = require('../utils/walkIn');
const { getGranularity, getPreviousPeriod, percentChange } = require('../utils/dateRange');
const { ValidationError } = require('../errors');

const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONDAY_FIRST_ORDER = [1, 2, 3, 4, 5, 6, 0];

function validateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    throw new ValidationError('startDate and endDate are required');
  }
  if (new Date(startDate) > new Date(endDate)) {
    throw new ValidationError('startDate must not be after endDate');
  }
}

function formatTrendLabel(periodStart, granularity) {
  const date = new Date(periodStart);
  if (granularity === 'day') {
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  }
  if (granularity === 'week') {
    return `Week of ${date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`;
  }
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

function buildDayOfWeekResult(rows) {
  const byDow = {};
  rows.forEach(r => { byDow[r.dow] = r; });

  return MONDAY_FIRST_ORDER.map(dow => {
    const row = byDow[dow] || { totalBookings: 0, avgBookings: 0 };
    return {
      day: DOW_LABELS[dow],
      avgBookings: Number(row.avgBookings) || 0,
      totalBookings: Number(row.totalBookings) || 0,
    };
  });
}

// ============================================================
// BUSINESS OBSERVATIONS — deterministic, only shown when
// genuinely meaningful (see config/reportConfig.js for thresholds)
// ============================================================
function buildInsights({ topServices, packageRevenue, grossRevenue, dayOfWeek }) {
  const insights = [];
  const rules = config.insights;

  // 1. Revenue-per-booking outlier among the top services
  if (topServices.length >= 2) {
    const withRpb = topServices.map(s => ({
      ...s,
      revenuePerBooking: s.bookings > 0 ? s.revenue / s.bookings : 0,
    }));
    const mostBooked = withRpb[0];
    const highestRpb = [...withRpb].sort((a, b) => b.revenuePerBooking - a.revenuePerBooking)[0];

    if (
      highestRpb.id !== mostBooked.id &&
      mostBooked.revenuePerBooking > 0 &&
      highestRpb.revenuePerBooking >= mostBooked.revenuePerBooking * (1 + rules.serviceRevenuePerBookingUpliftPercent / 100)
    ) {
      insights.push(
        `${highestRpb.name} generates more revenue per booking than ${mostBooked.name} despite fewer bookings.`
      );
    }
  }

  // 2. Package revenue contribution
  const combinedRevenue = grossRevenue + packageRevenue;
  if (combinedRevenue > 0) {
    const sharePercent = (packageRevenue / combinedRevenue) * 100;
    if (sharePercent >= rules.minPackageRevenueSharePercent) {
      insights.push(`Package sales contributed ${Math.round(sharePercent)}% of revenue this period.`);
    }
  }

  // 3. Notably slow weekday
  if (dayOfWeek.length > 0) {
    const avgOfAverages = dayOfWeek.reduce((sum, d) => sum + d.avgBookings, 0) / dayOfWeek.length;
    if (avgOfAverages > 0) {
      const slowest = [...dayOfWeek].sort((a, b) => a.avgBookings - b.avgBookings)[0];
      if (slowest.avgBookings <= avgOfAverages * (rules.dayOfWeekLowThresholdPercent / 100)) {
        insights.push(`${slowest.day} bookings are significantly lower than the weekday average.`);
      }
    }
  }

  return insights.slice(0, 3);
}

async function getReport(tenantId, startDate, endDate) {
  validateRange(startDate, endDate);

  const granularity = getGranularity(startDate, endDate, config.trendGranularity);
  const { prevStartDate, prevEndDate } = getPreviousPeriod(startDate, endDate);
  const limit = config.topListLimit;

  const [
    summary,
    prevSummary,
    trendRows,
    dayOfWeekRows,
    serviceCategories,
    topServices,
    packagePerformance,
    topPackages,
    newCustomers,
    returningCustomers,
    repeatStats,
    prevRepeatStats,
    walkInVisits,
    staff,
  ] = await Promise.all([
    reportRepository.getSummary(tenantId, startDate, endDate),
    reportRepository.getSummary(tenantId, prevStartDate, prevEndDate),
    reportRepository.getTrend(tenantId, startDate, endDate, granularity),
    reportRepository.getDayOfWeek(tenantId, startDate, endDate),
    reportRepository.getServiceCategories(tenantId, startDate, endDate),
    reportRepository.getTopServices(tenantId, startDate, endDate, limit),
    reportRepository.getPackagePerformance(tenantId, startDate, endDate),
    reportRepository.getTopPackages(tenantId, startDate, endDate, limit),
    reportRepository.getNewCustomerCount(tenantId, startDate, endDate, WALK_IN_PHONE),
    reportRepository.getReturningCustomerCount(tenantId, startDate, endDate, WALK_IN_PHONE),
    reportRepository.getRepeatRateStats(tenantId, startDate, endDate, WALK_IN_PHONE),
    reportRepository.getRepeatRateStats(tenantId, prevStartDate, prevEndDate, WALK_IN_PHONE),
    reportRepository.getWalkInVisitCount(tenantId, startDate, endDate, WALK_IN_PHONE),
    reportRepository.getStaffPerformance(tenantId, startDate, endDate, limit),
  ]);

  const grossRevenue = Number(summary.grossRevenue) || 0;
  const totalBookings = parseInt(summary.totalBookings, 10) || 0;
  const avgTicketSize = totalBookings > 0 ? Math.round(grossRevenue / totalBookings) : 0;

  const prevGrossRevenue = Number(prevSummary.grossRevenue) || 0;
  const prevTotalBookings = parseInt(prevSummary.totalBookings, 10) || 0;
  const prevAvgTicketSize = prevTotalBookings > 0 ? Math.round(prevGrossRevenue / prevTotalBookings) : 0;

  const repeatClientRate = repeatStats.activeCustomers > 0
    ? Math.round((repeatStats.repeatCustomers / repeatStats.activeCustomers) * 1000) / 10
    : 0;
  const prevRepeatClientRate = prevRepeatStats.activeCustomers > 0
    ? Math.round((prevRepeatStats.repeatCustomers / prevRepeatStats.activeCustomers) * 1000) / 10
    : 0;

  const packageRevenue = Number(packagePerformance.revenue) || 0;

  const normalizedTopServices = topServices.map(s => ({
    id: s.id,
    name: s.name,
    bookings: parseInt(s.bookings, 10),
    revenue: Number(s.revenue),
  }));

  const dayOfWeek = buildDayOfWeekResult(dayOfWeekRows);

  const identifiableCustomers = newCustomers + returningCustomers;
  const totalVisitsInPeriod = totalBookings;
  const anonymousWalkInPercentage = totalVisitsInPeriod > 0
    ? Math.round((walkInVisits / totalVisitsInPeriod) * 1000) / 10
    : 0;

  return {
    dateRange: { startDate, endDate },

    summary: {
      grossRevenue,
      totalBookings,
      avgTicketSize,
      repeatClientRate,
    },

    comparison: {
      revenueChangePercent: percentChange(grossRevenue, prevGrossRevenue),
      bookingsChangePercent: percentChange(totalBookings, prevTotalBookings),
      avgTicketChangePercent: percentChange(avgTicketSize, prevAvgTicketSize),
      repeatRateChangePercent: percentChange(repeatClientRate, prevRepeatClientRate),
    },

    trend: trendRows.map(r => ({
      label: formatTrendLabel(r.periodStart, granularity),
      periodStart: r.periodStart,
      revenue: Number(r.revenue),
      bookings: parseInt(r.bookings, 10),
    })),

    dayOfWeek,

    serviceCategories: serviceCategories.map(c => ({
      category: c.category,
      revenue: Number(c.revenue),
      bookings: parseInt(c.bookings, 10),
      services: (c.services || []).map(s => ({
        name: s.name,
        bookings: parseInt(s.bookings, 10),
        revenue: Number(s.revenue),
      })),
    })),

    topServices: normalizedTopServices,

    packagePerformance: {
      revenue: packageRevenue,
      sales: parseInt(packagePerformance.sales, 10) || 0,
      customers: parseInt(packagePerformance.customers, 10) || 0,
      topPackages: topPackages.map(p => ({
        id: p.id,
        name: p.name,
        sales: parseInt(p.sales, 10),
        revenue: Number(p.revenue),
      })),
    },

    customers: {
      identifiable: identifiableCustomers,
      new: newCustomers,
      returning: returningCustomers,
      repeatRate: repeatClientRate,
      anonymousWalkIns: walkInVisits,
      anonymousWalkInPercentage,
    },

    staff: staff.map(s => ({
      id: s.id,
      name: s.name,
      role: s.role,
      avatar: s.avatar,
      completedAppointments: parseInt(s.completedAppointments, 10),
      revenue: Number(s.revenue),
      avgTicketSize: parseInt(s.completedAppointments, 10) > 0
        ? Math.round(Number(s.revenue) / parseInt(s.completedAppointments, 10))
        : 0,
      rating: s.rating !== null ? Number(s.rating) : null,
    })),

    insights: buildInsights({
      topServices: normalizedTopServices,
      packageRevenue,
      grossRevenue,
      dayOfWeek,
    }),
  };
}

module.exports = { getReport };