const db = require('../config/db');

class StaffRepository {
  async findAll() {
    const query = `
      SELECT 
        id,
        name,
        email,
        phone,
        role,
        avatar_color AS "avatarColor",
        is_active AS "isActive"
      FROM staff
      WHERE is_active = TRUE
      ORDER BY name ASC;
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  async findById(id) {
    const query = `
      SELECT id, name, email, phone, role, avatar_color AS "avatarColor"
      FROM staff
      WHERE id = $1;
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }
}

module.exports = new StaffRepository();