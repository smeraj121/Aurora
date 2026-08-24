// services/calendarService.js
const calendarRepository = require('../repositories/calendarRepository');
const customerService = require('./customerService');
const { NotFoundError, ValidationError, ConflictError } = require('../errors');


// ============================================================
// GET SCHEDULE BY DATE
// ============================================================
async function getScheduleByDate(tenantId, userId, date, systemRole, includeCancelled = false) {
  if (!date) {
    throw new ValidationError('Date parameter is required');
  }
  const schedule = await calendarRepository.findScheduleByDate(tenantId, date, includeCancelled);
  const customerId = systemRole?.trim().toLowerCase() === 'customer'
    ? await customerService.getCustomerIdForUser(tenantId, userId)
    : null;
  schedule.forEach((appointment) => {
    if (!appointment) return;
    if (customerId !== null && appointment.customerId !== customerId) {
      appointment.customerId = null;
      appointment.customerName = 'Booked Customer';
      appointment.customerPhone = null;
      appointment.customerPackageId = null;
      appointment.isPackageAppointment = false;
      appointment.services = [];
      appointment.isEditable = false;
    }
    appointment.balanceDue = (appointment.amount || 0) - (appointment.paidAmount || 0);
  });
  return schedule;
}

module.exports = {
  getScheduleByDate
};