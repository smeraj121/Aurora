// controllers/calendarController.js
const calendarService = require('../services/calendarService');

// ============================================================
// GET /calendar/:id - Get appointment by ID
// ============================================================
async function getAppointmentById(req, res, next) {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;
    const appointment = await calendarService.getAppointmentById(tenantId, parseInt(id, 10));
    res.json({ success: true, data: appointment });
  } catch (error) {
    if (error.message === 'Appointment not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ============================================================
// GET /calendar - Get schedule by date
// ============================================================
async function getScheduleByDate(req, res, next) {
  try {
    const { tenantId } = req.user;
    const { date } = req.query;
    const schedule = await calendarService.getScheduleByDate(tenantId, date);
    res.json({ success: true, data: schedule });
  } catch (error) {
    if (error.message === 'Date parameter is required') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ============================================================
// GET /calendar/packages - Get available packages
// ============================================================
async function getAvailablePackages(req, res, next) {
  try {
    const { tenantId } = req.user;
    const packages = await calendarService.getAvailablePackages(tenantId);
    res.json({ success: true, data: packages });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// GET /calendar/customer/:customerId/packages - Get customer's packages
// ============================================================
async function getCustomerPackages(req, res, next) {
  try {
    const { tenantId } = req.user;
    const { customerId } = req.params;
    const packages = await calendarService.getCustomerPackages(tenantId, parseInt(customerId, 10));
    res.json({ success: true, data: packages });
  } catch (error) {
    next(error);
  }
}

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

// ============================================================
// POST /calendar/purchase-package - Buy a package
// ============================================================
async function purchasePackage(req, res, next) {
  try {
    const { tenantId, userId } = req.user;
    const { customerId, packageId, paymentMethod } = req.body;
    const result = await calendarService.purchasePackage(
      tenantId,
      customerId,
      packageId,
      paymentMethod,
      userId
    );
    res.json({
      success: true,
      message: 'Package purchased successfully!',
      data: result
    });
  } catch (error) {
    if (error.message.includes('required')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ============================================================
// POST /calendar - Create or Update Appointment
// ============================================================
async function createOrUpdateAppointment(req, res, next) {
  try {
    const { tenantId, userId } = req.user;
    const result = await calendarService.createOrUpdateAppointment(tenantId, req.body, userId);
    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      data: result
    });
  } catch (error) {
    if (error.message.includes('required') || error.message.includes('is required')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.message.includes('already registered')) {
      return res.status(409).json({ success: false, message: error.message });
    }
    next(error);
  }
}

module.exports = {
  getAppointmentById,
  getScheduleByDate,
  getAvailablePackages,
  getCustomerPackages,
  getPendingPayments,
  updatePayment,
  purchasePackage,
  createOrUpdateAppointment,
};