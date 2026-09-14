const db = require('../config/db');

class CustomerEngagementRepository {
  // ============================================================
  // BIRTHDAY — all customers with a birthday on file.
  // Window filtering happens in the service layer.
  // ============================================================
  async getCustomersWithBirthday(tenantId) {
    const query = `
      SELECT
        c.id AS "customerId",
        u.full_name AS "fullName",
        u.phone,
        u.birthday,
        c.last_visit_date AS "lastVisitDate"
      FROM customers c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.tenant_id = $1
        AND u.is_active = true
        AND u.birthday IS NOT NULL
    `;
    const { rows } = await db.query(query, [tenantId]);
    return rows;
  }

  // ============================================================
  // UPCOMING APPOINTMENT
  // ============================================================
  async getUpcomingAppointments(tenantId, withinDays) {
    const query = `
      SELECT
        a.id AS "appointmentId",
        a.appointment_date AS "appointmentDate",
        a.start_time AS "startTime",
        a.end_time AS "endTime",
        c.id AS "customerId",
        u.full_name AS "fullName",
        u.phone,
        st_u.full_name AS "staffName",
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', svc.id,
            'name', svc.name,
            'category', svc.category
          )) FILTER (WHERE svc.id IS NOT NULL),
          '[]'::json
        ) AS "services"
      FROM appointments a
      INNER JOIN customers c ON a.customer_id = c.id
      INNER JOIN users u ON c.user_id = u.id
      LEFT JOIN staff st ON a.staff_id = st.id
      LEFT JOIN users st_u ON st.user_id = st_u.id
      LEFT JOIN appointment_services aps ON aps.appointment_id = a.id
      LEFT JOIN services svc ON aps.service_id = svc.id
      WHERE a.tenant_id = $1
        AND a.status NOT IN ('cancelled')
        AND a.appointment_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + $2::int)
      GROUP BY a.id, c.id, u.full_name, u.phone, st_u.full_name
      ORDER BY a.appointment_date ASC, a.start_time ASC
    `;
    const { rows } = await db.query(query, [tenantId, withinDays]);
    return rows;
  }

  // ============================================================
  // FOLLOW-UP — customers whose last visit is old enough
  // ============================================================
  async getFollowupCandidates(tenantId, daysSinceLastVisit) {
    const query = `
      SELECT
        c.id AS "customerId",
        u.full_name AS "fullName",
        u.phone,
        c.last_visit_date AS "lastVisitDate",
        (CURRENT_DATE - c.last_visit_date) AS "daysSinceLastVisit"
      FROM customers c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.tenant_id = $1
        AND u.is_active = true
        AND c.last_visit_date IS NOT NULL
        AND (CURRENT_DATE - c.last_visit_date) >= $2
      ORDER BY c.last_visit_date ASC
    `;
    const { rows } = await db.query(query, [tenantId, daysSinceLastVisit]);
    return rows;
  }

  // ============================================================
  // Most recent non-cancelled appointment + services per customer.
  // Used for "last visit / last service" context on Birthday and
  // Follow-up cards (section 10).
  // ============================================================
  async getLastServiceForCustomers(tenantId, customerIds) {
    if (!customerIds || customerIds.length === 0) return {};

    const query = `
      SELECT DISTINCT ON (a.customer_id)
        a.customer_id AS "customerId",
        a.appointment_date AS "lastVisitDate",
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', svc.id,
            'name', svc.name,
            'category', svc.category
          )) FILTER (WHERE svc.id IS NOT NULL),
          '[]'::json
        ) AS "services"
      FROM appointments a
      LEFT JOIN appointment_services aps ON aps.appointment_id = a.id
      LEFT JOIN services svc ON aps.service_id = svc.id
      WHERE a.tenant_id = $1
        AND a.customer_id = ANY($2::int[])
        AND a.status NOT IN ('cancelled')
      GROUP BY a.id, a.customer_id, a.appointment_date
      ORDER BY a.customer_id, a.appointment_date DESC, a.start_time DESC
    `;
    const { rows } = await db.query(query, [tenantId, customerIds]);

    const map = {};
    rows.forEach(row => {
      map[row.customerId] = {
        lastVisitDate: row.lastVisitDate,
        services: row.services || [],
      };
    });
    return map;
  }
}

module.exports = new CustomerEngagementRepository();