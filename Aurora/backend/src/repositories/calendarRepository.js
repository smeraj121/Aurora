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
        COALESCE(a.duration_minutes, srv.duration_minutes, 30) AS "durationMinutes",
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
      ON CONFLICT (appointment_id, service_id) 
      DO UPDATE SET service_price = EXCLUDED.service_price;
    `;
    await db.query(query, [appointmentId, serviceId, price]);
  }

  async createAppointment(data) {
    const query = `
      INSERT INTO appointments (
        customer_id, staff_id, appointment_date, time_slot, duration_minutes, total_price, notes, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id;
    `;
    const values = [
      data.customerId,
      data.staffId,
      data.date,
      data.startTime,
      data.durationMinutes,
      data.amount,
      data.notes,
      data.status
    ];
    const { rows } = await db.query(query, values);
    const appointment = rows[0];

    if (data.serviceId) {
      await this.linkAppointmentService(appointment.id, data.serviceId, data.amount);
    }

    return appointment;
  }

  async updateAppointment(id, data) {
    const query = `
      UPDATE appointments
      SET 
        customer_id = $1,
        staff_id = $2, 
        appointment_date = $3, 
        time_slot = $4, 
        duration_minutes = $5,
        total_price = $6, 
        notes = $7, 
        status = $8
      WHERE id = $9
      RETURNING id;
    `;
    const values = [
      data.customerId,
      data.staffId,
      data.date,
      data.startTime,
      data.durationMinutes,
      data.amount,
      data.notes,
      data.status,
      id
    ];
    const { rows } = await db.query(query, values);
    const appointment = rows[0];

    if (data.serviceId) {
      await this.linkAppointmentService(id, data.serviceId, data.amount);
    }

    return appointment;
  }
}

module.exports = new CalendarRepository();