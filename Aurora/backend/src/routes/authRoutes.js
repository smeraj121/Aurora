const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

// 1. Decoupled OTP endpoints
router.post('/request-otp', (req, res, next) => authController.requestOtp(req, res, next));
router.post('/verify-otp', (req, res, next) => authController.verifyOtp(req, res, next));

// 2. Auth completion endpoints (takes verificationToken)
router.post('/signup', (req, res, next) => authController.signup(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));

// 3. Token management
router.post('/refresh-token', (req, res, next) => authController.refreshToken(req, res, next));
router.post('/logout', authenticate, (req, res, next) => authController.logout(req, res, next));

// 4. User profile & session
router.get('/me', authenticate, (req, res, next) => authController.getCurrentUser(req, res, next));
router.patch('/profile', authenticate, (req, res, next) => authController.updateProfile(req, res, next));
router.patch('/language', authenticate, (req, res, next) => authController.changeLanguage(req, res, next));
router.delete('/deactivate', authenticate, (req, res, next) => authController.deactivateAccount(req, res, next));

module.exports = router;