// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const paymentController = require('../controllers/paymentController');
const asyncHandler = require('../middlewares/asyncHandler');

router.use(authenticate);

// GET /payments/pending - Pending payments
router.get('/pending', asyncHandler(paymentController.getPendingPayments));

// POST /payments - Record a payment
router.post('/', asyncHandler(paymentController.recordPayment));

module.exports = router;