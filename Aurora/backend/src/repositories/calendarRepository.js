// repositories/calendarRepository.js
const db = require('../config/db');
const TimeHelper = require('../utils/timeHelper');

class CalendarRepository {
  // ============================================================
  // FIND SCHEDULE BY DATE (with tenant)
  // ============================================================
  async findScheduleByDate(tenantId, date) {
    const query = `
      SELECT 
        a.id,
        a.customer_id AS "customerId",
        u.full_name AS "customerName",
        u.phone AS "customerPhone",
        a.staff_id AS "staffId",
        su.full_name AS "staffName",
        TO_CHAR(a.appointment_date, 'YYYY-MM-DD') AS "date",
        TO_CHAR(a.start_time, 'HH12:MI AM') AS "startTime",
        TO_CHAR(a.end_time, 'HH12:MI AM') AS "endTime",
        (EXTRACT(EPOCH FROM (a.end_time - a.start_time)) / 60)::INT AS "durationMinutes",
        a.status,
        a.total_price AS "amount",
        a.paid_amount AS "paidAmount",
        a.payment_status AS "paymentStatus",
        a.payment_method AS "paymentMethod",
        a.payment_date AS "paymentDate",
        a.is_package_appointment AS "isPackageAppointment",
        a.customer_package_id AS "customerPackageId",
        p.name AS "packageName",
        a.customer_notes,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'serviceId', srv.id,
            'serviceName', srv.name,
            'price', aps.service_price,
            'isPackage', aps.is_package_usage
          )) FILTER (WHERE srv.id IS NOT NULL),
          '[]'::json
        ) AS services
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      LEFT JOIN staff st ON a.staff_id = st.id
      LEFT JOIN users su ON st.user_id = su.id
      LEFT JOIN appointment_services aps ON aps.appointment_id = a.id
      LEFT JOIN services srv ON aps.service_id = srv.id
      LEFT JOIN customer_packages cp ON cp.id = a.customer_package_id
      LEFT JOIN packages p ON p.id = cp.package_id
      WHERE a.tenant_id = $1 AND a.appointment_date = $2
      GROUP BY a.id, c.id, u.id, st.id, su.id, p.name, cp.id
      ORDER BY a.start_time ASC;
    `;
    const { rows } = await db.query(query, [tenantId, date]);
    return rows;
  }

  // ============================================================
  // GET APPOINTMENT BY ID (with tenant)
  // ============================================================
  async getAppointmentById(tenantId, id) {
    const query = `
      SELECT 
        a.id,
        a.customer_id AS "customerId",
        u.full_name AS "customerName",
        u.phone AS "customerPhone",
        a.staff_id AS "staffId",
        su.full_name AS "staffName",
        TO_CHAR(a.appointment_date, 'YYYY-MM-DD') AS "date",
        TO_CHAR(a.start_time, 'HH12:MI AM') AS "startTime",
        TO_CHAR(a.end_time, 'HH12:MI AM') AS "endTime",
        (EXTRACT(EPOCH FROM (a.end_time - a.start_time)) / 60)::INT AS "durationMinutes",
        a.status,
        a.total_price AS "amount",
        a.paid_amount AS "paidAmount",
        a.payment_status AS "paymentStatus",
        a.payment_method AS "paymentMethod",
        a.payment_date AS "paymentDate",
        a.is_package_appointment AS "isPackageAppointment",
        a.customer_package_id AS "customerPackageId",
        a.customer_notes,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'serviceId', srv.id,
            'serviceName', srv.name,
            'price', aps.service_price,
            'isPackage', aps.is_package_usage
          )) FILTER (WHERE srv.id IS NOT NULL),
          '[]'::json
        ) AS services
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      LEFT JOIN staff st ON a.staff_id = st.id
      LEFT JOIN users su ON st.user_id = su.id
      LEFT JOIN appointment_services aps ON aps.appointment_id = a.id
      LEFT JOIN services srv ON aps.service_id = srv.id
      WHERE a.id = $1 AND a.tenant_id = $2
      GROUP BY a.id, c.id, u.id, st.id, su.id
    `;
    const { rows } = await db.query(query, [id, tenantId]);
    return rows[0] || null;
  }

  // ============================================================
  // CUSTOMER METHODS (now using users table)
  // ============================================================
  async findCustomerById(tenantId, id) {
    const query = `
      SELECT 
        c.id,
        u.full_name,
        u.phone,
        u.email,
        c.total_visits,
        c.total_spent,
        c.total_paid,
        c.last_visit_date
      FROM customers c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = $1 AND c.tenant_id = $2
    `;
    const { rows } = await db.query(query, [id, tenantId]);
    return rows[0] || null;
  }

  async findCustomerByPhone(tenantId, phone) {
    const query = `
      SELECT c.id, u.full_name, u.phone
      FROM customers c
      JOIN users u ON c.user_id = u.id
      WHERE c.tenant_id = $1 AND u.phone = $2
    `;
    const { rows } = await db.query(query, [tenantId, phone]);
    return rows[0] || null;
  }

  // This method is now moved to customerRepository; we keep it here temporarily for backward compatibility
  async createCustomer(tenantId, fullName, phone, userId) {
    // This should be handled by customerService; we'll keep a simple version
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Insert user
      const userQuery = `
        INSERT INTO users (tenant_id, full_name, phone, system_role, created_by)
        VALUES ($1, $2, $3, 'customer', $4)
        RETURNING id
      `;
      const userRes = await client.query(userQuery, [tenantId, fullName, phone, userId]);
      const userIdNew = userRes.rows[0].id;

      // Insert customer
      const custQuery = `
        INSERT INTO customers (tenant_id, user_id, created_by)
        VALUES ($1, $2, $3)
        RETURNING id
      `;
      const custRes = await client.query(custQuery, [tenantId, userIdNew, userId]);

      await client.query('COMMIT');
      return { id: custRes.rows[0].id };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // ============================================================
  // PACKAGE METHODS (with tenant)
  // ============================================================
  async getAvailablePackages(tenantId) {
    const query = `
      SELECT 
        p.*,
        COALESCE(
          json_agg(jsonb_build_object(
            'serviceId', ps.service_id,
            'serviceName', s.name,
            'quantity', ps.quantity,
            'discount', ps.discount_per_service
          )) FILTER (WHERE ps.service_id IS NOT NULL),
          '[]'::json
        ) AS services
      FROM packages p
      LEFT JOIN package_services ps ON ps.package_id = p.id
      LEFT JOIN services s ON s.id = ps.service_id
      WHERE p.tenant_id = $1 AND p.is_active = true
      GROUP BY p.id
      ORDER BY p.name;
    `;
    const { rows } = await db.query(query, [tenantId]);
    return rows;
  }

  async getCustomerPackages(tenantId, customerId) {
    const query = `
      SELECT 
        cp.id,
        cp.package_id,
        p.name AS "packageName",
        cp.total_sessions AS "totalSessions",
        cp.used_sessions AS "usedSessions",
        cp.total_sessions - cp.used_sessions AS "remainingSessions",
        cp.purchase_date AS "purchaseDate",
        cp.expiry_date AS "expiryDate",
        cp.total_price AS "totalPrice",
        cp.payment_status AS "paymentStatus",
        COALESCE(
          json_agg(jsonb_build_object(
            'serviceId', ps.service_id,
            'serviceName', s.name,
            'price', s.price,
            'quantity', ps.quantity
          )) FILTER (WHERE ps.service_id IS NOT NULL),
          '[]'::json
        ) AS services
      FROM customer_packages cp
      JOIN packages p ON cp.package_id = p.id
      LEFT JOIN package_services ps ON ps.package_id = p.id
      LEFT JOIN services s ON s.id = ps.service_id
      WHERE cp.customer_id = $1 AND cp.tenant_id = $2
        AND cp.total_sessions - cp.used_sessions > 0
        AND (cp.expiry_date IS NULL OR cp.expiry_date >= CURRENT_DATE)
      GROUP BY cp.id, p.id
      ORDER BY cp.expiry_date NULLS LAST, cp.purchase_date;
    `;
    const { rows } = await db.query(query, [customerId, tenantId]);
    return rows;
  }

  async purchasePackage(tenantId, customerId, packageId, paymentMethod, userId) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Get package details
      const packageResult = await client.query(
        `SELECT id, total_price FROM packages WHERE id = $1 AND tenant_id = $2 AND is_active = true`,
        [packageId, tenantId]
      );
      const pkg = packageResult.rows[0];
      if (!pkg) throw new Error('Package not found or inactive');

      // Get total sessions
      const sessionsResult = await client.query(
        `SELECT COALESCE(SUM(quantity), 1) as total_sessions 
         FROM package_services 
         WHERE package_id = $1`,
        [packageId]
      );
      const totalSessions = sessionsResult.rows[0].total_sessions || 1;

      // Insert customer package
      const query = `
        INSERT INTO customer_packages (
          tenant_id, customer_id, package_id, purchase_date, expiry_date,
          total_sessions, used_sessions,
          total_price, payment_status, payment_method, created_by
        )
        VALUES ($1, $2, $3, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year',
                $4, 0,
                $5, 'paid', $6, $7)
        RETURNING id;
      `;
      const values = [tenantId, customerId, packageId, totalSessions, pkg.total_price, paymentMethod, userId];
      const { rows } = await client.query(query, values);

      await client.query('COMMIT');
      return rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // ============================================================
  // APPOINTMENT SERVICES LINKING
  // ============================================================
 async linkAppointmentServices(tenantId, appointmentId, services, customerPackageId = null, client = null) {
  const dbClient = client || db;

  // 1. Delete existing links for this appointment
  await dbClient.query(
    `DELETE FROM appointment_services WHERE appointment_id = $1`,
    [appointmentId]
  );

  if (!services || services.length === 0) return;

  // 2. Fetch durations for all service IDs
  const serviceIds = services.map(s => s.serviceId);
  const durationQuery = `
    SELECT id, estimated_duration_minutes 
    FROM services 
    WHERE id = ANY($1)
  `;
  const durationResult = await dbClient.query(durationQuery, [serviceIds]);
  const durationMap = {};
  durationResult.rows.forEach(row => {
    durationMap[row.id] = row.estimated_duration_minutes;
  });

  // 3. Get valid package services directly from customer_package_services
  let packageServiceIds = [];
  if (customerPackageId) {
    const packageResult = await dbClient.query(`
      SELECT service_id 
      FROM customer_package_services 
      WHERE customer_package_id = $1 
        AND tenant_id = $2
        AND used_quantity < total_quantity
    `, [customerPackageId, tenantId]);
    
    packageServiceIds = packageResult.rows.map(r => r.service_id);
  }

  const values = [];
  const placeholders = [];
  
  // 4. Build bulk INSERT parameters and update quotas
  for (let index = 0; index < services.length; index++) {
    const service = services[index];
    const isPackageService = Boolean(customerPackageId && packageServiceIds.includes(service.serviceId));
    const price = isPackageService ? 0 : (service.price || 0);
    const duration = durationMap[service.serviceId] || 0;

    // Increment used_quantity in customer_package_services
    if (isPackageService) {
      const updateResult = await dbClient.query(`
        UPDATE customer_package_services
        SET used_quantity = used_quantity + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE customer_package_id = $1 
          AND service_id = $2 
          AND tenant_id = $3
          AND used_quantity < total_quantity
        RETURNING id
      `, [customerPackageId, service.serviceId, tenantId]);

      if (updateResult.rowCount === 0) {
        throw new Error(`Service ID ${service.serviceId} has no remaining sessions available in package #${customerPackageId}.`);
      }
    }

    values.push(
      tenantId,
      appointmentId,
      service.serviceId,
      price,
      isPackageService ? customerPackageId : null,
      isPackageService,
      0,
      duration
    );

    placeholders.push(`($${index * 8 + 1}, $${index * 8 + 2}, $${index * 8 + 3}, $${index * 8 + 4}, $${index * 8 + 5}, $${index * 8 + 6}, $${index * 8 + 7}, $${index * 8 + 8})`);
  }

  // 5. Bulk Insert into appointment_services
  const query = `
    INSERT INTO appointment_services (
      tenant_id, appointment_id, service_id, service_price,
      customer_package_id, is_package_usage, package_discount_applied, estimated_duration_minutes
    )
    VALUES ${placeholders.join(', ')}
  `;
  await dbClient.query(query, values);

  // 6. Update top-level counts on customer_packages
  if (customerPackageId) {
    const packageUsageCount = services.filter(s => packageServiceIds.includes(s.serviceId)).length;
    if (packageUsageCount > 0) {
      await dbClient.query(`
        UPDATE customer_packages
        SET used_sessions = used_sessions + $1
        WHERE id = $2 AND tenant_id = $3
      `, [packageUsageCount, customerPackageId, tenantId]);
    }
  }
}

  // ============================================================
  // CREATE APPOINTMENT (with tenant & audit)
  // ============================================================
  async createAppointment(tenantId, data, userId) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const startTime = TimeHelper.toDb(data.startTime);
      const endTime = TimeHelper.addMinutes(
        startTime,
        data.durationMinutes || 30
      );

      const query = `
        INSERT INTO appointments (
          tenant_id,
          customer_id,
          staff_id,
          appointment_date,
          start_time,
          end_time,
          total_price,
          paid_amount,
          payment_status,
          payment_method,
          payment_date,
          customer_notes,
          status,
          customer_package_id,
          is_package_appointment,
          created_by,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id;
      `;

      const values = [
        tenantId,
        data.customerId,
        data.staffId,
        data.date,
        startTime,
        endTime,
        data.amount || 0,
        data.paidAmount || 0,
        data.paymentStatus || 'pending',
        data.paymentMethod || null,
        data.paymentDate || null,
        data.customer_notes || null,
        data.status || 'scheduled',
        data.customerPackageId || null,
        data.isPackageAppointment || false,
        userId
      ];

      const { rows } = await client.query(query, values);
      const appointment = rows[0];

      if (data.services && data.services.length > 0) {
        await this.linkAppointmentServices(
          tenantId,
          appointment.id,
          data.services,
          data.customerPackageId,
          client
        );
      }

      await client.query('COMMIT');
      return appointment;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // ============================================================
  // UPDATE APPOINTMENT (with tenant & audit)
  // ============================================================
  async updateAppointment(tenantId, id, data, userId) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Compute end_time if startTime or duration changes
      const startTime = TimeHelper.toDb(data.startTime);
      const endTime = TimeHelper.addMinutes(
        startTime,
        data.durationMinutes || 30
      );

      const query = `
        UPDATE appointments
        SET 
          customer_id = $1,
          staff_id = $2,
          appointment_date = $3,
          start_time = $4,
          end_time = COALESCE($5, end_time),
          total_price = $6,
          paid_amount = $7,
          payment_status = $8,
          payment_method = $9,
          payment_date = $10,
          customer_notes = $11,
          status = $12,
          customer_package_id = $13,
          is_package_appointment = $14,
          updated_by = $15,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $16 AND tenant_id = $17
        RETURNING id;
      `;

      const values = [
        data.customerId,
        data.staffId,
        data.date,
        data.startTime,
        endTime,
        data.amount || 0,
        data.paidAmount || 0,
        data.paymentStatus || 'pending',
        data.paymentMethod || null,
        data.paymentDate || null,
        data.customer_notes || null,
        data.status || 'scheduled',
        data.customerPackageId || null,
        data.isPackageAppointment || false,
        userId,
        id,
        tenantId
      ];

      const { rows } = await client.query(query, values);
      const appointment = rows[0];

      // Update services if provided
      if (data.services) {
        await client.query(
          `DELETE FROM appointment_services WHERE appointment_id = $1`,
          [id]
        );
        if (data.services.length > 0) {
          await this.linkAppointmentServices(
            tenantId,
            id,
            data.services,
            data.customerPackageId,
            client
          );
        }
      }

      await client.query('COMMIT');
      return appointment;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // ============================================================
  // PAYMENT METHODS (with tenant)
  // ============================================================
  async updatePayment(tenantId, appointmentId, paidAmount, paymentMethod, userId) {
    const total = await this.getAppointmentTotal(tenantId, appointmentId);
    const paymentStatus = paidAmount >= total ? 'paid' : paidAmount > 0 ? 'partial' : 'pending';

    const query = `
      UPDATE appointments
      SET 
        paid_amount = $1,
        payment_status = $2,
        payment_method = $3,
        payment_date = CASE WHEN $1 > 0 THEN CURRENT_TIMESTAMP ELSE payment_date END,
        updated_by = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND tenant_id = $6
      RETURNING id, paid_amount, payment_status;
    `;
    const { rows } = await db.query(query, [
      paidAmount,
      paymentStatus,
      paymentMethod,
      userId,
      appointmentId,
      tenantId
    ]);
    return rows[0];
  }

  async getAppointmentTotal(tenantId, appointmentId) {
    const { rows } = await db.query(
      `SELECT total_price FROM appointments WHERE id = $1 AND tenant_id = $2`,
      [appointmentId, tenantId]
    );
    return rows[0]?.total_price || 0;
  }

  // ============================================================
  // REPORTING: PENDING PAYMENTS (with tenant)
  // ============================================================
  async getPendingPayments(tenantId) {
    const query = `
      SELECT 
        a.id AS "appointmentId",
        u.full_name AS "customerName",
        u.phone AS "customerPhone",
        a.appointment_date AS "date",
        a.start_time AS "startTime",
        a.total_price::INT AS "amount",
        a.paid_amount AS "paidAmount",
        (a.total_price - a.paid_amount) AS "balanceDue",
        a.payment_status AS "paymentStatus",
        a.status AS "appointmentStatus",
        GREATEST(0, EXTRACT(DAY FROM (CURRENT_DATE - a.appointment_date)))::INT AS "daysOverdue"
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE a.tenant_id = $1
        AND a.payment_status IN ('pending', 'partial')
        AND a.status NOT IN ('cancelled')
      ORDER BY a.appointment_date ASC;
    `;
    const { rows } = await db.query(query, [tenantId]);
    return rows;
  }

  // ============================================================
  // CUSTOMER PAYMENT HISTORY (with tenant)
  // ============================================================
  async getCustomerPaymentHistory(tenantId, customerId) {
    const query = `
      SELECT 
        id,
        appointment_date AS "date",
        start_time AS "startTime",
        total_price AS "amount",
        paid_amount AS "paidAmount",
        payment_status AS "paymentStatus",
        payment_method AS "paymentMethod",
        payment_date AS "paymentDate",
        status AS "appointmentStatus"
      FROM appointments
      WHERE customer_id = $1 AND tenant_id = $2
      ORDER BY appointment_date DESC, start_time DESC;
    `;
    const { rows } = await db.query(query, [customerId, tenantId]);
    return rows;
  }
}

module.exports = new CalendarRepository();