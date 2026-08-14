const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const asyncHandler = require('../middlewares/asyncHandler');

const router = express.Router();

// 1. Decoupled OTP endpoints
router.post('/request-otp', asyncHandler(authController.requestOtp));
router.post('/verify-otp', asyncHandler(authController.verifyOtp));

// 2. Auth completion endpoints (takes verificationToken)
router.post('/signup', asyncHandler(authController.signup));
router.post('/login', asyncHandler(authController.login));

// 3. Token management
router.post('/refresh-token', asyncHandler(authController.refreshToken));
router.post('/logout', authenticate, asyncHandler(authController.logout));

// 4. User profile & session
router.get('/me', authenticate, asyncHandler(authController.getCurrentUser));
router.get('/profile', authenticate, asyncHandler(authController.getCurrentUserProfile));
router.patch('/profile', authenticate, asyncHandler(authController.updateProfile));
router.patch('/language', authenticate, asyncHandler(authController.changeLanguage));
router.delete('/deactivate', authenticate, asyncHandler(authController.deactivateAccount));

// Platform admin authentication
router.post(
  '/super-admin-login',
  asyncHandler(authController.superAdminLogin)
);

module.exports = router;