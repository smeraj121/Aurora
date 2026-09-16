const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const reviewController = require('../controllers/reviewController');
const asyncHandler = require('../middlewares/asyncHandler');

router.use(authenticate);

router.post('/', asyncHandler(reviewController.createReview));

module.exports = router;