const customerService = require('../services/customerService');
const customerPackageService = require('../services/customerPackageService');

// ============================================================
// GET /customers - List all customers (with search)
// ============================================================
async function getCustomers(req, res, next) {
  const { tenantId } = req.user;
  const { search } = req.query;
  const customers = await customerService.getCustomers(tenantId, search);
  res.json({ success: true, data: customers });
}

// ============================================================
// GET /customers/:id - Get customer by ID (with full details)
// ============================================================
async function getCustomer(req, res, next) {
  const { tenantId } = req.user;
  const { id } = req.params;
  const customer = await customerService.getCustomer(tenantId, parseInt(id, 10));
  res.json({ success: true, data: customer });
}

// ============================================================
// GET /customers/:id/history - Get customer appointment history
// ============================================================
async function getCustomerHistory(req, res, next) {
  const { tenantId } = req.user;
  const { id } = req.params;
  const history = await customerService.getCustomerHistory(tenantId, parseInt(id, 10));
  res.json({ success: true, data: history });
}

// ============================================================
// GET /customers/:id/packages - Get customer packages
// ============================================================
async function getCustomerPackages(req, res, next) {
  const { tenantId } = req.user;
  const { id } = req.params;
  const includeExpired = req.query.includeExpired === 'true';
  const packages = await customerPackageService.getCustomerPackages(tenantId, parseInt(id, 10), includeExpired);
  res.json({ success: true, data: packages });
}

// ============================================================
// GET /customers/:id/stats - Get customer statistics
// ============================================================
async function getCustomerStats(req, res, next) {
  const { tenantId } = req.user;
  const { id } = req.params;
  const stats = await customerService.getCustomerStats(tenantId, parseInt(id, 10));
  res.json({ success: true, data: stats });
}

// ============================================================
// POST /customers - Create a new customer
// ============================================================
async function createCustomer(req, res, next) {
  const { tenantId, userId } = req.user;
  const newCustomer = await customerService.createCustomer(tenantId, req.body, userId);
  res.status(201).json({
    success: true,
    data: newCustomer,
    message: 'Customer created successfully',
  });
}

// ============================================================
// PUT /customers/:id - Update a customer
// ============================================================
async function updateCustomer(req, res, next) {
  const { tenantId, userId } = req.user;
  const { id } = req.params;
  const updated = await customerService.updateCustomer(tenantId, parseInt(id, 10), req.body, userId);
  res.json({
    success: true,
    data: updated,
    message: 'Customer updated successfully',
  });
}

// ============================================================
// DELETE /customers/:id - Soft delete a customer
// ============================================================
async function deleteCustomer(req, res, next) {
  const { tenantId, userId } = req.user;
  const { id } = req.params;
  await customerService.deleteCustomer(tenantId, parseInt(id, 10), userId);
  res.json({ success: true, message: 'Customer deactivated successfully' });
}

// ============================================================
// GET /customers/top - Top customers by spending
// ============================================================
async function getTopCustomers(req, res, next) {
  const { tenantId } = req.user;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
  const top = await customerService.getTopCustomers(tenantId, limit);
  res.json({ success: true, data: top });
}

// ============================================================
// GET /customers/recent - Most recently created customers
// ============================================================
async function getRecentCustomers(req, res, next) {
  const { tenantId } = req.user;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
  const recent = await customerService.getRecentCustomers(tenantId, limit);
  res.json({ success: true, data: recent });
}

// ============================================================
// POST /customers/packages - Assign a package to a customer
// ============================================================
async function assignPackageToCustomer(req, res, next) {
  const { tenantId, userId } = req.user;
  const result = await customerPackageService.assignPackageToCustomer(tenantId, req.body, userId);
  res.status(201).json({
    success: true,
    data: result,
    message: 'Package assigned successfully',
  });
}

// ============================================================
// GET /customers/packages/:id - Get a specific customer package
// ============================================================
async function getCustomerPackageById(req, res, next) {
  const { tenantId } = req.user;
  const { id } = req.params;
  const pkg = await customerPackageService.getCustomerPackageById(tenantId, parseInt(id, 10));
  res.json({ success: true, data: pkg });
}

// ============================================================
// PUT /customers/packages/:id - Update a customer package
// ============================================================
async function updateCustomerPackage(req, res, next) {
  const { tenantId, userId } = req.user;
  const { id } = req.params;
  const updated = await customerPackageService.updateCustomerPackage(tenantId, parseInt(id, 10), req.body, userId);
  res.json({
    success: true,
    data: updated,
    message: 'Customer package updated successfully',
  });
}

// ============================================================
// POST /customers/packages/:id/use - Use a session from a package
// ============================================================
async function usePackageSession(req, res, next) {
  const { tenantId } = req.user;
  const { id } = req.params;
  const result = await customerPackageService.usePackageSession(tenantId, parseInt(id, 10));
  res.json({
    success: true,
    data: result,
    message: 'Package session used successfully',
  });
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
  usePackageSession
};