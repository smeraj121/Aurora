// repositories/staffRepository.js
const db = require('../config/db');

class StaffRepository {
  // ============================================================
  // GET ALL STAFF (with optional active filter)
  // ============================================================
  async getAllStaff(onlyActive = false) {
    let query = `
      SELECT 
        id,
        name,
        email,
        phone,
        role,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM staff
    `;
    
    const values = [];
    
    if (onlyActive) {
      query += ` WHERE is_active = true`;
    }
    
    query += ` ORDER BY name ASC`;
    
    const { rows } = await db.query(query, values);
    return rows;
  }

  // ============================================================
  // GET STAFF BY ID WITH STATS
  // ============================================================
  // repositories/staffRepository.js

// ============================================================
// GET STAFF BY ID WITH STATS (FIXED)
// ============================================================
async getStaffByIdWithStats(id) {
  const query = `
    SELECT 
      s.id,
      s.name,
      s.email,
      s.phone,
      s.role,
      s.is_active AS "isActive",
      s.created_at AS "createdAt",
      s.updated_at AS "updatedAt",
      COALESCE(
        (SELECT COUNT(*) FROM appointments WHERE staff_id = s.id AND status NOT IN ('cancelled', 'no_show')),
        0
      ) AS "totalAppointments",
      COALESCE(
        (SELECT COUNT(*) FROM appointments WHERE staff_id = s.id AND LOWER(status) = 'completed'),
        0
      ) AS "completedAppointments",
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
      ) AS "totalReviews"
    FROM staff s
    WHERE s.id = $1
  `;
  
  const { rows } = await db.query(query, [id]);
  return rows[0] || null;
}

// ============================================================
// GET ALL STAFF WITH PERFORMANCE STATS (FIXED)
// ============================================================
async getAllStaffWithStats(onlyActive = false) {
  let query = `
    SELECT 
      s.id,
      s.name,
      s.email,
      s.phone,
      s.role,
      s.is_active AS "isActive",
      s.created_at AS "createdAt",
      s.updated_at AS "updatedAt",
      COALESCE(
        (SELECT COUNT(*) FROM appointments WHERE staff_id = s.id AND status NOT IN ('cancelled', 'no_show')),
        0
      ) AS "totalAppointments",
      COALESCE(
        (SELECT COUNT(*) FROM appointments WHERE staff_id = s.id AND LOWER(status) = 'completed'),
        0
      ) AS "completedAppointments",
      COALESCE(
        (SELECT SUM(total_price) FROM appointments WHERE staff_id = s.id AND status NOT IN ('cancelled', 'no_show')),
        0
      ) AS "totalRevenue",
      COALESCE(
        (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE staff_id = s.id),
        0
      ) AS "averageRating"
    FROM staff s
  `;
  
  if (onlyActive) {
    query += ` WHERE s.is_active = true`;
  }
  
  query += ` ORDER BY s.name ASC`;
  
  const { rows } = await db.query(query);
  return rows;
}

// ============================================================
// GET STAFF TODAY SCHEDULE (FIXED - return all statuses)
// ============================================================
async getStaffTodaySchedule(staffId) {
  const query = `
    SELECT 
      a.id,
      a.time_slot AS "time",
      c.full_name AS "customer",
      COALESCE(
        (SELECT string_agg(s.name, ', ') 
         FROM appointment_services aps 
         JOIN services s ON s.id = aps.service_id 
         WHERE aps.appointment_id = a.id),
        'Service'
      ) AS "service",
      a.status
    FROM appointments a
    JOIN customers c ON a.customer_id = c.id
    WHERE a.staff_id = $1
      AND a.appointment_date = CURRENT_DATE
      AND a.status NOT IN ('cancelled')
    ORDER BY a.time_slot ASC
    LIMIT 10
  `;
  
  const { rows } = await db.query(query, [staffId]);
  return rows;
}

  // ============================================================
  // GET STAFF SCHEDULE FOR TODAY
  // ============================================================
  async getStaffTodaySchedule(staffId) {
    const query = `
      SELECT 
        a.id,
        a.time_slot AS "time",
        c.full_name AS "customer",
        COALESCE(
          (SELECT string_agg(s.name, ', ') 
           FROM appointment_services aps 
           JOIN services s ON s.id = aps.service_id 
           WHERE aps.appointment_id = a.id),
          'Service'
        ) AS "service",
        a.status
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      WHERE a.staff_id = $1
        AND a.appointment_date = CURRENT_DATE
        AND a.status NOT IN ('cancelled')
      ORDER BY a.time_slot ASC
      LIMIT 10
    `;
    
    const { rows } = await db.query(query, [staffId]);
    return rows;
  }

  // ============================================================
  // GET STAFF STATS (for dashboard)
  // ============================================================
  async getStaffStats() {
    const query = `
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN is_active THEN 1 ELSE 0 END) AS active,
        COUNT(DISTINCT role) AS roles
      FROM staff
    `;
    
    const { rows } = await db.query(query);
    return rows[0] || null;
  }

  // ============================================================
  // GET ALL STAFF WITH PERFORMANCE STATS
  // ============================================================
  async getAllStaffWithStats(onlyActive = false) {
    let query = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.phone,
        s.role,
        s.is_active AS "isActive",
        s.created_at AS "createdAt",
        s.updated_at AS "updatedAt",
        COALESCE(
          (SELECT COUNT(*) FROM appointments WHERE staff_id = s.id AND status NOT IN ('cancelled')),
          0
        ) AS "totalAppointments",
        COALESCE(
          (SELECT SUM(total_price) FROM appointments WHERE staff_id = s.id AND status NOT IN ('cancelled')),
          0
        ) AS "totalRevenue",
        COALESCE(
          (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE staff_id = s.id),
          0
        ) AS "averageRating"
      FROM staff s
    `;
    
    if (onlyActive) {
      query += ` WHERE s.is_active = true`;
    }
    
    query += ` ORDER BY s.name ASC`;
    
    const { rows } = await db.query(query);
    return rows;
  }

  // ============================================================
  // GET STAFF BY ID (basic)
  // ============================================================
  async getStaffById(id) {
    const query = `
      SELECT 
        id,
        name,
        email,
        phone,
        role,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM staff
      WHERE id = $1
    `;
    
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }

  // ============================================================
  // GET STAFF BY EMAIL
  // ============================================================
  async getStaffByEmail(email) {
    const query = `
      SELECT 
        id,
        name,
        email,
        phone,
        role,
        is_active AS "isActive"
      FROM staff
      WHERE email = $1
    `;
    
    const { rows } = await db.query(query, [email]);
    return rows[0] || null;
  }

  // ============================================================
  // CREATE STAFF
  // ============================================================
  async createStaff(data) {
    const query = `
      INSERT INTO staff (
        name, email, phone, role, is_active
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING 
        id,
        name,
        email,
        phone,
        role,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `;
    
    const values = [
      data.name,
      data.email,
      data.phone,
      data.role,
      data.isActive !== undefined ? data.isActive : true
    ];
    
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  // ============================================================
  // UPDATE STAFF
  // ============================================================
  async updateStaff(id, data) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(data.email);
    }
    if (data.phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(data.phone);
    }
    if (data.role !== undefined) {
      updates.push(`role = $${paramCount++}`);
      values.push(data.role);
    }
    if (data.isActive !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(data.isActive);
    }

    if (updates.length === 0) {
      return this.getStaffById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `
      UPDATE staff
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING 
        id,
        name,
        email,
        phone,
        role,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `;
    
    values.push(id);
    const { rows } = await db.query(query, values);
    return rows[0] || null;
  }

  // ============================================================
  // DELETE STAFF
  // ============================================================
  async deleteStaff(id) {
    const checkQuery = `
      SELECT COUNT(*) as count 
      FROM appointments 
      WHERE staff_id = $1
    `;
    const { rows: checkRows } = await db.query(checkQuery, [id]);
    
    if (parseInt(checkRows[0].count) > 0) {
      const query = `
        UPDATE staff 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id
      `;
      const { rows: updateRows } = await db.query(query, [id]);
      return updateRows[0] || null;
    }
    
    const query = `DELETE FROM staff WHERE id = $1 RETURNING id`;
    const { rows: deleteRows } = await db.query(query, [id]);
    return deleteRows[0] || null;
  }

  // ============================================================
  // GET TOP STAFF BY APPOINTMENTS
  // ============================================================
  async getTopStaff(limit = 5) {
    const query = `
      SELECT 
        s.id,
        s.name,
        s.role,
        COUNT(a.id) AS appointment_count,
        COALESCE(SUM(a.total_price), 0) AS revenue
      FROM staff s
      LEFT JOIN appointments a ON a.staff_id = s.id 
        AND a.status NOT IN ('cancelled')
      WHERE s.is_active = true
      GROUP BY s.id
      ORDER BY appointment_count DESC
      LIMIT $1
    `;
    
    const { rows } = await db.query(query, [limit]);
    return rows;
  }
}

module.exports = new StaffRepository();