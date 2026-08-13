const dashboardService = require('../services/dashboardService');

class DashboardController {
  /**
   * GET /dashboard/stats
   */
  async getStats(req, res, next) {
    try {
      const { tenantId } = req.user;
      const date = req.query.date;

      const statsData = await dashboardService.getSummaryStats(tenantId, date);

      const response = {
        success: true,
        data: [
          {
            title: 'Total Revenue',
            value: `₹${statsData.totalRevenue.toLocaleString('en-IN')}`,
            change: '+14.2%',
            isPositive: true,
            subtext: 'vs. last month',
          },
          {
            title: 'Appointments',
            value: statsData.totalBookings,
            change: '+8.5%',
            isPositive: true,
            subtext: `${statsData.completedCount} completed`,
          },
          {
            title: 'Active Clients',
            value: statsData.activeClients,
            change: '+12.0%',
            isPositive: true,
            subtext: `${statsData.newClients} new this month`,
          },
          {
            title: 'Slot Utilization',
            value: `${statsData.slotUtilizationPercent}%`,
            change: '-2.1%',
            isPositive: false,
            subtext: 'Target: 85%',
          },
        ],
      };

      res.json(response);
    } catch (error) {
      // Handle "no data" case gracefully
      if (error.message === 'No data found for the given date') {
        return res.json({
          success: true,
          data: [],
        });
      }
      next(error);
    }
  }

  /**
   * GET /dashboard/revenue
   */
  async getRevenue(req, res, next) {
    try {
      const { tenantId } = req.user;
      const date = req.query.date;

      const revenueData = await dashboardService.getRevenueData(tenantId, date);

      res.json({
        success: true,
        data: revenueData.chartData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /dashboard/recent-activity
   */
  async getRecentActivity(req, res, next) {
    try {
      const { tenantId } = req.user;
      const limit = parseInt(req.query.limit, 10) || 5;

      const activities = await dashboardService.getRecentActivity(tenantId, limit);

      res.json({
        success: true,
        data: activities,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();