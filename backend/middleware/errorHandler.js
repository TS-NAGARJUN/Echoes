/**
 * @file middleware/errorHandler.js
 * @description Centralized error handling middleware.
 * Catches and formats all errors for consistent API responses.
 */

/**
 * Global error handler middleware.
 * Must be registered as the last middleware in the Express app.
 * Formats errors into standardized JSON response.
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const errorHandler = (err, req, res, next) => {
  // Use existing status code or default to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Set response status
  res.status(statusCode);

  // Return error in standardized format
  res.json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Include stack trace only in development mode
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });

  // Log error in development for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${err.message}\nStack: ${err.stack}`);
  }
};

module.exports = { errorHandler };

