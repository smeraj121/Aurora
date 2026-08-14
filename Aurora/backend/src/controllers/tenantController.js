const tenantService = require('../services/tenantService');

class TenantController {

  async getAll(req, res) {
    const data = await tenantService.getAllTenants();

    res.json({
      success: true,
      data
    });
  }

  async getById(req, res) {
    const id = Number(req.params.id);

    const data = await tenantService.getTenantById(id);

    res.json({
      success: true,
      data
    });
  }

  async create(req, res) {
    const data = await tenantService.createTenant(req.body);

    res.status(201).json({
      success: true,
      data
    });
  }

  async update(req, res) {
    const id = Number(req.params.id);

    const data = await tenantService.updateTenant(
      id,
      req.body
    );

    res.json({
      success: true,
      data
    });
  }

  async updateStatus(req, res) {
    const id = Number(req.params.id);

    const { isActive } = req.body;

    const data = await tenantService.updateTenantStatus(
      id,
      isActive
    );

    res.json({
      success: true,
      data
    });
  }
}

module.exports = new TenantController();