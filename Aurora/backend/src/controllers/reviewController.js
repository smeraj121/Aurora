const reviewService = require('../services/reviewService');

async function createReview(req, res) {
  const { tenantId, userId } = req.user;
  const review = await reviewService.createReview(tenantId, userId, req.body);
  res.status(201).json({ success: true, data: review, message: 'Rating submitted successfully' });
}

module.exports = { createReview };