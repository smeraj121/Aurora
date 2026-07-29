// src/utils/otp.js
const crypto = require('crypto');
const authConfig = require('../config/auth');

/**
 * Generates a cryptographically secure 6-digit numeric OTP string
 */
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Calculates OTP expiry timestamp
 */
const getOtpExpiry = () => {
  const now = new Date();
  return new Date(now.getTime() + authConfig.otp.expiryMinutes * 60000);
};

module.exports = {
  generateOtp,
  getOtpExpiry,
};