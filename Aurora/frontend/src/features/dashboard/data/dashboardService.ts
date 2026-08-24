// src/services/dashboardService.js

import { format } from "date-fns";
import { api } from "../../../services/api";


export const fetchDashboardData = async (date:any) => {
  const formattedDate = format(date, 'yyyy-MM-dd');
  const response = await api.getDashboardStats(formattedDate);
  
  return response.data;
};

export const fetchDashboardRevenue = async (date: any) => {
  const formattedDate = format(date, 'yyyy-MM-dd');
  const response = await api.getDashboardRevenue(formattedDate);
  
  return response.data;
};

export const fetchSchedule = async (date: any, includeCancelled : boolean) => {
  const formattedDate = format(date, 'yyyy-MM-dd');
  const response = await api.getSchedule(formattedDate, includeCancelled);
  
  return response.data;
};
