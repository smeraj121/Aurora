const db = require('../config/db');

class AppointmentRepository {
  async findAllByDate(date) {
    const query = `
      SELECT 
        a.id,
        a.client_name AS "clientName",
        a.phone,
        a.service,
        a.staff_id AS "staffId",
        a.appointment_date AS "date",
        a.time_slot AS "time",
        a.duration_minutes AS "durationMinutes",
        a.status,
        a.price,
        a.notes
      FROM appointments a
      WHERE a.appointment_date = $1
      ORDER BY a.time_slot ASC;
    `;
    const { rows } = await db.query(query, [date]);
    return rows;
  }

  async findById(id) {
    const query = `SELECT * FROM appointments WHERE id = $1;`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  async create(data) {
    const query = `
      INSERT INTO appointments 
        (client_name, phone, service, staff_id, appointment_date, time_slot, duration_minutes, status, price, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING 
        id, 
        client_name AS "clientName", 
        phone, 
        service, 
        staff_id AS "staffId", 
        time_slot AS "time", 
        status, 
        price, 
        notes;
    `;
    const values = [
      data.clientName,
      data.phone,
      data.service,
      data.staffId,
      data.date,
      data.time,
      data.durationMinutes || 60,
      data.status || 'Confirmed',
      data.price || 0,
      data.notes || '',
    ];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  async update(id, data) {
    const query = `
      UPDATE appointments 
      SET 
        client_name = COALESCE($1, client_name),
        phone = COALESCE($2, phone),
        service = COALESCE($3, service),
        staff_id = COALESCE($4, staff_id),
        time_slot = COALESCE($5, time_slot),
        status = COALESCE($6, status),
        price = COALESCE($7, price),
        notes = COALESCE($8, notes)
      WHERE id = $9
      RETURNING 
        id, 
        client_name AS "clientName", 
        phone, 
        service, 
        staff_id AS "staffId", 
        time_slot AS "time", 
        status, 
        price, 
        notes;
    `;
    const values = [
      data.clientName,
      data.phone,
      data.service,
      data.staffId,
      data.time,
      data.status,
      data.price,
      data.notes,
      id,
    ];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  async delete(id) {
    const query = `DELETE FROM appointments WHERE id = $1 RETURNING id;`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = new AppointmentRepository();