// repositories/dashboardRepository.js
const db = require('../config/db');

class DashboardRepository {
  async getSummaryStats(date) {
    const query = `
      SELECT 
        COUNT(*) AS "totalBookings",
        COALESCE(SUM(CASE WHEN status != 'cancelled' THEN paid_amount ELSE 0 END), 0) AS "totalRevenue",
        COUNT(CASE WHEN status = 'completed' THEN 1 END) AS "completedCount",
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) AS "upcomingCount",
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) AS "inProgressCount",
        COUNT(DISTINCT customer_id) AS "activeClients"
      FROM appointments
      WHERE appointment_date = $1;
    `;
    const { rows } = await db.query(query, [date]);
    return rows[0] || {
      totalBookings: 0,
      totalRevenue: 0,
      completedCount: 0,
      upcomingCount: 0,
      inProgressCount: 0,
      activeClients: 0
    };
  }

  async getRevenueComparison(date) {
    const currentMonthQuery = `
      SELECT 
        COALESCE(SUM(paid_amount), 0) AS "currentMonthRevenue"
      FROM appointments
      WHERE appointment_date >= date_trunc('month', $1::date)
        AND appointment_date < date_trunc('month', $1::date) + interval '1 month'
        AND status != 'cancelled';
    `;
    const currentResult = await db.query(currentMonthQuery, [date]);
    const currentMonthRevenue = currentResult.rows[0]?.currentMonthRevenue || 0;

    const previousMonthQuery = `
      SELECT 
        COALESCE(SUM(paid_amount), 0) AS "previousMonthRevenue"
      FROM appointments
      WHERE appointment_date >= date_trunc('month', $1::date) - interval '1 month'
        AND appointment_date < date_trunc('month', $1::date)
        AND status != 'cancelled';
    `;
    const previousResult = await db.query(previousMonthQuery, [date]);
    const previousMonthRevenue = previousResult.rows[0]?.previousMonthRevenue || 0;

    return {
      currentMonthRevenue,
      previousMonthRevenue
    };
  }

  async getNewClientsCount(date) {
    const query = `
      SELECT COUNT(*) AS "newClients"
      FROM customers
      WHERE created_at >= date_trunc('month', $1::date)
        AND created_at < date_trunc('month', $1::date) + interval '1 month';
    `;
    const { rows } = await db.query(query, [date]);
    return rows[0]?.newClients || 0;
  }

  async getRecentActivity(limit = 5) {
    const query = `
      SELECT 
        a.id,
        c.full_name AS "clientName",
        s.name AS "service",
        a.status,
        a.paid_amount AS "price",
        a.time_slot AS "time",
        a.appointment_date AS "date"
      FROM appointments a
      JOIN customers c ON c.id = a.customer_id
      JOIN appointment_services ap ON ap.appointment_id = a.id
      JOIN services s ON s.id = ap.service_id
      WHERE a.status NOT IN ('cancelled')
      ORDER BY a.created_at DESC
      LIMIT $1;
    `;
    const { rows } = await db.query(query, [limit]);
    return rows;
  }

  async getRevenueChartData(date) {
    const query = `
      SELECT 
        TO_CHAR(appointment_date, 'Dy') AS "day",
        COALESCE(SUM(paid_amount), 0) AS "revenue",
        COALESCE(ROUND(AVG(SUM(paid_amount)) OVER () * 1.2), 0) AS "target"
      FROM appointments
      WHERE appointment_date >= $1::date - interval '6 days'
        AND appointment_date <= $1::date
        AND status != 'cancelled'
      GROUP BY appointment_date
      ORDER BY appointment_date;
    `;
    const { rows } = await db.query(query, [date]);
    
    if (rows.length === 0) {
      return [
        { day: 'Mon', revenue: 0, target: 0 },
        { day: 'Tue', revenue: 0, target: 0 },
        { day: 'Wed', revenue: 0, target: 0 },
        { day: 'Thu', revenue: 0, target: 0 },
        { day: 'Fri', revenue: 0, target: 0 },
        { day: 'Sat', revenue: 0, target: 0 },
        { day: 'Sun', revenue: 0, target: 0 }
      ];
    }
    
    return rows;
  }
}

module.exports = new DashboardRepository();