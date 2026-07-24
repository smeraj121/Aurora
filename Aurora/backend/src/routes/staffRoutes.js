// routes/staffRoutes.js
const express = require('express');
const router = express.Router();
const staffService = require('../services/staffService');

// GET /api/staff - Get all staff
router.get('/', async (req, res) => {
  try {
    const onlyActive = req.query.active === 'true';
    const withStats = req.query.stats === 'true';
    
    let staff;
    if (withStats) {
      staff = await staffService.getAllStaffWithStats(onlyActive);
    } else {
      staff = await staffService.getAllStaff(onlyActive);
    }
    
    res.json({
      success: true,
      data: staff,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// GET /api/staff/stats - Get staff statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await staffService.getStaffStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// GET /api/staff/top - Get top staff
router.get('/top', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const staff = await staffService.getTopStaff(limit);
    res.json({
      success: true,
      data: staff,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// GET /api/staff/:id - Get staff by ID
router.get('/:id', async (req, res) => {
  try {
    const withStats = req.query.stats === 'true';
    let staff;
    
    if (withStats) {
      staff = await staffService.getStaffByIdWithStats(parseInt(req.params.id));
    } else {
      staff = await staffService.getStaffById(parseInt(req.params.id));
    }
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found',
      });
    }
    
    res.json({
      success: true,
      data: staff,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// GET /api/staff/:id/schedule - Get staff schedule
router.get('/:id/schedule', async (req, res) => {
  try {
    const schedule = await staffService.getStaffTodaySchedule(parseInt(req.params.id));
    res.json({
      success: true,
      data: schedule,
    });
  } catch (err) {
    if (err.message === 'Staff member not found') {
      res.status(404).json({
        success: false,
        message: err.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
});

// POST /api/staff - Create new staff
router.post('/', async (req, res) => {
  try {
    const staff = await staffService.createStaff(req.body);
    res.status(201).json({
      success: true,
      data: staff,
      message: 'Staff member created successfully',
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// PUT /api/staff/:id - Update staff
router.put('/:id', async (req, res) => {
  try {
    const staff = await staffService.updateStaff(parseInt(req.params.id), req.body);
    res.json({
      success: true,
      data: staff,
      message: 'Staff member updated successfully',
    });
  } catch (err) {
    const status = err.message === 'Staff member not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: err.message,
    });
  }
});

// DELETE /api/staff/:id - Delete staff
router.delete('/:id', async (req, res) => {
  try {
    await staffService.deleteStaff(parseInt(req.params.id));
    res.json({
      success: true,
      message: 'Staff member deleted successfully',
    });
  } catch (err) {
    const status = err.message === 'Staff member not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;