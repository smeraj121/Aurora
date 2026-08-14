const db = require('../config/db');

class DesignationRepository {
  async getAll(tenantId, includeInactive = false) {
    let query = `
      SELECT
        id,
        tenant_id,
        name,
        description,
        display_order AS "displayOrder",
        is_active AS "isActive",
        created_at AS "createdAt",
        created_by AS "createdBy",
        updated_at AS "updatedAt",
        updated_by AS "updatedBy"
      FROM designations
      WHERE tenant_id = $1
    `;
    const params = [tenantId];
    if (!includeInactive) {
      query += ' AND is_active = true';
    }
    query += ' ORDER BY display_order ASC, name ASC';
    const { rows } = await db.query(query, params);
    return rows;
  }

  async getById(id, tenantId) {
    const query = `
      SELECT
        id,
        tenant_id,
        name,
        description,
        display_order AS "displayOrder",
        is_active AS "isActive",
        created_at AS "createdAt",
        created_by AS "createdBy",
        updated_at AS "updatedAt",
        updated_by AS "updatedBy"
      FROM designations
      WHERE id = $1 AND tenant_id = $2
    `;
    const { rows } = await db.query(query, [id, tenantId]);
    return rows[0] || null;
  }

  async create(tenantId, data, userId) {
  const query = `
    INSERT INTO designations (
      tenant_id,
      name,
      description,
      display_order,
      is_active,
      created_by,
      created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
    RETURNING
      id,
      tenant_id,
      name,
      description,
      display_order AS "displayOrder",
      is_active AS "isActive",
      created_at AS "createdAt",
      created_by AS "createdBy"
  `;
  const values = [
    tenantId,
    data.name,
    data.description || null,
    data.displayOrder !== undefined ? data.displayOrder : 0,
    data.isActive !== undefined ? data.isActive : true,
    userId,
  ];
  const { rows } = await db.query(query, values);
  return rows[0];
}

  async update(id, tenantId, data, userId) {
  const query = `
    UPDATE designations
    SET
      name = COALESCE($1, name),
      description = COALESCE($2, description),
      display_order = COALESCE($3, display_order),
      is_active = COALESCE($4, is_active),
      updated_by = $5,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $6 AND tenant_id = $7
    RETURNING
      id,
      tenant_id,
      name,
      description,
      display_order AS "displayOrder",
      is_active AS "isActive",
      created_at AS "createdAt",
      created_by AS "createdBy",
      updated_at AS "updatedAt",
      updated_by AS "updatedBy"
  `;
  const values = [
    data.name || null,
    data.description || null,
    data.displayOrder !== undefined ? data.displayOrder : null,
    data.isActive !== undefined ? data.isActive : null,
    userId,
    id,
    tenantId
  ];
  const { rows } = await db.query(query, values);
  return rows[0] || null;
}

  async updateStatus(id, tenantId, isActive, userId) {
    const query = `
      UPDATE designations
      SET
        is_active = $1,
        updated_by = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND tenant_id = $4
      RETURNING
        id,
        tenant_id,
        name,
        description,
        display_order AS "displayOrder",
        is_active AS "isActive",
        created_at AS "createdAt",
        created_by AS "createdBy",
        updated_at AS "updatedAt",
        updated_by AS "updatedBy"
    `;
    const { rows } = await db.query(query, [isActive, userId, id, tenantId]);
    return rows[0] || null;
  }

  async delete(id, tenantId) {
    // Physical delete; if you prefer soft delete, use updateStatus with isActive = false
    const query = `
      DELETE FROM designations
      WHERE id = $1 AND tenant_id = $2
      RETURNING id
    `;
    const { rows } = await db.query(query, [id, tenantId]);
    return rows.length > 0;
  }
}

module.exports = new DesignationRepository();