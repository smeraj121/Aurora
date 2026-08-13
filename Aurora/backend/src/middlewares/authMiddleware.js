// src/middlewares/authMiddleware.js

const { verifyAccessToken } = require('../utils/jwt');

function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const token = authHeader.substring(7);

    req.user = verifyAccessToken(token);

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token',
    });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!allowedRoles.includes(req.user.systemRole)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize,
};