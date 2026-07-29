// src/utils/jwt.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authConfig = require('../config/auth');

const generateAccessToken = (payload) => {
  return jwt.sign(payload, authConfig.jwt.accessTokenSecret, {
    expiresIn: authConfig.jwt.accessTokenExpiry,
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, authConfig.jwt.refreshTokenSecret, {
    expiresIn: authConfig.jwt.refreshTokenExpiry,
  });
};

/**
 * Short-lived signed token issued upon successfully verifying an OTP.
 * Consumed by signup or multi-tenant login endpoints.
 */
const generateVerificationToken = (payload) => {
  return jwt.sign(payload, authConfig.jwt.accessTokenSecret, {
    expiresIn: '10m',
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, authConfig.jwt.accessTokenSecret);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, authConfig.jwt.refreshTokenSecret);
};

const verifyVerificationToken = (token) => {
  return jwt.verify(token, authConfig.jwt.accessTokenSecret);
};

/**
 * Hashes raw refresh tokens with SHA-256 before database storage
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateVerificationToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyVerificationToken,
  hashToken,
};