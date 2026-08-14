// repositories/serviceRepository.js
const db = require('../config/db');

class ServiceRepository {
  // ============================================================
  // GET ALL SERVICES (with optional filter for inactive)
  // ============================================================
  async findAll(tenantId, includeInactive = false) {
    let query = `
      SELECT 
        id,
        tenant_id AS "tenantId",
        name,
        description,
        category,
        estimated_duration_minutes AS "durationMinutes",
        price,
        display_order AS "displayOrder",
        color,
        is_online_bookable AS "isOnlineBookable",
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM services
      WHERE tenant_id = $1
    `;
    
    const values = [tenantId];
    
    if (!includeInactive) {
      query += ` AND is_active = true`;
    }
    
    query += ` ORDER BY display_order ASC, name ASC`;
    
    const { rows } = await db.query(query, values);
    return rows;
  }

  // ============================================================
  // GET SERVICES BY IDS (for bulk selection)
  // ============================================================
  async getServicesByIds(tenantId, ids) {
    if (!ids || ids.length === 0) return [];
    
    const query = `
      SELECT
        id,
        name,
        price,
        estimated_duration_minutes AS "durationMinutes",
        is_active AS "isActive"
      FROM services
      WHERE tenant_id = $1 AND id = ANY($2)
    `;
    const { rows } = await db.query(query, [tenantId, ids]);
    return rows;
  }

  // ============================================================
  // GET A SINGLE SERVICE BY ID
  // ============================================================
  async findById(tenantId, id) {
    const query = `
      SELECT 
        id,
        tenant_id AS "tenantId",
        name,
        description,
        category,
        estimated_duration_minutes AS "durationMinutes",
        price,
        display_order AS "displayOrder",
        color,
        is_online_bookable AS "isOnlineBookable",
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM services
      WHERE id = $1 AND tenant_id = $2
    `;
    const { rows } = await db.query(query, [id, tenantId]);
    return rows[0] || null;
  }

  // ============================================================
  // CREATE A NEW SERVICE
  // ============================================================
  async create(tenantId, data, createdBy = null) {
    const query = `
      INSERT INTO services (
        tenant_id,
        name,
        description,
        category,
        estimated_duration_minutes,
        price,
        display_order,
        color,
        is_online_bookable,
        is_active,
        created_by,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING 
        id,
        tenant_id AS "tenantId",
        name,
        description,
        category,
        estimated_duration_minutes AS "estimatedDurationMinutes",
        price,
        display_order AS "displayOrder",
        color,
        is_online_bookable AS "isOnlineBookable",
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `;

    const values = [
      tenantId,
      data.name,
      data.description || null,
      data.category || null,
      data.durationMinutes,
      data.price,
      data.displayOrder || 0,
      data.color || null,
      data.isOnlineBookable !== undefined ? data.isOnlineBookable : true,
      data.isActive !== undefined ? data.isActive : true,
      createdBy
    ];

    const { rows } = await db.query(query, values);
    return rows[0];
  }

  // ============================================================
  // UPDATE A SERVICE
  // ============================================================
  async update(tenantId, id, data, updatedBy = null) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(data.description);
    }
    if (data.category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(data.category);
    }
    if (data.durationMinutes !== undefined) {
      updates.push(`estimated_duration_minutes = $${paramCount++}`);
      values.push(data.durationMinutes);
    }
    if (data.price !== undefined) {
      updates.push(`price = $${paramCount++}`);
      values.push(data.price);
    }
    if (data.displayOrder !== undefined) {
      updates.push(`display_order = $${paramCount++}`);
      values.push(data.displayOrder);
    }
    if (data.color !== undefined) {
      updates.push(`color = $${paramCount++}`);
      values.push(data.color);
    }
    if (data.isOnlineBookable !== undefined) {
      updates.push(`is_online_bookable = $${paramCount++}`);
      values.push(data.isOnlineBookable);
    }
    if (data.isActive !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(data.isActive);
    }

    if (updates.length === 0) {
      return this.findById(tenantId, id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    updates.push(`updated_by = $${paramCount++}`);
    values.push(updatedBy);

    const query = `
      UPDATE services
      SET ${updates.join(', ')}
      WHERE id = $${paramCount} AND tenant_id = $${paramCount + 1}
      RETURNING 
        id,
        tenant_id AS "tenantId",
        name,
        description,
        category,
        estimated_duration_minutes AS "estimatedDurationMinutes",
        price,
        display_order AS "displayOrder",
        color,
        is_online_bookable AS "isOnlineBookable",
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `;

    values.push(id);
    values.push(tenantId);
    const { rows } = await db.query(query, values);
    return rows[0] || null;
  }

  // ============================================================
  // SOFT DELETE A SERVICE (set is_active = false)
  // ============================================================
  async delete(tenantId, id, updatedBy = null) {
    const query = `
      UPDATE services
      SET 
        is_active = false,
        updated_at = CURRENT_TIMESTAMP,
        updated_by = $1
      WHERE id = $2 AND tenant_id = $3
      RETURNING id
    `;
    const { rows } = await db.query(query, [updatedBy, id, tenantId]);
    return rows[0] || null;
  }

  // ============================================================
  // BULK UPDATE ACTIVE STATUS
  // ============================================================
  async bulkUpdateStatus(tenantId, ids, isActive, updatedBy = null) {
    if (!ids || ids.length === 0) return [];

    const query = `
      UPDATE services
      SET 
        is_active = $1,
        updated_at = CURRENT_TIMESTAMP,
        updated_by = $2
      WHERE tenant_id = $3 AND id = ANY($4)
      RETURNING id
    `;
    const { rows } = await db.query(query, [isActive, updatedBy, tenantId, ids]);
    return rows;
  }

  // ============================================================
  // CHECK IF SERVICE EXISTS (by name, for uniqueness validation)
  // ============================================================
  async findByName(tenantId, name, excludeId = null) {
    let query = `
      SELECT id, name
      FROM services
      WHERE tenant_id = $1 AND LOWER(name) = LOWER($2)
    `;
    const values = [tenantId, name];
    
    if (excludeId) {
      query += ` AND id != $3`;
      values.push(excludeId);
    }
    
    const { rows } = await db.query(query, values);
    return rows[0] || null;
  }
}

module.exports = new ServiceRepository();