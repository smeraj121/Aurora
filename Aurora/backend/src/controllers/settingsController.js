const settingsService = require('../services/settingsService');

async function getSettings(req, res, next) {
  const { tenantId } = req.user;
  const settings = await settingsService.getSettings(tenantId);
  res.json({ success: true, data: settings });
}

async function updateSettings(req, res, next) {
  const { tenantId } = req.user;
  const settings = await settingsService.updateSettings(tenantId, req.body);
  res.json({ success: true, data: settings, message: 'Settings updated successfully' });
}

async function getBusinessInfo(req, res, next) {
  const { tenantId } = req.user;
  const info = await settingsService.getBusinessInfo(tenantId);
  res.json({ success: true, data: info });
}

module.exports = { getSettings, updateSettings, getBusinessInfo };