const appointmentService = require('../services/appointmentService');

class AppointmentController {
  async getById(req, res) {
    const { tenantId, systemRole, userId } = req.user;
    const { id } = req.params;
    const data = await appointmentService.getAppointmentById(tenantId, parseInt(id, 10), systemRole, userId);
    res.json({ success: true, data });
  }

  async create(req, res) {
    const { tenantId, systemRole, userId } = req.user;
    const result = await appointmentService.createAppointment(tenantId, systemRole, req.body, userId);
    res.status(201).json({ success: true, data: result });
  }

  async update(req, res) {
    const { tenantId, systemRole, userId } = req.user;
    const { id } = req.params;
    const result = await appointmentService.updateAppointment(tenantId, systemRole, id, req.body, userId);
    res.json({ success: true, data: result });
  }

  async finish(req, res) {
    const { tenantId, systemRole, userId } = req.user;
    const { id } = req.params;
    const result = await appointmentService.finishAppointment(tenantId, systemRole, id, req.body, userId);
    res.json({ success: true, message: 'Appointment finished successfully.', data: result });
  }

  async cancel(req, res) {
    const { tenantId, systemRole, userId } = req.user;
    const { id } = req.params;
    const { reason } = req.body;
    const result = await appointmentService.cancelAppointment(tenantId, systemRole, id, reason, userId);
    res.json({ success: true, message: 'Appointment cancelled successfully.', data: result });
  }
}

module.exports = new AppointmentController();