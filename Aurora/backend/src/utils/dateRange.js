function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

function daysInclusive(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
}

// <=31 days: daily, 32-180 days: weekly, >180 days: monthly
function getGranularity(startDate, endDate, rules) {
  const days = daysInclusive(startDate, endDate);
  if (days <= rules.dailyMaxDays) return 'day';
  if (days <= rules.weeklyMaxDays) return 'week';
  return 'month';
}

// Previous period = the immediately preceding period of the same duration.
function getPreviousPeriod(startDate, endDate) {
  const duration = daysInclusive(startDate, endDate);
  const start = new Date(startDate);

  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);

  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - (duration - 1));

  return {
    prevStartDate: toISODate(prevStart),
    prevEndDate: toISODate(prevEnd),
  };
}

// Returns null (never Infinity/0%) when there's nothing to compare against.
function percentChange(current, previous) {
  const curr = Number(current) || 0;
  const prev = Number(previous) || 0;
  if (!prev) return null;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}

module.exports = { toISODate, daysInclusive, getGranularity, getPreviousPeriod, percentChange };