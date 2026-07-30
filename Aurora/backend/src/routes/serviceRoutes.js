// routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const serviceController = require('../controllers/serviceController');

// All service routes require authentication
router.use(authenticate);

// ============================================================
// SERVICE OPTIONS & BULK OPERATIONS
// ============================================================
// Get service categories (distinct)
router.get('/categories', serviceController.getCategories);

// Bulk update active status
router.patch('/bulk-status', serviceController.bulkUpdateStatus);

// ============================================================
// INDIVIDUAL SERVICE ROUTES (with :id)
// ============================================================
// GET /services/:id - Get service details
router.get('/:id', serviceController.getService);

// PUT /services/:id - Update service
router.put('/:id', serviceController.updateService);

// PATCH /services/:id/status - Toggle active status
router.patch('/:id/status', serviceController.toggleServiceStatus);

// DELETE /services/:id - Soft delete service
router.delete('/:id', serviceController.deleteService);

// ============================================================
// CREATE SERVICE (no :id)
// ============================================================
router.post('/', serviceController.createService);

// ============================================================
// GET ALL SERVICES (with filters) - MUST BE LAST
// ============================================================
router.get('/', serviceController.getServices);

module.exports = router;