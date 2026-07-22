const db = require('../config/db');

class CalendarRepository {
  async findScheduleByDate(date) {
    const query = `
      SELECT 
        a.id,
        c.id AS "customerId",
        c.full_name AS "customerName",
        c.phone AS "customerPhone",
        s.id AS "staffId",
        s.name AS "staffName",
        srv.id AS "serviceId",
        srv.name AS "serviceName",
        a.time_slot AS "startTime",
        a.duration_minutes AS "durationMinutes",
        a.status,
        a.total_price AS "amount",
        a.notes
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      LEFT JOIN staff s ON a.staff_id = s.id
      LEFT JOIN appointment_services aps ON aps.appointment_id = a.id
      LEFT JOIN services srv ON aps.service_id = srv.id
      WHERE a.appointment_date = $1
      ORDER BY a.time_slot ASC;
    `;
    const { rows } = await db.query(query, [date]);
    return rows;
  }

  async findCustomerById(id) {
    const { rows } = await db.query(`SELECT id FROM customers WHERE id = $1`, [id]);
    return rows[0] || null;
  }

  async findCustomerByPhone(phone) {
    const { rows } = await db.query(`SELECT id, full_name FROM customers WHERE phone = $1`, [phone]);
    return rows[0] || null;
  }

  async createCustomer(fullName, phone) {
    const { rows } = await db.query(
      `INSERT INTO customers (full_name, phone) VALUES ($1, $2) RETURNING id`,
      [fullName, phone]
    );
    return rows[0];
  }

  async linkAppointmentService(appointmentId, serviceId, price) {
    if (!serviceId) return;
    const query = `
      INSERT INTO appointment_services (appointment_id, service_id, service_price)
      VALUES ($1, $2, $3)
      ON CONFLICT (appointment_id, service_id) DO UPDATE SET service_price = EXCLUDED.service_price;
    `;
    await db.query(query, [appointmentId, serviceId, price]);
  }

  // Inside CalendarRepository class:

async createAppointment(data) {
  const query = `
    INSERT INTO appointments (customer_id, staff_id, appointment_date, time_slot, total_price, notes, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id;
  `;
  const values = [
    data.customerId,
    data.staffId,
    data.date,
    data.startTime,
    data.amount,
    data.notes,
    data.status
  ];
  const { rows } = await db.query(query, values);
  const appointmentId = rows[0].id;

  // Link selected service if serviceId is provided
  if (data.serviceId) {
    const parseServiceId = parseInt(String(data.serviceId).replace(/\D/g, ''), 10);
    if (parseServiceId) {
      await db.query(
        `INSERT INTO appointment_services (appointment_id, service_id, service_price) 
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING;`,
        [appointmentId, parseServiceId, data.amount || 0]
      );
    }
  }

  return rows[0];
}

  async updateAppointment(id, data) {
    const query = `
      UPDATE appointments
      SET 
        customer_id = $1,
        staff_id = $2, 
        appointment_date = $3, 
        time_slot = $4, 
        total_price = $5, 
        notes = $6, 
        status = $7
      WHERE id = $8
      RETURNING id;
    `;
    const values = [
      data.customerId,
      data.staffId,
      data.date,
      data.startTime,
      data.amount,
      data.notes,
      data.status,
      id
    ];
    const { rows } = await db.query(query, values);
    const appointment = rows[0];

    // Update service link
    if (data.serviceId) {
      await this.linkAppointmentService(id, data.serviceId, data.amount);
    }

    return appointment;
  }
}

module.exports = new CalendarRepository();