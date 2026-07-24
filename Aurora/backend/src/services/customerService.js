// services/customerService.js
const customerRepository = require("../repositories/customerRepository");

exports.getCustomers = async (search) => {
    return customerRepository.getCustomers(search);
};

exports.getCustomer = async (id) => {
    const customer = await customerRepository.getCustomerDetails(id);

    if (!customer) {
        throw new Error("Customer not found");
    }

    // Calculate average ticket
    customer.averageTicket = Math.round(
        customer.totalSpent / (customer.totalVisits || 1)
    );

    // Get visit history
    customer.history = await customerRepository.getCustomerHistory(id);

    // Get active packages
    customer.packages = await customerRepository.getCustomerPackages(id);

    // Get additional stats
    customer.stats = await customerRepository.getCustomerStats(id);

    // Determine VIP status
    customer.isVip = customer.totalVisits > 10 || customer.totalSpent > 50000;

    return customer;
};

exports.getCustomerHistory = async (id) => {
    return customerRepository.getCustomerHistory(id);
};

exports.getCustomerPackages = async (id) => {
    return customerRepository.getCustomerPackages(id);
};

exports.createCustomer = async (data) => {
    // Check if customer with same phone exists
    const existingPhone = await customerRepository.findCustomerByPhone(data.phone);
    if (existingPhone) {
        throw new Error(`Customer with phone ${data.phone} already exists`);
    }

    // Check if customer with same email exists
    if (data.email) {
        const existingEmail = await customerRepository.findCustomerByEmail(data.email);
        if (existingEmail) {
            throw new Error(`Customer with email ${data.email} already exists`);
        }
    }

    return customerRepository.createCustomer(data);
};

exports.updateCustomer = async (id, data) => {
    // Check if customer exists
    const existing = await customerRepository.getCustomerDetails(id);
    if (!existing) {
        throw new Error("Customer not found");
    }

    // Check phone uniqueness if updating phone
    if (data.phone && data.phone !== existing.phone) {
        const phoneMatch = await customerRepository.findCustomerByPhone(data.phone);
        if (phoneMatch && phoneMatch.id !== parseInt(id)) {
            throw new Error(`Customer with phone ${data.phone} already exists`);
        }
    }

    // Check email uniqueness if updating email
    if (data.email && data.email !== existing.email) {
        const emailMatch = await customerRepository.findCustomerByEmail(data.email);
        if (emailMatch && emailMatch.id !== parseInt(id)) {
            throw new Error(`Customer with email ${data.email} already exists`);
        }
    }

    return customerRepository.updateCustomer(id, data);
};

exports.deleteCustomer = async (id) => {
    const existing = await customerRepository.getCustomerDetails(id);
    if (!existing) {
        throw new Error("Customer not found");
    }
    return customerRepository.deleteCustomer(id);
};

exports.getTopCustomers = async (limit) => {
    return customerRepository.getTopCustomers(limit);
};

exports.getRecentCustomers = async (limit) => {
    return customerRepository.getRecentCustomers(limit);
};

// services/customerService.js

exports.assignPackageToCustomer = async (data) => {
  // Validate required fields
  if (!data.customerId) {
    throw new Error('Customer ID is required');
  }
  if (!data.packageId) {
    throw new Error('Package ID is required');
  }

  // Validate customer exists
  const customer = await customerRepository.getCustomerDetails(data.customerId);
  if (!customer) {
    throw new Error('Customer not found');
  }

  // Check if customer already has this package (optional)
  const existingPackages = await customerRepository.getCustomerPackages(data.customerId);
  const alreadyHasPackage = existingPackages.some(p => p.packageId === data.packageId && p.remainingSessions > 0);
  if (alreadyHasPackage) {
    throw new Error('Customer already has an active instance of this package');
  }

  // Validate custom price if provided
  if (data.customPrice && data.customPrice < 0) {
    throw new Error('Custom price cannot be negative');
  }

  // Assign package
  const result = await customerRepository.assignPackageToCustomer(data);
  
  // Update customer stats (trigger will handle this, but we can do it explicitly)
  await customerRepository.updateCustomerStats(data.customerId);

  return result;
};

exports.getCustomerPackages = async (customerId, includeExpired = false) => {
  const customer = await customerRepository.getCustomerDetails(customerId);
  if (!customer) {
    throw new Error('Customer not found');
  }
  return customerRepository.getCustomerPackages(customerId, includeExpired);
};

exports.getCustomerPackageById = async (id) => {
  const pkg = await customerRepository.getCustomerPackageById(id);
  if (!pkg) {
    throw new Error('Customer package not found');
  }
  return pkg;
};

exports.updateCustomerPackage = async (id, data) => {
  const existing = await customerRepository.getCustomerPackageById(id);
  if (!existing) {
    throw new Error('Customer package not found');
  }
  return customerRepository.updateCustomerPackage(id, data);
};

exports.usePackageSession = async (customerPackageId) => {
  return customerRepository.usePackageSession(customerPackageId);
};