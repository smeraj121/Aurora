// src/services/otp.service.js
const authRepository = require('../repositories/auth.repository');
const { generateOtp, getOtpExpiry } = require('../utils/otp');
const { generateVerificationToken, verifyVerificationToken } = require('../utils/jwt');
const authConfig = require('../config/auth');
const { ValidationError, NotFoundError, ConflictError } = require('../errors');
const { OtpPurposes } = require('../config/constants');

class OtpService {
  constructor(smsProvider) {
    this.smsProvider = smsProvider;
  }

  async requestOtp(phone, purpose) {
    const existingUsers = await authRepository.findUserByPhone(phone);

    if (purpose === OtpPurposes.SIGNUP && Array.isArray(existingUsers) && existingUsers.length > 0) {
      throw new ConflictError('User already registered with this phone number');
    }

    if (purpose === OtpPurposes.LOGIN && Array.isArray(existingUsers) && existingUsers.length === 0) {
      throw new NotFoundError('No active account found for this phone number');
    }

    const otp = generateOtp();
    const expiresAt = getOtpExpiry();

    await authRepository.storeOtp(phone, otp, purpose, expiresAt);
    await this.smsProvider.sendOtp(phone, otp, purpose);

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(phone, otp, purpose) {
    const otpRecord = await authRepository.findValidOtp(phone, purpose);

    if (!otpRecord) {
      throw new ValidationError('Invalid or expired OTP. Please request a new code.');
    }

    if (otpRecord.attempt_count >= authConfig.otp.maxAttempts) {
      throw new ValidationError('Maximum OTP verification attempts reached');
    }

    if (new Date() > new Date(otpRecord.expires_at)) {
      throw new ValidationError('OTP has expired');
    }

    if (otpRecord.otp !== otp) {
      await authRepository.incrementOtpAttempts(otpRecord.id);
      throw new ValidationError('Incorrect OTP code');
    }

    await authRepository.markOtpVerified(otpRecord.id);

    // Issue signed temporary verification token proving OTP was successfully verified
    const verificationToken = generateVerificationToken({ phone, purpose });

    return {
      message: 'OTP verified successfully',
      verificationToken,
    };
  }

  validateVerificationToken(token, expectedPurpose) {
    try {
      const decoded = verifyVerificationToken(token);
      if (decoded.purpose !== expectedPurpose) {
        throw new ValidationError('Invalid token purpose');
      }
      return decoded.phone;
    } catch {
      throw new ValidationError('Verification session expired or invalid. Please verify OTP again.');
    }
  }
}

module.exports = OtpService;