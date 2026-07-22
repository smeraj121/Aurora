const express = require('express');
const router = express.Router();
const serviceRepo = require('../repositories/serviceRepository');

// GET /api/services
router.get('/', async (req, res) => {
  try {
    const services = await serviceRepo.findAll();
    res.json({ success: true, data: services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;