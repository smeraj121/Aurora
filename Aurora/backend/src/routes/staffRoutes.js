const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const staffController = require('../controllers/staffController');

// All staff routes require authentication
router.use(authenticate);

// ============================================================
// STAFF OPTIONS (dropdown data)
// ============================================================
router.get('/services', staffController.getServices);
router.get('/designations', staffController.getDesignations);

// ============================================================
// STAFF STATS & TOP PERFORMERS
// ============================================================
router.get('/stats', staffController.getStaffStats);
router.get('/top', staffController.getTopStaff);

// ============================================================
// STAFF CRUD
// ============================================================
router.get('/', staffController.getStaffList);
router.get('/:id', staffController.getStaffById);
router.get('/:id/schedule', staffController.getStaffSchedule);
router.post('/', staffController.createStaff);
router.put('/:id', staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);

module.exports = router;