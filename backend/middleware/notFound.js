/**
 * @file middleware/notFound.js
 * @description 404 Not Found middleware.
 * Handles requests to undefined routes and endpoints.
 */

/**
 * Middleware to handle 404 errors for undefined routes.
 * Should be registered before the error handler middleware.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const notFound = (req, res, next) => {
  res.status(404);
  const error = new Error(`Route Not Found - ${req.originalUrl}`);
  next(error);
};

module.exports = { notFound };

