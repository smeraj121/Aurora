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

    const token = authHeader.substring(7); // Remove "Bearer "

    const decoded = verifyAccessToken(token);

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token',
    });
  }
};

module.exports = { authenticate }