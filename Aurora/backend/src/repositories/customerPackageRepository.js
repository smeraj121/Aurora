const db = require('../config/db');
const packageRepository = require('./packageRepository');
const customerRepository = require('./customerRepository');

class CustomerPackageRepository {
  // ============================================================
  // GET CUSTOMER PACKAGES
  // ============================================================
  async getCustomerPackages(tenantId, customerId, includeExpired = false) {
    let query = `
      SELECT 
        cp.id,
        cp.customer_id AS "customerId",
        TO_CHAR(cp.purchase_date, 'YYYY-MM-DD') AS "purchaseDate",
        TO_CHAR(cp.expiry_date, 'YYYY-MM-DD') AS "expiryDate",
        cp.total_sessions AS "totalSessions",
        cp.used_sessions AS "usedSessions",
        cp.total_sessions - cp.used_sessions AS "remainingSessions",
        COALESCE(cp.custom_price, cp.total_price) AS "effectivePrice",
        cp.payment_status AS "paymentStatus",
        p.name AS "packageName",
        p.description AS "packageDescription",
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'serviceId', s.id,
            'serviceName', s.name,
            'servicePrice', s.price,
            'isActive', s.is_active,
            'totalQuantity', cps.total_quantity,
            'usedQuantity', cps.used_quantity
          )) FILTER (WHERE s.id IS NOT NULL),
          '[]'::json
        ) AS services
      FROM customer_packages cp
      JOIN packages p ON cp.package_id = p.id
      LEFT JOIN customer_package_services cps ON cps.customer_package_id = cp.id
      LEFT JOIN services s ON s.id = cps.service_id
      WHERE cp.customer_id = $1 
        AND cp.tenant_id = $2
    `;

    if (!includeExpired) {
      query += ` AND (cp.expiry_date IS NULL OR cp.expiry_date >= CURRENT_DATE)`;
    }

    query += `
      GROUP BY cp.id, p.id
      ORDER BY cp.expiry_date NULLS LAST, cp.purchase_date DESC
    `;

    const { rows } = await db.query(query, [customerId, tenantId]);
    return rows;
  }

  // ============================================================
  // ASSIGN PACKAGE TO CUSTOMER
  // ============================================================
  async assignPackageToCustomer(tenantId, data, createdBy = null) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // 1. Get package details
      const packageResult = await client.query(
        `SELECT 
          p.id, 
          p.name, 
          p.total_price, 
          p.discount_percentage,
          p.validity_days,
          COALESCE(SUM(ps.quantity), 1) as total_sessions
         FROM packages p
         LEFT JOIN package_services ps ON ps.package_id = p.id
         WHERE p.id = $1 AND p.tenant_id = $2 AND p.is_active = true
         GROUP BY p.id`,
        [data.packageId, tenantId]
      );
      const pkg = packageResult.rows[0];
      if (!pkg) throw new Error('Package not found or inactive');

      // 2. Check for existing active package
      const existingCheck = await client.query(
        `SELECT id, total_sessions - used_sessions AS remaining_sessions 
         FROM customer_packages 
         WHERE customer_id = $1 
           AND package_id = $2 
           AND tenant_id = $3
           AND total_sessions - used_sessions > 0
           AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)`,
        [data.customerId, data.packageId, tenantId]
      );
      if (existingCheck.rows.length > 0) {
        throw new Error('Customer already has an active instance of this package');
      }

      // 3. Calculate expiry date
      let expiryDate = data.expiryDate || null;
      if (!expiryDate && pkg.validity_days) {
        const date = new Date();
        date.setDate(date.getDate() + pkg.validity_days);
        expiryDate = date.toISOString().split('T')[0];
      }

      // 4. Insert customer_packages
      const insertQuery = `
        INSERT INTO customer_packages (
          tenant_id,
          customer_id,
          package_id,
          purchase_date,
          expiry_date,
          total_sessions,
          used_sessions,
          total_price,
          custom_price,
          payment_status,
          created_by
        )
        VALUES ($1, $2, $3, CURRENT_DATE, $4, $5, 0, $6, $7, $8, $9)
        RETURNING id
      `;
      const values = [
        tenantId,
        data.customerId,
        data.packageId,
        expiryDate,
        pkg.total_sessions,
        pkg.total_price,
        data.customPrice || null,
        data.paymentStatus || 'paid',
        createdBy
      ];
      const { rows } = await client.query(insertQuery, values);
      const customerPackageId = rows[0].id;

      // 5. Get the services from package template
      const services = await packageRepository.getPackageServiceDefinitions(client, data.packageId);

      // 6. Create the usage snapshot
      await this._createCustomerPackageServices(
        client,
        tenantId,
        customerPackageId,
        services,
        createdBy
      );

      // 7. Update customer stats if paid
      //if (data.paymentStatus === 'paid') {
        await customerRepository.recalculateCustomerStats(tenantId, data.customerId);
      //}

      await client.query('COMMIT');
      return this.getCustomerPackageById(tenantId, customerPackageId);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ============================================================
  // GET CUSTOMER PACKAGE BY ID
  // ============================================================
  async getCustomerPackageValidationInfo(tenantId, id, client = db) {
    const query = `
      SELECT 
        cp.id,
        cp.customer_id AS "customerId",
        cp.package_id AS "packageId",
        TO_CHAR(cp.purchase_date, 'YYYY-MM-DD') AS "purchaseDate",
        TO_CHAR(cp.expiry_date, 'YYYY-MM-DD') AS "expiryDate",
        cp.total_sessions AS "totalSessions",
        cp.used_sessions AS "usedSessions",
        cp.total_sessions - cp.used_sessions AS "remainingSessions",
        p.name AS "packageName",
        p.is_active AS "isActive",
        p.validity_days AS "validityDays",
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'serviceId', cps.service_id,
            'serviceName', s.name,
            'servicePrice', s.price,
            'isActive', s.is_active,
            'totalQuantity', cps.total_quantity,
            'usedQuantity', cps.used_quantity
          )) FILTER (WHERE cps.service_id IS NOT NULL),
          '[]'::json
        ) AS services
      FROM customer_packages cp
      JOIN packages p ON cp.package_id = p.id
      LEFT JOIN customer_package_services cps
        ON cps.customer_package_id = cp.id AND cps.tenant_id = cp.tenant_id
      LEFT JOIN services s ON s.id = cps.service_id AND s.tenant_id = cp.tenant_id
      WHERE cp.id = $1 AND cp.tenant_id = $2
      GROUP BY cp.id, p.id
    `;
    
    const { rows } = await client.query(query, [id, tenantId]);
    return rows[0] || null;
  }

  async getCustomerPackageById(tenantId, id) {
    const query = `
      SELECT 
        cp.id,
        cp.tenant_id AS "tenantId",
        cp.customer_id AS "customerId",
        cp.package_id AS "packageId",
        TO_CHAR(cp.purchase_date, 'YYYY-MM-DD') AS "purchaseDate",
        TO_CHAR(cp.expiry_date, 'YYYY-MM-DD') AS "expiryDate",
        cp.total_sessions AS "totalSessions",
        cp.used_sessions AS "usedSessions",
        cp.total_sessions - cp.used_sessions AS "remainingSessions",
        cp.total_price AS "totalPrice",
        cp.custom_price AS "customPrice",
        COALESCE(cp.custom_price, cp.total_price) AS "effectivePrice",
        cp.payment_status AS "paymentStatus",
        p.name AS "packageName",
        p.description AS "packageDescription",
        p.discount_percentage AS "discountPercentage",
        p.validity_days AS "validityDays",
        p.color,
        p.image_url AS "imageUrl",
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'serviceId', ps.service_id,
            'serviceName', s.name,
            'servicePrice', s.price,
            'quantity', ps.quantity,
            'discount', ps.discount_per_service
          )) FILTER (WHERE ps.service_id IS NOT NULL),
          '[]'::json
        ) AS services
      FROM customer_packages cp
      JOIN packages p ON cp.package_id = p.id
      LEFT JOIN package_services ps ON ps.package_id = p.id
      LEFT JOIN services s ON s.id = ps.service_id
      WHERE cp.id = $1 AND cp.tenant_id = $2
      GROUP BY cp.id, p.id
    `;
    
    const { rows } = await db.query(query, [id, tenantId]);
    return rows[0] || null;
  }

  // ============================================================
  // UPDATE CUSTOMER PACKAGE
  // ============================================================
  // customerPackageRepository.js
async updateCustomerPackage(tenantId, id, data, updatedBy = null, client = db) {
  // If no client provided, use the default db (and start a transaction)
  const useOwnClient = !client;
  if (useOwnClient) {
    client = await db.connect();
    await client.query('BEGIN');
  }

  try {
    // Build dynamic UPDATE query (same as existing)
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (data.customPrice !== undefined) {
      updates.push(`custom_price = $${paramCount++}`);
      values.push(data.customPrice);
    }
    if (data.paymentStatus !== undefined) {
      updates.push(`payment_status = $${paramCount++}`);
      values.push(data.paymentStatus);
    }
    if (data.notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(data.notes);
    }
    if (data.expiryDate !== undefined) {
      updates.push(`expiry_date = $${paramCount++}`);
      values.push(data.expiryDate);
    }
    if (data.totalSessions !== undefined) {
      updates.push(`total_sessions = $${paramCount++}`);
      values.push(data.totalSessions);
    }

    if (updates.length === 0) {
      // No changes – still need to commit if we started the transaction
      if (useOwnClient) {
        await client.query('COMMIT');
        client.release();
      }
      return this.getCustomerPackageById(tenantId, id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    updates.push(`updated_by = $${paramCount++}`);
    values.push(updatedBy);

    const query = `
      UPDATE customer_packages
      SET ${updates.join(', ')}
      WHERE id = $${paramCount} AND tenant_id = $${paramCount + 1}
      RETURNING id
    `;
    values.push(id);
    values.push(tenantId);

    const { rows } = await client.query(query, values);

    if (rows.length === 0) {
      throw new Error('Customer package not found');
    }

    // ✅ Commit if we started the transaction (will be committed by outer caller otherwise)
    if (useOwnClient) {
      await client.query('COMMIT');
    }

    // Return the updated package (outside transaction)
    const updatedPackage = await this.getCustomerPackageById(tenantId, id);
    return updatedPackage;

  } catch (error) {
    if (useOwnClient) {
      await client.query('ROLLBACK');
    }
    throw error;
  } finally {
    if (useOwnClient) {
      client.release();
    }
  }
}

  // ============================================================
  // USE PACKAGE SESSION
  // ============================================================
  async usePackageSession(tenantId, customerPackageId) {
    const query = `
      UPDATE customer_packages
      SET 
        used_sessions = used_sessions + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
        AND tenant_id = $2
        AND used_sessions < total_sessions
        AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)
      RETURNING id, used_sessions, total_sessions - used_sessions AS remaining_sessions
    `;
    
    const { rows } = await db.query(query, [customerPackageId, tenantId]);
    if (rows.length === 0) {
      throw new Error('No available sessions in this package');
    }
    return rows[0];
  }

  // ============================================================
  // PRIVATE: Create customer package services snapshot
  // ============================================================
  async _createCustomerPackageServices(
    client,
    tenantId,
    customerPackageId,
    services,
    createdBy
  ) {
    if (!services || services.length === 0) return;

    const values = [];
    const placeholders = [];
    services.forEach((svc, idx) => {
      const base = idx * 6;
      values.push(
        tenantId,
        customerPackageId,
        svc.service_id,
        svc.quantity,
        0, // used_quantity starts at 0
        createdBy
      );
      placeholders.push(
        `($${base+1}, $${base+2}, $${base+3}, $${base+4}, $${base+5}, $${base+6})`
      );
    });

    const query = `
      INSERT INTO customer_package_services (
        tenant_id,
        customer_package_id,
        service_id,
        total_quantity,
        used_quantity,
        created_by
      )
      VALUES ${placeholders.join(', ')}
    `;
    await client.query(query, values);
  }
}

module.exports = new CustomerPackageRepository();
