const reviewRepository = require('../repositories/reviewRepository');
const appointmentRepository = require('../repositories/appointmentRepository');
const customerService = require('./customerService');
const { NotFoundError, ValidationError, ForbiddenError, ConflictError } = require('../errors');

async function createReview(tenantId, userId, data) {
  const appointmentId = data.appointmentId;
  if (!appointmentId) {
    throw new ValidationError('appointmentId is required.');
  }

  const rating = Number(data.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ValidationError('Rating must be a whole number between 1 and 5.');
  }

  const customerId = await customerService.getCustomerIdForUser(tenantId, userId);

  const appointment = await appointmentRepository.getAppointmentById(tenantId, appointmentId);
  if (!appointment) {
    throw new NotFoundError('Appointment not found.');
  }
  if (appointment.customerId !== customerId) {
    throw new ForbiddenError('You can only rate your own appointments.');
  }
  if (appointment.status !== 'completed') {
    throw new ValidationError('Only completed appointments can be rated.');
  }
  if (!appointment.staffId) {
    throw new ValidationError('This appointment has no assigned staff member to rate.');
  }

  const existing = await reviewRepository.findByAppointmentId(tenantId, appointmentId);
  if (existing) {
    throw new ConflictError('This appointment has already been rated.');
  }

  return reviewRepository.create(tenantId, {
    customerId,
    staffId: appointment.staffId,
    appointmentId,
    rating,
    createdBy: userId,
  });
}

module.exports = { createReview };