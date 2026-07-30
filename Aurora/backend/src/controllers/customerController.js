const customerService = require('../services/customerService');

// ============================================================
// GET /customers - List all customers (with search)
// ============================================================
async function getCustomers(req, res, next) {
  try {
    const { tenantId } = req.user;
    const { search } = req.query;
    const customers = await customerService.getCustomers(tenantId, search);
    res.json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// GET /customers/:id - Get customer by ID (with full details)
// ============================================================
async function getCustomer(req, res, next) {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;
    const customer = await customerService.getCustomer(tenantId, parseInt(id, 10));
    res.json({ success: true, data: customer });
  } catch (error) {
    if (error.message === 'Customer not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ============================================================
// GET /customers/:id/history - Get customer appointment history
// ============================================================
async function getCustomerHistory(req, res, next) {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;
    const history = await customerService.getCustomerHistory(tenantId, parseInt(id, 10));
    res.json({ success: true, data: history });
  } catch (error) {
    if (error.message === 'Customer not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ============================================================
// GET /customers/:id/packages - Get customer packages
// ============================================================
async function getCustomerPackages(req, res, next) {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;
    const includeExpired = req.query.includeExpired === 'true';
    const packages = await customerService.getCustomerPackages(tenantId, parseInt(id, 10), includeExpired);
    res.json({ success: true, data: packages });
  } catch (error) {
    if (error.message === 'Customer not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ============================================================
// GET /customers/:id/stats - Get customer statistics
// ============================================================
async function getCustomerStats(req, res, next) {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;
    const stats = await customerService.getCustomerStats(tenantId, parseInt(id, 10));
    res.json({ success: true, data: stats });
  } catch (error) {
    if (error.message === 'Customer not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ============================================================
// POST /customers - Create a new customer
// ============================================================
async function createCustomer(req, res, next) {
  try {
    const { tenantId, userId } = req.user;
    const newCustomer = await customerService.createCustomer(tenantId, req.body, userId);
    res.status(201).json({
      success: true,
      data: newCustomer,
      message: 'Customer created successfully',
    });
  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.status(409).json({ success: false, message: error.message });
    }
    if (error.message === 'Full name is required' || error.message === 'Phone number is required') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ============================================================
// PUT /customers/:id - Update a customer
// ============================================================
async function updateCustomer(req, res, next) {
  try {
    const { tenantId, userId } = req.user;
    const { id } = req.params;
    const updated = await customerService.updateCustomer(tenantId, parseInt(id, 10), req.body, userId);
    res.json({
      success: true,
      data: updated,
      message: 'Customer updated successfully',
    });
  } catch (error) {
    if (error.message === 'Customer not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message.includes('already exists')) {
      return res.status(409).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ============================================================
// DELETE /customers/:id - Soft delete a customer
// ============================================================
async function deleteCustomer(req, res, next) {
  try {
    const { tenantId, userId } = req.user;
    const { id } = req.params;
    await customerService.deleteCustomer(tenantId, parseInt(id, 10), userId);
    res.json({ success: true, message: 'Customer deactivated successfully' });
  } catch (error) {
    if (error.message === 'Customer not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message.includes('Cannot delete customer with active appointments')) {
      return res.status(409).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ============================================================
// GET /customers/top - Top customers by spending
// ============================================================
async function getTopCustomers(req, res, next) {
  try {
    const { tenantId } = req.user;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const top = await customerService.getTopCustomers(tenantId, limit);
    res.json({ success: true, data: top });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// GET /customers/recent - Most recently created customers
// ============================================================
async function getRecentCustomers(req, res, next) {
  try {
    const { tenantId } = req.user;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const recent = await customerService.getRecentCustomers(tenantId, limit);
    res.json({ success: true, data: recent });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// POST /customers/packages - Assign a package to a customer
// ============================================================
async function assignPackageToCustomer(req, res, next) {
  try {
    const { tenantId, userId } = req.user;
    const result = await customerService.assignPackageToCustomer(tenantId, req.body, userId);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Package assigned successfully',
    });
  } catch (error) {
    if (error.message === 'Customer not found' || error.message === 'Package not found or inactive') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message.includes('already has an active instance')) {
      return res.status(409).json({ success: false, message: error.message });
    }
    if (error.message.includes('required')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ============================================================
// GET /customers/packages/:id - Get a specific customer package
// ============================================================
async function getCustomerPackageById(req, res, next) {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;
    const pkg = await customerService.getCustomerPackageById(tenantId, parseInt(id, 10));
    res.json({ success: true, data: pkg });
  } catch (error) {
    if (error.message === 'Customer package not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ============================================================
// PUT /customers/packages/:id - Update a customer package
// ============================================================
async function updateCustomerPackage(req, res, next) {
  try {
    const { tenantId, userId } = req.user;
    const { id } = req.params;
    const updated = await customerService.updateCustomerPackage(tenantId, parseInt(id, 10), req.body, userId);
    res.json({
      success: true,
      data: updated,
      message: 'Customer package updated successfully',
    });
  } catch (error) {
    if (error.message === 'Customer package not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ============================================================
// POST /customers/packages/:id/use - Use a session from a package
// ============================================================
async function usePackageSession(req, res, next) {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;
    const result = await customerService.usePackageSession(tenantId, parseInt(id, 10));
    res.json({
      success: true,
      data: result,
      message: 'Package session used successfully',
    });
  } catch (error) {
    if (error.message === 'No available sessions in this package') {
      return res.status(409).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ============================================================
// PUT /customers/:id/loyalty - Update loyalty points
// ============================================================
async function updateLoyaltyPoints(req, res, next) {
  try {
    const { tenantId, userId } = req.user;
    const { id } = req.params;
    const { points } = req.body;
    if (points === undefined) {
      return res.status(400).json({ success: false, message: 'Points are required' });
    }
    const result = await customerService.updateLoyaltyPoints(
      tenantId,
      parseInt(id, 10),
      parseInt(points, 10),
      userId
    );
    res.json({
      success: true,
      data: result,
      message: 'Loyalty points updated successfully',
    });
  } catch (error) {
    if (error.message === 'Customer not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === 'Points must be a non-zero number') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ============================================================
// POST /customers/bulk-optin - Bulk update opt-in status
// ============================================================
async function bulkUpdateOptIn(req, res, next) {
  try {
    const { tenantId, userId } = req.user;
    const { customerIds, optInType, value } = req.body;
    const result = await customerService.bulkUpdateOptIn(
      tenantId,
      customerIds,
      optInType,
      value,
      userId
    );
    res.json({
      success: true,
      data: result,
      message: 'Opt-in statuses updated successfully',
    });
  } catch (error) {
    if (error.message.includes('Invalid opt-in type') || error.message.includes('required')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
}

module.exports = {
  getCustomers,
  getCustomer,
  getCustomerHistory,
  getCustomerPackages,
  getCustomerStats,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getTopCustomers,
  getRecentCustomers,
  assignPackageToCustomer,
  getCustomerPackageById,
  updateCustomerPackage,
  usePackageSession,
  updateLoyaltyPoints,
  bulkUpdateOptIn,
};