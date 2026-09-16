const { WALK_IN_PHONE } = require('../config/reportConfig');

// Single source of truth for identifying the anonymous Walk-in Customer
// record (see config/reportConfig.js). Every report query that needs to
// include/exclude walk-ins should import WALK_IN_PHONE from here rather
// than hardcoding the literal.
module.exports = { WALK_IN_PHONE };