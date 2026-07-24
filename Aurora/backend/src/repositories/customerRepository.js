// repositories/customerRepository.js
const db = require('../config/db');

class CustomerRepository {
  // ============================================================
  // GET ALL CUSTOMERS (with search)
  // ============================================================
  async getCustomers(search = '') {
    let query = `
      SELECT 
        id,
        full_name AS "fullName",
        phone,
        email,
        notes,
        total_visits AS "totalVisits",
        total_spent AS "totalSpent",
        total_paid AS "totalPaid",
        last_visit_date AS "lastVisitDate",
        created_at AS "createdAt"
      FROM customers
    `;
    
    const values = [];
    
    if (search && search.trim()) {
      query += `
        WHERE full_name ILIKE $1 
        OR phone ILIKE $1 
        OR email ILIKE $1
      `;
      values.push(`%${search.trim()}%`);
    }
    
    query += ` ORDER BY full_name ASC`;
    
    const { rows } = await db.query(query, values);
    return rows;
  }

  // ============================================================
  // GET CUSTOMER BY ID (with full details)
  // ============================================================
  async getCustomerDetails(id) {
    const query = `
      SELECT 
        id,
        full_name AS "fullName",
        phone,
        email,
        notes,
        total_visits AS "totalVisits",
        total_spent AS "totalSpent",
        total_paid AS "totalPaid",
        last_visit_date AS "lastVisitDate",
        created_at AS "createdAt"
      FROM customers
      WHERE id = $1
    `;
    
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }

  // ============================================================
  // GET CUSTOMER HISTORY
  // ============================================================
  async getCustomerHistory(id) {
    const query = `
      SELECT 
        a.id,
        a.appointment_date AS "appointmentDate",
        a.time_slot AS "startTime",
        a.total_price AS "amount",
        a.paid_amount AS "paidAmount",
        a.payment_status AS "paymentStatus",
        a.status AS "appointmentStatus",
        a.is_package_appointment AS "isPackageAppointment",
        a.customer_package_id AS "customerPackageId",
        s.name AS "staffName",
        p.name AS "packageName",
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'serviceId', svc.id,
            'serviceName', svc.name,
            'price', aps.service_price,
            'isPackage', aps.is_package_usage
          )) FILTER (WHERE svc.id IS NOT NULL),
          '[]'::json
        ) AS "services"
      FROM appointments a
      LEFT JOIN staff s ON a.staff_id = s.id
      LEFT JOIN appointment_services aps ON aps.appointment_id = a.id
      LEFT JOIN services svc ON aps.service_id = svc.id
      LEFT JOIN customer_packages cp ON cp.id = a.customer_package_id
      LEFT JOIN packages p ON p.id = cp.package_id
      WHERE a.customer_id = $1
        AND a.status NOT IN ('cancelled')
      GROUP BY a.id, s.name, p.name
      ORDER BY a.appointment_date DESC, a.time_slot DESC
      LIMIT 20;
    `;
    
    const { rows } = await db.query(query, [id]);
    
    return rows.map(row => ({
      ...row,
      serviceName: row.services && row.services.length > 0 
        ? row.services.map(s => s.serviceName).join(', ')
        : 'Service',
    }));
  }

  // ============================================================
  // GET CUSTOMER PACKAGES
  // ============================================================
  async getCustomerPackages(customerId, includeExpired = false) {
    let query = `
      SELECT 
        cp.id,
        cp.customer_id AS "customerId",
        cp.package_id AS "packageId",
        cp.purchase_date AS "purchaseDate",
        cp.expiry_date AS "expiryDate",
        cp.total_sessions AS "totalSessions",
        cp.used_sessions AS "usedSessions",
        cp.remaining_sessions AS "remainingSessions",
        cp.total_price AS "totalPrice",
        cp.custom_price AS "customPrice",
        COALESCE(cp.custom_price, cp.total_price) AS "effectivePrice",
        cp.payment_status AS "paymentStatus",
        cp.payment_method AS "paymentMethod",
        cp.notes,
        p.name AS "packageName",
        p.description AS "packageDescription",
        p.discount_percentage AS "discountPercentage",
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
      WHERE cp.customer_id = $1
    `;

    if (!includeExpired) {
      query += ` AND (cp.expiry_date IS NULL OR cp.expiry_date >= CURRENT_DATE)`;
    }

    query += `
      GROUP BY cp.id, p.id
      ORDER BY cp.expiry_date NULLS LAST, cp.purchase_date DESC
    `;
    
    const { rows } = await db.query(query, [customerId]);
    return rows;
  }

  // ============================================================
  // CREATE CUSTOMER
  // ============================================================
  async createCustomer(data) {
    const query = `
      INSERT INTO customers (
        full_name, phone, email, notes
      )
      VALUES ($1, $2, $3, $4)
      RETURNING 
        id,
        full_name AS "fullName",
        phone,
        email,
        notes,
        total_visits AS "totalVisits",
        total_spent AS "totalSpent",
        total_paid AS "totalPaid",
        created_at AS "createdAt"
    `;
    
    const values = [
      data.fullName,
      data.phone,
      data.email || null,
      data.notes || null
    ];
    
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  // ============================================================
  // UPDATE CUSTOMER
  // ============================================================
  async updateCustomer(id, data) {
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (data.fullName !== undefined) {
      updates.push(`full_name = $${paramCount++}`);
      values.push(data.fullName);
    }
    if (data.phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(data.phone);
    }
    if (data.email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(data.email);
    }
    if (data.notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(data.notes);
    }
    if (data.isVip !== undefined) {
      updates.push(`is_vip = $${paramCount++}`);
      values.push(data.isVip);
    }
    
    if (updates.length === 0) {
      return this.getCustomerDetails(id);
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    
    const query = `
      UPDATE customers
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING 
        id,
        full_name AS "fullName",
        phone,
        email,
        notes,
        total_visits AS "totalVisits",
        total_spent AS "totalSpent",
        total_paid AS "totalPaid",
        last_visit_date AS "lastVisitDate",
        created_at AS "createdAt"
    `;
    
    values.push(id);
    const { rows } = await db.query(query, values);
    return rows[0] || null;
  }

  // ============================================================
  // GET CUSTOMER STATS
  // ============================================================
  async getCustomerStats(id) {
    const query = `
      SELECT 
        COUNT(DISTINCT a.id) AS "totalAppointments",
        COALESCE(SUM(a.total_price), 0) AS "totalSpent",
        COALESCE(SUM(a.paid_amount), 0) AS "totalPaid",
        COALESCE(SUM(a.total_price - a.paid_amount), 0) AS "balanceDue",
        COUNT(DISTINCT cp.id) AS "activePackages",
        MAX(a.appointment_date) AS "lastVisitDate",
        CURRENT_DATE - COALESCE(MAX(a.appointment_date), CURRENT_DATE) AS "daysSinceLastVisit"
      FROM customers c
      LEFT JOIN appointments a ON a.customer_id = c.id 
        AND a.status NOT IN ('cancelled')
      LEFT JOIN customer_packages cp ON cp.customer_id = c.id 
        AND cp.remaining_sessions > 0
        AND (cp.expiry_date IS NULL OR cp.expiry_date >= CURRENT_DATE)
      WHERE c.id = $1
      GROUP BY c.id;
    `;
    
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }

  // ============================================================
  // FIND CUSTOMER BY PHONE
  // ============================================================
  async findCustomerByPhone(phone) {
    const { rows } = await db.query(
      `SELECT id, full_name, phone, email FROM customers WHERE phone = $1`,
      [phone]
    );
    return rows[0] || null;
  }

  // ============================================================
  // FIND CUSTOMER BY EMAIL
  // ============================================================
  async findCustomerByEmail(email) {
    if (!email) return null;
    const { rows } = await db.query(
      `SELECT id, full_name, phone, email FROM customers WHERE email = $1`,
      [email]
    );
    return rows[0] || null;
  }

  // ============================================================
  // DELETE CUSTOMER
  // ============================================================
  async deleteCustomer(id) {
    const checkQuery = `
      SELECT COUNT(*) as count 
      FROM appointments 
      WHERE customer_id = $1
    `;
    const { rows: checkRows } = await db.query(checkQuery, [id]);
    
    if (parseInt(checkRows[0].count) > 0) {
      throw new Error('Cannot delete customer with existing appointments');
    }
    
    const query = `DELETE FROM customers WHERE id = $1 RETURNING id`;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }

  // ============================================================
  // GET TOP CUSTOMERS
  // ============================================================
  async getTopCustomers(limit = 10) {
    const query = `
      SELECT 
        id,
        full_name AS "fullName",
        phone,
        total_visits AS "totalVisits",
        total_spent AS "totalSpent",
        total_paid AS "totalPaid",
        last_visit_date AS "lastVisitDate"
      FROM customers
      WHERE total_spent > 0
      ORDER BY total_spent DESC
      LIMIT $1
    `;
    
    const { rows } = await db.query(query, [limit]);
    return rows;
  }

  // ============================================================
  // GET RECENT CUSTOMERS
  // ============================================================
  async getRecentCustomers(limit = 10) {
    const query = `
      SELECT 
        id,
        full_name AS "fullName",
        phone,
        email,
        total_visits AS "totalVisits",
        total_spent AS "totalSpent",
        created_at AS "createdAt"
      FROM customers
      ORDER BY created_at DESC
      LIMIT $1
    `;
    
    const { rows } = await db.query(query, [limit]);
    return rows;
  }

  // ============================================================
  // ASSIGN PACKAGE TO CUSTOMER
  // ============================================================
  async assignPackageToCustomer(data) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');

      // Get package details
      const packageResult = await client.query(
        `SELECT 
          p.id, 
          p.name, 
          p.total_price, 
          p.discount_percentage,
          COALESCE(SUM(ps.quantity), 1) as total_sessions
         FROM packages p
         LEFT JOIN package_services ps ON ps.package_id = p.id
         WHERE p.id = $1 AND p.is_active = true
         GROUP BY p.id`,
        [data.packageId]
      );
      
      const pkg = packageResult.rows[0];
      if (!pkg) {
        throw new Error('Package not found or inactive');
      }

      // Check if customer already has this package with remaining sessions
      const existingCheck = await client.query(
        `SELECT id, remaining_sessions 
         FROM customer_packages 
         WHERE customer_id = $1 
           AND package_id = $2 
           AND remaining_sessions > 0
           AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)`,
        [data.customerId, data.packageId]
      );

      if (existingCheck.rows.length > 0) {
        // Allow assignment anyway, just warn or update existing
        // Or you can throw an error if you don't want duplicates
        // For now, let's allow it but update the existing package
        const existing = existingCheck.rows[0];
        // Option 1: Update existing package
        // Option 2: Throw error
        // Let's throw error for now to keep it clean
        throw new Error('Customer already has an active instance of this package');
      }

      // Calculate expiry date
      const expiryDate = data.expiryDate 
        ? data.expiryDate 
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Insert into customer_packages
      const insertQuery = `
        INSERT INTO customer_packages (
          customer_id,
          package_id,
          purchase_date,
          expiry_date,
          total_sessions,
          used_sessions,
          remaining_sessions,
          total_price,
          custom_price,
          payment_status,
          payment_method,
          notes,
          created_at,
          updated_at
        )
        VALUES ($1, $2, CURRENT_DATE, $3, $4, 0, $4, $5, $6, 'paid', $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `;

      const values = [
        data.customerId,
        data.packageId,
        expiryDate,
        pkg.total_sessions,
        pkg.total_price,
        data.customPrice || null,
        data.paymentMethod || 'cash',
        data.notes || null,
      ];

      const { rows } = await client.query(insertQuery, values);
      const customerPackageId = rows[0].id;

      await client.query('COMMIT');

      const result = await this.getCustomerPackageById(customerPackageId);
      return result;

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
  async getCustomerPackageById(id) {
    const query = `
      SELECT 
        cp.id,
        cp.customer_id AS "customerId",
        cp.package_id AS "packageId",
        cp.purchase_date AS "purchaseDate",
        cp.expiry_date AS "expiryDate",
        cp.total_sessions AS "totalSessions",
        cp.used_sessions AS "usedSessions",
        cp.remaining_sessions AS "remainingSessions",
        cp.total_price AS "totalPrice",
        cp.custom_price AS "customPrice",
        COALESCE(cp.custom_price, cp.total_price) AS "effectivePrice",
        cp.payment_status AS "paymentStatus",
        cp.payment_method AS "paymentMethod",
        cp.notes,
        p.name AS "packageName",
        p.description AS "packageDescription",
        p.discount_percentage AS "discountPercentage",
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
      WHERE cp.id = $1
      GROUP BY cp.id, p.id
    `;
    
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }

  // ============================================================
  // UPDATE CUSTOMER PACKAGE
  // ============================================================
  async updateCustomerPackage(id, data) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');

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
      if (data.paymentMethod !== undefined) {
        updates.push(`payment_method = $${paramCount++}`);
        values.push(data.paymentMethod);
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
        updates.push(`remaining_sessions = total_sessions - used_sessions`);
      }

      if (updates.length === 0) {
        return this.getCustomerPackageById(id);
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);

      const query = `
        UPDATE customer_packages
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id
      `;
      
      values.push(id);
      const { rows } = await client.query(query, values);
      
      if (rows.length === 0) {
        throw new Error('Customer package not found');
      }

      await client.query('COMMIT');
      return this.getCustomerPackageById(id);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ============================================================
  // USE PACKAGE SESSION
  // ============================================================
  async usePackageSession(customerPackageId) {
    const query = `
      UPDATE customer_packages
      SET 
        used_sessions = used_sessions + 1,
        remaining_sessions = remaining_sessions - 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
        AND remaining_sessions > 0
        AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)
      RETURNING id, used_sessions, remaining_sessions
    `;
    
    const { rows } = await db.query(query, [customerPackageId]);
    if (rows.length === 0) {
      throw new Error('No available sessions in this package');
    }
    return rows[0];
  }

  // ============================================================
  // UPDATE CUSTOMER STATS
  // ============================================================
  async updateCustomerStats(customerId) {
    const query = `
      WITH customer_stats AS (
        SELECT 
          COUNT(*) AS total_visits,
          COALESCE(SUM(total_price), 0) AS total_spent,
          COALESCE(SUM(paid_amount), 0) AS total_paid,
          MAX(appointment_date) AS last_visit_date
        FROM appointments
        WHERE customer_id = $1
          AND status IN ('scheduled', 'confirmed', 'in_progress', 'completed')
      )
      UPDATE customers
      SET 
        total_visits = cs.total_visits,
        total_spent = cs.total_spent,
        total_paid = cs.total_paid,
        last_visit_date = cs.last_visit_date,
        updated_at = CURRENT_TIMESTAMP
      FROM customer_stats cs
      WHERE customers.id = $1
      RETURNING 
        customers.id,
        customers.total_visits AS "totalVisits",
        customers.total_spent AS "totalSpent",
        customers.total_paid AS "totalPaid",
        customers.last_visit_date AS "lastVisitDate"
    `;
    
    const { rows } = await db.query(query, [customerId]);
    return rows[0] || null;
  }

  // ============================================================
  // UPDATE CUSTOMER STATS AFTER PACKAGE ASSIGNMENT
  // ============================================================
  async updateCustomerStatsAfterPackageAssignment(customerId) {
    const query = `
      WITH customer_stats AS (
        SELECT 
          COALESCE(
            (SELECT COUNT(*) FROM appointments 
             WHERE customer_id = $1 
               AND status IN ('scheduled', 'confirmed', 'in_progress', 'completed')),
            0
          ) AS visits,
          
          COALESCE(
            (SELECT SUM(total_price) FROM appointments 
             WHERE customer_id = $1 
               AND status IN ('scheduled', 'confirmed', 'in_progress', 'completed')),
            0
          ) AS spent,
          
          COALESCE(
            (SELECT SUM(paid_amount) FROM appointments 
             WHERE customer_id = $1 
               AND status IN ('scheduled', 'confirmed', 'in_progress', 'completed')),
            0
          ) AS paid,
          
          COALESCE(
            (SELECT MAX(appointment_date) FROM appointments 
             WHERE customer_id = $1 
               AND status IN ('scheduled', 'confirmed', 'in_progress', 'completed')),
            NULL
          ) AS last_visit,
          
          COALESCE(
            (SELECT SUM(total_price) FROM customer_packages 
             WHERE customer_id = $1 
               AND payment_status = 'paid'),
            0
          ) AS package_spent
      )
      UPDATE customers
      SET 
        total_visits = cs.visits,
        total_spent = cs.spent + cs.package_spent,
        total_paid = cs.paid + cs.package_spent,
        last_visit_date = cs.last_visit,
        updated_at = CURRENT_TIMESTAMP
      FROM customer_stats cs
      WHERE customers.id = $1
      RETURNING 
        customers.id,
        customers.total_visits AS "totalVisits",
        customers.total_spent AS "totalSpent",
        customers.total_paid AS "totalPaid",
        customers.last_visit_date AS "lastVisitDate"
    `;
    
    const { rows } = await db.query(query, [customerId]);
    return rows[0] || null;
  }
}

module.exports = new CustomerRepository();