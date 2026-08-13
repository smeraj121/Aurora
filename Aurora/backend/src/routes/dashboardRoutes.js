// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const dashboardController = require('../controllers/dashboardController');
const asyncHandler = require('../middlewares/asyncHandler');

// All dashboard routes require authentication
router.use(authenticate);

// GET /api/dashboard/stats?date=2026-07-22
router.get('/stats', asyncHandler(dashboardController.getStats));

// GET /api/dashboard/revenue?date=2026-07-22
router.get('/revenue', asyncHandler(dashboardController.getRevenue));

// GET /api/dashboard/recent-activity?limit=5
router.get('/recent-activity', asyncHandler(dashboardController.getRecentActivity));

module.exports = router;