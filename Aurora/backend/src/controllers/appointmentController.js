const appointmentService = require('../services/appointmentService');

class AppointmentController {
  async getByDate(req, res) {
    try {
      const { date } = req.query;
      const data = await appointmentService.getAppointmentsByDate(date);
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const newBooking = await appointmentService.createBooking(req.body);
      res.status(201).json({ success: true, data: newBooking });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const updated = await appointmentService.updateBooking(id, req.body);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async remove(req, res) {
    try {
      const { id } = req.params;
      await appointmentService.cancelBooking(id);
      res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AppointmentController();