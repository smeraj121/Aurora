// routes/packageRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const packageController = require('../controllers/packageController');
const asyncHandler = require('../middlewares/asyncHandler');

// All package routes require authentication
router.use(authenticate);

// ============================================================
// SPECIFIC ROUTES (before /:id)
// ============================================================
// GET /packages/stats - Package statistics
router.get('/stats', asyncHandler(packageController.getPackageStats));

// GET /packages/popular - Popular packages
router.get('/popular', asyncHandler(packageController.getPopularPackages));

// ============================================================
// INDIVIDUAL PACKAGE ROUTES (with :id)
// ============================================================
// GET /packages/:id - Get package by ID
router.get('/:id', asyncHandler(packageController.getPackage));

// PUT /packages/:id - Update package
router.put('/:id', authorize('Owner', 'Admin'), asyncHandler(packageController.updatePackage));

// DELETE /packages/:id - Soft delete package
// DELETE /packages/:id - Soft delete package (Owner/Admin only)
router.delete('/:id', authorize('Owner', 'Admin'), asyncHandler(packageController.deletePackage));

// ============================================================
// CREATE PACKAGE (no :id)
// ============================================================
// CREATE PACKAGE (no :id) - Owner/Admin only
router.post('/', authorize('Owner', 'Admin'), asyncHandler(packageController.createPackage));

// ============================================================
// GET /packages - List all packages (must be last)
// ============================================================
router.get('/', asyncHandler(packageController.getPackages));

module.exports = router;