// controllers/packageController.js
const packageService = require('../services/packageService');

// ============================================================
// GET /packages - List all packages
// ============================================================
async function getPackages(req, res, next) {
  try {
    const { tenantId } = req.user;
    const includeInactive = req.query.includeInactive === 'true';
    const packages = await packageService.getAllPackages(tenantId, includeInactive);
    res.json({ success: true, data: packages });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// GET /packages/:id - Get package by ID
// ============================================================
async function getPackage(req, res, next) {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;
    const pkg = await packageService.getPackageById(tenantId, parseInt(id, 10));
    res.json({ success: true, data: pkg });
  } catch (error) {
    if (error.message === 'Package not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ============================================================
// POST /packages - Create a new package
// ============================================================
async function createPackage(req, res, next) {
  try {
    const { tenantId, userId } = req.user;
    const pkg = await packageService.createPackage(tenantId, req.body, userId);
    res.status(201).json({
      success: true,
      data: pkg,
      message: 'Package created successfully',
    });
  } catch (error) {
    if (error.message.includes('required')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.message.includes('already exists')) {
      return res.status(409).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ============================================================
// PUT /packages/:id - Update a package
// ============================================================
async function updatePackage(req, res, next) {
  try {
    const { tenantId, userId } = req.user;
    const { id } = req.params;
    const updated = await packageService.updatePackage(
      tenantId,
      parseInt(id, 10),
      req.body,
      userId
    );
    res.json({
      success: true,
      data: updated,
      message: 'Package updated successfully',
    });
  } catch (error) {
    if (error.message === 'Package not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
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
// DELETE /packages/:id - Soft delete a package
// ============================================================
async function deletePackage(req, res, next) {
  try {
    const { tenantId, userId } = req.user;
    const { id } = req.params;
    await packageService.deletePackage(tenantId, parseInt(id, 10), userId);
    res.json({ success: true, message: 'Package deactivated successfully' });
  } catch (error) {
    if (error.message === 'Package not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ============================================================
// GET /packages/stats - Package statistics
// ============================================================
async function getPackageStats(req, res, next) {
  try {
    const { tenantId } = req.user;
    const stats = await packageService.getPackageStats(tenantId);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// GET /packages/popular - Popular packages
// ============================================================
async function getPopularPackages(req, res, next) {
  try {
    const { tenantId } = req.user;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
    const popular = await packageService.getPopularPackages(tenantId, limit);
    res.json({ success: true, data: popular });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage,
  getPackageStats,
  getPopularPackages,
};