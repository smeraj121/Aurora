const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const appointmentController = require('../controllers/appointmentController');
const asyncHandler = require('../middlewares/asyncHandler');

router.use(authenticate);

// GET /api/appointments/:id – Fetch a single appointment
router.get('/:id', asyncHandler(appointmentController.getById));

// POST /api/appointments – Create a new appointment
router.post('/', asyncHandler(appointmentController.create));

// PUT /api/appointments/:id – Update an existing appointment
router.put('/:id', asyncHandler(appointmentController.update));

// POST /api/appointments/:id/finish – Mark an appointment as finished
router.post('/:id/finish',authenticate, authorize('Staff', 'Admin'), asyncHandler(appointmentController.finish));

// POST /api/appointments/:id/cancel – Cancel an appointment
router.post('/:id/cancel',authenticate, authorize('Staff', 'Admin'), asyncHandler(appointmentController.cancel));

module.exports = router;