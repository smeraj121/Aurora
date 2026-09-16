module.exports = {
  WALK_IN_PHONE: '9999999999',

  trendGranularity: {
    dailyMaxDays: 31,
    weeklyMaxDays: 180,
  },

  topListLimit: 5,

  // Thresholds that decide whether a "Business Observation" is worth
  // showing at all (see reportService.buildInsights). Kept here so the
  // bar for "meaningful" can be tuned in one place.
  insights: {
    // A service's revenue-per-booking must exceed the most-booked
    // service's revenue-per-booking by at least this % to be called out.
    serviceRevenuePerBookingUpliftPercent: 20,
    // Package revenue must be at least this % of (appointment + package)
    // revenue to be called out as a meaningful contribution.
    minPackageRevenueSharePercent: 15,
    // A weekday whose average bookings fall below this % of the overall
    // daily average is called out as significantly slower.
    dayOfWeekLowThresholdPercent: 60,
  },
};