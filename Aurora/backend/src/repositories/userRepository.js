const dbPool = require('../config/db');

class UserRepository {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Resolves the active transaction client or falls back to the database pool.
   * @private
   */
  _getClient(client) {
    return client || this.pool;
  }

  // ============================================================
  // LOOKUP & AUTHENTICATION
  // ============================================================

  /**
   * Find user by ID (tenant-scoped)
   */
  async findById(client, tenantId, id) {
    const conn = this._getClient(client);
    const query = `
      SELECT 
        id, tenant_id, full_name, email, phone, profile_image_url, 
        system_role, is_active, created_at, updated_at
      FROM users
      WHERE id = $1 AND tenant_id = $2;
    `;
    const res = await conn.query(query, [id, tenantId]);
    return res.rows[0] || null;
  }

  /**
   * Find user by ID including password hash (for internal authentication checks)
   */
  async findByIdWithPassword(client, tenantId, id) {
    const conn = this._getClient(client);
    const query = `
      SELECT 
        id, tenant_id, full_name, email, phone, password_hash, 
        profile_image_url, system_role, is_active, created_at, updated_at
      FROM users
      WHERE id = $1 AND tenant_id = $2;
    `;
    const res = await conn.query(query, [id, tenantId]);
    return res.rows[0] || null;
  }

  /**
   * Find user by email (tenant-scoped)
   */
  async findByEmail(client, tenantId, email) {
    const conn = this._getClient(client);
    const query = `
      SELECT 
        id, tenant_id, full_name, email, phone, password_hash, 
        profile_image_url, system_role, is_active, created_at, updated_at
      FROM users
      WHERE LOWER(email) = LOWER($1) AND tenant_id = $2;
    `;
    const res = await conn.query(query, [email, tenantId]);
    return res.rows[0] || null;
  }

  /**
   * Find user by phone number (tenant-scoped)
   */
  async findByPhone(client, tenantId, phone) {
    const conn = this._getClient(client);
    const query = `
      SELECT 
        id, tenant_id, full_name, email, phone, password_hash, 
        profile_image_url, system_role, is_active, created_at, updated_at
      FROM users
      WHERE phone = $1 AND tenant_id = $2;
    `;
    const res = await conn.query(query, [phone, tenantId]);
    return res.rows[0] || null;
  }

  /**
   * Find user by either phone OR email (useful for duplication checks)
   */
  async findByPhoneOrEmail(client, tenantId, phone, email) {
    const conn = this._getClient(client);
    const query = `
      SELECT id, phone, email, is_active
      FROM users
      WHERE tenant_id = $1 
        AND (phone = $2 OR (email = $3 AND $3 IS NOT NULL AND $3 != ''))
      LIMIT 1;
    `;
    const res = await conn.query(query, [tenantId, phone, email || null]);
    return res.rows[0] || null;
  }

  // ============================================================
  // CREATE & UPDATE
  // ============================================================

  /**
   * Insert a new user
   */
  async createUser(client, tenantId, userData) {
    const conn = this._getClient(client);
    const query = `
      INSERT INTO users (
        tenant_id, full_name, phone, email, password_hash, 
        profile_image_url, system_role, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, tenant_id, full_name, phone, email, profile_image_url, system_role, is_active, created_at;
    `;
    const values = [
      tenantId,
      userData.fullName,
      userData.phone,
      userData.email || null,
      userData.passwordHash || null,
      userData.profileImageUrl || null,
      userData.systemRole || 'Customer',
      userData.isActive ?? true,
    ];
    const res = await conn.query(query, values);
    return res.rows[0];
  }

  /**
   * Update generic user details dynamically
   */
  async updateUser(client, tenantId, userId, userData) {
    const conn = this._getClient(client);
    const query = `
      UPDATE users
      SET full_name = COALESCE($1, full_name),
          phone = COALESCE($2, phone),
          email = COALESCE($3, email),
          profile_image_url = COALESCE($4, profile_image_url),
          system_role = COALESCE($5, system_role),
          is_active = COALESCE($6, is_active),
          updated_at = NOW()
      WHERE id = $7 AND tenant_id = $8
      RETURNING id, full_name, phone, email, profile_image_url, system_role, is_active, updated_at;
    `;
    const values = [
      userData.fullName || null,
      userData.phone || null,
      userData.email || null,
      userData.profileImageUrl || userData.profileImage || null,
      userData.systemRole || null,
      userData.isActive ?? (userData.status !== undefined ? userData.status === 'Active' : null),
      userId,
      tenantId,
    ];
    const res = await conn.query(query, values);
    return res.rows[0] || null;
  }

  /**
   * Update user password
   */
  async updatePassword(client, tenantId, userId, passwordHash) {
    const conn = this._getClient(client);
    const query = `
      UPDATE users
      SET password_hash = $1, updated_at = NOW()
      WHERE id = $2 AND tenant_id = $3
      RETURNING id;
    `;
    const res = await conn.query(query, [passwordHash, userId, tenantId]);
    return res.rows[0] || null;
  }

  /**
   * Toggle or update user active status
   */
  async updateActiveStatus(client, tenantId, userId, isActive) {
    const conn = this._getClient(client);
    const query = `
      UPDATE users
      SET is_active = $1, updated_at = NOW()
      WHERE id = $2 AND tenant_id = $3
      RETURNING id, is_active;
    `;
    const res = await conn.query(query, [isActive, userId, tenantId]);
    return res.rows[0] || null;
  }

  // ============================================================
  // READ (PAGINATED & LISTING)
  // ============================================================

  /**
   * Get paginated users with optional search and role filtering
   */
  async findAllPaginated(client, tenantId, filters = {}) {
    const conn = this._getClient(client);
    const { page = 1, limit = 10, search, systemRole, isActive } = filters;
    const offset = (page - 1) * limit;

    let whereClause = `WHERE tenant_id = $1`;
    const params = [tenantId];
    let paramIdx = 2;

    if (search) {
      whereClause += ` AND (full_name ILIKE $${paramIdx} OR phone ILIKE $${paramIdx} OR email ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    if (systemRole) {
      whereClause += ` AND system_role = $${paramIdx}`;
      params.push(systemRole);
      paramIdx++;
    }

    if (isActive !== undefined) {
      whereClause += ` AND is_active = $${paramIdx}`;
      params.push(isActive);
      paramIdx++;
    }

    const countQuery = `SELECT COUNT(id)::int as total FROM users ${whereClause};`;
    const countRes = await conn.query(countQuery, params);
    const total = countRes.rows[0].total;

    const dataQuery = `
      SELECT id, full_name, phone, email, profile_image_url, system_role, is_active, created_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1};
    `;
    params.push(limit, offset);

    const dataRes = await conn.query(dataQuery, params);
    return { data: dataRes.rows, total };
  }

  // ============================================================
  // SOFT / HARD DELETE
  // ============================================================

  /**
   * Soft delete a user by setting is_active = false
   */
  async softDeleteUser(client, tenantId, userId) {
    const conn = this._getClient(client);
    const query = `
      UPDATE users
      SET is_active = false, updated_at = NOW()
      WHERE id = $1 AND tenant_id = $2
      RETURNING id;
    `;
    const res = await conn.query(query, [userId, tenantId]);
    return res.rows[0] || null;
  }

  /**
   * Hard delete a user record
   */
  async hardDeleteUser(client, tenantId, userId) {
    const conn = this._getClient(client);
    const query = `DELETE FROM users WHERE id = $1 AND tenant_id = $2 RETURNING id;`;
    const res = await conn.query(query, [userId, tenantId]);
    return res.rows[0] || null;
  }
}

module.exports = new UserRepository(dbPool);