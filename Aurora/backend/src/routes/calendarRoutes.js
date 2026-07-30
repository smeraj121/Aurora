// routes/calendarRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const calendarController = require('../controllers/calendarController');

// All calendar routes require authentication
router.use(authenticate);

// ============================================================
// SPECIFIC ROUTES (before /:id)
// ============================================================
// GET /calendar/packages - Get available packages
router.get('/packages', calendarController.getAvailablePackages);

// GET /calendar/pending-payments - Get pending payments
router.get('/pending-payments', calendarController.getPendingPayments);

// GET /calendar/customer/:customerId/packages - Get customer's packages
router.get('/customer/:customerId/packages', calendarController.getCustomerPackages);

// POST /calendar/payment - Record a payment
router.post('/payment', calendarController.updatePayment);

// POST /calendar/purchase-package - Buy a package
router.post('/purchase-package', calendarController.purchasePackage);

// ============================================================
// GET /calendar/:id - Get appointment by ID (must come after specific routes)
// ============================================================
router.get('/:id', calendarController.getAppointmentById);

// ============================================================
// POST /calendar - Create or Update Appointment
// ============================================================
router.post('/', calendarController.createOrUpdateAppointment);

// ============================================================
// GET /calendar - Get schedule by date (must be last)
// ============================================================
router.get('/', calendarController.getScheduleByDate);

module.exports = router;