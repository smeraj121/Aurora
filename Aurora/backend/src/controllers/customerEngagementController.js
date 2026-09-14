const customerEngagementService = require('../services/customerEngagementService');

// ============================================================
// GET /customer-engagement?type=birthday&withinDays=7
// ============================================================
async function getCustomerEngagement(req, res, next) {
  const { tenantId } = req.user;
  const { type, withinDays } = req.query;
  const data = await customerEngagementService.getEngagements(tenantId, type, withinDays);
  res.json({ success: true, data });
}

module.exports = { getCustomerEngagement };