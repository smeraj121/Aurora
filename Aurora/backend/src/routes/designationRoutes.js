// routes/designationRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const designationController = require('../controllers/designationController');
const asyncHandler = require('../middlewares/asyncHandler');

router.use(authenticate);

router.get('/', asyncHandler(designationController.getDesignations));
router.post('/', asyncHandler(designationController.createDesignation));
router.get('/:id', asyncHandler(designationController.getDesignation));
router.put('/:id', asyncHandler(designationController.updateDesignation));
router.patch('/:id/status', asyncHandler(designationController.toggleStatus));
router.delete('/:id', asyncHandler(designationController.deleteDesignation));

module.exports = router;