// controllers/calendarController.js
const calendarService = require('../services/calendarService');

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


module.exports = {
  getScheduleByDate,
};