const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  // Appointments
  async getAppointments(date: string) {
    const res = await fetch(`${API_BASE_URL}/appointments?date=${date}`);
    return res.json();
  },
  async createAppointment(data: any) {
    const res = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async updateAppointment(id: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async deleteAppointment(id: string) {
    const res = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Staff
  async getStaff() {
    const res = await fetch(`${API_BASE_URL}/staff`);
    return res.json();
  },

  // Customers
  async getCustomers(search = '') {
    const res = await fetch(`${API_BASE_URL}/customers?search=${encodeURIComponent(search)}`);
    return res.json();
  },
  async getCustomerDetails(id: string) {
    const res = await fetch(`${API_BASE_URL}/customers/${id}`);
    return res.json();
  },
  async createCustomer(data: any) {
    const res = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async updateCustomer(id: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};