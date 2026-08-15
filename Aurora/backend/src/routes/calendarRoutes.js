// routes/calendarRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const calendarController = require('../controllers/calendarController');
const asyncHandler = require('../middlewares/asyncHandler');

// All calendar routes require authentication
router.use(authenticate);

// ============================================================
// GET /calendar - Get schedule by date (must be last)
// ============================================================
router.get('/', asyncHandler(calendarController.getScheduleByDate));

module.exports = router;