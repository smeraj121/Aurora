const designationRepo = require('../repositories/designationRepository');

class DesignationService {
  async getAll(tenantId, includeInactive = false) {
    return designationRepo.getAll(tenantId, includeInactive);
  }

  async getById(id, tenantId) {
    const designation = await designationRepo.getById(id, tenantId);
    if (!designation) {
      throw new Error('Designation not found');
    }
    return designation;
  }

  async create(tenantId, data, userId) {
    // Validate name
    if (!data.name || data.name.trim() === '') {
      throw new Error('Designation name is required');
    }
    // Check duplicate (case-insensitive) per tenant
    const existing = await designationRepo.getAll(tenantId, true);
    if (existing.some(d => d.name.toLowerCase() === data.name.trim().toLowerCase())) {
      throw new Error('Designation with this name already exists');
    }
    // If displayOrder not provided, you might want to set it to max+1
    let displayOrder = data.displayOrder;
    if (displayOrder === undefined || displayOrder === null) {
      const maxOrder = existing.reduce((max, d) => Math.max(max, d.displayOrder || 0), 0);
      displayOrder = maxOrder + 1;
    }
    return designationRepo.create(tenantId, {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      displayOrder: displayOrder,
      isActive: data.isActive !== undefined ? data.isActive : true,
    }, userId);
  }

  async update(id, tenantId, data, userId) {
    const existing = await this.getById(id, tenantId);
    // If name is changing, check duplicate
    if (data.name && data.name.trim() !== existing.name) {
      const all = await designationRepo.getAll(tenantId, true);
      if (all.some(d => d.name.toLowerCase() === data.name.trim().toLowerCase() && d.id !== id)) {
        throw new Error('Designation with this name already exists');
      }
    }
    return designationRepo.update(id, tenantId, {
      name: data.name?.trim(),
      description: data.description?.trim(),
      displayOrder: data.displayOrder,
      isActive: data.isActive,
    }, userId);
  }

  async updateStatus(id, tenantId, isActive, userId) {
    await this.getById(id, tenantId); // ensure exists
    return designationRepo.updateStatus(id, tenantId, isActive, userId);
  }

  async delete(id, tenantId) {
    await this.getById(id, tenantId);
    // Optionally check if any staff members use this designation
    // For now, proceed with hard delete
    return designationRepo.delete(id, tenantId);
  }
}

module.exports = new DesignationService();