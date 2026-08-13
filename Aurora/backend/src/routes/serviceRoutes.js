// routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const serviceController = require('../controllers/serviceController');
const asyncHandler = require('../middlewares/asyncHandler');

// All service routes require authentication
router.use(authenticate);

// ============================================================
// SERVICE OPTIONS & BULK OPERATIONS
// ============================================================
// Get service categories (distinct)
router.get('/categories', asyncHandler(serviceController.getCategories));

// Bulk update active status
router.patch('/bulk-status', asyncHandler(serviceController.bulkUpdateStatus));

// ============================================================
// INDIVIDUAL SERVICE ROUTES (with :id)
// ============================================================
// GET /services/:id - Get service details
router.get('/:id', asyncHandler(serviceController.getService));

// PUT /services/:id - Update service
router.put('/:id', asyncHandler(serviceController.updateService));

// PATCH /services/:id/status - Toggle active status
router.patch('/:id/status', asyncHandler(serviceController.toggleServiceStatus));

// DELETE /services/:id - Soft delete service
router.delete('/:id', asyncHandler(serviceController.deleteService));

// ============================================================
// CREATE SERVICE (no :id)
// ============================================================
router.post('/', asyncHandler(serviceController.createService));

// ============================================================
// GET ALL SERVICES (with filters) - MUST BE LAST
// ============================================================
router.get('/', asyncHandler(serviceController.getServices));

module.exports = router;