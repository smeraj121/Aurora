const appointmentService = require('../services/appointmentService');

async function recordPayment(req, res, next) {
  try {
    const { tenantId, userId } = req.user;
    const { appointmentId, paidAmount, paymentMethod } = req.body;
    // This should likely call a dedicated payment service or a method on appointmentService
    // For now, let's assume it's part of finishing an appointment.
    const result = await appointmentService.finishAppointment(tenantId, req.user.systemRole, appointmentId, { paidAmount, paymentMethod }, userId);
    res.json({ success: true, message: 'Payment recorded successfully!', data: result });
  } catch (error) {
    if (error.message.includes('required')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
}

module.exports = {
  recordPayment
};