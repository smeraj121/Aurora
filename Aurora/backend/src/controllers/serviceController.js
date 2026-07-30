// controllers/serviceController.js
const serviceService = require('../services/serviceService');

// ============================================================
// GET /services - List all services (with optional includeInactive)
// ============================================================
async function getServices(req, res, next) {
  try {
    const { tenantId } = req.user;
    const includeInactive = req.query.includeInactive === 'true';
    const services = await serviceService.getServices(tenantId, includeInactive);
    res.json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// GET /services/:id - Get a single service
// ============================================================
async function getService(req, res, next) {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;
    const service = await serviceService.getService(tenantId, parseInt(id, 10));
    res.json({ success: true, data: service });
  } catch (error) {
    if (error.message === 'Service not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ============================================================
// POST /services - Create a new service
// ============================================================
async function createService(req, res, next) {
  try {
    const { tenantId, userId } = req.user;
    const newService = await serviceService.createService(tenantId, req.body, userId);
    res.status(201).json({
      success: true,
      data: newService,
      message: 'Service created successfully',
    });
  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.status(409).json({ success: false, message: error.message });
    }
    if (error.message.includes('required')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ============================================================
// PUT /services/:id - Update a service
// ============================================================
async function updateService(req, res, next) {
  try {
    const { tenantId, userId } = req.user;
    const { id } = req.params;
    const updated = await serviceService.updateService(
      tenantId,
      parseInt(id, 10),
      req.body,
      userId
    );
    res.json({
      success: true,
      data: updated,
      message: 'Service updated successfully',
    });
  } catch (error) {
    if (error.message === 'Service not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message.includes('already exists')) {
      return res.status(409).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ============================================================
// DELETE /services/:id - Soft delete a service
// ============================================================
async function deleteService(req, res, next) {
  try {
    const { tenantId, userId } = req.user;
    const { id } = req.params;
    await serviceService.deleteService(tenantId, parseInt(id, 10), userId);
    res.json({ success: true, message: 'Service deactivated successfully' });
  } catch (error) {
    if (error.message === 'Service not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ============================================================
// PATCH /services/:id/status - Toggle active status
// ============================================================
async function toggleServiceStatus(req, res, next) {
  try {
    const { tenantId, userId } = req.user;
    const { id } = req.params;
    const updated = await serviceService.toggleServiceStatus(
      tenantId,
      parseInt(id, 10),
      userId
    );
    res.json({
      success: true,
      data: updated,
      message: `Service ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    if (error.message === 'Service not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ============================================================
// GET /services/categories - Get distinct categories
// ============================================================
async function getCategories(req, res, next) {
  try {
    const { tenantId } = req.user;
    const categories = await serviceService.getCategories(tenantId);
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// PATCH /services/bulk-status - Bulk update status
// ============================================================
async function bulkUpdateStatus(req, res, next) {
  try {
    const { tenantId, userId } = req.user;
    const { ids, isActive } = req.body;
    if (ids === undefined || isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Both "ids" and "isActive" are required',
      });
    }
    const result = await serviceService.bulkUpdateStatus(
      tenantId,
      ids,
      isActive,
      userId
    );
    res.json({
      success: true,
      data: result,
      message: `${result.length} service(s) updated successfully`,
    });
  } catch (error) {
    if (error.message.includes('required')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
}

module.exports = {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  getCategories,
  bulkUpdateStatus,
};