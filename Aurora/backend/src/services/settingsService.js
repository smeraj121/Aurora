const tenantRepository = require('../repositories/tenantRepository');
const DEFAULTS = require('../config/tenantSettingsDefaults');

async function getSettings(tenantId) {
  const raw = await tenantRepository.getSettingsRaw(tenantId);
  return { ...DEFAULTS, ...raw };
}

async function updateSettings(tenantId, partialSettings) {
  // Only accept known keys — prevents arbitrary junk accumulating in the jsonb column
  const allowedKeys = Object.keys(DEFAULTS);
  const clean = {};
  for (const key of allowedKeys) {
    if (partialSettings[key] !== undefined) clean[key] = partialSettings[key];
  }
  const raw = await tenantRepository.updateSettings(tenantId, clean);
  return { ...DEFAULTS, ...raw };
}

async function getBusinessInfo(tenantId) {
  const billing = await tenantRepository.getBillingInfo(tenantId);
  return { name: billing?.name || '' };
}

module.exports = { getSettings, updateSettings, getBusinessInfo };