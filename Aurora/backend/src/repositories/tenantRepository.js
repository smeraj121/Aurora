const db = require('../config/db');

class TenantRepository {

  async getAll() {
    const query = `
      SELECT
        t.id,
        t.name,
        t.slug,
        t.phone,
        t.email,
        t.is_active AS "isActive",
        t.created_at AS "createdAt",
        t.updated_at AS "updatedAt",
        (
          SELECT COUNT(*)
          FROM customers c
          WHERE c.tenant_id = t.id
        )::INT AS "customerCount",
        (
          SELECT COUNT(*)
          FROM staff s
          WHERE s.tenant_id = t.id
        )::INT AS "staffCount"
      FROM tenants t
      ORDER BY t.created_at DESC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  async getById(id) {
    const query = `
      SELECT
        t.id,
        t.name,
        t.slug,
        t.phone,
        t.email,
        t.business_type_id AS "businessTypeId",
        t.is_active AS "isActive",
        t.created_at AS "createdAt",
        t.updated_at AS "updatedAt"
      FROM tenants t
      WHERE t.id = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }

  async getBySlug(slug) {
    const query = `
      SELECT
        id,
        name,
        slug,
        phone,
        email,
        is_active AS "isActive"
      FROM tenants
      WHERE LOWER(slug) = LOWER($1)
    `;
    const { rows } = await db.query(query, [slug]);
    return rows[0] || null;
  }

  async create(data) {
    // data: { name, slug, phone, email, isActive, createdBy? }
    if (!data.email) {
      throw new Error('Email is required to create a user for the tenant.');
    }

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Insert tenant
      const tenantQuery = `
        INSERT INTO tenants (
          name,
          slug,
          phone,
          email,
          is_active,
          business_type_id,
          created_at,
          created_by,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7, CURRENT_TIMESTAMP)
        RETURNING
          id,
          name,
          slug,
          phone,
          email,
          business_type_id,
          is_active AS "isActive",
          created_at AS "createdAt",
          created_by AS "createdBy",
          updated_at AS "updatedAt"
      `;
      const tenantValues = [
        data.name,
        data.slug,
        data.phone || null,
        data.email,
        data.isActive ?? true,
        data.business_type_id,
        data.createdBy || 1
      ];
      const tenantResult = await client.query(tenantQuery, tenantValues);
      const newTenant = tenantResult.rows[0];

      // 2. Insert associated owner user
      const userQuery = `
        INSERT INTO users (
          tenant_id,
          full_name,
          phone,
          email,
          system_role,
          otp_verified,
          is_active,
          created_by,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `;
      const userValues = [
        newTenant.id,
        data.name,                     // full_name
        data.phone || null,
        data.email,
        'Owner',                       // system_role
        true,                          // otp_verified
        true,                          // is_active
        data.createdBy || 1            // created_by (default to system user ID 1)
      ];
      await client.query(userQuery, userValues);

      const defaults = TENANT_DEFAULTS[data.businessTypeId];

    if (defaults) {
      await designationRepository.createMany(
        tenant.id,
        defaults.designations,
        createdBy,
        client
      );

      await serviceRepository.createMany(
        tenant.id,
        defaults.services,
        createdBy,
        client
      );
    }

      await client.query('COMMIT');
      return newTenant;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async update(id, data) {
    // data: { name, slug, phone, email, isActive }
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Update tenant
      const tenantQuery = `
        UPDATE tenants
        SET
          name = $1,
          slug = $2,
          phone = $3,
          email = $4,
          is_active = $5,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING
          id,
          name,
          slug,
          phone,
          email,
          is_active AS "isActive",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `;
      const tenantValues = [
        data.name,
        data.slug,
        data.phone,
        data.email,
        data.isActive,
        id
      ];
      const tenantResult = await client.query(tenantQuery, tenantValues);
      const updatedTenant = tenantResult.rows[0];
      if (!updatedTenant) {
        throw new Error('Tenant not found');
      }

      // 2. Update the owner user (system_role = 'Owner') for this tenant
      const userQuery = `
        UPDATE users
        SET
          full_name = $1,
          phone = $2,
          email = $3,
          updated_at = CURRENT_TIMESTAMP
        WHERE tenant_id = $4 AND system_role = 'Owner'
        RETURNING id
      `;
      const userValues = [
        data.name,
        data.phone,
        data.email,
        id
      ];
      await client.query(userQuery, userValues);
      // If no user found, we ignore – but you could log a warning.

      await client.query('COMMIT');
      return updatedTenant;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateStatus(id, isActive) {
    const query = `
      UPDATE tenants
      SET
        is_active = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING
        id,
        name,
        slug,
        phone,
        email,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `;
    const { rows } = await db.query(query, [isActive, id]);
    return rows[0] || null;
  }
}

module.exports = new TenantRepository();