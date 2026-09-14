const repository = require('../repositories/customerEngagementRepository');
const rules = require('../config/engagementRules');
const { buildWhatsAppUrl } = require('../utils/whatsapp');
const { ValidationError } = require('../errors');

const VALID_TYPES = ['birthday', 'appointment', 'followup'];

// ============================================================
// DATE HELPERS
// ============================================================
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// Computes the next occurrence of a birthday from `today`, correctly
// handling the year boundary (e.g. today=28 Dec, birthday=2 Jan) and
// Feb 29 birthdays in non-leap years (observed on Feb 28).
function getNextBirthdayOccurrence(birthday, today) {
  const bday = new Date(birthday);
  const month = bday.getUTCMonth();
  const day = bday.getUTCDate();

  const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  const buildCandidate = (year) => {
    let d = day;
    if (month === 1 && day === 29 && !isLeapYear(year)) {
      d = 28;
    }
    return new Date(Date.UTC(year, month, d));
  };

  let candidate = buildCandidate(todayUTC.getUTCFullYear());
  if (candidate < todayUTC) {
    candidate = buildCandidate(todayUTC.getUTCFullYear() + 1);
  }

  const daysUntil = Math.round((candidate.getTime() - todayUTC.getTime()) / 86400000);
  return { eventDate: candidate, daysUntil };
}

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

function formatDisplayDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDisplayTime(timeStr) {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

// Multiple services on the latest appointment: keep it simple and
// just surface the first one (section 10).
function pickLastService(services) {
  if (!services || services.length === 0) return null;
  return services[0];
}

// ============================================================
// BIRTHDAY
// ============================================================
function buildBirthdaySuggestion(category) {
  const pct = (category && rules.birthday.offerPercentageByCategory[category])
    || rules.birthday.defaultOfferPercentage;
  const serviceLabel = category ? `${category.toLowerCase()} service` : 'service';

  return {
    title: 'Birthday Offer',
    description: `${pct}% off on your next ${serviceLabel}`,
    percentage: pct,
    serviceLabel,
  };
}

function buildBirthdayMessage(fullName, suggestion) {
  const firstName = (fullName || '').split(' ')[0];
  return `Hi ${firstName}! 🎂 Wishing you a very happy birthday from Aurora. As a little birthday treat, we'd love to offer you ${suggestion.percentage}% off on your next ${suggestion.serviceLabel}. Would you like to book a visit?`;
}

async function getBirthdayEngagements(tenantId, withinDays) {
  const customers = await repository.getCustomersWithBirthday(tenantId);
  const today = new Date();

  const qualifying = customers
    .map(c => {
      const { eventDate, daysUntil } = getNextBirthdayOccurrence(c.birthday, today);
      return { ...c, eventDate, daysUntil };
    })
    .filter(c => c.daysUntil >= 0 && c.daysUntil <= withinDays);

  const customerIds = qualifying.map(c => c.customerId);
  const lastServiceMap = await repository.getLastServiceForCustomers(tenantId, customerIds);

  return qualifying
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .map(c => {
      const context = lastServiceMap[c.customerId];
      const lastService = pickLastService(context?.services);
      const suggestion = buildBirthdaySuggestion(lastService?.category);
      const message = buildBirthdayMessage(c.fullName, suggestion);

      return {
        type: 'birthday',
        customer: { id: c.customerId, name: c.fullName, phone: c.phone },
        event: {
          date: toISODate(c.eventDate),
          daysUntil: c.daysUntil,
        },
        reason: {
          code: 'BIRTHDAY_UPCOMING',
          label: c.daysUntil === 0 ? 'Birthday today' : `Birthday in ${c.daysUntil} day${c.daysUntil === 1 ? '' : 's'}`,
        },
        context: {
          lastVisitDate: context?.lastVisitDate
            ? toISODate(new Date(context.lastVisitDate))
            : (c.lastVisitDate ? toISODate(new Date(c.lastVisitDate)) : null),
          lastService: lastService
            ? { id: lastService.id, name: lastService.name, category: lastService.category }
            : null,
        },
        suggestion: { title: suggestion.title, description: suggestion.description },
        message,
        whatsappUrl: buildWhatsAppUrl(c.phone, message),
      };
    });
}

// ============================================================
// UPCOMING APPOINTMENT
// ============================================================
async function getAppointmentEngagements(tenantId, withinDays) {
  const appointments = await repository.getUpcomingAppointments(tenantId, withinDays);
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  return appointments.map(a => {
    const apptDate = new Date(a.appointmentDate);
    const daysUntil = Math.round((apptDate.getTime() - today.getTime()) / 86400000);

    const serviceNames = (a.services || []).map(s => s.name).join(', ') || 'your appointment';
    const displayDate = formatDisplayDate(a.appointmentDate);
    const displayTime = formatDisplayTime(a.startTime);

    let timeLabel;
    if (daysUntil === 0) timeLabel = `today at ${displayTime}`;
    else if (daysUntil === 1) timeLabel = `tomorrow at ${displayTime}`;
    else timeLabel = `on ${displayDate} at ${displayTime}`;

    const suggestion = {
      title: 'Appointment Reminder',
      description: `Appointment ${timeLabel}`,
    };

    const firstName = (a.fullName || '').split(' ')[0];
    const message = `Hi ${firstName}! This is a reminder from Aurora about your ${serviceNames} appointment ${timeLabel}. Looking forward to seeing you!`;

    return {
      type: 'appointment',
      customer: { id: a.customerId, name: a.fullName, phone: a.phone },
      event: {
        date: a.appointmentDate,
        startTime: a.startTime,
        endTime: a.endTime,
        daysUntil,
      },
      reason: {
        code: 'APPOINTMENT_UPCOMING',
        label: daysUntil === 0 ? 'Appointment today' : `Appointment in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`,
      },
      context: {
        services: (a.services || []).map(s => ({ id: s.id, name: s.name, category: s.category })),
        staffName: a.staffName || null,
      },
      suggestion,
      message,
      whatsappUrl: buildWhatsAppUrl(a.phone, message),
    };
  });
}

// ============================================================
// FOLLOW-UP
// ============================================================
async function getFollowupEngagements(tenantId) {
  const days = rules.followup.daysSinceLastVisit;
  const candidates = await repository.getFollowupCandidates(tenantId, days);

  const customerIds = candidates.map(c => c.customerId);
  const lastServiceMap = await repository.getLastServiceForCustomers(tenantId, customerIds);

  return candidates.map(c => {
    const context = lastServiceMap[c.customerId];
    const lastService = pickLastService(context?.services);
    const daysSince = Number(c.daysSinceLastVisit);

    const suggestion = {
      title: 'Follow-up',
      description: `Customer has not visited in ${daysSince} days`,
    };

    const firstName = (c.fullName || '').split(' ')[0];
    const message = `Hi ${firstName}! It's been a while since your last visit to Aurora. We'd love to see you again — is there anything we can help you book?`;

    return {
      type: 'followup',
      customer: { id: c.customerId, name: c.fullName, phone: c.phone },
      event: {
        date: c.lastVisitDate ? toISODate(new Date(c.lastVisitDate)) : null,
        daysSinceLastVisit: daysSince,
      },
      reason: {
        code: 'FOLLOWUP_DUE',
        label: `${daysSince} days since last visit`,
      },
      context: {
        lastVisitDate: c.lastVisitDate ? toISODate(new Date(c.lastVisitDate)) : null,
        lastService: lastService
          ? { id: lastService.id, name: lastService.name, category: lastService.category }
          : null,
      },
      suggestion,
      message,
      whatsappUrl: buildWhatsAppUrl(c.phone, message),
    };
  });
}

// ============================================================
// ENTRY POINT
// ============================================================
async function getEngagements(tenantId, type, withinDaysRaw) {
  if (!VALID_TYPES.includes(type)) {
    throw new ValidationError(`Invalid engagement type: ${type}`);
  }

  if (type === 'birthday') {
    const withinDays = withinDaysRaw !== undefined ? parseInt(withinDaysRaw, 10) : rules.birthday.defaultWithinDays;
    if (Number.isNaN(withinDays) || withinDays < 0) {
      throw new ValidationError('withinDays must be a non-negative number');
    }
    return getBirthdayEngagements(tenantId, withinDays);
  }

  if (type === 'appointment') {
    const withinDays = withinDaysRaw !== undefined ? parseInt(withinDaysRaw, 10) : rules.appointment.defaultWithinDays;
    if (Number.isNaN(withinDays) || withinDays < 0) {
      throw new ValidationError('withinDays must be a non-negative number');
    }
    return getAppointmentEngagements(tenantId, withinDays);
  }

  return getFollowupEngagements(tenantId);
}

module.exports = { getEngagements };