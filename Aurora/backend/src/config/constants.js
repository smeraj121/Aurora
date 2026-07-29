// src/config/constants.js
const Roles = Object.freeze({
  OWNER: 'Owner',
  ADMIN: 'Admin',
  STAFF: 'Staff',
  CUSTOMER: 'Customer',
});

const OtpPurposes = Object.freeze({
  SIGNUP: 'signup',
  LOGIN: 'login',
  CHANGE_PHONE: 'change_phone',
  RESET_PASSWORD: 'reset_password',
});

module.exports = {
  Roles,
  OtpPurposes
};