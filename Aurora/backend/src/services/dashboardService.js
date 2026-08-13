const dashboardRepository = require('../repositories/dashboardRepository');

class DashboardService {
  async getSummaryStats(tenantId, date) {
    const [stats, newClients] = await Promise.all([
      dashboardRepository.getSummaryStats(tenantId, date),
      dashboardRepository.getNewClientsCount(tenantId, date),
    ]);

    // Mock slot utilization (replace with real calculation if needed)
    const slotUtilizationPercent = 78;

    return {
      totalRevenue: stats.totalRevenue || 0,
      totalBookings: stats.totalBookings || 0,
      completedCount: stats.completedCount || 0,
      activeClients: stats.activeClients || 0,
      newClients: newClients || 0,
      slotUtilizationPercent,
    };
  }

  async getRevenueData(tenantId, date) {
    const [revenueComparison, revenueChart] = await Promise.all([
      dashboardRepository.getRevenueComparison(tenantId, date),
      dashboardRepository.getRevenueChartData(tenantId, date),
    ]);

    return {
      currentMonthRevenue: revenueComparison.currentMonthRevenue || 0,
      previousMonthRevenue: revenueComparison.previousMonthRevenue || 0,
      chartData: revenueChart || [],
    };
  }

  async getRecentActivity(tenantId, limit) {
    return await dashboardRepository.getRecentActivity(tenantId, limit) || [];
  }
}

module.exports = new DashboardService();