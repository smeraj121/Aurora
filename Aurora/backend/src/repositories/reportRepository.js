const db = require('../config/db');

class ReportRepository {
  // ============================================================
  // SUMMARY (Gross Revenue, Total Bookings) — reused for current
  // and previous period by passing different date ranges.
  // ============================================================
  async getSummary(tenantId, startDate, endDate) {
    const query = `
      SELECT
        COUNT(*) FILTER (WHERE a.status NOT IN ('cancelled')) AS "totalBookings",
        COALESCE(SUM(a.total_price) FILTER (WHERE a.status NOT IN ('cancelled')), 0) AS "grossRevenue"
      FROM appointments a
      WHERE a.tenant_id = $1
        AND a.appointment_date BETWEEN $2 AND $3
    `;
    const { rows } = await db.query(query, [tenantId, startDate, endDate]);
    return rows[0];
  }

  // ============================================================
  // TREND — adaptive granularity via date_trunc
  // ============================================================
  async getTrend(tenantId, startDate, endDate, granularity) {
    const query = `
      SELECT
        TO_CHAR(date_trunc($4, a.appointment_date), 'YYYY-MM-DD') AS "periodStart",
        COUNT(*) FILTER (WHERE a.status NOT IN ('cancelled')) AS bookings,
        COALESCE(SUM(a.total_price) FILTER (WHERE a.status NOT IN ('cancelled')), 0) AS revenue
      FROM appointments a
      WHERE a.tenant_id = $1
        AND a.appointment_date BETWEEN $2 AND $3
      GROUP BY date_trunc($4, a.appointment_date)
      ORDER BY date_trunc($4, a.appointment_date)
    `;
    const { rows } = await db.query(query, [tenantId, startDate, endDate, granularity]);
    return rows;
  }

  // ============================================================
  // BOOKINGS BY DAY OF WEEK — average per weekday over the period
  // ============================================================
  async getDayOfWeek(tenantId, startDate, endDate) {
    const query = `
      WITH days AS (
        SELECT generate_series($2::date, $3::date, interval '1 day')::date AS d
      ),
      occurrences AS (
        SELECT EXTRACT(DOW FROM d)::int AS dow, COUNT(*) AS occ
        FROM days
        GROUP BY dow
      ),
      bookings AS (
        SELECT EXTRACT(DOW FROM a.appointment_date)::int AS dow, COUNT(*) AS cnt
        FROM appointments a
        WHERE a.tenant_id = $1
          AND a.appointment_date BETWEEN $2 AND $3
          AND a.status NOT IN ('cancelled')
        GROUP BY dow
      )
      SELECT
        o.dow,
        COALESCE(b.cnt, 0) AS "totalBookings",
        o.occ AS "occurrences",
        ROUND(COALESCE(b.cnt, 0)::numeric / o.occ, 1) AS "avgBookings"
      FROM occurrences o
      LEFT JOIN bookings b ON b.dow = o.dow
      ORDER BY o.dow
    `;
    const { rows } = await db.query(query, [tenantId, startDate, endDate]);
    return rows;
  }

    // ============================================================
  // SERVICE CATEGORY SHARE — with per-service breakdown for tooltips
  // ============================================================
  async getServiceCategories(tenantId, startDate, endDate) {
    const query = `
      WITH service_agg AS (
        SELECT
          COALESCE(NULLIF(TRIM(s.category), ''), 'Other') AS category,
          s.id AS service_id,
          s.name AS service_name,
          COUNT(*) AS bookings,
          COALESCE(SUM(aps.service_price), 0) AS revenue
        FROM appointments a
        JOIN appointment_services aps ON aps.appointment_id = a.id AND aps.tenant_id = a.tenant_id
        JOIN services s ON s.id = aps.service_id
        WHERE a.tenant_id = $1
          AND a.appointment_date BETWEEN $2 AND $3
          AND a.status NOT IN ('cancelled')
        GROUP BY category, s.id, s.name
      )
      SELECT
        category,
        SUM(bookings) AS bookings,
        SUM(revenue) AS revenue,
        json_agg(
          jsonb_build_object('name', service_name, 'bookings', bookings, 'revenue', revenue)
          ORDER BY bookings DESC
        ) AS services
      FROM service_agg
      GROUP BY category
      ORDER BY revenue DESC
    `;
    const { rows } = await db.query(query, [tenantId, startDate, endDate]);
    return rows;
  }

  // ============================================================
  // TOP SERVICES — ranked by booking count, revenue shown alongside
  // ============================================================
  async getTopServices(tenantId, startDate, endDate, limit) {
    const query = `
      SELECT
        s.id,
        s.name,
        COUNT(*) AS bookings,
        COALESCE(SUM(aps.service_price), 0) AS revenue
      FROM appointments a
      JOIN appointment_services aps ON aps.appointment_id = a.id AND aps.tenant_id = a.tenant_id
      JOIN services s ON s.id = aps.service_id
      WHERE a.tenant_id = $1
        AND a.appointment_date BETWEEN $2 AND $3
        AND a.status NOT IN ('cancelled')
      GROUP BY s.id, s.name
      ORDER BY bookings DESC, revenue DESC
      LIMIT $4
    `;
    const { rows } = await db.query(query, [tenantId, startDate, endDate, limit]);
    return rows;
  }

  // ============================================================
  // PACKAGE PERFORMANCE (purchases within the period)
  // ============================================================
  async getPackagePerformance(tenantId, startDate, endDate) {
    const query = `
      SELECT
        COUNT(*) AS sales,
        COALESCE(SUM(COALESCE(cp.custom_price, cp.total_price)), 0) AS revenue,
        COUNT(DISTINCT cp.customer_id) AS customers
      FROM customer_packages cp
      WHERE cp.tenant_id = $1
        AND cp.purchase_date BETWEEN $2 AND $3
    `;
    const { rows } = await db.query(query, [tenantId, startDate, endDate]);
    return rows[0];
  }

  async getTopPackages(tenantId, startDate, endDate, limit) {
    const query = `
      SELECT
        p.id,
        p.name,
        COUNT(*) AS sales,
        COALESCE(SUM(COALESCE(cp.custom_price, cp.total_price)), 0) AS revenue
      FROM customer_packages cp
      JOIN packages p ON p.id = cp.package_id
      WHERE cp.tenant_id = $1
        AND cp.purchase_date BETWEEN $2 AND $3
      GROUP BY p.id, p.name
      ORDER BY sales DESC, revenue DESC
      LIMIT $4
    `;
    const { rows } = await db.query(query, [tenantId, startDate, endDate, limit]);
    return rows;
  }

  // ============================================================
  // CUSTOMER OVERVIEW — New / Returning / Repeat / Walk-ins
  // ============================================================
  async getNewCustomerCount(tenantId, startDate, endDate, walkInPhone) {
    const query = `
      SELECT COUNT(*) AS "newCustomers"
      FROM customers c
      JOIN users u ON u.id = c.user_id
      WHERE c.tenant_id = $1
        AND u.phone != $4
        AND c.created_at::date BETWEEN $2 AND $3
    `;
    const { rows } = await db.query(query, [tenantId, startDate, endDate, walkInPhone]);
    return parseInt(rows[0].newCustomers, 10);
  }

  async getReturningCustomerCount(tenantId, startDate, endDate, walkInPhone) {
    const query = `
      SELECT COUNT(DISTINCT a.customer_id) AS "returningCustomers"
      FROM appointments a
      JOIN customers c ON c.id = a.customer_id
      JOIN users u ON u.id = c.user_id
      WHERE a.tenant_id = $1
        AND a.status = 'completed'
        AND a.appointment_date BETWEEN $2 AND $3
        AND u.phone != $4
        AND c.created_at::date < $2
    `;
    const { rows } = await db.query(query, [tenantId, startDate, endDate, walkInPhone]);
    return parseInt(rows[0].returningCustomers, 10);
  }

  async getRepeatRateStats(tenantId, startDate, endDate, walkInPhone) {
    const query = `
      SELECT
        COUNT(*) FILTER (WHERE cnt >= 2) AS "repeatCustomers",
        COUNT(*) FILTER (WHERE cnt >= 1) AS "activeCustomers"
      FROM (
        SELECT a.customer_id, COUNT(*) AS cnt
        FROM appointments a
        JOIN customers c ON c.id = a.customer_id
        JOIN users u ON u.id = c.user_id
        WHERE a.tenant_id = $1
          AND a.status = 'completed'
          AND a.appointment_date BETWEEN $2 AND $3
          AND u.phone != $4
        GROUP BY a.customer_id
      ) sub
    `;
    const { rows } = await db.query(query, [tenantId, startDate, endDate, walkInPhone]);
    return {
      repeatCustomers: parseInt(rows[0].repeatCustomers, 10),
      activeCustomers: parseInt(rows[0].activeCustomers, 10),
    };
  }

  async getWalkInVisitCount(tenantId, startDate, endDate, walkInPhone) {
    const query = `
      SELECT COUNT(*) AS "walkInVisits"
      FROM appointments a
      JOIN customers c ON c.id = a.customer_id
      JOIN users u ON u.id = c.user_id
      WHERE a.tenant_id = $1
        AND a.status NOT IN ('cancelled')
        AND a.appointment_date BETWEEN $2 AND $3
        AND u.phone = $4
    `;
    const { rows } = await db.query(query, [tenantId, startDate, endDate, walkInPhone]);
    return parseInt(rows[0].walkInVisits, 10);
  }

  // ============================================================
  // STAFF PERFORMANCE — completed appointments in period,
  // rating is all-time (see architecture note on reviews)
  // ============================================================
  async getStaffPerformance(tenantId, startDate, endDate, limit) {
    const query = `
      SELECT
        st.id,
        u.full_name AS name,
        d.name AS role,
        u.profile_image_url AS avatar,
        COUNT(*) AS "completedAppointments",
        COALESCE(SUM(a.total_price), 0) AS revenue,
        (SELECT COALESCE(ROUND(AVG(r.rating)::numeric, 1), NULL)
         FROM reviews r WHERE r.staff_id = st.id AND r.tenant_id = st.tenant_id) AS rating
      FROM appointments a
      JOIN staff st ON st.id = a.staff_id
      JOIN users u ON u.id = st.user_id
      LEFT JOIN designations d ON d.id = st.designation_id
      WHERE a.tenant_id = $1
        AND a.status = 'completed'
        AND a.appointment_date BETWEEN $2 AND $3
      GROUP BY st.id, u.full_name, u.profile_image_url, d.name
      ORDER BY "completedAppointments" DESC
      LIMIT $4
    `;
    const { rows } = await db.query(query, [tenantId, startDate, endDate, limit]);
    return rows;
  }
}

module.exports = new ReportRepository();