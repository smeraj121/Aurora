// services/packageService.js
const packageRepository = require('../repositories/packageRepository');
const { NotFoundError, ValidationError, ConflictError } = require('../errors');

// ============================================================
// GET ALL PACKAGES
// ============================================================
async function getAllPackages(tenantId, includeInactive = false) {
  return packageRepository.findAll(tenantId, includeInactive);
}

// ============================================================
// GET PACKAGE BY ID
// ============================================================
async function getPackageById(tenantId, id) {
  const pkg = await packageRepository.findById(tenantId, id);
  if (!pkg) {
    throw new NotFoundError('Package not found');
  }
  return pkg;
}

// ============================================================
// CREATE PACKAGE
// ============================================================
async function createPackage(tenantId, data, userId) {
  // Validation
  if (!data.name) throw new ValidationError('Package name is required');
  if (!data.totalPrice || data.totalPrice < 0) {
    throw new ValidationError('Valid total price is required');
  }
  if (!data.services || data.services.length === 0) {
    throw new ValidationError('At least one service is required');
  }

  // Check duplicate name
  const existing = await packageRepository.findByName(tenantId, data.name);
  if (existing) {
    throw new ConflictError(`Package with name "${data.name}" already exists`);
  }

  return packageRepository.create(tenantId, data, userId);
}

// ============================================================
// UPDATE PACKAGE
// ============================================================
async function updatePackage(tenantId, id, data, userId) {
  const existing = await packageRepository.findById(tenantId, id);
  if (!existing) {
    throw new NotFoundError('Package not found');
  }

  // Check name uniqueness if changing
  if (data.name && data.name !== existing.name) {
    const duplicate = await packageRepository.findByName(tenantId, data.name, id);
    if (duplicate) {
      throw new ConflictError(`Package with name "${data.name}" already exists`);
    }
  }

  return packageRepository.update(tenantId, id, data, userId);
}

// ============================================================
// DELETE PACKAGE (soft delete)
// ============================================================
async function deletePackage(tenantId, id, userId) {
  const existing = await packageRepository.findById(tenantId, id);
  if (!existing) {
    throw new NotFoundError('Package not found');
  }
  const result = await packageRepository.delete(tenantId, id, userId);
  if (!result) {
    throw new NotFoundError('Package not found');
  }
  return result;
}

// ============================================================
// GET STATISTICS
// ============================================================
async function getPackageStats(tenantId) {
  return packageRepository.getStats(tenantId);
}

// ============================================================
// GET POPULAR PACKAGES
// ============================================================
async function getPopularPackages(tenantId, limit = 5) {
  return packageRepository.getPopular(tenantId, limit);
}

module.exports = {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  getPackageStats,
  getPopularPackages,
};