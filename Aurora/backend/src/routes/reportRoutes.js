const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const reportController = require('../controllers/reportController');
const asyncHandler = require('../middlewares/asyncHandler');

router.use(authenticate);

// GET /api/reports?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/', asyncHandler(reportController.getReport));

module.exports = router;