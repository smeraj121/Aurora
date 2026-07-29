// src/services/token.service.js
const authRepository = require('../repositories/auth.repository');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require('../utils/jwt');
const { UnauthorizedError } = require('../errors');

class TokenService {
  /**
   * Generates Access + Refresh token pair and persists hashed refresh token to the DB
   */
  async issueTokens(payload, client) {
    const accessToken = generateAccessToken(payload);
    const rawRefreshToken = generateRefreshToken(payload);

    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await authRepository.storeRefreshToken(payload.userId, tokenHash, expiresAt, client);

    return { accessToken, refreshToken: rawRefreshToken };
  }

  /**
   * Rotates Refresh Token on consumption & invalidates consumed token
   */
  async rotateRefreshToken(rawRefreshToken) {
    let decoded;
    try {
      decoded = verifyRefreshToken(rawRefreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const tokenHash = hashToken(rawRefreshToken);
    const tokenRecord = await authRepository.findRefreshToken(tokenHash);

    if (!tokenRecord || tokenRecord.is_revoked || new Date() > new Date(tokenRecord.expires_at)) {
      // Security measure: Token reuse detection revokes all active sessions for the user
      if (tokenRecord?.is_revoked) {
        await authRepository.revokeAllUserRefreshTokens(tokenRecord.user_id);
      }
      throw new UnauthorizedError('Refresh token revoked or invalid');
    }

    // Revoke currently used token
    await authRepository.revokeRefreshToken(tokenHash);

    const user = await authRepository.findUserById(decoded.userId);
    if (!user || !user.is_active) {
      throw new UnauthorizedError('User account suspended or not found');
    }

    const tokenPayload = {
      userId: user.id,
      tenantId: user.tenant_id,
      systemRole: user.system_role,
      phone: user.phone,
    };

    return await this.issueTokens(tokenPayload);
  }

  async revokeToken(rawRefreshToken) {
    const tokenHash = hashToken(rawRefreshToken);
    await authRepository.revokeRefreshToken(tokenHash);
  }

  async revokeAllUserSessions(userId) {
    await authRepository.revokeAllUserRefreshTokens(userId);
  }
}

module.exports = new TokenService();