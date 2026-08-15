// routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const serviceController = require('../controllers/serviceController');
const asyncHandler = require('../middlewares/asyncHandler');
// All service routes require authentication
router.use(authenticate);

// ============================================================
// READ-ONLY ROUTES (accessible to all authenticated users)
// ============================================================
// Get service categories (distinct)
router.get('/categories', asyncHandler(serviceController.getCategories));

// GET /services/:id - Get service details
router.get('/:id', asyncHandler(serviceController.getService));

// ============================================================
// GET ALL SERVICES (with filters) - MUST BE LAST
// ============================================================
router.get('/', asyncHandler(serviceController.getServices));

// ============================================================
// WRITE/MUTATION ROUTES (Owner/Admin only)
// ============================================================
router.post('/', authorize('Owner', 'Admin'), asyncHandler(serviceController.createService));
router.put('/:id', authorize('Owner', 'Admin'), asyncHandler(serviceController.updateService));
router.patch('/:id/status', authorize('Owner', 'Admin'), asyncHandler(serviceController.toggleServiceStatus));
router.delete('/:id', authorize('Owner', 'Admin'), asyncHandler(serviceController.deleteService));
router.patch('/bulk-status', authorize('Owner', 'Admin'), asyncHandler(serviceController.bulkUpdateStatus));

module.exports = router;