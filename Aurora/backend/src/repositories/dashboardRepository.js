const db = require('../config/db');

class DashboardRepository {
  async getSummaryStats(date) {
    const query = `
      SELECT 
        COUNT(*) AS "totalBookings",
        COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN price ELSE 0 END), 0) AS "totalRevenue",
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) AS "completedCount",
        COUNT(CASE WHEN status = 'Confirmed' THEN 1 END) AS "upcomingCount",
        COUNT(CASE WHEN status = 'In Progress' THEN 1 END) AS "inProgressCount"
      FROM appointments
      WHERE appointment_date = $1;
    `;
    const { rows } = await db.query(query, [date]);
    return rows[0];
  }

  async getRecentActivity(limit = 5) {
    const query = `
      SELECT 
        a.id,
        a.client_name AS "clientName",
        a.service,
        a.status,
        a.price,
        a.time_slot AS "time"
      FROM appointments a
      ORDER BY a.created_at DESC
      LIMIT $1;
    `;
    const { rows } = await db.query(query, [limit]);
    return rows;
  }
}

module.exports = new DashboardRepository();