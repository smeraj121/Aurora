// src/services/auth.service.js
const pool = require('../config/db');
const authRepository = require('../repositories/auth.repository');
const tokenService = require('./token.service');
const { UnauthorizedError, NotFoundError, ValidationError } = require('../errors');

class AuthService {
  constructor(otpService) {
    this.otpService = otpService;
  }

  async signup(signupData) {
    const { verificationToken, fullName, email, systemRole, tenantId, preferredLanguage } = signupData;

    // Validate short-lived token generated from /auth/verify-otp
    const phone = this.otpService.validateVerificationToken(verificationToken, 'signup');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const newUser = await authRepository.createUser(
        { tenantId, fullName, phone, email, systemRole, preferredLanguage, otpVerified: true },
        client
      );

      await authRepository.updateLastLogin(newUser.id, client);

      const tokenPayload = {
        userId: newUser.id,
        tenantId: newUser.tenant_id,
        systemRole: newUser.system_role,
        phone: newUser.phone,
      };

      const tokens = await tokenService.issueTokens(tokenPayload, client);

      await client.query('COMMIT');

      return {
        user: {
          id: newUser.id,
          tenantId: newUser.tenant_id,
          fullName: newUser.full_name,
          phone: newUser.phone,
          email: newUser.email,
          systemRole: newUser.system_role,
        },
        ...tokens,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async login(loginData) {
    const { verificationToken, tenantId } = loginData;

    const phone = this.otpService.validateVerificationToken(verificationToken, 'login');
    const userTenants = await authRepository.findUserTenants(phone);

    if (!userTenants || userTenants.length === 0) {
      throw new NotFoundError('No active tenant accounts linked to this phone number');
    }

    // Auto-resolve single-tenant users
    if (userTenants.length === 1) {
      const singleUser = userTenants[0];
      await authRepository.updateLastLogin(singleUser.user_id);

      const tokens = await tokenService.issueTokens({
        userId: singleUser.user_id,
        tenantId: singleUser.tenant_id,
        systemRole: singleUser.system_role,
        phone,
      });

      return {
        requiresTenantSelection: false, ...tokens, user: {
          id: singleUser.user_id,
          fullName: singleUser.full_name,
          email: singleUser.email,
          phone,
          systemRole: singleUser.system_role,
          tenantId: singleUser.tenant_id,
          customerId: singleUser.customer_id,
        }
      };
    }

    // Prompt user to pick a tenant if multi-tenant and choice was omitted
    if (!tenantId) {
      return {
        requiresTenantSelection: true,
        tenants: userTenants.map((t) => ({
          tenantId: t.tenant_id,
          tenantName: t.tenant_name,
          role: t.system_role,
          logoUrl: t.logo_url,
        })),
      };
    }

    const targetAccount = userTenants.find((t) => t.tenant_id === tenantId);
    if (!targetAccount) {
      throw new UnauthorizedError('Unauthorized access for selected tenant');
    }

    await authRepository.updateLastLogin(targetAccount.user_id);

    const tokens = await tokenService.issueTokens({
      userId: targetAccount.user_id,
      tenantId: targetAccount.tenant_id,
      systemRole: targetAccount.system_role,
      phone,
    });

    return {
      requiresTenantSelection: false,
      ...tokens,
      user: {
        id: targetAccount.user_id,
        fullName: targetAccount.full_name,
        email: targetAccount.email,
        phone,
        systemRole: targetAccount.system_role,
        tenantId: targetAccount.tenant_id,
        customerId: targetAccount.customer_id,
      },
    };
  }

  async refreshToken(rawRefreshToken) {
    return await tokenService.rotateRefreshToken(rawRefreshToken);
  }

  async logout(rawRefreshToken) {
    if (rawRefreshToken) {
      await tokenService.revokeToken(rawRefreshToken);
    }
  }

  async getCurrentUser(userId) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async updateProfile(userId, profileData) {
    if (!profileData.fullName || !profileData.fullName.trim()) {
      throw new ValidationError('Full name is required');
    }

    if (!profileData.email || !profileData.email.trim()) {
      throw new ValidationError('Email is required');
    }
    const updatedUser = await authRepository.updateProfile(userId, profileData);
    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    return updatedUser;
  }

  async changeLanguage(userId, preferredLanguage) {
    await authRepository.updateProfile(userId, { preferredLanguage });
    return { message: 'Language preference updated' };
  }

  async deactivateAccount(userId) {
    await authRepository.deactivateUser(userId);
    await tokenService.revokeAllUserSessions(userId);
    return { message: 'Account deactivated' };
  }

  async superAdminLogin(phone, pin) {
    try {
      const configuredPin = process.env.SUPER_ADMIN_PIN;

      if (!configuredPin) {
        throw new Error('Super admin authentication is not configured.');
      }

      const systemUser = await authRepository.findSuperAdminByPhone(phone);

      if (!systemUser) {
        throw new UnauthorizedError('Invalid credentials.');
      }

      if (pin !== configuredPin) {
        throw new UnauthorizedError('Invalid credentials.');
      }

      await authRepository.updateLastLogin(systemUser.id);

      const tokens = await tokenService.issueTokens({
        userId: systemUser.id,
        tenantId: null,
        systemRole: 'SuperAdmin',
        phone: systemUser.phone,
      });

      return {
        user: {
          id: systemUser.id,
          tenantId: null,
          fullName: systemUser.full_name,
          phone: systemUser.phone,
          email: systemUser.email,
          systemRole: 'SuperAdmin',
        },
        ...tokens,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuthService;
