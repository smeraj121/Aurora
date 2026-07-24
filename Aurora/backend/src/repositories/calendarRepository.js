const db = require('../config/db');

class CalendarRepository {
  // ============================================================
  // FIND SCHEDULE BY DATE
  // ============================================================
  async findScheduleByDate(date) {
    const query = `
      SELECT 
        a.id,
        c.id AS "customerId",
        c.full_name AS "customerName",
        c.phone AS "customerPhone",
        s.id AS "staffId",
        s.name AS "staffName",
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'serviceId', srv.id,
            'serviceName', srv.name,
            'price', aps.service_price,
            'isPackage', aps.is_package_usage
          )) FILTER (WHERE srv.id IS NOT NULL),
          '[]'::json
        ) AS "services",
        a.time_slot AS "startTime",
        COALESCE(a.duration_minutes, 30) AS "durationMinutes",
        a.status,
        a.total_price::float AS "amount",
        a.paid_amount::float AS "paidAmount",
        a.payment_status AS "paymentStatus",
        a.payment_method AS "paymentMethod",
        a.payment_date AS "paymentDate",
        a.is_package_appointment AS "isPackageAppointment",
        a.customer_package_id AS "customerPackageId",
        p.name AS "packageName",
        a.notes
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      LEFT JOIN staff s ON a.staff_id = s.id
      LEFT JOIN appointment_services aps ON aps.appointment_id = a.id
      LEFT JOIN services srv ON aps.service_id = srv.id
      LEFT JOIN customer_packages cp ON cp.id = a.customer_package_id
      LEFT JOIN packages p ON p.id = cp.package_id
      WHERE a.appointment_date = $1
      GROUP BY a.id, c.id, s.id, p.name, cp.id
      ORDER BY a.time_slot ASC;
    `;
    const { rows } = await db.query(query, [date]);
    return rows;
  }

  // ============================================================
  // CUSTOMER METHODS
  // ============================================================
  async findCustomerById(id) {
    const { rows } = await db.query(
      `SELECT id, full_name, phone, email, total_visits, total_spent, total_paid, last_visit_date 
       FROM customers WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async findCustomerByPhone(phone) {
    const { rows } = await db.query(
      `SELECT id, full_name, phone FROM customers WHERE phone = $1`,
      [phone]
    );
    return rows[0] || null;
  }

  async createCustomer(fullName, phone) {
    const { rows } = await db.query(
      `INSERT INTO customers (full_name, phone) VALUES ($1, $2) RETURNING id`,
      [fullName, phone]
    );
    return rows[0];
  }

  // ============================================================
  // PACKAGE METHODS
  // ============================================================
  async getAvailablePackages() {
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
      WHERE p.is_active = true
      GROUP BY p.id
      ORDER BY p.name;
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  async getCustomerPackages(customerId) {
    const query = `
      SELECT 
        cp.id,
        cp.package_id,
        p.name AS "packageName",
        cp.total_sessions AS "totalSessions",
        cp.used_sessions AS "usedSessions",
        cp.remaining_sessions AS "remainingSessions",
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
      WHERE cp.customer_id = $1
        AND cp.remaining_sessions > 0
        AND (cp.expiry_date IS NULL OR cp.expiry_date >= CURRENT_DATE)
      GROUP BY cp.id, p.id
      ORDER BY cp.expiry_date NULLS LAST, cp.purchase_date;
    `;
    const { rows } = await db.query(query, [customerId]);
    return rows;
  }

  async purchasePackage(customerId, packageId, paymentMethod) {
    const client = await db.connect(); // Use connect() instead of getClient()
    
    try {
      await client.query('BEGIN');

      // Get package details
      const packageResult = await client.query(
        `SELECT * FROM packages WHERE id = $1 AND is_active = true`,
        [packageId]
      );
      const pkg = packageResult.rows[0];
      if (!pkg) throw new Error('Package not found or inactive');

      // Get total sessions from package_services
      const sessionsResult = await client.query(
        `SELECT COALESCE(SUM(quantity), 1) as total_sessions 
         FROM package_services 
         WHERE package_id = $1`,
        [packageId]
      );
      const totalSessions = sessionsResult.rows[0].total_sessions || 1;

      // Create customer package
      const query = `
        INSERT INTO customer_packages (
          customer_id, package_id, purchase_date, expiry_date,
          total_sessions, used_sessions, remaining_sessions,
          total_price, payment_status, payment_method
        )
        VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year',
                $3, 0, $3, $4, 'paid', $5)
        RETURNING id;
      `;
      
      const values = [
        customerId,
        packageId,
        totalSessions,
        pkg.total_price,
        paymentMethod
      ];

      const { rows } = await client.query(query, values);
      
      await client.query('COMMIT');
      return rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release(); // Release the client back to the pool
    }
  }

  // ============================================================
  // APPOINTMENT SERVICES METHODS
  // ============================================================
  async linkAppointmentServices(appointmentId, services, customerPackageId = null, client = null) {
    const dbClient = client || db;
    
    // Remove existing links
    await dbClient.query(
      `DELETE FROM appointment_services WHERE appointment_id = $1`,
      [appointmentId]
    );

    if (!services || services.length === 0) return;

    // If using a package, get the package service IDs
    let packageServiceIds = [];
    if (customerPackageId) {
      const packageResult = await dbClient.query(`
        SELECT ps.service_id 
        FROM customer_packages cp
        JOIN package_services ps ON ps.package_id = cp.package_id
        WHERE cp.id = $1
      `, [customerPackageId]);
      
      packageServiceIds = packageResult.rows.map(r => r.service_id);
      
      // Update used sessions for the package
      await dbClient.query(`
        UPDATE customer_packages 
        SET 
          used_sessions = used_sessions + 1,
          remaining_sessions = remaining_sessions - 1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [customerPackageId]);
    }

    // Insert services
    const values = [];
    const placeholders = [];
    
    services.forEach((service, index) => {
      const isPackageService = customerPackageId && packageServiceIds.includes(service.serviceId);
      const price = isPackageService ? 0 : (service.price || 0);
      
      values.push(
        appointmentId, 
        service.serviceId, 
        price,
        isPackageService ? customerPackageId : null,
        isPackageService,
        0 // package_discount_applied
      );
      
      placeholders.push(`($${index * 6 + 1}, $${index * 6 + 2}, $${index * 6 + 3}, $${index * 6 + 4}, $${index * 6 + 5}, $${index * 6 + 6})`);
    });

    const query = `
      INSERT INTO appointment_services (
        appointment_id, service_id, service_price, 
        customer_package_id, is_package_usage, package_discount_applied
      )
      VALUES ${placeholders.join(', ')}
    `;
    
    await dbClient.query(query, values);
  }

  // ============================================================
  // APPOINTMENT CRUD
  // ============================================================
  async createAppointment(data) {
    const client = await db.connect(); // Use connect() instead of getClient()
    
    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO appointments (
          customer_id, staff_id, appointment_date, time_slot, 
          duration_minutes, total_price, paid_amount, payment_status,
          payment_method, payment_date, notes, status,
          customer_package_id, is_package_appointment
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id;
      `;
      
      const values = [
        data.customerId,
        data.staffId,
        data.date,
        data.startTime,
        data.durationMinutes || 30,
        data.amount || 0,
        data.paidAmount || 0,
        data.paymentStatus || 'pending',
        data.paymentMethod || null,
        data.paymentDate || null,
        data.notes || '',
        data.status || 'scheduled',
        data.customerPackageId || null,
        data.isPackageAppointment || false
      ];

      const { rows } = await client.query(query, values);
      const appointment = rows[0];

      // Link services
      if (data.services && data.services.length > 0) {
        await this.linkAppointmentServices(
          appointment.id, 
          data.services, 
          data.customerPackageId,
          client
        );
      }

      await client.query('COMMIT');
      return appointment;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release(); // Release the client back to the pool
    }
  }

  // repositories/calendarRepository.js

async getAppointmentById(id) {
  const query = `
    SELECT 
      a.id,
      a.customer_id AS "customerId",
      c.full_name AS "customerName",
      c.phone AS "customerPhone",
      a.staff_id AS "staffId",
      s.name AS "staffName",
      TO_CHAR(a.appointment_date, 'YYYY-MM-DD') AS "date",  -- ✅ Format date in SQL
      a.time_slot AS "startTime",
      a.duration_minutes AS "durationMinutes",
      a.status,
      a.total_price AS "amount",
      a.paid_amount AS "paidAmount",
      a.payment_status AS "paymentStatus",
      a.payment_method AS "paymentMethod",
      a.payment_date AS "paymentDate",
      a.is_package_appointment AS "isPackageAppointment",
      a.customer_package_id AS "customerPackageId",
      a.notes,
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
    LEFT JOIN staff s ON a.staff_id = s.id
    LEFT JOIN appointment_services aps ON aps.appointment_id = a.id
    LEFT JOIN services srv ON aps.service_id = srv.id
    WHERE a.id = $1
    GROUP BY a.id, c.id, s.id
  `;
  
  const { rows } = await db.query(query, [id]);
  return rows[0] || null;
}

  async updateAppointment(id, data) {
    const client = await db.connect(); // Use connect() instead of getClient()
    
    try {
      await client.query('BEGIN');

      const query = `
        UPDATE appointments
        SET 
          customer_id = $1,
          staff_id = $2, 
          appointment_date = $3, 
          time_slot = $4, 
          duration_minutes = $5,
          total_price = $6,
          paid_amount = $7,
          payment_status = $8,
          payment_method = $9,
          payment_date = $10,
          notes = $11, 
          status = $12,
          customer_package_id = $13,
          is_package_appointment = $14,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $15
        RETURNING id;
      `;
      
      const values = [
        data.customerId,
        data.staffId,
        data.date,
        data.startTime,
        data.durationMinutes || 30,
        data.amount || 0,
        data.paidAmount || 0,
        data.paymentStatus || 'pending',
        data.paymentMethod || null,
        data.paymentDate || null,
        data.notes || '',
        data.status || 'scheduled',
        data.customerPackageId || null,
        data.isPackageAppointment || false,
        id
      ];

      const { rows } = await client.query(query, values);
      const appointment = rows[0];

      // Update services
      if (data.services) {
        // First, remove existing links
        await client.query(
          `DELETE FROM appointment_services WHERE appointment_id = $1`,
          [id]
        );

        // Then add new ones
        if (data.services.length > 0) {
          await this.linkAppointmentServices(
            id, 
            data.services, 
            data.customerPackageId,
            client
          );
        }
      }

      await client.query('COMMIT');
      return appointment;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release(); // Release the client back to the pool
    }
  }

  // ============================================================
  // PAYMENT METHODS
  // ============================================================
  async updatePayment(appointmentId, paidAmount, paymentMethod) {
    const total = await this.getAppointmentTotal(appointmentId);
    const paymentStatus = paidAmount >= total ? 'paid' : paidAmount > 0 ? 'partial' : 'pending';
    
    const query = `
      UPDATE appointments
      SET 
        paid_amount = $1,
        payment_status = $2,
        payment_method = $3,
        payment_date = CASE WHEN $1 > 0 THEN CURRENT_TIMESTAMP ELSE payment_date END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, paid_amount, payment_status;
    `;
    const { rows } = await db.query(query, [paidAmount, paymentStatus, paymentMethod, appointmentId]);
    return rows[0];
  }

  async getAppointmentTotal(appointmentId) {
    const { rows } = await db.query(
      `SELECT total_price FROM appointments WHERE id = $1`,
      [appointmentId]
    );
    return rows[0]?.total_price || 0;
  }

  // ============================================================
  // REPORTING METHODS
  // ============================================================
  async getPendingPayments() {
  const query = `
    SELECT 
      a.id AS "appointmentId",
      c.full_name AS "customerName",
      c.phone AS "customerPhone",
      a.appointment_date AS "date",
      a.time_slot AS "startTime",
      a.total_price AS "amount",
      a.paid_amount AS "paidAmount",
      (a.total_price - a.paid_amount) AS "balanceDue",
      a.payment_status AS "paymentStatus",
      a.status AS "appointmentStatus",
      GREATEST(0, EXTRACT(DAY FROM (CURRENT_DATE - a.appointment_date))) AS "daysOverdue"
    FROM appointments a
    JOIN customers c ON a.customer_id = c.id
    WHERE a.payment_status IN ('pending', 'partial')
      AND a.status NOT IN ('cancelled')
    ORDER BY a.appointment_date ASC;
  `;
  const { rows } = await db.query(query);
  return rows;
}

  async getCustomerPaymentHistory(customerId) {
    const query = `
      SELECT 
        id,
        appointment_date AS "date",
        time_slot AS "startTime",
        total_price AS "amount",
        paid_amount AS "paidAmount",
        payment_status AS "paymentStatus",
        payment_method AS "paymentMethod",
        payment_date AS "paymentDate",
        status AS "appointmentStatus"
      FROM appointments
      WHERE customer_id = $1
      ORDER BY appointment_date DESC, time_slot DESC;
    `;
    const { rows } = await db.query(query, [customerId]);
    return rows;
  }
}

module.exports = new CalendarRepository();