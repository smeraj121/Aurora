const db = require('../config/db');

class AppointmentRepository {

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
        updated_by = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13 AND tenant_id = $14
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

  async replaceAppointmentServices(tenantId, appointmentId, services, customerPackageId, client = db) {
    await client.query(`DELETE FROM appointment_services WHERE appointment_id = $1`, [appointmentId]);

    if (!services || services.length === 0) return;

    const values = [];
    const valueStrings = services.map((s, idx) => {
      const offset = idx * 5;
      values.push(tenantId, appointmentId, s.serviceId, s.price, customerPackageId || null);
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`;
    });

    const query = `
      INSERT INTO appointment_services (
        tenant_id,
        appointment_id,
        service_id,
        service_price,
        customer_package_id
      ) VALUES ${valueStrings.join(', ')}
    `;
    await client.query(query, values);
  }
}

module.exports = new AppointmentRepository();