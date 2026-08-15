// routes/designationRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const designationController = require('../controllers/designationController');
const asyncHandler = require('../middlewares/asyncHandler');

router.use(authenticate);

router.get('/', asyncHandler(designationController.getDesignations));
router.post('/', authorize('Owner', 'Admin'), asyncHandler(designationController.createDesignation));
router.get('/:id', asyncHandler(designationController.getDesignation));
router.put('/:id', authorize('Owner', 'Admin'), asyncHandler(designationController.updateDesignation));
router.patch('/:id/status', authorize('Owner', 'Admin'), asyncHandler(designationController.toggleStatus));
router.delete('/:id', authorize('Owner', 'Admin'), asyncHandler(designationController.deleteDesignation));

module.exports = router;