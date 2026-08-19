const dbPool = require('../config/db');

class StaffRepository {
  constructor(pool) {
    this.pool = pool;
  }

  // Helper to obtain the active transaction client or fallback pool
  _getClient(client) {
    return client || this.pool;
  }

  // ============================================================
  // VALIDATION & LOOKUP
  // ============================================================

  async findByPhoneOrEmail(client, tenantId, phone, email) {
    const conn = this._getClient(client);
    const query = `
      SELECT u.id, u.phone, u.email 
      FROM users u
      WHERE u.tenant_id = $1 
        AND (u.phone = $2 OR (u.email = $3 AND $3 IS NOT NULL AND $3 != ''))
        AND u.is_active = true
      LIMIT 1;
    `;
    const res = await conn.query(query, [tenantId, phone, email || null]);
    return res.rows[0] || null;
  }

  async findDesignationById(client, tenantId, designationId) {
    const conn = this._getClient(client);
    const query = `
      SELECT id FROM designations 
      WHERE id = $1 AND tenant_id = $2;
    `;
    const res = await conn.query(query, [designationId, tenantId]);
    return res.rows[0] || null;
  }

  async validateServiceIds(client, tenantId, serviceIds) {
    if (!serviceIds || serviceIds.length === 0) return true;
    const conn = this._getClient(client);
    const query = `
      SELECT COUNT(id)::int as count 
      FROM services 
      WHERE tenant_id = $1 AND id = ANY($2::integer[]);
    `;
    const res = await conn.query(query, [tenantId, serviceIds]);
    return res.rows[0].count === serviceIds.length;
  }

  async findStaffByUserId(client, tenantId, userId) {
    const conn = this._getClient(client);
    const query = `SELECT id FROM staff WHERE user_id = $1 AND tenant_id = $2 LIMIT 1;`;
    const res = await conn.query(query, [userId, tenantId]);
    return res.rows[0] || null;
  }

  // ============================================================
  // CREATE
  // ============================================================

  async insertUser(client, tenantId, data, createdBy) {
    const conn = this._getClient(client);
    const query = `
      INSERT INTO users (tenant_id, full_name, phone, email, profile_image_url, system_role, is_active, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING id;
    `;
    const values = [
      tenantId,
      data.fullName,
      data.phone,
      data.email || null,
      data.profileImageUrl || null,
      data.systemRole || 'Staff',
      data.isActive ?? true,
      createdBy
    ];
    const res = await conn.query(query, values);
    return res.rows[0];
  }

  async generateEmployeeCode(client, tenantId) {
    const conn = this._getClient(client);
    const query = `
      SELECT employee_code FROM staff 
      WHERE tenant_id = $1 AND employee_code IS NOT NULL 
      ORDER BY id DESC LIMIT 1;
    `;
    const res = await conn.query(query, [tenantId]);
    const lastCode = res.rows[0]?.employee_code;
    const nextNum = lastCode ? parseInt(lastCode.replace(/[^0-9]/g, ''), 10) + 1 : 1;
    return `EMP${String(nextNum).padStart(3, '0')}`;
  }

  async insertStaff(client, tenantId, data, createdBy) {
    const conn = this._getClient(client);
    const query = `
    INSERT INTO staff (
      tenant_id, user_id, designation_id, employee_code, 
      employment_status, employment_type, experience_years, bio,
      profile_image_url, calendar_color, commission_percentage,
      is_online_bookable, is_active, created_by,
      start_time, end_time, weekly_off
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    RETURNING id;
  `;
    const values = [
      tenantId,
      data.userId,
      data.designationId,
      data.employeeCode,
      data.employmentStatus || 'active',
      data.employmentType || 'full_time',
      data.experienceYears || 0,
      data.bio || null,
      data.profileImageUrl || null,
      data.calendarColor || null,
      data.commissionPercentage || 0,
      data.isOnlineBookable ?? true,
      data.isActive ?? true,
      createdBy,
      data.startTime || null,
      data.endTime || null,  
      data.weeklyOff || null,
    ];
    const res = await conn.query(query, values);
    return res.rows[0];
  }

  async insertStaffServices(client, tenantId, staffId, serviceIds, createdBy) {
    if (!serviceIds || serviceIds.length === 0) return;
    const conn = this._getClient(client);
    const query = `
      INSERT INTO staff_services (tenant_id, staff_id, service_id, created_by)
      SELECT $1, $2, unnest($3::integer[]), $4;
    `;
    await conn.query(query, [tenantId, staffId, serviceIds, createdBy]);
  }

  // ============================================================
  // UPDATE
  // ============================================================

  async updateUser(client, tenantId, userId, userData, updatedBy) {
    const conn = this._getClient(client);
    const query = `
      UPDATE users 
      SET full_name = COALESCE($1, full_name),
          phone = COALESCE($2, phone),
          email = COALESCE($3, email),
          profile_image_url = COALESCE($4, profile_image_url),
          is_active = COALESCE($5, is_active),
          updated_by = $6
      WHERE id = $7 AND tenant_id = $8;
    `;
    await conn.query(query, [
      userData.fullName || null,
      userData.phone || null,
      userData.email || null,
      userData.profileImage || userData.profileImageUrl || null,
      userData.isActive,
      updatedBy,
      userId,
      tenantId,
    ]);
  }

  async updateStaff(client, tenantId, staffId, staffData, updatedBy) {
    const conn = this._getClient(client);
    const query = `
    UPDATE staff 
    SET designation_id = COALESCE($1, designation_id),
        employment_type = COALESCE($2, employment_type),
        employment_status = COALESCE($3, employment_status),
        experience_years = COALESCE($4, experience_years),
        bio = COALESCE($5, bio),
        profile_image_url = COALESCE($6, profile_image_url),
        calendar_color = COALESCE($7, calendar_color),
        commission_percentage = COALESCE($8, commission_percentage),
        is_online_bookable = COALESCE($9, is_online_bookable),
        is_active = COALESCE($10, is_active),
        start_time = COALESCE($11, start_time),    
        end_time = COALESCE($12, end_time),        
        weekly_off = COALESCE($13, weekly_off),    
        updated_by = $14
    WHERE id = $15 AND tenant_id = $16
    RETURNING user_id;
  `;
    const res = await conn.query(query, [
      staffData.designationId || null,
      staffData.employmentType || null,
      staffData.employmentStatus || null,
      staffData.experienceYears || null,
      staffData.bio || null,
      staffData.profileImageUrl || null,
      staffData.calendarColor || null,
      staffData.commissionPercentage || null,
      staffData.isOnlineBookable ?? null,
      staffData.isActive,
      staffData.startTime || null,
      staffData.endTime || null,
      staffData.weeklyOff || null,
      updatedBy,
      staffId,
      tenantId,
    ]);
    return res.rows[0];
  }

  async deleteStaffServices(client, tenantId, staffId) {
    const conn = this._getClient(client);
    const query = `DELETE FROM staff_services WHERE tenant_id = $1 AND staff_id = $2;`;
    await conn.query(query, [tenantId, staffId]);
  }

  // ============================================================
  // READ
  // ============================================================

  async findStaffById(client, tenantId, staffId) {
    const conn = this._getClient(client);
    const query = `
    SELECT 
      s.id, s.user_id, s.designation_id, s.employee_code, s.employment_type, s.employment_status,
      s.experience_years, s.bio, s.profile_image_url, s.calendar_color, s.commission_percentage,
      s.is_online_bookable, s.is_active, s.created_at, s.updated_at,
      TO_CHAR(s.start_time, 'HH12:MI AM') AS start_time,
      TO_CHAR(s.end_time, 'HH12:MI AM') AS end_time,
      s.weekly_off,
      u.full_name, u.phone, u.email, u.profile_image_url AS user_profile_image,
      d.name as designation_name
    FROM staff s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN designations d ON s.designation_id = d.id
    WHERE s.id = $1 AND s.tenant_id = $2;
  `;
    const res = await conn.query(query, [staffId, tenantId]);
    return res.rows[0] || null;
  }

  async findStaffServices(client, tenantId, staffId) {
    const conn = this._getClient(client);
    const query = `
      SELECT s.id, s.name, s.category, s.price, ss.custom_price, ss.duration_override
      FROM staff_services ss
      JOIN services s ON ss.service_id = s.id
      WHERE ss.staff_id = $1 AND ss.tenant_id = $2;
    `;
    const res = await conn.query(query, [staffId, tenantId]);
    return res.rows;
  }

  async findStaffStats(client, tenantId, staffId) {
    const conn = this._getClient(client);
    const query = `
      SELECT 
        COALESCE(SUM(a.total_price), 0) as total_revenue,
        COUNT(a.id)::int as total_appointments,
        COUNT(a.id) FILTER (WHERE a.status = 'completed')::int as completed_appointments,
        COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) as average_rating,
        COUNT(r.id)::int as total_reviews
      FROM staff s
      LEFT JOIN appointments a ON a.staff_id = s.id AND a.tenant_id = s.tenant_id
      LEFT JOIN reviews r ON r.staff_id = s.id AND r.tenant_id = s.tenant_id
      WHERE s.id = $1 AND s.tenant_id = $2
      GROUP BY s.id;
    `;
    const res = await conn.query(query, [staffId, tenantId]);
    return res.rows[0] || {
      total_revenue: 0,
      total_appointments: 0,
      completed_appointments: 0,
      average_rating: 0,
      total_reviews: 0,
    };
  }

  // ============================================================
  // PAGINATED LIST
  // ============================================================

  async findAllPaginated(client, tenantId, filters) {
    const conn = this._getClient(client);
    const { page = 1, limit = 10, search, designationId, isActive } = filters;
    const offset = (page - 1) * limit;

    let whereClause = `WHERE s.tenant_id = $1`;
    const params = [tenantId];
    let paramIdx = 2;

    if (search) {
      whereClause += ` AND (u.full_name ILIKE $${paramIdx} OR u.phone ILIKE $${paramIdx} OR u.email ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    if (designationId) {
      whereClause += ` AND s.designation_id = $${paramIdx}`;
      params.push(designationId);
      paramIdx++;
    }

    if (isActive !== undefined) {
      whereClause += ` AND s.is_active = $${paramIdx}`;
      params.push(isActive);
      paramIdx++;
    }

    const countQuery = `
      SELECT COUNT(s.id)::int as total
      FROM staff s
      JOIN users u ON s.user_id = u.id
      ${whereClause};
    `;
    const countRes = await conn.query(countQuery, params);
    const total = countRes.rows[0].total;

    const dataQuery = `
      SELECT 
        s.id, u.full_name, u.phone, u.email, u.profile_image_url, s.employment_type,
        s.is_active, d.name as designation_name,
        COUNT(ss.service_id)::int as services_count
      FROM staff s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN designations d ON s.designation_id = d.id
      LEFT JOIN staff_services ss ON ss.staff_id = s.id
      ${whereClause}
      GROUP BY s.id, u.id, d.id
      ORDER BY s.created_at DESC
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1};
    `;
    params.push(limit, offset);

    const dataRes = await conn.query(dataQuery, params);
    return { data: dataRes.rows, total };
  }

  // ============================================================
  // OPTIONS (dropdowns)
  // ============================================================

  async getAllServices(client, tenantId) {
    const conn = this._getClient(client);
    const query = `
      SELECT id, name, category, price, estimated_duration_minutes
      FROM services
      WHERE tenant_id = $1 AND is_active = true
      ORDER BY display_order ASC, name ASC;
    `;
    const res = await conn.query(query, [tenantId]);
    return res.rows;
  }

  async getAllDesignations(client, tenantId) {
    const conn = this._getClient(client);
    const query = `
      SELECT id, name, description
      FROM designations
      WHERE tenant_id = $1 AND is_active = true
      ORDER BY display_order ASC, name ASC;
    `;
    const res = await conn.query(query, [tenantId]);
    return res.rows;
  }

  // ============================================================
  // SOFT DELETE
  // ============================================================

  async softDeleteStaff(client, tenantId, staffId, updatedBy) {
    const conn = this._getClient(client);
    const query = `
      UPDATE staff s
      SET is_active = false, updated_at = NOW(), updated_by = $3
      FROM users u
      WHERE s.user_id = u.id 
        AND s.id = $1 
        AND s.tenant_id = $2
      RETURNING s.user_id;
    `;
    const res = await conn.query(query, [staffId, tenantId, updatedBy]);
    if (res.rows.length === 0) return null;

    const userId = res.rows[0].user_id;
    await conn.query(
      `UPDATE users SET is_active = false, updated_at = NOW(), updated_by = $1 WHERE id = $2 AND tenant_id = $3;`,
      [updatedBy, userId, tenantId]
    );
    return userId;
  }

  // ============================================================
  // ADDITIONAL LIST & DASHBOARD METHODS (unchanged)
  // ============================================================

  async getAllStaff(client, tenantId, onlyActive = false) {
    const conn = this._getClient(client);
    let query = `
      SELECT 
        s.id,
        u.full_name AS name,
        u.email,
        u.phone,
        u.system_role AS role,
        u.is_active AS "isActive",
        s.created_at AS "createdAt",
        s.updated_at AS "updatedAt",
        d.name AS designation
      FROM staff s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN designations d ON s.designation_id = d.id
      WHERE s.tenant_id = $1
    `;
    const values = [tenantId];
    if (onlyActive) {
      query += ` AND s.is_active = true`;
    }
    query += ` ORDER BY u.full_name ASC`;
    const res = await conn.query(query, values);
    return res.rows;
  }

  async getStaffById(client, tenantId, staffId) {
    const conn = this._getClient(client);
    const query = `
      SELECT 
        s.id,
        u.full_name AS name,
        u.email,
        u.phone,
        u.system_role AS role,
        u.is_active AS "isActive",
        s.employee_code AS "employeeCode",
        s.employment_type AS "employmentType",
        s.experience_years AS "experienceYears",
        s.created_at AS "createdAt",
        s.updated_at AS "updatedAt",
        d.id AS "designationId",
        d.name AS designation,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', sv.id, 'name', sv.name)) FILTER (WHERE sv.id IS NOT NULL),
          '[]'::json
        ) AS services
      FROM staff s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN designations d ON s.designation_id = d.id
      LEFT JOIN staff_services ss ON ss.staff_id = s.id AND ss.tenant_id = s.tenant_id
      LEFT JOIN services sv ON sv.id = ss.service_id
      WHERE s.id = $1 AND s.tenant_id = $2
      GROUP BY s.id, u.id, d.id
    `;
    const res = await conn.query(query, [staffId, tenantId]);
    return res.rows[0] || null;
  }

  async getStaffByIdWithStats(client, tenantId, staffId) {
    const conn = this._getClient(client);
    const query = `
      SELECT 
        s.id,
        u.full_name AS name,
        u.email,
        u.phone,
        u.system_role AS role,
        u.is_active AS "isActive",
        s.created_at AS "createdAt",
        s.updated_at AS "updatedAt",
        d.name AS designation,
        COALESCE(
          (SELECT COUNT(*) FROM appointments WHERE staff_id = s.id AND status NOT IN ('cancelled', 'no_show')),
          0
        )::int AS "totalAppointments",
        COALESCE(
          (SELECT COUNT(*) FROM appointments WHERE staff_id = s.id AND status = 'completed'),
          0
        )::int AS "completedAppointments",
        COALESCE(
          (SELECT SUM(total_price) FROM appointments WHERE staff_id = s.id AND status NOT IN ('cancelled', 'no_show')),
          0
        ) AS "totalRevenue",
        COALESCE(
          (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE staff_id = s.id),
          0
        ) AS "averageRating",
        COALESCE(
          (SELECT COUNT(*) FROM reviews WHERE staff_id = s.id),
          0
        )::int AS "totalReviews"
      FROM staff s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN designations d ON s.designation_id = d.id
      WHERE s.id = $1 AND s.tenant_id = $2
    `;
    const res = await conn.query(query, [staffId, tenantId]);
    return res.rows[0] || null;
  }

  async getAllStaffWithStats(client, tenantId, onlyActive = false) {
    const conn = this._getClient(client);
    let query = `
      SELECT 
        s.id,
        u.full_name AS name,
        u.email,
        u.phone,
        u.system_role AS role,
        u.is_active AS "isActive",
        s.created_at AS "createdAt",
        s.updated_at AS "updatedAt",
        d.name AS designation,
        COALESCE(
          (SELECT COUNT(*) FROM appointments WHERE staff_id = s.id AND status NOT IN ('cancelled', 'no_show')),
          0
        )::int AS "totalAppointments",
        COALESCE(
          (SELECT COUNT(*) FROM appointments WHERE staff_id = s.id AND status = 'completed'),
          0
        )::int AS "completedAppointments",
        COALESCE(
          (SELECT SUM(total_price) FROM appointments WHERE staff_id = s.id AND status NOT IN ('cancelled', 'no_show')),
          0
        ) AS "totalRevenue",
        COALESCE(
          (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE staff_id = s.id),
          0
        ) AS "averageRating"
      FROM staff s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN designations d ON s.designation_id = d.id
      WHERE s.tenant_id = $1
    `;
    const values = [tenantId];
    if (onlyActive) {
      query += ` AND s.is_active = true`;
    }
    query += ` ORDER BY u.full_name ASC`;
    const res = await conn.query(query, values);
    return res.rows;
  }

  async getStaffTodaySchedule(client, tenantId, staffId) {
    const conn = this._getClient(client);
    const query = `
      SELECT 
        a.id,
        TO_CHAR(a.start_time, 'HH12:MI AM') AS start_time,
        TO_CHAR(a.end_time, 'HH12:MI AM') AS end_time,
        u.full_name AS customer,
        COALESCE(
          (SELECT string_agg(s.name, ', ') 
           FROM appointment_services aps 
           JOIN services s ON s.id = aps.service_id 
           WHERE aps.appointment_id = a.id),
          'Service'
        ) AS service,
        a.status,
        a.is_package_appointment AS "isPackage"
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE a.staff_id = $1
        AND a.tenant_id = $2
        AND a.appointment_date = CURRENT_DATE
        AND a.status NOT IN ('cancelled')
      ORDER BY a.start_time ASC
      LIMIT 10
    `;
    const res = await conn.query(query, [staffId, tenantId]);
    return res.rows;
  }

  async getStaffStats(client, tenantId) {
    const conn = this._getClient(client);
    const query = `
      SELECT 
        COUNT(*)::int AS total,
        SUM(CASE WHEN s.is_active THEN 1 ELSE 0 END)::int AS active,
        COUNT(DISTINCT u.system_role)::int AS roles,
        COUNT(DISTINCT d.id)::int AS designations,
        SUM(CASE WHEN s.is_online_bookable THEN 1 ELSE 0 END)::int AS "onlineBookable"
      FROM staff s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN designations d ON s.designation_id = d.id
      WHERE s.tenant_id = $1
        AND u.is_active = true
    `;
    const res = await conn.query(query, [tenantId]);
    return res.rows[0] || null;
  }

  async getTopStaff(client, tenantId, limit = 5) {
    const conn = this._getClient(client);
    const query = `
      SELECT 
        s.id,
        u.full_name AS name,
        u.system_role AS role,
        d.name AS designation,
        s.calendar_color AS "calendarColor",
        COUNT(a.id)::int AS "appointmentCount",
        COALESCE(SUM(a.total_price), 0) AS revenue,
        COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS "averageRating"
      FROM staff s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN designations d ON s.designation_id = d.id
      LEFT JOIN appointments a ON a.staff_id = s.id 
        AND a.status NOT IN ('cancelled', 'no_show')
        AND a.tenant_id = $1
      LEFT JOIN reviews r ON r.staff_id = s.id
      WHERE s.tenant_id = $1
        AND s.is_active = true
        AND u.is_active = true
      GROUP BY s.id, u.full_name, u.system_role, d.name, s.calendar_color
      ORDER BY "appointmentCount" DESC
      LIMIT $2
    `;
    const res = await conn.query(query, [tenantId, limit]);
    return res.rows;
  }
}

module.exports = new StaffRepository(dbPool);