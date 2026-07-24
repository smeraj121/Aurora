// routes/packageRoutes.js
const express = require('express');
const router = express.Router();
const packageService = require('../services/packageService');

// ============================================================
// GET /api/packages - Get all packages
// ============================================================
router.get('/', async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const packages = await packageService.getAllPackages(includeInactive);
    res.json({
      success: true,
      data: packages,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ============================================================
// GET /api/packages/stats - Get package statistics
// ============================================================
router.get('/stats', async (req, res) => {
  try {
    const stats = await packageService.getPackageStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ============================================================
// GET /api/packages/popular - Get popular packages
// ============================================================
router.get('/popular', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const packages = await packageService.getPopularPackages(limit);
    res.json({
      success: true,
      data: packages,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ============================================================
// GET /api/packages/:id - Get package by ID
// ============================================================
router.get('/:id', async (req, res) => {
  try {
    const pkg = await packageService.getPackageById(parseInt(req.params.id));
    res.json({
      success: true,
      data: pkg,
    });
  } catch (err) {
    if (err.message === 'Package not found') {
      res.status(404).json({
        success: false,
        message: err.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
});

// ============================================================
// POST /api/packages - Create a new package
// ============================================================
router.post('/', async (req, res) => {
  try {
    const pkg = await packageService.createPackage(req.body);
    res.status(201).json({
      success: true,
      data: pkg,
      message: 'Package created successfully',
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// ============================================================
// PUT /api/packages/:id - Update a package
// ============================================================
router.put('/:id', async (req, res) => {
  try {
    const pkg = await packageService.updatePackage(parseInt(req.params.id), req.body);
    res.json({
      success: true,
      data: pkg,
      message: 'Package updated successfully',
    });
  } catch (err) {
    const status = err.message === 'Package not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: err.message,
    });
  }
});

// ============================================================
// DELETE /api/packages/:id - Delete a package
// ============================================================
router.delete('/:id', async (req, res) => {
  try {
    await packageService.deletePackage(parseInt(req.params.id));
    res.json({
      success: true,
      message: 'Package deleted successfully',
    });
  } catch (err) {
    const status = err.message === 'Package not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;