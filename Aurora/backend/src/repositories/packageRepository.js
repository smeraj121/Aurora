// repositories/packageRepository.js
const db = require('../config/db');

class PackageRepository {
  // ============================================================
  // GET ALL PACKAGES
  // ============================================================
  async getAllPackages(includeInactive = false) {
    let query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.total_price AS "totalPrice",
        p.discount_percentage AS "discountPercentage",
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
    `;
    
    if (!includeInactive) {
      query += ` WHERE p.is_active = true`;
    }
    
    query += `
      GROUP BY p.id
      ORDER BY p.name ASC
    `;
    
    const { rows } = await db.query(query);
    return rows;
  }

  // ============================================================
  // GET PACKAGE BY ID
  // ============================================================
  async getPackageById(id) {
    const query = `
      SELECT 
        p.*,
        p.total_price AS "totalPrice",
        p.discount_percentage AS "discountPercentage",
        p.is_active AS "isActive",
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'serviceId', ps.service_id,
            'serviceName', s.name,
            'servicePrice', s.price,
            'quantity', ps.quantity,
            'discount', ps.discount_per_service,
            'totalPrice', (s.price * ps.quantity) - (s.price * ps.quantity * ps.discount_per_service / 100)
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
      WHERE p.id = $1
      GROUP BY p.id
    `;
    
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }

  // ============================================================
  // CREATE PACKAGE
  // ============================================================
  async createPackage(data) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');

      // Insert package
      const packageQuery = `
        INSERT INTO packages (
          name, description, total_price, discount_percentage, is_active
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `;
      
      const packageValues = [
        data.name,
        data.description || null,
        data.totalPrice,
        data.discountPercentage || 0,
        data.isActive !== undefined ? data.isActive : true
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
            service.discount || 0
          );
          servicePlaceholders.push(`($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`);
        });

        const serviceQuery = `
          INSERT INTO package_services (
            package_id, service_id, quantity, discount_per_service
          )
          VALUES ${servicePlaceholders.join(', ')}
        `;
        
        await client.query(serviceQuery, serviceValues);
      }

      await client.query('COMMIT');
      return this.getPackageById(packageId);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ============================================================
  // UPDATE PACKAGE
  // ============================================================
  async updatePackage(id, data) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');

      // Update package
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
      if (data.isActive !== undefined) {
        updates.push(`is_active = $${paramCount++}`);
        values.push(data.isActive);
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);

      if (updates.length > 0) {
        const query = `
          UPDATE packages
          SET ${updates.join(', ')}
          WHERE id = $${paramCount}
        `;
        values.push(id);
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
              service.discount || 0
            );
            servicePlaceholders.push(`($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`);
          });

          const serviceQuery = `
            INSERT INTO package_services (
              package_id, service_id, quantity, discount_per_service
            )
            VALUES ${servicePlaceholders.join(', ')}
          `;
          
          await client.query(serviceQuery, serviceValues);
        }
      }

      await client.query('COMMIT');
      return this.getPackageById(id);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ============================================================
  // DELETE PACKAGE
  // ============================================================
  async deletePackage(id) {
    // Check if package is used by any customer
    const checkQuery = `
      SELECT COUNT(*) as count 
      FROM customer_packages 
      WHERE package_id = $1
    `;
    const { rows } = await db.query(checkQuery, [id]);
    
    
    if (parseInt(rows[0].count) > 0) {
      // Soft delete - just deactivate
      const query = `
        UPDATE packages 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id
      `;
      const { rows: updateRows } = await db.query(query, [id]);
      return updateRows[0] || null;
    }
    
    // Hard delete if not used
    const query = `DELETE FROM packages WHERE id = $1 RETURNING id`;
    const { rows: deleteRows } = await db.query(query, [id]);
    return deleteRows[0] || null;
  }

  // ============================================================
  // GET PACKAGE STATS
  // ============================================================
  async getPackageStats() {
    const query = `
      SELECT 
        COUNT(*) AS "totalPackages",
        SUM(CASE WHEN is_active THEN 1 ELSE 0 END) AS "activePackages",
        COUNT(DISTINCT cp.id) AS "totalPurchases",
        COALESCE(SUM(cp.total_price), 0) AS "totalRevenue",
        COUNT(DISTINCT cp.customer_id) AS "uniqueCustomers"
      FROM packages p
      LEFT JOIN customer_packages cp ON cp.package_id = p.id
    `;
    
    const { rows } = await db.query(query);
    return rows[0] || null;
  }

  // ============================================================
  // GET POPULAR PACKAGES
  // ============================================================
  async getPopularPackages(limit = 5) {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.total_price AS "totalPrice",
        COUNT(cp.id) AS "purchases",
        COALESCE(SUM(cp.total_price), 0) AS "revenue",
        p.is_active AS "isActive"
      FROM packages p
      LEFT JOIN customer_packages cp ON cp.package_id = p.id
      WHERE p.is_active = true
      GROUP BY p.id
      ORDER BY purchases DESC, revenue DESC
      LIMIT $1
    `;
    
    const { rows } = await db.query(query, [limit]);
    return rows;
  }
}

module.exports = new PackageRepository();