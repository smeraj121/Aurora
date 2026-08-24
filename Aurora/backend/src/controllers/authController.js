// src/controllers/auth.controller.js
const createSmsProvider = require('../utils/smsProviderFactory');
const OtpService = require('../services/otp.service');
const AuthService = require('../services/auth.service');
const {
  requestOtpSchema,
  verifyOtpSchema,
  completeSignupSchema,
  completeLoginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changeLanguageSchema,
  superAdminLoginSchema
} = require('../validators/auth.validator');
const { ValidationError } = require('../errors');
const smsProvider = createSmsProvider();
const otpService = new OtpService(smsProvider);
const authService = new AuthService(otpService);

class AuthController {
  async requestOtp(req, res, next) {
    try {
      const result = requestOtpSchema.safeParse(req.body);
      if (!result.success) {
        throw new ValidationError('Invalid request body', result.error.errors);
      }

      const response = await otpService.requestOtp(result.data.phone, result.data.purpose);
      res.status(200).json({ success: true, message: response.message });
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(req, res, next) {
    try {
      const result = verifyOtpSchema.safeParse(req.body);
      if (!result.success) throw new ValidationError('Invalid request body', result.error.errors);

      const response = await otpService.verifyOtp(result.data.phone, result.data.otp, result.data.purpose);
      res.status(200).json({ success: true, data: response });
    } catch (error) {
      next(error);
    }
  }

  async signup(req, res, next) {
    try {
      const result = completeSignupSchema.safeParse(req.body);
      if (!result.success) throw new ValidationError('Invalid signup body', result.error.errors);

      const data = await authService.signup(result.data);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = completeLoginSchema.safeParse(req.body);
      if (!result.success) throw new ValidationError('Invalid login body', result.error.errors);

      const data = await authService.login(result.data);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const result = refreshTokenSchema.safeParse(req.body);
      if (!result.success) throw new ValidationError('Invalid request body', result.error.errors);

      const data = await authService.refreshToken(result.data.refreshToken);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.userId);

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        tenantId: user.tenant_id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        systemRole: user.system_role,
      }
    });
  } catch (error) {
    next(error);
  }
  }

  async getCurrentUserProfile(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.userId);
      res.status(200).json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const result = updateProfileSchema.safeParse(req.body);
      if (!result.success) throw new ValidationError('Invalid update body', result.error.errors);

      const user = await authService.updateProfile(req.user.userId, result.data);
      res.status(200).json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  }

  async changeLanguage(req, res, next) {
    try {
      const result = changeLanguageSchema.safeParse(req.body);
      if (!result.success) throw new ValidationError('Invalid language body', result.error.errors);

      const response = await authService.changeLanguage(req.user.userId, result.data.preferredLanguage);
      res.status(200).json({ success: true, message: response.message });
    } catch (error) {
      next(error);
    }
  }

  async deactivateAccount(req, res, next) {
    try {
      const response = await authService.deactivateAccount(req.user.userId);
      res.status(200).json({ success: true, message: response.message });
    } catch (error) {
      next(error);
    }
  }
  async superAdminLogin(req, res, next) {
  try {
    const result = superAdminLoginSchema.safeParse(req.body);

    if (!result.success) {
      throw new ValidationError(
        'Invalid request body',
        result.error.errors
      );
    }

    const { phone, pin } = result.data;

    const data = await authService.superAdminLogin(
      phone,
      pin
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}
}

module.exports = new AuthController();