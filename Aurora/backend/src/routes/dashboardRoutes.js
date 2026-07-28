// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardRepo = require('../repositories/dashboardRepository');

// GET /api/dashboard/stats?date=2026-07-22
// Response format: { success: true, data: [ { title, value, change, isPositive, subtext } ] }
router.get('/stats', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];

    // Fetch only stats (no revenue calculations)
    const [stats, newClients] = await Promise.all([
      dashboardRepo.getSummaryStats(date),
      dashboardRepo.getNewClientsCount(date),
    ]);

    // Calculate slot utilization (mock)
    const slotUtilizationPercent = 78;

    // EXACT SAME RESPONSE FORMAT AS ORIGINAL
    const response = {
      success: true,
      data: [
        {
          title: 'Total Revenue',
          value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
          change: '+14.2%',
          isPositive: true,
          subtext: 'vs. last month'
        },
        {
          title: 'Appointments',
          value: stats.totalBookings || 0,
          change: '+8.5%',
          isPositive: true,
          subtext: `${stats.completedCount || 0} completed`
        },
        {
          title: 'Active Clients',
          value: stats.activeClients || 0,
          change: '+12.0%',
          isPositive: true,
          subtext: `${newClients} new this month`
        },
        {
          title: 'Slot Utilization',
          value: `${slotUtilizationPercent}%`,
          change: '-2.1%',
          isPositive: false,
          subtext: 'Target: 85%'
        }
      ]
    };
    res.json(response);
  } catch (err) {
    console.error('Dashboard stats API error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// NEW: GET /api/dashboard/revenue?date=2026-07-22
router.get('/revenue', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];

    // Fetch only revenue data
    const [revenueComparison, revenueChart] = await Promise.all([
      dashboardRepo.getRevenueComparison(date),
      dashboardRepo.getRevenueChartData(date),
    ]);

    // Calculate percentage change
    const revenueChange = revenueComparison.previousMonthRevenue > 0
      ? ((revenueComparison.currentMonthRevenue - revenueComparison.previousMonthRevenue) / revenueComparison.previousMonthRevenue * 100)
      : 0;

    res.json({
      success: true,
      data: revenueChart
      //{
        //currentMonthRevenue: revenueComparison.currentMonthRevenue,
        //previousMonthRevenue: revenueComparison.previousMonthRevenue,
        //changePercentage: revenueChange,
        //chartData: revenueChart
      //}
    });
  } catch (err) {
    console.error('Dashboard revenue API error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// NEW: GET /api/dashboard/recent-activity?limit=5
router.get('/recent-activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const recentActivity = await dashboardRepo.getRecentActivity(limit);

    res.json({
      success: true,
      data: recentActivity
    });
  } catch (err) {
    console.error('Dashboard recent activity API error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;