// routes/packageRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const packageController = require('../controllers/packageController');

// All package routes require authentication
router.use(authenticate);

// ============================================================
// SPECIFIC ROUTES (before /:id)
// ============================================================
// GET /packages/stats - Package statistics
router.get('/stats', packageController.getPackageStats);

// GET /packages/popular - Popular packages
router.get('/popular', packageController.getPopularPackages);

// ============================================================
// INDIVIDUAL PACKAGE ROUTES (with :id)
// ============================================================
// GET /packages/:id - Get package by ID
router.get('/:id', packageController.getPackage);

// PUT /packages/:id - Update package
router.put('/:id', packageController.updatePackage);

// DELETE /packages/:id - Soft delete package
router.delete('/:id', packageController.deletePackage);

// ============================================================
// CREATE PACKAGE (no :id)
// ============================================================
router.post('/', packageController.createPackage);

// ============================================================
// GET /packages - List all packages (must be last)
// ============================================================
router.get('/', packageController.getPackages);

module.exports = router;