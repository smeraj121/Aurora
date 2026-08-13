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
    const { tenantId,userId, systemRole } = req.user;
    const { date } = req.query;
    const schedule = await calendarService.getScheduleByDate(tenantId, userId, date, systemRole);
    res.json({ success: true, data: schedule });
  } catch (error) {
    if (error.message === 'Date parameter is required') {
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
  createOrUpdateAppointment,
};