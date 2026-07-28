// src/services/dashboardService.js

import { api } from "../../../services/api";


export const fetchDashboardData = async (date: { toISOString: () => string; }) => {
  const formattedDate = date.toISOString().split('T')[0];
  const response = await api.getDashboardStats(formattedDate);
  
  return response.data;
};

export const fetchDashboardRevenue = async (date: { toISOString: () => string; }) => {
  const formattedDate = date.toISOString().split('T')[0];
  const response = await api.getDashboardRevenue(formattedDate);
  
  return response.data;
};
