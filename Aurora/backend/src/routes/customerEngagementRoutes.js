const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const customerEngagementController = require('../controllers/customerEngagementController');
const asyncHandler = require('../middlewares/asyncHandler');

router.use(authenticate);

// GET /api/customer-engagement?type=birthday&withinDays=7
router.get('/', asyncHandler(customerEngagementController.getCustomerEngagement));

module.exports = router;