// services/calendarService.js
const calendarRepository = require('../repositories/calendarRepository');
const { calculatePaymentStatus } = require('../validators/appointmentValidators');
const { ValidationError } = require('../errors');

// ============================================================
// GET SCHEDULE BY DATE
// ============================================================
async function getScheduleByDate(tenantId, userId, date, systemRole) {
  if (!date) {
    throw new ValidationError('Date parameter is required');
  }
  const schedule = await calendarRepository.findScheduleByDate(tenantId, date);
  schedule.forEach((appointment) => {
    if(!appointment) return;
    if(systemRole.trim().toLowerCase() === 'customer' && appointment.customerId !== userId) {
      // Hide sensitive customer information for non-admin/staff users
      appointment.customerId = null;
      appointment.customerName = 'Booked Customer';
      appointment.customerPhone = null;
      appointment.customerPackageId = null;
      appointment.isPackageAppointment = false;
      appointment.services = [];
      appointment.isEditable = false;
    }
    appointment.balanceDue = calculatePaymentStatus(appointment.amount, appointment.paidAmount).balanceDue;
  });
  return schedule;
}

module.exports = {
  getScheduleByDate,
};