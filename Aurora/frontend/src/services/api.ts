const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(
  endpoint: string,
  options: RequestInit = {}
) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export const api = {
  // Appointments
  async getAppointments(date: string) {
  return request(`/appointments?date=${date}`);
},

async createAppointment(data: any) {
  return request("/appointments", {
    method: "POST",
    body: JSON.stringify(data),
  });
},

async updateAppointment(id: number, data: any) {
  return request(`/appointments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
},

async deleteAppointment(id: number) {
  return request(`/appointments/${id}`, {
    method: "DELETE",
  });
},
  // Staff
  async getStaff() {
    return request("/staff");
},

// Customers
  async getCustomers(search = "") {
  return request(
    `/customers${search ? `?search=${encodeURIComponent(search)}` : ""}`
  );
},

async getCustomerDetails(id: number) {
  return request(`/customers/${id}`);
},

async createCustomer(data: any) {
  return request("/customers", {
    method: "POST",
    body: JSON.stringify(data),
  });
},

async updateCustomer(id: number, data: any) {
  return request(`/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
},
};