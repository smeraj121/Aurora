// src/validators/auth.validator.js
const { z } = require('zod');
const { Roles, OtpPurposes } = require('../config/constants');

const phoneSchema = z.string().min(10, 'Invalid phone format').max(20);

const requestOtpSchema = z.object({
  phone: phoneSchema,
  purpose: z.nativeEnum(OtpPurposes),
});

const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: z.string().length(6, 'OTP must be 6 digits'),
  purpose: z.nativeEnum(OtpPurposes),
});

const completeSignupSchema = z.object({
  verificationToken: z.string().min(1, 'Verification token required'),
  fullName: z.string().min(2, 'Full name required'),
  email: z.string().email().optional().nullable(),
  systemRole: z.nativeEnum(Roles),
  tenantId: z.number().positive().optional().nullable(),
  preferredLanguage: z.string().max(10).optional().default('en'),
});

const completeLoginSchema = z.object({
  verificationToken: z.string().min(1, 'Verification token required'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token required'),
});

const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional().nullable(),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  gender: z.string().max(20).optional().nullable(),
  profileImageUrl: z.string().url().optional().nullable(),
});

const changeLanguageSchema = z.object({
  preferredLanguage: z.string().min(2).max(10),
});

module.exports = {
  requestOtpSchema,
  verifyOtpSchema,
  completeSignupSchema,
  completeLoginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changeLanguageSchema,
};