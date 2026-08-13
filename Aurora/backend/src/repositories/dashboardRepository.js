// repositories/dashboardRepository.js
const db = require('../config/db');

class DashboardRepository {
  async getSummaryStats(tenantId, date) {
    const query = `
      SELECT
        COUNT(*) AS "totalBookings",
        COALESCE(SUM(CASE WHEN status != 'cancelled' THEN paid_amount ELSE 0 END), 0) AS "totalRevenue",
        COUNT(CASE WHEN status = 'completed' THEN 1 END) AS "completedCount",
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) AS "upcomingCount",
        COUNT(DISTINCT customer_id) AS "activeClients"
      FROM appointments
      WHERE tenant_id = $1
        AND appointment_date = $2
    `;
    const { rows } = await db.query(query, [tenantId, date]);
    return rows[0] || {
      totalBookings: 0,
      totalRevenue: 0,
      completedCount: 0,
      upcomingCount: 0,
      activeClients: 0,
    };
  }

  async getRevenueComparison(tenantId, date) {
    const currentMonthQuery = `
      SELECT 
        COALESCE(SUM(paid_amount), 0) AS "currentMonthRevenue"
      FROM appointments
      WHERE tenant_id = $1
        AND appointment_date >= date_trunc('month', $2::date)
        AND appointment_date < date_trunc('month', $2::date) + interval '1 month'
        AND status != 'cancelled';
    `;
    const currentResult = await db.query(currentMonthQuery, [tenantId, date]);
    const currentMonthRevenue = currentResult.rows[0]?.currentMonthRevenue || 0;

    const previousMonthQuery = `
      SELECT 
        COALESCE(SUM(paid_amount), 0) AS "previousMonthRevenue"
      FROM appointments
      WHERE tenant_id = $1
        AND appointment_date >= date_trunc('month', $2::date) - interval '1 month'
        AND appointment_date < date_trunc('month', $2::date)
        AND status != 'cancelled';
    `;
    const previousResult = await db.query(previousMonthQuery, [tenantId, date]);
    const previousMonthRevenue = previousResult.rows[0]?.previousMonthRevenue || 0;

    return {
      currentMonthRevenue,
      previousMonthRevenue
    };
  }

  async getNewClientsCount(tenantId, date) {
    const query = `
      SELECT COUNT(*) AS "newClients"
      FROM customers
      WHERE tenant_id = $1
        AND created_at >= date_trunc('month', $2::date)
        AND created_at < date_trunc('month', $2::date) + interval '1 month';
    `;
    const { rows } = await db.query(query, [tenantId, date]);
    return rows[0]?.newClients || 0;
  }

  async getRecentActivity(tenantId, limit = 5) {
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
        AND a.tenant_id = $1
      ORDER BY a.created_at DESC
      LIMIT $2;
    `;
    const { rows } = await db.query(query, [tenantId, limit]);
    return rows;
  }

  async getRevenueChartData(tenantId, date) {
    const query = `
    WITH dates AS (
      SELECT generate_series(
        $2::date - interval '6 days',
        $2::date,
        interval '1 day'
      )::date AS appointment_date
    ),
    daily_revenue AS (
      SELECT
        appointment_date,
        COALESCE(SUM(total_price), 0) AS total,
        COALESCE(SUM(paid_amount), 0) AS paid
      FROM appointments
      WHERE tenant_id = $1
        AND appointment_date >= $2::date - interval '6 days'
        AND appointment_date <= $2::date
        AND status != 'cancelled'
      GROUP BY appointment_date
    )
    SELECT
      TO_CHAR(d.appointment_date, 'Dy') AS "day",
      COALESCE(r.total, 0) AS "total",
      COALESCE(r.paid, 0) AS "paid",
      COALESCE(r.total, 0) - COALESCE(r.paid, 0) AS "pending"
    FROM dates d
    LEFT JOIN daily_revenue r
      ON r.appointment_date = d.appointment_date
    ORDER BY d.appointment_date;
  `;

    const { rows } = await db.query(query, [tenantId, date]);

    return rows;
  }
}

module.exports = new DashboardRepository();