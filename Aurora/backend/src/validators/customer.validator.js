const { ValidationError } = require('../errors');

// ============================================================
// STRICT NUMERIC ID PARSER
// Reusable across customer and related modules
// ============================================================
function parseNumericId(val) {
  if (val === null || val === undefined || val === '') return null;

  const strVal = String(val);

  // Only accept pure numeric strings
  if (!/^\d+$/.test(strVal)) {
    return null;
  }

  return parseInt(strVal, 10);
}

// ============================================================
// VALIDATE CUSTOMER ID
// ============================================================
function validateCustomerId(customerId) {
  const numericId = parseNumericId(customerId);
  if (numericId === null) {
    throw new ValidationError('Invalid customer ID format');
  }
  return numericId;
}

module.exports = {
  parseNumericId,
  validateCustomerId,
};
