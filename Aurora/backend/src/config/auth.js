// src/config/auth.js

module.exports = {
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET,
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '30d',
  },
  otp: {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 5,
    length: parseInt(process.env.OTP_LENGTH, 10) || 6,
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 5,
  },
};