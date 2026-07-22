const express = require('express');
const router = express.Router();
const dashboardRepo = require('../repositories/dashboardRepository');

// GET /api/dashboard/stats?date=2026-07-22
router.get('/stats', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const stats = await dashboardRepo.getSummaryStats(date);
    const recent = await dashboardRepo.getRecentActivity(5);
    
    res.json({
      success: true,
      data: {
        stats,
        recentActivity: recent,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;