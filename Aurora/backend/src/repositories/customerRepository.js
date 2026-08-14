const db = require('../config/db');

class CustomerRepository {
  // ============================================================
  // GET ALL CUSTOMERS (with search & tenant filter)
  // ============================================================
  async getCustomers(tenantId, search = '') {
    let query = `
      SELECT 
        c.id,
        c.tenant_id AS "tenantId",
        u.full_name AS "fullName",
        u.phone,
        u.email,
        u.birthday,
        u.gender,
        u.profile_image_url AS "profileImageUrl",
        u.preferred_language AS "preferredLanguage",
        c.notes,
        c.total_visits AS "totalVisits",
        c.total_spent AS "totalSpent",
        c.total_paid AS "totalPaid",
        c.last_visit_date AS "lastVisitDate",
        c.created_at AS "createdAt",
        s.full_name AS "preferredStaffName"
      FROM customers c
      INNER JOIN users u ON c.user_id = u.id
      LEFT JOIN staff st ON c.preferred_staff_id = st.id
      LEFT JOIN users s ON st.user_id = s.id
      WHERE c.tenant_id = $1
    `;

    const values = [tenantId];

    if (search && search.trim()) {
      query += `
        AND (
          u.full_name ILIKE $2 
          OR u.phone ILIKE $2 
          OR u.email ILIKE $2
        )
      `;
      values.push(`%${search.trim()}%`);
    }

    query += ` ORDER BY u.full_name ASC`;

    const { rows } = await db.query(query, values);
    return rows;
  }

  // ============================================================
  // GET CUSTOMER BY ID (with full details)
  // Accepts optional client for transaction support
  // ============================================================
  async getCustomerDetails(tenantId, id, client = db) {
    const query = `
      SELECT 
        c.id,
        c.tenant_id AS "tenantId",
        u.id AS "userId",
        u.full_name AS "fullName",
        u.phone,
        u.email,
        u.birthday,
        u.gender,
        u.profile_image_url AS "profileImageUrl",
        u.is_active AS "isActive",
        c.preferred_staff_id AS "preferredStaffId",
        s.full_name AS "preferredStaffName",
        c.total_visits AS "totalVisits",
        c.total_spent AS "totalSpent",
        c.total_paid AS "totalPaid",
        c.last_visit_date AS "lastVisitDate",
        c.created_at AS "createdAt"
      FROM customers c
      INNER JOIN users u ON c.user_id = u.id
      LEFT JOIN staff st ON c.preferred_staff_id = st.id
      LEFT JOIN users s ON st.user_id = s.id
      WHERE c.id = $1 AND c.tenant_id = $2
    `;

    const { rows } = await client.query(query, [id, tenantId]);
    return rows[0] || null;
  }

  // ============================================================
  // GET CUSTOMER HISTORY (appointments)
  // ============================================================
  async getCustomerHistory(tenantId, customerId) {
    const query = `
      SELECT 
        a.id,
        a.appointment_date AS "appointmentDate",
        a.start_time AS "startTime",
        a.end_time AS "endTime",
        a.total_price AS "amount",
        a.paid_amount AS "paidAmount",
        a.payment_status AS "paymentStatus",
        a.status AS "appointmentStatus",
        a.is_package_appointment AS "isPackageAppointment",
        a.customer_package_id AS "customerPackageId",
        a.booking_source AS "bookingSource",
        a.confirmation_status AS "confirmationStatus",
        a.customer_notes AS "customerNotes",
        u.full_name AS "staffName",
        p.name AS "packageName",
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'serviceId', svc.id,
            'serviceName', svc.name,
            'price', aps.service_price,
            'duration', svc.estimated_duration_minutes,
            'isPackage', aps.is_package_usage
          )) FILTER (WHERE svc.id IS NOT NULL),
          '[]'::json
        ) AS "services"
      FROM appointments a
      LEFT JOIN staff st ON a.staff_id = st.id
      LEFT JOIN users u ON st.user_id = u.id
      LEFT JOIN appointment_services aps ON aps.appointment_id = a.id
      LEFT JOIN services svc ON aps.service_id = svc.id
      LEFT JOIN customer_packages cp ON cp.id = a.customer_package_id
      LEFT JOIN packages p ON p.id = cp.package_id
      WHERE a.customer_id = $1 
        AND a.tenant_id = $2
        AND a.status NOT IN ('cancelled')
      GROUP BY a.id, u.full_name, p.name
      ORDER BY a.appointment_date DESC, a.start_time DESC
      LIMIT 20;
    `;

    const { rows } = await db.query(query, [customerId, tenantId]);

    return rows.map(row => ({
      ...row,
      serviceName: row.services && row.services.length > 0
        ? row.services.map(s => s.serviceName).join(', ')
        : 'Service',
    }));
  }

  // ============================================================
  // CREATE CUSTOMER (full creation with user record)
  // ============================================================
  async createCustomer(tenantId, data, createdBy = null) {
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      // 1. Create user record
      const userQuery = `
        INSERT INTO users (
          tenant_id,
          full_name,
          phone,
          email,
          birthday,
          gender,
          preferred_language,
          system_role,
          otp_verified,
          is_active,
          created_by,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'Customer', $8, true, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `;

      const userValues = [
        tenantId,
        data.fullName,
        data.phone,
        data.email || null,
        data.birthday || null,
        data.gender || null,
        data.preferredLanguage || null,
        data.otpVerified || false,
        createdBy
      ];

      const { rows: userRows } = await client.query(userQuery, userValues);
      const userId = userRows[0].id;

      // 2. Create customer record
      const customerQuery = `
        INSERT INTO customers (
          tenant_id,
          user_id,
          preferred_staff_id,
          notes,
          total_visits,
          total_spent,
          total_paid,
          loyalty_points,
          marketing_opt_in,
          whatsapp_opt_in,
          email_opt_in,
          source,
          created_by,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, 0, 0, 0, 0, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING 
          id,
          tenant_id AS "tenantId",
          user_id AS "userId",
          preferred_staff_id AS "preferredStaffId",
          notes,
          total_visits AS "totalVisits",
          total_spent AS "totalSpent",
          total_paid AS "totalPaid",
          loyalty_points AS "loyaltyPoints",
          last_visit_date AS "lastVisitDate",
          marketing_opt_in AS "marketingOptIn",
          whatsapp_opt_in AS "whatsappOptIn",
          email_opt_in AS "emailOptIn",
          source,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `;

      const customerValues = [
        tenantId,
        userId,
        data.preferredStaffId || null,
        data.notes || null,
        data.marketingOptIn || false,
        data.whatsappOptIn || false,
        data.emailOptIn || false,
        data.source || null,
        createdBy
      ];

      const { rows: customerRows } = await client.query(customerQuery, customerValues);

      await client.query('COMMIT');

      return this.getCustomerDetails(tenantId, customerRows[0].id);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ============================================================
  // CREATE BASIC CUSTOMER (minimal: name + phone, used by appointment service)
  // ============================================================
  async createBasicCustomer(tenantId, fullName, phone, createdBy, client = db) {
    // 1. Create user record
    const userQuery = `
      INSERT INTO users (
        tenant_id,
        full_name,
        phone,
        system_role,
        is_active,
        created_by,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, 'Customer', true, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id
    `;
    const { rows: userRows } = await client.query(userQuery, [tenantId, fullName, phone, createdBy]);
    const userId = userRows[0].id;

    // 2. Create customer record
    const customerQuery = `
      INSERT INTO customers (
        tenant_id,
        user_id,
        total_visits,
        total_spent,
        total_paid,
        loyalty_points,
        created_by,
        created_at,
        updated_at
      )
      VALUES ($1, $2, 0, 0, 0, 0, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id
    `;
    const { rows: customerRows } = await client.query(customerQuery, [tenantId, userId, createdBy]);
    return customerRows[0].id;
  }

  // ============================================================
  // UPDATE CUSTOMER
  // ============================================================
  async updateCustomer(tenantId, id, data, updatedBy = null) {
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      const customer = await this.getCustomerDetails(tenantId, id);
      if (!customer) {
        throw new Error('Customer not found');
      }

      const userUpdates = [];
      const userValues = [];
      let userParamCount = 1;

      if (data.fullName !== undefined) {
        userUpdates.push(`full_name = $${userParamCount++}`);
        userValues.push(data.fullName);
      }
      if (data.phone !== undefined) {
        userUpdates.push(`phone = $${userParamCount++}`);
        userValues.push(data.phone);
      }
      if (data.email !== undefined) {
        userUpdates.push(`email = $${userParamCount++}`);
        userValues.push(data.email);
      }
      if (data.birthday !== undefined) {
        userUpdates.push(`birthday = $${userParamCount++}`);
        userValues.push(data.birthday);
      }
      if (data.gender !== undefined) {
        userUpdates.push(`gender = $${userParamCount++}`);
        userValues.push(data.gender);
      }
      if (data.preferredLanguage !== undefined) {
        userUpdates.push(`preferred_language = $${userParamCount++}`);
        userValues.push(data.preferredLanguage);
      }
      if (data.profileImageUrl !== undefined) {
        userUpdates.push(`profile_image_url = $${userParamCount++}`);
        userValues.push(data.profileImageUrl);
      }
      if (data.isActive !== undefined) {
        userUpdates.push(`is_active = $${userParamCount++}`);
        userValues.push(data.isActive);
      }

      if (userUpdates.length > 0) {
        userUpdates.push(`updated_at = CURRENT_TIMESTAMP`);
        userUpdates.push(`updated_by = $${userParamCount++}`);
        userValues.push(updatedBy);

        const userQuery = `
          UPDATE users
          SET ${userUpdates.join(', ')}
          WHERE id = $${userParamCount}
        `;
        userValues.push(customer.userId);
        await client.query(userQuery, userValues);
      }

      const customerUpdates = [];
      const customerValues = [];
      let customerParamCount = 1;

      if (data.preferredStaffId !== undefined) {
        customerUpdates.push(`preferred_staff_id = $${customerParamCount++}`);
        customerValues.push(data.preferredStaffId);
      }
      if (data.notes !== undefined) {
        customerUpdates.push(`notes = $${customerParamCount++}`);
        customerValues.push(data.notes);
      }
      if (data.marketingOptIn !== undefined) {
        customerUpdates.push(`marketing_opt_in = $${customerParamCount++}`);
        customerValues.push(data.marketingOptIn);
      }
      if (data.whatsappOptIn !== undefined) {
        customerUpdates.push(`whatsapp_opt_in = $${customerParamCount++}`);
        customerValues.push(data.whatsappOptIn);
      }
      if (data.emailOptIn !== undefined) {
        customerUpdates.push(`email_opt_in = $${customerParamCount++}`);
        customerValues.push(data.emailOptIn);
      }
      if (data.source !== undefined) {
        customerUpdates.push(`source = $${customerParamCount++}`);
        customerValues.push(data.source);
      }

      if (customerUpdates.length > 0) {
        customerUpdates.push(`updated_at = CURRENT_TIMESTAMP`);
        customerUpdates.push(`updated_by = $${customerParamCount++}`);
        customerValues.push(updatedBy);

        const customerQuery = `
          UPDATE customers
          SET ${customerUpdates.join(', ')}
          WHERE id = $${customerParamCount} AND tenant_id = $${customerParamCount + 1}
        `;
        customerValues.push(id);
        customerValues.push(tenantId);
        await client.query(customerQuery, customerValues);
      }

      await client.query('COMMIT');

      return this.getCustomerDetails(tenantId, id);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ============================================================
  // GET CUSTOMER STATS
  // ============================================================
  async getCustomerStats(tenantId, id) {
    const query = `
      SELECT 
        COUNT(DISTINCT a.id) AS "totalAppointments",
        COALESCE(SUM(a.total_price), 0) AS "totalSpent",
        COALESCE(SUM(a.paid_amount), 0) AS "totalPaid",
        COALESCE(SUM(a.total_price - a.paid_amount), 0) AS "balanceDue",
        COUNT(DISTINCT cp.id) AS "activePackages",
        TO_CHAR(MAX(a.appointment_date), 'YYYY-MM-DD') AS "lastVisitDate",
        CURRENT_DATE - COALESCE(MAX(a.appointment_date), CURRENT_DATE) AS "daysSinceLastVisit",
        COALESCE(SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END), 0) AS "completedAppointments",
        COALESCE(SUM(CASE WHEN a.status = 'scheduled' THEN 1 ELSE 0 END), 0) AS "upcomingAppointments",
        COALESCE(SUM(CASE WHEN a.status = 'in_progress' THEN 1 ELSE 0 END), 0) AS "inProgressAppointments",
        c.loyalty_points AS "loyaltyPoints"
      FROM customers c
      LEFT JOIN appointments a ON a.customer_id = c.id 
        AND a.tenant_id = c.tenant_id
        AND a.status NOT IN ('cancelled')
      LEFT JOIN customer_packages cp ON cp.customer_id = c.id 
        AND cp.tenant_id = c.tenant_id
        AND cp.total_sessions - cp.used_sessions > 0
        AND (cp.expiry_date IS NULL OR cp.expiry_date >= CURRENT_DATE)
      WHERE c.id = $1 AND c.tenant_id = $2
      GROUP BY c.id, c.loyalty_points;
    `;

    const { rows } = await db.query(query, [id, tenantId]);
    return rows[0] || null;
  }

  // ============================================================
  // FIND CUSTOMER BY PHONE
  // Accepts optional client for transaction support
  // ============================================================
  async findCustomerByPhone(tenantId, phone, client = db) {
    const query = `
      SELECT 
        c.id,
        c.tenant_id AS "tenantId",
        u.full_name AS "fullName",
        u.phone,
        u.email,
        u.birthday,
        u.gender,
        c.notes,
        c.total_visits AS "totalVisits",
        c.loyalty_points AS "loyaltyPoints"
      FROM customers c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.tenant_id = $1 AND u.phone = $2
    `;
    const { rows } = await client.query(query, [tenantId, phone]);
    return rows[0] || null;
  }

  // ============================================================
  // FIND CUSTOMER BY EMAIL
  // ============================================================
  async findCustomerByEmail(tenantId, email) {
    if (!email) return null;
    const query = `
      SELECT 
        c.id,
        c.tenant_id AS "tenantId",
        u.full_name AS "fullName",
        u.phone,
        u.email,
        u.birthday,
        u.gender,
        c.notes,
        c.total_visits AS "totalVisits",
        c.loyalty_points AS "loyaltyPoints"
      FROM customers c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.tenant_id = $1 AND u.email = $2
    `;
    const { rows } = await db.query(query, [tenantId, email]);
    return rows[0] || null;
  }

  // ============================================================
  // DELETE CUSTOMER (soft delete - deactivate user)
  // ============================================================
  async deleteCustomer(tenantId, id, updatedBy = null) {
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      const checkQuery = `
        SELECT COUNT(*) as count 
        FROM appointments 
        WHERE customer_id = $1 AND tenant_id = $2
          AND status NOT IN ('cancelled')
      `;
      const { rows: checkRows } = await client.query(checkQuery, [id, tenantId]);

      if (parseInt(checkRows[0].count) > 0) {
        throw new Error('Cannot delete customer with active appointments');
      }

      const customer = await this.getCustomerDetails(tenantId, id);
      if (!customer) {
        throw new Error('Customer not found');
      }

      const deactivateQuery = `
        UPDATE users
        SET 
          is_active = false, 
          updated_at = CURRENT_TIMESTAMP,
          updated_by = $1
        WHERE id = $2
        RETURNING id
      `;
      await client.query(deactivateQuery, [updatedBy, customer.userId]);

      await client.query(
        `UPDATE customers 
         SET updated_at = CURRENT_TIMESTAMP, updated_by = $1 
         WHERE id = $2 AND tenant_id = $3`,
        [updatedBy, id, tenantId]
      );

      await client.query('COMMIT');
      return { id, userId: customer.userId, deleted: true };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ============================================================
  // GET TOP CUSTOMERS
  // ============================================================
  async getTopCustomers(tenantId, limit = 10) {
    const query = `
      SELECT 
        c.id,
        u.full_name AS "fullName",
        u.phone,
        c.total_visits AS "totalVisits",
        c.total_spent AS "totalSpent",
        c.total_paid AS "totalPaid",
        c.loyalty_points AS "loyaltyPoints",
        TO_CHAR(c.last_visit_date, 'YYYY-MM-DD') AS "lastVisitDate"
      FROM customers c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.tenant_id = $1 AND c.total_spent > 0
      ORDER BY c.total_spent DESC
      LIMIT $2
    `;

    const { rows } = await db.query(query, [tenantId, limit]);
    return rows;
  }

  // ============================================================
  // GET RECENT CUSTOMERS
  // ============================================================
  async getRecentCustomers(tenantId, limit = 10) {
    const query = `
      SELECT 
        c.id,
        u.full_name AS "fullName",
        u.phone,
        u.email,
        c.total_visits AS "totalVisits",
        c.total_spent AS "totalSpent",
        c.loyalty_points AS "loyaltyPoints",
        c.created_at AS "createdAt"
      FROM customers c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.tenant_id = $1
      ORDER BY c.created_at DESC
      LIMIT $2
    `;

    const { rows } = await db.query(query, [tenantId, limit]);
    return rows;
  }

  // ============================================================
  // UPDATE CUSTOMER STATS (shared helper)
  // ============================================================

  async recalculateCustomerStats(tenantId, customerId, client = db) {
    const query = `
    WITH
    appointment_stats AS (
      SELECT
        COUNT(*) AS visits,
        COALESCE(SUM(total_price), 0) AS spent,
        COALESCE(SUM(paid_amount), 0) AS paid,
        MAX(appointment_date) AS last_visit
      FROM appointments
      WHERE customer_id = $1
        AND tenant_id = $2
        AND status NOT IN ('cancelled')
    ),
    package_stats AS (
      SELECT
        COALESCE(
          SUM(COALESCE(custom_price, total_price)),
          0
        ) AS package_spent,
        COALESCE(
          SUM(
            CASE WHEN payment_status = 'paid'
              THEN COALESCE(custom_price, total_price)
              ELSE 0
            END
          ),
          0
        ) AS package_paid
      FROM customer_packages
      WHERE customer_id = $1
        AND tenant_id = $2
        -- include all packages, even expired, for lifetime spent
    )
    UPDATE customers
    SET
      total_visits = COALESCE(app.visits, 0),
      total_spent = COALESCE(app.spent, 0) + COALESCE(pkg.package_spent, 0),
      total_paid = COALESCE(app.paid, 0) + COALESCE(pkg.package_paid, 0),
      last_visit_date = app.last_visit,
      updated_at = CURRENT_TIMESTAMP
    FROM appointment_stats app, package_stats pkg
    WHERE customers.id = $1 AND customers.tenant_id = $2
    RETURNING
      customers.id,
      customers.total_visits AS "totalVisits",
      customers.total_spent AS "totalSpent",
      customers.total_paid AS "totalPaid",
      customers.last_visit_date AS "lastVisitDate"
  `;

    const { rows } = await client.query(query, [customerId, tenantId]);
    return rows[0] || null;
  }

}

module.exports = new CustomerRepository();