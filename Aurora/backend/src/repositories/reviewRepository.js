const db = require('../config/db');

class ReviewRepository {
  async findByAppointmentId(tenantId, appointmentId, client = db) {
    const query = `
      SELECT id, rating, comment, created_at AS "createdAt"
      FROM reviews
      WHERE tenant_id = $1 AND appointment_id = $2
    `;
    const { rows } = await client.query(query, [tenantId, appointmentId]);
    return rows[0] || null;
  }

  async create(tenantId, data, client = db) {
    const query = `
      INSERT INTO reviews (tenant_id, customer_id, staff_id, appointment_id, rating, comment, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, rating, comment, created_at AS "createdAt"
    `;
    const values = [
      tenantId, data.customerId, data.staffId, data.appointmentId,
      data.rating, data.comment || null, data.createdBy || null,
    ];
    const { rows } = await client.query(query, values);
    return rows[0];
  }
}

module.exports = new ReviewRepository();