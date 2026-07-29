// src/repositories/auth.repository.js
const pool = require('../config/db');

class AuthRepository {
  async findUserByPhone(phone, tenantId = null, client = pool) {
    let query;
    let params;

    if (tenantId) {
      query = `
        SELECT id, tenant_id, full_name, phone, email, system_role, is_active, preferred_language
        FROM users
        WHERE phone = $1 AND tenant_id = $2
        LIMIT 1;
      `;
      params = [phone, tenantId];
    } else {
      query = `
        SELECT id, tenant_id, full_name, phone, email, system_role, is_active, preferred_language
        FROM users
        WHERE phone = $1;
      `;
      params = [phone];
    }

    const { rows } = await client.query(query, params);
    return tenantId ? rows[0] || null : rows;
  }

  async findUserById(id, client = pool) {
    const query = `
      SELECT id, tenant_id, full_name, phone, email, birthday, gender, 
             profile_image_url, preferred_language, system_role, is_active, last_login_at
      FROM users
      WHERE id = $1;
    `;
    const { rows } = await client.query(query, [id]);
    return rows[0] || null;
  }

  async findUserTenants(phone, client = pool) {
    const query = `
      SELECT u.id as user_id, u.tenant_id, u.system_role, t.name as tenant_name, t.logo_url
      FROM users u
      INNER JOIN tenants t ON u.tenant_id = t.id
      WHERE u.phone = $1 AND u.is_active = true AND t.is_active = true;
    `;
    const { rows } = await client.query(query, [phone]);
    return rows;
  }

  async createUser(userData, client = pool) {
    const { tenantId, fullName, phone, email, systemRole, preferredLanguage, otpVerified = true } = userData;

    const query = `
      INSERT INTO users (
        tenant_id, full_name, phone, email, system_role, preferred_language, otp_verified, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      RETURNING id, tenant_id, full_name, phone, email, system_role, preferred_language, is_active, created_at;
    `;

    const values = [tenantId || null, fullName, phone, email || null, systemRole, preferredLanguage || 'en', otpVerified];
    const { rows } = await client.query(query, values);
    return rows[0];
  }

  async updateLastLogin(userId, client = pool) {
    const query = `
      UPDATE users
      SET last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1;
    `;
    await client.query(query, [userId]);
  }

  async updateProfile(userId, profileData, client = pool) {
    const fields = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(profileData)) {
      if (value !== undefined) {
        const dbField = key.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);
        fields.push(`${dbField} = $${index}`);
        values.push(value);
        index++;
      }
    }

    if (fields.length === 0) return await this.findUserById(userId, client);

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${index}
      RETURNING id, tenant_id, full_name, phone, email, birthday, gender, profile_image_url, preferred_language, system_role;
    `;

    const { rows } = await client.query(query, values);
    return rows[0];
  }

  async deactivateUser(userId, client = pool) {
    const query = `
      UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1;
    `;
    await client.query(query, [userId]);
  }

  /* --- OTP Operations --- */

  async storeOtp(phone, otp, purpose, expiresAt, client = pool) {
    const query = `
      INSERT INTO otp_verifications (phone, otp, purpose, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;
    const { rows } = await client.query(query, [phone, otp, purpose, expiresAt]);
    return rows[0].id;
  }

  async findValidOtp(phone, purpose, client = pool) {
    const query = `
      SELECT id, otp, expires_at, attempt_count, verified_at
      FROM otp_verifications
      WHERE phone = $1 AND purpose = $2 AND verified_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1;
    `;
    const { rows } = await client.query(query, [phone, purpose]);
    return rows[0] || null;
  }

  async markOtpVerified(otpId, client = pool) {
    const query = `UPDATE otp_verifications SET verified_at = CURRENT_TIMESTAMP WHERE id = $1;`;
    await client.query(query, [otpId]);
  }

  async incrementOtpAttempts(otpId, client = pool) {
    const query = `UPDATE otp_verifications SET attempt_count = attempt_count + 1 WHERE id = $1;`;
    await client.query(query, [otpId]);
  }

  /* --- Refresh Token Operations --- */

  async storeRefreshToken(userId, tokenHash, expiresAt, client = pool) {
    const query = `
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3);
    `;
    await client.query(query, [userId, tokenHash, expiresAt]);
  }

  async findRefreshToken(tokenHash, client = pool) {
    const query = `
      SELECT id, user_id, token_hash, expires_at, is_revoked
      FROM refresh_tokens
      WHERE token_hash = $1;
    `;
    const { rows } = await client.query(query, [tokenHash]);
    return rows[0] || null;
  }

  async revokeRefreshToken(tokenHash, client = pool) {
    const query = `UPDATE refresh_tokens SET is_revoked = true, updated_at = CURRENT_TIMESTAMP WHERE token_hash = $1;`;
    await client.query(query, [tokenHash]);
  }

  async revokeAllUserRefreshTokens(userId, client = pool) {
    const query = `UPDATE refresh_tokens SET is_revoked = true, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1;`;
    await client.query(query, [userId]);
  }
}

module.exports = new AuthRepository();