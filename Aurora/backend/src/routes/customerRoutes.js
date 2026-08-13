// routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const customerController = require('../controllers/customerController');
const asyncHandler = require('../middlewares/asyncHandler');

// All customer routes require authentication
router.use(authenticate);

// ============================================================
// CUSTOMER STATS & LISTS
// ============================================================
router.get('/top', asyncHandler(customerController.getTopCustomers));
router.get('/recent', asyncHandler(customerController.getRecentCustomers));

// ============================================================
// CUSTOMER PACKAGE MANAGEMENT (specific before /:id)
// ============================================================
// GET /customers/packages/:id - Get a specific customer package
router.get('/packages/:id', asyncHandler(customerController.getCustomerPackageById));

// PUT /customers/packages/:id - Update a customer package
router.put('/packages/:id', asyncHandler(customerController.updateCustomerPackage));

// POST /customers/packages/use/:id - Use a session from a package
router.post('/packages/use/:id', asyncHandler(customerController.usePackageSession));

// POST /customers/packages/assign - Assign a package to a customer
router.post('/packages/assign', asyncHandler(customerController.assignPackageToCustomer));

// ============================================================
// BULK OPERATIONS
// ============================================================
router.post('/bulk-optin', asyncHandler(customerController.bulkUpdateOptIn));

// ============================================================
// INDIVIDUAL CUSTOMER ROUTES (with :id)
// ============================================================
// GET /customers/:id - Get customer details
router.get('/:id', asyncHandler(customerController.getCustomer));

// GET /customers/:id/history - Customer appointment history
router.get('/:id/history', asyncHandler(customerController.getCustomerHistory));

// GET /customers/:id/packages - Customer's packages
router.get('/:id/packages', asyncHandler(customerController.getCustomerPackages));

// GET /customers/:id/stats - Customer statistics
router.get('/:id/stats', asyncHandler(customerController.getCustomerStats));

// PUT /customers/:id/loyalty - Update loyalty points
router.put('/:id/loyalty', asyncHandler(customerController.updateLoyaltyPoints));

// PUT /customers/:id - Update customer
router.put('/:id', asyncHandler(customerController.updateCustomer));

// DELETE /customers/:id - Soft delete customer
router.delete('/:id', asyncHandler(customerController.deleteCustomer));

// ============================================================
// CREATE CUSTOMER (no :id)
// ============================================================
router.post('/', asyncHandler(customerController.createCustomer));

// ============================================================
// GET ALL CUSTOMERS (with search) - must be last to avoid conflict
// ============================================================
router.get('/', asyncHandler(customerController.getCustomers));

module.exports = router;