// services/serviceService.js
const serviceRepository = require('../repositories/serviceRepository');
const tenantRepository = require('../repositories/tenantRepository');
const CATEGORY_DEFAULTS = require('../config/categoryDefaults');
const { NotFoundError, ConflictError, ValidationError } = require('../errors');

// ============================================================
// GET ALL SERVICES
// ============================================================
async function getServices(tenantId, includeInactive = false) {
  return serviceRepository.findAll(tenantId, includeInactive);
}

// ============================================================
// GET A SINGLE SERVICE
// ============================================================
async function getService(tenantId, id) {
  const service = await serviceRepository.findById(tenantId, id);
  if (!service) {
    throw new NotFoundError('Service not found');
  }
  return service;
}

// ============================================================
// CREATE SERVICE
// ============================================================
async function createService(tenantId, data, userId) {
  // Basic validation
  if (!data.name) throw new ValidationError('Service name is required');
  if (!data.price || data.price < 0) throw new ValidationError('Valid price is required');
  if (!data.durationMinutes || data.durationMinutes <= 0) {
    throw new ValidationError('Valid duration is required');
  }

  // Check duplicate name
  const existing = await serviceRepository.findByName(tenantId, data.name);
  if (existing) {
    throw new ConflictError(`Service with name "${data.name}" already exists`);
  }

  return serviceRepository.create(tenantId, data, userId);
}

// ============================================================
// UPDATE SERVICE
// ============================================================
async function updateService(tenantId, id, data, userId) {
  const existing = await serviceRepository.findById(tenantId, id);
  if (!existing) {
    throw new NotFoundError('Service not found');
  }

  // Check name uniqueness if changing
  if (data.name && data.name !== existing.name) {
    const duplicate = await serviceRepository.findByName(tenantId, data.name, id);
    if (duplicate) {
      throw new ConflictError(`Service with name "${data.name}" already exists`);
    }
  }

  return serviceRepository.update(tenantId, id, data, userId);
}

// ============================================================
// DELETE SERVICE (soft delete)
// ============================================================
async function deleteService(tenantId, id, userId) {
  const existing = await serviceRepository.findById(tenantId, id);
  if (!existing) {
    throw new NotFoundError('Service not found');
  }
  return serviceRepository.delete(tenantId, id, userId);
}

// ============================================================
// TOGGLE ACTIVE STATUS
// ============================================================
async function toggleServiceStatus(tenantId, id, userId) {
  const existing = await serviceRepository.findById(tenantId, id);
  if (!existing) {
    throw new NotFoundError('Service not found');
  }
  const newStatus = !existing.isActive;
  return serviceRepository.update(tenantId, id, { isActive: newStatus }, userId);
}

// ============================================================
// GET DISTINCT CATEGORIES
// ============================================================
async function getCategories(tenantId) {
  // We'll add a repository method for this
  // For now, we fetch all services and extract unique categories
  const tenant = await tenantRepository.getById(tenantId);
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  const defaultCategories = CATEGORY_DEFAULTS[tenant.businessTypeId] || [];
  const services = await serviceRepository.findAll(tenantId, true);
  const dbCategories = services.map(s => s.category).filter(Boolean);
  const allCategories = [...new Set([...defaultCategories, ...dbCategories])];
  return allCategories.sort();
}

// ============================================================
// BULK UPDATE STATUS
// ============================================================
async function bulkUpdateStatus(tenantId, ids, isActive, userId) {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new ValidationError('Service IDs array is required');
  }
  return serviceRepository.bulkUpdateStatus(tenantId, ids, isActive, userId);
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