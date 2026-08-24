const customerRepository = require('../repositories/customerRepository');
const customerPackageRepository = require('../repositories/customerPackageRepository');
const { ConflictError, NotFoundError, ValidationError } = require('../errors');
const { parseNumericId } = require('../validators/customer.validator');

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

  const averageTicket = customer.totalVisits > 0 ? Math.round(customer.totalSpent / customer.totalVisits) : 0;

  // Fetch history, packages, stats in parallel – packages now from the package repository
  const [history, packages, stats] = await Promise.all([
    customerRepository.getCustomerHistory(tenantId, id),
    customerPackageRepository.getCustomerPackages(tenantId, id),
    customerRepository.getCustomerStats(tenantId, id),
  ]);

  return {
    ...customer,
    averageTicket,
    history,
    packages,
    stats,
    isVip: customer.totalVisits > 10 || customer.totalSpent > 50000,
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
// CREATE CUSTOMER
// ============================================================
async function createCustomer(tenantId, data, userId) {
  if (!data.fullName) {
    throw new ValidationError('Full name is required');
  }
  if (!data.phone) {
    throw new ValidationError('Phone number is required');
  }

  const existingPhone = await customerRepository.findCustomerByPhone(tenantId, data.phone);
  if (existingPhone) {
    throw new ConflictError(`Customer with phone ${data.phone} already exists`);
  }

  if (data.email) {
    const existingEmail = await customerRepository.findCustomerByEmail(tenantId, data.email);
    if (existingEmail) {
      throw new ConflictError(`Customer with email ${data.email} already exists`);
    }
  }

  return customerRepository.createCustomer(tenantId, data, userId);
}

// ============================================================
// UPDATE CUSTOMER
// ============================================================
async function updateCustomer(tenantId, id, data, userId) {
  const existing = await customerRepository.getCustomerDetails(tenantId, id);
  if (!existing) {
    throw new NotFoundError('Customer not found');
  }

  if (data.phone && data.phone !== existing.phone) {
    const phoneMatch = await customerRepository.findCustomerByPhone(tenantId, data.phone);
    if (phoneMatch && phoneMatch.id !== parseInt(id, 10)) {
      throw new ConflictError(`Customer with phone ${data.phone} already exists`);
    }
  }

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
// RESOLVE CUSTOMER (for appointment workflow)
// ============================================================
async function resolveCustomer(tenantId, data, userId, client) {
  let cleanCustomerId = parseNumericId(data.customerId);
  const cleanPhone = data.phone ? data.phone.trim() : null;
  const customerName = data.customerName ? data.customerName.trim() : null;

  // If customerId is provided, look up by ID using tenantId
  if (cleanCustomerId) {
    const existingCust = await customerRepository.getCustomerDetails(tenantId, cleanCustomerId, client);
    if (existingCust) {
      if (existingCust.isActive === false) {
        throw new ValidationError('Customer account is inactive.');
      }
      // Verify the customer actually belongs to this tenant
      if (existingCust.tenantId !== tenantId) {
        throw new ValidationError('Customer not found');
      }
      return existingCust.id;
    }
  }

  if (!customerName) {
    throw new ValidationError('Customer name is required.');
  }

  if (!cleanPhone) {
    throw new ValidationError('Phone number is required for new customers.');
  }

  // Search by phone within tenant scope
  const phoneMatch = await customerRepository.findCustomerByPhone(tenantId, cleanPhone, client);
  if (phoneMatch) {
    if (phoneMatch.fullName.toLowerCase() !== customerName.toLowerCase()) {
      throw new ConflictError(
        `A customer (${phoneMatch.fullName}) with phone "${cleanPhone}" is already registered.`
      );
    }
    return phoneMatch.id;
  }

  // Create new customer if not found
  const newCustomerId = await customerRepository.createBasicCustomer(tenantId, customerName, cleanPhone, userId, client);
  return newCustomerId;
}

async function getCustomerIdForUser(tenantId, userId, client) {
  const customer = await customerRepository.getCustomerByUserId(tenantId, userId, client);
  if (!customer) {
    throw new NotFoundError('Customer profile not found.');
  }
  return customer.id;
}

// ============================================================
// UPDATE STATISTICS (used by appointment finish)
// ============================================================
async function updateStatistics(tenantId, customerId, client) {
  await customerRepository.recalculateCustomerStats(tenantId, customerId, client);
}

module.exports = {
  getCustomers,
  getCustomer,
  getCustomerHistory,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getTopCustomers,
  getRecentCustomers,
  getCustomerStats,
  resolveCustomer,
  getCustomerIdForUser,
  updateStatistics,
};
