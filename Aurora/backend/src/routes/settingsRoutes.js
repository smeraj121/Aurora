const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const settingsController = require('../controllers/settingsController');
const asyncHandler = require('../middlewares/asyncHandler');

router.use(authenticate);

// GET  /api/settings — tenant settings (merged with defaults)
// PUT  /api/settings — partial update
router.get('/', asyncHandler(settingsController.getSettings));
router.put('/', asyncHandler(settingsController.updateSettings));

router.get('/business-info', asyncHandler(settingsController.getBusinessInfo));

module.exports = router;