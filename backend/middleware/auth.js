/**
 * @file middleware/auth.js
 * @description JWT authentication middleware.
 * Verifies and protects routes with Bearer token validation.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes requiring authentication.
 * Extracts JWT from Authorization header, verifies it, and attaches user to request.
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const protect = async (req, res, next) => {
  let token;

  // Extract token from Authorization header (format: "Bearer <token>")
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Split "Bearer <token>" and get token part
      token = req.headers.authorization.split(' ')[1];

      // Verify JWT signature and decode payload
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from database (exclude password field)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(404);
        return next(new Error('User not found'));
      }

      next();
    } catch (error) {
      res.status(401);
      return next(new Error(`Not authorized: ${error.message}`));
    }
  } else {
    res.status(401);
    return next(new Error('No token provided in Authorization header'));
  }
};

module.exports = { protect };

