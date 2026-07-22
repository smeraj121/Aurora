const db = require('../config/db');

class CustomerRepository {
  // Fetch all customers with their total stats & search support
  async findAll(searchQuery = '') {
    let query = `
      SELECT 
        c.id,
        c.full_name AS "fullName",
        c.phone,
        c.email,
        c.notes,
        c.total_visits AS "totalVisits",
        c.total_spent AS "totalSpent",
        c.last_visit_date AS "lastVisitDate",
        c.created_at AS "createdAt"
      FROM customers c
    `;
    const params = [];

    if (searchQuery) {
      query += ` WHERE LOWER(c.full_name) LIKE $1 OR c.phone LIKE $1`;
      params.push(`%${searchQuery.toLowerCase()}%`);
    }

    query += ` ORDER BY c.created_at DESC;`;
    const { rows } = await db.query(query, params);
    return rows;
  }

  // Get single customer with full booking history
  async findByIdWithHistory(id) {
    const customerQuery = `
      SELECT 
        id, full_name AS "fullName", phone, email, notes,
        total_visits AS "totalVisits", total_spent AS "totalSpent",
        last_visit_date AS "lastVisitDate"
      FROM customers WHERE id = $1;
    `;
    const historyQuery = `
      SELECT 
        a.id, a.appointment_date AS "date", a.time_slot AS "time",
        a.service, a.status, a.total_price AS "price",
        s.name AS "staffName"
      FROM appointments a
      LEFT JOIN staff s ON a.staff_id = s.id
      WHERE a.customer_id = $1
      ORDER BY a.appointment_date DESC;
    `;

    const [customerRes, historyRes] = await Promise.all([
      db.query(customerQuery, [id]),
      db.query(historyQuery, [id]),
    ]);

    if (customerRes.rows.length === 0) return null;

    return {
      ...customerRes.rows[0],
      history: historyRes.rows,
    };
  }

  // Find existing by phone or create new
  async findOrCreate(data) {
    const findQuery = `SELECT id, full_name, phone FROM customers WHERE phone = $1;`;
    const { rows } = await db.query(findQuery, [data.phone]);

    if (rows.length > 0) {
      return rows[0];
    }

    const insertQuery = `
      INSERT INTO customers (full_name, phone, email, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING id, full_name AS "fullName", phone, email;
    `;
    const created = await db.query(insertQuery, [
      data.fullName || data.clientName,
      data.phone,
      data.email || null,
      data.notes || '',
    ]);
    return created.rows[0];
  }

  async create(data) {
    const query = `
      INSERT INTO customers (full_name, phone, email, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING 
        id, full_name AS "fullName", phone, email, notes,
        total_visits AS "totalVisits", total_spent AS "totalSpent";
    `;
    const { rows } = await db.query(query, [
      data.fullName,
      data.phone,
      data.email || null,
      data.notes || '',
    ]);
    return rows[0];
  }

  async update(id, data) {
    const query = `
      UPDATE customers
      SET 
        full_name = COALESCE($1, full_name),
        phone = COALESCE($2, phone),
        email = COALESCE($3, email),
        notes = COALESCE($4, notes)
      WHERE id = $5
      RETURNING id, full_name AS "fullName", phone, email, notes;
    `;
    const { rows } = await db.query(query, [
      data.fullName,
      data.phone,
      data.email,
      data.notes,
      id,
    ]);
    return rows[0];
  }

  // Recalculates stats from completed appointments
  async syncCustomerStats(customerId) {
    const query = `
      UPDATE customers
      SET 
        total_visits = (
          SELECT COUNT(*) FROM appointments 
          WHERE customer_id = $1 AND status = 'Completed'
        ),
        total_spent = (
          SELECT COALESCE(SUM(total_price), 0) FROM appointments 
          WHERE customer_id = $1 AND status = 'Completed'
        ),
        last_visit_date = (
          SELECT MAX(appointment_date) FROM appointments 
          WHERE customer_id = $1 AND status = 'Completed'
        )
      WHERE id = $1;
    `;
    await db.query(query, [customerId]);
  }
}

module.exports = new CustomerRepository();