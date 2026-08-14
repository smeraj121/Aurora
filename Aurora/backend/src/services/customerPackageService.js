const db = require('../config/db');
const customerRepository = require('../repositories/customerRepository');
const customerPackageRepository = require('../repositories/customerPackageRepository');
const { ConflictError, NotFoundError, ValidationError } = require('../errors');

// ============================================================
// GET CUSTOMER PACKAGES
// ============================================================
async function getCustomerPackages(tenantId, customerId, includeExpired = false) {
  const customer = await customerRepository.getCustomerDetails(tenantId, customerId);
  if (!customer) {
    throw new NotFoundError('Customer not found');
  }
  return customerPackageRepository.getCustomerPackages(tenantId, customerId, includeExpired);
}

// ============================================================
// GET CUSTOMER PACKAGE BY ID
// ============================================================
async function getCustomerPackageById(tenantId, packageId) {
  const pkg = await customerPackageRepository.getCustomerPackageById(tenantId, packageId);
  if (!pkg) {
    throw new NotFoundError('Customer package not found');
  }
  return pkg;
}

// ============================================================
// ASSIGN PACKAGE TO CUSTOMER
// ============================================================
async function assignPackageToCustomer(tenantId, data, userId) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    if (!data.customerId) {
      throw new ValidationError('Customer ID is required');
    }
    if (!data.packageId) {
      throw new ValidationError('Package ID is required');
    }

    const customer = await customerRepository.getCustomerDetails(tenantId, data.customerId);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    const existingPackages = await customerPackageRepository.getCustomerPackages(tenantId, data.customerId);
    const alreadyHasPackage = existingPackages.some(p => p.packageId === data.packageId && p.remainingSessions > 0);
    if (alreadyHasPackage) {
      throw new ConflictError('Customer already has an active instance of this package');
    }

    if (data.customPrice !== undefined && data.customPrice < 0) {
      throw new ValidationError('Custom price cannot be negative');
    }

    const result = await customerPackageRepository.assignPackageToCustomer(tenantId, data, userId, client);

    // Update customer stats (total_spent etc.) after assignment
    await customerRepository.recalculateCustomerStats(tenantId, data.customerId);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// ============================================================
// UPDATE CUSTOMER PACKAGE
// ============================================================
async function updateCustomerPackage(tenantId, packageId, data, userId) {
  const existing = await customerPackageRepository.getCustomerPackageById(tenantId, packageId);
  if (!existing) {
    throw new NotFoundError('Customer package not found');
  }

  // Start a transaction at service level
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Perform the update with the transaction client
    const updatedPackage = await customerPackageRepository.updateCustomerPackage(
      tenantId,
      packageId,
      data,
      userId,
      client  // pass the client to reuse the transaction
    );

    // Recalculate customer stats using the same transaction
    await customerRepository.recalculateCustomerStats(tenantId, existing.customerId, client);

    // Commit all changes
    await client.query('COMMIT');

    return updatedPackage;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// ============================================================
// USE PACKAGE SESSION
// ============================================================
async function usePackageSession(tenantId, customerPackageId) {
  return customerPackageRepository.usePackageSession(tenantId, customerPackageId);
}

module.exports = {
  getCustomerPackages,
  getCustomerPackageById,
  assignPackageToCustomer,
  updateCustomerPackage,
  usePackageSession,
};