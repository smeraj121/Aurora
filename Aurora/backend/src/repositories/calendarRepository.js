// repositories/calendarRepository.js
const db = require('../config/db');

class CalendarRepository {
  // ============================================================
  // FIND SCHEDULE BY DATE (with tenant)
  // ============================================================
  async findScheduleByDate(tenantId, date, includeCancelled = false) {
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
      a.customer_notes AS "notes",
      COALESCE(
        (
          SELECT json_agg(json_build_object(
            'serviceId', srv.id,
            'serviceName', srv.name,
            'price', aps.service_price,
            'isPackage', aps.is_package_usage
          ))
          FROM appointment_services aps
          JOIN services srv ON aps.service_id = srv.id
          WHERE aps.appointment_id = a.id
        ),
        '[]'::json
      ) AS services
    FROM appointments a
    JOIN customers c ON a.customer_id = c.id
    JOIN users u ON c.user_id = u.id
    LEFT JOIN staff st ON a.staff_id = st.id
    LEFT JOIN users su ON st.user_id = su.id
    LEFT JOIN customer_packages cp ON cp.id = a.customer_package_id
    LEFT JOIN packages p ON p.id = cp.package_id
    WHERE a.tenant_id = $1 AND a.appointment_date = $2
      ${includeCancelled ? '' : "AND a.status NOT IN ('cancelled')"}
    ORDER BY a.start_time ASC;
  `;

  const { rows } = await db.query(query, [tenantId, date]);
  return rows;
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