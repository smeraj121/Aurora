// routes/calendarRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const calendarController = require('../controllers/calendarController');
const asyncHandler = require('../middlewares/asyncHandler');

// All calendar routes require authentication
router.use(authenticate);

// ============================================================
// SPECIFIC ROUTES (before /:id)
// ============================================================

// GET /calendar/pending-payments - Get pending payments
router.get('/pending-payments', asyncHandler(calendarController.getPendingPayments));

// POST /calendar/payment - Record a payment
router.post('/payment', asyncHandler(calendarController.updatePayment));

// ============================================================
// GET /calendar/:id - Get appointment by ID (must come after specific routes)
// ============================================================
router.get('/:id', asyncHandler(calendarController.getAppointmentById));

// ============================================================
// POST /calendar - Create or Update Appointment
// ============================================================
router.post('/', asyncHandler(calendarController.createOrUpdateAppointment));

// ============================================================
// GET /calendar - Get schedule by date (must be last)
// ============================================================
router.get('/', asyncHandler(calendarController.getScheduleByDate));

module.exports = router;