const appointmentRepo = require('../repositories/appointmentRepository');

class AppointmentService {
  async getAppointmentsByDate(date) {
    if (!date) {
      throw new Error('Date parameter is required (YYYY-MM-DD)');
    }
    return await appointmentRepo.findAllByDate(date);
  }

  async createBooking(bookingData) {
    if (!bookingData.clientName || !bookingData.phone) {
      throw new Error('Client Name and Phone are required fields.');
    }
    return await appointmentRepo.create(bookingData);
  }

  async updateBooking(id, updateData) {
    const existing = await appointmentRepo.findById(id);
    if (!existing) {
      throw new Error('Appointment not found.');
    }
    return await appointmentRepo.update(id, updateData);
  }

  async cancelBooking(id) {
    const existing = await appointmentRepo.findById(id);
    if (!existing) {
      throw new Error('Appointment not found.');
    }
    return await appointmentRepo.delete(id);
  }
}

module.exports = new AppointmentService();