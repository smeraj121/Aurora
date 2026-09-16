const reportService = require('../services/reportService');

async function getReport(req, res, next) {
  const { tenantId } = req.user;
  const { startDate, endDate } = req.query;
  const data = await reportService.getReport(tenantId, startDate, endDate);
  res.json({ success: true, data });
}

module.exports = { getReport };