const express = require('express');
const router = express.Router();
const staffRepo = require('../repositories/staffRepository');

// GET /api/staff
router.get('/', async (req, res) => {
  try {
    const staffMembers = await staffRepo.findAll();
    res.json({ success: true, data: staffMembers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/staff/:id
router.get('/:id', async (req, res) => {
  try {
    const staff = await staffRepo.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }
    res.json({ success: true, data: staff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;