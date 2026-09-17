const db = require('../config/db');

class AppointmentRepository {

    async getAppointmentById(tenantId, id, client = db) {
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
          a.customer_notes AS "notes",
          a.updated_at AS "updatedAt",
          ub.full_name AS "updatedByName",
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
        LEFT JOIN users ub ON a.updated_by = ub.id
        LEFT JOIN appointment_services aps
          ON aps.appointment_id = a.id AND aps.tenant_id = a.tenant_id
        LEFT JOIN services srv
          ON aps.service_id = srv.id AND srv.tenant_id = a.tenant_id
        WHERE a.id = $1 AND a.tenant_id = $2
        GROUP BY a.id, c.id, u.id, st.id, su.id, ub.id
      `;
    const { rows } = await client.query(query, [id, tenantId]);
    return rows[0] || null;
  }

  // ============================================================
  // GET CUSTOMER'S OWN APPOINTMENTS — "My Appointments" page
  // upcoming: status IN (scheduled, confirmed, in_progress)
  // past: status IN (completed, cancelled)
  // ============================================================
  async getCustomerAppointments(tenantId, customerId, statusGroup, client = db) {
    const isUpcoming = statusGroup === 'upcoming';

    // Customer-facing classification:
    //
    // Upcoming:
    // - scheduled / confirmed / in_progress
    // - AND scheduled end has not passed
    //
    // Past:
    // - completed / cancelled
    // - OR any scheduled / confirmed / in_progress appointment
    //   whose scheduled end has already passed
    //
    // Important:
    // We do NOT change the appointment's actual DB status.
    // This is only how it is classified for the customer-facing view.

    const statusFilter = isUpcoming
      ? `
      a.status IN ('scheduled', 'confirmed', 'in_progress')
      AND (
        (a.appointment_date + a.end_time)
          AT TIME ZONE COALESCE(t.timezone, 'Asia/Kolkata')
      ) >= CURRENT_TIMESTAMP
    `
      : `
      (
        a.status IN ('completed', 'cancelled')
        OR (
          a.status IN ('scheduled', 'confirmed', 'in_progress')
          AND (
            (a.appointment_date + a.end_time)
              AT TIME ZONE COALESCE(t.timezone, 'Asia/Kolkata')
          ) < CURRENT_TIMESTAMP
        )
      )
    `;

    const orderClause = isUpcoming
      ? 'ORDER BY a.appointment_date ASC, a.start_time ASC'
      : 'ORDER BY a.appointment_date DESC, a.start_time DESC';

    const reviewSelect = !isUpcoming
      ? `, r.id AS "reviewId", r.rating AS "reviewRating"`
      : '';

    const reviewJoin = !isUpcoming
      ? `
      LEFT JOIN reviews r
        ON r.appointment_id = a.id
       AND r.tenant_id = a.tenant_id
    `
      : '';

    const groupBy = !isUpcoming ? ', r.id' : '';

    const query = `
    SELECT
      a.id,
      a.staff_id AS "staffId",
      su.full_name AS "staffName",

      TO_CHAR(a.appointment_date, 'YYYY-MM-DD') AS "date",
      TO_CHAR(a.start_time, 'HH12:MI AM') AS "startTime",
      TO_CHAR(a.end_time, 'HH12:MI AM') AS "endTime",

      a.status,
      a.total_price AS "amount",
      a.paid_amount AS "paidAmount",
      a.payment_status AS "paymentStatus",
      a.is_package_appointment AS "isPackageAppointment",

      a.updated_at AS "updatedAt",
      ub.full_name AS "updatedByName"

      ${reviewSelect},

      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'serviceId', srv.id,
            'serviceName', srv.name
          )
        ) FILTER (WHERE srv.id IS NOT NULL),
        '[]'::json
      ) AS services

    FROM appointments a

    LEFT JOIN staff st
      ON a.staff_id = st.id

    LEFT JOIN users su
      ON st.user_id = su.id

    LEFT JOIN users ub
      ON a.updated_by = ub.id

    LEFT JOIN appointment_services aps
      ON aps.appointment_id = a.id
     AND aps.tenant_id = a.tenant_id

    LEFT JOIN services srv
      ON aps.service_id = srv.id
     AND srv.tenant_id = a.tenant_id

    LEFT JOIN tenants t
      ON t.id = a.tenant_id

    ${reviewJoin}

    WHERE a.tenant_id = $1
      AND a.customer_id = $2
      AND ${statusFilter}

    GROUP BY
      a.id,
      su.id,
      ub.id,
      t.timezone
      ${groupBy}

    ${orderClause}

    LIMIT 50
  `;

    const { rows } = await client.query(query, [
      tenantId,
      customerId
    ]);

    return rows;
  }

  async lockAppointmentById(tenantId, id, client = db) {
    const query = `
      SELECT id 
      FROM appointments 
      WHERE id = $1 AND tenant_id = $2 
      FOR UPDATE;
    `;
    const { rows } = await client.query(query, [id, tenantId]);
    return rows[0] || null;
  }

  async validateStaffBelongsToTenant(tenantId, staffId, client = db) {
    const query = `
      SELECT id FROM staff 
      WHERE id = $1 AND tenant_id = $2 AND is_active = true
    `;
    const { rows } = await client.query(query, [staffId, tenantId]);
    return rows.length > 0;
  }

  async validateServicesBelongToTenant(tenantId, serviceIds, client = db) {
    if (!serviceIds || serviceIds.length === 0) return true;
    const query = `
      SELECT COUNT(id) AS count FROM services 
      WHERE id = ANY($1::int[]) AND tenant_id = $2 AND is_active = true
    `;
    const { rows } = await client.query(query, [serviceIds, tenantId]);
    return parseInt(rows[0].count, 10) === serviceIds.length;
  }

  async getBookedSlots(tenantId, staffId, date, client = db) {
  const query = `
    SELECT start_time, end_time
    FROM appointments
    WHERE tenant_id = $1
      AND staff_id = $2
      AND appointment_date = $3
      AND status NOT IN ('cancelled')
    ORDER BY start_time
  `;

  const { rows } = await client.query(query, [
    tenantId,
    staffId,
    date
  ]);

  return rows;
}

  async hasStaffOverlap(tenantId, staffId, date, startTime, endTime, excludeId = null, client = db) {
    const query = `
    SELECT 1
    FROM appointments
    WHERE tenant_id = $1
      AND staff_id = $2
      AND appointment_date = $3
      AND status NOT IN ('cancelled')
      AND start_time < $5
      AND end_time > $4
      AND id != COALESCE($6, -1)
    LIMIT 1
  `;
    const { rows } = await client.query(query, [tenantId, staffId, date, startTime, endTime, excludeId]);
    return rows.length > 0;
  }

  async createAppointment(tenantId, data, userId, client = db) {
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
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id, status;
    `;
    const values = [
      tenantId,
      data.customerId,
      data.staffId,
      data.date,
      data.startTime,
      data.endTime,
      data.amount,
      data.paidAmount,
      data.paymentStatus,
      data.paymentMethod,
      data.paymentDate,
      data.notes,
      data.status,
      data.customerPackageId,
      data.isPackageAppointment,
      userId
    ];
    const { rows } = await client.query(query, values);
    return rows[0];
  }

  async updateAppointment(tenantId, id, data, userId, client = db) {
    const query = `
      UPDATE appointments
      SET 
        staff_id = $1,
        appointment_date = $2,
        start_time = $3,
        end_time = $4,
        total_price = $5,
        paid_amount = $6,
        payment_status = $7,
        payment_method = $8,
        payment_date = $9,
        customer_notes = $10,
        status = $11,
        customer_package_id = $12,
        is_package_appointment = $13,
        updated_by = $14,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $15 AND tenant_id = $16
      RETURNING id, status;
    `;
    const values = [
      data.staffId,
      data.date,
      data.startTime,
      data.endTime,
      data.amount,
      data.paidAmount,
      data.paymentStatus,
      data.paymentMethod,
      data.paymentDate,
      data.notes,
      data.status,
      data.customerPackageId,
      data.isPackageAppointment,
      userId,
      id,
      tenantId
    ];
    const { rows } = await client.query(query, values);
    return rows[0];
  }

  async updateStatus(tenantId, id, status, userId, client = db, cancellationReason = null) {
    const query = `
      UPDATE appointments
      SET 
        status = $1,
        cancellation_reason = COALESCE($2, cancellation_reason),
        updated_by = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND tenant_id = $5
      RETURNING id, status;
    `;
    const { rows } = await client.query(query, [status, cancellationReason, userId, id, tenantId]);
    return rows[0];
  }

  async updatePayment(tenantId, id, paymentDetails, client = db) {
    const query = `
      UPDATE appointments
      SET 
        paid_amount = $1,
        payment_status = $2,
        payment_date = COALESCE($3, payment_date),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND tenant_id = $5;
    `;
    await client.query(query, [
      paymentDetails.parsedPaidAmount,
      paymentDetails.paymentStatus,
      paymentDetails.paymentDate,
      id,
      tenantId
    ]);
  }

  async replaceAppointmentServices(tenantId, appointmentId, services, customerPackageId, isPackageAppointment, client = db) {
    await client.query(
      `DELETE FROM appointment_services WHERE appointment_id = $1 AND tenant_id = $2`,
      [appointmentId, tenantId]
    );

    if (!services || services.length === 0) return;

    const values = [];
    const valueStrings = services.map((s, idx) => {
      const offset = idx * 6;
      values.push(tenantId, appointmentId, s.serviceId, s.price, customerPackageId || null, isPackageAppointment);
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`;
    });

    const query = `
      INSERT INTO appointment_services (
        tenant_id,
        appointment_id,
        service_id,
        service_price,
        customer_package_id,
        is_package_usage
      ) VALUES ${valueStrings.join(', ')}
    `;
    await client.query(query, values);
  }
    // Shared select shape for staff-facing list/workspace views
  _staffAppointmentSelect() {
    return `
      a.id,
      u.full_name AS "customerName",
      u.phone AS "customerPhone",
      a.staff_id AS "staffId",
      su.full_name AS "staffName",
      TO_CHAR(a.appointment_date, 'YYYY-MM-DD') AS "date",
      TO_CHAR(a.start_time, 'HH12:MI AM') AS "startTime",
      TO_CHAR(a.end_time, 'HH12:MI AM') AS "endTime",
      a.status,
      a.total_price AS "amount",
      a.paid_amount AS "paidAmount",
      a.payment_status AS "paymentStatus",
      COALESCE(
        json_agg(DISTINCT jsonb_build_object(
          'serviceId', srv.id, 'serviceName', srv.name
        )) FILTER (WHERE srv.id IS NOT NULL), '[]'::json
      ) AS services
    `;
  }

  _staffAppointmentJoins() {
    return `
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      LEFT JOIN staff st ON a.staff_id = st.id
      LEFT JOIN users su ON st.user_id = su.id
      LEFT JOIN appointment_services aps ON aps.appointment_id = a.id AND aps.tenant_id = a.tenant_id
      LEFT JOIN services srv ON aps.service_id = srv.id AND srv.tenant_id = a.tenant_id
    `;
  }

  // Includes every status (incl. cancelled) — matches how Calendar already
  // displays a full day, not just active appointments.
  async getTodayAppointments(tenantId, client = db) {
    const query = `
      SELECT ${this._staffAppointmentSelect()}
      ${this._staffAppointmentJoins()}
      WHERE a.tenant_id = $1 AND a.appointment_date = CURRENT_DATE
      GROUP BY a.id, u.id, st.id, su.id
      ORDER BY a.start_time ASC
    `;
    const { rows } = await client.query(query, [tenantId]);
    return rows;
  }

  async getUpcomingAppointments(tenantId, client = db) {
    const query = `
      SELECT ${this._staffAppointmentSelect()}
      ${this._staffAppointmentJoins()}
      WHERE a.tenant_id = $1 AND a.appointment_date > CURRENT_DATE
      GROUP BY a.id, u.id, st.id, su.id
      ORDER BY a.appointment_date ASC, a.start_time ASC
      LIMIT 100
    `;
    const { rows } = await client.query(query, [tenantId]);
    return rows;
  }

  async getConfirmationRequired(tenantId, client = db) {
    const query = `
    SELECT
      ${this._staffAppointmentSelect()}

    ${this._staffAppointmentJoins()}

    LEFT JOIN tenants t
      ON t.id = a.tenant_id

    WHERE a.tenant_id = $1
      AND a.status = 'scheduled'
      AND (
        (a.appointment_date + a.end_time)
          AT TIME ZONE COALESCE(t.timezone, 'Asia/Kolkata')
      ) >= CURRENT_TIMESTAMP

    GROUP BY
      a.id,
      u.id,
      st.id,
      su.id,
      t.timezone

    ORDER BY
      a.appointment_date ASC,
      a.start_time ASC

    LIMIT 100
  `;

    const { rows } = await client.query(query, [tenantId]);

    return rows;
  }

  async getNeedsReview(tenantId, client = db) {
    const query = `
    SELECT
      ${this._staffAppointmentSelect()},

      CASE
        WHEN a.status = 'in_progress' THEN 'in_progress'
        WHEN a.status = 'scheduled' THEN 'scheduled'
        WHEN a.status = 'confirmed' THEN 'confirmed'
        ELSE 'unknown'
      END AS "reviewReason",

      CASE
        WHEN a.status = 'in_progress'
          THEN 'Appointment is still in progress after its scheduled end time'

        WHEN a.status = 'scheduled'
          THEN 'Scheduled appointment has passed without being completed or cancelled'

        WHEN a.status = 'confirmed'
          THEN 'Confirmed appointment has passed without being completed or cancelled'

        ELSE 'Appointment needs review'
      END AS "reviewReasonLabel"

    ${this._staffAppointmentJoins()}

    LEFT JOIN tenants t
      ON t.id = a.tenant_id

    WHERE a.tenant_id = $1

      AND a.status IN (
        'scheduled',
        'confirmed',
        'in_progress'
      )

      AND (
        (a.appointment_date + a.end_time)
          AT TIME ZONE COALESCE(t.timezone, 'Asia/Kolkata')
      ) < CURRENT_TIMESTAMP

    GROUP BY
      a.id,
      u.id,
      st.id,
      su.id,
      t.timezone

    ORDER BY
      a.appointment_date ASC,
      a.start_time ASC

    LIMIT 100
  `;

    const { rows } = await client.query(query, [tenantId]);

    return rows;
  }

  async getPendingPayments(tenantId, client = db) {
    const query = `
      SELECT ${this._staffAppointmentSelect()},
        (a.total_price - a.paid_amount) AS "dueAmount"
      ${this._staffAppointmentJoins()}
      WHERE a.tenant_id = $1
        AND a.status = 'completed'
        AND (a.total_price - a.paid_amount) > 0
      GROUP BY a.id, u.id, st.id, su.id
      ORDER BY a.appointment_date DESC, a.start_time DESC
      LIMIT 100
    `;
    const { rows } = await client.query(query, [tenantId]);
    return rows;
  }

  // Heuristic only: actual_start_time/actual_end_time are unpopulated
  // (dead columns), so "elapsed" is measured against the *scheduled*
  // start_time, not real service timing. An appointment is "stuck" if
  // it's still in_progress after its scheduled end time has passed.
  async getStuckInProgress(tenantId, client = db) {
    const query = `
      SELECT ${this._staffAppointmentSelect()},
        (EXTRACT(EPOCH FROM (NOW() - (a.appointment_date + a.start_time))) / 60)::INT AS "elapsedMinutes"
      ${this._staffAppointmentJoins()}
      WHERE a.tenant_id = $1
        AND a.status = 'in_progress'
        AND (a.appointment_date + a.end_time) < NOW()
      GROUP BY a.id, u.id, st.id, su.id
      ORDER BY a.appointment_date ASC, a.start_time ASC
      LIMIT 100
    `;
    const { rows } = await client.query(query, [tenantId]);
    return rows;
  }

    // ============================================================
  // GET APPOINTMENT FOR INVOICE — includes package name join
  // (not needed by the general-purpose getAppointmentById)
  // ============================================================
  async getAppointmentForInvoice(tenantId, id, client = db) {
    const query = `
      SELECT
        a.id,
        a.customer_id AS "customerId",
        u.full_name AS "customerName",
        u.phone AS "customerPhone",
        su.full_name AS "staffName",
        TO_CHAR(a.appointment_date, 'YYYY-MM-DD') AS "date",
        TO_CHAR(a.start_time, 'HH12:MI AM') AS "startTime",
        TO_CHAR(a.end_time, 'HH12:MI AM') AS "endTime",
        a.status,
        a.total_price AS "amount",
        a.paid_amount AS "paidAmount",
        a.payment_status AS "paymentStatus",
        a.is_package_appointment AS "isPackageAppointment",
        p.name AS "packageName",
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'serviceId', srv.id,
            'serviceName', srv.name,
            'price', aps.service_price
          )) FILTER (WHERE srv.id IS NOT NULL),
          '[]'::json
        ) AS services
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      LEFT JOIN staff st ON a.staff_id = st.id
      LEFT JOIN users su ON st.user_id = su.id
      LEFT JOIN appointment_services aps ON aps.appointment_id = a.id AND aps.tenant_id = a.tenant_id
      LEFT JOIN services srv ON aps.service_id = srv.id AND srv.tenant_id = a.tenant_id
      LEFT JOIN customer_packages cp ON cp.id = a.customer_package_id AND cp.tenant_id = a.tenant_id
      LEFT JOIN packages p ON p.id = cp.package_id
      WHERE a.id = $1 AND a.tenant_id = $2
      GROUP BY a.id, u.id, su.id, p.name
    `;
    const { rows } = await client.query(query, [id, tenantId]);
    return rows[0] || null;
  }
}

module.exports = new AppointmentRepository();
