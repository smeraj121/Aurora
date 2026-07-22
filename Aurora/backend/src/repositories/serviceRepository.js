const db = require('../config/db');

class ServiceRepository {
  // Fetch all active services
  async findAll() {
    const query = `
      SELECT 
        id, 
        name, 
        price, 
        duration_minutes AS "durationMinutes" 
      FROM services 
      ORDER BY name ASC;
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  // Find a specific service by ID
  async findById(id) {
    const query = `
      SELECT 
        id, 
        name, 
        price, 
        duration_minutes AS "durationMinutes" 
      FROM services 
      WHERE id = $1;
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }
}

module.exports = new ServiceRepository();