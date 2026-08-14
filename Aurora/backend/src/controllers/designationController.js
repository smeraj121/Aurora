const designationService = require('../services/designationService');

exports.getDesignations = async (req, res) => {
  const { includeInactive } = req.query;
  const { tenantId } = req.user;
  const designations = await designationService.getAll(tenantId, includeInactive === 'true');
  res.json({ success: true, data: designations });
};

exports.getDesignation = async (req, res) => {
  const { id } = req.params;
  const { tenantId } = req.user;
  const designation = await designationService.getById(parseInt(id), tenantId);
  res.json({ success: true, data: designation });
};

exports.createDesignation = async (req, res) => {
  const { tenantId, userId } = req.user;
  const data = req.body;
  const newDesignation = await designationService.create(tenantId, data, userId);
  res.status(201).json({ success: true, data: newDesignation });
};

exports.updateDesignation = async (req, res) => {
  const { id } = req.params;
  const { tenantId, userId } = req.user;
  const data = req.body;
  const updated = await designationService.update(parseInt(id), tenantId, data, userId);
  res.json({ success: true, data: updated });
};

exports.toggleStatus = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const { tenantId, userId } = req.user;
  if (isActive === undefined) {
    return res.status(400).json({ success: false, message: 'isActive is required' });
  }
  const updated = await designationService.updateStatus(parseInt(id), tenantId, isActive, userId);
  res.json({ success: true, data: updated });
};

exports.deleteDesignation = async (req, res) => {
  const { id } = req.params;
  const { tenantId, userId } = req.user;
  await designationService.delete(parseInt(id), tenantId);
  res.json({ success: true, message: 'Designation deleted' });
};