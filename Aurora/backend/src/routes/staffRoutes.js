// routes/staffRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const staffController = require('../controllers/staffController');
const asyncHandler = require('../middlewares/asyncHandler');

// All staff routes require authentication
router.use(authenticate);

// ============================================================
// STAFF OPTIONS (dropdown data)
// ============================================================
router.get('/services', asyncHandler(staffController.getServices));
router.get('/designations', asyncHandler(staffController.getDesignations));

// ============================================================
// STAFF STATS & TOP PERFORMERS
// ============================================================
router.get('/stats', asyncHandler(staffController.getStaffStats));
router.get('/top', asyncHandler(staffController.getTopStaff));

// ============================================================
// STAFF CRUD
// ============================================================
router.get('/', asyncHandler(staffController.getStaffList));
router.get('/:id', asyncHandler(staffController.getStaffById));
router.get('/:id/schedule', asyncHandler(staffController.getStaffSchedule));
router.post('/', asyncHandler(staffController.createStaff));
router.put('/:id', asyncHandler(staffController.updateStaff));
router.delete('/:id', asyncHandler(staffController.deleteStaff));

module.exports = router;