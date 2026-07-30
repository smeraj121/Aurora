const dbPool = require('../config/db');
const customerRepository = require('../repositories/customerRepository');
const { ConflictError, NotFoundError, ValidationError } = require('../errors');

// ============================================================
// GET CUSTOMERS (with search)
// ============================================================
async function getCustomers(tenantId, search = '') {
  return customerRepository.getCustomers(tenantId, search);
}

// ============================================================
// GET CUSTOMER BY ID (with full details, history, packages, stats)
// ============================================================
async function getCustomer(tenantId, id) {
  const customer = await customerRepository.getCustomerDetails(tenantId, id);
  if (!customer) {
    throw new NotFoundError('Customer not found');
  }

  // Compute additional fields
  const averageTicket = Math.round(customer.totalSpent / (customer.totalVisits || 1));

  // Fetch history, packages, stats in parallel
  const [history, packages, stats] = await Promise.all([
    customerRepository.getCustomerHistory(tenantId, id),
    customerRepository.getCustomerPackages(tenantId, id),
    customerRepository.getCustomerStats(tenantId, id),
  ]);

  return {
    ...customer,
    averageTicket,
    history,
    packages,
    stats,
    isVip: customer.totalVisits > 10 || customer.totalSpent > 50000, // example VIP logic
  };
}

// ============================================================
// GET CUSTOMER HISTORY
// ============================================================
async function getCustomerHistory(tenantId, id) {
  const customer = await customerRepository.getCustomerDetails(tenantId, id);
  if (!customer) {
    throw new NotFoundError('Customer not found');
  }
  return customerRepository.getCustomerHistory(tenantId, id);
}

// ============================================================
// GET CUSTOMER PACKAGES
// ============================================================
async function getCustomerPackages(tenantId, id, includeExpired = false) {
  const customer = await customerRepository.getCustomerDetails(tenantId, id);
  if (!customer) {
    throw new NotFoundError('Customer not found');
  }
  return customerRepository.getCustomerPackages(tenantId, id, includeExpired);
}

// ============================================================
// GET CUSTOMER PACKAGE BY ID
// ============================================================
async function getCustomerPackageById(tenantId, packageId) {
  const pkg = await customerRepository.getCustomerPackageById(tenantId, packageId);
  if (!pkg) {
    throw new NotFoundError('Customer package not found');
  }
  return pkg;
}

// ============================================================
// CREATE CUSTOMER
// ============================================================
async function createCustomer(tenantId, data, userId) {
  // Validate required fields
  if (!data.fullName) {
    throw new ValidationError('Full name is required');
  }
  if (!data.phone) {
    throw new ValidationError('Phone number is required');
  }

  // Check uniqueness of phone
  const existingPhone = await customerRepository.findCustomerByPhone(tenantId, data.phone);
  if (existingPhone) {
    throw new ConflictError(`Customer with phone ${data.phone} already exists`);
  }

  // Check uniqueness of email if provided
  if (data.email) {
    const existingEmail = await customerRepository.findCustomerByEmail(tenantId, data.email);
    if (existingEmail) {
      throw new ConflictError(`Customer with email ${data.email} already exists`);
    }
  }

  // If preferred staff is provided, validate it exists (optional)
  if (data.preferredStaffId) {
    // You could add a repository method to check staff existence, but we'll skip for brevity
    // For now, we trust the repository will handle FK constraint.
  }

  return customerRepository.createCustomer(tenantId, data, userId);
}

// ============================================================
// UPDATE CUSTOMER
// ============================================================
async function updateCustomer(tenantId, id, data, userId) {
  // Check if customer exists
  const existing = await customerRepository.getCustomerDetails(tenantId, id);
  if (!existing) {
    throw new NotFoundError('Customer not found');
  }

  // Check phone uniqueness if updating phone
  if (data.phone && data.phone !== existing.phone) {
    const phoneMatch = await customerRepository.findCustomerByPhone(tenantId, data.phone);
    if (phoneMatch && phoneMatch.id !== parseInt(id, 10)) {
      throw new ConflictError(`Customer with phone ${data.phone} already exists`);
    }
  }

  // Check email uniqueness if updating email
  if (data.email && data.email !== existing.email) {
    const emailMatch = await customerRepository.findCustomerByEmail(tenantId, data.email);
    if (emailMatch && emailMatch.id !== parseInt(id, 10)) {
      throw new ConflictError(`Customer with email ${data.email} already exists`);
    }
  }

  return customerRepository.updateCustomer(tenantId, id, data, userId);
}

// ============================================================
// DELETE CUSTOMER (soft delete)
// ============================================================
async function deleteCustomer(tenantId, id, userId) {
  const existing = await customerRepository.getCustomerDetails(tenantId, id);
  if (!existing) {
    throw new NotFoundError('Customer not found');
  }
  return customerRepository.deleteCustomer(tenantId, id, userId);
}

// ============================================================
// GET TOP CUSTOMERS (by spending)
// ============================================================
async function getTopCustomers(tenantId, limit = 10) {
  return customerRepository.getTopCustomers(tenantId, limit);
}

// ============================================================
// GET RECENT CUSTOMERS
// ============================================================
async function getRecentCustomers(tenantId, limit = 10) {
  return customerRepository.getRecentCustomers(tenantId, limit);
}

// ============================================================
// ASSIGN PACKAGE TO CUSTOMER
// ============================================================
async function assignPackageToCustomer(tenantId, data, userId) {
  // Validate required fields
  if (!data.customerId) {
    throw new ValidationError('Customer ID is required');
  }
  if (!data.packageId) {
    throw new ValidationError('Package ID is required');
  }

  // Validate customer exists
  const customer = await customerRepository.getCustomerDetails(tenantId, data.customerId);
  if (!customer) {
    throw new NotFoundError('Customer not found');
  }

  // Check if customer already has an active instance of this package
  const existingPackages = await customerRepository.getCustomerPackages(tenantId, data.customerId);
  const alreadyHasPackage = existingPackages.some(p => p.packageId === data.packageId && p.remainingSessions > 0);
  if (alreadyHasPackage) {
    throw new ConflictError('Customer already has an active instance of this package');
  }

  // Validate custom price if provided
  if (data.customPrice !== undefined && data.customPrice < 0) {
    throw new ValidationError('Custom price cannot be negative');
  }

  // Assign package
  const result = await customerRepository.assignPackageToCustomer(tenantId, data, userId);

  // Update customer stats after package assignment (though repository might do it internally)
  await customerRepository.updateCustomerStatsAfterPackageAssignment(tenantId, data.customerId);

  return result;
}

// ============================================================
// UPDATE CUSTOMER PACKAGE
// ============================================================
async function updateCustomerPackage(tenantId, packageId, data, userId) {
  const existing = await customerRepository.getCustomerPackageById(tenantId, packageId);
  if (!existing) {
    throw new NotFoundError('Customer package not found');
  }
  return customerRepository.updateCustomerPackage(tenantId, packageId, data, userId);
}

// ============================================================
// USE PACKAGE SESSION
// ============================================================
async function usePackageSession(tenantId, customerPackageId) {
  return customerRepository.usePackageSession(tenantId, customerPackageId);
}

// ============================================================
// GET CUSTOMER STATS (summary)
// ============================================================
async function getCustomerStats(tenantId, id) {
  const customer = await customerRepository.getCustomerDetails(tenantId, id);
  if (!customer) {
    throw new NotFoundError('Customer not found');
  }
  return customerRepository.getCustomerStats(tenantId, id);
}

// ============================================================
// UPDATE LOYALTY POINTS
// ============================================================
async function updateLoyaltyPoints(tenantId, customerId, points, userId) {
  const customer = await customerRepository.getCustomerDetails(tenantId, customerId);
  if (!customer) {
    throw new NotFoundError('Customer not found');
  }
  if (typeof points !== 'number' || points === 0) {
    throw new ValidationError('Points must be a non-zero number');
  }
  return customerRepository.updateLoyaltyPoints(tenantId, customerId, points, userId);
}

// ============================================================
// BULK UPDATE OPT-IN
// ============================================================
async function bulkUpdateOptIn(tenantId, customerIds, optInType, value, userId) {
  if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
    throw new ValidationError('Customer IDs array is required');
  }
  const validTypes = ['marketing_opt_in', 'whatsapp_opt_in', 'email_opt_in'];
  if (!validTypes.includes(optInType)) {
    throw new ValidationError(`Invalid opt-in type. Allowed: ${validTypes.join(', ')}`);
  }
  if (typeof value !== 'boolean') {
    throw new ValidationError('Value must be boolean');
  }
  return customerRepository.bulkUpdateOptIn(tenantId, customerIds, optInType, value, userId);
}

module.exports = {
  getCustomers,
  getCustomer,
  getCustomerHistory,
  getCustomerPackages,
  getCustomerPackageById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getTopCustomers,
  getRecentCustomers,
  assignPackageToCustomer,
  updateCustomerPackage,
  usePackageSession,
  getCustomerStats,
  updateLoyaltyPoints,
  bulkUpdateOptIn,
};