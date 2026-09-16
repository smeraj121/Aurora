const appointmentService = require('../services/appointmentService');
const invoiceService = require('../services/invoiceService');

class AppointmentController {
  async getById(req, res) {
    const { tenantId, systemRole, userId } = req.user;
    const { id } = req.params;
    const data = await appointmentService.getAppointmentById(tenantId, parseInt(id, 10), systemRole, userId);
    res.json({ success: true, data });
  }

  async getMine(req, res) {
    const { tenantId, userId } = req.user;
    const { status } = req.query;
    const data = await appointmentService.getMyAppointments(tenantId, userId, status);
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

  async getToday(req, res) {
    const { tenantId } = req.user;
    const data = await appointmentService.getTodayAppointments(tenantId);
    res.json({ success: true, data });
  }

  async getUpcoming(req, res) {
    const { tenantId } = req.user;
    const data = await appointmentService.getUpcomingAppointments(tenantId);
    res.json({ success: true, data });
  }

  async getPendingActions(req, res) {
    const { tenantId } = req.user;
    const data = await appointmentService.getPendingActions(tenantId);
    res.json({ success: true, data });
  }

  async getInvoice(req, res) {
    const { tenantId, systemRole, userId } = req.user;
    const { id } = req.params;
    const { appointment, tenant } = await invoiceService.getInvoiceData(tenantId, parseInt(id, 10), systemRole, userId);
    await invoiceService.streamInvoicePdf(res, { tenant, appointment });
  }
}

module.exports = new AppointmentController();