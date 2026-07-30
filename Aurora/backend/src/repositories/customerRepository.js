// repositories/customerRepository.js
const db = require('../config/db');
const packageRepository = require('./packageRepository');


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
        c.loyalty_points AS "loyaltyPoints",
        c.last_visit_date AS "lastVisitDate",
        c.marketing_opt_in AS "marketingOptIn",
        c.whatsapp_opt_in AS "whatsappOptIn",
        c.email_opt_in AS "emailOptIn",
        c.source,
        c.created_at AS "createdAt",
        c.updated_at AS "updatedAt",
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
  // ============================================================
  async getCustomerDetails(tenantId, id) {
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
        u.preferred_language AS "preferredLanguage",
        u.otp_verified AS "otpVerified",
        u.is_active AS "isActive",
        u.last_login_at AS "lastLoginAt",
        c.preferred_staff_id AS "preferredStaffId",
        s.full_name AS "preferredStaffName",
        c.notes,
        c.total_visits AS "totalVisits",
        c.total_spent AS "totalSpent",
        c.total_paid AS "totalPaid",
        c.loyalty_points AS "loyaltyPoints",
        c.last_visit_date AS "lastVisitDate",
        c.marketing_opt_in AS "marketingOptIn",
        c.whatsapp_opt_in AS "whatsappOptIn",
        c.email_opt_in AS "emailOptIn",
        c.source,
        c.created_at AS "createdAt",
        c.updated_at AS "updatedAt"
      FROM customers c
      INNER JOIN users u ON c.user_id = u.id
      LEFT JOIN staff st ON c.preferred_staff_id = st.id
      LEFT JOIN users s ON st.user_id = s.id
      WHERE c.id = $1 AND c.tenant_id = $2
    `;
    
    const { rows } = await db.query(query, [id, tenantId]);
    return rows[0] || null;
  }

  // ============================================================
  // GET CUSTOMER HISTORY
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
            'duration', aps.estimated_duration_minutes,
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
  // GET CUSTOMER PACKAGES
  // ============================================================
  // repositories/customerRepository.js - updated getCustomerPackages

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
  // CREATE CUSTOMER (with user creation)
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
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'customer', $8, true, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
      
      // Get full customer details
      return this.getCustomerDetails(tenantId, customerRows[0].id);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ============================================================
  // UPDATE CUSTOMER
  // ============================================================
  async updateCustomer(tenantId, id, data, updatedBy = null) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');

      // Get customer to get user_id
      const customer = await this.getCustomerDetails(tenantId, id);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Update user table
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

      // Update customer table
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
      
      // Return updated customer
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
      -- Fix: subtract dates directly to get days difference
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
  // ============================================================
  async findCustomerByPhone(tenantId, phone) {
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
    const { rows } = await db.query(query, [tenantId, phone]);
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

      // Check if customer has appointments
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

      // Get user_id
      const customer = await this.getCustomerDetails(tenantId, id);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Soft delete - deactivate user
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

      // Also update customer to inactive
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
  // ASSIGN PACKAGE TO CUSTOMER
  // ============================================================
  async assignPackageToCustomer(tenantId, data, createdBy = null) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // 1. Get package details (summary)
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

      // 5. ⭐ Get the services (from template – will be replaced later for custom packages)
      // For now, we fetch from package_services.
      // Later, for custom packages, you'll get 'services' from the request body.
      const services = await packageRepository.getPackageServiceDefinitions(client, data.packageId);

      // 6. ⭐ Create the usage snapshot
      await this._createCustomerPackageServices(
        client,
        tenantId,
        customerPackageId,
        services,
        createdBy
      );

      // 7. Update stats if paid
      if (data.paymentStatus === 'paid') {
        await this.updateCustomerStatsAfterPackageAssignment(tenantId, data.customerId);
      }

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
  async updateCustomerPackage(tenantId, id, data, updatedBy = null) {
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

      await client.query('COMMIT');
      return this.getCustomerPackageById(tenantId, id);

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
  // UPDATE CUSTOMER STATS
  // ============================================================
  async updateCustomerStats(tenantId, customerId) {
    const query = `
      WITH customer_stats AS (
        SELECT 
          COUNT(*) AS total_visits,
          COALESCE(SUM(total_price), 0) AS total_spent,
          COALESCE(SUM(paid_amount), 0) AS total_paid,
          MAX(appointment_date) AS last_visit_date
        FROM appointments
        WHERE customer_id = $1
          AND tenant_id = $2
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
      WHERE customers.id = $1 AND customers.tenant_id = $2
      RETURNING 
        customers.id,
        customers.total_visits AS "totalVisits",
        customers.total_spent AS "totalSpent",
        customers.total_paid AS "totalPaid",
        customers.last_visit_date AS "lastVisitDate"
    `;
    
    const { rows } = await db.query(query, [customerId, tenantId]);
    return rows[0] || null;
  }

  // ============================================================
  // UPDATE CUSTOMER STATS AFTER PACKAGE ASSIGNMENT
  // ============================================================
  async updateCustomerStatsAfterPackageAssignment(tenantId, customerId) {
    const query = `
      WITH customer_stats AS (
        SELECT 
          COALESCE(
            (SELECT COUNT(*) FROM appointments 
             WHERE customer_id = $1 
               AND tenant_id = $2
               AND status IN ('scheduled', 'confirmed', 'in_progress', 'completed')),
            0
          ) AS visits,
          
          COALESCE(
            (SELECT SUM(total_price) FROM appointments 
             WHERE customer_id = $1 
               AND tenant_id = $2
               AND status IN ('scheduled', 'confirmed', 'in_progress', 'completed')),
            0
          ) AS spent,
          
          COALESCE(
            (SELECT SUM(paid_amount) FROM appointments 
             WHERE customer_id = $1 
               AND tenant_id = $2
               AND status IN ('scheduled', 'confirmed', 'in_progress', 'completed')),
            0
          ) AS paid,
          
          COALESCE(
            (SELECT MAX(appointment_date) FROM appointments 
             WHERE customer_id = $1 
               AND tenant_id = $2
               AND status IN ('scheduled', 'confirmed', 'in_progress', 'completed')),
            NULL
          ) AS last_visit,
          
          COALESCE(
            (SELECT SUM(total_price) FROM customer_packages 
             WHERE customer_id = $1 
               AND tenant_id = $2
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
      WHERE customers.id = $1 AND customers.tenant_id = $2
      RETURNING 
        customers.id,
        customers.total_visits AS "totalVisits",
        customers.total_spent AS "totalSpent",
        customers.total_paid AS "totalPaid",
        customers.last_visit_date AS "lastVisitDate"
    `;
    
    const { rows } = await db.query(query, [customerId, tenantId]);
    return rows[0] || null;
  }

  // ============================================================
  // GET CUSTOMERS BY STAFF (for staff's customers)
  // ============================================================
  async getCustomersByStaff(tenantId, staffId, search = '') {
    let query = `
      SELECT 
        c.id,
        u.full_name AS "fullName",
        u.phone,
        u.email,
        c.total_visits AS "totalVisits",
        c.total_spent AS "totalSpent",
        c.last_visit_date AS "lastVisitDate",
        c.loyalty_points AS "loyaltyPoints"
      FROM customers c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.tenant_id = $1 
        AND c.preferred_staff_id = $2
    `;
    
    const values = [tenantId, staffId];
    
    if (search && search.trim()) {
      query += `
        AND (u.full_name ILIKE $3 OR u.phone ILIKE $3 OR u.email ILIKE $3)
      `;
      values.push(`%${search.trim()}%`);
    }
    
    query += ` ORDER BY u.full_name ASC`;
    
    const { rows } = await db.query(query, values);
    return rows;
  }

  // ============================================================
  // UPDATE LOYALTY POINTS
  // ============================================================
  async updateLoyaltyPoints(tenantId, customerId, points, updatedBy = null) {
    const query = `
      UPDATE customers
      SET 
        loyalty_points = loyalty_points + $1,
        updated_at = CURRENT_TIMESTAMP,
        updated_by = $2
      WHERE id = $3 AND tenant_id = $4
      RETURNING 
        id,
        loyalty_points AS "loyaltyPoints"
    `;
    
    const { rows } = await db.query(query, [points, updatedBy, customerId, tenantId]);
    return rows[0] || null;
  }

  // ============================================================
  // GET CUSTOMERS BY LOYALTY POINTS (for rewards program)
  // ============================================================
  async getCustomersByLoyaltyPoints(tenantId, minPoints = 0, limit = 50) {
    const query = `
      SELECT 
        c.id,
        u.full_name AS "fullName",
        u.phone,
        u.email,
        c.loyalty_points AS "loyaltyPoints",
        c.total_spent AS "totalSpent",
        c.total_visits AS "totalVisits"
      FROM customers c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.tenant_id = $1 AND c.loyalty_points >= $2
      ORDER BY c.loyalty_points DESC
      LIMIT $3
    `;
    
    const { rows } = await db.query(query, [tenantId, minPoints, limit]);
    return rows;
  }

  // ============================================================
  // BULK UPDATE OPT-IN STATUS
  // ============================================================
  async bulkUpdateOptIn(tenantId, customerIds, optInType, value, updatedBy = null) {
    const validOptIns = ['marketing_opt_in', 'whatsapp_opt_in', 'email_opt_in'];
    if (!validOptIns.includes(optInType)) {
      throw new Error(`Invalid opt-in type: ${optInType}`);
    }

    const query = `
      UPDATE customers
      SET 
        ${optInType} = $1, 
        updated_at = CURRENT_TIMESTAMP,
        updated_by = $2
      WHERE tenant_id = $3 AND id = ANY($4::int[])
      RETURNING id
    `;
    
    const { rows } = await db.query(query, [value, updatedBy, tenantId, customerIds]);
    return rows;
  }

  //private functions
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

module.exports = new CustomerRepository();