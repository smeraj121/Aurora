const db = require('../config/db');

class AppointmentPackageRepository {
  async consumeSessions(tenantId, customerPackageId, count, client = db) {
    const query = `
      UPDATE customer_packages
      SET 
        used_sessions = used_sessions + $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 
        AND tenant_id = $3 
        AND (used_sessions + $1) <= total_sessions
        AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)
      RETURNING id, total_sessions, used_sessions, (total_sessions - used_sessions) AS "remainingSessions"
    `;
    const { rows } = await client.query(query, [count, customerPackageId, tenantId]);
    return rows[0] || null;
  }

   async restoreSessions(tenantId, customerPackageId, count, client = db) {
    const query = `
      UPDATE customer_packages
      SET 
        used_sessions = used_sessions - $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 
        AND tenant_id = $3
        AND used_sessions >= $1
      RETURNING id, total_sessions, used_sessions, (total_sessions - used_sessions) AS "remainingSessions"
    `;
    const { rows } = await client.query(query, [count, customerPackageId, tenantId]);
    return rows[0] || null;
  }

  // Per‑service usage: increment used_quantity for the given service IDs
  async incrementServiceUsage(client, tenantId, customerPackageId, serviceIds) {
    if (!serviceIds || serviceIds.length === 0) return;
    const query = `
      UPDATE customer_package_services
      SET used_quantity = used_quantity + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE customer_package_id = $1
        AND tenant_id = $2
        AND service_id = ANY($3::int[])
        AND used_quantity < total_quantity
      RETURNING id;
    `;
    const { rows } = await client.query(query, [customerPackageId, tenantId, serviceIds]);
    return rows;
  }

  // Per‑service usage: decrement used_quantity
  async decrementServiceUsage(client, tenantId, customerPackageId, serviceIds) {
    if (!serviceIds || serviceIds.length === 0) return;
    const query = `
      UPDATE customer_package_services
      SET used_quantity = used_quantity - 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE customer_package_id = $1
        AND tenant_id = $2
        AND service_id = ANY($3::int[])
        AND used_quantity > 0
      RETURNING id;
    `;
    const { rows } = await client.query(query, [customerPackageId, tenantId, serviceIds]);
    return rows;
  }
}

module.exports = new AppointmentPackageRepository();