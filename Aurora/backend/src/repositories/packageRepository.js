// repositories/packageRepository.js
const db = require('../config/db');

class PackageRepository {
  // ============================================================
  // GET ALL PACKAGES (with optional includeInactive)
  // ============================================================
  async findAll(tenantId, includeInactive = false) {
    let query = `
      SELECT 
        p.id,
        p.tenant_id AS "tenantId",
        p.name,
        p.description,
        p.total_price AS "totalPrice",
        p.discount_percentage AS "discountPercentage",
        p.validity_days AS "validityDays",
        p.display_order AS "displayOrder",
        p.color,
        p.image_url AS "imageUrl",
        p.is_active AS "isActive",
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt",
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'serviceId', ps.service_id,
            'serviceName', s.name,
            'servicePrice', s.price,
            'quantity', ps.quantity,
            'discount', ps.discount_per_service,
            'totalPrice', ROUND(((s.price * ps.quantity) - (s.price * ps.quantity * ps.discount_per_service / 100))::numeric, 2)
          )) FILTER (WHERE ps.service_id IS NOT NULL),
          '[]'::json
        ) AS services,
        COALESCE(
          (SELECT SUM(quantity) FROM package_services WHERE package_id = p.id),
          0
        ) AS "totalSessions"
      FROM packages p
      LEFT JOIN package_services ps ON ps.package_id = p.id
      LEFT JOIN services s ON s.id = ps.service_id
      WHERE p.tenant_id = $1
    `;

    const values = [tenantId];

    if (!includeInactive) {
      query += ` AND p.is_active = true`;
    }

    query += `
      GROUP BY p.id
      ORDER BY p.display_order ASC, p.name ASC
    `;

    const { rows } = await db.query(query, values);
    return rows;
  }

  // ============================================================
  // GET PACKAGE BY ID
  // ============================================================
  async findById(tenantId, id) {
    const query = `
      SELECT 
        p.id,
        p.tenant_id AS "tenantId",
        p.name,
        p.description,
        p.total_price AS "totalPrice",
        p.discount_percentage AS "discountPercentage",
        p.validity_days AS "validityDays",
        p.display_order AS "displayOrder",
        p.color,
        p.image_url AS "imageUrl",
        p.is_active AS "isActive",
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt",
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'serviceId', ps.service_id,
            'serviceName', s.name,
            'servicePrice', s.price,
            'quantity', ps.quantity,
            'discount', ps.discount_per_service,
            'totalPrice', ROUND(((s.price * ps.quantity) - (s.price * ps.quantity * ps.discount_per_service / 100))::numeric, 2)
          )) FILTER (WHERE ps.service_id IS NOT NULL),
          '[]'::json
        ) AS services,
        COALESCE(
          (SELECT SUM(quantity) FROM package_services WHERE package_id = p.id),
          0
        ) AS "totalSessions"
      FROM packages p
      LEFT JOIN package_services ps ON ps.package_id = p.id
      LEFT JOIN services s ON s.id = ps.service_id
      WHERE p.id = $1 AND p.tenant_id = $2
      GROUP BY p.id
    `;

    const { rows } = await db.query(query, [id, tenantId]);
    return rows[0] || null;
  }

  // ============================================================
  // CHECK PACKAGE NAME UNIQUENESS PER TENANT
  // ============================================================
  async findByName(tenantId, name, excludeId = null) {
    let query = `
      SELECT id, name
      FROM packages
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

  // ============================================================
  // CREATE PACKAGE (with services)
  // ============================================================
  async create(tenantId, data, userId) {
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      // Insert package
      const packageQuery = `
        INSERT INTO packages (
          tenant_id,
          name,
          description,
          total_price,
          discount_percentage,
          validity_days,
          display_order,
          color,
          image_url,
          is_active,
          created_by,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `;

      const packageValues = [
        tenantId,
        data.name,
        data.description || null,
        data.totalPrice,
        data.discountPercentage || 0,
        data.validityDays || null,
        data.displayOrder || 0,
        data.color || null,
        data.imageUrl || null,
        data.isActive !== undefined ? data.isActive : true,
        userId
      ];

      const { rows } = await client.query(packageQuery, packageValues);
      const packageId = rows[0].id;

      // Insert package services
      if (data.services && data.services.length > 0) {
        const serviceValues = [];
        const servicePlaceholders = [];

        data.services.forEach((service, index) => {
          serviceValues.push(
            packageId,
            service.serviceId,
            service.quantity || 1,
            service.discount || 0,
            userId
          );
          servicePlaceholders.push(`($${index * 5 + 1}, $${index * 5 + 2}, $${index * 5 + 3}, $${index * 5 + 4}, $${index * 5 + 5})`);
        });

        const serviceQuery = `
          INSERT INTO package_services (
            package_id, service_id, quantity, discount_per_service, created_by
          )
          VALUES ${servicePlaceholders.join(', ')}
        `;

        await client.query(serviceQuery, serviceValues);
      }

      await client.query('COMMIT');
      return this.findById(tenantId, packageId);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ============================================================
  // UPDATE PACKAGE (and its services)
  // ============================================================
  async update(tenantId, id, data, userId) {
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      // Build dynamic UPDATE for package
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
      if (data.totalPrice !== undefined) {
        updates.push(`total_price = $${paramCount++}`);
        values.push(data.totalPrice);
      }
      if (data.discountPercentage !== undefined) {
        updates.push(`discount_percentage = $${paramCount++}`);
        values.push(data.discountPercentage);
      }
      if (data.validityDays !== undefined) {
        updates.push(`validity_days = $${paramCount++}`);
        values.push(data.validityDays);
      }
      if (data.displayOrder !== undefined) {
        updates.push(`display_order = $${paramCount++}`);
        values.push(data.displayOrder);
      }
      if (data.color !== undefined) {
        updates.push(`color = $${paramCount++}`);
        values.push(data.color);
      }
      if (data.imageUrl !== undefined) {
        updates.push(`image_url = $${paramCount++}`);
        values.push(data.imageUrl);
      }
      if (data.isActive !== undefined) {
        updates.push(`is_active = $${paramCount++}`);
        values.push(data.isActive);
      }

      if (updates.length > 0) {
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        updates.push(`updated_by = $${paramCount++}`);
        values.push(userId);

        const query = `
          UPDATE packages
          SET ${updates.join(', ')}
          WHERE id = $${paramCount} AND tenant_id = $${paramCount + 1}
        `;
        values.push(id);
        values.push(tenantId);
        await client.query(query, values);
      }

      // Update package services if provided
      if (data.services !== undefined) {
        // Remove existing services
        await client.query(
          `DELETE FROM package_services WHERE package_id = $1`,
          [id]
        );

        // Insert new services
        if (data.services.length > 0) {
          const serviceValues = [];
          const servicePlaceholders = [];

          data.services.forEach((service, index) => {
            serviceValues.push(
              id,
              service.serviceId,
              service.quantity || 1,
              service.discount || 0,
              userId
            );
            servicePlaceholders.push(`($${index * 5 + 1}, $${index * 5 + 2}, $${index * 5 + 3}, $${index * 5 + 4}, $${index * 5 + 5})`);
          });

          const serviceQuery = `
            INSERT INTO package_services (
              package_id, service_id, quantity, discount_per_service, created_by
            )
            VALUES ${servicePlaceholders.join(', ')}
          `;

          await client.query(serviceQuery, serviceValues);
        }
      }

      await client.query('COMMIT');
      return this.findById(tenantId, id);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ============================================================
  // DELETE PACKAGE (soft delete only)
  // ============================================================
  async delete(tenantId, id, userId) {
    // Because customer_packages may reference this package, we only soft delete
    const query = `
      UPDATE packages
      SET is_active = false, updated_at = CURRENT_TIMESTAMP, updated_by = $1
      WHERE id = $2 AND tenant_id = $3
      RETURNING id
    `;
    const { rows } = await db.query(query, [userId, id, tenantId]);
    return rows[0] || null;
  }

  // ============================================================
  // GET PACKAGE STATISTICS (tenant‑aware)
  // ============================================================
  async getStats(tenantId) {
    const query = `
      SELECT 
        COUNT(DISTINCT p.id) AS "totalPackages",
        COUNT(DISTINCT CASE WHEN p.is_active THEN p.id END) AS "activePackages",
        COUNT(cp.id) AS "totalPurchases",
        COALESCE(SUM(cp.custom_price), 0) AS "totalRevenue",
        COUNT(DISTINCT cp.customer_id) AS "uniqueCustomers",
        (SELECT COALESCE(AVG(total_price), 0) FROM packages WHERE tenant_id = $1 AND is_active = true) AS "avgPackagePrice"
      FROM packages p
      LEFT JOIN customer_packages cp ON cp.package_id = p.id AND cp.tenant_id = p.tenant_id
      WHERE p.tenant_id = $1
    `;

    const { rows } = await db.query(query, [tenantId]);
    return rows[0] || null;
  }

  // ============================================================
  // GET POPULAR PACKAGES (based on purchase count)
  // ============================================================
  async getPopular(tenantId, limit = 5) {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.total_price AS "totalPrice",
        COUNT(cp.id) AS "purchases",
        COALESCE(SUM(cp.custom_price), 0) AS "revenue",
        p.is_active AS "isActive"
      FROM packages p
      LEFT JOIN customer_packages cp ON cp.package_id = p.id AND cp.tenant_id = p.tenant_id
      WHERE p.tenant_id = $1
      GROUP BY p.id
      ORDER BY purchases DESC, revenue DESC
      LIMIT $2
    `;

    const { rows } = await db.query(query, [tenantId, limit]);
    return rows;
  }

  // ============================================================
  // GET PACKAGE Services
  // ============================================================
  async getPackageServiceDefinitions(tenantId, packageId) {
    const { rows } = await db.query(
      `SELECT service_id, quantity 
      FROM package_services 
      WHERE package_id = $1`,
      [packageId]
    );
    return rows;
  }
}

module.exports = new PackageRepository();