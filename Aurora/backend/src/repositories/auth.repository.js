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
      SELECT id, tenant_id, full_name as "fullName", phone, email, birthday, gender, 
             profile_image_url, preferred_language, system_role, is_active, last_login_at
      FROM users
      WHERE id = $1;
    `;
    const { rows } = await client.query(query, [id]);
    return rows[0] || null;
  }

  async findUserTenants(phone, client = pool) {
    const query = `
      SELECT u.id as user_id,u.full_name, u.email,  u.tenant_id, u.system_role, t.name as tenant_name, t.logo_url
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

  async updateProfile(userId, { fullName, email, birthday, gender }, client = pool) {
    const values = [
      fullName.trim(),
      email.trim(),
      birthday || null,
      gender || 'unspecified',
      userId
    ];

    const query = `
      UPDATE users
      SET 
        full_name = $1,
        email = $2,
        birthday = $3,
        gender = $4,
        updated_at = NOW()
      WHERE id = $5
      RETURNING 
        id,
        full_name AS "fullName",
        email,
        phone,
        birthday,
        gender,
        updated_at AS "updatedAt"
    `;

    const { rows } = await client.query(query, values);
    return rows[0] || null;
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

  async findSuperAdminByPhone(phone, client = pool) {
  const query = `
    SELECT
      id,
      full_name,
      phone,
      email,
      system_role
    FROM users
    WHERE phone = $1
      AND system_role = 'SuperAdmin'
      AND tenant_id IS NULL
    LIMIT 1
  `;

  const { rows } = await client.query(query, [phone]);

  return rows[0] || null;
}
}

module.exports = new AuthRepository();