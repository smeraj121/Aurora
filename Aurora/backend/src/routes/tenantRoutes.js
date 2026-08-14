const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middlewares/authMiddleware');
const tenantController = require('../controllers/tenantController');
const asyncHandler = require('../middlewares/asyncHandler');

router.use(authenticate);

// Tenant management is platform-level functionality.
router.use(authorize('SuperAdmin'));

router.get(
  '/',
  asyncHandler(tenantController.getAll)
);

router.get(
  '/:id',
  asyncHandler(tenantController.getById)
);

router.post(
  '/',
  asyncHandler(tenantController.create)
);

router.put(
  '/:id',
  asyncHandler(tenantController.update)
);

router.patch(
  '/:id/status',
  asyncHandler(tenantController.updateStatus)
);

module.exports = router;