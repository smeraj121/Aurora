const express = require('express');
const router = express.Router();
const controller = require('../controllers/appointmentController');

// GET /api/appointments?date=2026-07-22
router.get('/', (req, res) => controller.getByDate(req, res));

// POST /api/appointments
router.post('/', (req, res) => controller.create(req, res));

// PUT /api/appointments/:id
router.put('/:id', (req, res) => controller.update(req, res));

// DELETE /api/appointments/:id
router.delete('/:id', (req, res) => controller.remove(req, res));

module.exports = router;