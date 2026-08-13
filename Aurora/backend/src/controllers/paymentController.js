// controllers/calendarController.js
const calendarService = require('../services/calendarService');

// ============================================================
// GET /calendar/pending-payments - Get pending payments
// ============================================================
async function getPendingPayments(req, res, next) {
  try {
    const { tenantId } = req.user;
    const pending = await calendarService.getPendingPayments(tenantId);
    res.json({ success: true, data: pending });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// POST /calendar/payment - Record a payment
// ============================================================
async function updatePayment(req, res, next) {
  try {
    const { tenantId, userId } = req.user;
    const { appointmentId, paidAmount, paymentMethod } = req.body;
    const result = await calendarService.updatePayment(
      tenantId,
      appointmentId,
      paidAmount,
      paymentMethod,
      userId
    );
    res.json({
      success: true,
      message: 'Payment updated successfully!',
      data: result
    });
  } catch (error) {
    if (error.message.includes('required')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
}

module.exports = {
  getPendingPayments,
  updatePayment
};